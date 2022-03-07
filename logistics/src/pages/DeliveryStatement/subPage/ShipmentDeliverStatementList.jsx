// 明细列表
import React, { Component } from 'react';
import moment from 'moment';
import { omit, pick } from 'lodash';
import { connect } from 'dva';
import { FORM_MODE, Item, Observer } from '@gem-mine/antd-schema-form';
import SelectField from '@gem-mine/antd-schema-form/lib/fieldItem/Select';
import { notification } from 'antd';
import router from "umi/router";
import Table from '@/components/Table/Table';
import { FilterContextCustom } from '@/components/Table/FilterContext';
import { routerToExportPage, translatePageType, getLocal } from '@/utils/utils';
import SearchForm from '@/components/Table/SearchForm2';
import DebounceFormButton from '@/components/DebounceFormButton';
import { getTransportStatus } from '@/services/project';
import outboundAccountDetailModel from '@/models/outboundAccountDetail';
import { getDeliveryStatementCheckAndBindStatus, getDeliveryStatementCheckStatus } from '@/services/deliverStatement';
import {
  getAllProjectsList,
  getSupplierOrganizationNameList,
} from '@/services/apiService';
import accountExcelModel from '@/models/outboundAccountExcel';
import { CHECK_STATUS } from '@/constants/account/outboundType';
import ShipmentUpdate from '@/pages/DeliveryStatement/component/ShipmentUpdate';
import RelationWaybill from '@/pages/DeliveryStatement/component/RelationWaybill';
import { getUserInfo } from '@/services/user';
import Authorized from '@/utils/Authorized';

const { actions: { getOutboundAccountDetail } } = outboundAccountDetailModel;
const { actions: { getOutboundAccountExcel } } = accountExcelModel;

function mapStateToProps(state) {
  return {
    commonStore: state.commonStore,
    outboundAccountDetail: pick(state.outboundAccountDetail, ['items', 'count']),
  };
}

@connect(mapStateToProps, { getOutboundAccountDetail, getOutboundAccountExcel })
@FilterContextCustom
export default class ConsignmentDeliverStatementDetailedList extends Component {
  currentTab = this.props.commonStore.tabs.find(item => item.id === this.props.commonStore.activeKey);

  localData = getLocal(this.currentTab.id) || { formData: {} };

  form = null;

  organizationType = getUserInfo().organizationType

  organizationId = getUserInfo().organizationId

  state = {
    searchReady: true,
    nowPage: 1,
    pageSize: 10,
    showUpdateWaybillModal: false,
  }


  tableSchema = {
    variable: true,
    minWidth: 2200,
    columns: [
      {
        title: '对账单号',
        dataIndex: 'accountOutboundNo',
      },
      {
        title: '项目名称',
        dataIndex: 'projectName',
      },
      {
        title: '厂商名称',
        dataIndex: 'supplierOrganizationName',
      },
      {
        title : '厂商货品名称',
        dataIndex: 'supplierOutboundGoods'
      },
      {
        title: '厂商车牌号',
        dataIndex: 'supplierCarNo',
        render: (text, record) => {
          if (text) {
            const config = getDeliveryStatementCheckAndBindStatus(`carNoMatch_${record.carNoMatch}`);
            return (
              <span style={{ color: config.color }}>{text}</span>
            );
          }
          return <span>{text}</span>;
        },
      },
      {
        title: '厂商出库单号',
        dataIndex: 'supplierOutboundNo',
        render: (text, record) => {
          if (text) {
            const config = getDeliveryStatementCheckAndBindStatus(`deliveryNoMatch_${record.deliveryNoMatch}`);
            return (
              <span style={{ color: config.color }}>{text}</span>
            );
          }
          return <span>{text}</span>;
        },
      },
      {
        title: '厂商出库时间',
        dataIndex: 'supplierOutboundTime',
        render: (time, record) => {
          if (time == null) {
            return '';
          }
          const formatTime = moment(time).format('YYYY-MM-DD HH:mm:ss');
          if (time) {
            const config = getDeliveryStatementCheckAndBindStatus(`timeMatch_${record.timeMatch}`);
            return (
              <span style={{ color: config.color }}>{formatTime}</span>
            );
          }
          return <span>{formatTime}</span>;
        },
      },
      {
        title: '厂商出库量',
        dataIndex: 'supplierOutboundNum',
        render: (text, record) => {
          if (text) {
            const config = getDeliveryStatementCheckAndBindStatus(`numMatch_${record.numMatch}`);
            return (
              <span style={{ color: config.color }}>{text}</span>
            );
          }
          return <span>{text}</span>;
        },
      },

      {
        title: '运单号',
        dataIndex: 'transportNo',
        render : (text, record) => <a onClick={()=> router.push(`/buiness-center/transportList/transport/transportDetail?transportId=${record.transportId}`)}>{text}</a>
      },
      {
        title : '货品名称',
        dataIndex: 'categoryName',
        render: (text, record) =><span>{text}-{record.goodsName}</span>
      },
      {
        title: '运单状态',
        dataIndex: 'transportImmediateStatus',
        render: (text, record) => {
          if (!record.transportNo) return '未匹配到运单';
          record.transportImmediateStatus = record.transportStatus;
          const statusArr = getTransportStatus(record);
          return (
            <>
              {statusArr.map((item) =>
                <span key={item.key} style={{ color: item.color }}>
                  {item.word}
                </span>,
              )}
            </>
          );
        },
      },
      {
        title: '车牌号',
        dataIndex: 'carNo',
        render: (text, record) => {
          if (text) {
            const config = getDeliveryStatementCheckAndBindStatus(`carNoMatch_${record.carNoMatch}`);
            return (
              <span style={{ color: config.color }}>{text}</span>
            );
          }
          return <span>{text}</span>;
        },
      },
      {
        title: '提货单号',
        dataIndex: 'deliveryNo',
        render: (text, record) => {
          if (text) {
            const config = getDeliveryStatementCheckAndBindStatus(`deliveryNoMatch_${record.deliveryNoMatch}`);
            return (
              <span style={{ color: config.color }}>{text}</span>
            );
          }
          return <span>{text}</span>;
        },
      },
      {
        title: '提货时间',
        dataIndex: 'deliveryTime',
        render: (time, record) => {
          if (time == null) {
            return '';
          }
          const formatTime = moment(time).format('YYYY-MM-DD HH:mm:ss');
          if (time) {
            const config = getDeliveryStatementCheckAndBindStatus(`timeMatch_${record.timeMatch}`);
            return (
              <span style={{ color: config.color }}>{formatTime}</span>
            );
          }
          return <span>{formatTime}</span>;
        },
      },
      {
        title: '实提量',
        dataIndex: 'deliveryNum',
        render: (text, record) => {
          if (text) {
            const config = getDeliveryStatementCheckAndBindStatus(`numMatch_${record.numMatch}`);
            return (
              <span style={{ color: config.color }}>{text}</span>
            );
          }
          return <span>{text}</span>;
        },
      },
      {
        title: '核对情况',
        dataIndex: 'checkStatus',
        render: (val) => {
          const config = getDeliveryStatementCheckStatus(val);
          return (
            <span style={{ color: config.color }}>{config.word}</span>
          );
        },
      },
    ],
    operations: record => {
      const { modifyAuth=['hide'], relationAuth=['hide'] } = this.props;
      const update = {
        title: '修改',
        auth:[...modifyAuth],
        onClick: (record) => {
          const { isAccount, accountInitiator } =record;
          if (isAccount){
            notification.error({
              message: '失败',
              description: `亲,该运单${accountInitiator}已发起对账，不能修改！`,
            });
            return;
          }


          this.setState({
            showUpdateWaybillModal: true,
            updateWaybillRowData: record,
          });
        },
      };

      const relevancy = {
        title: '重新关联',
        auth:[...relationAuth],
        onClick: (record) => {
          this.setState({
            showRelationWaybillModal: true,
            relationWaybillRowData: record,
            relationWaybillMode: FORM_MODE.MODIFY,
          });
        },
      };


      const relation = {
        title: '关联运单',
        auth:[...relationAuth],
        onClick: (record) => {
          this.setState({
            showRelationWaybillModal: true,
            relationWaybillRowData: record,
            relationWaybillMode: FORM_MODE.ADD,
          });
        },
      };

      // 通过
      if (record.checkStatus===CHECK_STATUS.MATCHED){
        return [];
      }

      // 为关联运单
      if (!record.transportNo) {
        return [relation];
      }

      // 已关联运单
      return [update, relevancy];
    },

  }

  searchSchema = {
    projectId: {
      label: '项目名称',
      placeholder: '请输入项目名称',
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
        const { items } = await getAllProjectsList({ limit: 1000, offset: 0, searchKey: '' });
        const itemsData = items || [];
        const result = itemsData
          .map(item => ({
            key: item.projectId,
            value: item.projectId,
            label: `${item.projectName}`,
          }));
        return [...result];
      }
    },
    transportNo: {
      label: '运单号',
      placeholder: '请输入运单号',
      component: 'input',
    },
    supplierOrganizationId: {
      label: '厂商名称',
      placeholder: '请输入厂商名称',
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
    checkStatusList: {
      label: '核对情况',
      placeholder: '请选择核对情况',
      component: SelectField,
      options: () => {
        const arr = [{
          label: '通过',
          key: CHECK_STATUS.MATCHED,
          value: CHECK_STATUS.MATCHED,
        },
        {
          label: '部分正确',
          key: CHECK_STATUS.PART_MATCH,
          value: CHECK_STATUS.PART_MATCH,
        }, {
          label: '无法匹配',
          key: CHECK_STATUS.NO_MATCH,
          value: CHECK_STATUS.NO_MATCH,
        }];
        return arr;
      },
      // 【MATCHED】匹配；【NO_MATCH】不匹配；【PART_MATCH】部分匹配
    },
    deliveryTime: {
      label: '提货时间',
      component: 'rangePicker',
      observer: Observer({
        watch: '*localData',
        action: (itemValue, { form }) => {
          if (this.form !== form) {
            this.form = form;
          }
          return { };
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
      },
    },
    accountOutboundNo : {
      label : '对账单号',
      component : 'input',
      placeholder : '请输入对账单号'
    },
    supplierOutboundTime : {
      label : '厂商出库时间',
      component : 'rangePicker',
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
  }

  componentDidMount() {
    const { localData = { formData: {} } } = this;
    const params = {
      ...localData.formData,
      supplierOutboundStartTime: localData.formData.supplierOutboundTime && localData.formData.supplierOutboundTime.length ? moment(localData.formData.supplierOutboundTime?.[0]).startOf('day').format('YYYY/MM/DD HH:mm:ss') : undefined,
      supplierOutboundEndTime: localData.formData.supplierOutboundTime && localData.formData.supplierOutboundTime.length ? moment(localData.formData.supplierOutboundTime?.[1]).endOf('day').format('YYYY/MM/DD HH:mm:ss') : undefined,
      deliveryStartTime: localData.formData.deliveryTime && localData.formData.deliveryTime.length ? moment(localData.formData.deliveryTime?.[0]).startOf('day').format('YYYY/MM/DD HH:mm:ss') : undefined,
      deliveryEndTime: localData.formData.deliveryTime && localData.formData.deliveryTime.length ? moment(localData.formData.deliveryTime?.[1]).endOf('day').format('YYYY/MM/DD HH:mm:ss') : undefined,
      offset: localData.nowPage ? localData.pageSize * ( localData.nowPage - 1 ) : 0,
      limit: localData.pageSize ? localData.pageSize : 10,
    };
    const newFilter= this.props.setFilter({ ...params });
    this.props.getOutboundAccountDetail(omit(newFilter, ['supplierOutboundTime', 'deliveryTime', 'supplierOutboundTime'])).then(() => {
      this.setState({
        nowPage: localData.nowPage || 1,
        pageSize: localData.pageSize || 10,
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

  /**
   * 分页
   * @param pagination
   */
  onChange = (pagination) => {
    const { offset, limit, current } = translatePageType(pagination);
    this.setState({
      nowPage: current,
      pageSize: limit,
    });
    const newFilter = this.props.setFilter({ offset, limit });
    // TODO 查询条件变化时发送获取列表请求
    this.props.getOutboundAccountDetail({ ...newFilter });
  }


  searchTableList = () => {
    const { searchReady } = this.state;
    const { excelAuth=['hide'] } = this.props;

    const layout = {
      labelCol: {
        xs: { span: 24 },
        sm: { span: 10 },
        xl: { span: 8 },
      },
      wrapperCol: {
        xs: { span: 24 },
        sm: { span: 14 },
        xl: { span: 16 },
      },
    };
    return (
      <>
        {searchReady &&
        <SearchForm layout="inline" {...layout} mode={FORM_MODE.SEARCH} schema={this.searchSchema}>
          <Item field='accountOutboundNo' />
          <Item field="projectId" />
          <Item field="transportNo" />
          <Item field="supplierOrganizationId" />
          <Item field="checkStatusList" />
          <Item field="deliveryTime" />
          <Item field='supplierOutboundTime' />
          <div style={{ display: 'inline-block' }}>
            <DebounceFormButton label="查询" className="mr-10" type="primary" onClick={this.handleSearchBtnClick} />
            <DebounceFormButton label="重置" className="mr-10" onClick={this.handleResetBtnClick} />
            <Authorized authority={[...excelAuth]}>
              <DebounceFormButton label="导出搜索结果" type="primary" onClick={this.handleExportExcelBtnClick} />
            </Authorized>
          </div>
        </SearchForm>
        }
      </>
    );
  }


  handleSearchBtnClick = (value) => {
    this.setState({
      nowPage: 1,
    });
    const deliveryStartTime =  value.deliveryTime && value.deliveryTime.length ? moment(value.deliveryTime?.[0]).startOf('day').format('YYYY/MM/DD HH:mm:ss') : undefined;
    const deliveryEndTime =  value.deliveryTime && value.deliveryTime.length ? moment(value.deliveryTime?.[1]).endOf('day').format('YYYY/MM/DD HH:mm:ss') : undefined;
    const supplierOutboundStartTime =  value.supplierOutboundTime && value.supplierOutboundTime.length ? moment(value.supplierOutboundTime?.[0]).startOf('day').format('YYYY/MM/DD HH:mm:ss') : undefined;
    const supplierOutboundEndTime =  value.supplierOutboundTime && value.supplierOutboundTime.length ? moment(value.supplierOutboundTime?.[1]).endOf('day').format('YYYY/MM/DD HH:mm:ss') : undefined;
    const { projectId, transportNo, supplierOrganizationName, checkStatusList } = value;
    // TODO 状态字段需要确认
    const newFilter = this.props.setFilter({
      ...this.props.filter,
      deliveryStartTime,
      deliveryEndTime,
      supplierOutboundStartTime,
      supplierOutboundEndTime,
      transportNo,
      projectId,
      supplierOrganizationName,
      checkStatusList,
      accountOutboundId: null,
      offset: 0,
    });
    // 发请求
    this.props.getOutboundAccountDetail(omit(newFilter, ['supplierOutboundTime', 'deliveryTime']));
  }

  handleResetBtnClick = () => {
    /* const newFilter = this.props.resetFilter({
      projectId: null,
      transportNo: null,
      supplierOrganizationName: null,
      checkStatusList: null,
      accountOutboundId: null,
      offset: 0,
    }) */
    const newFilter = this.props.resetFilter({});
    this.setState({
      nowPage: 1,
      pageSize: 10,
    });
    this.props.getOutboundAccountDetail({ ...newFilter });
  }

  handleExportExcelBtnClick = () => {
    const params = { ...this.props.filter, fileName: '出库对账单明细' };
    routerToExportPage(this.props.getOutboundAccountExcel, params);
  }

  updateRowCallBack = (callbackData) => {
    this.setState({
      showUpdateWaybillModal: false,
      showRelationWaybillModal: false,
    });
    const newFilter = this.props.setFilter({ ...this.props.filter, accountOutboundId: null });
    if (callbackData.isReload===1) {
      // 发请求
      this.props.getOutboundAccountDetail(omit(newFilter, 'createTime'));
    }
  }


  render() {
    const { nowPage, pageSize, showUpdateWaybillModal, updateWaybillRowData, showRelationWaybillModal, relationWaybillRowData, relationWaybillMode } = this.state;
    const { outboundAccountDetail } = this.props;
    return (
      <>
        {showUpdateWaybillModal && <ShipmentUpdate
          visible={showUpdateWaybillModal}
          dataSource={updateWaybillRowData}
          callback={this.updateRowCallBack}
        />}
        {showRelationWaybillModal &&
        <RelationWaybill
          visible={showRelationWaybillModal}
          dataSource={relationWaybillRowData}
          mode={relationWaybillMode}
          callback={this.updateRowCallBack}
        />}

        <Table
          rowKey="outboundDetailId"
          renderCommonOperate={this.searchTableList}
          pagination={{ current: nowPage, pageSize }}
          onChange={this.onChange}
          schema={this.tableSchema}
          dataSource={outboundAccountDetail}
        />
      </>
    );
  }

}


