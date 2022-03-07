import React from 'react';
import { SchemaForm, Item, FORM_MODE, FormCard, FormButton, Observer } from '@gem-mine/antd-schema-form';
import DebounceFormButton from '@/components/DebounceFormButton';
import { message, Modal, notification, Button } from 'antd';
import moment from 'moment';
import router from 'umi/router';
import { connect } from 'dva';
import Table from '@/components/Table/Table';
import { ACCOUNT_LIST_STATUS, CONSIGNMENT_TYPE } from '@/constants/project/project';
import ImageDetail from '@/components/ImageDetail';
import auth from '@/constants/authCodes';
import { getOssImg, flattenDeep } from '@/utils/utils';
import accountModel from '@/models/goodsAccount';
import transportModel from '@/models/transports';
import { patchAuditGoodsAccount } from '@/services/apiService';
// import auditAccountModel from '@/models/auditGoodsAccount'
import '@gem-mine/antd-schema-form/lib/fields';
import styles from './billInfo.less';

const { CARGO_TO_CONSIGNMENT_ACCOUNT_AUDITE } = auth;

const { actions: { detailGoodsAccount } } = accountModel;
// const { actions: { patchAuditGoodsAccount } } = auditAccountModel

const { actions: { detailTransports } } = transportModel;

function mapStateToProps (state) {
  return {
    goodsAccount: state.goodsAccount.entity,
    _goodsAccount: JSON.parse(JSON.stringify(state.goodsAccount.entity)),
    transportDetail: state.transports.entity,
  };
}

@connect(mapStateToProps, { detailGoodsAccount, detailTransports })
export default class AuditedGoodsAccountBill extends React.Component {

  state = {
    batchAuditedBillModal: false,
    auditedBillModal: false,
    changeId:[],
    ready:false,
    refresh:false
  }

  tableRef = React.createRef()

  constructor (props){
    super(props);
    this.schema = {
      projectName: {
        label: '合同名称',
        component: 'input.text',
      },
      responsiblerName: {
        label: '合同负责人',
        component: 'input.text',
      },
      consignmentType: {
        label: '交易模式',
        component: 'radio.text',
        options:[
          {
            label: '直发',
            value: CONSIGNMENT_TYPE.DIRECT_DELIVERY
          },
          {
            label: '代发',
            value: CONSIGNMENT_TYPE.AGENCY_DELIVERY
          }
        ]
      },
      payerOrganizationName: {
        component: 'input.text'
      },
      accountStatus: {
        label: '账单状态',
        component: 'select.text',
        options:[
          {
            value: ACCOUNT_LIST_STATUS.UNAUDITED,
            label: '待审核'
          },
          {
            value: ACCOUNT_LIST_STATUS.AUDITED,
            label: '审核完成'
          },
          {
            value: ACCOUNT_LIST_STATUS.REFUSE,
            label: '审核中'
          },
          {
            value: ACCOUNT_LIST_STATUS.AUDITED,
            label: '审核不通过'
          },
          {
            value: ACCOUNT_LIST_STATUS.CANCEL,
            label: '作废'
          },
          {
            value: ACCOUNT_LIST_STATUS.NOT_HANDLE,
            label: '待提交'
          }
        ]
      },
      accountTransportNo: {
        label: '对账单号',
        component: 'input.text'
      },
      remark: {
        label: '备注',
        component: 'input.text',
      },
      // accountDetailItems: {
      //   component: CreateAccountBill,
      //   pagination:false,
      //   statusColumn: true,
      //   searchFrom: false,
      //   props:{
      //     mode:'judge',
      //   },
      //   auditedFun: (record, selectedRow=[]) => {
      //     if (record.goodsAuditStatus===0){
      //       this.props.goodsAccount.accountDetailItems = selectedRow
      //       this.setState({ auditedBillModal: true, accountDetailItems: [record] })
      //     } else {
      //       message.error('只能审核待审核状态的运单')
      //     }
      //   },
      //   resetSign:this.resetSign,
      //   changeId:[],
      //   initialValue:[],
      //   observer:Observer({
      //     watch:['*itemValue', '*refresh'],
      //     action:([itemValue, refresh])=>{
      //       if (itemValue){
      //         return { changeId:JSON.parse(JSON.stringify(this.state.changeId)), initialValue:JSON.parse(JSON.stringify(itemValue)) }
      //       }
      //       if (refresh){
      //         return { changeId:JSON.parse(JSON.stringify(this.state.changeId)) }
      //       }
      //       return { changeId:[] }
      //     }
      //   })
      // }
    };
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
    return (
      imageType === 'receiving'?
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
        :
        <ImageDetail width='320' imageData={imageData} />
    );
  }

  handleShowBatchAuditModalBtnClick = () => {
    if (this.checkedTransports?.length === 0) {
      return message.error('请至少选择一条运单');
    }
    const check = this.checkedTransports.findIndex(item=>item.goodsAuditStatus !==0);
    if (check>=0){
      return message.error('只能审核待审核状态的运单');
    }
    this.props.detailGoodsAccount({ accountGoodsId: this.props.location.query.accountGoodsId }).then(() => {
      this.setState({
        batchAuditedBillModal: true,
        accountDetailItems: this.checkedTransports
      });
    });
  }

  auditedSchema = {
    goodsAuditStatus:{
      label: '审核',
      component: 'radio',
      rules:{
        required: [true, '请选择审核结果'],
      },
      options: [{
        label: '通过',
        key: 2,
        value: 2
      }, {
        label: '拒绝',
        key: 1,
        value: 1
      }],
    },
    verifyReason: {
      label: '审核意见',
      component: 'input.textArea',
      rules:{
        max: 200
      },
      placeholder: '请输入审核意见'
    }
  }

  handleAuditedBtnClick = (value) => {
    const { accountDetailItems } = this.state;
    const { goodsAuditStatus, verifyReason } = value;
    const items = accountDetailItems.map(item => ({ accountDetailId: item.accountDetailId, goodsAuditStatus, verifyReason }));
    patchAuditGoodsAccount({ items })
      .then(() => {
        const changeId = accountDetailItems.map(item=>({ accountDetailId:item.accountDetailId, goodsAuditStatus }));
        this.setState({
          auditedBillModal: false,
          changeId,
          refresh:true
        });
        this.tableRef.current.resetSelectedRows();
        this.checkedTransports = [];
        this.props.detailGoodsAccount({ accountGoodsId: this.props.location.query.accountGoodsId });
        notification.success({
          message: '审核成功',
          description: '审核运单成功'
        });
      });
  }

  batchAuditedSchema = {
    goodsAuditStatus: {
      label: '审核',
      component: 'radio',
      rules:{
        required: [true, '请选择审核结果'],
      },
      options: [{
        label: '通过',
        key: 2,
        value: 2
      }, {
        label: '拒绝',
        key: 1,
        value: 1
      }],
    },
    verifyReason: {
      label: '审核意见',
      component: 'input.textArea',
      props:{
        max:200
      },
      placeholder: '请输入审核意见'
    }
  }

  handleBatchAuditBtnClick = (value) => {
    const { accountDetailItems } = this.state;
    const { goodsAuditStatus, verifyReason } = value;
    const items = accountDetailItems.map(item => ({ accountDetailId: item.accountDetailId, goodsAuditStatus, verifyReason }));
    patchAuditGoodsAccount({ items })
      .then(() => {
        const changeId = accountDetailItems.map(item=>({ accountDetailId:item.accountDetailId, goodsAuditStatus }));
        this.setState({
          batchAuditedBillModal: false,
          changeId,
          refresh:true
        });
        this.tableRef.current.resetSelectedRows();
        this.checkedTransports = [];
        this.props.detailGoodsAccount({ accountGoodsId: this.props.location.query.accountGoodsId });
        notification.success({
          message: '审核成功',
          description: '审核运单成功'
        });
      });
  }

  componentDidMount () {
    this.tableSchema = {
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
            return moment(time).format('YYYY-MM-DD HH:mm:ss');
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
          width: '150px',
          fixed: 'right',
          render: (text, record) => (
            <>
              <a onClick={() => this.watchTransportDetail(record)} style={{ marginRight: '10px' }}>详情</a>
              <a onClick={() => this.watchReceivingSign(record)} style={{ marginRight: '10px' }}>样签</a>
              {
                record.receivingName? <a onClick={() => this.watchReceivingBills(record)} style={{ marginRight: '10px' }}>签收单</a>: false
              }
            </>
          )
        }
      ],
      operations: [
        {
          title: '审核',
          auth:[CARGO_TO_CONSIGNMENT_ACCOUNT_AUDITE],
          onClick: (record) => {
            if (record.goodsAuditStatus === 0){
              this.props.detailGoodsAccount({ accountGoodsId: this.props.location.query.accountGoodsId }).then(() => {
                this.setState({
                  auditedBillModal: true,
                  accountDetailItems: [record]
                });
              });
            } else {
              message.error('只能审核待审核状态的运单');
            }
          }
        }
      ]
    };
    if ('accountGoodsId' in this.props.location.query) {
      this.props.detailGoodsAccount({ accountGoodsId: this.props.location.query.accountGoodsId }).then(() => {
        this.setState({
          ready:true
        });
      });
    }
  }

  watchTransportDetail = record => {
    if (this.props.location.pathname.indexOf('cargo') !== -1) {
      router.push(`/bill-account/cargoGoodsAccount/cargoGoodsAccountList/transportDetail?transportId=${record.transportId}`);
    } else {
      router.push(`/bill-account/consignmentGoodsAccount/consignmentGoodsAccountList/transportDetail?transportId=${record.transportId}`);
    }
  }

  loadImage = () => {
    const record = this.state.accountDetailItems[0];
    const pictureArray = record.billDentryid ? record.billDentryid.split(',') : [];

    const pictures = pictureArray.map(item=>getOssImg(item));
    const imageData = [...pictures, getOssImg(record.signDentryid)];
    return (
      <>
        <ImageDetail imageData={imageData} />
        <div style={{ display: 'flex', fontSize:'15px', color:'#666666' }}>
          <div style={{ flex:5, paddingLeft:'30px' }}>
            <div>运单号：{record.transportNo}</div>
            <div>卸货点：{record.receivingName}</div>
            <div>规格型号：
              {record.deliveryItems.map(item=>{
                if (item.specificationType===null) return '--';
                return item.specificationType;
              }).join(';')}
            </div>
            <div>实收重量：{record.deliveryItems.map(item=>`${item.receivingNum}${item.receivingUnitCN}`).join(';')}</div>
          </div>
          <div style={{ flex:5, paddingLeft:'30px' }}>
            <div>签收单号：{record.billNumber}</div>
            <div>货品名称：{record.deliveryItems.map(item=>`${item.categoryName}-${item.goodsName}`).join(';')}</div>
            <div>包装：
              {record.deliveryItems.map(item=>{
                if (item.packagingMethod===1) return '袋装';
                if (item.packagingMethod===2) return '散装';
                return '--';
              }).join(';')}
            </div>
            <div>材质：
              {record.deliveryItems.map(item=>{
                if (item.materialQuality===null) return '--';
                return item.materialQuality;
              }).join(';')}
            </div>
          </div>
        </div>
      </>
    );
  }

  onSelectRow = (checked) => {
    this.checkedTransports = checked;
  }

  resetSign = () =>{
    this.setState({
      refresh:false
    });
  }

  render () {
    const entity = { consignmentType: CONSIGNMENT_TYPE.AGENCY_DELIVERY, ...this.props.goodsAccount };
    // const judgeTransport = [...this.props.goodsAccount.accountDetailItems]
    const auditedEntity = { goodsAuditStatus: 2 };
    const { batchAuditedBillModal, auditedBillModal, accountDetailItems = [], ready, changeId, refresh, transportsList, ReceivingSignModal, receivingModal } = this.state;
    const formLayOut = {
      labelCol:{
        xs: { span: 24 }
      },
      wrapperCol: {
        xs: { span: 24 }
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
        <Modal
          title='运单审核'
          footer={null}
          width={648}
          maskClosable={false}
          destroyOnClose
          visible={auditedBillModal}
          onCancel={() => this.setState({ auditedBillModal: false })}
        >
          {auditedBillModal && this.loadImage()}
          <SchemaForm layout="vertical" mode={FORM_MODE.ADD} data={JSON.parse(JSON.stringify(auditedEntity))} schema={this.auditedSchema}>
            <Item field='goodsAuditStatus' />
            <Item field='verifyReason' />
            <div style={{ padding:'20px', textAlign: 'right' }}>
              <Button className='mr-10' onClick={()=>{ this.setState({ auditedBillModal: false }); }}>取消</Button>
              <DebounceFormButton label="保存" type="primary" onClick={this.handleAuditedBtnClick} />
            </div>
          </SchemaForm>
        </Modal>
        <Modal
          title={<span>运单审核<span style={{ color: 'gray' }}>{`(共${accountDetailItems.length}个运单)`}</span></span>}
          footer={null}
          width={500}
          maskClosable={false}
          destroyOnClose
          visible={batchAuditedBillModal}
          onCancel={() => this.setState({ batchAuditedBillModal: false })}
        >
          <SchemaForm layout="vertical" mode={FORM_MODE.ADD} data={JSON.parse(JSON.stringify(auditedEntity))} schema={this.batchAuditedSchema}>
            <Item field='goodsAuditStatus' />
            <Item field='verifyReason' />
            <div style={{ padding:'20px', textAlign: 'right' }}>
              <Button className='mr-10' onClick={()=>{ this.setState({ batchAuditedBillModal: false }); }}>取消</Button>
              <DebounceFormButton label="保存" type="primary" onClick={this.handleBatchAuditBtnClick} />
            </div>
          </SchemaForm>
        </Modal>
        {
          ready
          &&
          <SchemaForm layout="vertical" mode={FORM_MODE.MODIFY} data={JSON.parse(JSON.stringify(entity))} schema={this.schema} trigger={{ refresh, itemValue:JSON.parse(JSON.stringify(this.props._goodsAccount.accountDetailItems)) }}>
            <FormCard colCount={3} title="账单信息">
              <Item {...formLayOut} field='projectName' />
              <Item {...formLayOut} field='responsiblerName' />
              <div>
                <Item {...formLayOut} field='consignmentType' />
                <Item {...formLayOut} field='payerOrganizationName' />
              </div>
              <Item {...formLayOut} field='accountStatus' />
              <Item {...formLayOut} field='accountTransportNo' />
              <Item {...formLayOut} field='remark' />
            </FormCard>
            <FormCard title="运单信息" colCount={1}>
              <Table rowKey='transportId' ref={this.tableRef} multipleSelect onSelectRow={this.onSelectRow} dataSource={{ count: 0, items: this.props.goodsAccount.accountDetailItems }} schema={this.tableSchema} renderCommonOperate={this.searchList} pagination={false} />
            </FormCard>
            <div style={{ paddingRight:'20px', textAlign:'right' }}>
              <DebounceFormButton label="批量审核" type="primary" onClick={this.handleShowBatchAuditModalBtnClick} />
            </div>
          </SchemaForm>
        }
      </>
    );
  }
}
