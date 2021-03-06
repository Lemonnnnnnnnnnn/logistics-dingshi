import React, { Component } from "react";
import router from "umi/router";
import { Button, Card, Divider, Modal } from "antd";
import { connect } from "dva";
import moment from "moment";
import { FORM_MODE, FormCard, Item, SchemaForm } from "@gem-mine/antd-schema-form";
import DebounceFormButton from "../../../../components/DebounceFormButton";
import { CONSIGNMENT_TYPE, TRANSPORT_ACCOUNT_LIST_STATUS } from "../../../../constants/project/project";
import { getUserInfo } from "../../../../services/user";
import Table from "../../../../components/Table/Table";
import ImageDetail from "../../../../components/ImageDetail";
import { formatMoney, getOssImg, routerGoBack, routerToExportPage } from "../../../../utils/utils";
import { getAccountEvent, getTransportAccountDetail, sendAccountTransportExcelPost, detailTransports } from "../../../../services/apiService";
import transportModel from "../../../../models/transports";
import { TRANSPORT_ACCOUNT_EVENT_DIST } from "../../../../constants/account/event";
import AuditStatusField from "../component/AuditStatusField";
import AccountEvent from "../../../../components/AccountEvent";
import "@gem-mine/antd-schema-form/lib/fields";
import { ACCOUNT_BILL_NUMBER_RULE } from "@/constants/account";
import {
  accountTransportCost,
  getNeedPay,
  getServiceCharge,
  accountUnitPrice,
  getShipmentDifferenceCharge,
  getShipmentServiceCharge
} from "@/utils/account/transport";

// const { actions: { detailTransports } } = transportModel;

function mapStateToProps(state) {
  return {
    transportDetail: state.transports.entity,
    commonStore: state.commonStore
  };
}

const mapDispatchToProps = (dispatch) => ({
  deleteTab: (store, payload) => dispatch({ type: "commonStore/deleteTab", store, payload }),
  // detailTransports
});

@connect(mapStateToProps, mapDispatchToProps)
class AccountDetail extends Component {
  state = {
    ready: false,
    transportDetail : {},
  }

  organizationType = getUserInfo().organizationType

  organizationId = getUserInfo().organizationId

  constructor(props) {
    super(props);
    const { location: { query: { accountOrgType } } } = props;
    this.tableSchema = {
      variable: true,
      minWidth: 2800,
      columns: [
        {
          title: '?????????',
          dataIndex: 'transportNo',
          render: (text, record) => {
            const icon = {
              1: { word: '???', color: 'blue' },
              2: { word: '???', color: 'red' },
              3: { word: '???', color: 'blue' },
            }[record.auditStatus] || { word: '', color: 'black' };
            return (
              <div>
                <span>{text}</span>
                <span style={{ backgroundColor: icon.color, color: 'white', borderRadius: '4px' }}>{icon.word}</span>
              </div>
            );
          },
          fixed: 'left',
        },
        {
          title: '??????',
          render: (text, record) => {
            const { transportPriceEntities } = record;
            const transportPriceEntity = (transportPriceEntities || []).find(item => `${item.transportPriceType}` === `${accountOrgType}`) || {};
            return `${accountUnitPrice({ transportPriceEntity, ...record })._toFixed(2)}???`;
          }
        },
        {
          title: '??????',
          render: (text, record) => {
            const { transportPriceEntities } = record;
            const { location: { query: { accountOrgType } } } = this.props;
            const transportPriceEntity = transportPriceEntities.filter(item=>item.transportPriceType === Number(accountOrgType));
            return transportPriceEntity?.[0].manualQuantity;
          },
        },
        {
          title: '????????????',
          render: (text, record) => {
            const { transportPriceEntities } = record;
            const { location: { query: { accountOrgType } } } = this.props;
            const transportPriceEntity = transportPriceEntities.filter(item=>item.transportPriceType === Number(accountOrgType));
            return ACCOUNT_BILL_NUMBER_RULE[transportPriceEntity?.[0]?.measurementSource]?.text;
          },
        },
        {
          title: '??????????????????',
          render: (text, record) => {
            const {  transportPriceEntities } = record;
            const transportPriceEntity = (transportPriceEntities || []).find(item => `${item.transportPriceType}` === `${accountOrgType}`) || {};
            return `${accountTransportCost({ transportPriceEntity, ...record })._toFixed(2)}???`;
          }
        },
        {
          title: "?????????????????????(???)",
          visible : this.organizationType !== 4,
          render: (text, record) => {
            const { transportPriceEntities } = record;
            const transportPriceEntity = (transportPriceEntities || []).find(item => `${item.transportPriceType}` === `${accountOrgType}`) || {};
            return `${getShipmentServiceCharge(record, transportPriceEntity)._toFixed(2)}???`;
          }
        },
        {
          title: "???????????????(??????)(???)",
          visible : this.organizationType !== 4,
          render: (text, record) => {
            const { transportPriceEntities } = record;
            const transportPriceEntity = (transportPriceEntities || []).find(item => `${item.transportPriceType}` === `${accountOrgType}`) || {};
            return `${getShipmentDifferenceCharge(record, transportPriceEntity)._toFixed(2)}???`;
          }
        },
        {
          title: '??????????????????',
          dataIndex: 'serviceCharge',
          render : (text, record)=>{
            const { transportPriceEntities } = record;
            const transportPriceEntity = (transportPriceEntities || []).find(item => `${item.transportPriceType}` === `${accountOrgType}`) || {};
            return `${getServiceCharge(transportPriceEntity)._toFixed(2)}???`;
          }
        },
        {
          title: '?????????????????????',
          dataIndex: 'damageCompensation',
          render: text => `${(text || 0)._toFixed(2)}???`,
        },
        {
          title: '????????????????????????',
          dataIndex: 'driverServiceCharge',
          visible: this.organizationType === 1,
          render: (text, record) => {
            if (!record.transportPriceEntities) {
              return '0???';
            }
            let driverCharge = 0;
            // eslint-disable-next-line array-callback-return
            record.transportPriceEntities.map((item) => {
              if (`${item.transportPriceType}` === `${accountOrgType}`) {
                driverCharge = item.driverServiceCharge;
              }
            });
            return record.transportType === 1 ? '--' : `${(driverCharge || 0)._toFixed(2)}???`;  // ?????????????????????????????????????????????
          },
        },
        {
          title: '?????????????????????',
          dataIndex: 'receivables',
          render: (text, record) => {
            const { transportPriceEntities } = record;
            const transportPriceEntity = (transportPriceEntities || []).find(item => `${item.transportPriceType}` === `${accountOrgType}`) || {};
            const { accountInternalStatus } = this.accountData;
            return `${getNeedPay({ transportPriceEntity, accountInternalStatus }, record)._toFixed(2)}???`;
          }
        },
        {
          title: '????????????',
          dataIndex: 'deliveryItems',
          render: (deliveryItems)=> deliveryItems.map(item => item.deliveryBillNumber).join(',') || '--'
        },
        {
          title: '????????????',
          dataIndex: 'weighNumber',
          render: text=> text || '--'
        },
        {
          title: '????????????',
          dataIndex: 'receivingNo',
          render: (text, record) => {
            if (text) return text;
            if (record.billNumber) return record.billNumber;
            return '--';
          },
        },
        {
          title: '????????????',
          dataIndex: 'receivingTime',
          render: (text, record) => {
            const time = text || record.signTime;
            return time ? moment(time).format('YYYY-MM-DD HH:mm:ss') : '--';
          },
        },
        {
          title: '?????????',
          // dataIndex: 'deliveryItems',
          render: (text, record) => {
            const list = record.deliveryItems.map((item) =>
              <li
                title={`${item.deliveryName}`}
                className='test-ellipsis'
                key={item.accountDetailId}
              >{item.deliveryName}
              </li>);
            return <ul style={{ padding: 0, margin: 0 }}>{list}</ul>;
          },
        },
        {
          title: '????????????',
          dataIndex: 'goodsName',
          render: (text, record) => {
            const list = record.deliveryItems.map((item) =>
              <li
                title={`${item.categoryName}${item.goodsName}`}
                className='test-ellipsis'
                key={item.accountDetailId}
              >{`${item.categoryName}${item.goodsName}`}
              </li>);
            return <ul style={{ padding: 0, margin: 0 }}>{list}</ul>;
          },
        },
        {
          title: '????????????',
          dataIndex: 'specificationType',
          render: (text, record) => {
            const list = record.deliveryItems.map((item) => {
              const word = item.specificationType === null ? '--' : item.specificationType;
              return <li title={`${word}`} className='test-ellipsis' key={item.accountDetailId}>{`${word}`}</li>;
            });

            return <ul style={{ padding: 0, margin: 0 }}>{list}</ul>;
          },
        },
        {
          title: '??????',
          dataIndex: 'materialQuality',
          render: (text, record) => {
            const list = record.deliveryItems.map((item) => {
              const word = item.materialQuality === null ? '--' : item.materialQuality;
              return <li title={`${word}`} className='test-ellipsis' key={item.accountDetailId}>{`${word}`}</li>;
            });

            return <ul style={{ padding: 0, margin: 0 }}>{list}</ul>;
          },
        },
        {
          title: '??????',
          dataIndex: 'packagingMethod',
          render: (text, record) => {
            const list = record.deliveryItems.map((item) => {
              let word = '--';
              if (item.packagingMethod === 1) {
                word = '??????';
              } else if (item.packagingMethod === 2) {
                word = '??????';
              }
              return <li title={`${word}`} className='test-ellipsis' key={item.accountDetailId}>{`${word}`}</li>;
            });

            return <ul style={{ padding: 0, margin: 0 }}>{list}</ul>;
          },
        },
        {
          title: '?????????',
          dataIndex: 'deliveryNum',
          render: (text, record) => {
            const list = record.deliveryItems.map((item) => {
              const word = item.deliveryNum === null ? '--' : `${item.deliveryNum}${item.deliveryUnitCN}`;
              return <li title={`${word}`} className='test-ellipsis' key={item.accountDetailId}>{`${word}`}</li>;
            });

            return <ul style={{ padding: 0, margin: 0 }}>{list}</ul>;
          },
        },

        {
          title: "?????????",
          render: (text, record) => {
            const list = record.deliveryItems.map((item) => {
              const word = item.weighNum === null ? "--" : `${item.weighNum}${item.receivingUnitCN}`;
              return <li title={`${word}`} className="test-ellipsis" key={item.accountDetailId}>{`${word}`}</li>;
            });

            return <ul style={{ padding: 0, margin: 0 }}>{list}</ul>;
          }
        },
        {
          title: "?????????",
          render: (text, record) => {
            const list = record.deliveryItems.map((item) => {
              const word = item.receivingNum === null ? "--" : `${item.receivingNum}${item.receivingUnitCN}`;
              return <li title={`${word}`} className="test-ellipsis" key={item.accountDetailId}>{`${word}`}</li>;
            });

            return <ul style={{ padding: 0, margin: 0 }}>{list}</ul>;
          }
        },

        {
          title: '?????????',
          dataIndex: 'Pounddifference',
          render: (text, record) => {
            const list = record.deliveryItems.map((item) => {
              const Pounddifference = (item.deliveryNum - item.receivingNum) * 1000 / (item.deliveryNum);
              const word = Pounddifference.toFixed(1)._toFixed(1);
              return (
                <li
                  title={`${word}`}
                  style={{ color: word >= 3 ? 'red' : 'inherit' }}
                  className='test-ellipsis'
                  key={item.accountDetailId}
                >{`${word}???`}
                </li>);
            });

            return <ul style={{ padding: 0, margin: 0 }}>{list}</ul>;
          },
        },
        {
          title: '?????????',
          dataIndex: 'receivingName',
        },
        {
          title: '??????',
          dataIndex: 'driverNameBank',
        },
        {
          title: '?????????',
          dataIndex: 'plateNumber',
          render: (text, record) => {
            if (text) return text;
            if (record.carNo) return record.carNo;
            return 'bug';
          },
        },
        {
          title: '??????',
          dataIndex: 'carGroupName',
          visible: this.organizationType === 5,
          render: (text) => {
            if (text) return text;
            return '????????????';
          },
        },
        {
          title: '??????',
          dataIndex: 'looking',
          render: (text, record) => (
            <>
              {/* // ?????????????????????????????? */}
              <a onClick={() => this.watchTransportDetail(record)} style={{ marginRight: '10px' }}>??????</a>
              <a onClick={() => this.watchBillsPicture(record, 'delivery')} style={{ marginRight: '10px' }}>?????????</a>
              <a onClick={() => this.watchBillsPicture(record, 'receiving')} style={{ marginRight: '10px' }}>?????????</a>
              <a onClick={() => this.watchBillsPicture(record, 'weigh')} style={{ marginRight: '10px' }}>?????????</a>
            </>
          ),
          fixed: 'right',
        },
      ],
    };

    this.schema = {
      projectName: {
        label: '????????????',
        component: 'input',
      },
      responsiblerName: {
        label: '???????????????',
        component: 'input',
      },
      consignmentType: {
        label: '????????????',
        component: 'radio',
        options: [{
          key: CONSIGNMENT_TYPE.DIRECT_DELIVERY,
          label: '??????',
          value: CONSIGNMENT_TYPE.DIRECT_DELIVERY,
        }, {
          key: CONSIGNMENT_TYPE.AGENCY_DELIVERY,
          label: '??????',
          value: CONSIGNMENT_TYPE.AGENCY_DELIVERY,
        }],
      },
      payerOrganizationName: {
        component: 'input',
      },
      accountStatus: {
        label: '????????????',
        component: 'radio',
        options: [{
          label: '?????????',
          key: TRANSPORT_ACCOUNT_LIST_STATUS.UNAUDITED,
          value: TRANSPORT_ACCOUNT_LIST_STATUS.UNAUDITED,
        }, {
          label: '?????????',
          key: TRANSPORT_ACCOUNT_LIST_STATUS.AUDITED,
          value: TRANSPORT_ACCOUNT_LIST_STATUS.AUDITED,
        }, {
          label: '?????????',
          key: TRANSPORT_ACCOUNT_LIST_STATUS.REFUSE,
          value: TRANSPORT_ACCOUNT_LIST_STATUS.REFUSE,
        }, {
          label: '??????',
          key: TRANSPORT_ACCOUNT_LIST_STATUS.CANCEL,
          value: TRANSPORT_ACCOUNT_LIST_STATUS.CANCEL,
        }, {
          label: '?????????',
          key: TRANSPORT_ACCOUNT_LIST_STATUS.NOT_HANDLE,
          value: TRANSPORT_ACCOUNT_LIST_STATUS.NOT_HANDLE,
        }],
      },
      accountTransportNo: {
        label: '????????????',
        component: 'input',
      },
      loadingNetWeight: {
        label: '????????????',
        component: 'input',
      },
      unloadNetWeight: {
        label: '????????????',
        component: 'input',
      },
      remark: {
        label: '??????',
        component: 'input.textArea',
      },
    };
  }

  componentDidMount() {
    getTransportAccountDetail({ accountTransportId: this.props.location.query.accountTransportId })
      .then(data => {
        const responsiblerName = (data.responsibleItems || []).map(item => item.responsibleName).join('???');
        this.accountData = data;
        this.setState({
          transport: {
            items: data.accountDetailItems,
            count: data.accountDetailItems?.length || 0,
          },
          transportAccount:{ ...data, responsiblerName },
          ready:true
        });
      });
  }

  watchTransportDetail = record => {
    router.push(`/buiness-center/transportList/transport/transportDetail?transportId=${record.transportId}`);
  }

  // ??????????????????
  watchBillsPicture = async (record, type) => {
    const { transportDetail : { transportId } } = this.state;
    if (transportId !== record.transportId) {
      detailTransports({ transportId: record.transportId }).then(data=>{
        this.setState({ transportDetail : data, [`${type}Modal`]: true, });
      });
    } else {
      this.setState({ [`${type}Modal`]: true });
    }
  }

  renderImageDetail = imageType => {
    const { transportDetail: { loadingItems = [], signItems = [] } } = this.state;
    let imageData;
    if (imageType === 'delivery') {
      imageData = (loadingItems || []).map(item => (item.billDentryid || '').split(',').map(billDentry => getOssImg(billDentry))).flat();
    } else if (imageType === 'receiving') {
      imageData = (signItems || []).map(item => (item.billDentryid || '').split(',').map(billDentry => getOssImg(billDentry))).flat();
    } else if (imageType === 'weigh'){
      imageData = (signItems || []).map(item => (item.weighDentryid || '').split(',').map(weighDentryid => getOssImg(weighDentryid))).flat();
    }
    return (
      <ImageDetail imageData={imageData} />
    );
  }

  handleExportBillDetailBtnClick = () => {
    const { accountTransportId } = this.props.location.query;

    const params = {
      accountTransportId,
      fileName : '????????????',
      organizationType : this.organizationType,
      organizationId : this.organizationId
    };
    routerToExportPage(sendAccountTransportExcelPost, params);
  }

  handleBackBtnClick = () => {
    const {
      commonStore,
      deleteTab,
      commonStore: { tabs, activeKey }
    } = this.props;

    const dele = tabs.find(item => item.id === activeKey);
    deleteTab(commonStore, { id: dele.id });

    const { match : { path } } = this.props;
    routerGoBack(path);
  }

  auditWord = () => {
    const { transportAccount: { accountStatus } } = this.state;
    const word = {
      2: '??????',
      4: '??????',
    }[accountStatus];
    return word || '??????';
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
          <span style={{ fontSize:'12px', color:'gray', marginLeft:'10px' }}>????????????????????????????????????)</span>
        </div>
        <div style={{ display: 'flex', marginLeft: '24px' }}>
          <div style={{ width: '25%', textAlign: 'center' }}>
            <div style={{
              fontWeight: 'bold',
              fontSize: '15px',
              lineHeight: '35px',
            }}
            >{`???${formatMoney(payedFreight.toFixed(2))}`}
            </div>
            <div>???????????????</div>
          </div>
          <div style={{ borderLeft:'1px solid #e8e8e8' }} />
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
          transport: {
            items: data.accountDetailItems,
            count: data.accountDetailItems?.length || 0,
          },
        });
      });
  }

  searchTableList = () => (
    <AuditStatusField auditStatusChange={this.auditStatusChange} />
  )

  render() {
    const { ready, transport, transportAccount, deliveryModal, receivingModal, weighModal } = this.state;
    const transportAccountBillLayOut = {
      labelCol: {
        xs: { span: 24 },
      },
      wrapperCol: {
        xs: { span: 24 },
      },
    };
    return (
      <>
        <Modal
          title='?????????'
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
          title='?????????'
          footer={null}
          width={648}
          maskClosable={false}
          destroyOnClose
          visible={receivingModal}
          onCancel={() => this.setState({ receivingModal: false })}
        >
          {receivingModal && this.renderImageDetail('receiving')}
        </Modal>
        <Modal
          title='?????????'
          footer={null}
          width={648}
          maskClosable={false}
          destroyOnClose
          visible={weighModal}
          onCancel={() => this.setState({ weighModal: false })}
        >
          {weighModal && this.renderImageDetail('weigh')}
        </Modal>
        {ready &&
        <SchemaForm layout='vertical' mode={FORM_MODE.DETAIL} data={transportAccount} schema={this.schema}>
          <FormCard colCount={3} title='????????????'>
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
          <div style={{ paddingTop: '40px', textAlign: 'left' }}>
            <span style={{ paddingRight: '12px' }}>????????????</span>
            <DebounceFormButton label='??????????????????' type='primary' onClick={this.handleExportBillDetailBtnClick} />
          </div>
          <Divider />
          <Table
            rowKey='transportId'
            schema={this.tableSchema}
            renderCommonOperate={this.searchTableList}
            dataSource={transport}
          />
          <Card title='????????????' bordered={false}>
            <div>
              <span style={{ display: 'inline-block', width: '120px', textAlign: 'right' }}>???????????????</span>
              <span>{this.auditWord()}</span>
            </div>
            <div style={{ margin: '15px 0' }}>
              <span style={{ display: 'inline-block', width: '120px', textAlign: 'right' }}>?????????</span>
              <span>{transportAccount.verifyReason || '???'}</span>
            </div>
            <h4>????????????</h4>
            <div style={{ borderBottom: '1px solid #e8e8e8', marginBottom: '15px' }} />
            <AccountEvent eventDist={TRANSPORT_ACCOUNT_EVENT_DIST} func={getAccountEvent} params={{ accountTransportId : transportAccount.accountTransportId }}  />
          </Card>
          <div style={{ paddingRight: '20px', textAlign: 'right' }}>
            <Button className='mr-10' onClick={this.handleBackBtnClick}>??????</Button>
          </div>
        </SchemaForm>}
      </>
    );
  }
}

export default AccountDetail;
