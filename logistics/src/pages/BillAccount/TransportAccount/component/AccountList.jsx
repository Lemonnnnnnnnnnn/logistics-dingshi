import React, { Component } from "react";
import { Button, notification, message, Modal, Select, Row, Col, Spin } from "antd";
import router from "umi/router";
import { Item, FORM_MODE, Observer } from "@gem-mine/antd-schema-form";
import { connect } from "dva";
import moment from "moment";
import DebounceFormButton from "../../../../components/DebounceFormButton";
import TableContainer from "@/components/Table/TableContainer";

import {
  pick,
  translatePageType,
  routerToExportPage,
  getLocal,
  isEmpty,
  omit,
  formatMoney
} from "../../../../utils/utils";
import Authorized from "../../../../utils/Authorized";
import { getTransportAccountStatus } from "@/services/project";
import Table from "../../../../components/Table/Table";
import { TRANSPORT_ACCOUNT_LIST_STATUS } from "@/constants/project/project";
import accountModel from "../../../../models/transportAccount";
import auditAccountModel from "../../../../models/auditTransportAccount";
import SearchForm from "../../../../components/Table/SearchForm2";
import { getUserInfo } from "@/services/user";
import {
  sendAccountTransportListExcelPost,
  sendAccountTransportExcelPost,
  accountTransportRecall
} from "@/services/apiService";
import "@gem-mine/antd-schema-form/lib/fields";
import {
  ACCOUNT_SOURCE_DIST,
  SHIPMENT_TO_CONSIGNMENT,
  SHIPMENT_TO_PLAT,
  CONSIGNMENT_TO_PLAT,
  SUBORDINATE_SHIPMENT_TO_CONSIGNMENT_INSTEAD_OF_PLAT,
  SHIPMENT_TO_CONSIGNMENT_INSTEAD_OF_PLAT,
  SUPERIOR_SHIPMENT, PAY_STATUS_DIST,
} from "@/constants/account";
import CreateAccountModal from "./CreateAccountModal";
import {
  accountCost,
  getServiceCharge,
  getShipmentDifferenceCharge,
  getShipmentServiceCharge,
  getNeedPay,
  judgeShipmentType
} from "@/utils/account";

const { actions: { getTransportAccount, patchTransportAccount } } = accountModel;
const { actions: { patchAuditTransportAccount } } = auditAccountModel;

function mapStateToProps(state) {
  return {
    commonStore: state.commonStore,
    transportAccount: pick(state.transportAccount, ["items", "count"])
  };
}

@connect(mapStateToProps, { getTransportAccount, patchTransportAccount, patchAuditTransportAccount })
@TableContainer()
class AccountList extends Component {
  currentTab = this.props.commonStore.tabs.find(item => item.id === this.props.commonStore.activeKey);

  localData = getLocal(this.currentTab.id) ||
    {
      formData: { unaduitedPage: {}, otherPage: {} }
    };

  form = null;

  state = {
    nowPage: 1,
    pageSize: 10,
    selectedRow: [],
    showCreateAccountModal: false
  };

  organizationType = getUserInfo().organizationType;

  organizationId = getUserInfo().organizationId;

  constructor(props) {
    super(props);
    const { unaudited } = props;
    const tableSchema = {
      variable: true,
      minWidth: this.organizationType === 1 ? 3500 : 3100,
      columns: [
        {
          title: "状态",
          dataIndex: "accountStatus",
          render: (text) => {
            const config = getTransportAccountStatus(text);
            return (
              <span style={{ color: config.color }}>{config.word}</span>
            );
          },
          // width:150,
          fixed: "left"
        },
        {
          title: "对账单号",
          dataIndex: "accountTransportNo",
          // width:200,
          fixed: "left",
          render: (text, record) => {
            const { iconStatus } = record;
            return (
              <div
                title={text}
                style={{
                  width: "200px",
                  display: "inline-block",
                  whiteSpace: "nowrap",
                  overflow: "hidden",
                  textOverflow: "ellipsis"
                }}
              >
                {text}
                {`${iconStatus}` === "1" &&
                <span style={{ color: "white", backgroundColor: "blue", borderRadius: "4px" }}>改</span>}
              </div>
            );
          }
        },
        {
          title: "支付状态",
          dataIndex: "payAccountStatus",
          fixed: "left",
          render: text => <div style={{ color: PAY_STATUS_DIST[text]?.color }}>{PAY_STATUS_DIST[text]?.text}</div>
        },
        {
          title: "开票状态",
          fixed: "left",
          dataIndex: "invoiceStatus",
          render: (text) => {
            const dist = {
              0: "未开票",
              1: "开票中",
              2: "已开票"
            };
            return <div>{dist[text]}</div>;
          }
        },
        {
          title: "项目名称",
          dataIndex: "projectName",
          render: (text, record) =>
            <a
              title={text}
              style={{
                width: "200px",
                display: "inline-block",
                whiteSpace: "nowrap",
                overflow: "hidden",
                textOverflow: "ellipsis"
              }}
              onClick={() => this.toProject(record.projectId)}
            >{text}
            </a>,
          // width:250,
          fixed: "left"
        },
        {
          title: "账单类型",
          dataIndex: "accountType",
          organizationType: [1, 5],
          render: text => {
            if (!text) return "自营";
            // transportType: 运单类型(1.自营，2.网络货运)
            const config = ["自营", "网络货运"];
            return config[text - 1];
          }
        },
        {
          title: "创建时间",
          dataIndex: "createTime",
          render: (time) => moment(time).format("YYYY-MM-DD HH:mm:ss")
        },
        {
          title: "承运方",
          dataIndex: "shipmentName",
          organizationType: [1, 4],
          render: (text, record) => {
            if (record.accountType === 2) {
              return "鼎石智慧物流";
            }
            // return record.accountDetailItems?.[0]?.shipmentOrgName || "--";
            return text || '--';
          }
        },
        {
          title: "对账发起方",
          dataIndex: "createOrgName"
        },
        {
          title: "账单来源",
          render: (text, record) => {
            const { accountOrgType } = record;
            return ACCOUNT_SOURCE_DIST[accountOrgType];
          }
        },
        {
          title: "下级承运方",
          dataIndex: "subordinateShipmentName",
          organizationType: [5],
          render: text => text || "无"
        },
        {
          title: "总运费(元)",
          render: (text, record) => formatMoney((accountCost(record)._toFixed(2)))
        },
        {
          title: "货主手续费(元)",
          render: (text, record) => formatMoney((getServiceCharge(record)._toFixed(2)))
        },
        {
          title: "货损赔付(元)",
          dataIndex: "damageCompensation",
          render: text => formatMoney((text || 0)._toFixed(2))
        },
        {
          title: this.organizationType === 1 ? "应收总金额(元)" : "应付总金额(元)",
          render: (text, record) => formatMoney((getNeedPay(record)._toFixed(2)))
        },
        {
          title : '承运接单手续费（元）',
          organizationType: [1, 5],
          render : (text, record) =>formatMoney((getShipmentServiceCharge(record)._toFixed(2)))
        },
        {
          title: "承运服务费(价差)(元)",
          organizationType: [1, 5],
          render: (text, record) => formatMoney((getShipmentDifferenceCharge(record)._toFixed(2)))
        },
        {
          title: "司机运费(元)",
          dataIndex: "purchaseReceivables",
          organizationType: [1],
          render: text => formatMoney((text || 0)._toFixed(2))
        },
        {
          title: "司机接单手续费(元)",
          dataIndex: "driverServiceCharge",
          organizationType: [1],
          render: text => formatMoney((text || 0)._toFixed(2))
        },
        {
          title: "运单数",
          dataIndex: "transportNumber"
        },
        {
          title: "装车总量",
          dataIndex: "loadingNetWeight",
          render: (text) => <div style={{ whiteSpace: "normal", width: "400px" }}>{text}</div>
        },
        {
          title: "卸车总量",
          dataIndex: "unloadNetWeight",
          render: (text) => <div style={{ whiteSpace: "normal", width: "400px" }}>{text}</div>
        },
        {
          title: "账期",
          dataIndex: "paymentDays",
          render: (text, record) => `${moment(record.paymentDaysStart).format("YYYY-MM-DD")}~${moment(record.paymentDaysEnd).format("YYYY-MM-DD")}`
        },
        {
          title: "申请人",
          dataIndex: "createName"
        },
        {
          title: "审核人",
          dataIndex: "auditorName",
          render: text => {
            if (text === null) return "--";
            return text;
          }
        },
        {
          title: "审核时间",
          dataIndex: "auditTime",
          render: time => {
            if (time === null) return "--";
            return moment(time).format("YYYY-MM-DD HH:mm:ss");
          }
        },
        {
          title: "审核意见",
          dataIndex: "verifyReason",
          render: text => {
            if (text === null) return "--";
            return text;
          }
        }
      ],
      operations: record => {
        const {
          organizationId: rowOrganizationId,
          accountStatus: rowAccountStatus,
          createMode: rowCreateMode,
          accountOrgType
        } = record;
        const {
          detailAuth = ["hide"],
          adjustBillAuth = ["hide"],
          cancelAuth = ["hide"],
          createAuth = ["hide"],
          auditedAuth = ["hide"]
        } = this.props;
        const detail = {
          title: "详情",
          auth: [...detailAuth],
          onClick: () => {
            const { match: { path } } = this.props;
            router.push(`${path}transportAccountBillDetail?accountTransportId=${record.accountTransportId}&accountOrgType=${record.accountOrgType}`);
          }
        };

        const modify = {
          title: "调账",
          auth: [...adjustBillAuth],
          onClick: (record) => {
            const { match: { path } } = this.props;
            const { accountTransportNo, accountTransportId, accountOrgType, accountStatus } = record;

            router.push({
              pathname: `${path}modifyTransportAccountBill`,
              query: {
                accountTransportNo,
                accountTransportId,
                accountOrgType,
                accountStatus
              }
            });
          }
        };

        const cancel = {
          title: "作废",
          confirmMessage: () => `你确定要作废该对账单吗？`,
          auth: [...cancelAuth],
          onClick: () => {
            this.props.patchTransportAccount({
              accountTransportId: record.accountTransportId,
              accountStatus: TRANSPORT_ACCOUNT_LIST_STATUS.CANCEL
            })
              .then(result => {
                const newSelectedRow = this.refreshSelectRow(result);
                this.setState({
                  selectedRow: newSelectedRow
                });
                const params = { ...this.props.filter, ...this.props.searchCondition };
                return this.props.getTransportAccount(params);
              })
              .then(() => {
                notification.success({
                  message: "作废成功",
                  description: `对账单作废成功`
                });
              });
          }
        };

        const handle = {
          title: "提交审核",
          auth: [...createAuth],
          onClick: () => {
            const { match: { path } } = this.props;
            if (record.accountOrgType === String(SHIPMENT_TO_CONSIGNMENT)) {
              router.push(`${path}modifyTransportAccountBill?accountTransportNo=${record.accountTransportNo}&accountTransportId=${record.accountTransportId}&action=submit&accountOrgType=${record.accountOrgType}`);
            } else {
              router.push(`${path}modifyTransportAccountBill?accountTransportNo=${record.accountTransportNo}&accountTransportId=${record.accountTransportId}&action=submit&accountOrgType=${record.accountOrgType}&transportShipmentAccount=1`);
            }

          }
        };

        const audit = {
          title: "审核",
          auth: [...auditedAuth],
          onClick: () => {
            const { match: { path } } = this.props;
            router.push(`${path}transportAccountBillAudit?accountTransportId=${record.accountTransportId}&accountOrgType=${record.accountOrgType}`);
          }
        };

        const withdraw = {
          title: "撤回",
          onClick: (record) => {
            const { accountTransportId } = record;

            accountTransportRecall(accountTransportId)
              .then(() => {
                const params = { ...this.props.filter, ...this.props.searchCondition };
                return this.props.getTransportAccount(params);
              })
              .then(() => {
                notification.success({
                  message: "撤回成功",
                  description: `对账单撤回成功`
                });
              });
          }
        };
        // 撤回按钮展示条件： 1. 托运方 2. 对账发起者 3.非自动对账单 4. 待审核和已审核

        const withdrawPermission = this.organizationType === 4 && this.organizationId === rowOrganizationId && rowCreateMode !== 1;

        const unauditedBtnRender = () => {
          switch (this.organizationType) {
            case 1 : {
              if (accountOrgType === SUBORDINATE_SHIPMENT_TO_CONSIGNMENT_INSTEAD_OF_PLAT || accountOrgType === SHIPMENT_TO_CONSIGNMENT_INSTEAD_OF_PLAT) {
                return [detail];
              }
              return [detail, audit];
            }
            case 4 : {
              const btnList = [detail];
              if (this.organizationId === rowOrganizationId && rowCreateMode !== 1) {
                btnList.push(withdraw);
              }
              if (
                (Number(accountOrgType) === SHIPMENT_TO_CONSIGNMENT) ||
                (Number(accountOrgType) === SUBORDINATE_SHIPMENT_TO_CONSIGNMENT_INSTEAD_OF_PLAT) ||
                (Number(accountOrgType) === SHIPMENT_TO_CONSIGNMENT_INSTEAD_OF_PLAT)
              ) {
                btnList.push(audit);
              }
              return btnList;
            }
            case 5: {
              return [detail];
            }
            default :
              return [detail];
          }
        };
        const shipmentType = judgeShipmentType(record);

        const operations = {
          [TRANSPORT_ACCOUNT_LIST_STATUS.UNAUDITED]: unauditedBtnRender(),
          [TRANSPORT_ACCOUNT_LIST_STATUS.AUDITED]: withdrawPermission ? [detail, withdraw] : [detail],
          [TRANSPORT_ACCOUNT_LIST_STATUS.REFUSE]: this.organizationId !== rowOrganizationId ? [detail] : [detail, handle, modify, cancel],
          [TRANSPORT_ACCOUNT_LIST_STATUS.CANCEL]: [detail],
          [TRANSPORT_ACCOUNT_LIST_STATUS.NOT_HANDLE]: [detail, handle, modify, cancel],
          [TRANSPORT_ACCOUNT_LIST_STATUS.SHIPMENT_UNAUDITED]: shipmentType === SUPERIOR_SHIPMENT ? [detail, modify, audit] : [detail]
        };

        return operations[rowAccountStatus];
      }
    };

    const searchSchema = {
      shipmentOrgName: {
        label: "承运方",
        placeholder: "承运方",
        component: "input",
        visible: this.organizationType === 4,
        keepAlive: false
      },
      projectName: {
        label: "项目名称",
        placeholder: "请输入项目名称",
        component: "input"
      },
      createTime: {
        label: "账单日期",
        component: "rangePicker",
        observer: Observer({
          watch: "*localData",
          action: (itemValue, { form }) => {
            if (this.form !== form) {
              this.form = form;
            }
            return {};
          }
        }),
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
      createOrgName: {
        label: "对账发起方",
        component: "input",
        placeholder: "请输入对账发起方"
      },
      payAccountStatusArr: {
        label: "支付状态",
        component: "select",
        options: [
          {
            key: 1,
            value: 1,
            label: "未支付"
          },
          {
            key: 2,
            value: 2,
            label: "部分支付"
          },
          {
            key: 3,
            value: 3,
            label: "已支付"
          }
        ],
        placeholder: "请选择支付状态"
      },
      transportNo: {
        label: "运单号",
        component: "input",
        placeholder: "请输入运单号"
      },
      accountTransportNo: {
        label: "对账单号",
        component: "input",
        placeholder: "请输入对账单号"
      },
      invoiceStatus: {
        label: "开票状态",
        component: "select",
        placeholder: "请选择开票状态",
        options: [
          {
            key: 0,
            value: 0,
            label: "未开票"
          },
          {
            key: 1,
            value: 1,
            label: "开票中"
          },
          {
            key: 2,
            value: 2,
            label: "已开票"
          }
        ]
      },
      accountOrgTypeArr: {
        label: "账单来源",
        component: "select",
        placeholder: "请选择账单来源",
        options: [
          {
            label: "承运方",
            key: 0,
            value: `${SHIPMENT_TO_CONSIGNMENT},${SHIPMENT_TO_PLAT},${SHIPMENT_TO_CONSIGNMENT_INSTEAD_OF_PLAT}`
          },
          {
            label: "下级承运方",
            key: 1,
            value: `${SUBORDINATE_SHIPMENT_TO_CONSIGNMENT_INSTEAD_OF_PLAT}`
          },
          {
            label: "托运方",
            key: 2,
            value: `${CONSIGNMENT_TO_PLAT}`
          }
        ]
      }
    };
    if (!unaudited) {
      searchSchema.accountStatus = {
        label: "状态",
        allowClear: true,
        placeholder: "请选择状态",
        component: "select",
        options: [
          {
            label: "待审核",
            key: TRANSPORT_ACCOUNT_LIST_STATUS.UNAUDITED,
            value: TRANSPORT_ACCOUNT_LIST_STATUS.UNAUDITED
          },
          {
            label: "已通过",
            key: TRANSPORT_ACCOUNT_LIST_STATUS.AUDITED,
            value: TRANSPORT_ACCOUNT_LIST_STATUS.AUDITED
          },
          {
            label: "已拒绝",
            key: TRANSPORT_ACCOUNT_LIST_STATUS.REFUSE,
            value: TRANSPORT_ACCOUNT_LIST_STATUS.REFUSE
          },
          {
            label: "已作废",
            key: TRANSPORT_ACCOUNT_LIST_STATUS.CANCEL,
            value: TRANSPORT_ACCOUNT_LIST_STATUS.CANCEL
          },
          {
            label: "待提交",
            key: TRANSPORT_ACCOUNT_LIST_STATUS.NOT_HANDLE,
            value: TRANSPORT_ACCOUNT_LIST_STATUS.NOT_HANDLE
          }
        ]
      };
    }

    this.searchSchema = searchSchema;

    const columns = tableSchema.columns.filter(item => {
      if (item.organizationType) {
        return item.organizationType.indexOf(this.organizationType) > -1;
      }
      return true;
    });
    this.tableSchema = { ...tableSchema, columns };
  }

  componentDidMount() {
    const { localData = { formData: { unaduitedPage: {}, otherPage: {} } } } = this;
    const { unaudited } = this.props;
    const currentTabMsg = unaudited ? localData.formData.unaduitedPage : localData.formData.otherPage;
    const params = {
      ...this.props.searchCondition,
      ...currentTabMsg,
      createDateStart: currentTabMsg.createTime && currentTabMsg.createTime.length ? moment(currentTabMsg.createTime?.[0]).startOf("day").format("YYYY/MM/DD HH:mm:ss") : undefined,
      createDateEnd: currentTabMsg.createTime && currentTabMsg.createTime.length ? moment(currentTabMsg.createTime?.[1]).endOf("day").format("YYYY/MM/DD HH:mm:ss") : undefined,
      offset: currentTabMsg.nowPage ? currentTabMsg.pageSize * (currentTabMsg.nowPage - 1) : 0,
      limit: currentTabMsg.pageSize ? currentTabMsg.pageSize : 10,
      accountStatus : currentTabMsg.accountStatus === this.props.searchCondition.accountStatus ?  undefined : currentTabMsg.accountStatus,
      accountOrgTypeArr: currentTabMsg.accountOrgTypeArr === this.props.searchCondition.accountOrgTypeArr ?  undefined : currentTabMsg.accountOrgTypeArr
    };
    delete params.pageSize;
    delete params.nowPage;

    if (!isEmpty(currentTabMsg)) {
      this.props.setFilter(params);
    }

    this.props.getTransportAccount(omit({
      ...params,
      accountStatus:  currentTabMsg.accountStatus || this.props.searchCondition.accountStatus,
      accountOrgTypeArr:  currentTabMsg.accountOrgTypeArr || this.props.searchCondition.accountOrgTypeArr,
    }, "createTime"))
      .then(() => {
        this.setState({
          nowPage: currentTabMsg.nowPage || 1,
          pageSize: currentTabMsg.pageSize || 10,
          ready: true
        });
      });
  }


  componentWillUnmount() {
    const { unaudited } = this.props;

    // 页面销毁的时候自己 先移除原有的 再存储最新的
    const formData = this.form ? this.form.getFieldsValue() : null;
    localStorage.removeItem(this.currentTab.id);
    if (getLocal("local_commonStore_tabsObj").tabs.length > 1) {
      let unaduitedPage = {};
      let otherPage = {};
      if (unaudited) {
        unaduitedPage = { ...formData, pageSize: this.state.pageSize, nowPage: this.state.nowPage };
      } else {
        otherPage = { ...formData, pageSize: this.state.pageSize, nowPage: this.state.nowPage };
      }
      localStorage.setItem(this.currentTab.id, JSON.stringify({
        formData: { unaduitedPage, otherPage },
        activeKey: unaudited ? "0" : "1"
      }));
    }
  }

  onChange = (pagination) => {
    const { offset, limit, current } = translatePageType(pagination);
    this.setState({
      nowPage: current,
      pageSize: limit
    });
    const newFilter = { ...this.props.filter, ...this.props.searchCondition, offset, limit };
    const params = {
      ...newFilter,
      createDateStart: newFilter.createTime && newFilter.createTime.length ? moment(newFilter.createTime?.[0]).startOf("day").format("YYYY/MM/DD HH:mm:ss") : undefined,
      createDateEnd: newFilter.createTime && newFilter.createTime.length ? moment(newFilter.createTime?.[1]).endOf("day").format("YYYY/MM/DD HH:mm:ss") : undefined,
    };
    // const newFilter = this.props.setFilter({ ...this.props.searchCondition, ...this.props.filter, offset, limit,  });
    this.props.getTransportAccount(params);
  };


  toProject = projectId => {
    router.push(`/buiness-center/project/projectManagement/projectDetail?projectId=${projectId}`);
  };

  onSelectRow = (selectedRow) => {
    this.setState({
      selectedRow
    });
  };

  refreshSelectRow = (result = { items: [] }) => {
    const oldSelectedRow = [...this.state.selectedRow];
    const newSelectedRow = oldSelectedRow.map(item => {
      const newRow = result.items.find(_item => item.accountModel === _item.accountModel);
      if (newRow) {
        return newRow;
      }
      return item;
    });
    return newSelectedRow;
  };

  searchTableList = () => {
    const { unaudited } = this.props;
    const layout = {
      labelCol: {
        xs: { span: 24 },
        sm: { span: 9 },
        xl: { span: 7 }
      },
      wrapperCol: {
        xs: { span: 24 },
        sm: { span: 15 },
        xl: { span: 17 }
      }
    };
    const { excelExportAuth = ["hide"], transportExportAuth = ["hide"] } = this.props;

    return (
      <SearchForm layout="inline" mode={FORM_MODE.SEARCH} {...layout} schema={this.searchSchema}>
        <Item field="shipmentOrgName" />
        <Item field="projectName" />
        <Item field="createTime" />
        {!unaudited && <Item field="accountStatus" />}
        <Item field="createOrgName" />
        <Item field="payAccountStatusArr" />
        <Item field="transportNo" />
        <Item field="accountTransportNo" />
        <Item field="invoiceStatus" />
        <Item field="accountOrgTypeArr" />
        <Row type="flex" className="mt-1 mb-1">
          <DebounceFormButton className="mr-10" label="查询" type="primary" onClick={this.handleSearchBtnClick} />
          <Button className="mr-10" onClick={this.handleResetBtnClick}>重置</Button>
          <Authorized authority={[...excelExportAuth]}>
            <DebounceFormButton
              className="mr-10"
              type="primary"
              label="导出excel"
              onClick={this.handleExportExcelBtnClick}
            />
          </Authorized>
          <Authorized authority={[...transportExportAuth]}>
            <DebounceFormButton
              type="primary"
              label="导出运单明细"
              onClick={this.handleExportTransportDetailBtnClick}
            />
          </Authorized>
        </Row>
      </SearchForm>
    );
  };

  handleSearchBtnClick = value => {
    this.setState({
      nowPage: 1
    });
    const createDateStart = value.createTime && value.createTime.length ? moment(value.createTime?.[0]).startOf("day").format("YYYY/MM/DD HH:mm:ss") : undefined;
    const createDateEnd = value.createTime && value.createTime.length ? moment(value.createTime?.[1]).endOf("day").format("YYYY/MM/DD HH:mm:ss") : undefined;
    const { payerOrganizationName, projectName, accountStatus } = value;

    const newFilter = {
      ...this.props.searchCondition,
      ...this.props.filter,
      createDateStart,
      createDateEnd,
      payerOrganizationName,
      projectName,
      accountStatus: accountStatus || this.props.searchCondition.accountStatus,
      offset: 0
    };
    // newFilter = { ...newFilter, ...this.props.searchCondition, accountStatus : accountStatus || this.props.searchCondition.accountStatus };
    this.setState({ ready: false });
    this.props.getTransportAccount({ ...newFilter }).then(() => this.setState({ ready: true }));
  };

  handleResetBtnClick = () => {
    const newFilter = this.props.resetFilter({ isCanFind: 1 });
    this.setState({
      nowPage: 1,
      pageSize: 10
    });
    this.props.getTransportAccount({ ...newFilter, ...this.props.searchCondition });
  };

  handleExportTransportDetailBtnClick = () => {
    const { selectedRow = [] } = this.state;
    if (!selectedRow.length) {
      return message.error("请至少选择一张对账单执行此操作！");
    }
    const accountTransportIdItems = selectedRow.map(item => item.accountTransportId).join(",");
    const params = {
      accountTransportIdItems,
      fileName: "账单明细",
      organizationType: this.organizationType,
      organizationId: this.organizationId
    };

    routerToExportPage(sendAccountTransportExcelPost, params);
  };

  handleExportExcelBtnClick = () => {
    const { selectedRow = [] } = this.state;
    if (selectedRow.length < 1) {
      return message.error("请至少选择一条对账单");
    }
    const idList = selectedRow.map(item => item.accountTransportId);
    const { accountOrgType } = this.props.searchCondition;
    let params = {
      organizationType: this.organizationType,
      organizationId: this.organizationId,
      idList,
      fileName: "运输对账"
    };
    if (accountOrgType) params = { ...params, accountOrgType };

    routerToExportPage(sendAccountTransportListExcelPost, params);
  };

  onToggleCreateAccountModal = () => {
    const { showCreateAccountModal } = this.state;
    this.setState({ showCreateAccountModal: !showCreateAccountModal });
  };


  render() {
    const { nowPage, pageSize, showCreateAccountModal, ready } = this.state;
    const { transportAccount = { items: [], count: 0 }, createAuth = ["hide"] } = this.props;
    const { match: { path } } = this.props;

    return (
      <>
        <Authorized authority={[...createAuth]}>
          <Button onClick={this.onToggleCreateAccountModal} type="primary">
            + 新建对账单
          </Button>
        </Authorized>
        <Modal
          title="新建对账单"
          visible={showCreateAccountModal}
          onCancel={this.onToggleCreateAccountModal}
          footer={null}
        >
          <CreateAccountModal path={path} onCancelModal={this.onToggleCreateAccountModal} />
        </Modal>
        <Table
          rowKey="accountTransportId"
          onSelectRow={this.onSelectRow}
          renderCommonOperate={this.searchTableList}
          multipleSelect
          loading={!ready}
          pagination={{ current: nowPage, pageSize }}
          onChange={this.onChange}
          schema={this.tableSchema}
          dataSource={transportAccount}
        />
      </>
    );
  }
}

export default AccountList;
