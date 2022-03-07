import React, { Component } from "react";
import { Button, Col, Dropdown, Menu, message, Modal, notification, Row, Select } from "antd";
import { FORM_MODE, Item, Observer } from "@gem-mine/antd-schema-form";
import { connect } from "dva";
import router from "umi/router";
import moment from "moment";
import DebounceFormButton from "@/components/DebounceFormButton";
import { isNumber, omit, pick, routerToExportPage, translatePageType, getLocal } from "@/utils/utils";
import Authorized from "@/utils/Authorized";
import { FilterContextCustom } from "@/components/Table/FilterContext";
import Table from "@/components/Table/Table";
import auth from "@/constants/authCodes";
import { ACCOUNT_LIST_STATUS } from "@/constants/project/project";
import { getAccountStatus } from "@/services/project";
import {
  getTemplate,
  getTransportsSelectProject,
  postTemplate,
  sendAccountGoodsAccountListExcelPost,
  sendAccountGoodsDetailExcelPost
} from "@/services/apiService";
import accountModel from "@/models/goodsAccount";
import { getUserInfo } from "@/services/user";
import SearchForm from "@/components/Table/SearchForm2";
import "@gem-mine/antd-schema-form/lib/fields";
import ExcelOutput from "@/components/ExcelOutput/ExcelOutput";
import fieldArray from '@/constants/account/goodsAccount';

const { Option } = Select;

const {
  CARGO_ACCOUNT_VISIT,
  CARGO_ACCOUNT_CREATE,
  CARGO_ACCOUNT_MODIFY,
  CARGO_ACCOUNT_CANCEL,
  CARGO_TO_CONSIGNMENT_ACCOUNT_VISIT,
  CARGO_TO_CONSIGNMENT_ACCOUNT_AUDITE,
  CARGO_ACCOUNT_EXCEL,
  CARGO_ACCOUNT_TRANSPORT
} = auth;

const { actions: { getGoodsAccount, patchGoodsAccount } } = accountModel;

function mapStateToProps(state) {
  return {
    commonStore: state.commonStore,
    goodsAccount: pick(state.goodsAccount, ["items", "count"])
  };
}

@connect(mapStateToProps, { getGoodsAccount, patchGoodsAccount })
@FilterContextCustom
export default class GoodsAccountList extends Component {
  currentTab = this.props.commonStore.tabs.find(item => item.id === this.props.commonStore.activeKey);

  localData = getLocal(this.currentTab.id) || { formData: {} };

  form = null;

  state = {
    nowPage: 1,
    pageSize: 10,
    projectOptions: [],
    choisedProject : -1,
    templateModalVisible : false
  };

  organizationType = getUserInfo().organizationType;

  organizationId = getUserInfo().organizationId;



  tableSchema = {
    variable: true,
    minWidth: 2300,
    columns: [
      {
        title: "状态",
        // TODO 对账单状态需要核对
        dataIndex: "accountStatus",
        render: (text) => {
          const config = getAccountStatus(text);
          return (
            <span style={{ color: config.color }}>{config.word}</span>
          );
        },
        fixed: "left",
        width: "120px"
      },
      {
        title: "对账单号",
        dataIndex: "accountTransportNo"
      },
      {
        title: "项目名称",
        dataIndex: "projectName"
      },
      {
        title: "创建时间",
        dataIndex: "createTime",
        render: (time) => moment(time).format("YYYY-MM-DD HH:mm:ss")
      },
      {
        title: "付款方",
        dataIndex: "payerOrganizationName"
      },
      {
        title: "运单数",
        dataIndex: "transportNumber"
      },
      {
        title: "总金额(元)",
        dataIndex: "totalFreight"
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
        title: "审核时间",
        dataIndex: "auditTime",
        render: (time) => {
          if (time === null) return "--";
          return moment(time).format("YYYY-MM-DD HH:mm:ss");
        }
      }
    ],
    operations: record => {
      const rowAccountStatus = record.accountStatus;

      const detail = {
        title: "详情",
        auth: [CARGO_ACCOUNT_VISIT, CARGO_TO_CONSIGNMENT_ACCOUNT_VISIT],
        onClick: (record) => {
          switch (this.props.menuType) {
            case "judgeAccount":
              return router.push(`consignmentGoodsAccountList/goodsAccountBillDetail?pageKey=${record.accountTransportNo}&accountGoodsId=${record.accountGoodsId}`);
            case "launchAccount":
              return router.push(`cargoGoodsAccountList/goodsAccountBillDetail?pageKey=${record.accountTransportNo}&accountGoodsId=${record.accountGoodsId}`);
            default:
              false;
          }
        }
      };

      const modify = {
        title: "调账",
        auth: [CARGO_ACCOUNT_MODIFY],
        onClick: (record) => {
          router.push(`cargoGoodsAccountList/adjustGoodsAccountBillWrap/adjustGoodsAccountBill?accountGoodsId=${record.accountGoodsId}`);
        }
      };

      const cancel = {
        title: "作废",
        auth: [CARGO_ACCOUNT_CANCEL],
        confirmMessage: () => `你确定要作废该对账单吗？`,
        onClick: (record) => {
          this.props.patchGoodsAccount({
            accountGoodsId: record.accountGoodsId,
            accountStatus: ACCOUNT_LIST_STATUS.CANCEL
          })
            .then(() => this.props.getGoodsAccount({ ...this.props.filter }))
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
        auth: [CARGO_ACCOUNT_CREATE],
        confirmMessage: () => `你确定要提交审核吗？`,
        onClick: (record) => {
          this.props.patchGoodsAccount({
            accountGoodsId: record.accountGoodsId,
            accountStatus: ACCOUNT_LIST_STATUS.UNAUDITED
          })
            .then(() => this.props.getGoodsAccount({ ...this.props.filter }))
            .then(() => {
              notification.success({
                message: "提交审核成功",
                description: `对账单提交审核成功`
              });
            });
        }
      };

      const unaudited = {
        title: "审核",
        auth: [CARGO_TO_CONSIGNMENT_ACCOUNT_AUDITE],
        onClick: () => {
          router.push(`consignmentGoodsAccountList/auditedGoodsAccountBill?accountGoodsId=${record.accountGoodsId}`);
        }
      };

      return {
        [ACCOUNT_LIST_STATUS.UNAUDITED]: [detail, unaudited],
        [ACCOUNT_LIST_STATUS.AUDITED]: [detail],
        [ACCOUNT_LIST_STATUS.AUDITING]: [detail, unaudited],
        [ACCOUNT_LIST_STATUS.REFUSE]: [detail],
        [ACCOUNT_LIST_STATUS.CANCEL]: [detail],
        [ACCOUNT_LIST_STATUS.NOT_HANDLE]: [detail, handle, modify, cancel]
      }[rowAccountStatus];
    }
  };

  componentDidMount() {
    const { localData = { formData: {} } } = this;
    const params = {
      ...localData.formData,
      createDateStart: localData.formData.createTime && localData.formData.createTime.length ? moment(localData.formData.createTime?.[0]).startOf('day').format('YYYY/MM/DD HH:mm:ss') : undefined,
      createDateEnd: localData.formData.createTime && localData.formData.createTime.length ? moment(localData.formData.createTime?.[1]).endOf('day').format('YYYY/MM/DD HH:mm:ss') : undefined,
      offset: localData.nowPage ? localData.pageSize * ( localData.nowPage - 1 ) : 0,
      limit: localData.pageSize ? localData.pageSize : 10,
    };
    const newFilter = this.props.setFilter({ ...params });
    this.props.getGoodsAccount(omit(newFilter, 'createTime'))
      .then(() => {
        this.setState({
          nowPage: localData.nowPage || 1,
          pageSize: localData.pageSize || 10,
        });
      })
      .then(() => {
        getTransportsSelectProject({ offset: 0, limit: 100000 }).then(({ items }) => {
          this.setState({ projectOptions: items });
        });
      });
  }

  componentWillUnmount() {
    // 页面销毁的时候自己 先移除原有的 再存储最新的
    const formData = this.form ? this.form.getFieldsValue() : null;
    localStorage.removeItem(this.currentTab.id);
    if (getLocal('local_commonStore_tabsObj').tabs.length > 1) {
      localStorage.setItem(this.currentTab.id, JSON.stringify({
        formData: { ...formData },
        pageSize: this.state.pageSize,
        nowPage: this.state.nowPage,
      }));
    }
  }

  onChange = (pagination) => {
    const { offset, limit, current } = translatePageType(pagination);
    this.setState({
      nowPage: current,
      pageSize: limit
    });
    const newFilter = this.props.setFilter({ offset, limit });
    // TODO 查询条件变化时发送获取列表请求
    this.props.getGoodsAccount({ ...newFilter });
  };

  searchSchema = {
    payerOrganizationName: {
      label: "付款方",
      placeholder: "请输入付款方",
      component: "input",
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
    projectName: {
      label: "项目名称",
      placeholder: "请输入项目名称",
      component: "input"
    },
    accountTransportNo :{
      label : '对账单号',
      placeholder : '请输入对账单号',
      component :'input'
    },
    accountStatus: {
      label: "状态",
      placeholder: "请选择状态",
      component: "select",
      options: () => {
        if (this.props.menuType === "judgeAccount") {
          return [{
            label: "待审核",
            key: ACCOUNT_LIST_STATUS.UNAUDITED,
            value: ACCOUNT_LIST_STATUS.UNAUDITED
          }, {
            label: "审核完成",
            key: ACCOUNT_LIST_STATUS.AUDITED,
            value: ACCOUNT_LIST_STATUS.AUDITED
          }, {
            label: "审核中",
            key: ACCOUNT_LIST_STATUS.AUDITING,
            value: ACCOUNT_LIST_STATUS.AUDITING
          }, {
            label: "审核不通过",
            key: ACCOUNT_LIST_STATUS.REFUSE,
            value: ACCOUNT_LIST_STATUS.REFUSE
          }];
        }
        return [{
          label: "待审核",
          key: ACCOUNT_LIST_STATUS.UNAUDITED,
          value: ACCOUNT_LIST_STATUS.UNAUDITED
        }, {
          label: "审核完成",
          key: ACCOUNT_LIST_STATUS.AUDITED,
          value: ACCOUNT_LIST_STATUS.AUDITED
        }, {
          label: "审核中",
          key: ACCOUNT_LIST_STATUS.AUDITING,
          value: ACCOUNT_LIST_STATUS.AUDITING
        }, {
          label: "审核不通过",
          key: ACCOUNT_LIST_STATUS.REFUSE,
          value: ACCOUNT_LIST_STATUS.REFUSE
        }, {
          label: "作废",
          key: ACCOUNT_LIST_STATUS.CANCEL,
          value: ACCOUNT_LIST_STATUS.CANCEL
        }, {
          label: "待提交",
          key: ACCOUNT_LIST_STATUS.NOT_HANDLE,
          value: ACCOUNT_LIST_STATUS.NOT_HANDLE
        }];
      }
    },
    createTime: {
      label: "账单日期",
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
    }
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

    const menu = (
      <Menu>
        <Menu.Item onClick={this.handleExportTransportDetailBtnClick}>导出全部</Menu.Item>
        <Menu.Item onClick={this.showTemplateModal}>导出模板</Menu.Item>
      </Menu>
    );

    return (
      <SearchForm layout="inline" {...layout} mode={FORM_MODE.SEARCH} schema={this.searchSchema}>
        <Item field="payerOrganizationName" />
        <Item field="projectName" />
        <Item field="accountStatus" />
        <Item field="createTime" />
        <Item field='accountTransportNo' />
        <div style={{ display: "inline-block" }} className='mt-20'>
          <DebounceFormButton label="查询" className="mr-10" type="primary" onClick={this.handleSearchBtnClick} />
          <DebounceFormButton label="重置" className="mr-10" onClick={this.handleResetBtnClick} />
          <Authorized authority={[CARGO_ACCOUNT_EXCEL]}>
            <DebounceFormButton label="导出excel" className="mr-10" type="primary" onClick={this.handleExportExcelBtnClick} />
          </Authorized>
          <Authorized authority={[CARGO_ACCOUNT_TRANSPORT]}>
            <Dropdown overlay={menu}>
              <Button type='primary' className='mr-10'>导出运单明细</Button>
            </Dropdown>
          </Authorized>
          {/* <DebounceFormButton */}
          {/*  type='primary' */}
          {/*  label='导出运单明细' */}
          {/*  onClick={this.handleExportTransportDetailBtnClick} */}
          {/* /> */}
        </div>
      </SearchForm>
    );
  };

  handleSearchBtnClick = (value) => {
    this.setState({
      nowPage: 1
    });
    const createDateStart =  value.createTime?.length ? moment(value.createTime?.[0]).startOf('day').format('YYYY/MM/DD HH:mm:ss') : undefined;
    const createDateEnd =  value.createTime?.length ? moment(value.createTime?.[1]).endOf('day').format('YYYY/MM/DD HH:mm:ss') : undefined;
    const { payerOrganizationName, projectName, accountStatus } = value;
    // TODO 状态字段需要确认
    const newFilter = this.props.setFilter({
      ...this.props.filter,
      createDateStart,
      createDateEnd,
      payerOrganizationName,
      projectName,
      accountStatus,
      offset: 0
    });
    // 发请求
    this.props.getGoodsAccount(omit(newFilter, "createTime"));
  };

  handleResetBtnClick = () => {
    const newFilter = this.props.resetFilter({});
    this.setState({
      nowPage: 1,
      pageSize: 10
    });
    this.props.getGoodsAccount({ ...newFilter });
  };

  handleExportExcelBtnClick = (templateId) => {
    const { selectedRow = [] } = this.state;
    if (selectedRow.length < 1) {
      return message.error("请至少选择一条对账单");
    }
    const idList = selectedRow.map(item => item.accountGoodsId);
    const params = {
      organizationType: this.organizationType,
      organizationId: this.organizationId,
      idList,
      fileName: "货品对账"
    };

    routerToExportPage(sendAccountGoodsAccountListExcelPost, params);
  };

  showTemplateModal = ()=>{
    this.setState({
      templateModalVisible: true,
    });
  }

  filterFieldArray = () => {
    const { organizationType } = this;
    return fieldArray.filter(({ display = [] }) => display.indexOf(organizationType) < 0);
  }

  handleExportTransportDetailBtnClick = (templateId) => {
    const { selectedRow = [] } = this.state;
    if (!selectedRow.length) {
      return message.error('请至少选择一张对账单执行此操作！');
    }
    const accountGoodsIdItems = selectedRow.map(item=>item.accountGoodsId).join(',');
    let params = {
      accountGoodsIdItems,
      fileName : '账单明细'
    };

    // 如果根据模板导出
    if (isNumber(templateId)) params = { ...params, templateId };

    routerToExportPage(sendAccountGoodsDetailExcelPost, params);
  }

  onSelectRow = (selectedRow) => {
    this.setState({
      selectedRow
    });
  };

  onChoiseProject = (val) =>{
    this.setState({ choisedProject : val });
  }

  addPageRouter = () => {
    const { choisedProject } = this.state;
    if (choisedProject === -1) {
      notification.error({ message: "请选择项目" });
      return;
    }
    router.push(`cargoGoodsAccountList/createGoodsAccountBill?choisedProject=${choisedProject}`);
  };


  render() {
    const { nowPage, pageSize, showChoiseProject, projectOptions, templateModalVisible } = this.state;
    const { goodsAccount } = this.props;
    return (
      <>
        {
          this.organizationType === 4 ?
            <Authorized authority={[CARGO_ACCOUNT_CREATE]}>
              <Button onClick={() => this.setState({ showChoiseProject: true })} type="primary">
                + 新建对账单
              </Button>
            </Authorized>
            :
            null
        }
        <Modal
          title="新建对账单"
          visible={showChoiseProject}
          onCancel={() => this.setState({ showChoiseProject: false })}
          footer={null}
        >
          <span>请选择项目：</span>
          <Select
            placeholder="请输入项目名称"
            optionFilterProp="children"
            showSearch
            style={{ width: 250 }}
            onChange={this.onChoiseProject}
            filterOption={(input, option) =>
              option.props.children.toLowerCase().indexOf(input.toLowerCase()) >= 0
            }
          >
            {
              projectOptions.map(item => <Option key={item.projectId} value={item.projectId}>{item.projectName}</Option>)
            }
          </Select>
          <Row type="flex" className="mt-2">
            <Col span={6} />
            <Col span={6}><Button type="primary" onClick={this.addPageRouter}>下一步</Button></Col>
            <Col span={6}><Button onClick={() => this.setState({ showChoiseProject: false })}>取消</Button></Col>
            <Col span={6} />
          </Row>
        </Modal>

        <Modal
          centered
          width={720}
          destroyOnClose
          title='导出模板'
          maskClosable={false}
          visible={templateModalVisible}
          onCancel={()=>this.setState({ templateModalVisible:  false })}
          footer={null}
        >
          <ExcelOutput
            getTemplateList={getTemplate}
            fieldArray={this.filterFieldArray()}
            exportExcelAction={this.handleExportTransportDetailBtnClick}
            addTemplate={postTemplate}
            templateType={3}
          />
        </Modal>

        <Table
          rowKey="accountGoodsId"
          onSelectRow={this.onSelectRow}
          renderCommonOperate={this.searchTableList}
          multipleSelect
          pagination={{ current: nowPage, pageSize }}
          onChange={this.onChange}
          schema={this.tableSchema}
          dataSource={goodsAccount}
        />
      </>
    );
  }
}
