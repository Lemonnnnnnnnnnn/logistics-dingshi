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
    this.shipmentUnaudited = Number(accountStatus) === TRANSPORT_ACCOUNT_LIST_STATUS.SHIPMENT_UNAUDITED; // ?????????????????????????????????????????????
    this.modalColumns = [
      {
        title: "??????",
        dataIndex: "name",
        render: (text, record) => `${record.categoryName}${record.goodsName}`
      },
      {
        title: "??????",
        dataIndex: "orderNum"
      },
      {
        title: "?????????",
        dataIndex: "num",
        render: (text, record) => `${(record.num || 0)._toFixed(2)}${record.deliveryUnitCN}`
      },
      {
        title: "???????????????",
        dataIndex: "averageCost",
        render: (text) => `${text.toFixed(2)._toFixed(2)}???`
      }
    ];
    this.searchSchema = {
      receivingTime: {
        label: "????????????",
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
        label: "?????????",
        component: "input",
        placeholder: "??????????????????"
      },
      receivingNo: {
        label: "????????????",
        component: "input",
        placeholder: "?????????????????????"
      },
      shipmentOrganizationName: {
        label: "?????????",
        component: "input",
        placeholder: "??????????????????"
      },
      carGroupId: {
        label: "??????",
        component: CarGroupField,
        visible: getUserInfo().organizationType === 5
      },
      goodsName: {
        label: "????????????",
        placeholder: "?????????????????????",
        component: "input"
      },
      deliveryTime: {
        label: "????????????",
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
        label: "?????????",
        placeholder: "??????????????????",
        component: "input"
      },
      receivingName: {
        label: "?????????",
        placeholder: "??????????????????",
        component: "input"
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
              title: "?????????",
              dataIndex: "transportNo",
              render: (text, record) => {
                const icon = {
                  1: { word: "???", color: "blue" },
                  2: { word: "???", color: "red" },
                  3: { word: "???", color: "orange" }
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
              title: "??????",
              render: (text, record) => {
                const { transportPriceEntities } = record;
                const transportPriceEntity = (transportPriceEntities || []).find(item => `${item.transportPriceType}` === `${accountOrgType}`) || {};
                return `${accountUnitPrice({ transportPriceEntity, ...record })._toFixed(2)}???`;
              }
            },
            {
              title: "??????",
              render: (text, record) => {
                const { transportPriceEntities } = record;
                const transportPriceEntity = transportPriceEntities.filter(item => item.transportPriceType === Number(accountOrgType));
                return transportPriceEntity?.[0].manualQuantity;
              }
            },
            {
              title: "????????????",
              render: (text, record) => {
                const { transportPriceEntities } = record;
                const transportPriceEntity = transportPriceEntities.filter(item => item.transportPriceType === Number(accountOrgType));
                return ACCOUNT_BILL_NUMBER_RULE[transportPriceEntity?.[0]?.measurementSource]?.text;
              }
            },
            {
              title: "??????????????????",
              render: (text, record) => {
                const {  transportPriceEntities } = record;
                const transportPriceEntity = (transportPriceEntities || []).find(item => `${item.transportPriceType}` === `${accountOrgType}`) || {};
                return `${accountTransportCost({ ...record, transportPriceEntity })._toFixed(2)}???`;
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
              title: "??????????????????",
              dataIndex: "serviceCharge",
              render : (text, record)=>{
                const { transportPriceEntities } = record;
                const transportPriceEntity = (transportPriceEntities || []).find(item => `${item.transportPriceType}` === `${accountOrgType}`) || {};
                return `${getServiceCharge(transportPriceEntity)._toFixed(2)}???`;
              }
            },
            {
              title: "?????????????????????",
              dataIndex: "damageCompensation",
              render: text => `${(text || 0)._toFixed(2)}???`
            },
            {
              title: "?????????????????????",
              dataIndex: "receivables",
              render: (text, record) => {
                const { transportPriceEntities } = record;
                const transportPriceEntity = (transportPriceEntities || []).find(item => `${item.transportPriceType}` === `${accountOrgType}`) || {};
                const { accountInternalStatus } = this.state.accountData;
                return `${getNeedPay({ transportPriceEntity, accountInternalStatus }, record)._toFixed(2)}???`;
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
              title: "????????????",
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
              render: (text, record) => {
                const list = record.deliveryItems.map((item) => {
                  const word = item.weighNum === null ? "--" : `${item.weighNum}${item.goodsUnitCN}`;
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
              render: (text, record) => {
                const list = record.deliveryItems.map((item) => {
                  const word = item.receivingNum === null ? "--" : `${item.receivingNum}${item.receivingUnitCN}`;
                  return <li title={`${word}`} className="test-ellipsis" key={item.goodsId}>{`${word}`}</li>;
                });

                return <ul style={{ padding: 0, margin: 0 }}>{list}</ul>;
              }
            },
            {
              title: "?????????",
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
                  >{`${word}???`}
                  </li>;
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
              dataIndex: "driverNameBank"
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
              title: "??????",
              dataIndex: "carGroupName",
              visible: this.organizationType === 5,
              render: (text) => {
                if (text) return text;
                return "????????????";
              }
            }
          ],
          operations: [
            {
              title: "??????",
              onClick: (record) => {
                router.push(`/buiness-center/transportList/transport/transportDetail?transportId=${record.transportId}`);
              }
            },
            {
              title: "??????",
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
              title: "??????",
              confirmMessage: () => `???????????????????????????????????????????????????`,
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
                      message: "????????????",
                      description: "??????????????????"
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
            message: `????????? ${item.carNo} `,
            description: "????????????????????????"
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
    // ??????????????????????????? ?????????????????? ??????????????????
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
    * ????????????????????????
    * ???????????????????????????????????????????????????????????????????????????????????????????????????
    * ?????????????????????????????????????????????????????????????????????????????????
    * ????????????????????????????????????selectRow???????????????????????????????????????
    * */
    const params = newFilter || this.initFilter;

    this.setState({ miniTransportReady: false });
    getTransportsSelectIdType({ ...params, limit: 100000, backListToGoodsAccount: true }).then(({ items }) => {
      const transportTotal = items.map(item => ({ ...item, selected: false }));
      const selectedRow = transportTotal.filter(item => item.selected);

      this.setState({ transportTotal, selectedRow, miniTransportReady: true });
    });
  };

  // ???????????????????????????????????????
  onModifyCurrentPageAndDelivery = () => {
    const { transportTotal, transports, transports: { items: transportItems } } = this.state;
    let selectOnePageChecked = true;

    transportItems && transportItems.forEach((item, key) => {

      const matchItem = transportTotal.find(_item => _item.transportId === item.transportId);
      if (matchItem) item.selected = matchItem.selected;

      // ??????????????????????????????
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

          // ??????????????????????????????
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
                <span>?????? <Icon type="down" /></span>
                :
                <span>?????? <Icon type="up" /></span>
            }
          </div>
        </div>
        <div style={{ textAlign: "right" }}>
          <div style={{ display: "inline-block", float: "left", margin: "1rem 0" }}>
            <DebounceFormButton label="??????" className="mr-10" type="primary" onClick={handleSearchBtnClick} />
            <Button className="mr-10" onClick={handleResetBtnClick}>??????</Button>
          </div>
          <div style={{ display: "inline-block", margin: "1rem 0" }}>
            {!this.shipmentUnaudited &&  <Button className="mr-10" onClick={this.addTransport}>????????????</Button>}
            {!this.shipmentUnaudited &&  <Button className="mr-10" onClick={this.deleteTransport}>????????????</Button>}
            {accountInternalStatus === 0 &&
            <Button type="primary" onClick={this.handleBatchAccountBtnClick}>????????????</Button>}
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
    if (!selectedRow.length) return message.error("???????????????????????????");
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
          message: "????????????",
          description: "??????????????????"
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
    if (!selectedRow.length) return message.error("???????????????????????????");
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
          <p>????????????</p>
        </div>
        <div styleName="projectName">
          <p>{projectName}</p>
          <p>????????????</p>
        </div>
        <div>
          <p>{accountDetailItems?.length || 0}</p>
          <p>?????????</p>
        </div>
        <div>
          <p>???{formatMoney(payedFreight._toFixed(2))}</p>
          <p>
            <span>???????????????</span>
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
          <p styleName="red">*?????????????????????????????? 0.00 ?????????</p>
          <p>????????????{zeroArr.length}</p>
          <div styleName="zeroTrans">
            <span>????????????</span>
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
    // accountDetailItems : ????????????
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
      // ???????????????????????????tab
      const dele = tabs.find(item => item.id === activeKey);
      deleteTab(commonStore, { id: dele.id });
      notification.success({
        message: "??????????????????",
        description: "???????????????????????????"
      });

      const { resultMessage } = data;
      if (resultMessage){
        message.warn(resultMessage, 1 ).then(()=> routerGoBack(path));
      } else {
        routerGoBack(path);
      }

    });
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

  // ???????????????
  onSelectTotal = (selected) => {
    if (selected) {
      const { transportTotal: _transportTotal } = this.state;
      // 1. ???????????????
      const transportTotal = _transportTotal.map(item => ({ ...item, selected: true }));
      this.setState({ transportTotal }, () => {
        this.onModifyCurrentPageAndDelivery();
      });
    } else {
      const { transportTotal: _transportTotal } = this.state;
      // 1. ???????????????
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
          title={accountModal ? "??????" : "????????????"}
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
          title="????????????"
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
              <div style={{ marginTop: "15px" }}>?????????{this.state.accountData.damageCompensation}???</div>
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

        {!this.shipmentUnaudited && <Button type="primary" style={{ float: "right" }} onClick={this.handleSubmit}>????????????</Button>}
      </>
    );
  }
}

export default AccountChange;
