import React, { Component } from "react";
import { Modal, Button, Icon, Spin } from "antd";
import { connect } from "dva";
import { Item, FORM_MODE, Observer } from "@gem-mine/antd-schema-form";
import router from "umi/router";
import moment from "moment";
import DebounceFormButton from "@/components/debounce-form-button";
import { getTransportsSelectIdType } from "@/services/apiService";
import TableContainer from "@/components/table/table-container";
import ImageDetail from "@/components/image-detail";
import { pick, translatePageType, getOssImg, omit, uniqBy, getLocal, isEmpty } from "@/utils/utils";
import transportModel from "@/models/transports";
import SearchForm from "@/components/table/search-form2";
import SelectAllPageTable from "@/components/select-all-page-table/select-all-page-table";
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
          title: "支付状态",
          dataIndex: "payStatus",
          render: text => <span style={{ color : PAY_STATUS_DIST[text]?.color }}>{PAY_STATUS_DIST[text]?.text}</span>,
          fixed: "left"
        },
        {
          title: "运单号",
          dataIndex: "transportNo"
        },
        {
          title: "项目名称",
          dataIndex: "projectName",
          render: (text, record) => <a onClick={() => this.toProject(record.projectId)}>{text}</a>
        },
        {
          title : '本级承运方',
          dataIndex: 'shipmentOrganizationName',
          visible : this.organizationType === 5
        },
        {
          title : '下级承运方',
          dataIndex: 'driverCompanyName',
          visible : this.organizationType === 5,
          render:(text, record)=> text === record.shipmentOrganizationName ? '无' : text
        },
        {
          title: "运单类型",
          dataIndex: "transportType",
          render: text => {
            // transportType: 运单类型(1.自营运单，2.网络货运运单)
            const config = ["自营运单", "网络货运运单"];
            return config[text - 1];
          }
        },
        {
          title: "总运费（元）",
          render : (text, record)=>{
            const {  transportPriceEntities, accountInitiateType } = record;
            const transportPriceEntity = (transportPriceEntities || []).find(item => `${item.transportPriceType}` === `${accountInitiateType}`) || {};
            return `${accountTransportCost({ transportPriceEntity, ...record })._toFixed(2)}元`;
          }
        },
        {
          title : '承运服务费(价差)（元）',
          visible : this.organizationType !== 4,
          render: (text, record) => {
            const { transportPriceEntities, accountInitiateType } = record;
            const transportPriceEntity = (transportPriceEntities || []).find(item => `${item.transportPriceType}` === `${accountInitiateType}`) || {};
            return `${getShipmentDifferenceCharge(record, transportPriceEntity)._toFixed(2)}元`;
          }
        },
        {
          title: "服务费（元）",
          render : (text, record)=>{
            const { transportPriceEntities, accountInitiateType  } = record;
            const transportPriceEntity = (transportPriceEntities || []).find(item => `${item.transportPriceType}` === `${accountInitiateType}`) || {};
            return `${getServiceCharge(transportPriceEntity)._toFixed(2)}元`;
          }
        },

        {
          title: "货损赔付（元）",
          render : (text, record)=>{
            const { accountInitiateType, transportPriceEntities } = record;
            const transportConfig = (transportPriceEntities || []).find(item => `${item.transportPriceType}` === `${accountInitiateType}`) || {};
            return `${(transportConfig.damageCompensation || 0)._toFixed(2)}元`;
          }
        },
        {
          title: "应付账款（元）",
          dataIndex: "receivables",
          render: (text, record) => {
            const { transportPriceEntities, accountInitiateType } = record;
            const transportPriceEntity = (transportPriceEntities || []).find(item => `${item.transportPriceType}` === `${accountInitiateType}`) || {};
            return `${getNeedPay({ transportPriceEntity }, record)._toFixed(2)}元`;
          }
        },
        {
          title: "签收单号",
          dataIndex: "receivingNo",
          render: (text, record) => {
            if (text) return text;
            if (record.billNumber) return record.billNumber;
            return "--";
          }
        },
        {
          title: "签收时间",
          dataIndex: "receivingTime",
          render: (text, record) => {
            const time = text || record.signTime;
            return time ? moment(time).format("YYYY-MM-DD HH:mm:ss") : "--";
          }
        },
        {
          title: "提货点",
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
          title: "货品名称",
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
          title: "规格型号",
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
          title: "材质",
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
          title: "包装",
          dataIndex: "packagingMethod",
          render: (text, record) => {
            const list = record.deliveryItems.map((item) => {
              let word = "--";
              if (item.packagingMethod === 1) {
                word = "袋装";
              } else if (item.packagingMethod === 2) {
                word = "散装";
              }
              return <li title={`${word}`} className="test-ellipsis" key={item.goodsId}>{`${word}`}</li>;
            });

            return <ul style={{ padding: 0, margin: 0 }}>{list}</ul>;
          }
        },
        {
          title: "提货量",
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
          title: "签收量",
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
          title: '过磅量',
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
          title: "磅差比",
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
                >{`${word}‰`}
                </li>);
            });

            return <ul style={{ padding: 0, margin: 0 }}>{list}</ul>;
          }
        },
        {
          title: "卸货点",
          dataIndex: "receivingName"
        },
        {
          title: "司机",
          dataIndex: "driverNameBank",
          render : ((text, record) => text || record.driverName)
        },
        {
          title: "车牌号",
          dataIndex: "plateNumber",
          render: (text, record) => {
            if (text) return text;
            if (record.carNo) return record.carNo;
            return "bug";
          }
        },
        {
          title : '实体单据',
          dataIndex: 'billRecycleStatus',
          render : (text)=>{
            const dist = {
              1 : '待收',
              2 : '待收',
              3 : '承运方已收',
              4 : '托运方已收',
              5 : '货权方已收',
            };
            if (dist[text]) return dist[text];
            return '';
          }
        },
        {
          title: "查看",
          dataIndex: "looking",
          render: (text, record) => (
            <>
              {/* // 运输对账单的查看操作 */}
              <a onClick={() => this.watchTransportDetail(record)} style={{ marginRight: "10px" }}>详情</a>
              <a onClick={() => this.watchBillsPicture(record, "delivery")} style={{ marginRight: "10px" }}>提货单</a>
              <a onClick={() => this.watchBillsPicture(record, "receiving")} style={{ marginRight: "10px" }}>签收单</a>
            </>
          ),
          fixed: "right"
        }
      ]
    };
    this.searchSchema = {
      receivingTime: {
        label: "签收日期",
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
        label: "运单号",
        component: "input",
        placeholder: "请输入运单号",
        transportNo: true,
      },
      receivingNo: {
        label: "签收单号",
        component: "input",
        placeholder: "请输入签收单号",
      },
      shipmentOrganizationName: {
        label: "承运方",
        component: "input",
        placeholder: "请输入承运方",
        disabled: type === "add",
      },
      payStatus: {
        label: "支付状态",
        component: "select",
        placeholder: "请选择支付状态",
        options: [
          {
            label: "未支付",
            value: 1,
            key: 1
          },
          {
            label: "部分支付",
            value: 2,
            key: 2
          }
        ]
      },
      goodsName: {
        label: "货品名称",
        placeholder: "请输入货品名称",
        component: "input",
      },
      deliveryTime: {
        label: "提货时间",
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
        label: "提货点",
        placeholder: "请输入提货点",
        component: "input",
      },
      receivingName: {
        label: "卸货点",
        placeholder: "请输入卸货点",
        component: "input",
      },
      packagingMethod: {
        label: "包装",
        placeholder: "请选择包装方式",
        component: "select",
        options: [{
          label: "袋装",
          key: 1,
          value: 1
        }, {
          label: "散装",
          key: 2,
          value: 2
        }]
      },
      materialQuality: {
        label: "材质",
        placeholder: "请输入材质",
        component: "input"
      },
      specificationType: {
        label: "规格型号",
        placeholder: "请输入规格型号",
        component: "input"
      },
      driverUserName: {
        label: "司机",
        placeholder: "请输入司机",
        component: "input"
      },
      plateNumber: {
        label: "车牌号",
        placeholder: "请输入车牌号",
        component: "input"
      },
      accountTransportNo: {
        label: "承运对账单",
        placeholder: "请输入承运对账单号",
        component: "input"
      },
      billRecycleStatusList : {
        label : '实体单回收状态',
        placeholder : '选择实体单回收状态',
        component : 'select',
        options :[
          {
            label : '待收',
            key : '1,2',
            value : '1,2'
          },
          {
            label : '承运方已收',
            key : 3,
            value : 3
          },
          {
            label : '托运方已收',
            key : 4,
            value : 4
          },
          {
            label : '货权方已收',
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
        initFilter   // 储存初始筛选条件，用作重置操作
      }, ()=>{
        this.getMiniTransportList(omit(newFilter, ["receivingTime", "deliveryTime"]));
      });
    });
  }

  componentWillUnmount() {
    // 页面销毁的时候自己 先移除原有的 再存储最新的
    const formData = !isEmpty(this.form) ? this.form.getFieldsValue() : null;
    localStorage.removeItem(this.currentTab.id);
    if (getLocal('local_commonStore_tabs').tabs.length > 1) {
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

  // 查看单据图片
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
    * 选择所有页思路：
    * 将选择的数组（全部，简易）和本页展示的数组（一页，完整）区分开来，
    * 每当修改选中时，先更改选择的数组，后更改本页展示的数组，每次修改都需要用this.props.onChange向上级传递当前的选择情况
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
    // 将已选中的筛选出来，和新的选择数组进行拼接
    const selectRow = oldTransportTotal.filter(item=>item.selected);

    this.setState({ miniTransportReady : false });
    getTransportsSelectIdType({ ...params, limit: 100000 }).then(({ items }) => {
      let transportTotal = items.map(item => ({ ...item, selected: false }));

      // 拼接
      transportTotal = selectRow.concat(transportTotal);
      // 去重，去重优先选取第一个
      transportTotal = uniqBy(transportTotal, 'transportId');

      this.setState({ transportTotal, miniTransportReady : true }, ()=>this.onModifyCurrentPageAndDelivery());
      this.props.onChange(transportTotal);
    });
  }

  // 修改当前页面详细数据的数组
  onModifyCurrentPageAndDelivery = () => {
    const { transportTotal, transports, transports: { items: transportItems } } = this.state;
    let selectOnePageChecked = true;

    transportItems && transportItems.forEach((item, key) => {
      // 在状态总数组中查找当前页面的数据，并修改selected
      const selectStatusElement = transportTotal.find(_item => _item.transportId === item.transportId);
      if (selectStatusElement) item.selected = selectStatusElement.selected;

      // 联动全选按钮展示状态
      if (!transportItems[key].selected) selectOnePageChecked = false;
    });

    if (!transportItems || !transportItems.length) selectOnePageChecked = false;

    this.setState({ transports, selectOnePageChecked });
    this.props.onChange(transportTotal);
  };

  // 选择一行
  onSelectRow = (selectedRow, selected, currentRow) => {
    const { transportTotal } = this.state;

    // 1. 修改总数组
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

  // 选择单页
  onSelectOnePage = (selected) => {
    const { transportTotal, transports, transports : { items } } = this.state;

    /*
    * 思路：
    * 因为保留筛选条件的问题，无法通过页码来直接修改选择数组transportTotal
    * 所以流程从
    *       1. 修改transportTotal数组 2.根据transportTotal数组修改transports数组
    * 修改为 同时修改transportTotal 和 transports
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

  // 选择全部页
  onSelectTotal = (selected) => {
    if (selected){
      const { transportTotal: _transportTotal } = this.state;
      // 1. 修改总数组
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

  // 选择按钮渲染
  getCheckboxProps = (record) => ({
    checked: record.selected
  });

  // 页面切换
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

        // 联动全选按钮展示状态
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
          // 页面销毁的时候自己 先移除原有的 再存储最新的
          localStorage.removeItem(this.currentTab.id);
          if (getLocal('local_commonStore_tabs').tabs.length > 1) {
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
      // // 页面销毁的时候自己 先移除原有的 再存储最新的
      localStorage.setItem(this.currentTab.id, JSON.stringify({ formData: {} }));
      this.form.setFieldsValue(null);
      const newFilter = this.props.resetFilter({ ...this.state.initFilter });
      this.getMiniTransportList(); // 重置选择数组
      this.setState({
        nowPage: 1,
        pageSize: 10
      });

      // 重置展示数组
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
                <span>展开 <Icon type="down" /></span>
                :
                <span>缩起 <Icon type="up" /></span>
            }
          </div>
        </div>
        <div>
          <DebounceFormButton label="查询" className="mr-10" type="primary" onClick={handleSearchBtnClick} />
          <Button className="mr-10" onClick={handleResetBtnClick}>重置</Button>
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
          title="提货单"
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
          title="签收单"
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
