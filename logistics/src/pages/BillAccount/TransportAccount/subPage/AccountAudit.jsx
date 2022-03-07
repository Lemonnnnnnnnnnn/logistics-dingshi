import React, { Component } from 'react';
import router from 'umi/router';
import { Button, Modal, Input, notification, message, Popconfirm } from 'antd';
import { connect } from 'dva';
import moment from 'moment';
import { SchemaForm, Item, FORM_MODE, FormCard } from '@gem-mine/antd-schema-form';
import { TRANSPORT_ACCOUNT_LIST_STATUS, CONSIGNMENT_TYPE, ORDER_INTERNAL_STATUS } from '@/constants/project/project';
import { getUserInfo } from '@/services/user';
import Table from '@/components/Table/Table';
import ImageDetail from '@/components/ImageDetail';
import { getOssImg, formatMoney } from '@/utils/utils';
import { getAccountEvent, getTransportAccountDetail, refuseTransport } from "@/services/apiService";
import transportModel from '@/models/transports';
import auditAccountModel from '@/models/auditTransportAccount';
import AuditStatusField from '../component/AuditStatusField';
import AccountEvent from '@/components/AccountEvent';
import { TRANSPORT_ACCOUNT_EVENT_DIST } from '@/constants/account/event';
import '@gem-mine/antd-schema-form/lib/fields';
import {
  accountTransportCost,
  getNeedPay,
  getServiceCharge,
  getShipmentDifferenceCharge,
  getShipmentServiceCharge
} from "@/utils/account/transport";

const { actions: { detailTransports } } = transportModel;
const { actions: { patchAuditTransportAccount } } = auditAccountModel;


function mapStateToProps (state) {
  return {
    transportDetail: state.transports.entity,
  };
}

@connect(mapStateToProps, { detailTransports, patchAuditTransportAccount })
class AccountAudit extends Component {

  state = {
    ready: false,
    refuseModal:false,
    accountStatus: 2,
    verifyReason: '',
    refuseReason: '',
  }

  organizationType=getUserInfo().organizationType

  organizationId=getUserInfo().organizationId


  constructor (props) {
    super(props);
    const { location:{ query: { accountOrgType } } } = props;
    this.tableSchema = {
      variable: true,
      minWidth:2800,
      columns: [
        {
          title: '运单号',
          dataIndex: 'transportNo',
          render: (text, record) => {
            const icon = {
              1: { word:'增', color:'blue' },
              2: { word:'退', color:'red' },
              3: { word:'改', color:'orange' },
            }[record.auditStatus] || { word:'', color:'black' };
            return (
              <div>
                <span>{text}</span>
                <span style={{ backgroundColor:icon.color, color:'white', borderRadius:'4px' }}>{icon.word}</span>
              </div>
            );
          },
          fixed: 'left',
        },
        {
          title: '项目名称',
          dataIndex: 'projectName',
          render: (text, record) => <a onClick={()=> this.toProject(record.projectId)}>{text}</a>
        },
        {
          title: '运单类型',
          dataIndex: 'transportType',
          render: text => {
            // transportType: 运单类型(1.自营运单，2.网络货运运单)
            const config = ['自营运单', '网络货运运单'];
            return config[text-1];
          }
        },
        {
          title: '总运费（元）',
          render: (text, record) => {
            const {  transportPriceEntities } = record;
            const transportPriceEntity = (transportPriceEntities || []).find(item => `${item.transportPriceType}` === `${accountOrgType}`) || {};
            return `${accountTransportCost({ transportPriceEntity, ...record })._toFixed(2)}元`;
          }
        },
        {
          title: "承运接单手续费(元)",
          visible : this.organizationType !== 4,
          render: (text, record) => {
            const { transportPriceEntities } = record;
            const transportPriceEntity = (transportPriceEntities || []).find(item => `${item.transportPriceType}` === `${accountOrgType}`) || {};
            return `${getShipmentServiceCharge(record, transportPriceEntity)._toFixed(2)}元`;
          }
        },
        {
          title : '承运服务费(价差)（元）',
          visible : this.organizationType !== 4,
          render: (text, record) => {
            const { transportPriceEntities } = record;
            const transportPriceEntity = (transportPriceEntities || []).find(item => `${item.transportPriceType}` === `${accountOrgType}`) || {};
            return `${getShipmentDifferenceCharge(record, transportPriceEntity)._toFixed(2)}元`;
          }
        },
        {
          title: '服务费（元）',
          dataIndex: 'serviceCharge',
          render : (text, record)=>{
            const { transportPriceEntities } = record;
            const transportPriceEntity = (transportPriceEntities || []).find(item => `${item.transportPriceType}` === `${accountOrgType}`) || {};
            return `${getServiceCharge(transportPriceEntity)._toFixed(2)}元`;
          }
        },

        {
          title: '货损赔付（元）',
          dataIndex: 'damageCompensation',
          render: text => `${(text || 0)._toFixed(2)}元`
        },
        {
          title: '司机服务费（元）',
          dataIndex: 'driverServiceCharge',
          visible: this.organizationType === 1,
          render: (text, record) => {
            if (!record.transportPriceEntities) {
              return '0元';
            }
            let driverCharge = 0;
            // eslint-disable-next-line array-callback-return
            record.transportPriceEntities.map((item) => {
              if (`${item.transportPriceType}` === `${accountOrgType}`) {
                driverCharge = item.driverServiceCharge;
              }
            });
            return record.transportType === 1 ? '--' : `${(driverCharge || 0)._toFixed(2)}元`;
          },
        },
        {
          title: '应付账款（元）',
          dataIndex: 'receivables',
          render: (text, record) => {
            const { transportPriceEntities } = record;
            const transportPriceEntity = (transportPriceEntities || []).find(item => `${item.transportPriceType}` === `${accountOrgType}`) || {};
            const { accountInternalStatus } = this.accountData;
            return `${getNeedPay({ transportPriceEntity, accountInternalStatus }, record)._toFixed(2)}元`;
          }
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
            return time? moment(time).format('YYYY-MM-DD HH:mm:ss') : '--';
          },
        },
        {
          title: '提货点',
          dataIndex: 'deliveryItems',
          render: (text) => {
            const list = text.map((item) => <li title={`${item.deliveryName}`} className="test-ellipsis" key={item.goodsId}>{item.deliveryName}</li>);
            return <ul style={{ padding: 0, margin: 0 }}>{list}</ul>;
          },
        },
        {
          title: '货品名称',
          dataIndex: 'goodsName',
          render: (text, record) => {
            const list = record.deliveryItems.map((item) => <li title={`${item.categoryName}${item.goodsName}`} className="test-ellipsis" key={item.goodsId}>{`${item.categoryName}${item.goodsName}`}</li>);
            return <ul style={{ padding: 0, margin: 0 }}>{list}</ul>;
          },
        },
        {
          title: '规格型号',
          dataIndex: 'specificationType',
          render: (text, record) => {
            const list = record.deliveryItems.map((item) => {
              const word = item.specificationType === null ? '--' : item.specificationType;
              return <li title={`${word}`} className="test-ellipsis" key={item.goodsId}>{`${word}`}</li>;
            });

            return <ul style={{ padding: 0, margin: 0 }}>{list}</ul>;
          },
        },
        {
          title: '材质',
          dataIndex: 'materialQuality',
          render: (text, record) => {
            const list = record.deliveryItems.map((item) => {
              const word = item.materialQuality === null ? '--' : item.materialQuality;
              return <li title={`${word}`} className="test-ellipsis" key={item.goodsId}>{`${word}`}</li>;
            });

            return <ul style={{ padding: 0, margin: 0 }}>{list}</ul>;
          },
        },
        {
          title: '包装',
          dataIndex: 'packagingMethod',
          render: (text, record) => {
            const list = record.deliveryItems.map((item) => {
              let word = '--';
              if (item.packagingMethod === 1) {
                word = '袋装';
              } else if (item.packagingMethod === 2) {
                word = '散装';
              }
              return <li title={`${word}`} className="test-ellipsis" key={item.goodsId}>{`${word}`}</li>;
            });

            return <ul style={{ padding: 0, margin: 0 }}>{list}</ul>;
          },
        },
        {
          title: '提货量',
          dataIndex: 'deliveryNum',
          render: (text, record) => {
            const list = record.deliveryItems.map((item) => {
              const word = item.deliveryNum === null ? '--' : `${item.deliveryNum}${item.deliveryUnitCN}`;
              return <li title={`${word}`} className="test-ellipsis" key={item.goodsId}>{`${word}`}</li>;
            });

            return <ul style={{ padding: 0, margin: 0 }}>{list}</ul>;
          },
        },
        {
          title: '卸货量',
          dataIndex: 'receivingNum',
          render: (text, record) => {
            const list = record.deliveryItems.map((item) => {
              const word = item.receivingNum === null ? '--' : `${item.receivingNum}${item.receivingUnitCN}`;
              return <li title={`${word}`} className="test-ellipsis" key={item.goodsId}>{`${word}`}</li>;
            });

            return <ul style={{ padding: 0, margin: 0 }}>{list}</ul>;
          },
        },
        {
          title: '磅差比',
          dataIndex: 'Pounddifference',
          render: (text, record) => {
            const list = record.deliveryItems.map((item) => {
              const Pounddifference = (item.deliveryNum - item.receivingNum) * 1000 / (item.deliveryNum);
              const word = Pounddifference.toFixed(1)._toFixed(1);
              return <li title={`${word}`} style={{ color: word >= 3 ? 'red' : 'inherit' }} className="test-ellipsis" key={item.goodsId}>{`${word}‰`}</li>;
            });

            return <ul style={{ padding: 0, margin: 0 }}>{list}</ul>;
          }
        },
        {
          title: '卸货点',
          dataIndex: 'receivingName',
        },
        {
          title: '司机',
          dataIndex: 'driverNameBank'
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
              {/* // 运输对账单的查看操作 */}
              <a onClick={() => this.watchTransportDetail(record)} style={{ marginRight: '10px' }}>详情</a>
              <a onClick={() => this.watchBillsPicture(record, 'delivery')} style={{ marginRight: '10px' }}>提货单</a>
              <a onClick={() => this.watchBillsPicture(record, 'receiving')} style={{ marginRight: '10px' }}>签收单</a>
              {record.auditStatus !== 2 &&
              <Popconfirm title='确认要退回运单？' onConfirm={this.refuseModal(record.accountDetailId)}>
                <a style={{ marginRight: '10px' }}>退回</a>
              </Popconfirm>}
              {record.auditStatus === 2 &&
              <Popconfirm title='确认要撤销运单？' onConfirm={this.refuseTransport(record.accountDetailId, 4)}>
                <a style={{ marginRight: '10px' }}>撤销</a>
              </Popconfirm>
              }
            </>
          ),
          fixed: 'right'
        }
      ]
    };

    this.schema = {
      projectName: {
        label: '项目名称',
        component: 'input',
      },
      responsiblerName: {
        label: '项目负责人',
        component: 'input',
      },
      consignmentType: {
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
      payerOrganizationName: {
        component: 'input'
      },
      accountStatus: {
        label: '账单状态',
        component: 'radio',
        options: [{
          label: '待审核',
          key: TRANSPORT_ACCOUNT_LIST_STATUS.UNAUDITED,
          value: TRANSPORT_ACCOUNT_LIST_STATUS.UNAUDITED
        }, {
          label: '已通过',
          key: TRANSPORT_ACCOUNT_LIST_STATUS.AUDITED,
          value: TRANSPORT_ACCOUNT_LIST_STATUS.AUDITED
        }, {
          label: '已拒绝',
          key: TRANSPORT_ACCOUNT_LIST_STATUS.REFUSE,
          value: TRANSPORT_ACCOUNT_LIST_STATUS.REFUSE
        }, {
          label: '作废',
          key: TRANSPORT_ACCOUNT_LIST_STATUS.CANCEL,
          value: TRANSPORT_ACCOUNT_LIST_STATUS.CANCEL
        }, {
          label: '待提交',
          key: TRANSPORT_ACCOUNT_LIST_STATUS.NOT_HANDLE,
          value: TRANSPORT_ACCOUNT_LIST_STATUS.NOT_HANDLE
        }]
      },
      accountTransportNo: {
        label: '对账单号',
        component: 'input'
      },
      loadingNetWeight: {
        label: '装车总量',
        component: 'input'
      },
      unloadNetWeight: {
        label: '卸货总量',
        component: 'input'
      },
      remark: {
        label: '备注',
        component: 'input.textArea'
      }
    };
  }

  componentDidMount () {
    getTransportAccountDetail({ accountTransportId: this.props.location.query.accountTransportId })
      .then(data => {
        const responsiblerName = (data.responsibleItems || []).map(item => item.responsibleName).join('、');
        this.accountData = data;
        this.setState({
          transport:{
            items: data.accountDetailItems,
            count: data.accountDetailItems?.length || 0
          },
          transportAccount:{ ...data, responsiblerName },
          accountStatus: this.checkTransportAuditStatus(data.accountDetailItems)? 4:2,
          ready:true
        });
      });
  }

  watchTransportDetail = record => {
    router.push(`/buiness-center/transportList/transport/transportDetail?transportId=${record.transportId}`);
  }

  // 查看单据图片
  watchBillsPicture = async (record, type) => {
    if (this.props.transportDetail.transportId !== record.transportId) {
      await this.props.detailTransports({ transportId: record.transportId });
    }
    this.setState({
      [`${type}Modal`]: true
    });
  }

  handleBackBtnClick = () => {
    router.goBack();
  }

  renderImageDetail = imageType => {
    const { transportDetail: { loadingItems=[], signItems=[] } } = this.props;
    let imageData;
    if (imageType === 'delivery') {
      imageData = (loadingItems || []).map(item=>(item.billDentryid || '').split(',').map(billDentry=>getOssImg(billDentry))).flat();
    } else if (imageType === 'receiving') {
      imageData = (signItems || []).map(item=>(item.billDentryid || '').split(',').map(billDentry=>getOssImg(billDentry))).flat();
    }
    return (
      <ImageDetail imageData={imageData} />
    );
  }

  handleAuditedSaveBtnClick = () => {
    const { state:{ accountStatus, verifyReason }, props: { location: { query: { accountTransportId   } } } } = this;
    const { accountStatus : _accountStatus } = this.accountData;

    if (accountStatus === 4 && !verifyReason) return message.error('请填写备注');
    let items = [{ accountTransportId, accountStatus, verifyReason }];

    if (_accountStatus === TRANSPORT_ACCOUNT_LIST_STATUS.SHIPMENT_UNAUDITED){
      items = [{ accountTransportId, accountStatus, verifyReason, verifyType : 1 }];
    }

    this.props.patchAuditTransportAccount({ items })
      .then(() => {
        notification.success({
          message: '审核成功',
          description: '审核账单成功'
        });
        router.goBack();
      });
  }

  checkTransportAuditStatus = (items) => items.some(item => item.auditStatus === 2)

  chooseAuditStatus = (accountStatus) => () => {
    let check = false;
    const { accountDetailItems } = this.accountData;
    if ( accountStatus === 2 ) {
      check = this.checkTransportAuditStatus(accountDetailItems);
    }
    if (check) {
      return message.error('该对账单运单有退回运单，不能进行「通过」提交，如需通过，请先撤销运单修改');
    }
    if (accountStatus !== this.state.accountStatus) {
      this.setState({
        accountStatus
      });
    }
  }

  verifyReasonChange = (e) => {
    const { value } = e.target;
    this.setState({
      verifyReason:value
    });
  }

  refuseModal = accountDetailId => () => {
    this.setState({
      accountDetailId,
      refuseModal: true
    });
  }

  closeRefuseModal = () => {
    this.setState({
      refuseModal: false,
      refuseReason: ''
    });
  }

  refuseReasonChange = e => {
    const { value } = e.target;
    this.setState({
      refuseReason:value
    });
  }

  handleRefuseReason = () => {
    const { accountDetailId, refuseReason } = this.state;
    if (!refuseReason) return message.error('请输入退回原因');
    this.refuseTransport(accountDetailId, 2, refuseReason )();
    this.closeRefuseModal();
  }

  refuseTransport = (accountDetailId, auditStatus, refuseReason) => () => {
    refuseTransport({ accountDetailId, auditStatus, reason:refuseReason })
      .then(({ auditStatus:_auditStatus }) => {
        const { accountDetailItems: items } = this.accountData;
        const newTransport = items.map(item => {
          if (item.accountDetailId === accountDetailId) {
            return {
              ...item,
              auditStatus:_auditStatus
            };
          }
          return item;
        });
        this.accountData.accountDetailItems = newTransport;
        this.setState({
          accountStatus: 4,
          transport: {
            items: newTransport,
            count: newTransport.length
          }
        });
      });
  }

  renderExpenses = () => {
    const { accountInternalStatus,  accountDetailItems } = this.accountData;
    const { location: { query: { accountOrgType } } } = this.props;

    const payedFreight = accountDetailItems.reduce((sum, current)=>{
      const { transportPriceEntities } = current;
      const transportPriceEntity = (transportPriceEntities || []).find(item => `${item.transportPriceType}` === `${accountOrgType}`) || {};
      sum += getNeedPay({ transportPriceEntity, accountInternalStatus }, current);
      return sum;
    }, 0);

    return (
      <>
        <div style={{ padding:'24px' }}>
          <span style={{ fontSize:'12px', color:'gray', marginLeft:'10px' }}>（应付总金额包含运单费用)</span>
        </div>
        <div style={{ display:'flex', marginLeft:'24px' }}>
          <div style={{ width:'25%', textAlign:'center' }}>
            <div style={{ fontWeight:'bold', fontSize:'15px', lineHeight:'35px' }}>{`￥${formatMoney(payedFreight.toFixed(2))}`}</div>
            <div>应付总金额</div>
          </div>
        </div>
      </>
    );
  }

  auditStatusChange = (checkedValue) => {
    let auditStatus = checkedValue.join(',');
    if (!checkedValue[0]) {
      auditStatus = undefined;
    }
    getTransportAccountDetail({ accountTransportId: this.props.location.query.accountTransportId, auditStatus })
      .then(data => {
        this.setState({
          transport:{
            items: data.accountDetailItems,
            count: data.accountDetailItems?.length || 0
          },
        });
      });
  }

  searchTableList = () => (
    <AuditStatusField auditStatusChange={this.auditStatusChange} />
  )

  render () {
    const { ready, transport, transportAccount, deliveryModal, receivingModal, accountStatus, verifyReason, refuseModal, refuseReason } = this.state;
    const transportAccountBillLayOut = {
      labelCol: {
        xs: { span: 24 },
      },
      wrapperCol: {
        xs: { span: 24 },
      }
    };
    return (
      ready &&
      <>
        <Modal
          title='退回运单'
          footer={null}
          width={648}
          maskClosable={false}
          visible={refuseModal}
          destroyOnClose
          onCancel={this.closeRefuseModal}
        >
          <div style={{ margin:'0 auto', width:'400px' }}>
            <div>
              <span style={{ fontSize:'14px', color:'rgba(0,0,0,0.85)' }}>退回原因</span>
              <span style={{ fontSize:'12px', color:'red' }}>(必填)</span>
            </div>
            <div style={{ color:'gray', fontSize:'12px' }}>退回运单该对账单将不能被通过</div>
            <Input.TextArea onChange={this.refuseReasonChange} placeholder="请输入运单退回原因" maxLength={200} />
            <div style={{ color:'gray', textAlign:'right' }}>{refuseReason.length}/{200}</div>
            <div style={{ textAlign:'right', marginTop:'100px' }}>
              <Button className="mr-10" onClick={this.closeRefuseModal}>取消</Button>
              <Button type="primary" className="mr-10" onClick={this.handleRefuseReason}>确认</Button>
            </div>
          </div>
        </Modal>
        <Modal
          title='提货单'
          footer={null}
          width={648}
          maskClosable={false}
          visible={deliveryModal}
          destroyOnClose
          onCancel={() => this.setState({ deliveryModal: false })}
        >
          {deliveryModal && this.renderImageDetail('delivery')}
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
          {receivingModal && this.renderImageDetail('receiving')}
        </Modal>
        <SchemaForm layout="vertical" mode={FORM_MODE.DETAIL} data={transportAccount} schema={this.schema}>
          <FormCard colCount={3} title="账单信息">
            <Item {...transportAccountBillLayOut} field='projectName' />
            <Item {...transportAccountBillLayOut} field='responsiblerName' />
            <div>
              <Item {...transportAccountBillLayOut} field='consignmentType' />
              <Item {...transportAccountBillLayOut} field='payerOrganizationName' />
            </div>
            <Item {...transportAccountBillLayOut} field='accountStatus' />
            <Item {...transportAccountBillLayOut} field='accountTransportNo' />
            <Item {...transportAccountBillLayOut} field='loadingNetWeight' />
            <Item {...transportAccountBillLayOut} field='unloadNetWeight' />
            <Item {...transportAccountBillLayOut} field='remark' />
          </FormCard>
          {this.renderExpenses()}
          <FormCard title="运单信息" colCount={1}>
            <Table rowKey="transportId" schema={this.tableSchema} renderCommonOperate={this.searchTableList} dataSource={transport} />
          </FormCard>
        </SchemaForm>
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <span style={{ fontWeight: 'bold', fontSize: '17px' }}>审核意见</span>
          </div>
          <div style={{ display: 'flex', paddingLeft: '15px', alignItems:'center' }}>
            <div style={{ marginRight: '20px' }}>审核意见：</div>
            <div onClick={this.chooseAuditStatus(2)} style={{ cursor: 'pointer', border:'1px solid', borderRadius:'8px', width:'60px', lineHeight:'30px', marginRight: '25px', textAlign:'center', color:accountStatus === 2? 'green': 'gray', borderColor:accountStatus === 2?'green' : 'rgba(40,40,40,0.2)' }}>通过</div>
            <div onClick={this.chooseAuditStatus(4)} style={{ cursor: 'pointer', border:'1px solid', borderRadius:'8px', width:'60px', lineHeight:'30px', textAlign:'center', color:accountStatus !== 4? 'gray': 'red', borderColor:accountStatus !== 4?'rgba(40,40,40,0.2)' : 'red' }}>拒绝</div>
          </div>
          <div style={{ display: 'flex', marginTop:'15px', paddingLeft: '15px' }}>
            <div style={{ marginRight: '20px' }}>备注：</div>
            <div>
              <Input.TextArea placeholder='请输入审核意见，可以在运单信息对运单进行单独备注' onChange={this.verifyReasonChange} style={{ width:'600px', height:'100px' }} maxLength={200} />
              <div style={{ color:'gray', textAlign:'right' }}>{verifyReason.length}/{200}</div>
            </div>
          </div>
          <div style={{ margin: '15px 0', width: '680px', display: 'flex', justifyContent: 'flex-end' }}>
            <Button className="mr-10" onClick={this.handleBackBtnClick}>返回</Button>
            <Button type="primary" className="mr-10" onClick={this.handleAuditedSaveBtnClick}>审核</Button>
          </div>
          <h4>对账日志</h4>
          <div style={{ borderBottom:'1px solid #e8e8e8', marginBottom:'15px' }} />
          {/* <AccountEvent accountTransportId={transportAccount.accountTransportId} /> */}
          <AccountEvent eventDist={TRANSPORT_ACCOUNT_EVENT_DIST} func={getAccountEvent} params={{ accountTransportId : transportAccount.accountTransportId }}  />
        </div>
      </>
    );
  }
}

export default AccountAudit;
