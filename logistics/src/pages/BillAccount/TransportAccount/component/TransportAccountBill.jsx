import React, { Component } from "react";
import { Modal, Button, Icon, Spin } from "antd";
import { connect } from "dva";
import { Item, FORM_MODE, Observer } from "@gem-mine/antd-schema-form";
import router from "umi/router";
import moment from "moment";
import DebounceFormButton from "@/components/DebounceFormButton";
import { getTransportsSelectIdType } from "@/services/apiService";
import TableContainer from "@/components/Table/TableContainer";
import ImageDetail from "@/components/ImageDetail";
import { pick, translatePageType, getOssImg, omit, uniqBy, getLocal, isEmpty } from "@/utils/utils";
import transportModel from "@/models/transports";
import SearchForm from "@/components/Table/SearchForm2";
import SelectAllPageTable from "@/components/SelectAllPageTable/SelectAllPageTable";
// import "@gem-mine/antd-schema-form/lib/fields";
import { getUserInfo } from "@/services/user";
import { PAY_STATUS_DIST } from '@/constants/account';
import { accountTransportCost, getNeedPay, getServiceCharge, getShipmentDifferenceCharge } from "@/utils/account/transport";

const { actions: { getTransports, detailTransports } } = transportModel;

function mapStateToProps(state) {
  return {
    transports: pick(state.transports, ["items", "count"]),
    transportDetail: state.transports.entity,
    transportAccount: state.transportAccount.entity,
    commonStore: state.commonStore,
  };
}
@connect(mapStateToProps, { detailTransports, getTransports })
@TableContainer()
class TransportAccountBill extends Component {
  currentTab = this.props.commonStore.tabs.find(item => item.id === this.props.commonStore.activeKey);

  localData = getLocal(this.currentTab.id) || { formData: {} };

  time = this.localData && this.localData.formData && this.localData.formData.receivingTime && this.localData.formData.receivingTime.map(item => moment(item, 'YYYY/MM/DD'));

  form = null;

  organizationType = getUserInfo().organizationType;

  constructor(props) {
    super(props);
    const {  type } = props;
    this.form = {};
    const tableSchema = {
      variable: true,
      minWidth: 2800,
      columns: [
        {
          title: "????????????",
          dataIndex: "payStatus",
          render: text => <span style={{ color : PAY_STATUS_DIST[text]?.color }}>{PAY_STATUS_DIST[text]?.text}</span>,
          fixed: "left"
        },
        {
          title: "?????????",
          dataIndex: "transportNo"
        },
        {
          title: "????????????",
          dataIndex: "projectName",
          render: (text, record) => <a onClick={() => this.toProject(record.projectId)}>{text}</a>
        },
        {
          title : '???????????????',
          dataIndex: 'shipmentOrganizationName',
          visible : this.organizationType === 5
        },
        {
          title : '???????????????',
          dataIndex: 'driverCompanyName',
          visible : this.organizationType === 5,
          render:(text, record)=> text === record.shipmentOrganizationName ? '???' : text
        },
        {
          title: "????????????",
          dataIndex: "transportType",
          render: text => {
            // transportType: ????????????(1.???????????????2.??????????????????)
            const config = ["????????????", "??????????????????"];
            return config[text - 1];
          }
        },
        {
          title: "??????????????????",
          render : (text, record)=>{
            const {  transportPriceEntities, accountInitiateType } = record;
            const transportPriceEntity = (transportPriceEntities || []).find(item => `${item.transportPriceType}` === `${accountInitiateType}`) || {};
            return `${accountTransportCost({ transportPriceEntity, ...record })._toFixed(2)}???`;
          }
        },
        {
          title : '???????????????(??????)?????????',
          visible : this.organizationType !== 4,
          render: (text, record) => {
            const { transportPriceEntities, accountInitiateType } = record;
            const transportPriceEntity = (transportPriceEntities || []).find(item => `${item.transportPriceType}` === `${accountInitiateType}`) || {};
            return `${getShipmentDifferenceCharge(record, transportPriceEntity)._toFixed(2)}???`;
          }
        },
        {
          title: "??????????????????",
          render : (text, record)=>{
            const { transportPriceEntities, accountInitiateType  } = record;
            const transportPriceEntity = (transportPriceEntities || []).find(item => `${item.transportPriceType}` === `${accountInitiateType}`) || {};
            return `${getServiceCharge(transportPriceEntity)._toFixed(2)}???`;
          }
        },

        {
          title: "?????????????????????",
          render : (text, record)=>{
            const { accountInitiateType, transportPriceEntities } = record;
            const transportConfig = (transportPriceEntities || []).find(item => `${item.transportPriceType}` === `${accountInitiateType}`) || {};
            return `${(transportConfig.damageCompensation || 0)._toFixed(2)}???`;
          }
        },
        {
          title: "?????????????????????",
          dataIndex: "receivables",
          render: (text, record) => {
            const { transportPriceEntities, accountInitiateType } = record;
            const transportPriceEntity = (transportPriceEntities || []).find(item => `${item.transportPriceType}` === `${accountInitiateType}`) || {};
            return `${getNeedPay({ transportPriceEntity }, record)._toFixed(2)}???`;
          }
        },
        {
          title: "????????????",
          dataIndex: "receivingNo",
          render: (text, record) => {
            if (text) return text;
            if (record.billNumber) return record.billNumber;
            return "--";
          }
        },
        {
          title: "????????????",
          dataIndex: "receivingTime",
          render: (text, record) => {
            const time = text || record.signTime;
            return time ? moment(time).format("YYYY-MM-DD HH:mm:ss") : "--";
          }
        },
        {
          title: "?????????",
          dataIndex: "deliveryItems",
          render: (text) => {
            const list = text.map((item) =>
              <li
                title={`${item.deliveryName}`}
                className="test-ellipsis"
                key={item.goodsId}
              >{item.deliveryName}
              </li>);
            return <ul style={{ padding: 0, margin: 0 }}>{list}</ul>;
          }
        },
        {
          title: "????????????",
          dataIndex: "goodsName",
          render: (text, record) => {
            const list = record.deliveryItems.map((item) =>
              <li
                title={`${item.categoryName}${item.goodsName}`}
                className="test-ellipsis"
                key={item.goodsId}
              >{`${item.categoryName}${item.goodsName}`}
              </li>);
            return <ul style={{ padding: 0, margin: 0 }}>{list}</ul>;
          }
        },
        {
          title: "????????????",
          dataIndex: "specificationType",
          render: (text, record) => {
            const list = record.deliveryItems.map((item) => {
              const word = item.specificationType === null ? "--" : item.specificationType;
              return <li title={`${word}`} className="test-ellipsis" key={item.goodsId}>{`${word}`}</li>;
            });

            return <ul style={{ padding: 0, margin: 0 }}>{list}</ul>;
          }
        },
        {
          title: "??????",
          dataIndex: "materialQuality",
          render: (text, record) => {
            const list = record.deliveryItems.map((item) => {
              const word = item.materialQuality === null ? "--" : item.materialQuality;
              return <li title={`${word}`} className="test-ellipsis" key={item.goodsId}>{`${word}`}</li>;
            });

            return <ul style={{ padding: 0, margin: 0 }}>{list}</ul>;
          }
        },
        {
          title: "??????",
          dataIndex: "packagingMethod",
          render: (text, record) => {
            const list = record.deliveryItems.map((item) => {
              let word = "--";
              if (item.packagingMethod === 1) {
                word = "??????";
              } else if (item.packagingMethod === 2) {
                word = "??????";
              }
              return <li title={`${word}`} className="test-ellipsis" key={item.goodsId}>{`${word}`}</li>;
            });

            return <ul style={{ padding: 0, margin: 0 }}>{list}</ul>;
          }
        },
        {
          title: "?????????",
          dataIndex: "deliveryNum",
          render: (text, record) => {
            const list = record.deliveryItems.map((item) => {
              const word = item.deliveryNum === null ? "--" : `${item.deliveryNum}${item.deliveryUnitCN}`;
              return <li title={`${word}`} className="test-ellipsis" key={item.goodsId}>{`${word}`}</li>;
            });

            return <ul style={{ padding: 0, margin: 0 }}>{list}</ul>;
          }
        },
        {
          title: "?????????",
          dataIndex: "receivingNum",
          render: (text, record) => {
            const list = record.deliveryItems.map((item) => {
              const word = item.receivingNum === null ? "--" : `${item.receivingNum}${item.receivingUnitCN}`;
              return <li title={`${word}`} className="test-ellipsis" key={item.goodsId}>{`${word}`}</li>;
            });

            return <ul style={{ padding: 0, margin: 0 }}>{list}</ul>;
          }
        },
        {
          title: '?????????',
          dataIndex: 'weighNum',
          render: (text, record) => {
            const list = record.deliveryItems.map((item) => {
              const word = item.weighNum === null ? '--' : `${item.weighNum}${item.goodsUnitCN}`;
              return <li title={`${word}`} className="test-ellipsis" key={item.goodsId}>{`${word}`}</li>;
            });

            return <ul style={{ padding: 0, margin: 0 }}>{list}</ul>;
          },
        },
        {
          title: "?????????",
          dataIndex: "Pounddifference",
          render: (text, record) => {
            const list = record.deliveryItems.map((item) => {
              const Pounddifference = (item.deliveryNum - item.receivingNum) * 1000 / (item.deliveryNum);
              const word = Pounddifference.toFixed(1)._toFixed(1);
              return (
                <li
                  title={`${word}`}
                  style={{ color: word >= 3 ? "red" : "inherit" }}
                  className="test-ellipsis"
                  key={item.goodsId}
                >{`${word}???`}
                </li>);
            });

            return <ul style={{ padding: 0, margin: 0 }}>{list}</ul>;
          }
        },
        {
          title: "?????????",
          dataIndex: "receivingName"
        },
        {
          title: "??????",
          dataIndex: "driverNameBank",
          render : ((text, record) => text || record.driverUserName)
        },
        {
          title: "?????????",
          dataIndex: "plateNumber",
          render: (text, record) => {
            if (text) return text;
            if (record.carNo) return record.carNo;
            return "bug";
          }
        },
        {
          title : '????????????',
          dataIndex: 'billRecycleStatus',
          render : (text)=>{
            const dist = {
              1 : '??????',
              2 : '??????',
              3 : '???????????????',
              4 : '???????????????',
              5 : '???????????????',
            };
            if (dist[text]) return dist[text];
            return '';
          }
        },
        {
          title: "??????",
          dataIndex: "looking",
          render: (text, record) => (
            <>
              {/* // ?????????????????????????????? */}
              <a onClick={() => this.watchTransportDetail(record)} style={{ marginRight: "10px" }}>??????</a>
              <a onClick={() => this.watchBillsPicture(record, "delivery")} style={{ marginRight: "10px" }}>?????????</a>
              <a onClick={() => this.watchBillsPicture(record, "receiving")} style={{ marginRight: "10px" }}>?????????</a>
            </>
          ),
          fixed: "right"
        }
      ]
    };
    this.searchSchema = {
      receivingTime: {
        label: "????????????",
        component: "rangePicker",
        format:{
          input: (value) => {
            if (Array.isArray(value)) {
              return value.map(item => moment(item));
            }
            return value;
          },
          output: (value) => value
        },
        observer: Observer({
          watch: '*localData',
          action: (itemValue, { form }) => {
            if (this.form !== form) {
              this.form = form;
            }
            return { };
          }
        }),
      },
      transportNo: {
        label: "?????????",
        component: "input",
        placeholder: "??????????????????",
        transportNo: true,
      },
      receivingNo: {
        label: "????????????",
        component: "input",
        placeholder: "?????????????????????",
      },
      shipmentOrganizationName: {
        label: "?????????",
        component: "input",
        placeholder: "??????????????????",
        disabled: type === "add",
      },
      payStatus: {
        label: "????????????",
        component: "select",
        placeholder: "?????????????????????",
        options: [
          {
            label: "?????????",
            value: 1,
            key: 1
          },
          {
            label: "????????????",
            value: 2,
            key: 2
          }
        ]
      },
      goodsName: {
        label: "????????????",
        placeholder: "?????????????????????",
        component: "input",
      },
      deliveryTime: {
        label: "????????????",
        component: "rangePicker",
        format:{
          input: (value) => {
            if (Array.isArray(value)) {
              return value.map(item => moment(item));
            }
            return value;
          },
          output: (value) => value
        },
      },
      deliveryName: {
        label: "?????????",
        placeholder: "??????????????????",
        component: "input",
      },
      receivingName: {
        label: "?????????",
        placeholder: "??????????????????",
        component: "input",
      },
      packagingMethod: {
        label: "??????",
        placeholder: "?????????????????????",
        component: "select",
        options: [{
          label: "??????",
          key: 1,
          value: 1
        }, {
          label: "??????",
          key: 2,
          value: 2
        }]
      },
      materialQuality: {
        label: "??????",
        placeholder: "???????????????",
        component: "input"
      },
      specificationType: {
        label: "????????????",
        placeholder: "?????????????????????",
        component: "input"
      },
      driverUserName: {
        label: "??????",
        placeholder: "???????????????",
        component: "input"
      },
      plateNumber: {
        label: "?????????",
        placeholder: "??????????????????",
        component: "input"
      },
      accountTransportNo: {
        label: "???????????????",
        placeholder: "???????????????????????????",
        component: "input"
      },
      billRecycleStatusList : {
        label : '?????????????????????',
        placeholder : '???????????????????????????',
        component : 'select',
        options :[
          {
            label : '??????',
            key : '1,2',
            value : '1,2'
          },
          {
            label : '???????????????',
            key : 3,
            value : 3
          },
          {
            label : '???????????????',
            key : 4,
            value : 4
          },
          {
            label : '???????????????',
            key : 5,
            value : 5
          }
        ]
      }
    };

    this.state = {
      nowPage: 1,
      pageSize: 10,
      ready: false,
      deliveryModal: false,
      receivingModal: false,
      tableSchema,
      initFilter: {},
      transports : { items : [], count : 0 },
      selectOnePageChecked: false
    };
  }

  refTable = React.createRef()

  componentDidMount() {
    const {
      accountOrgType,
      getTransports,
      defaultFilter = {},
      setFilter,
    } = this.props;
    const { localData: { formData = {}, nowPage = 1, pageSize = 10 }, time } = this;
    const params = {
      shipmentOrganizationName: defaultFilter?.shipmentOrganizationName,
      transportPriceType: accountOrgType,
    };
    const initFilter = { ...params, offset: 0, limit: 10, ...defaultFilter };
    const newFilter = setFilter({
      ...params,
      ...defaultFilter,
      ...formData,
      receivingStartTime: time && time.length ? time[0].startOf('day').format('YYYY/MM/DD HH:mm:ss') : undefined,
      receivingEndTime: time && time.length ? time[1].endOf('day').format('YYYY/MM/DD HH:mm:ss') : undefined,
      deliveryStartTime: formData && formData.deliveryTime && formData.deliveryTime.length ? moment(formData.deliveryTime[0]).startOf('day').format('YYYY/MM/DD HH:mm:ss') : undefined,
      deliveryEndTime: formData && formData.deliveryTime && formData.deliveryTime.length ? moment(formData.deliveryTime[1]).endOf('day').format('YYYY/MM/DD HH:mm:ss') : undefined,
      offset: pageSize * ( nowPage - 1 ),
      limit: pageSize });

    getTransports(omit(newFilter, ["receivingTime", "deliveryTime"])).then((transports) => {
      this.setState({
        transports,
        ready: true,
        nowPage,
        pageSize,
        initFilter   // ?????????????????????????????????????????????
      }, ()=>{
        this.getMiniTransportList(omit(newFilter, ["receivingTime", "deliveryTime"]));
      });
    });
  }

  componentWillUnmount() {
    // ??????????????????????????? ?????????????????? ??????????????????
    const formData = !isEmpty(this.form) ? this.form.getFieldsValue() : null;
    localStorage.removeItem(this.currentTab.id);
    if (getLocal('local_commonStore_tabsObj').tabs.length > 1) {
      localStorage.setItem(this.currentTab.id, JSON.stringify({
        formData,
        nowPage: this.state.nowPage,
        pageSize: this.state.pageSize,
      }));
    }
  }

  toProject = projectId => {
    router.push(`/buiness-center/project/projectManagement/projectDetail?projectId=${projectId}`);
  };

  watchTransportDetail = record => {
    router.push(`/buiness-center/transportList/transport/transportDetail?transportId=${record.transportId}`);
  };

  // ??????????????????
  watchBillsPicture = async (record, type) => {
    if (this.props.transportDetail.transportId !== record.transportId) {
      await this.props.detailTransports({ transportId: record.transportId });
    }
    this.setState({
      [`${type}Modal`]: true
    });
  };

  getMiniTransportList = (newFilter) =>{
    /*
    * ????????????????????????
    * ???????????????????????????????????????????????????????????????????????????????????????????????????
    * ????????????????????????????????????????????????????????????????????????????????????????????????????????????this.props.onChange????????????????????????????????????
    * */
    const { initFilter } = this.state;
    const params = newFilter || initFilter;

    this.setState({ miniTransportReady : false });
    getTransportsSelectIdType({ ...params, limit: 100000 }).then(({ items }) => {
      const transportTotal = items.map(item => ({ ...item, selected: false }));
      this.setState({ transportTotal, miniTransportReady : true });
      this.props.onChange(transportTotal);
    });
  }

  getMiniTransportListKeepSelect = (newFilter) =>{
    const { initFilter, transportTotal : oldTransportTotal } = this.state;
    const params = newFilter || initFilter;
    // ???????????????????????????????????????????????????????????????
    const selectRow = oldTransportTotal.filter(item=>item.selected);

    this.setState({ miniTransportReady : false });
    getTransportsSelectIdType({ ...params, limit: 100000 }).then(({ items }) => {
      let transportTotal = items.map(item => ({ ...item, selected: false }));

      // ??????
      transportTotal = selectRow.concat(transportTotal);
      // ????????????????????????????????????
      transportTotal = uniqBy(transportTotal, 'transportId');

      this.setState({ transportTotal, miniTransportReady : true }, ()=>this.onModifyCurrentPageAndDelivery());
      this.props.onChange(transportTotal);
    });
  }

  // ???????????????????????????????????????
  onModifyCurrentPageAndDelivery = () => {
    const { transportTotal, transports, transports: { items: transportItems } } = this.state;
    let selectOnePageChecked = true;

    transportItems && transportItems.forEach((item, key) => {
      // ????????????????????????????????????????????????????????????selected
      const selectStatusElement = transportTotal.find(_item => _item.transportId === item.transportId);
      if (selectStatusElement) item.selected = selectStatusElement.selected;

      // ??????????????????????????????
      if (!transportItems[key].selected) selectOnePageChecked = false;
    });

    if (!transportItems || !transportItems.length) selectOnePageChecked = false;

    this.setState({ transports, selectOnePageChecked });
    this.props.onChange(transportTotal);
  };

  // ????????????
  onSelectRow = (selectedRow, selected, currentRow) => {
    const { transportTotal } = this.state;

    // 1. ???????????????
    if (selected) {
      for (let i = 0; i < transportTotal.length; i++) {
        if (transportTotal[i].transportId === currentRow.transportId) {
          transportTotal[i].selected = true;
          break;
        }
      }
    } else {
      for (let i = 0; i < transportTotal.length; i++) {
        if (transportTotal[i].transportId === currentRow.transportId) {
          transportTotal[i].selected = false;
          break;
        }
      }
    }

    this.setState({ transportTotal }, () => {
      this.onModifyCurrentPageAndDelivery();
    });
  };

  // ????????????
  onSelectOnePage = (selected) => {
    const { transportTotal, transports, transports : { items } } = this.state;

    /*
    * ?????????
    * ?????????????????????????????????????????????????????????????????????????????????transportTotal
    * ???????????????
    *       1. ??????transportTotal?????? 2.??????transportTotal????????????transports??????
    * ????????? ????????????transportTotal ??? transports
    * */
    let selectOnePageChecked = true;

    if (selected) {
      items.forEach(item=>{
        const selectStatusElement = transportTotal.find(_item=>_item.transportId === item.transportId);
        item.selected = true;
        selectStatusElement.selected = true;
        // selectOnePageChecked = true
      });
    } else {
      items.forEach(item=>{
        const selectStatusElement = transportTotal.find(_item=>_item.transportId === item.transportId);
        item.selected = false;
        selectStatusElement.selected = false;
        selectOnePageChecked = false;
      });
    }
    this.setState({ transportTotal, transports, selectOnePageChecked });

  };

  // ???????????????
  onSelectTotal = (selected) => {
    if (selected){
      const { transportTotal: _transportTotal } = this.state;
      // 1. ???????????????
      const transportTotal = _transportTotal.map(item => ({ ...item, selected: true }));
      this.setState({ transportTotal }, () => {
        this.onModifyCurrentPageAndDelivery();
      });
    } else {
      const { transportTotal: _transportTotal } = this.state;
      const transportTotal = _transportTotal.map(item => ({ ...item, selected: false }));
      this.setState({ transportTotal }, () => {
        this.onModifyCurrentPageAndDelivery();
      });
    }

  };

  // ??????????????????
  getCheckboxProps = (record) => ({
    checked: record.selected
  });

  // ????????????
  onChange = (pagination) => {
    const { transportTotal } = this.state;
    const { offset, limit, current } = translatePageType(pagination);
    this.setState({
      nowPage: current,
      pageSize: limit
    });
    let selectOnePageChecked = true;

    const newFilter = this.props.setFilter({ offset, limit });
    this.props.getTransports(newFilter).then(transports => {

      const { items: transportItems } = transports;

      transportItems.forEach((item) => {
        const selectStatusElement = transportTotal.find(_item=>_item.transportId === item.transportId);
        item.selected = selectStatusElement.selected;

        // ??????????????????????????????
        if (!item.selected) selectOnePageChecked = false;
      });

      this.setState({ transports, selectOnePageChecked });
    });
  };

  searchTableList = () => {
    const layout = {
      labelCol: {
        xs: { span: 24 },
        sm: { span: 10 },
        xl: { span: 8 }
      },
      wrapperCol: {
        xs: { span: 24 },
        sm: { span: 14 },
        xl: { span: 16 }
      }
    };

    const handleSearchBtnClick = (formData) => {
      const receivingStartTime = formData && formData.receivingTime && formData.receivingTime.length ? moment(formData.receivingTime?.[0]).startOf("day").format("YYYY/MM/DD HH:mm:ss") : undefined;
      const receivingEndTime = formData && formData.receivingTime && formData.receivingTime.length ? moment(formData.receivingTime?.[1]).endOf("day").format("YYYY/MM/DD HH:mm:ss") : undefined;
      const deliveryStartTime = formData && formData.deliveryTime && formData.deliveryTime.length ? moment(formData.deliveryTime?.[0]).startOf("day").format("YYYY/MM/DD HH:mm:ss") : undefined;
      const deliveryEndTime = formData && formData.deliveryTime && formData.deliveryTime.length ? moment(formData.deliveryTime?.[1]).endOf("day").format("YYYY/MM/DD HH:mm:ss") : undefined;
      const {
        // projectName,
        goodsName,
        deliveryName,
        receivingName,
        packagingMethod,
        specificationType,
        materialQuality,
        driverUserName,
        plateNumber,
      } = formData;
      const newFilter = this.props.setFilter({
        deliveryStartTime,
        deliveryEndTime,
        // projectName,
        goodsName,
        deliveryName,
        receivingName,
        packagingMethod,
        specificationType,
        materialQuality,
        driverUserName,
        plateNumber,
        receivingStartTime,
        receivingEndTime,
        offset: 0,
        // ...this.props.condition
      });
      const { offset = 0, limit = 10 } = newFilter;


      this.props.getTransports(omit(newFilter, ["receivingTime", "deliveryTime"])).then((transports) => {
        this.setState({
          transports,
          ready: true,
          nowPage: offset / limit + 1,
          pageSize: limit,
        }, ()=>{
          // ??????????????????????????? ?????????????????? ??????????????????
          localStorage.removeItem(this.currentTab.id);
          if (getLocal('local_commonStore_tabsObj').tabs.length > 1) {
            localStorage.setItem(this.currentTab.id, JSON.stringify({
              formData,
              nowPage: 1,
              pageSize: 10,
            }));
          }
          this.getMiniTransportListKeepSelect(newFilter);
        });
      });
    };

    const handleResetBtnClick = () => {
      // // ??????????????????????????? ?????????????????? ??????????????????
      localStorage.setItem(this.currentTab.id, JSON.stringify({ formData: {} }));
      this.form.setFieldsValue(null);
      const newFilter = this.props.resetFilter({ ...this.state.initFilter });
      this.getMiniTransportList(); // ??????????????????
      this.setState({
        nowPage: 1,
        pageSize: 10
      });

      // ??????????????????
      this.props.getTransports(newFilter).then(transports=>{
        const { items: transportItems } = transports;
        transportItems.forEach((item, key) => {
          transportItems[key].selected = false;
        });

        this.setState({ transports, selectOnePageChecked : false } );
      });
    };

    const { toggle } = this.state;
    return (
      <SearchForm
        className="goodsAccountSearchList"
        layout="inline"
        {...layout}
        mode={FORM_MODE.SEARCH}
        schema={this.searchSchema}
      >
        <div className={!toggle ? "searchList" : "searchList auto"}>
          {/* <Item field='projectName' /> */}
          <Item field="transportNo" />
          <Item field="receivingNo" />
          <Item field="shipmentOrganizationName" />
          <Item field="payStatus" />
          <Item field="goodsName" />
          <Item field="deliveryName" />
          <Item field="receivingName" />
          <Item field="packagingMethod" />
          <Item field="specificationType" />
          <Item field="materialQuality" />
          <Item field="driverUserName" />
          <Item field="plateNumber" />
          <Item field="accountTransportNo" />
          <Item field="deliveryTime" />
          <Item field="receivingTime" />
          <Item field='billRecycleStatusList' />
          <div onClick={this.changeToggle} className="toggle">
            {
              !toggle ?
                <span>?????? <Icon type="down" /></span>
                :
                <span>?????? <Icon type="up" /></span>
            }
          </div>
        </div>
        <div>
          <DebounceFormButton label="??????" className="mr-10" type="primary" onClick={handleSearchBtnClick} />
          <Button className="mr-10" onClick={handleResetBtnClick}>??????</Button>
        </div>
      </SearchForm>
    );
  };

  changeToggle = () => {
    const { toggle } = this.state;
    this.setState({
      toggle: !toggle
    });
  };

  renderImageDetail = imageType => {
    const { transportDetail: { loadingItems = [], signItems = [] } } = this.props;
    let imageData;
    if (imageType === "delivery") {
      imageData = (loadingItems || []).map(item => (item.billDentryid || "").split(",").map(billDentry => getOssImg(billDentry))).flat();
    } else if (imageType === "receiving") {
      imageData = (signItems || []).map(item => (item.billDentryid || "").split(",").map(billDentry => getOssImg(billDentry))).flat();
    }
    return (
      <ImageDetail imageData={imageData} />
    );
  };

  render() {
    const {
      nowPage,
      pageSize,
      deliveryModal,
      receivingModal,
      tableSchema,
      ready,
      transports,
      selectOnePageChecked,
      miniTransportReady
    } = this.state;
    return (
      <>
        <Modal
          title="?????????"
          footer={null}
          width={648}
          maskClosable={false}
          visible={deliveryModal}
          destroyOnClose
          onCancel={() => this.setState({ deliveryModal: false })}
        >
          {deliveryModal && this.renderImageDetail("delivery")}
        </Modal>
        <Modal
          title="?????????"
          footer={null}
          width={648}
          maskClosable={false}
          destroyOnClose
          visible={receivingModal}
          onCancel={() => this.setState({ receivingModal: false })}
        >
          {receivingModal && this.renderImageDetail("receiving")}
        </Modal>

        <SelectAllPageTable
          rowKey="transportId"
          selectOnePageChecked={selectOnePageChecked}
          onSelectRow={this.onSelectRow}
          loading={!(ready && miniTransportReady)}
          onSelectOnePage={this.onSelectOnePage}
          onSelectTotal={this.onSelectTotal}
          getCheckboxProps={this.getCheckboxProps}
          renderCommonOperate={this.searchTableList}
          multipleSelect
          pagination={{ current: nowPage, pageSize }}
          onChange={this.onChange}
          schema={tableSchema}
          dataSource={transports}
        />
      </>
    );
  }
}

export default TransportAccountBill;
