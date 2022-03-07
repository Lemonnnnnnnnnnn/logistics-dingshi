import React from 'react';
import { message, notification } from 'antd';
import { FORM_MODE, Item, Observer, SchemaForm } from '@gem-mine/antd-schema-form';
import DebounceFormButton from '../../../../../components/debounce-form-button';
import '@gem-mine/antd-schema-form/lib/fields';
import moment from 'moment';
import BindStore from '../../../../../utils/BindStore';
import ImageDetail from '../../../../../components/image-detail';
import MultipleCheckButton from '../../../../../components/multiple-check-button';
import { getTransport, setTransportStatus } from '../../../../../services/apiService';
import { getRole } from '../../../../../services/user';
import { SHIPMENT } from '../../../../../constants/organization/organization-type';
import { getOssImg, groupBy, isNull } from '../../../../../utils/utils';
import styles from './style.less';


// todo 验证审核是否完成
// todo 提交审核

const RECEIPT_STATUS = {
  INIT: 0,
  UNAUDITED: 1,
  NOT_PASS: 2,
  AUDITED_PASS: 3,
};

const REJECT_STATUS = {
  INIT: 0,
  LOADING_NOT_PASS: 1,
  SIGN_NOT_PASS: 2,
  ALL_NOT_PASS: 3,
};


function computeReceiptStatus(deliveryPointItem = [], receivingPointItem = [], weighPointItem = []) {
  let status = RECEIPT_STATUS.AUDITED_PASS;
  const items = [...deliveryPointItem, ...receivingPointItem, ...weighPointItem];
  items.forEach(item => {
    if (item.status === 0) {
      status = RECEIPT_STATUS.NOT_PASS;
      return false;
    }
  });
  return status;
}

function computeRejectStatus(deliveryPointItem = [], receivingPointItem = []) {
  let deliveryStatus = 1;
  deliveryPointItem.forEach(item => {
    if (item.status === 0) {
      deliveryStatus = 0;
      return false;
    }
  });
  let receivingStatus = 1;
  receivingPointItem.forEach(item => {
    if (item.status === 0) {
      receivingStatus = 0;
      return false;
    }
  });

  function getRejectStatus() {
    if (deliveryStatus === 0 && receivingStatus === 0) return REJECT_STATUS.ALL_NOT_PASS;
    if (receivingStatus === 0) return REJECT_STATUS.SIGN_NOT_PASS;
    if (deliveryStatus === 0) return REJECT_STATUS.LOADING_NOT_PASS;
  }

  return getRejectStatus();
}

@BindStore('transports')
export default class Verify extends React.Component {
  state = {
    transportDetail: {},
    verifyData: null,
    verifyItems: [],
    verifyItem: null,
    verifyIndex: 0,
  };


  schema = {
    verifyObjectId: {
      component: 'hide',
    },
    verifyReasonTag: {
      label: '拒绝原因',
      component: MultipleCheckButton,
      props: {
        tagsFromServer: ['数据错误', '图片模糊', '单号错误', '单据重复', '无签收人签字', '其他'],
      },
      keepAlive: false,
      observer: Observer({
        watch: ['status', '*verifyIndex'], // 监听verifyIndex是为了解决当审核提货单和审核卸货单状态不同时,点击上一步或下一步verifyReason字段不能及时监听到status变化的问题
        action: ([status, verifyIndex]) => {
          const result = status === 0;
          return { visible: result };
        },
      }),
    },
    verifyReason: {
      label: '备注',
      component: 'input.textArea',
      keepAlive: false,
      props: {
        autosize: { minRows: 4 },
      },
      observer: Observer({
        watch: ['status', '*verifyIndex'], // 监听verifyIndex是为了解决当审核提货单和审核卸货单状态不同时,点击上一步或下一步verifyReason字段不能及时监听到status变化的问题
        action: ([status, verifyIndex]) => {
          const result = status === 0;
          return { visible: result };
        },
      }),
    },
    status: {
      label: '审核',
      component: 'radio',
      defaultValue: 1,
      options: [{ value: 1, label: '通过' }, { value: 0, label: '不通过' }],
      rules: {
        required: [true, '请选择审核结果'],
      },
    },
  };

  componentDidMount() {
    this.getTransportDetail();
  }

  componentDidUpdate() {
    this.getTransportDetail();
  }

  mapItems(items, type, transportDetail) {
    const organizationType = getRole();
    let noPassItems = [];
    const {
      consignmentRejectStatus,
      shipmentRejectStatus,
    } = transportDetail;

    let haveDelivery = false;
    let haveWeigh = false;
    let haveReceiving = false;

    if (type === 'delivery') {

      if (organizationType === 5 && (shipmentRejectStatus === 1 || shipmentRejectStatus === 3)) {
        noPassItems = items.filter(item => item.auditStatus === 0);
        haveDelivery = true;
      } else if (organizationType === 4 && (consignmentRejectStatus === 1 || consignmentRejectStatus === 3)) {
        noPassItems = items.filter(item => item.auditStatus === 0);
        haveDelivery = true;
      } else if ((organizationType === 4 && consignmentRejectStatus === 0) || (organizationType === 5 && shipmentRejectStatus === 0)) {
        noPassItems = items;
        haveDelivery = true;
      }
      if (!haveDelivery) this.props.setHadDelivery(false);
    }
    /*
    * 以承运方为例：
    * shipmentReceiptStatus  运单签收状态  0初始化，1待审核，2审批未通过，3审批通过
    * shipmentRejectStatus   运单拒绝状态  0初始化，1 客户提货单未通过，2客户签收单未通过，3客户全部未通过【多个逗号隔开】
    *
    * 如果运单拒绝状态为0 ： 还未审核
    * 如果运单拒绝状态不为0和1，说明过磅和签收有一个未通过，读取additionalTypeAll来判断哪一个未通过
    * */
    if (type === 'weigh') {
      if (organizationType === 5) {
        if (shipmentRejectStatus === 0) {
          noPassItems = items;
          haveWeigh = true;
        }
        if (shipmentRejectStatus === 2 || shipmentRejectStatus === 3) {
          if (items[0].additionalTypeAll && items[0].additionalTypeAll.indexOf('2') !== -1) {
            noPassItems = items;
            haveWeigh = true;
          }
        }
      }

      if (organizationType === 4) {
        if (consignmentRejectStatus === 0) {
          noPassItems = items;
          haveWeigh = true;
        }
        if (consignmentRejectStatus === 2 || consignmentRejectStatus === 3) {
          if (items[0].additionalTypeAll && items[0].additionalTypeAll.indexOf('2') !== -1) {
            noPassItems = items;
            haveWeigh = true;
          }
        }
      }
      if (!haveWeigh) this.props.setHadWeigh(false);
    }

    if (type === 'receiving') {

      if (organizationType === 5) {
        if (shipmentRejectStatus === 0) {
          noPassItems = items;
          haveReceiving = true;
        }
        if (shipmentRejectStatus === 2 || shipmentRejectStatus === 3) {
          if (items[0].additionalTypeAll && items[0].additionalTypeAll.indexOf('1') !== -1) {
            noPassItems = items;
            haveReceiving = true;
          }
        }
      }

      if (organizationType === 4) {
        if (consignmentRejectStatus === 0) {
          noPassItems = items;
          haveReceiving = true;
        }
        if (consignmentRejectStatus === 2 || consignmentRejectStatus === 3) {
          if (items[0].additionalTypeAll && items[0].additionalTypeAll.indexOf('1') !== -1) {
            noPassItems = items;
            haveReceiving = true;
          }
        }
      }

      if (!haveReceiving) this.props.setHadReceipt(false);
    }

    return noPassItems.map((item) => {
      const {
        processPointId,
        billDentryid,
        deliveryName,
        receivingName,
        billNumber,
        goodsName,
        categoryName,
        goodsUnitCN,
        deliveryNum,
        receivingNum,
        weighDentryid,
      } = item;
      return {
        verifyObjectId: processPointId,
        goodsName,
        categoryName,
        goodsUnitCN,
        deliveryNum,
        receivingNum,
        billDentryid,
        weighDentryid,
        billNumber,
        name: deliveryName || receivingName,
        status: null,
        verifyReason: null,
        type,
      };
    });
  }

  async getTransportDetail() {
    const { verifyRecord } = this.props;
    const { transportId } = verifyRecord;
    if (transportId === this.state.transportDetail.transportId) return;
    const transportDetail = await getTransport(transportId);

    /*
    * 新增逻辑：
    * processStatus === 6 重新签收 ，读取 additionalTypeAll 来判断
    * 否则，普通签收，全部填写
    * */

    this.transportDetail = transportDetail;
    const {
      deliveryItems = [],
      signItems = [],
      logisticsBusinessTypeEntity,
    } = transportDetail;
    let verifyItems = [];
    if (logisticsBusinessTypeEntity?.transportBill.indexOf('1') !== -1) {
      verifyItems = [...this.mapItems(deliveryItems, 'delivery', transportDetail)];
    } else {
      this.props.setHadDelivery(false);
    }

    if (logisticsBusinessTypeEntity?.transportBill.indexOf('2') !== -1) {
      verifyItems = [...verifyItems, ...this.mapItems(signItems, 'weigh', transportDetail)];
    } else {
      this.props.setHadWeigh(false);
    }

    if (logisticsBusinessTypeEntity?.transportBill.indexOf('3') !== -1) {
      verifyItems = [...verifyItems, ...this.mapItems(signItems, 'receiving', transportDetail)];
    } else {
      this.props.setHadReceipt(false);
    }


    this.setState({
      transportDetail,
      verifyItems,
      verifyItem: verifyItems.length > 0 ? verifyItems[0] : [],
      verifyData: this.mapEntityToVerifyData(transportDetail),
    });
  }

  async getNewState(index, verifyItems, verifyItem, formData) {
    const nextItem = verifyItems[index];
    Object.assign(verifyItem, formData);
    const newState = {
      verifyItems,
      verifyIndex: index,
      verifyItem: nextItem,
    };
    this.setState(newState);

  }

  // 下一步，上一步时判断在“不通过”的情况下，是否填写了理由
  next = async (formData) => {
    const { verifyIndex, verifyItems, verifyItem } = this.state;
    const { stepName } = this.props;

    if (formData.status === 0 && (!formData.verifyReason && !formData.verifyReasonTag)) {
      notification.error({ message: '请选择或输入审核不通过原因' });
      return;
    }

    if (verifyIndex < verifyItems.length) {
      const nextIndex = verifyIndex + 1;
      const item = verifyItems[nextIndex];
      await this.getNewState(nextIndex, verifyItems, verifyItem, formData);
      if (stepName !== item.type) {
        this.props.nextStep();
      }
    }
  };

  pre = async (formData) => {
    const { verifyIndex, verifyItems, verifyItem } = this.state;
    if (formData.status === 0 && (!formData.verifyReason && !formData.verifyReasonTag)) {
      notification.error({ message: '请选择或输入审核不通过原因' });
      return;
    }

    const { stepName } = this.props;

    if (verifyIndex > 0) {
      const preIndex = verifyIndex - 1;
      const item = verifyItems[preIndex];
      await this.getNewState(preIndex, verifyItems, verifyItem, formData);
      if (stepName !== item.type) {
        this.props.preStep();
      }
    }
  };

  mapEntityToVerifyData = (entity) => {
    const { shipmentReceiptStatus, consignmentReceiptStatus, deliveryItems, signItems } = entity;
    return {
      shipmentReceiptStatus,
      consignmentReceiptStatus,
      deliveryPointItem: deliveryItems,
      receivingPointItem: signItems,
    };
  };

  getNoPassItem(items, type) {
    switch (type) {
      case 'delivery':
        return items.filter(({ status }) => status === 0).map(({ verifyObjectId, verifyReason, verifyReasonTag }) => {
            let verifyReasonStr = '';
            if (verifyReasonTag) verifyReasonStr = verifyReasonTag.join(',');
            if (verifyReason) verifyReasonStr = `${verifyReasonStr},${verifyReason}`;
            return ({
              verifyObjectId,
              verifyReason: verifyReasonStr,
            });
          },
        );
      case 'receiving':
        return items.filter(({ status }) => status === 0).map(({ verifyObjectId, verifyReason, verifyReasonTag }) => {
            let verifyReasonStr = '';
            if (verifyReasonTag) verifyReasonStr = verifyReasonTag.join(',');
            if (verifyReason) verifyReasonStr = `${verifyReasonStr},${verifyReason}`;
            return ({
              verifyObjectId,
              verifyReason: verifyReasonStr,
              additionalType: 1,
            });
          },
        );
      case 'weigh':
        return items.filter(({ status }) => status === 0).map(({ verifyObjectId, verifyReason, verifyReasonTag }) => {
            let verifyReasonStr = '';
            if (verifyReasonTag) verifyReasonStr = verifyReasonTag.join(',');
            if (verifyReason) verifyReasonStr = `${verifyReasonStr},${verifyReason}`;
            return ({
              verifyObjectId,
              verifyReason: verifyReasonStr,
              additionalType: 2,
            });
          },
        );
      default :
        return [];
    }
  }


  // 是否所有单据都已审核
  ifAllBillVerified(verifyItems) {
    const unVerifiedBill = verifyItems.filter((item) => isNull(item.status));
    if (unVerifiedBill.length === 0) return true;

    message.error(`还有 ${unVerifiedBill.length} 个待审核信息`);
    return false;
  }


  submit = async (currentItem) => {
    const { verifyItems, verifyItem } = this.state;
    Object.assign(verifyItem, currentItem);
    if (this.ifAllBillVerified(verifyItems) === false) return;
    const { delivery = [], weigh = [], receiving = [] } = groupBy(verifyItems, 'type');
    const receiptStatus = computeReceiptStatus(delivery, receiving, weigh);
    // const rejectStatus = computeRejectStatus(delivery, receiving)
    const { transportId } = this.state.transportDetail;
    const params = {
      receivingPointItem: [...this.getNoPassItem(weigh, 'weigh'), ...this.getNoPassItem(receiving, 'receiving')],
      deliveryPointItem: this.getNoPassItem(delivery, 'delivery'),
    };

    if (getRole() === SHIPMENT) {
      params.shipmentReceiptStatus = receiptStatus;
    } else {
      params.consignmentReceiptStatus = receiptStatus;
    }

    setTransportStatus(transportId, params).then(() => {
      this.props.close();
      // 刷新列表
      this.props.refreshTransportsList();
    });
  };


  getPointImages = () => {
    const { verifyItems, verifyIndex } = this.state;
    const pictures = getImages(verifyItems[verifyIndex], verifyItems[verifyIndex].type);
    return pictures.map(item => getOssImg(item));
  };

  renderInfo = (verifyItem) => {
    if (!this.transportDetail) return false;
    let word;
    const { type } = verifyItem;
    const calculatePounddifference = (item) => {
      const Pounddifference = (item.deliveryNum - item.receivingNum) * 1000 / (item.deliveryNum);
      return Pounddifference.toFixed(1)._toFixed(1);
    };
    if (type === 'delivery') {
      word = (
        <>
          <p className={styles.infoItem}>
            <span>提货单号:</span>
            <span>{this.transportDetail.deliveryItems?.map(item => item.billNumber).join(',')}</span>
          </p>
          <p className={styles.infoItem}>
            <span>提货地址:</span>
            <span>{this.transportDetail.deliveryItems?.map(item => item.deliveryAddress).join(',')}</span>
          </p>
          <p className={styles.infoItem}>
            <span>提货数量:</span>
            <span>
              <ul>
                {this.transportDetail.deliveryItems?.map((item, index) =>
                  <li
                    key={item.goodsId}
                    style={{ display: 'flex', flexDirection: 'column' }}
                  >
                    <span style={{
                      flex: 0,
                      marginRight: '0',
                      textAlign: 'left',
                    }}>{`${item.categoryName}-${item.goodsName}`}</span>
                    <span style={{ textAlign: 'right' }}>{item.deliveryNum}{item.deliveryUnitCN}</span>
                  </li>)}
              </ul>
            </span>
          </p>
          <p className={styles.infoItem}>
            <span>提货时间:</span>
            <span>{moment(this.transportDetail.deliveryTime).format('YYYY-MM-DD HH:mm')}</span>
          </p>
        </>
      );
    } else if (type === 'receiving') {
      word = (
        <>
          <p className={styles.infoItem}>
            <span>签收单位:</span>
            <span>{this.transportDetail?.signItems?.[0].customerOrgName || '--'}</span>
          </p>
          <p className={styles.infoItem}>
            <span>签收单号:</span>
            <span>{this.transportDetail.signItems?.map(item => item.billNumber || '').join(',')}</span>
          </p>
          <p className={styles.infoItem}>
            <span>卸货点:</span>
            <span>{this.transportDetail.receivingName || ''}</span>
          </p>
          <p className={styles.infoItem}>
            <span>卸货地址:</span>
            <span>{this.transportDetail.receivingAddress || ''}</span>
          </p>
          <p className={styles.infoItem}>
            <span>签收数量:</span>
            <span>
              {this.transportDetail.deliveryItems?.map(item =>
                <li
                  key={item.goodsId}
                  style={{ display: 'flex', flexDirection: 'column' }}
                >
                  <span style={{
                    flex: 0,
                    marginRight: '0',
                    textAlign: 'left',
                  }}>{`${item.categoryName}-${item.goodsName}`}</span>
                  <span
                    style={{ textAlign: 'right' }}>{item.receivingNum}{item.receivingUnitCN}(磅差：{calculatePounddifference(item)}‰)</span>
                </li>)}
            </span>
          </p>
          <p className={styles.infoItem}>
            <span>签收时间:</span>
            <span>{moment(this.transportDetail.receivingTime).format('YYYY-MM-DD HH:mm')}</span>
          </p>
        </>
      );
    } else if (type === 'weigh') {
      word = (
        <>
          <p className={styles.infoItem}>
            <span>过磅单号:</span>
            <span>{this.transportDetail.signItems?.map(item => item.weighNumber).join(',')}</span>
          </p>
          <p className={styles.infoItem}>
            <span>过磅数量:</span>
            <span>
              {this.transportDetail.deliveryItems?.map(item =>
                <div key={item.goodsId} style={{ display: 'flex', flexDirection: 'column' }}>
                  <span style={{
                    flex: 0,
                    marginRight: '0',
                    textAlign: 'left',
                  }}>{`${item.categoryName}-${item.goodsName}`}</span>
                  <span style={{ textAlign: 'right' }}>{item.weighNum}{item.receivingUnitCN}</span>
                </div>)}
            </span>
          </p>
        </>
      );
    }
    return word;
  };

  renderNotification = verifyItem => {
    if (!this.transportDetail) return false;
    let word;
    const { type } = verifyItem;
    if (type === 'delivery') {
      word = (
        <div style={{
          backgroundColor: '#FDF3F4',
          border: '1px dashed #D9001B',
          borderRadius: '5px',
          padding: '10px',
          color: '#D9001B',
          marginTop: '20px',
        }}
        >审核要求：核查「货品数量和规格」一致性，单据图片是否清晰完整
        </div>
      );
    } else if (type === 'weigh') {
      word = (
        <div style={{
          backgroundColor: '#FDF3F4',
          border: '1px dashed #D9001B',
          borderRadius: '5px',
          padding: '10px',
          color: '#D9001B',
          marginTop: '20px',
        }}
        >审核要求：核查「过磅单号」一致性，单据图片是否清晰完整
        </div>
      );
    } else if (type === 'receiving') {
      word = (
        <div style={{
          backgroundColor: '#FDF3F4',
          border: '1px dashed #D9001B',
          borderRadius: '5px',
          padding: '10px',
          color: '#D9001B',
          marginTop: '20px',
        }}
        >审核要求：核查「签收单位」「签收单号」「货品数量和规格」一致性，单据图片是否清晰完整
        </div>
      );
    }
    return word;
  };


  render() {
    const { verifyData, verifyIndex, verifyItems, verifyItem } = this.state;

    if (!verifyData) return <div />;

    const images = this.getPointImages();
    return (
      <>
        <SchemaForm schema={this.schema} data={verifyItem} mode={FORM_MODE.MODIFY} trigger={{ verifyIndex }}>
          {this.renderNotification(verifyItem)}

          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div style={{ marginTop: 20, display: 'flex', width: '300px', justifyContent: 'center' }}>
              <ImageDetail imageData={images} width='300' />
            </div>
            <div style={{ width: '400px' }}>{this.renderInfo(verifyItem, verifyItems)}</div>
          </div>
          <Item field='verifyObjectId' />
          <Item field='status' />
          <Item field='verifyReasonTag' />
          <div style={{ display: 'block', minHeight: 70 }}>
            <Item field='verifyReason' className='mr-10' />
          </div>
          <div style={{ textAlign: 'right' }}>
            {
              verifyIndex > 0 &&
              <DebounceFormButton label='上一步' validate onClick={this.pre} style={{ marginRight: 10 }} />
            }
            {
              verifyIndex < verifyItems.length - 1 &&
              <DebounceFormButton label='下一步' validate onClick={this.next} style={{ marginRight: 10 }} />
            }
            <DebounceFormButton label='保存' validate onClick={this.submit} type='primary' />
          </div>
        </SchemaForm>
      </>
    );
  }
}


function getImages(items, type) {
  switch (type) {
    case 'delivery':
      return items?.billDentryid ? items.billDentryid.split(',') : [];
    case 'weigh' :
      return items?.weighDentryid ? items.weighDentryid.split(',') : [];
    case 'receiving' :
      return items?.billDentryid ? items.billDentryid.split(',') : [];
    default :
      return [];
  }
}
