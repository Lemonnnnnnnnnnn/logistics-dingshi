import React, { Component } from "react";
import { Button, notification, message, Modal, Select, Row, Col, Spin } from "antd";
import router from "umi/router";
import { Item, FORM_MODE, Observer } from "@gem-mine/antd-schema-form";
import { connect } from "dva";
import moment from "moment";
import DebounceFormButton from "../../../../components/debounce-form-button";
import TableContainer from "@/components/table/table-container";

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
import Table from "../../../../components/table/table";
import { TRANSPORT_ACCOUNT_LIST_STATUS } from "@/constants/project/project";
import accountModel from "../../../../models/transportAccount";
import auditAccountModel from "../../../../models/auditTransportAccount";
import SearchForm from "../../../../components/table/search-form2";
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
import CreateAccountModal from "./create-account-modal";
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
          title: "??????",
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
          title: "????????????",
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
                <span style={{ color: "white", backgroundColor: "blue", borderRadius: "4px" }}>???</span>}
              </div>
            );
          }
        },
        {
          title: "????????????",
          dataIndex: "payAccountStatus",
          fixed: "left",
          render: text => <div style={{ color: PAY_STATUS_DIST[text]?.color }}>{PAY_STATUS_DIST[text]?.text}</div>
        },
        {
          title: "????????????",
          fixed: "left",
          dataIndex: "invoiceStatus",
          render: (text) => {
            const dist = {
              0: "?????????",
              1: "?????????",
              2: "?????????"
            };
            return <div>{dist[text]}</div>;
          }
        },
        {
          title: "????????????",
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
          title: "????????????",
          dataIndex: "accountType",
          organizationType: [1, 5],
          render: text => {
            if (!text) return "??????";
            // transportType: ????????????(1.?????????2.????????????)
            const config = ["??????", "????????????"];
            return config[text - 1];
          }
        },
        {
          title: "????????????",
          dataIndex: "createTime",
          render: (time) => moment(time).format("YYYY-MM-DD HH:mm:ss")
        },
        {
          title: "?????????",
          dataIndex: "shipmentName",
          organizationType: [1, 4],
          render: (text, record) => {
            if (record.accountType === 2) {
              return "??????????????????";
            }
            // return record.accountDetailItems?.[0]?.shipmentOrgName || "--";
            return text || '--';
          }
        },
        {
          title: "???????????????",
          dataIndex: "createOrgName"
        },
        {
          title: "????????????",
          render: (text, record) => {
            const { accountOrgType } = record;
            return ACCOUNT_SOURCE_DIST[accountOrgType];
          }
        },
        {
          title: "???????????????",
          dataIndex: "subordinateShipmentName",
          organizationType: [5],
          render: text => text || "???"
        },
        {
          title: "?????????(???)",
          render: (text, record) => formatMoney((accountCost(record)._toFixed(2)))
        },
        {
          title: "???????????????(???)",
          render: (text, record) => formatMoney((getServiceCharge(record)._toFixed(2)))
        },
        {
          title: "????????????(???)",
          dataIndex: "damageCompensation",
          render: text => formatMoney((text || 0)._toFixed(2))
        },
        {
          title: this.organizationType === 1 ? "???????????????(???)" : "???????????????(???)",
          render: (text, record) => formatMoney((getNeedPay(record)._toFixed(2)))
        },
        {
          title : '??????????????????????????????',
          organizationType: [1, 5],
          render : (text, record) =>formatMoney((getShipmentServiceCharge(record)._toFixed(2)))
        },
        {
          title: "???????????????(??????)(???)",
          organizationType: [1, 5],
          render: (text, record) => formatMoney((getShipmentDifferenceCharge(record)._toFixed(2)))
        },
        {
          title: "????????????(???)",
          dataIndex: "purchaseReceivables",
          organizationType: [1],
          render: text => formatMoney((text || 0)._toFixed(2))
        },
        {
          title: "?????????????????????(???)",
          dataIndex: "driverServiceCharge",
          organizationType: [1],
          render: text => formatMoney((text || 0)._toFixed(2))
        },
        {
          title: "?????????",
          dataIndex: "transportNumber"
        },
        {
          title: "????????????",
          dataIndex: "loadingNetWeight",
          render: (text) => <div style={{ whiteSpace: "normal", width: "400px" }}>{text}</div>
        },
        {
          title: "????????????",
          dataIndex: "unloadNetWeight",
          render: (text) => <div style={{ whiteSpace: "normal", width: "400px" }}>{text}</div>
        },
        {
          title: "??????",
          dataIndex: "paymentDays",
          render: (text, record) => `${moment(record.paymentDaysStart).format("YYYY-MM-DD")}~${moment(record.paymentDaysEnd).format("YYYY-MM-DD")}`
        },
        {
          title: "?????????",
          dataIndex: "createName"
        },
        {
          title: "?????????",
          dataIndex: "auditorName",
          render: text => {
            if (text === null) return "--";
            return text;
          }
        },
        {
          title: "????????????",
          dataIndex: "auditTime",
          render: time => {
            if (time === null) return "--";
            return moment(time).format("YYYY-MM-DD HH:mm:ss");
          }
        },
        {
          title: "????????????",
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
          title: "??????",
          auth: [...detailAuth],
          onClick: () => {
            const { match: { path } } = this.props;
            router.push(`${path}transportAccountBillDetail?accountTransportId=${record.accountTransportId}&accountOrgType=${record.accountOrgType}`);
          }
        };

        const modify = {
          title: "??????",
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
          title: "??????",
          confirmMessage: () => `????????????????????????????????????`,
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
                  message: "????????????",
                  description: `?????????????????????`
                });
              });
          }
        };

        const handle = {
          title: "????????????",
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
          title: "??????",
          auth: [...auditedAuth],
          onClick: () => {
            const { match: { path } } = this.props;
            router.push(`${path}transportAccountBillAudit?accountTransportId=${record.accountTransportId}&accountOrgType=${record.accountOrgType}`);
          }
        };

        const withdraw = {
          title: "??????",
          onClick: (record) => {
            const { accountTransportId } = record;

            accountTransportRecall(accountTransportId)
              .then(() => {
                const params = { ...this.props.filter, ...this.props.searchCondition };
                return this.props.getTransportAccount(params);
              })
              .then(() => {
                notification.success({
                  message: "????????????",
                  description: `?????????????????????`
                });
              });
          }
        };
        // ??????????????????????????? 1. ????????? 2. ??????????????? 3.?????????????????? 4. ?????????????????????

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
        label: "?????????",
        placeholder: "?????????",
        component: "input",
        visible: this.organizationType === 4,
        keepAlive: false
      },
      projectName: {
        label: "????????????",
        placeholder: "?????????????????????",
        component: "input"
      },
      createTime: {
        label: "????????????",
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
        label: "???????????????",
        component: "input",
        placeholder: "????????????????????????"
      },
      payAccountStatusArr: {
        label: "????????????",
        component: "select",
        options: [
          {
            key: 1,
            value: 1,
            label: "?????????"
          },
          {
            key: 2,
            value: 2,
            label: "????????????"
          },
          {
            key: 3,
            value: 3,
            label: "?????????"
          }
        ],
        placeholder: "?????????????????????"
      },
      transportNo: {
        label: "?????????",
        component: "input",
        placeholder: "??????????????????"
      },
      accountTransportNo: {
        label: "????????????",
        component: "input",
        placeholder: "?????????????????????"
      },
      invoiceStatus: {
        label: "????????????",
        component: "select",
        placeholder: "?????????????????????",
        options: [
          {
            key: 0,
            value: 0,
            label: "?????????"
          },
          {
            key: 1,
            value: 1,
            label: "?????????"
          },
          {
            key: 2,
            value: 2,
            label: "?????????"
          }
        ]
      },
      accountOrgTypeArr: {
        label: "????????????",
        component: "select",
        placeholder: "?????????????????????",
        options: [
          {
            label: "?????????",
            key: 0,
            value: `${SHIPMENT_TO_CONSIGNMENT},${SHIPMENT_TO_PLAT},${SHIPMENT_TO_CONSIGNMENT_INSTEAD_OF_PLAT}`
          },
          {
            label: "???????????????",
            key: 1,
            value: `${SUBORDINATE_SHIPMENT_TO_CONSIGNMENT_INSTEAD_OF_PLAT}`
          },
          {
            label: "?????????",
            key: 2,
            value: `${CONSIGNMENT_TO_PLAT}`
          }
        ]
      }
    };
    // ???????????????tab??????????????????????????????
    if (!unaudited) {
      searchSchema.accountStatus = {
        label: "??????",
        allowClear: true,
        placeholder: "???????????????",
        component: "select",
        options: [
          {
            label: "?????????",
            key: TRANSPORT_ACCOUNT_LIST_STATUS.UNAUDITED,
            value: TRANSPORT_ACCOUNT_LIST_STATUS.UNAUDITED
          },
          {
            label: "?????????",
            key: TRANSPORT_ACCOUNT_LIST_STATUS.AUDITED,
            value: TRANSPORT_ACCOUNT_LIST_STATUS.AUDITED
          },
          {
            label: "?????????",
            key: TRANSPORT_ACCOUNT_LIST_STATUS.REFUSE,
            value: TRANSPORT_ACCOUNT_LIST_STATUS.REFUSE
          },
          {
            label: "?????????",
            key: TRANSPORT_ACCOUNT_LIST_STATUS.CANCEL,
            value: TRANSPORT_ACCOUNT_LIST_STATUS.CANCEL
          },
          {
            label: "?????????",
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

    // ??????????????????????????? ?????????????????? ??????????????????
    const formData = this.form ? this.form.getFieldsValue() : null;
    localStorage.removeItem(this.currentTab.id);
    if (getLocal("local_commonStore_tabs").tabs.length > 1) {
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
    // const newFilter = this.props.setFilter({ ...this.props.searchCondition, ...this.props.filter, offset, limit,  });
    this.props.getTransportAccount(newFilter);
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
          <DebounceFormButton className="mr-10" label="??????" type="primary" onClick={this.handleSearchBtnClick} />
          <Button className="mr-10" onClick={this.handleResetBtnClick}>??????</Button>
          <Authorized authority={[...excelExportAuth]}>
            <DebounceFormButton
              className="mr-10"
              type="primary"
              label="??????excel"
              onClick={this.handleExportExcelBtnClick}
            />
          </Authorized>
          <Authorized authority={[...transportExportAuth]}>
            <DebounceFormButton
              type="primary"
              label="??????????????????"
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
      return message.error("????????????????????????????????????????????????");
    }
    const accountTransportIdItems = selectedRow.map(item => item.accountTransportId).join(",");
    const params = {
      accountTransportIdItems,
      fileName: "????????????",
      organizationType: this.organizationType,
      organizationId: this.organizationId
    };

    routerToExportPage(sendAccountTransportExcelPost, params);
  };

  handleExportExcelBtnClick = () => {
    const { selectedRow = [] } = this.state;
    if (selectedRow.length < 1) {
      return message.error("??????????????????????????????");
    }
    const idList = selectedRow.map(item => item.accountTransportId);
    const { accountOrgType } = this.props.searchCondition;
    let params = {
      organizationType: this.organizationType,
      organizationId: this.organizationId,
      idList,
      fileName: "????????????"
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
            + ???????????????
          </Button>
        </Authorized>
        <Modal
          title="???????????????"
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
