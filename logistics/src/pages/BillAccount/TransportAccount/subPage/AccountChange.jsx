import React, { Component } from "react";
import { Button, Icon, message, Modal, notification, Table as AntTable } from "antd";
import { FORM_MODE, Item, Observer } from "@gem-mine/antd-schema-form";
import CSSModules from "react-css-modules";
import router from "umi/router";
import { connect } from "dva";
import moment from "moment";
import TableContainer from "../../../../components/Table/TableContainer";
import DebounceFormButton from "../../../../components/DebounceFormButton";
import SelectAllPageTable from "../../../../components/SelectAllPageTable/SelectAllPageTable";
import {
  getAccountCarReminds,
  getTransportAccountDetail,
  getTransportList,
  getTransportsSelectIdType,
  modifyTransportAccount
} from "../../../../services/apiService";
import {
  classifyGoodsWeight,
  cloneDeep,
  flattenDeep,
  formatMoney,
  getLocal,
  omit,
  routerGoBack,
  translatePageType,
  uniqBy,
  xorBy
} from "../../../../utils/utils";
import {
  accountTransportCost,
  accountUnitPrice,
  getNeedPay,
  getServiceCharge,
  getShipmentDifferenceCharge, getShipmentServiceCharge
} from "@/utils/account/transport";
import SearchForm from "../../../../components/Table/SearchForm2";
import { getUserInfo } from "../../../../services/user";
import CarGroupField from "../component/CarGroupField";
import AuditStatusField from "../component/AuditStatusField";
import AdjustForm from "../component/AdjustForm";
import styles from "./AccountChange.less";
import "@gem-mine/antd-schema-form/lib/fields";
import { ACCOUNT_BILL_NUMBER_RULE } from "@/constants/account";
import { TRANSPORT_ACCOUNT_LIST_STATUS } from '@/constants/project/project';


function mapStateToProps(state) {
  return {
    transportDetail: state.transports.entity,
    commonStore: state.commonStore
  };
}

const mapDispatchToProps = (dispatch) => ({
  deleteTab: (store, payload) => dispatch({ type: "commonStore/deleteTab", store, payload })
});

@connect(mapStateToProps, mapDispatchToProps)
@TableContainer()
@CSSModules(styles, { allowMultiple: true })
class AccountChange extends Component {

  constructor(props) {
    super(props);
    const { location: { query: { accountStatus } } } = props;

    this.tableRef = React.createRef();
    this.auditStatusRef = React.createRef();
    this.allowClickBatchAccountChangeBtn = true;
    this.organizationType = getUserInfo().organizationType;
    this.currentTab = this.props.commonStore.tabs.find(item => item.id === this.props.commonStore.activeKey);
    this.localData = getLocal(this.currentTab.id) || { formData: {} };
    this.form = null;
    this.filter = {};
    this.accountData = {};
    this.shipmentUnaudited = Number(accountStatus) === TRANSPORT_ACCOUNT_LIST_STATUS.SHIPMENT_UNAUDITED; // 是否是本级承运待审核类型的调账
    this.modalColumns = [
      {
        title: "货品",
        dataIndex: "name",
        render: (text, record) => `${record.categoryName}${record.goodsName}`
      },
      {
        title: "单数",
        dataIndex: "orderNum"
      },
      {
        title: "总数量",
        dataIndex: "num",
        render: (text, record) => `${(record.num || 0)._toFixed(2)}${record.deliveryUnitCN}`
      },
      {
        title: "运费总金额",
        dataIndex: "averageCost",
        render: (text) => `${text.toFixed(2)._toFixed(2)}元`
      }
    ];
    this.searchSchema = {
      receivingTime: {
        label: "签收日期",
        component: "rangePicker",
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
          watch: "*localData",
          action: (itemValue, { form }) => {
            if (this.form !== form) {
              this.form = form;
            }
            return {};
          }
        })
      },
      transportNo: {
        label: "运单号",
        component: "input",
        placeholder: "请输入运单号"
      },
      receivingNo: {
        label: "签收单号",
        component: "input",
        placeholder: "请输入签收单号"
      },
      shipmentOrganizationName: {
        label: "承运方",
        component: "input",
        placeholder: "请输入承运方"
      },
      carGroupId: {
        label: "车组",
        component: CarGroupField,
        visible: getUserInfo().organizationType === 5
      },
      goodsName: {
        label: "货品名称",
        placeholder: "请输入货品名称",
        component: "input"
      },
      deliveryTime: {
        label: "提货时间",
        component: "rangePicker",
        format: {
          input: (value) => {
            if (Array.isArray(value)) {
              return value.map(item => moment(item));
            }
            return value;
          },
          output: (value) => value
        }
      },
      deliveryName: {
        label: "提货点",
        placeholder: "请输入提货点",
        component: "input"
      },
      receivingName: {
        label: "卸货点",
        placeholder: "请输入卸货点",
        component: "input"
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
      }
    };

    this.state = {
      nowPage: 1,
      pageSize: 10,
      toggle: false,
      ready: false,
      selectedRow: [],
      accountModal: false,
      accountEntity: {},
      transports: { items: [], count: 0 },
      accountData: {}
    };
  }

  componentDidMount() {
    const {
      localData: {
        formData = {},
        nowPage = 1,
        pageSize = 10
      }
    } = this;
    const {
      location: { query: { accountTransportId, action, accountTransportNo, accountOrgType } }
    } = this.props;


    const newFilter = this.props.setFilter({
      ...formData,
      accountTransportNo,
      isSelectAccount: true,
      transportPriceType: accountOrgType,
      receivingStartTime: formData && formData.receivingTime && formData.receivingTime.length ? moment(formData.receivingTime[0]).startOf("day").format("YYYY/MM/DD HH:mm:ss") : undefined,
      receivingEndTime: formData && formData.receivingTime && formData.receivingTime.length ? moment(formData.receivingTime[1]).endOf("day").format("YYYY/MM/DD HH:mm:ss") : undefined,
      deliveryStartTime: formData && formData.deliveryTime && formData.deliveryTime.length ? moment(formData.deliveryTime[0]).startOf("day").format("YYYY/MM/DD HH:mm:ss") : undefined,
      deliveryEndTime: formData && formData.deliveryTime && formData.deliveryTime.length ? moment(formData.deliveryTime[1]).endOf("day").format("YYYY/MM/DD HH:mm:ss") : undefined,
      offset: pageSize * (nowPage - 1),
      limit: pageSize
    });

    this.filter = omit(newFilter, ["receivingTime", "deliveryTime"]);
    this.initFilter = { limit : 10, offset : 0, accountTransportNo, transportPriceType: accountOrgType, isSelectAccount: true, };
    this.props.setDefaultFilter(this.initFilter);

    this.getMiniTransportList();

    getTransportAccountDetail({ accountTransportId })
      .then(data => {
        // this.accountData = data
        const tableSchema = {
          variable: true,
          minWidth: 2800,
          columns: [
            {
              title: "运单号",
              dataIndex: "transportNo",
              render: (text, record) => {
                const icon = {
                  1: { word: "增", color: "blue" },
                  2: { word: "退", color: "red" },
                  3: { word: "改", color: "orange" }
                }[record.auditStatus] || { word: "", color: "black" };
                return (
                  <div>
                    <span>{text}</span>
                    <span
                      style={{ backgroundColor: icon.color, color: "white", borderRadius: "4px" }}
                    >{icon.word}
                    </span>
                  </div>
                );
              },
              fixed: "left"
            },
            {
              title: "单价",
              render: (text, record) => {
                const { transportPriceEntities } = record;
                const transportPriceEntity = (transportPriceEntities || []).find(item => `${item.transportPriceType}` === `${accountOrgType}`) || {};
                return `${accountUnitPrice({ transportPriceEntity, ...record })._toFixed(2)}元`;
              }
            },
            {
              title: "数量",
              render: (text, record) => {
                const { transportPriceEntities } = record;
                const transportPriceEntity = transportPriceEntities.filter(item => item.transportPriceType === Number(accountOrgType));
                return transportPriceEntity?.[0].manualQuantity;
              }
            },
            {
              title: "数量取值",
              render: (text, record) => {
                const { transportPriceEntities } = record;
                const transportPriceEntity = transportPriceEntities.filter(item => item.transportPriceType === Number(accountOrgType));
                return ACCOUNT_BILL_NUMBER_RULE[transportPriceEntity?.[0]?.measurementSource]?.text;
              }
            },
            {
              title: "总运费（元）",
              render: (text, record) => {
                const {  transportPriceEntities } = record;
                const transportPriceEntity = (transportPriceEntities || []).find(item => `${item.transportPriceType}` === `${accountOrgType}`) || {};
                return `${accountTransportCost({ ...record, transportPriceEntity })._toFixed(2)}元`;
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
              title: "承运服务费(价差)(元)",
              visible : this.organizationType !== 4,
              render: (text, record) => {
                const { transportPriceEntities } = record;
                const transportPriceEntity = (transportPriceEntities || []).find(item => `${item.transportPriceType}` === `${accountOrgType}`) || {};
                return `${getShipmentDifferenceCharge(record, transportPriceEntity)._toFixed(2)}元`;
              }
            },
            {
              title: "服务费（元）",
              dataIndex: "serviceCharge",
              render : (text, record)=>{
                const { transportPriceEntities } = record;
                const transportPriceEntity = (transportPriceEntities || []).find(item => `${item.transportPriceType}` === `${accountOrgType}`) || {};
                return `${getServiceCharge(transportPriceEntity)._toFixed(2)}元`;
              }
            },
            {
              title: "货损赔付（元）",
              dataIndex: "damageCompensation",
              render: text => `${(text || 0)._toFixed(2)}元`
            },
            {
              title: "应付账款（元）",
              dataIndex: "receivables",
              render: (text, record) => {
                const { transportPriceEntities } = record;
                const transportPriceEntity = (transportPriceEntities || []).find(item => `${item.transportPriceType}` === `${accountOrgType}`) || {};
                const { accountInternalStatus } = this.state.accountData;
                return `${getNeedPay({ transportPriceEntity, accountInternalStatus }, record)._toFixed(2)}元`;
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
                const list = text.map((item) => (
                  <li
                    title={`${item.deliveryName}`}
                    className="test-ellipsis"
                    key={item.goodsId}
                  >{item.deliveryName}
                  </li>));
                return <ul style={{ padding: 0, margin: 0 }}>{list}</ul>;
              }
            },
            {
              title: "货品名称",
              dataIndex: "goodsName",
              render: (text, record) => {
                const list = record.deliveryItems.map((item) => (
                  <li
                    title={`${item.categoryName}${item.goodsName}`}
                    className="test-ellipsis"
                    key={item.goodsId}
                  >{`${item.categoryName}${item.goodsName}`}
                  </li>));
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
              title: "过磅量",
              render: (text, record) => {
                const list = record.deliveryItems.map((item) => {
                  const word = item.weighNum === null ? "--" : `${item.weighNum}${item.goodsUnitCN}`;
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
              render: (text, record) => {
                const list = record.deliveryItems.map((item) => {
                  const word = item.receivingNum === null ? "--" : `${item.receivingNum}${item.receivingUnitCN}`;
                  return <li title={`${word}`} className="test-ellipsis" key={item.goodsId}>{`${word}`}</li>;
                });

                return <ul style={{ padding: 0, margin: 0 }}>{list}</ul>;
              }
            },
            {
              title: "磅差比",
              dataIndex: "Pounddifference",
              render: (text, record) => {
                const list = record.deliveryItems.map((item) => {
                  const Pounddifference = (item.deliveryNum - item.receivingNum) * 1000 / (item.deliveryNum);
                  const word = Pounddifference.toFixed(1)._toFixed(1);
                  return <li
                    title={`${word}`}
                    style={{ color: word >= 3 ? "red" : "inherit" }}
                    className="test-ellipsis"
                    key={item.goodsId}
                  >{`${word}‰`}
                  </li>;
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
              dataIndex: "driverNameBank"
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
              title: "车组",
              dataIndex: "carGroupName",
              visible: this.organizationType === 5,
              render: (text) => {
                if (text) return text;
                return "暂无车组";
              }
            }
          ],
          operations: [
            {
              title: "详情",
              onClick: (record) => {
                router.push(`/buiness-center/transportList/transport/transportDetail?transportId=${record.transportId}`);
              }
            },
            {
              title: "调账",
              onClick: (record) => {
                const { transportPriceEntities } = record;
                const transportPriceEntity = (transportPriceEntities || []).find(item => `${item.transportPriceType}` === `${accountOrgType}`) || {};
                const {  damageCompensation, shipmentDifferenceCharge } = transportPriceEntity;
                const transportCost = accountTransportCost({ transportPriceEntity, ...record });
                const freightCost = accountUnitPrice({ transportPriceEntity, ...record });

                this.setState({
                  accountModal: true,
                  adjustData: record,
                  accountEntity: {
                    freightCost,
                    transportCost,
                    damageCompensation,
                    shipmentDifferenceCharge
                  }
                });
              },
              auth: () => data.accountInternalStatus === 0
            },
            {
              title: "移除",
              confirmMessage: () => `你是否确认将该运单从对账单中移除？`,
              auth : ()=> !this.shipmentUnaudited,

              onClick: (record) => {
                const { transportId } = record;
                const {
                  accountDetailItems: _accountDetailItems,
                  paymentDaysStart,
                  paymentDaysEnd
                } = this.state.accountData;
                const newData = _accountDetailItems.filter(item => item.transportId !== transportId);
                const accountDetailItems = newData.map(item => ({
                  transportId: item.transportId
                }));
                modifyTransportAccount({
                  accountTransportId,
                  paymentDaysStart: moment(paymentDaysStart),
                  paymentDaysEnd: moment(paymentDaysEnd),
                  accountDetailItems
                })
                  .then(()=>getTransportAccountDetail({ accountTransportId }))
                  .then((data) => {
                    this.setState({ accountData : data });
                    this.getMiniTransportList();
                    return getTransportList(this.filter);

                  })
                  .then(({ items, count }) => {

                    notification.success({
                      message: "移除成功",
                      description: "移除运单成功"
                    });

                    this.props.resetFilter();
                    this.refreshSelectRow([record]);

                    this.setState({
                      transports: {
                        items,
                        count
                      }
                    });
                  });

              }
            }
          ]
        };


        this.setState({ tableSchema, accountData: data });
        if (this.organizationType === 5) return getAccountCarReminds({ accountTransportId });
        return { items: [] };
      })
      .then(data => {
        const { items } = data;
        const changeItem = uniqBy(items, "carNo");
        changeItem.forEach(item => {
          notification.warn({
            message: `车牌号 ${item.carNo} `,
            description: "所在车组发生变动"
          });
        });
      })
      .then(() => {
        getTransportList(this.filter)
          .then(({ items, count }) => {
            this.setState({
              nowPage,
              pageSize,
              selectedRow: [],
              transports: {
                items,
                count
              },
              submitModal: action === "submit",
              ready: true
            });
          });
      });
  }


  componentWillUnmount() {
    // 页面销毁的时候自己 先移除原有的 再存储最新的
    const formData = this.form ? this.form.getFieldsValue() : null;
    localStorage.removeItem(this.currentTab.id);
    if (getLocal("local_commonStore_tabsObj").tabs.length > 1) {
      localStorage.setItem(this.currentTab.id, JSON.stringify({
        formData,
        nowPage: this.state.nowPage,
        pageSize: this.state.pageSize
      }));
    }
  }

  getMiniTransportList = (newFilter) => {
    /*
    * 选择所有页思路：
    * 将选择的数组（全部，简易）和本页展示的数组（一页，完整）区分开来，
    * 每当修改选中时，先更改选择的数组，后更改本页展示的数组
    * 每次修改选择状态时，更新selectRow属性，以接轨原先的代码逻辑
    * */
    const params = newFilter || this.initFilter;

    this.setState({ miniTransportReady: false });
    getTransportsSelectIdType({ ...params, limit: 100000, backListToGoodsAccount: true }).then(({ items }) => {
      const transportTotal = items.map(item => ({ ...item, selected: false }));
      const selectedRow = transportTotal.filter(item => item.selected);

      this.setState({ transportTotal, selectedRow, miniTransportReady: true });
    });
  };

  // 修改当前页面详细数据的数组
  onModifyCurrentPageAndDelivery = () => {
    const { transportTotal, transports, transports: { items: transportItems } } = this.state;
    let selectOnePageChecked = true;

    transportItems && transportItems.forEach((item, key) => {

      const matchItem = transportTotal.find(_item => _item.transportId === item.transportId);
      if (matchItem) item.selected = matchItem.selected;

      // 联动全选按钮展示状态
      if (!transportItems[key].selected) selectOnePageChecked = false;
    });

    if (!transportItems || !transportItems.length) selectOnePageChecked = false;

    const selectedRow = transportTotal.filter(item => item.selected);
    this.setState({ transports, selectOnePageChecked, selectedRow });
  };

  onChange = (pagination) => {
    const { offset, limit, current } = translatePageType(pagination);

    const { transportTotal } = this.state;
    let selectOnePageChecked = true;

    this.setState({
      nowPage: current,
      pageSize: limit
    });

    const newFilter = this.props.setFilter({ ...this.filter, offset, limit });
    // const newFilter = this.props.setFilter({ offset, limit, ...this.props.condition })

    getTransportList(newFilter)
      .then(({ items: transportItems, count }) => {

        transportItems && transportItems.forEach((item) => {
          const matchItem = transportTotal.find(_item => _item.transportId === item.transportId);
          if (matchItem) item.selected = matchItem.selected;

          // 联动全选按钮展示状态
          if (!item.selected) selectOnePageChecked = false;
        });

        this.setState({
          transports: {
            items: transportItems,
            count
          },
          selectOnePageChecked
        });
      });
  };

  searchTableList = () => {
    const layout = {
      labelCol: {
        xs: { span: 24 },
        sm: { span: 8 },
        xl: { span: 6 }
      },
      wrapperCol: {
        xs: { span: 24 },
        sm: { span: 16 },
        xl: { span: 18 }
      }
    };

    const handleSearchBtnClick = (formData) => {
      const { location: { query: { accountTransportNo, accountOrgType } } } = this.props;
      const receivingStartTime = formData && formData.receivingTime && formData.receivingTime.length ? moment(formData.receivingTime?.[0]).startOf("day").format("YYYY/MM/DD HH:mm:ss") : undefined;
      const receivingEndTime = formData && formData.receivingTime && formData.receivingTime.length ? moment(formData.receivingTime?.[1]).endOf("day").format("YYYY/MM/DD HH:mm:ss") : undefined;
      const deliveryStartTime = formData && formData.deliveryTime && formData.deliveryTime.length ? moment(formData.deliveryTime?.[0]).startOf("day").format("YYYY/MM/DD HH:mm:ss") : undefined;
      const deliveryEndTime = formData && formData.deliveryTime && formData.deliveryTime.length ? moment(formData.deliveryTime?.[1]).endOf("day").format("YYYY/MM/DD HH:mm:ss") : undefined;
      const {
        goodsName,
        deliveryName,
        receivingName,
        packagingMethod,
        specificationType,
        materialQuality,
        driverUserName,
        plateNumber,
        receivingNo,
        carGroupId
      } = formData;
      const newFilter = this.props.setFilter({
        carGroupId,
        deliveryStartTime,
        deliveryEndTime,
        receivingNo,
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
        accountTransportNo,
        isSelectAccount: true,
        transportPriceType: accountOrgType
      });
      // this.filter =
      const params = omit(newFilter, ["receivingTime", "deliveryTime"]);
      getTransportList(params)
        .then(({ items, count }) => {
          this.tableRef.current.resetSelectedRows([]);
          this.setState({
            nowPage: 1,
            selectedRow: [],
            transports: {
              items,
              count
            }
          }, () => {
            localStorage.setItem(this.currentTab.id, JSON.stringify({
              formData,
              nowPage: 1,
              pageSize: 10
            }));
            this.getMiniTransportList(params);
          });
        });
    };

    const handleResetBtnClick = () => {

      localStorage.setItem(this.currentTab.id, JSON.stringify({ formData: {} }));
      this.getMiniTransportList();
      const params = this.resetInitFilter();

      getTransportList(params).then(({ items = [], count }) => {
        this.setState({
          nowPage: 1,
          pageSize: 10,
          selectedRow: [],
          transports: {
            items: items && items.length && items.map((item = {}) => ({ ...item, selected: false })),
            count
          },
          selectOnePageChecked: false
        });
      });
    };

    const { toggle } = this.state;
    const { accountInternalStatus } = this.state.accountData;

    return (
      <SearchForm
        className="goodsAccountSearchList"
        layout="inline"
        {...layout}
        mode={FORM_MODE.SEARCH}
        schema={this.searchSchema}
      >
        <div className={!toggle ? "searchList" : "searchList auto"}>
          <Item field="goodsName" />
          <Item field="transportNo" />
          <Item field="driverUserName" />
          <Item field="plateNumber" />
          {this.organizationType === 5 && <Item field="carGroupId" />}
          <Item field="receivingNo" />
          <Item field="deliveryName" />
          <Item field="receivingName" />
          <Item field="packagingMethod" />
          <Item field="specificationType" />
          <Item field="materialQuality" />
          <Item field="shipmentOrganizationName" />
          <Item field="accountTransportNo" />
          <Item field="deliveryTime" />
          <Item field="receivingTime" />
          <div onClick={this.changeToggle} className="toggle">
            {
              !toggle ?
                <span>展开 <Icon type="down" /></span>
                :
                <span>缩起 <Icon type="up" /></span>
            }
          </div>
        </div>
        <div style={{ textAlign: "right" }}>
          <div style={{ display: "inline-block", float: "left", margin: "1rem 0" }}>
            <DebounceFormButton label="查询" className="mr-10" type="primary" onClick={handleSearchBtnClick} />
            <Button className="mr-10" onClick={handleResetBtnClick}>重置</Button>
          </div>
          <div style={{ display: "inline-block", margin: "1rem 0" }}>
            {!this.shipmentUnaudited &&  <Button className="mr-10" onClick={this.addTransport}>添加运单</Button>}
            {!this.shipmentUnaudited &&  <Button className="mr-10" onClick={this.deleteTransport}>移除运单</Button>}
            {accountInternalStatus === 0 &&
            <Button type="primary" onClick={this.handleBatchAccountBtnClick}>批量调账</Button>}
          </div>
        </div>
        <AuditStatusField ref={this.auditStatusRef} auditStatusChange={this.auditStatusChange} />
      </SearchForm>
    );
  };

  auditStatusChange = (checkedValue) => {
    let auditStatus = checkedValue.join(",");
    if (!checkedValue[0]) {
      auditStatus = undefined;
    }
    const newFilter = this.props.setFilter({ auditStatus, offset: 0 });
    getTransportList({ ...newFilter })
      .then(({ items, count }) => {

        this.tableRef.current.resetSelectedRows([]);
        this.setState({
          selectedRow: [],
          nowPage: 1,
          transports: {
            items,
            count
          }
        });
      });
  };

  changeToggle = () => {
    const { toggle } = this.state;
    this.setState({
      toggle: !toggle
    });
  };

  handleCancelAdjustModal = () => {
    this.setState({
      accountModal: false,
      batchAccountModal: false
    });
  };

  resetInitFilter = (params) =>{
    this.props.resetFilter();
    this.tableRef.current.resetSelectedRows([]);
    this.auditStatusRef.current.resetValue();
    return { ...this.initFilter, ...params };
  }

  refreshSelectRow = (changedArray, type = "delete") => {
    const { selectedRow } = this.state;
    let newSelectRow = [];
    if (type === "delete") {
      newSelectRow = selectedRow.filter(item => {
        const { transportId } = item;
        return changedArray.findIndex(_item => _item.transportId === transportId) < 0;
      });
      this.tableRef.current.resetSelectedRows(newSelectRow);
      this.setState({
        selectedRow: newSelectRow
      });
    } else if (type === "adjust") {
      newSelectRow = [];
      this.tableRef.current.resetSelectedRows(newSelectRow);
      this.setState({
        selectedRow: newSelectRow
      });
    }
  };

  deleteTransport = () => {
    const { selectedRow } = this.state;
    if (!selectedRow.length) return message.error("请至少选择一条运单");
    const { location: { query: { accountTransportId } } } = this.props;
    const { accountDetailItems: _accountDetailItems, paymentDaysStart, paymentDaysEnd } = this.state.accountData;
    const leastData = xorBy(selectedRow, _accountDetailItems, "transportId");
    const accountDetailItems = leastData.map(item => ({
      transportId: item.transportId
    }));
    modifyTransportAccount({
      accountTransportId,
      paymentDaysStart: moment(paymentDaysStart),
      paymentDaysEnd: moment(paymentDaysEnd),
      accountDetailItems
    })
      .then(() => {
        this.getMiniTransportList();
        return getTransportList(this.filter);
      })
      .then(({ items, count }) => {
        notification.success({
          message: "移除成功",
          description: "移除运单成功"
        });
        this.props.resetFilter(this.initFilter);
        this.tableRef.current.resetSelectedRows([]);

        this.setState({
          selectedRow: [],
          transports: {
            items,
            count
          },
          selectOnePageChecked: false
        });
        return getTransportAccountDetail({ accountTransportId });
      })
      .then(data => {
        this.setState({ accountData: data });
        // this.accountData = data;
      });

  };

  accountChangeCallback = () => {
    const { location: { query: { accountTransportId } } } = this.props;

    this.handleCancelAdjustModal();
    const params = this.resetInitFilter();

    this.getMiniTransportList();
    getTransportList(params).then(({ items, count }) => {
      this.setState({
        nowPage: 1,
        pageSize: 10,
        selectedRow: [],
        transports: {
          items: items.map(item => ({ ...item, selected: false })),
          count
        },
        selectOnePageChecked: false,
        batchAccountModal: false
      });
    });

    getTransportAccountDetail({ accountTransportId }).then(data => {
      this.setState({ accountData: data });
    });
  };

  handleBatchAccountBtnClick = () => {
    const { selectedRow } = this.state;
    if (!selectedRow.length) return message.error("请至少选择一条运单");
    this.setState({
      batchAccountModal: true
    });
  };

  addTransport = () => {
    const { location: { query: { accountOrgType, accountTransportId } } } = this.props;
    router.push({
      pathname: "addTransportAccountBill", query: {
        accountOrgType,
        accountTransportId,
        type: "add"
      }
    });
  };

  cancelSubmit = () => {
    this.setState({
      submitModal: false
    });
  };

  renderPageHeader = () => {
    const {
      accountTransportNo,
      projectName,
      accountDetailItems,
      accountInternalStatus,
    } = this.state.accountData;
    const { transportTotal } = this.state;

    const payedFreight = transportTotal.reduce((sum, current)=>{
      sum += getNeedPay({ transportPriceEntity : current, accountInternalStatus }, current);
      return sum;
    }, 0);

    return (
      <div styleName="container_top">
        <div>
          <p>{accountTransportNo}</p>
          <p>对账单号</p>
        </div>
        <div styleName="projectName">
          <p>{projectName}</p>
          <p>项目名称</p>
        </div>
        <div>
          <p>{accountDetailItems?.length || 0}</p>
          <p>总单数</p>
        </div>
        <div>
          <p>￥{formatMoney(payedFreight._toFixed(2))}</p>
          <p>
            <span>应付总金额</span>
          </p>
        </div>
      </div>
    );
  };

  isExistZero = () => {
    const { accountDetailItems } = this.state.accountData;
    const zeroArr = accountDetailItems.filter(item => !item.transportCost);
    return zeroArr.length > 0 ?
      (
        <>
          <p styleName="red">*以下是对账单中金额为 0.00 的运单</p>
          <p>总单数：{zeroArr.length}</p>
          <div styleName="zeroTrans">
            <span>运单号：</span>
            <ul>
              {zeroArr.map(item => <li key={item.transportId}>{item.transportNo}</li>)}
            </ul>
          </div>
        </>
      )
      :
      null;
  };

  handleSubmit = () => {
    this.setState({
      submitModal: true
    });
  };


  calcGoods = () => {
    const { accountDetailItems } = this.state.accountData;
    const { location: { query: { accountOrgType } } } = this.props;
    // accountDetailItems : 运单列表
    const deliveryItems = accountDetailItems.map(item=>{
      const { transportPriceEntities, deliveryItems } = item;
      const transportPriceEntity = (transportPriceEntities || []).find(item => `${item.transportPriceType}` === `${accountOrgType}`) || {};
      const transportCost = accountTransportCost({ ...item, transportPriceEntity });
      const averageCost = transportCost / deliveryItems.length;
      deliveryItems.forEach(_item=>{
        _item.averageCost = averageCost;
      });
      return deliveryItems;
    });

    const goodsArr = flattenDeep(deliveryItems).map(item => ({
      ...item,
      num : item.chargedWeight,
      orderNum: 1
    }));

    const totalGoodsArr = classifyGoodsWeight(goodsArr, "goodsId", ["goodsId", "categoryName", "goodsName", "orderNum", "num", "deliveryUnitCN", "freightTotal", "averageCost"], (summary, current) => {
      summary.num += current.num;
      summary.orderNum += current.orderNum;
      summary.averageCost += current.averageCost;
    });
    return totalGoodsArr;
  };

  submitAccount = () => {
    const {
      location: { query: { accountTransportId } },
      match: { path },
      commonStore,
      deleteTab,
      commonStore: { tabs, activeKey }
    } = this.props;
    modifyTransportAccount({
      accountTransportId,
      accountStatus: 1
    }).then(data => {
      this.cancelSubmit();
      // 清除当前缓存并关闭tab
      const dele = tabs.find(item => item.id === activeKey);
      deleteTab(commonStore, { id: dele.id });
      notification.success({
        message: "提交审核成功",
        description: "对账单提交审核成功"
      });

      const { resultMessage } = data;
      if (resultMessage){
        message.warn(resultMessage, 1 ).then(()=> routerGoBack(path));
      } else {
        routerGoBack(path);
      }

    });
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
    const { transportTotal, nowPage, pageSize } = this.state;

    if (selected) {
      for (let i = (nowPage - 1) * pageSize; i < nowPage * pageSize && i < transportTotal.length; i++) {
        transportTotal[i].selected = true;
      }
    } else {
      for (let i = (nowPage - 1) * pageSize; i < nowPage * pageSize && i < transportTotal.length; i++) {
        transportTotal[i].selected = false;
      }
    }

    this.setState({ transportTotal }, () => {
      this.onModifyCurrentPageAndDelivery();
    });
  };

  // 选择全部页
  onSelectTotal = (selected) => {
    if (selected) {
      const { transportTotal: _transportTotal } = this.state;
      // 1. 修改总数组
      const transportTotal = _transportTotal.map(item => ({ ...item, selected: true }));
      this.setState({ transportTotal }, () => {
        this.onModifyCurrentPageAndDelivery();
      });
    } else {
      const { transportTotal: _transportTotal } = this.state;
      // 1. 修改总数组
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

  render() {
    const {
      nowPage,
      pageSize,
      transports,
      tableSchema,
      ready,
      accountModal,
      batchAccountModal,
      selectedRow,
      accountEntity,
      submitModal,
      selectOnePageChecked,
      miniTransportReady,
      adjustData
    } = this.state;

    const { location: { query: { accountOrgType, accountTransportId } } } = this.props;

    return (ready &&
      <>
        {/* {(ready && miniTransportReady) ? this.renderPageHeader() : null} */}
        {this.renderPageHeader()}
        <Modal
          title={accountModal ? "调账" : "批量调账"}
          width={800}
          maskClosable={false}
          visible={accountModal || batchAccountModal}
          footer={null}
          destroyOnClose
          onCancel={this.handleCancelAdjustModal}
        >
          <AdjustForm
            handleCancelAccount={this.handleCancelAdjustModal}
            accountEntity={accountEntity}
            adjustData={adjustData}
            batchAccountModal={batchAccountModal}
            selectedRow={selectedRow}
            accountTransportId={accountTransportId}
            accountOrgType={accountOrgType}
            accountChangeCallback={this.accountChangeCallback}
            shipmentUnaudited={this.shipmentUnaudited}
          />
        </Modal>

        <Modal
          title="确认提交"
          width={800}
          maskClosable={false}
          visible={submitModal}
          destroyOnClose
          onCancel={this.cancelSubmit}
          onOk={this.submitAccount}
        >
          {ready &&
          <>
            {this.renderPageHeader()}
            <div styleName="submit_container">
              <AntTable key="goodsId" columns={this.modalColumns} pagination={false} dataSource={this.calcGoods()} />
              <div style={{ marginTop: "15px" }}>货损：{this.state.accountData.damageCompensation}元</div>
              {this.isExistZero()}
            </div>
          </>
          }
        </Modal>

        <SelectAllPageTable
          ref={this.tableRef}
          rowKey="transportId"
          selectOnePageChecked={selectOnePageChecked}
          onSelectRow={this.onSelectRow}
          onSelectOnePage={this.onSelectOnePage}
          onSelectTotal={this.onSelectTotal}
          getCheckboxProps={this.getCheckboxProps}
          renderCommonOperate={this.searchTableList}
          multipleSelect
          loading={!(ready && miniTransportReady)}
          pagination={{ current: nowPage, pageSize }}
          onChange={this.onChange}
          schema={tableSchema}
          dataSource={transports}
        />

        {!this.shipmentUnaudited && <Button type="primary" style={{ float: "right" }} onClick={this.handleSubmit}>提交审核</Button>}
      </>
    );
  }
}

export default AccountChange;
