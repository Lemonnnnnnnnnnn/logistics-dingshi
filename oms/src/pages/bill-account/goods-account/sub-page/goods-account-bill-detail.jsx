import React from 'react';
import { Button, Modal, Row, Col, notification } from "antd";
import moment from 'moment';
import { SchemaForm, Item, FORM_MODE, FormCard, Observer, FormButton } from '@gem-mine/antd-schema-form';
// import DebounceFormButton from '@/components/DebounceFormButton'
import router from 'umi/router';
import { connect } from 'dva';
import CheckBox from '../../../../components/check-box';
import { goodsAccountEventDist } from '../../../../constants/account/event';
import UploadFile from '../../../../components/upload/upload-file';
import { ACCOUNT_LIST_STATUS, CONSIGNMENT_TYPE } from '../../../../constants/project/project';
import accountModel from '../../../../models/goodsAccount';
import ImageDetail from '../../../../components/image-detail';
import { getOssImg, flattenDeep, routerToExportPage } from '../../../../utils/utils';
import Table from '../../../../components/table/table';
import transportModel from '../../../../models/transports';
import accountDetailModel from '../../../../models/accountDetail';
import {
  getAccountGoodsEvent,
  sendAccountGoodsDetailExcelPost,
  sendAccountGoodsDetailPdfPost
} from "../../../../services/apiService";
import '@gem-mine/antd-schema-form/lib/fields';
import styles from './bill-info.less';
import AccountEvent from "../../../../components/account-event";

const { actions: { detailGoodsAccount } } = accountModel;
const { actions: { patchAccountDetail } } = accountDetailModel;
const { actions: { detailTransports } } = transportModel;

const createBillLayout = {
  labelCol: {
    xs: { span: 7 },
  },
  wrapperCol: {
    xs: { span: 17 },
  }
};

function mapStateToProps (state) {
  const goodsAccount = state.goodsAccount.entity;
  goodsAccount.responsiblerName = goodsAccount.responsibleItems && goodsAccount.responsibleItems.map(item => item.responsibleName).join('、');
  return {
    goodsAccount,
    transportDetail: state.transports.entity
  };
}

@connect(mapStateToProps, { detailGoodsAccount, patchAccountDetail, detailTransports })
export default class GoodsAccountBillDetail extends React.Component {

  state = {
    ready: false,
    showPdfModal : false,
  }

  tableSchema = {
    variable: true,
    minWidth:3000,
    columns: [
      {
        title: '状态',
        dataIndex: 'goodsAuditStatus',
        fixed: 'left',
        width: '100px',
        render: (text) => {
          const goodsAuditStatusConfig = {
            0: { word: '● 待审核', color: 'gray' },
            1: { word: '● 已拒绝', color: 'red' },
            2: { word: '● 已审核', color: 'green' }
          }[text]||{ word: '● 待审核', color: 'gray' };
          return <span style={{ color: goodsAuditStatusConfig.color }}>{goodsAuditStatusConfig.word}</span>;
        }
      },
      {
        title: '运单号',
        dataIndex: 'transportNo',
        fixed: 'left',
        width: '200px'
      },
      {
        title: '合同名称',
        dataIndex: 'projectName',
      },
      {
        title: '签收单号',
        dataIndex: 'receivingNo',
        render: (text, record) => {
          if (text) return text;
          if (record.billNumber) return record.billNumber;
          return '--';
        }
      },
      {
        title: '签收时间',
        dataIndex: 'receivingTime',
        render: (text, record) => {
          const time = text||record.signTime;
          return time? moment(time).format('YYYY-MM-DD HH:mm:ss'): '--';
        },
      },
      {
        title: '提货点',
        dataIndex: 'deliveryItems',
        render: (text) => {
          const list = text.map((item, index) => <li title={`${item.deliveryName}`} className="test-ellipsis" key={index}>{item.deliveryName}</li>);
          return <ul style={{ padding: 0, margin: 0 }}>{list}</ul>;
        },
      },
      {
        title: '货品名称',
        dataIndex: 'goodsName',
        render: (text, record) => {
          const list = record.deliveryItems.map((item, index) => <li title={`${item.categoryName}${item.goodsName}`} className="test-ellipsis" key={index}>{`${item.categoryName}${item.goodsName}`}</li>);

          return <ul style={{ padding: 0, margin: 0 }}>{list}</ul>;
        },
      },
      {
        title: '规格型号',
        dataIndex: 'specificationType',
        render: (text, record) => {
          const list = record.deliveryItems.map((item, index) => {
            const word = item.specificationType === null ? '--' : item.specificationType;
            return <li title={`${word}`} className="test-ellipsis" key={index}>{`${word}`}</li>;
          });

          return <ul style={{ padding: 0, margin: 0 }}>{list}</ul>;
        },
      },
      {
        title: '材质',
        dataIndex: 'materialQuality',
        render: (text, record) => {
          const list = record.deliveryItems.map((item, index) => {
            const word = item.materialQuality === null ? '--' : item.materialQuality;
            return <li title={`${word}`} className="test-ellipsis" key={index}>{`${word}`}</li>;
          });

          return <ul style={{ padding: 0, margin: 0 }}>{list}</ul>;
        },
      },
      {
        title: '包装',
        dataIndex: 'packagingMethod',
        render: (text, record) => {
          const list = record.deliveryItems.map((item, index) => {
            let word = '--';
            if (item.packagingMethod === 1) {
              word = '袋装';
            } else if (item.packagingMethod === 2) {
              word = '散装';
            }
            return <li title={`${word}`} className="test-ellipsis" key={index}>{`${word}`}</li>;
          });

          return <ul style={{ padding: 0, margin: 0 }}>{list}</ul>;
        },
      },
      {
        title: '实提量',
        dataIndex: 'deliveryNum',
        render: (text, record) => {
          const list = record.deliveryItems.map((item, index) => {
            const word = item.deliveryNum === null ? '--' : `${item.deliveryNum}${item.deliveryUnitCN}`;
            return <li title={`${word}`} className="test-ellipsis" key={index}>{`${word}`}</li>;
          });

          return <ul style={{ padding: 0, margin: 0 }}>{list}</ul>;
        },
      },
      {
        title: '实收量',
        dataIndex: 'receivingNum',
        render: (text, record) => {
          const list = record.deliveryItems.map((item, index) => {
            const word = item.receivingNum === null ? '--' : `${item.receivingNum}${item.receivingUnitCN}`;
            return <li title={`${word}`} className="test-ellipsis" key={index}>{`${word}`}</li>;
          });

          return <ul style={{ padding: 0, margin: 0 }}>{list}</ul>;
        },
      },
      {
        title: '单价',
        dataIndex: 'freightCost',
        render: (text, record) => {
          const list = record.deliveryItems.map((item, index) => {
            const word = item?.freightCost?.toFixed(2)._toFixed(2) || '';
            return <li title={`${word? `${word}元`: '--'}`} className="test-ellipsis" key={index}>{`${word? `${word}元`: '--'}`}</li>;
          });
          return <ul style={{ padding: 0, margin: 0 }}>{list}</ul>;
        }
      },
      {
        title: '卸货点',
        dataIndex: 'receivingName'
      },
      {
        title: '合计',
        dataIndex: 'totalFreight',
        render: (text, record) => `${record.accountGoodsPriceEntity?.totalPrice?.toFixed(2)._toFixed(2) || 0} 元`,
      },
      {
        title: '司机',
        dataIndex: 'driverUserName'
      },
      {
        title: '车牌号',
        dataIndex: 'plateNumber',
        render: (text, record) => {
          if (text) return text;
          if (record.carNo) return record.carNo;
          return 'bug';
        }
      },
      {
        title: '查看',
        dataIndex: 'looking',
        render: (text, record) => (
          <>
            <a onClick={() => this.watchTransportDetail(record)} style={{ marginRight: '10px' }}>详情</a>
            <a onClick={() => this.watchReceivingSign(record)} style={{ marginRight: '10px' }}>样签</a>
            {
              record.receivingName? <a onClick={() => this.watchReceivingBills(record)} style={{ marginRight: '10px' }}>签收单</a>: false
            }
          </>
        ),
        width: '150px',
        fixed: 'right',
      }
    ]
  }

  schema = {
    projectName:{
      label: '项目名称',
      component: 'input',
    },
    responsiblerName:{
      label: '项目负责人',
      component: 'input',
    },
    consignmentType:{
      label: '交易模式',
      component: 'radio',
      options: [{
        key: CONSIGNMENT_TYPE.DIRECT_DELIVERY,
        label: '直发',
        value: CONSIGNMENT_TYPE.DIRECT_DELIVERY
      }, {
        key: CONSIGNMENT_TYPE.AGENCY_DELIVERY,
        label: '代发',
        value: CONSIGNMENT_TYPE.AGENCY_DELIVERY
      }]
    },
    payerOrganizationName:{
      component: 'input',
    },
    accountStatus:{
      label: '账单状态',
      component: 'radio',
      options: [{
        label: '待审核',
        key: ACCOUNT_LIST_STATUS.UNAUDITED,
        value: ACCOUNT_LIST_STATUS.UNAUDITED
      }, {
        label: '审核完成',
        key: ACCOUNT_LIST_STATUS.AUDITED,
        value: ACCOUNT_LIST_STATUS.AUDITED
      }, {
        label: '审核中',
        key: ACCOUNT_LIST_STATUS.AUDITING,
        value: ACCOUNT_LIST_STATUS.AUDITING
      }, {
        label: '审核不通过',
        key: ACCOUNT_LIST_STATUS.REFUSE,
        value: ACCOUNT_LIST_STATUS.REFUSE
      }, {
        label: '作废',
        key: ACCOUNT_LIST_STATUS.CANCEL,
        value: ACCOUNT_LIST_STATUS.CANCEL
      }, {
        label: '待提交',
        key: ACCOUNT_LIST_STATUS.NOT_HANDLE,
        value: ACCOUNT_LIST_STATUS.NOT_HANDLE
      }]
    },
    accountTransportNo:{
      label: '对账单号',
      component: 'input',
    },
    remark:{
      label: '备注',
      component: 'input.textArea',
    }
  }

  pdfSchema = {
    fileScale : {
      label : '导出文件大小',
      component : 'radio',
      rules: {
        required: [true, '请选择需导出文件大小'],
      },
      defaultValue : 1,
      options: [{
        key: 1,
        label: '原文件（较大）',
        value: 1
      }, {
        key: 2,
        label: '压缩后的文件（较小）',
        value: 2
      }]
    },
    billTypeOptions : {
      label : '需导出单据类型',
      component : CheckBox,
      rules: {
        required: [true, '请选择需导出单据类型'],
      },
      options: [{
        label: '提货单',
        key: 1,
        value: 1
      }, {
        label: '过磅单',
        key: 2,
        value: 2
      }, {
        label: '签收单',
        key: 3,
        value: 3
      }]
    }
  }

  watchReceivingSign = async record => {
    if (this.props.transportDetail.transportId !== record.transportId) {
      await this.props.detailTransports({ transportId: record.transportId });
    }
    this.setState({
      ReceivingSignModal: true
    });
  }

  watchReceivingBills = async record => {
    const { accountDetailId } = record;
    if (this.props.transportDetail.transportId !== record.transportId) {
      await this.props.detailTransports({ transportId: record.transportId });
    }
    this.setState({
      receivingModal: true,
      accountDetailId
    });
  }

  watchTransportDetail = record => {
    if (this.props.location.pathname.indexOf('cargo') !== -1) {
      router.push(`/bill-account/cargoGoodsAccount/cargoGoodsAccountList/transportDetail?transportId=${record.transportId}`);
    } else {
      router.push(`/bill-account/consignmentGoodsAccount/consignmentGoodsAccountList/transportDetail?transportId=${record.transportId}`);
    }
  }

  renderImageDetail = imageType => {
    let imageData;
    if (imageType === 'signDentry') {
      const { transportDetail: { signDentryid } } = this.props;
      imageData = [getOssImg(signDentryid)];
    } else if (imageType === 'receiving') {
      const { accountDetailId } = this.state; // 不存在
      if (!accountDetailId){
        const { transportDetail: { signItems = [] } } = this.props;
        imageData = flattenDeep(signItems.map(item=>(item.billDentryid || '').split(','))).map(item=>getOssImg(item));
      } else {
        const { accountDetailItems=[] } = this.props.goodsAccount; // goodsAccount为undefined
        const accountDetailItem = accountDetailItems.find(item=>item.accountDetailId===accountDetailId);
        imageData = (accountDetailItem.billDentryid || '').split(',').map(billDentry=>getOssImg(billDentry));
      }
    }
    if (imageType === 'receiving') {
      return (
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ marginTop:20 }}>
            <ImageDetail width='320' imageData={imageData} />
          </div>
          <div style={{ width: '400px' }}>
            <p className={styles.infoItem}>
              <span>签收单号:</span>
              <span>{this.props.transportDetail?.signItems?.map(item => item.billNumber || '').join(',')}</span>
            </p>
            <p className={styles.infoItem}>
              <span>过磅单号:</span>
              <span>{this.props.transportDetail?.signItems?.map(item => item.weighNumber || '').join(',')}</span>
            </p>
            <p className={styles.infoItem}>
              <span>签收数量:</span>
              <span>
                {this.props.transportDetail?.deliveryItems?.map(item => <li key={item.goodsId}>{`${item.categoryName}-${item.goodsName} ${item.receivingNum}${item.receivingUnitCN} `}</li>)}
              </span>
            </p>
          </div>
        </div>
      );
    }
    if (imageType === 'signDentry') {
      return <ImageDetail width='320' imageData={imageData} />;
    }
  }

  checkBillExist = (formdata) =>{
    const { billTypeOptions } = formdata;
    const { accountDetailItems } = this.props.goodsAccount;

    const exportDelivery = billTypeOptions.indexOf('1') !== -1;
    const exportWeigh = billTypeOptions.indexOf('2') !== -1;
    const exportSign = billTypeOptions.indexOf('3') !== -1;

    let deliveryDentryid = '';
    let WeighDentryid = '';
    let receivingDentryid = '';

    if (exportDelivery){
      accountDetailItems.forEach(item=>{
        item.deliveryItems.forEach(_item=>{
          if (_item.billDentryid) deliveryDentryid = _item.billDentryid;
        });
      });
    }

    if (exportWeigh){
      accountDetailItems.forEach(item=>{
        if (item.weighDentryid) WeighDentryid = item.weighDentryid;
      });
    }

    if (exportSign){
      accountDetailItems.forEach(item=>{
        if (item.billDentryid) receivingDentryid = item.billDentryid;
      });
    }

    // 如果勾选的类型全部都没有数据，则进行提示，有一个有数据即通过
    if (!deliveryDentryid && !WeighDentryid && !receivingDentryid){
      notification.error({ message : '亲，您选择的单据类型没有数据！' });
      return false;
    }

    return true;
  }

  handleExportPDFBtnClick = (formdata) => {
    const { billTypeOptions, fileScale } = formdata;

    if (!this.checkBillExist(formdata)) return;
    const { accountGoodsId } = this.props.goodsAccount;

    const params = {
      isAll : fileScale === 1,
      billPictureList : billTypeOptions,
      accountGoodsId
    };

    routerToExportPage(sendAccountGoodsDetailPdfPost, params);
  }


  handleExportBillDetailBtnClick = () => {
    const { accountGoodsId } = this.props.goodsAccount;
    const params = {
      accountGoodsIdItems : accountGoodsId,
      fileName : '账单明细'
    };
    routerToExportPage(sendAccountGoodsDetailExcelPost, params);
  }

  modifyTransportschema={
    billDentryid: {
      label: '卸货单图片',
      rules: {
        requierd: true
      },
      value:Observer({
        watch:['picture1', 'picture2', 'picture3'],
        action:([picture1=[], picture2=[], picture3=[]])=>{
          if (picture1[0]||picture2[0]||picture3[0]){
            const pictureGroup = [...picture1, ...picture2, ...picture3];
            return pictureGroup.join(',');
          }
          return '';
        }
      })
    },
    picture1: {
      component: UploadFile,
    },
    picture2: {
      component: UploadFile,
    },
    picture3: {
      component: UploadFile,
    }
  }

  componentDidMount () {
    if ('accountGoodsId' in this.props.location.query) {
      this.props.detailGoodsAccount({ accountGoodsId: this.props.location.query.accountGoodsId })
        .then(()=>{
          this.setState({
            ready:true
          });
        });
    }
  }

  componentDidUpdate(p) {
    if ('accountGoodsId' in this.props.location.query && p.location.query.accountGoodsId !== this.props.location.query.accountGoodsId) {
      this.props.detailGoodsAccount({ accountGoodsId: this.props.location.query.accountGoodsId })
        .then(()=>{
          this.setState({
            ready:true
          });
        });
    }
  }

  render () {
    const { ready, ReceivingSignModal, receivingModal, showPdfModal } = this.state;
    const entity = { consignmentType: CONSIGNMENT_TYPE.AGENCY_DELIVERY, ...this.props.goodsAccount };
    const goodsAccountBillLayOut = {
      labelCol: {
        xs: { span: 24 },
      },
      wrapperCol: {
        xs: { span: 24 },
      }
    };
    return (
      <>
        <Modal
          title='样签'
          footer={null}
          width={648}
          destroyOnClose
          maskClosable={false}
          visible={ReceivingSignModal}
          onCancel={() => this.setState({ ReceivingSignModal: false })}
        >
          {ReceivingSignModal&&this.renderImageDetail('signDentry')}
        </Modal>
        <Modal
          title='签收单'
          footer={null}
          width={648}
          maskClosable={false}
          destroyOnClose
          visible={receivingModal}
          onCancel={() => this.setState({ receivingModal: false })}
        >
          {receivingModal&&this.renderImageDetail('receiving')}
        </Modal>

        <Modal title='导出PDF' footer={null} width={648} visible={showPdfModal} onCancel={()=>this.setState({ showPdfModal : false })}>
          <SchemaForm mode={FORM_MODE.ADD} schema={this.pdfSchema}>
            <Item {...createBillLayout} field='billTypeOptions' />
            <Item {...createBillLayout} field='fileScale' />
            <Row type='flex' className='mt-2'>
              <Col span={6} />
              <Col span={6}><Button onClick={()=>this.setState({ showPdfModal : false })}>取消</Button></Col>
              <Col span={6}><FormButton label='确认' onClick={this.handleExportPDFBtnClick} type='primary' /></Col>
              <Col span={6} />
            </Row>
          </SchemaForm>
        </Modal>

        {
          ready
          &&
          <SchemaForm layout="vertical" mode={FORM_MODE.DETAIL} data={entity} {...goodsAccountBillLayOut} schema={this.schema}>
            <FormCard colCount={3} title="账单信息">
              <Item field='projectName' />
              <Item field='responsiblerName' />
              <div>
                <Item field='consignmentType' />
                <Item field='payerOrganizationName' />
              </div>
              <Item field='accountStatus' />
              <Item field='accountTransportNo' />
              <Item field='remark' />
            </FormCard>
            <FormCard title="运单信息" colCount={1}>
              <Table rowKey="transportId" pagination={false} schema={this.tableSchema} dataSource={{ items: this.props.goodsAccount.accountDetailItems }} />
            </FormCard>

            <h4>对账日志</h4>
            <div style={{ borderBottom: '1px solid #e8e8e8', marginBottom: '15px' }} />
            <AccountEvent type='goodsAccount' eventDist={goodsAccountEventDist} func={getAccountGoodsEvent} params={{ accountGoodsId: this.props.location.query.accountGoodsId }}  />

            <div style={{ paddingRight: '20px', textAlign: 'right' }}>
              <Button className="mr-10" type="primary" onClick={()=>this.setState({ showPdfModal: true })}>导出签收单PDF</Button>
              <Button className="mr-10" type="primary" onClick={this.handleExportBillDetailBtnClick}>导出运单明细</Button>
              <Button className="mr-10" onClick={()=>{ router.goBack(); }}>返回</Button>
            </div>
          </SchemaForm>
        }
      </>
    );
  }
}
