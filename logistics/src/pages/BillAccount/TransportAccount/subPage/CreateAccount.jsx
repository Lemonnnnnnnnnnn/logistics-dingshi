import React, { Component } from "react";
import { SchemaForm, Item, FORM_MODE, Observer } from "@gem-mine/antd-schema-form";
import { message, Modal, notification, Button } from "antd";
import { connect } from "dva";
import moment from "moment";
import router from "umi/router";
import DebounceFormButton from "@/components/DebounceFormButton";
import { IS_EFFECTIVE_STATUS, TRANSPORT_ACCOUNT_LIST_STATUS } from "@/constants/project/project";
import { SHIPMENT_TO_CONSIGNMENT, SHIPMENT_TO_PLAT, CONSIGNMENT_TO_PLAT, SUBORDINATE_SHIPMENT_TO_CONSIGNMENT_INSTEAD_OF_PLAT, SHIPMENT_TO_CONSIGNMENT_INSTEAD_OF_PLAT, SHIPMENT_TO_CONSIGN } from '@/constants/account';
import { uniqBy, disableDateAfterToday, isFunction, formatMoney, getLocal, routerGoBack } from "@/utils/utils";
import { getTransportAccountDetail, modifyTransportAccount, postTransportAccount } from "@/services/apiService";
import CreateAccountBill from "../component/TransportAccountBill";
import "@gem-mine/antd-schema-form/lib/fields";
import { getUserInfo } from "@/services/user";
import { accountTransportCost } from "@/utils/account/transport";


function mapStateToProps(state) {
  return {
    commonStore: state.commonStore
  };
}

@connect(mapStateToProps)
class CreateAccount extends Component {
  createSchema = {
    paymentTime: {
      label: "账单日期",
      component: "rangePicker",
      disabledDate: disableDateAfterToday,
      format: {
        input: (value) => {
          if (Array.isArray(value)) {
            return value.map(item => moment(item));
          }
          return value;
        },
        output: (value) => value
      },
      observer: Observer({
        watch: "*currentTab",
        action: (itemValue, { form }) => {
          if (this.form !== form) {
            this.form = form;
          }
          return {};
        }
      }),
      rules: {
        required: [true, "请选择账单日期"]
      }
    },
    remark: {
      label: "备注",
      component: "input.textArea",
      placeholder: "请输入备注"
    },
    totalCost: {
      label: "总金额",
      component: "input.text"
    }
  };

  accountData = {};

  currentTab = this.props.commonStore.tabs.find(item => item.id === this.props.commonStore.activeKey);

  localData = getLocal(this.props.commonStore.tabs.find(item => item.id === this.props.commonStore.activeKey).id) || { formData: {} };

  form = {};

  allowClickBtn = true;

  organizationType = getUserInfo().organizationType;

  state = {
    createBillModal: false,
    ready: false
  };

  componentDidMount() {
    const { location: { query: { type, accountTransportId  } } } = this.props;
    if (type === "add") {
      getTransportAccountDetail({ accountTransportId })
        .then(data => {
          // 存储一份当前账单详情的数据在this.accountData，用于添加运单时和选择运单拼接成新的运单列表
          this.accountData = data;
          this.schema = {
            accountDetailItems: {
              component: CreateAccountBill,
              props: {
                type,
                defaultFilter: this.setTransportFilterAddTransport()
              }
            }
          };
          this.setState({
            ready: true
          });
        });
    } else {
      this.schema = {
        accountDetailItems: {
          component: CreateAccountBill,
          props: {
            defaultFilter: this.setTransportFilterCreateAccount()
          }
        }
      };
      this.setState({
        ready: true
      });
    }
  }

  setTransportFilterCreateAccount = () =>{
    const { location: { query: { projectId, shipmentType, menu  } } } = this.props;

    let params = {
      isSelectAccount: true,
      iseffectiveStatus: IS_EFFECTIVE_STATUS.IS_EFFECTIVE_NORMAL,
      isPayInternal: true,
      projectId,
      shipmentType
    };

    if (this.organizationType === 4){ // 托运向平台发起对账  对应accountOrgType  3
      params = { ...params, accountTransportPlatstatus : 1, transportType : 2, transportPriceType : CONSIGNMENT_TO_PLAT };
      return params;
    }
    if (menu === SHIPMENT_TO_CONSIGN){ // 承运向托运发起对账  对应accountOrgType  1
      params = { ...params, accountTransportConsignment : 1, transportPriceType :SHIPMENT_TO_CONSIGNMENT };
      return params;
    }

    switch (Number(shipmentType)){
      case 0 : { // 本级、下级承运代平台向托运发起对账   对应accountOrgType  4 5
        params = { ...params, accountTransportPlatstatus : 1, transportType : 2, transportPriceTypeArray : `${SUBORDINATE_SHIPMENT_TO_CONSIGNMENT_INSTEAD_OF_PLAT},${SHIPMENT_TO_CONSIGNMENT_INSTEAD_OF_PLAT}` };
        break;
      }
      case 1 : { // 承运向平台发起对账  对应accountOrgType  2
        params = { ...params, accountTransportShipstatus : 1, transportType : 2, transportShipmentAccount : true, shipmentType : 1, transportPriceType : SHIPMENT_TO_PLAT  };
        break;
      }
      default : break;
    }
    return params;
  }

  setTransportFilterAddTransport = () => {
    const { location: { query: { accountOrgType } } } = this.props;
    const { projectName, shipmentName, projectId } = this.accountData;

    let params = {
      projectName,
      projectId,
      shipmentOrganizationName: shipmentName,
      transportPriceType : accountOrgType,
      isSelectAccount: true,
      iseffectiveStatus: IS_EFFECTIVE_STATUS.IS_EFFECTIVE_NORMAL,
      isPayInternal: true,
    };

    switch (Number(accountOrgType)){
      case SHIPMENT_TO_CONSIGNMENT :{
        params = { ...params, accountTransportConsignment : 1, transportType : 1 };
        break;
      }
      case SHIPMENT_TO_PLAT :{
        params = { ...params, accountTransportShipstatus : 1, transportType : 2, transportShipmentAccount : true, shipmentType : 1 };
        break;
      }
      case CONSIGNMENT_TO_PLAT :{
        params = { ...params, accountTransportPlatstatus : 1, transportType : 2 };
        break;
      }
      case SUBORDINATE_SHIPMENT_TO_CONSIGNMENT_INSTEAD_OF_PLAT :{
        params = { ...params, accountTransportPlatstatus : 1, transportType : 2 };
        break;
      }
      case SHIPMENT_TO_CONSIGNMENT_INSTEAD_OF_PLAT :{
        params = { ...params, accountTransportPlatstatus : 1, transportType : 2 };
        break;
      }
      default : break;
    }
    return params;
  };


  handleCancelBtnClick = () => {
    this.setState({
      createBillModal: false
    });
  };

  handleSaveBtnClick = (formData, form, dealFunc) => {
    const { commonStore: { tabs, activeKey }, match: { path }  } = this.props;
    const { accountType } = this.state;
    const paymentDaysStart = formData.paymentTime?.[0]?.startOf("day");
    const paymentDaysEnd = formData.paymentTime?.[1]?.endOf("day");
    const { selectedRow, accountOrgType } = this.state;

    const accountDetailItems = selectedRow.map(({ transportId })=>({ transportId  }));

    if (this.allowClickBtn) {
      this.allowClickBtn = false;
      postTransportAccount({
        paymentDaysStart,
        paymentDaysEnd,
        remark: formData.remark,
        accountDetailItems,
        accountStatus: TRANSPORT_ACCOUNT_LIST_STATUS.NOT_HANDLE,
        accountType,
        accountOrgType
      })
        .then(data => {
          this.setState({
            createBillModal: false
          });
          notification.success({
            message: "保存成功",
            description: "生成对账单成功"
          });
          // 清除当前缓存并关闭tab
          const dele = tabs.find(item => item.id === activeKey);
          window.g_app._store.dispatch({
            type: "commonStore/deleteTab",
            payload: { id: dele.id }
          });
          this.allowClickBtn = true;

          const callback = () => {
            const { resultMessage } = data;

            if (resultMessage){
              message.warn(resultMessage, 1 ).then(()=>routerGoBack(path));
            } else {
              routerGoBack(path);
            }
          };

          isFunction(dealFunc) ? dealFunc(data) : callback();
        })
        .catch(() => {
          this.allowClickBtn = true;
        });
    } else {
      notification.error({
        message: "请勿重复点击!"
      });
    }

  };

  // 提交审核
  handleSubmitBtnClick = (...arg) => {
    const { location: { query: { transportShipmentAccount } } } = this.props;
    const { accountOrgType } = this.state;
    const routeChange = ({ accountTransportId, accountTransportNo })=>{
      router.push({ pathname : 'modifyTransportAccountBill', query : {
        accountTransportNo,
        accountTransportId,
        transportShipmentAccount,
        accountOrgType,
        action : 'submit'
      } });
    };
    const callback = (data ) => {
      const { resultMessage } = data;
      if (resultMessage){
        message.warn(resultMessage, 1 ).then(()=>routeChange(data));
      } else {
        routeChange(data);
      }
    };
    this.handleSaveBtnClick(...arg, callback);
  };

  // 调账
  accountChangeClick = (...arg) => {
    const { accountOrgType } = this.state;
    const { location: { query: { transportShipmentAccount } } } = this.props;

    const routeChange = ({ accountTransportId, accountTransportNo })=>{
      router.push({
        pathname : 'modifyTransportAccountBill',
        query : {
          accountTransportNo,
          accountTransportId,
          transportShipmentAccount,
          accountOrgType,
        }
      });
    };

    const callback = (data ) => {
      const { resultMessage } = data;
      if (resultMessage){
        message.warn(resultMessage, 1 ).then(()=>routeChange(data));
      } else {
        routeChange(data);
      }
    };

    this.handleSaveBtnClick(...arg, callback);
  };

  getServiceCharge = transport => {
    let value = 0;
    if (transport.transportType === 2) {
      value = transport.serviceCharge || 0;
    }
    return +value.toFixed(2);
  };

  // 生成账单
  handleCreateBillBtnClick = (value) => {
    const { location: { query: {  menu  } } } = this.props;
    // 手动校验
    const { accountDetailItems } = value;
    const selectedRow = accountDetailItems.filter(item => item.selected);
    if (!selectedRow.length) return message.error("请至少选择一条运单");

    const transportBillType = uniqBy(selectedRow, "transportType");
    if (transportBillType.length > 1) return message.error("生成对账单只允许使用同类型运单");

    let accountOrgType = selectedRow[0].accountInitiateType;
    // eslint-disable-next-line no-restricted-syntax
    for ( const item of selectedRow){
      if (item.accountInitiateType !== accountOrgType){
        return message.error(`运单${item.transportNo} 与 ${selectedRow[0].transportNo} 不属于同一种对账类型`);
      }
    }

    if (menu === SHIPMENT_TO_CONSIGN) accountOrgType = SHIPMENT_TO_CONSIGNMENT;

    const totalCost = selectedRow.reduce((total, current) => {
      total += accountTransportCost( current );
      return total;
    }, 0);

    this.setState({
      selectedRow,
      totalCost: `${totalCost._toFixed(2)}元`,
      totalNum: selectedRow.length,
      accountType: transportBillType[0].transportType,
      accountOrgType
    }, ()=>{
      this.setState({ createBillModal: true });
    });
  };

  addTransport = (value) => {
    /*
    * 添加运单按钮逻辑：
    * 从当前账单详情this.accountData中获取当前运单列表accountDetailItems
    * 和选择运单selectRow拼接成新的运单列表newItem
    * */
    const { location: { query: { accountTransportId } }, commonStore: { tabs, activeKey } } = this.props;
    const { paymentDaysStart, paymentDaysEnd, accountDetailItems: oldAccountDetailItems } = this.accountData;

    const { accountDetailItems } = value;

    const transportBillType = uniqBy(accountDetailItems, "transportType");
    if (transportBillType.length > 1) return message.error("生成对账单只允许使用同类型运单");
    const selectedRow = accountDetailItems.filter(item => item.selected);
    if (!selectedRow.length) return message.error("请至少选择一条运单");

    const newItem = [...oldAccountDetailItems, ...selectedRow];

    if (this.allowClickBtn) {
      this.allowClickBtn = false;
      modifyTransportAccount({
        accountTransportId,
        paymentDaysStart: moment(paymentDaysStart),
        paymentDaysEnd: moment(paymentDaysEnd),
        accountDetailItems: newItem.map(item => ({ transportId: item.transportId }))
      })
        .then(() => {
          // 清除当前缓存并关闭tab
          const dele = tabs.find(item => item.id === activeKey);
          window.g_app._store.dispatch({
            type: "commonStore/deleteTab",
            payload: { id: dele.id }
          });
          notification.success({
            message: "添加成功",
            description: "添加运单成功"
          });
          this.allowClickBtn = true;

          router.goBack();

        })
        .catch(() => this.allowClickBtn = true);
    } else {
      notification.error({
        message: "请勿重复点击!"
      });
    }

  };

  render() {
    const { createBillModal, totalNum, totalCost = "", paymentTime, remark, accountType, ready } = this.state;
    const { location: { query: { type } } } = this.props;
    const billEntity = { totalCost, paymentTime, remark, accountType };
    const createBillLayout = {
      labelCol: {
        xs: { span: 4 }
      },
      wrapperCol: {
        xs: { span: 20 }
      }
    };
    return (
      ready &&
      <>
        <Modal
          title="生成对账单"
          footer={null}
          width={600}
          maskClosable={false}
          destroyOnClose
          visible={createBillModal}
          onCancel={this.handleCancelBtnClick}
        >
          <SchemaForm mode={FORM_MODE.ADD} data={billEntity} schema={this.createSchema}>
            <Item {...createBillLayout} field="paymentTime" />
            <div style={{ height: "20px" }} />
            <Item {...createBillLayout} field="remark" />
            <div style={{ display: "flex", justifyContent: "space-around", height: "50px", lineHeight: "50px" }}>
              <div>已选择<span style={{ fontWeight: "bold" }}>{totalNum}</span>单</div>
              <div>总运费<span style={{ fontWeight: "bold" }}>{formatMoney(totalCost)}</span></div>
            </div>
            <div style={{ paddingRight: "20px", textAlign: "right", marginTop: "10px" }}>
              <Button className="mr-10" onClick={this.handleCancelBtnClick}>取消</Button>
              <DebounceFormButton label="调账" className="mr-10" onClick={this.accountChangeClick} />
              <DebounceFormButton label="保存草稿" className="mr-10" onClick={this.handleSaveBtnClick} />
              <DebounceFormButton label="提交审核" type="primary" onClick={this.handleSubmitBtnClick} />
            </div>
          </SchemaForm>
        </Modal>

        <SchemaForm schema={this.schema} wrapperCol={{ xs: { span: 24 } }}>
          {/* <SchemaForm layout="vertical" schema={this.schema} wrapperCol={{ xs: { span: 24 } }}> */}
          <Item field="accountDetailItems" style={{ width: "100%" }} />
          <div style={{ paddingRight: "20px", textAlign: "right" }}>
            {type !== "add" &&
            <DebounceFormButton label="生成账单" type="primary" onClick={this.handleCreateBillBtnClick} />}
            {type === "add" && <DebounceFormButton label="添加运单" type="primary" onClick={this.addTransport} />}
          </div>
        </SchemaForm>
      </>
    );
  }
}

export default CreateAccount;
