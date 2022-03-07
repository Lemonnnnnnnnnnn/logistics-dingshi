import React, { Component } from 'react';
import {
  Modal,
  notification,
  Checkbox,
  Dropdown,
  Button,
  Menu,
  message,
  InputNumber,
  Radio,
  Carousel,
  Input,
  Row,
  Col,
} from "antd";
import { SchemaForm, Item, Observer } from '@gem-mine/antd-schema-form';
import router from 'umi/router';
import moment from 'moment';
import { connect } from 'dva';
import chaoSvg from '@/assets/method-draw-image.svg';
import yiIcon from '@/assets/yi_icon.svg';
import Table from '../../../components/Table/Table';
import DebounceFormButton from '../../../components/DebounceFormButton';
import { getTransportStatus, translateTransportStauts } from '../../../services/project';
import TRANSPORTIMMEDIATESTATUS from '../../../constants/transport/transportImmediateStatus';
import {
  IS_EFFECTIVE_STATUS,
  EXECPTION_STATUS,
  TRANSPORT_FINAL_STATUS,
  TRANSPORT_STATUS_OPTIONS,
  SEPARATE_TRANSPORT_STAUTS,
} from '../../../constants/project/project';
import Authorized from '../../../utils/Authorized';
import model from '../../../models/transports';
import { pick, translatePageType, omit, isEmpty, isNumber, routerToExportPage, classifyGoodsWeight, getOssImg, getLocal, dealElement, getGoodsName, renderOptions } from '../../../utils/utils';
import auth from '../../../constants/authCodes';
import {
  changeTransportStatus,
  getExceptions,
  getTemplate,
  postTemplate,
  confirmTransport,
  getTransport as getTransportDetail,
  auditDelivery,
  getProjectDetail,
  updateReceiving,
  sendTransportExcelPost,
  sendTransportEventsExcelPost,
  exportTransportsPdf,
  exportTransportZip
} from "../../../services/apiService";
import SearchForm from '../../../components/Table/SearchForm2';
import { unit, source } from '../../../constants/prebooking/prebooking';
import { FilterContextCustom } from '../../../components/Table/FilterContext';
import { getUserInfo } from '../../../services/user';
import '@gem-mine/antd-schema-form/lib/fields';
import ExcelOutput from '../../../components/ExcelOutput/ExcelOutput';
import TransportVerify from './component/transportVerify';
import ModifyTransportReject from './component/ModifyTransportReject';
import ModifyModal from './component/ModifyModal';
import styles from './transport.less';
import CancelTransportModal from "./component/CancelTransportModal";
import ExportPdf from "@/components/Export/ExportPdf";
import ExportInvoicePic from '@/components/Export/ExportInvoicePic';
import { ORGANIZATION_TEXT, OWNER as CONSIGNMENT, PLATFORM } from "@/constants/organization/organizationType";
import { REPLENISHMENT_STATUS_DIST } from '@/constants/transport';

const { actions: { getTransports, getTransportReject } } = model;

const {
  TRANSPORT_MODIFY,
  TRANSPORT_DELETE,
  TRANSPORT_JUDGE_RECEIPT,
  TRANSPORT_JUDGE_EXCEPTION,
  TRANSPORT_SHIPMENT_MODIFY_RECEIPT,
  TRANSPORT_EVENTS_EXPORT,
  TRANSPORT_MODIFY_BILL,
  TRANSPORT_MODIFY_NUMBER,
  TRANSPORT_MODIFY_UNLOAD_POINT,
  TRANSPORT_SUPPLEMENT_TAG,
  TRANSPORT_CANCEL,
} = auth;

const ignoreField = ['limit', 'offset', 'order', 'transportImmediateStatus'];

function mapStateToProps(state) {
  return {
    auth : state.auth.auth,
    transports: pick(state.transports, ['items', 'count', 'deliveryTotal', 'receivingTotal', 'weighTotal']),
    transportReject: state.transports.transportReject || [],
    ...state.commonStore,
  };
}

@connect(mapStateToProps, { getTransports, getTransportReject })
@FilterContextCustom
class Transport extends Component {
  currentTab = this.props.tabs.find(item => item.id === this.props.activeKey);

  // 获取本地是否有初始化数据
  localData = getLocal(this.currentTab.id) || { formData: {} };

  form = null;

  organizationType = getUserInfo().organizationType

  organizationId = getUserInfo().organizationId

  accessToken = getUserInfo().accessToken

  receivingItems = []

  modifyPermission = false

  fieldArray = [
    {
      id: 'transportStatus',
      word: '运单状态',
    },
    {
      id: 'transportNo',
      word: '运单号',
    },
    {
      id: 'projectName',
      word: '项目名称',
    },
    {
      id: 'shipmentName',
      word: '承运方',
      display: [3], // 3为货权 4为托运  5为承运
    },
    {
      id: 'deliveryName',
      word: '提货点',
    },
    {
      id: 'goodsName',
      word: '货品名称',
    },
    {
      id: 'receivingName',
      word: '卸货点',
    },
    {
      id: 'goodsNum',
      word: '计划重量',
    },
    {
      id: 'deliveryNum',
      word: '实提重量',
    },
    {
      id: 'receivingNum',
      word: '实收重量',
    },
    {
      id: 'weighNum',
      word: '过磅重量',
    },
    {
      id: 'billNumber',
      word: '签收单号',
    },
    {
      id: 'driverUserName',
      word: '司机用户名',
    },
    {
      id: 'plateNumber',
      word: '车牌号',
    },
    {
      id: 'driverPhone',
      word: '司机手机号',
    },
    {
      id: 'transportCreateTime',
      word: '发布日期',
    },
    {
      id: 'deliveryTime',
      word: '提货时间',
    },
    {
      id: 'receivingTime',
      word: '签收时间',
    },
    {
      id: 'predictArriveTime',
      word: '预计到达时间',
    },
    {
      id: 'transportTime',
      word: '运输时长',
    },
    {
      id: 'consignmentOrganizationName',
      word: '托运方',
    },
    {
      id: 'maximumShippingPrice',
      word: '预约单发单价',
    }
  ]

  searchSchema = {
    transportNo: {
      label: '运单号',
      placeholder: '请输入运单号',
      component: 'input',
      observer: Observer({
        watch: '*localData',
        action: (itemValue, { form }) => {
          if (this.form !== form) {
            this.form = form;
          }
          return {};
        }
      }),
    },
    receivingNo: {
      label: '签收单号',
      placeholder: '请输入签收单号',
      component: 'input',
    },
    projectName: {
      label: '项目名称',
      placeholder: '请输入项目名称',
      component: 'input',
    },
    status: {
      label: '运单状态',
      placeholder: '请选择运单状态',
      component: 'select',
      options: TRANSPORT_STATUS_OPTIONS.map(item => ({
        key: item.key,
        value: item.value,
        label: item.title,
      })),
      mode: 'multiple',
    },
    deliveryName: {
      label: '提货点',
      placeholder: '请输入提货点',
      component: 'input',
    },
    receivingName: {
      label: '卸货点',
      placeholder: '请输入卸货点',
      component: 'input',
    },
    shipmentOrganizationName: {
      label: '承运方',
      placeholder: '请输入承运方',
      component: 'input',
      visible: () => this.organizationType !== 5,
    },
    createTime: {
      label: '发布日期',
      component: 'rangePicker',
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
    driverUserName: {
      label: '司机姓名',
      placeholder: '请输入司机姓名',
      component: 'input',
    },
    driverPhone: {
      label: '司机电话',
      placeholder: '请输入司机电话',
      component: 'input',
    },
    plateNumber: {
      label: '车牌号',
      placeholder: '请输入车牌号',
      component: 'input',
    },
    errorSign: {
      label: '异常标签',
      component: 'select',
      placeholder: '请输入异常标签',
      props: {
        mode: 'multiple',
      },
      options: [{
        label: '车辆轨迹异常',
        value: 1,
      }, {
        label: '司机连续操作',
        value: 2,
      }, {
        label: '里程计算异常',
        value: 3,
      }, {
        label: '单据调整',
        value: 5,
      }, {
        label: '数量调整',
        value: 6,
      }, {
        label: '卸货点调整',
        value: 7,
      }],
    },
    overDue: {
      label: '是否超时',
      placeholder: '请选择',
      component: 'select',
      options: [
        {
          key: 0,
          label: '未超时',
          value: 0,
        },
        {
          key: 1,
          label: '已超时',
          value: 1,
        },
      ],
    },
    createUserName: {
      label: '调度姓名',
      placeholder: '请输入调度姓名',
      component: 'input',
    },
    deliveryTimeRange: {
      label: '装车时间',
      component: 'rangePicker',
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
    receivingTimeRange: {
      label: '签收时间',
      component: 'rangePicker',
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
    accountAuditStatus: {
      label: '对账状态',
      placeholder: '请选择对账状态',
      component: 'select',
      options: [
        {
          key: 0,
          label: '未对账',
          value: 0,
        },
        {
          key: 1,
          label: '已对账',
          value: 1,
        },
      ],
    },
    accountTransportDriver: {
      label: '支付状态',
      placeholder: '请选择支付状态',
      component: 'select',
      options: [
        {
          key: 1,
          label: '未支付',
          value: 1,
        },
        {
          key: 2,
          label: '已支付',
          value: 2,
        },
      ],
    },
    isCreateInvoice: {
      label: '开票状态',
      placeholder: '请选择开票状态',
      component: 'select',
      options: [
        {
          key: 0,
          label: '未开票',
          value: 0,
        },
        {
          key: 1,
          label: '已开票',
          value: 1,
        },
        {
          key: 2,
          label: '开票中',
          value: 2,
        },
      ],
    },
    outboundStatusList: {
      label: '出库核对情况',
      placeholder: '请输入出库核对情况',
      component: 'select',
      options: [
        {
          label: '未匹配',
          key: 0,
          value: 0
        },
        {
          label: '部分匹配',
          key: 1,
          value: 1
        },
        {
          label: '已匹配',
          key: 2,
          value: 2
        },
      ]
    },
    billRecycleStatusList: {
      label: '实体单回收状态',
      placeholder: '选择实体单回收状态',
      component: 'select',
      options: [
        {
          label: '待收',
          key: '1,2',
          value: '1,2'
        },
        {
          label: '承运方已收',
          key: 3,
          value: 3
        },
        {
          label: '托运方已收',
          key: 4,
          value: 4
        },
        {
          label: '货权方已收',
          key: 5,
          value: 5
        }
      ]
    },
    totalQuantity: {
      label: '合计数量',
      placeholder: '是否显示合计数量',
      visible: this.organizationType === CONSIGNMENT,
      component: 'select',
      options: [
        {
          label: '展示',
          key: 1,
          value: true
        },
        {
          label: '不展示',
          key: 2,
          value: false
        },
      ]
    },
    replenishmentStatus : {
      label : '数据来源',
      placeholder : '请选择数据来源',
      component : 'select',
      options : renderOptions(REPLENISHMENT_STATUS_DIST)
    }
  }

  cancelSchema = {
    verifyReason: {
      component: 'input.textArea',
      placeholder: '请输入作废原因',
      maxLength: 200,
      rows: 4,
      rules: {
        required: [true, '请输入作废原因'],
        max: [200, '作废原因不得超过200个字符'],
      },
    },
  }

  modifySchema = {
    receivingId: {
      label: '卸货点',
      component: 'select',
      rules: {
        required: [true, '请选择卸货地址'],
      },
      options: async () => {
        const { modifyInfo: { projectId } } = this.state;
        const { receivingItems } = await getProjectDetail(projectId);
        this.receivingItems = receivingItems || [];
        return receivingItems.map(item => ({
          label: item.receivingName,
          value: item.receivingId,
          key: item.receivingId,
        }));
      },
      placeholder: '请选择卸货点',
    },
    receivingAddress: {
      label: '卸货地址',
      component: 'input.text',
      value: {
        watch: 'receivingId',
        action: async (receivingId) => {
          const { receivingAddress } = this.receivingItems.find(item => `${item.receivingId}` === `${receivingId}`) || {};
          return receivingAddress;
        },
      },
    },
    contactName: {
      label: '联系人',
      component: 'input.text',
      value: {
        watch: 'receivingId',
        action: async (receivingId) => {
          const { contactName } = this.receivingItems.find(item => `${item.receivingId}` === `${receivingId}`) || {};
          return contactName;
        },
      },
    },
    contactPhone: {
      label: '联系电话',
      component: 'input.text',
      value: {
        watch: 'receivingId',
        action: async (receivingId) => {
          const { contactPhone } = this.receivingItems.find(item => `${item.receivingId}` === `${receivingId}`) || {};
          return contactPhone;
        },
      },
    },
    reasonForChange: {
      label: '更改原因',
      component: 'input.textArea',
      rules: {
        required: [true, '请输入更改原因'],
      },
      placeholder: '请输入更改原因',
    },
  }

  constructor(props) {
    super(props);
    this.tableRef = React.createRef();
    this.state = {
      showVerifyModal: false,
      verifyRecord: {},
      nowPage: 1,
      pageSize: 10,
      selectedRow: [],
      visible: false,
      modifyRejectModal: false,
      acceptAuditModal: false,
      auditInfo: {},
      modifyInfo: {},
      selectTransportId: 0,
      deleveryAuditModal: false,
      modifyReceivingModal: false,
      cancelModal: false,
      showCancelTransportModal: false,
      showPdfModal: false,
      showInvoicePicModal: false
    };
  }

  componentDidMount() {
    const {
      getTransports,
      setFilter,
      location: { query: { prebookingId, transportFinalStatus, goodsPlanId, goodsPlanName, orderIdlist } },
    } = this.props;
    const { localData = { formData: {} } } = this;

    let _status;
    if (localData.formData.status) {
      if (localData.formData.status.length) {
        _status = { transportImmediateStatus: localData.formData.status.join(',') };
      } else {
        _status = { transportImmediateStatus: undefined };
      }
    }

    const params = {
      ...this.localData.formData,
      ..._status,
      offset: this.localData.nowPage ? this.localData.pageSize * (this.localData.nowPage - 1) : 0,
      limit: this.localData.pageSize ? this.localData.pageSize : 10,
      startDistributTime: localData.formData.createTime && localData.formData.createTime.length ? moment(localData.formData.createTime[0]).startOf('day').format('YYYY/MM/DD HH:mm:ss') : undefined,
      endDistributTime: localData.formData.createTime && localData.formData.createTime.length ? moment(localData.formData.createTime[1]).endOf('day').format('YYYY/MM/DD HH:mm:ss') : undefined,
      receivingStartTime: localData.formData.receivingTimeRange && localData.formData.receivingTimeRange.length ? moment(localData.formData.receivingTimeRange[0]).startOf('day').format('YYYY/MM/DD HH:mm:ss') : undefined,
      receivingEndTime: localData.formData.receivingTimeRange && localData.formData.receivingTimeRange.length ? moment(localData.formData.receivingTimeRange[1]).endOf('day').format('YYYY/MM/DD HH:mm:ss') : undefined,
      deliveryStartTime: localData.formData.deliveryTimeRange && localData.formData.deliveryTimeRange.length ? moment(localData.formData.deliveryTimeRange[0]).startOf('day').format('YYYY/MM/DD HH:mm:ss') : undefined,
      deliveryEndTime: localData.formData.deliveryTimeRange && localData.formData.deliveryTimeRange.length ? moment(localData.formData.deliveryTimeRange[1]).endOf('day').format('YYYY/MM/DD HH:mm:ss') : undefined,
    };
    let indexPageFilter = setFilter(transportFinalStatus === undefined ? { ...params } : { status: +transportFinalStatus, ...SEPARATE_TRANSPORT_STAUTS[transportFinalStatus] });
    indexPageFilter = setFilter(orderIdlist === undefined ? { ...params } : { ...params, orderIdList: orderIdlist, ...indexPageFilter });

    // 权限配置
    const authLocal = this.props.auth;
    this.viewSupplementPermission = authLocal?.find(item => item.permissionCode === TRANSPORT_SUPPLEMENT_TAG);
    this.modifyPermission = !!(authLocal?.find(item => item.permissionCode === TRANSPORT_MODIFY_BILL) || authLocal?.find(item => item.permissionCode === TRANSPORT_MODIFY_NUMBER) || authLocal?.find(item => item.permissionCode === TRANSPORT_MODIFY_UNLOAD_POINT));


    if (prebookingId || goodsPlanId) {
      const newFilter = setFilter({ prebookingId, goodsPlanId, goodsPlanName });
      getTransports({ ...indexPageFilter, ...newFilter })
        .then(() => {
          this.setState({
            nowPage: this.localData.nowPage || 1,
            pageSize: this.localData.pageSize || 10,
          });
        });
    } else {
      getTransports({ limit: 10, offset: 0, ...indexPageFilter })
        .then(() => {
          this.setState({
            nowPage: this.localData.nowPage || 1,
            pageSize: this.localData.pageSize || 10,
          });
        });
    }
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
    // TODO 翻页未完成
    const { offset, limit, current } = translatePageType(pagination);
    this.setState({
      nowPage: current,
      pageSize: limit,
    });
    const newFilter = this.props.setFilter({ offset, limit });
    this.props.getTransports({ ...newFilter });
  }

  showTemplateModal = () => {
    this.setState({
      visible: true,
    });
  }

  replenishmentVisible = (e) => {
    const { checked } = e.target;
    this.setState({
      replenishmentChecked: checked,
    }, () => {
      const {
        location: { query: { prebookingId, transportFinalStatus, goodsPlanId, orderIdlist: orderIdList } },
        orderBill,
      } = this.props;
      if (!checked) this.setState({
        replenishmentChecked: false,
      });
      if ((prebookingId || transportFinalStatus || goodsPlanId || orderIdList) && !orderBill) {
        router.replace('transport');
      }
      this.setState({
        nowPage: 1,
        pageSize: 10,
      });
      this.tableRef.current.resetSelectedRows();
      const newFilter = this.props.resetFilter(checked ? { replenishmentStatus: 1, orderIdList } : { orderIdList });
      this.props.getTransports({ ...newFilter });
    });
  }


  refrash = () => {
    this.props.getTransports({ ...this.props.filter });
  }

  onTogglePdfModal = () => {
    const { showPdfModal } = this.state;
    this.setState({ showPdfModal: !showPdfModal });
  }

  onToggleInvoicePicModal = () => {
    const { showInvoicePicModal } = this.state;
    this.setState({ showInvoicePicModal: !showInvoicePicModal });
  }


  searchTableList = () => {
    const { replenishmentChecked } = this.state;
    const layout = {
      labelCol: {
        xs: { span: 24 },
        sm: { span: 12 },
        xl: { span: 10 }
      },
      wrapperCol: {
        xs: { span: 24 },
        sm: { span: 12 },
        xl: { span: 14 }
      }
    };

    const menu = (
      <Menu>
        <Menu.Item onClick={this.handleOutputExcelBtnClick}>导出全部</Menu.Item>
        <Menu.Item onClick={this.showTemplateModal}>导出模板</Menu.Item>
      </Menu>
    );

    return (
      <SearchForm layout='inline' {...layout} schema={this.searchSchema}>
        <Item field='transportNo' />
        <Item field='receivingNo' />
        <Item field='projectName' />
        <Item field='status' />
        <Item field='deliveryName' />
        <Item field='receivingName' />
        <Item field='shipmentOrganizationName' />
        <Item field='createTime' />
        <Item field='driverUserName' />
        <Item field='driverPhone' />
        <Item field='plateNumber' />
        {(this.organizationType === 4 || this.organizationType === 5) && <Item field='errorSign' />}
        <Item field='overDue' />
        <Item field='createUserName' />
        <Item field='deliveryTimeRange' />
        <Item field='receivingTimeRange' />
        <Item field='accountAuditStatus' />
        <Item field='accountTransportDriver' />
        <Item field='isCreateInvoice' />
        <Item field='outboundStatusList' />
        <Item field='billRecycleStatusList' />
        <Item field='totalQuantity' />
        <Item field='replenishmentStatus' />
        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
          <div>
            <DebounceFormButton label='查询' type='primary' className='mr-10' onClick={this.handleSearchButtonClick} />
            <DebounceFormButton label='重置' className='mr-10' onClick={this.handleResetClick} />
            {this.viewSupplementPermission &&
              <Checkbox checked={replenishmentChecked} onChange={this.replenishmentVisible}>只显示补单</Checkbox>}
          </div>
          <div>
            <DebounceFormButton className='mr-10' label='导出子单据图片' onClick={this.onToggleInvoicePicModal} />
            <DebounceFormButton className='mr-10' label='导出子单据PDF' onClick={this.onTogglePdfModal} />
            <Dropdown overlay={menu}>
              <Button type='primary' className='mr-10'>导出Excel</Button>
            </Dropdown>
            <Authorized authority={[TRANSPORT_EVENTS_EXPORT]}>
              <DebounceFormButton label='导出运单事件' onClick={this.handleOutputTransportEventsBtnClick} />
            </Authorized>
          </div>
        </div>
      </SearchForm>
    );
  }

  toggleCancelModal = () => {
    const { cancelModal } = this.state;
    this.setState({
      cancelModal: !cancelModal,
    });
  }

  toggleModifyModal = () => {
    const { modifyModal } = this.state;
    this.setState({
      modifyModal: !modifyModal,
    });
  }

  handleOutputExcelBtnClick = templateId => {
    const { filter, transports: { count } } = this.props;
    const { status } = filter;

    let _status;
    if (status) {
      if (status.length) {
        _status = { transportImmediateStatus: status.join(',') };
      } else {
        _status = { transportImmediateStatus: undefined };
      }
    }

    const { selectedRow = [], } = this.state;
    const newFilter = omit(filter, ignoreField);
    let params = { ..._status, accessToken: this.accessToken, organizationType: this.organizationType, organizationId: this.organizationId, fileName: '运单列表' };
    // 如果根据模板导出
    if (isNumber(templateId)) params = { ...params, templateId };
    /*
    * 如果什么筛选条件都没有
    * 导出全部
    * */
    if (isEmpty(omit(newFilter, 'isPermissonSelectAll')) && selectedRow.length < 1) {
      if (count > 20000) {
        return Modal.error({
          title: '亲，该表单单次最多只能导出20000条，请分批次导出！'
        });
      }
      return sendTransportExcelPost(params).then(() => router.push('/buiness-center/exportAndImportRecord'));
    }
    // 导出全部
    if (selectedRow.length < 1) {
      const allFilter = dealElement(isNumber(templateId) ? { ...newFilter, templateId } : newFilter);

      // if (allFilter.status !== undefined){
      //   params = { ...params, ...SEPARATE_TRANSPORT_STAUTS[allFilter.status] };
      // }
      params = { ...params, ...allFilter };
      delete params.createTime;
      delete params.status;

      if (count > 20000) {
        return Modal.error({
          title: '亲，该表单单次最多只能导出20000条，请分批次导出！'
        });
      }

      return sendTransportExcelPost(params).then(() => router.push('/buiness-center/exportAndImportRecord'));
    }
    // 导出筛选的条目
    if (selectedRow.length > 20000) {
      return Modal.error({
        title: '亲，该表单单次最多只能导出20000条，请分批次导出！'
      });
    }
    const idList = selectedRow.map(item => item.transportId);
    params = { ...params, idList };
    return sendTransportExcelPost(params).then(() => router.push('/buiness-center/exportAndImportRecord'));
  }

  exportPdf = (formdata) => {
    const { transports: { count }, filter } = this.props;
    const { selectedRow = [] } = this.state;
    const { billTypeOptions, fileScale } = formdata;

    const initParams = omit(filter, ignoreField);
    let params = {
      ...initParams,
      isAll: fileScale === 1,
      billPictureList: billTypeOptions,
    };

    // 如果有选择运单
    if (selectedRow.length) {
      if (selectedRow.length > 500) {
        return Modal.error({
          title: '操作失败！最大运单量不能超过500张！'
        });

      }
      const idList = selectedRow.map(item => item.transportId);
      params = { ...params, idList };

      routerToExportPage(exportTransportsPdf, params);
    }

    // 如果没选择运单(导出全部运单)
    if (selectedRow.length === 0) {
      if (count > 500) {
        return Modal.error({
          title: '操作失败！最大运单量不能超过500张！'
        });
      }

      routerToExportPage(exportTransportsPdf, params);
    }
  }

  exportInvoicePic = (formdata) => {
    const { transports: { count }, filter } = this.props;
    const { selectedRow = [] } = this.state;

    const initParams = omit(filter, ignoreField);
    let params = {
      ...initParams,
      ...formdata,
      fileName: "运单列表",
    };

    // 如果有选择运单
    if (selectedRow.length) {
      if (selectedRow.length > 500) {
        return Modal.error({
          title: '操作失败！最大运单量不能超过500张！'
        });
      }
      const idList = selectedRow.map(item => item.transportId);
      params = { ...params, idList };

      routerToExportPage(exportTransportZip, params);
    } else {
      // 如果没选择运单(导出全部运单)
      if (count > 500) {
        return Modal.error({
          title: '操作失败！最大运单量不能超过500张！'
        });
      }
      routerToExportPage(exportTransportZip, params);
    }

  }

  handleSearchButtonClick = (value) => {
    const startDistributTime = value.createTime && value.createTime.length ? moment(value.createTime[0]).startOf('day').format('YYYY/MM/DD HH:mm:ss') : undefined;
    const endDistributTime = value.createTime && value.createTime.length ? moment(value.createTime[1]).endOf('day').format('YYYY/MM/DD HH:mm:ss') : undefined;
    const receivingStartTime = value.receivingTimeRange && value.receivingTimeRange.length ? moment(value.receivingTimeRange[0]).startOf('day').format('YYYY/MM/DD HH:mm:ss') : undefined;
    const receivingEndTime = value.receivingTimeRange && value.receivingTimeRange.length ? moment(value.receivingTimeRange[1]).endOf('day').format('YYYY/MM/DD HH:mm:ss') : undefined;
    const deliveryStartTime = value.deliveryTimeRange && value.deliveryTimeRange.length ? moment(value.deliveryTimeRange[0]).startOf('day').format('YYYY/MM/DD HH:mm:ss') : undefined;
    const deliveryEndTime = value.deliveryTimeRange && value.deliveryTimeRange.length ? moment(value.deliveryTimeRange[1]).endOf('day').format('YYYY/MM/DD HH:mm:ss') : undefined;
    const {
      projectName,
      deliveryName,
      receivingName,
      transportNo,
      status,
      shipmentOrganizationName,
      errorSign,
      isCreateInvoice,
      tranAccountStatus,
      accountTransportDriver,
    } = value;
    const otherParams = (() => {
      const res = {};
      errorSign && errorSign.forEach(item => {
        switch (item) {
          case 1:
            res.isTrailException = 1;
            break;
          case 2:
            res.isSeriesOperate = 1;
            break;
          case 3:
            res.isMileageException = 1;
            break;
          case 5:
            res.modifyDentryid = 1;
            break;
          case 6:
            res.modifyNum = 1;
            break;
          case 7:
            res.modifyReceiving = 1;
            break;
          default:
        }
      });
      return res;
    })();

    let _status;
    if (status) {
      if (status.length) {
        _status = { transportImmediateStatus: status.join(',') };
      } else {
        _status = { transportImmediateStatus: undefined };
      }
    }

    const resetStatus = {
      isSeriesOperate: undefined,
      isTrailException: undefined,
      isMileageException: undefined,
      modifyReceiving: undefined,
      modifyDentryid: undefined,
      modifyNum: undefined,
    };
    this.setState({
      nowPage: 1,
    });
    this.tableRef.current.resetSelectedRows();

    const newFilter = this.props.setFilter({
      ...this.props.filter,
      offset: 0,
      status,
      projectName,
      deliveryName,
      receivingName,
      transportNo,
      shipmentOrganizationName,
      startDistributTime,
      endDistributTime,
      receivingStartTime,
      receivingEndTime,
      deliveryStartTime,
      deliveryEndTime,
      isCreateInvoice,
      tranAccountStatus,
      accountTransportDriver,
      ...resetStatus,
      ..._status,
      ...otherParams,
    });
    delete newFilter.status;
    // delete newFilter.isPermissonSelectAll;

    this.props.getTransports({ ...newFilter });
  }

  handleResetClick = () => {
    const {
      location: { query: { prebookingId, transportFinalStatus, goodsPlanId, orderIdlist: orderIdList } },
      orderBill,
    } = this.props;
    this.setState({
      replenishmentChecked: false,
    });
    if ((prebookingId || transportFinalStatus || goodsPlanId || orderIdList) && !orderBill) {
      router.replace('transport');
    }
    this.setState({
      nowPage: 1,
      pageSize: 10,
    });
    this.tableRef.current.resetSelectedRows();
    const newFilter = this.props.resetFilter({
      orderIdList,
    });
    this.props.getTransports({ ...newFilter });
  }

  handleOutputTransportEventsBtnClick = (value) => {
    if (!value.createTime || !value.createTime.length) {
      notification.error({
        message: '请选择导出区间范围!',
        description: '缺少导出时间区间',
      });
    } else {
      const startDistributTime = moment(value.createTime[0]).set({
        hour: 0,
        minute: 0,
        second: 0,
        millisecond: 0,
      }).format('YYYY/MM/DD HH:mm:ss');
      const endDistributTime = moment(value.createTime[1]).set({
        hour: 23,
        minute: 59,
        second: 59,
        millisecond: 999,
      }).format('YYYY/MM/DD HH:mm:ss');
      const fileName = `运单事件${startDistributTime}-${endDistributTime}`;
      const params = { ...value, startDistributTime, endDistributTime, fileName };
      sendTransportEventsExcelPost(params).then(() => router.push('/buiness-center/exportAndImportRecord'));
    }
  }

  onSelectRow = (selectedRow) => {
    this.setState({
      selectedRow,
    });
  }

  closeModifyRejectModal = () => {
    this.props.getTransports(this.props.filter);
    this.setState({
      modifyRejectModal: false,
    });
  }

  onSearch = () => {
    this.props.getTransports({ ...this.props.filter });
  }

  handleCancel = () => {
    this.setState({
      visible: false,
    });
  }

  filterFieldArray = () => {
    const { fieldArray, organizationType } = this;
    const result = fieldArray.filter(({ display = [] }) => display.indexOf(organizationType) < 0);
    return result;
  }

  changeAcceptPrice = (e) => {
    const { target: { value } } = e;
    this.setState({
      acceptSinglePrice: value,
    });
  }

  acceptCheck = () => {
    const { auditInfo: { logisticsBusinessTypeEntity, logisticsTradingSchemeEntity, deliveryItems } } = this.state;
    const [item] = deliveryItems;
    const { freightPriceConsignment } = item;
    const { shipmentServiceRate } = logisticsTradingSchemeEntity || {};
    const { releaseHall, measurementUnit, measurementSource } = logisticsBusinessTypeEntity || {};
    const price = ((freightPriceConsignment || 0) * (1 - ((shipmentServiceRate || 0)))).toFixed(2)._toFixed(2);
    return (
      <span>单价
        <InputNumber
          disabled={!!releaseHall}
          onBlur={this.changeAcceptPrice}
          min={0}
          autoFocus
          defaultValue={price}
          style={{ width: '80px' }}
        />
        {`${unit[measurementUnit]?.label || '元/吨'} 计量来源${source[measurementSource]?.label || '按签收数量计算'}`}
      </span>
    );
  }

  acceptPass = () => {
    const { auditInfo: { transportId, deliveryItems }, acceptSinglePrice } = this.state;
    if (!isNumber(+acceptSinglePrice)) return message.error('请输入正确的单价');
    const confirmCorrelationReqs = deliveryItems.map(({ transportCorrelationId }) => ({
      transportCorrelationId,
      freightPrice: +acceptSinglePrice,
    }));
    confirmTransport({ transportId, isConfirm: true, confirmCorrelationReqs })
      .then(() => this.props.getTransports(this.props.filter))
      .then(() => this.setState({ acceptAuditModal: false }));
  }

  deliveryAudit = () => {
    const { auditInfo: { logisticsBusinessTypeEntity, deliveryItems, transportId } } = this.state;
    const { measurementUnit, releaseHall, billPictureType } = logisticsBusinessTypeEntity || {};
    const numChange = (value, id) => {
      deliveryItems.forEach(item => {
        if (id === item.transportCorrelationId) {
          item.deliveryNum = value;
        }
      });
    };
    const radioChange = (e) => {
      const { target: { value } } = e;
      this.setState({
        consignmentReceiptStatus: value,
      });
    };

    const price = deliveryItems.reduce((total, current) => total + current.freightPriceConsignment * current.deliveryNum, 0);

    const deliveryPass = () => {
      const { consignmentReceiptStatus = 3 } = this.state;
      const { value: verifyReason } = document.getElementById('verifyReason');
      const deliveryPointItem = deliveryItems.map(item => ({
        verifyObjectId: item.processPointId, deliveryNum: item.deliveryNum, verifyReason,
      }));
      auditDelivery({
        consignmentReceiptStatus,
        deliveryPointItem,
        transportId,
        transportCost: isNumber(this.totalPrice) ? this.totalPrice : price,
      })
        .then(() => this.props.getTransports(this.props.filter))
        .then(() => this.setState({ deleveryAuditModal: false }));
    };
    const imgArr = deliveryItems.map(({ billDentryid = '' }) => {
      const arr = billDentryid.split(',');
      return arr.map(item => (
        <img style={{ maxWidth: '500px', maxHeight: '500px' }} alt='' src={getOssImg(item)} />
      ));
    });
    const deliveryinfo = deliveryItems.map(item => (
      <>
        <div>提货数量：
          <div style={{ display: 'inline-block' }} key={item.transportCorrelationId}>
            <span>
              {`${item.categoryName}${item.goodsName}`}
              <InputNumber
                min={0}
                onChange={(value) => numChange(value, item.transportCorrelationId)}
                style={{ width: '80px' }}
                defaultValue={`${item.deliveryNum}`}
              />
              {`${item.goodsUnitCN}`}
            </span>
          </div>
        </div>
        <div style={{
          height: '32px',
          lineHeight: '32px',
        }}
        >运费单价：{`${item.freightPriceConsignment}${unit[measurementUnit]?.label || '元/吨'}`}
        </div>
      </>
    ));
    return (
      <>
        {billPictureType && billPictureType.indexOf('1') !== -1 && !deliveryItems[0].billDentryid ?
          <Row type='flex' justify='center'>
            <Col>
              <div style={{
                height: '300px',
                width: '300px',
                background: 'rgba(242, 242, 242, 1)',
                position: 'relative',
                marginBottom: '30px',
              }}
              >
                <div style={{ lineHeight: '300px', textAlign: 'center', height: '100%' }}>单据正在自动生成...</div>
              </div>
            </Col>
          </Row> :
          <Carousel>
            {imgArr}
          </Carousel>
        }
        <div className='transport_delivery_info_modal'>
          {deliveryinfo}
          <div style={{ height: '32px', lineHeight: '32px' }}>预估总价：<InputNumber
            min={0}
            style={{ width: '80px' }}
            disabled={!releaseHall}
            onChange={(value) => this.totalPrice = +value}
            defaultValue={`${price}`}
          />元
          </div>
        </div>
        <div style={{ marginTop: '20px', display: 'flex' }}>
          <label htmlFor='auditRadioGroup'>审核：</label>
          <Radio.Group id='auditRadioGroup' onChange={radioChange} defaultValue={3}>
            <Radio value={3}>通过</Radio>
            <Radio value={2}>拒绝</Radio>
          </Radio.Group>
          <label htmlFor='verifyReason'>备注：</label>
          <Input.TextArea id='verifyReason' style={{ width: '200px' }} maxLength={50} />
        </div>
        <div style={{ textAlign: 'right' }}>
          <Button onClick={deliveryPass} type='primary'>保存</Button>
        </div>
      </>
    );
  }

  closeModifyReceivingModal = () => {
    this
      .setState({
        modifyReceivingModal: false,
      });
  }

  confirmCancel = (value) => {
    const record = this.cancelTransport;
    if (record.transportImmediateStatus === TRANSPORTIMMEDIATESTATUS.TRANSPORT_EXECPTION) {
      getExceptions({ transportId: record.transportId, isProcessing: true, limit: 100, offset: 0 })
        .then(data => changeTransportStatus({
          transportId: record.transportId,
          transpotExceptionId: data.items[0].transpotExceptionId,
          iseffectiveStatus: IS_EFFECTIVE_STATUS.IS_EFFECTIVE_DELETE, ...value,
        }))
        .then(() => this.props.getTransports(this.props.filter));
    } else {
      changeTransportStatus({
        transportId: record.transportId,
        iseffectiveStatus: IS_EFFECTIVE_STATUS.IS_EFFECTIVE_DELETE, ...value,
      }).then((result) => {
        const accountBill = [...result.accountGoodsInfoResps, ...result.accountTransportInfoResps];
        if (accountBill.length !== 0) {
          Modal.info({
            title: '作废运单',
            content: (
              <>
                {
                  accountBill.map(item =>
                    <div key={item.accountTransportNo}>
                      <div>该运单已被{ORGANIZATION_TEXT[item.organizationType]}纳入对账单，不能进行作废</div>
                      <div>对账单号：{item.accountTransportNo}</div>
                    </div>)
                }
              </>
            ),
          });
        } else {
          notification.success({ message: '操作成功', description: '作废成功' });
          this.props.getTransports(this.props.filter);
        }
      });
    }
    this.toggleCancelModal();
  }

  handleModifyReceiving = (data) => {
    const { receivingId, reasonForChange } = data;
    const { modifyInfo: { transportId } } = this.state;
    updateReceiving({ receivingId, reasonForChange, transportId })
      .then(() => {
        const { getTransports, filter } = this.props;
        return getTransports(filter);
      })
      .then(() => this.closeModifyReceivingModal());
  }

  render() {
    const {
      showVerifyModal,
      verifyRecord,
      cancelModal,
      nowPage,
      pageSize,
      modifyRejectModal,
      transportId,
      visible,
      acceptAuditModal,
      auditInfo,
      deleveryAuditModal,
      modifyReceivingModal,
      modifyModal,
      showCancelTransportModal,
      selectTransportId,
      showPdfModal,
      showInvoicePicModal
    } = this.state;
    const { transports } = this.props;
    const schema = {
      variable: true,
      // minWidth: this.organizationType === 5 ? 4350 : 4550,
      minWidth : 5100,
      minHeight: 420,
      columns: [
        {
          title: '运单状态',
          dataIndex: 'transportStatus',
          render: (text, record) => {
            const statusArr = getTransportStatus(record);
            return (
              <>
                {statusArr.map((item, index) =>
                  <Authorized key={index} authority={item.authority}>
                    <span style={{ color: item.color }}>
                      {item.word}
                    </span>
                    {
                      item.word === '已完成' && record.transportType === 2 && [1, 4, 5].findIndex((item) => item === this.organizationType) !== -1
                        ?
                          <>
                            <span style={{
                              margin: '0 3px',
                              width: '20px',
                              height: '20px',
                              textAlign: 'center',
                              fontSize: '12px',
                              borderRadius: '50%',
                              display: 'inline-block',
                              color: 'white',
                              padding: '2px 3px',
                              backgroundColor: record.accountAuditStatus === 1 ? 'green' : 'gray',
                            }}
                            >账
                            </span>
                            <span className={record.payStatus > 1 ? (record.payStatus === 2 ? styles.leftRightCircle : styles.circleGreen) : styles.circleGray}>支</span>
                            <span style={{
                              margin: '0 3px',
                              width: '20px',
                              height: '20px',
                              textAlign: 'center',
                              fontSize: '12px',
                              borderRadius: '50%',
                              display: 'inline-block',
                              color: 'white',
                              padding: '2px 3px',
                              backgroundColor: record.isCreateInvoice === 1 ? 'green' : 'gray',
                            }}
                            >票
                            </span>
                          </>
                        :
                        null
                    }
                  </Authorized>,
                )}
              </>
            );
          },
          width: 160,
          fixed: 'left',
        },
        {
          title: '运单号',
          dataIndex: 'transportNo',
          fixed: 'left',
          width: 220,
          render: (text, record) => {
            let replenishmentStatus = '';
            let chao = '';
            let error = '';

            if (this.viewSupplementPermission && record.replenishmentStatus === 1) replenishmentStatus =
              <span style={{
                display: 'block',
                backgroundColor: 'rgb(245, 154 ,35)',
                color: 'white',
                borderRadius: '50%',
                height: '20px',
                width: '20px',
                textAlign: 'center',
                fontSize: '12px',
              }}
              >补
              </span>;
            if (this.organizationType !== 1) replenishmentStatus = '';
            if (`${record.overDue}` === '1') {
              chao = <img width='22' height='22' src={chaoSvg} alt='超时' />;
            }
            if ((record.isMileageException || record.isTrailException || record.isSeriesOperate || record.modifyReceiving || record.modifyDentryid || record.modifyNum) && (this.organizationType === 4 || this.organizationType === 5)) {
              error = <img width='22' height='22' src={yiIcon} alt='异常' />;
            }
            return (
              <>
                <div style={{ position: 'relative' }}>
                  {text}
                  <span style={{ position: 'absolute' }}>
                    {replenishmentStatus}
                    {chao}
                    {error}
                  </span>
                </div>
              </>
            );
          },
        },
        {
          title: '项目名称',
          dataIndex: 'projectName',
          width: 282,
          render: (text, record) => (
            <div title={text} className='test-ellipsis' style={{ display: 'inline-block', width: '250px' }}>
              {text}
              {
                record.transportType === 2 ?
                  <span style={{
                    margin: '0 3px',
                    width: '20px',
                    height: '20px',
                    textAlign: 'center',
                    fontSize: '12px',
                    borderRadius: '50%',
                    display: 'inline-block',
                    color: 'white',
                    padding: '2px 3px',
                    backgroundColor: '#1890FF',
                  }}
                  >网
                  </span>
                  :
                  null
              }
            </div>
          ),
        },

        {
          title: '发布日期',
          dataIndex: 'createTime',
          width: 182,
          render: (time) => <div
            className='test-ellipsis'
            style={{
              display: 'inline-block',
              width: '150px',
            }}
          >{moment(time).format('YYYY-MM-DD HH:mm:ss')}
                            </div>,
        },
        {
          title: '车牌号',
          dataIndex: 'plateNumber',
          width: 132,
          render: (text) => <div
            title={text}
            className='test-ellipsis'
            style={{ display: 'inline-block', width: '100px' }}
          >{text}
                            </div>,
        },
        {
          title: '装车时间',
          dataIndex: 'deliveryTime',
          width: 182,
          render: (text) => <div
            className='test-ellipsis'
            style={{
              display: 'inline-block',
              width: '150px',
            }}
          >{text ? moment(text).format('YYYY-MM-DD HH:mm') : '--'}
                            </div>,
        },

        {
          title: '签收时间',
          dataIndex: 'receivingTime',
          width: 182,
          render: (text) => <div
            className='test-ellipsis'
            style={{
              display: 'inline-block',
              width: '150px',
            }}
          >{text ? moment(text).format('YYYY-MM-DD HH:mm') : '--'}
                            </div>,
        },
        {
          title: '卸货异常时间',
          dataIndex: 'unloadExceptionTime',
          width: 132,
          render: (text) => <div
            title={text}
            className='test-ellipsis'
            style={{ display: 'inline-block', width: '100px' }}
          >{text}
                            </div>,
        },
        {
          title: '计划量',
          dataIndex: 'goodsNum',
          width: 132,
          render: (text, record) => {
            const plannedweight = classifyGoodsWeight((record.deliveryItems || []), 'goodsUnit', ['goodsId', 'goodsUnitCN', 'goodsNum'], (summary, current) => summary.goodsNum += current.goodsNum);
            const renderItem = ({ goodsId, goodsNum, goodsUnitCN }) => <li
              className='test-ellipsis'
              key={goodsId}
            >{(goodsNum || 0).toFixed(3)}{goodsUnitCN}
                                                                       </li>;
            return <ul style={{ width: '100px', padding: 0, margin: 0 }}>{plannedweight.map(renderItem)}</ul>;
          },
        },
        {
          title: '实提量',
          dataIndex: 'deliveryNum',
          width: 132,
          render: (text, record) => {
            const plannedweight = classifyGoodsWeight((record.deliveryItems || []), 'goodsUnit', ['goodsId', 'goodsUnitCN', 'deliveryNum'], (summary, current) => summary.deliveryNum += current.deliveryNum);
            const renderItem = ({ goodsId, deliveryNum, goodsUnitCN }) => (
              <li
                className='test-ellipsis'
                key={goodsId}
              >{(deliveryNum || 0).toFixed(3)}{goodsUnitCN}
              </li>);
            return <ul style={{ width: '100px', padding: 0, margin: 0 }}>{plannedweight.map(renderItem)}</ul>;
          },
        },
        {
          title: '实收量',
          dataIndex: 'receivingNum',
          width: 132,
          render: (text, record) => {
            const plannedweight = classifyGoodsWeight((record.deliveryItems || []), 'goodsUnit', ['goodsId', 'goodsUnitCN', 'receivingNum'], (summary, current) => summary.receivingNum += current.receivingNum);
            const renderItem = ({ goodsId, receivingNum, goodsUnitCN }) => (
              <li
                className='test-ellipsis'
                key={goodsId}
              >{(receivingNum || 0).toFixed(3)}{goodsUnitCN}
              </li>);
            return <ul style={{ width: '100px', padding: 0, margin: 0 }}>{plannedweight.map(renderItem)}</ul>;
          },
        },
        {
          title: '过磅量',
          width: 132,
          render: (text, record) => {
            const plannedweight = classifyGoodsWeight((record.deliveryItems || []), 'goodsUnit', ['goodsId', 'goodsUnitCN', 'weighNum'], (summary, current) => summary.weighNum += current.weighNum);
            const renderItem = ({ goodsId, weighNum, goodsUnitCN }) => (
              <li
                className='test-ellipsis'
                key={goodsId}
              >{(weighNum || 0).toFixed(3)}{goodsUnitCN}
              </li>);
            return <ul style={{ width: '100px', padding: 0, margin: 0 }}>{plannedweight.map(renderItem)}</ul>;
          },
        },
        {
          title: '运输时长',
          dataIndex: 'transportTime',
          width: 132,
          render: (text) => <div
            title={text || '--'}
            className='test-ellipsis'
            style={{ display: 'inline-block', width: '100px' }}
          >{text || '--'}
                            </div>,
        },
        {
          title: '预计到达时间',
          dataIndex: 'predictArriveTime',
          width: 182,
          render: (text) => <div
            className='test-ellipsis'
            style={{
              display: 'inline-block',
              width: '150px',
            }}
          >{text ? moment(text).format('YYYY-MM-DD HH:mm') : '--'}
                            </div>,
        },
        {
          title: this.organizationType === 5 ? '货主' : '托运方',
          dataIndex: 'consignmentOrganizationName',
          width: 232,
          render: (text) => <div
            title={text}
            className='test-ellipsis'
            style={{
              display: 'inline-block',
              width: '200px',
            }}
          >{this.organizationType === 5 ? '鼎石智慧物流' : text}
                            </div>,
        },
        {
          title: '承运方',
          dataIndex: 'shipmentOrganizationName',
          width: 232,
          organizationType: [1, 3, 4],
          render: (text) => <div
            title={text}
            className='test-ellipsis'
            style={{ display: 'inline-block', width: '200px' }}
          >{text}
                            </div>,
        },
        {
          title: '提货点',
          dataIndex: 'deliveryName',
          width: 232,
          render: (text, record) => {
            const { deliveryItems } = record;
            const list = (deliveryItems || []).map(item => <li
              key={item.goodsId}
              className='test-ellipsis'
              title={`${item.deliveryName}`}
            >{`${item.deliveryName}`}
                                                           </li>);
            return <ul style={{ padding: 0, margin: 0, width: '200px' }}>{list}</ul>;
          },
        },
        {
          title: '货品名称',
          dataIndex: 'goodsName',
          width: 282,
          render: (text, record) => {
            const list = record.deliveryItems.map(item => {
              const word = getGoodsName(item);
              return (
                <li
                  title={word}
                  style={{ width: "260px" }}
                  className="test-ellipsis"
                  key={item.prebookingCorrelationId}
                >
                  {word}
                </li>);
            });
            return <ul style={{ padding: 0, margin: 0 }}>{list}</ul>;
          }
        },
        {
          title: '卸货点',
          dataIndex: 'receivingName',
          width: 232,
          render: (text) => <div
            title={text || ''}
            className='test-ellipsis'
            style={{ display: 'inline-block', width: '200px' }}
          >{text || ''}
                            </div>,
        },
        {
          title: '签收单号',
          dataIndex: 'receivingNo',
          width: 132,
          render: (text) => <div
            title={text || ''}
            className='test-ellipsis'
            style={{ display: 'inline-block', width: '100px' }}
          >{text || ''}
                            </div>,
          // render:(text)=>{
          //   if (text===null) return '--'
          //   return text
          // }
        },
        {
          title: '司机',
          dataIndex: 'driverUserName',
          width: 132,
          render: (text) => <div
            title={text}
            className='test-ellipsis'
            style={{ display: 'inline-block', width: '100px' }}
          >{text}
                            </div>,
        },
        {
          title: '联系电话',
          dataIndex: 'driverPhone',
          width: 162,
          render: (text) => <div
            title={text}
            className='test-ellipsis'
            style={{ display: 'inline-block', width: '130px' }}
          >{text}
                            </div>,
        },
        {
          title: '调度姓名',
          dataIndex: 'createUserName',
          width: 172
        },
        {
          title: '出库核对',
          dataIndex: 'outboundStatus',
          width: 132,
          render: (text) => {
            const dist = {
              0: '',
              1: '部分匹配',
              2: '已匹配'
            };
            if (dist[text]) return dist[text];
            return '-';
          }
        },
        {
          title: '实体单据',
          dataIndex: 'billRecycleStatus',
          width : 132,
          render: (text) => {
            const dist = {
              1: '待收',
              2: '待收',
              3: '承运方已收',
              4: '托运方已收',
              5: '货权方已收',
            };
            if (dist[text]) return dist[text];
            return '';
          }
        },
        {
          title: '预约单发单价',
          dataIndex: 'maximumShippingPrice',
          width : 100,
        },
        {
          title: '数据来源',
          dataIndex: 'replenishmentStatus',
          width: 150,
          render: (text) => (REPLENISHMENT_STATUS_DIST[text])
        },
        {
          title: '来源单号',
          dataIndex: 'trajectoryNo',
          // width: 250,
          render: (text) => text || '-'
        },
      ],
      operations: (record) => {
        const status = translateTransportStauts(record);
        const { receivingId } = record;
        const detail = {
          title: '详情',
          onClick: (record) => {
            router.push(`/buiness-center/transportList/transport/transportDetail?transportId=${record.transportId}`);
          },
        };
        const modify = {
          title: '修改',
          onClick: (record) => {
            this.modifyTransport = record;
            this.setState({
              modifyModal: true,
            });
          },
          auth: (record.transportInternalStatus === 1 || !this.modifyPermission || record.shipmentOrganizationId !== this.organizationId)
            ? ['hide']
            : [TRANSPORT_MODIFY],
        };

        const showCancelTransportModal = {
          title: '取消运单',
          onClick: (record) => {
            this.setState({
              selectTransportId: record.transportId,
              showCancelTransportModal: true
            });
          },
          auth: (record.shipmentOrganizationId !== this.organizationId) ? ['hide'] : undefined
        };

        const viewCertificate = {
          title: record.orderPayDentryid ? '查看支付凭证' : '凭证处理中',
          onClick: (record) => {
            if (record.orderPayDentryid) {
              window.open(getOssImg(record.orderPayDentryid));
            }
          },
        };

        const complete = () => {
          const { location: { query: { orderState } } } = this.props;
          return this.props.orderBill && Number(orderState) === 5 ? [viewCertificate, modify] : [modify];
        };

        const modifyReceiving = {
          title: '修改卸货点',
          onClick: async () => {
            const modifyInfo = await getTransportDetail(record.transportId);
            this.setState({
              modifyReceivingModal: true,
              modifyInfo,
            });
          },
          auth: (!receivingId || record.shipmentOrganizationId !== this.organizationId)
            ? ['hide']
            : [TRANSPORT_MODIFY],
        };

        const operations = {
          [TRANSPORT_FINAL_STATUS.UNTREATED]: [
            {
              title: '取消运单',
              onClick: (record) => {
                changeTransportStatus({
                  transportId: record.transportId,
                  iseffectiveStatus: IS_EFFECTIVE_STATUS.IS_EFFECTIVE_DELETE,
                })
                  .then(() => this.props.getTransports(this.props.filter));
              },
              confirmMessage: () => `确定取消该运单吗？`,
              // TODO取消运单权限暂由删除权限代替
              auth: record.shipmentOrganizationId !== this.organizationId ? ['hide'] : [TRANSPORT_DELETE],
            },
            modifyReceiving,
            modify,
          ],
          [TRANSPORT_FINAL_STATUS.ACCEPT]: [modifyReceiving, showCancelTransportModal, modify],
          [TRANSPORT_FINAL_STATUS.DRIVER_REFUSE]: [],
          [TRANSPORT_FINAL_STATUS.CANCEL]: [],
          [TRANSPORT_FINAL_STATUS.CONSIGNMENT_REFUSE]: [
            {
              title: '修改回单',
              auth: [TRANSPORT_SHIPMENT_MODIFY_RECEIPT],
              // auth : (record?.logisticsBusinessTypeEntity?.auditorOrganization === '5,4') ? [TRANSPORT_SHIPMENT_MODIFY_RECEIPT] : ['hide'],
              onClick: async (record) => {
                await this.props.getTransportReject(record.transportId);
                this.setState({
                  transportId: record.transportId,
                  modifyRejectModal: true,
                });
              },
            },
            modify,
          ],
          [TRANSPORT_FINAL_STATUS.COMPLETE]: complete(record),
          [TRANSPORT_FINAL_STATUS.SHIPMENT_REFUSE]: [modify],
          [TRANSPORT_FINAL_STATUS.UNDELIVERY]: [modifyReceiving, showCancelTransportModal, modify],
          [TRANSPORT_FINAL_STATUS.TRANSPORTING]: [modifyReceiving, modify],  // 运输中
          [TRANSPORT_FINAL_STATUS.RECEIVED]: [modifyReceiving, modify],  // 已到站
          [TRANSPORT_FINAL_STATUS.SIGNED]: [ // 已签收
            {
              title: '审核',
              onClick: (record) => {
                this.setState({ showVerifyModal: true, verifyRecord: record });
              },
              auth: (this.organizationType === 4) ? [TRANSPORT_JUDGE_RECEIPT] : ['hide'],
            },
            modify,
          ],
          // TODO 这里需要一个判断，是否已提货，5.15确认后不需判断，5.30再次核对需求，需要判断是否已提货，若多提，则可以通过修改来去除未提的提货点
          [TRANSPORT_FINAL_STATUS.TRANSPORT_EXECPTION]: [
            {
              title: '取消运单',
              onClick: (record) => {
                getExceptions({ transportId: record.transportId, isProcessing: true, limit: 100, offset: 0 })
                  .then(data => changeTransportStatus({
                    transportId: record.transportId,
                    transpotExceptionId: data.items[0].transpotExceptionId,
                    iseffectiveStatus: IS_EFFECTIVE_STATUS.IS_EFFECTIVE_DELETE,
                  }))
                  .then(() => this.props.getTransports(this.props.filter));
              },
              confirmMessage: () => `确定取消该运单吗？`,
              auth: record.shipmentOrganizationId !== this.organizationId ? ['hide'] : [TRANSPORT_DELETE],
            },
            {
              title: '修改运单',
              onClick: (record) => {
                router.push(`transport/transportModify?transportId=${record.transportId}`);
              },
              auth: [TRANSPORT_MODIFY],
            },
            {
              title: '忽略',
              onClick: (record) => {
                getExceptions({ transportId: record.transportId, isProcessing: true, limit: 100, offset: 0 })
                  .then(data =>
                    // TODO transpotExceptionId需要查询后获取，服务端暂时只提供列表查询异常
                    changeTransportStatus({
                      transportId: record.transportId,
                      transpotExceptionId: data.items[0].transpotExceptionId,
                      exceptionStatus: EXECPTION_STATUS.EXECPTION_REFUSE,
                    }),
                  )
                  .then(() => this.props.getTransports(this.props.filter));
              },
              confirmMessage: () => `确定忽略该异常吗？`,
              auth: [TRANSPORT_JUDGE_EXCEPTION],
            },
          ],
          [TRANSPORT_FINAL_STATUS.SHIPMENT_UNAUDITED]: [
            {
              title: '审核',
              onClick: (record) => {
                this.setState({ showVerifyModal: true, verifyRecord: record });
              },
              auth: (this.organizationType === 5) ? undefined : ['hide'],
            },
            modify,
          ],
          [TRANSPORT_FINAL_STATUS.ACCEPT_UNTREATED]: [
            {
              title: '确认',
              onClick: async (record) => {
                const auditInfo = await getTransportDetail(record.transportId);
                this.setState({ acceptAuditModal: true, auditInfo });
              },
              auth: (this.organizationType === 5) ? undefined : ['hide'],
            },
            {
              title: '拒绝',
              onClick: (record) => {
                confirmTransport({ transportId: record.transportId, isConfirm: false })
                  .then(() => this.props.getTransports(this.props.filter));
              },
              confirmMessage: () => `是否拒绝该运单？`,
              auth: (this.organizationType === 5) ? undefined : ['hide'],
            },
            modify,
          ],
          [TRANSPORT_FINAL_STATUS.DELIVERY_UNTREATED]: [
            {
              title: '审核',
              onClick: async (record) => {
                const auditInfo = await getTransportDetail(record.transportId);
                this.setState({ deleveryAuditModal: true, auditInfo });
              },
              auth: (this.organizationType === 4) ? undefined : ['hide'],
            },
            modify,
          ],
          [TRANSPORT_FINAL_STATUS.DELIVERY_REFUSE]: [modify],
        }[status] || [];
        // 平台作废运单
        const cancel = {
          title: '作废运单',
          onClick: (record) => {
            this.setState({
              cancelModal: true,
            });
            this.cancelTransport = record;
          },
          auth: [TRANSPORT_CANCEL],
        };

        if (
          status !== TRANSPORT_FINAL_STATUS.CANCEL
          &&
          // status !== TRANSPORT_FINAL_STATUS.SHIPMENT_REFUSE
          // &&
          status !== TRANSPORT_FINAL_STATUS.DRIVER_REFUSE
          &&
          status !== TRANSPORT_FINAL_STATUS.UNTREATED
          &&
          this.organizationType === 1
        ) return [detail, cancel, ...operations];

        return [detail, ...operations];
      }, // 看article.jsx的事例
    };

    const columns = schema.columns.filter(item => {
      if (item.organizationType) {
        return item.organizationType.indexOf(this.organizationType) > -1;
      }
      return true;
    });
    this.schema = { ...schema, columns };
    return (
      <>
        <Table
          rowKey='transportId'
          ref={this.tableRef}
          onSelectRow={this.onSelectRow}
          renderCommonOperate={this.searchTableList}
          multipleSelect
          pagination={{ current: nowPage, pageSize }}
          onChange={this.onChange}
          schema={this.schema}
          dataSource={transports}
        />
        {this.organizationType === 4 ?
          <div style={{ color: '#1890FF' }}>合计：实提量: {transports.deliveryTotal || 0}， 签收量：{transports.receivingTotal || 0}， 过磅量：{transports.weighTotal || 0}</div>
          : null
        }

        <Modal
          width='750px'
          visible={showCancelTransportModal}
          maskClosable={false}
          destroyOnClose
          onCancel={() => this.setState({ showCancelTransportModal: false })}
          footer={null}
          title='取消原因'
        >
          <CancelTransportModal
            refrash={this.refrash}
            changeTransportStatus={changeTransportStatus}
            transportId={selectTransportId}
            onCancel={() => this.setState({ showCancelTransportModal: false })}
          />
        </Modal>

        <Modal title='导出PDF' footer={null} width={648} visible={showPdfModal} onCancel={this.onTogglePdfModal}>
          <ExportPdf
            onCancel={this.onTogglePdfModal}
            func={this.exportPdf}
          />
        </Modal>

        <Modal title='导出子单据图片' footer={null} width={648} visible={showInvoicePicModal} onCancel={this.onToggleInvoicePicModal}>
          <ExportInvoicePic
            onCancel={this.onToggleInvoicePicModal}
            func={this.exportInvoicePic}
          />
        </Modal>

        <Modal
          width='750px'
          visible={showVerifyModal}
          maskClosable={false}
          destroyOnClose
          onCancel={() => this.setState({ showVerifyModal: false })}
          footer={null}
        >
          <TransportVerify
            verifyRecord={verifyRecord}
            close={() => this.setState({ showVerifyModal: false })}
            refreshTransportsList={this.onSearch}
          />
        </Modal>
        <Modal
          visible={acceptAuditModal}
          maskClosable={false}
          title='确认运单'
          destroyOnClose
          onCancel={() => this.setState({ acceptAuditModal: false })}
          footer={null}
        >
          {acceptAuditModal &&
            <div className='transport_accept_info_modal'>
              <div>司机：<span>{auditInfo.driverUserName}</span></div>
              <div>联系电话：<span>{auditInfo.driverUserPhone}</span></div>
              <div>车辆：<span>{auditInfo.plateNumber}</span></div>
              <div>备注: <span>无</span></div>
              <div style={{ width: '100%' }}>运费: {this.acceptCheck()}</div>
              <div style={{ width: '100%', textAlign: 'center' }}>
                <Button type='primary' onClick={this.acceptPass}>确认</Button>
              </div>
            </div>}
        </Modal>
        <Modal
          visible={deleveryAuditModal}
          maskClosable={false}
          title='审核运单'
          width={800}
          destroyOnClose
          onCancel={() => {
            this.totalPrice = undefined;
            this.setState({
              deleveryAuditModal: false,
              consignmentReceiptStatus: 3,
            });
          }}
          footer={null}
        >
          {deleveryAuditModal && this.deliveryAudit()}
        </Modal>
        <Modal
          visible={modifyRejectModal}
          maskClosable={false}
          destroyOnClose
          onCancel={() => this.setState({
            modifyRejectModal: false,
          })}
          width={648}
          footer={null}
        >
          {modifyRejectModal &&
            <ModifyTransportReject closeModal={this.closeModifyRejectModal} transportId={transportId} />
          }
        </Modal>
        <Modal
          centered
          width={720}
          destroyOnClose
          title='导出模板'
          maskClosable={false}
          visible={visible}
          onCancel={this.handleCancel}
          footer={null}
        >
          <ExcelOutput
            getTemplateList={getTemplate}
            fieldArray={this.filterFieldArray()}
            exportExcelAction={this.handleOutputExcelBtnClick}
            addTemplate={postTemplate}
            templateType={1}
          />
        </Modal>
        <Modal
          visible={modifyReceivingModal}
          maskClosable={false}
          destroyOnClose
          title='修改卸货点'
          onCancel={this.closeModifyReceivingModal}
          width={648}
          footer={null}
        >
          <SchemaForm schema={this.modifySchema}>
            <Item field='receivingId' />
            <Item field='receivingAddress' />
            <Item field='contactName' />
            <Item field='contactPhone' />
            <Item field='reasonForChange' />
            <div style={{ textAlign: 'right' }}>
              <Button className='mr-10' type='default' onClick={this.closeModifyReceivingModal}>取消</Button>
              <DebounceFormButton label='保存' type='primary' onClick={this.handleModifyReceiving} />
            </div>
          </SchemaForm>
        </Modal>
        <Modal
          visible={cancelModal}
          maskClosable={false}
          destroyOnClose
          title='运单作废'
          onCancel={this.toggleCancelModal}
          width={648}
          footer={null}
        >
          <SchemaForm
            wrapperCol={{
              xs: { span: 24 },
            }}
            schema={this.cancelSchema}
          >
            <div style={{ margin: '0 auto', width: '80%' }}>
              <h4>作废原因<span style={{ color: 'red' }}>(必填)</span></h4>
              <Item field='verifyReason' />
              <div style={{ textAlign: 'right', marginTop: '25px' }}>
                <Button className='mr-10' type='default' onClick={this.toggleCancelModal}>取消</Button>
                <DebounceFormButton label='保存' type='primary' onClick={this.confirmCancel} />
              </div>
            </div>
          </SchemaForm>
        </Modal>
        {/* 修改弹窗 */}
        <Modal
          visible={modifyModal}
          title='修改'
          onCancel={this.toggleModifyModal}
          width={900}
          footer={null}
        >
          <div style={{ color: 'grey' }}>说明：当多项信息同时修改时，请注意核查你的信息，提交后修改的信息将同步生效</div>
          {modifyModal &&
            <ModifyModal data={this.modifyTransport} onCloseModal={this.toggleModifyModal} refrash={this.refrash} />}
        </Modal>
      </>
    );
  }
}

export default Transport;
