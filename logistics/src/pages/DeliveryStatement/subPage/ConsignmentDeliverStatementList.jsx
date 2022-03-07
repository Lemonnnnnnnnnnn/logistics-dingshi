// 对账单列表
import React, { Component } from 'react';
import moment from 'moment';
import router from 'umi/router';
import { message } from 'antd';
import { omit, pick } from 'lodash';
import { connect } from 'dva';
import { FORM_MODE, Item, Observer } from '@gem-mine/antd-schema-form';
import SelectField from '@gem-mine/antd-schema-form/lib/fieldItem/Select';
import accountModel from '@/models/outboundAccount';
import accountExcelModel from '@/models/outboundAccountExcel';
import Table from '@/components/Table/Table';
import { FilterContextCustom } from '@/components/Table/FilterContext';
import { routerToExportPage, translatePageType, getLocal } from '@/utils/utils';
import SearchForm from '@/components/Table/SearchForm2';
import DebounceFormButton from '@/components/DebounceFormButton';
import { getSupplierOrganizationNameList, removeAccountOutbound } from '@/services/apiService';
import Authorized from '@/utils/Authorized';
import auth from '@/constants/authCodes';



const { actions: { getOutboundAccount } } = accountModel;
const { actions: { getOutboundAccountExcel } } = accountExcelModel;

function mapStateToProps(state) {
  return {
    commonStore: state.commonStore,
    outboundAccount: pick(state.outboundAccount, ['items', 'count']),
  };
}
const {
  OUTBOUND_ACCOUNT_DELETE,
} = auth;
@connect(mapStateToProps, { getOutboundAccount, getOutboundAccountExcel })
@FilterContextCustom
export default class ConsignmentDeliverStatementList extends Component {
  currentTab = this.props.commonStore.tabs.find(item => item.id === this.props.commonStore.activeKey);

  localData = getLocal(this.currentTab.id) || { formData: {} };

  form = null;

  state = {
    searchReady: true,
    tab1NowPage: 1,
    tab1PageSize: 10,
  }


  tableSchema = {
    variable: true,
    minWidth: 1200,
    columns: [
      {
        title: '对账单号',
        dataIndex: 'accountOutboundNo',
      },
      {
        title: '厂商名称',
        dataIndex: 'supplierOrganizationName',
      },
      {
        title: '核对期间',
        dataIndex: 'outboundStartAndEndTime',
      },
      {
        title: '单据条数',
        dataIndex: 'numberOfUpload',
      },
      {
        title: '通过数',
        dataIndex: 'numberOfSuccess',
      },
      {
        title: '创建人',
        dataIndex: 'createUserName',
      },
      {
        title: '创建时间',
        dataIndex: 'createTime',
        render: (time) => moment(time).format('YYYY-MM-DD HH:mm:ss'),
      },
    ],
    operations: record => {
      const { detailAuth = ['hide'] } = this.props;
      const detail = {
        title: '详情',
        auth: [...detailAuth],
        onClick: (record) => {
          router.push(`consignmentDeliveryStatementList/consignmentDeliverStatementDetail?accountOutboundId=${record.accountOutboundId}`);
        },
      };
      const remove = {
        title : '删除',
        auth: [OUTBOUND_ACCOUNT_DELETE],
        confirmMessage: () => `亲，确认要删除该表单，此操作不可逆！`,
        onClick : (record)=>{
          removeAccountOutbound(record.accountOutboundId).then(()=>{
            this.handleResetBtnClick();
          });
        }
      };

      return [detail, remove];
    },
  }

  searchSchema = {
    supplierOrganizationIdTab1: {
      label: '厂商名称',
      placeholder: '请输入厂商名称',
      observer: Observer({
        watch: '*localData',
        action: (itemValue, { form }) => {
          if (this.form !== form) {
            this.form = form;
          }
          return { };
        }
      }),
      component: SelectField,
      onChange: (value) => {
        console.log(`onChange ${value}`);
      },
      onBlur: (value) => {
        console.log(`onBlur ${value}`);
      },
      onFocus: (value) => {
        console.log(`onFocus ${value}`);
      },
      onSearch: (value) => {
        console.log(`onSearch ${value}`);
      },
      showSearch: true,
      optionFilterProp: 'children',
      filterOption: (input, option) => option.props.children.toLowerCase().indexOf(input.toLowerCase()) >= 0,
      options:async () => {
        const consignmentData = await getSupplierOrganizationNameList({ limit: 1000, offset: 0, searchKey: '' });
        const items = consignmentData || [];
        const result = items
          .map(item => ({
            key: item.organizationId,
            value: item.organizationId,
            label: `${item.organizationName}`,
          }));
        return [...result];
      }

    },
  }

  componentDidMount() {
    const { localData = { formData: {} } } = this;
    const params = {
      ...localData.formData,
      offset: localData.tab1NowPage ? localData.tab1PageSize * ( localData.tab1NowPage - 1 ) : 0,
      limit: localData.tab1PageSize ? localData.tab1PageSize : 10,
    };
    const newFilter = this.props.setFilter({ ...params });
    this.props.getOutboundAccount(newFilter).then(() => {
      this.setState({
        tab1NowPage: localData.tab1NowPage || 1,
        tab1PageSize: localData.tab1PageSize || 10,
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
        tab1PageSize: this.state.tab1PageSize,
        tab1NowPage: this.state.tab1NowPage,
      }));
    }
  }

  /**
   * 分页
   * @param pagination
   */
  onChange = (pagination) => {
    const { offset, limit, current } = translatePageType(pagination);
    this.setState({
      tab1NowPage: current,
      tab1PageSize: limit,
    });
    const newFilter = this.props.setFilter({ offset, limit });
    this.props.getOutboundAccount({ ...newFilter });
  }


  searchTableList = () => {
    const { searchReady } = this.state;
    const { excelAuth=['hide'] } = this.props;
    const layout = {
      labelCol: {
        xs: { span: 24 },
        sm: { span: 8 },
        xl: { span: 6 },
      },
      wrapperCol: {
        xs: { span: 24 },
        sm: { span: 16 },
        xl: { span: 18 },
      },
    };
    return (
      <>
        {searchReady &&
        <SearchForm layout="inline" {...layout} mode={FORM_MODE.SEARCH} schema={this.searchSchema}>
          <Item field="supplierOrganizationIdTab1" />
          <div style={{ display: 'inline-block' }}>
            <DebounceFormButton label="查询" className="mr-10" type="primary" onClick={this.handleSearchBtnClick} />
            <DebounceFormButton label="重置" className="mr-10" onClick={this.handleResetBtnClick} />
            <Authorized authority={[...excelAuth]}>
              <DebounceFormButton label="导出excel" type="primary" onClick={this.handleExportExcelBtnClick} />
            </Authorized>
          </div>
        </SearchForm>
        }
      </>
    );
  }


  handleSearchBtnClick = (value) => {
    this.setState({
      tab1NowPage: 1,
    });
    // TODO 状态字段需要确认
    const { supplierOrganizationId } = value;
    const newFilter = this.props.setFilter({ ...this.props.filter, supplierOrganizationId, offset: 0 });
    // 发请求
    this.props.getOutboundAccount(omit(newFilter, 'createTime'));
  }

  handleResetBtnClick = () => {
    const oldFilter =this.props.filter;
    delete(oldFilter.supplierOrganizationIdTab1);
    const newFilter = this.props.resetFilter(Object.assign(oldFilter, { offset: 0 }));
    // const newFilter = this.props.resetFilter({ supplierOrganizationIdTab1: null })
    this.setState({
      tab1NowPage: 1,
      tab1PageSize: 10,
    });
    this.props.getOutboundAccount({ ...newFilter });
  }

  handleExportExcelBtnClick = () => {
    const { selectedRow = [] } = this.state;
    if (selectedRow.length !== 1) {
      return message.error('请选择一张出库对账单执行此操作！');
    }
    const { accountOutboundId } = selectedRow[0];
    const params = { accountOutboundId, fileName: '出库对账单明细' };
    routerToExportPage(this.props.getOutboundAccountExcel, params);
  }

  onSelectRow = (selectedRow) => {
    this.setState({
      selectedRow,
    });
  }

  render() {
    const { tab1NowPage, tab1PageSize } = this.state;
    const { outboundAccount } = this.props;

    return (
      <>
        <Table
          rowKey="accountOutboundId"
          multipleSelect
          onSelectRow={this.onSelectRow}
          renderCommonOperate={this.searchTableList}
          pagination={{ current: tab1NowPage, tab1PageSize }}
          onChange={this.onChange}
          schema={this.tableSchema}
          dataSource={outboundAccount}
        />
      </>
    );
  }

}


