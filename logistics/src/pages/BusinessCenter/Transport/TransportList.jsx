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

  // ????????????????????????????????????
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
      word: '????????????',
    },
    {
      id: 'transportNo',
      word: '?????????',
    },
    {
      id: 'projectName',
      word: '????????????',
    },
    {
      id: 'shipmentName',
      word: '?????????',
      display: [3], // 3????????? 4?????????  5?????????
    },
    {
      id: 'deliveryName',
      word: '?????????',
    },
    {
      id: 'goodsName',
      word: '????????????',
    },
    {
      id: 'receivingName',
      word: '?????????',
    },
    {
      id: 'goodsNum',
      word: '????????????',
    },
    {
      id: 'deliveryNum',
      word: '????????????',
    },
    {
      id: 'receivingNum',
      word: '????????????',
    },
    {
      id: 'weighNum',
      word: '????????????',
    },
    {
      id: 'billNumber',
      word: '????????????',
    },
    {
      id: 'driverUserName',
      word: '???????????????',
    },
    {
      id: 'plateNumber',
      word: '?????????',
    },
    {
      id: 'driverPhone',
      word: '???????????????',
    },
    {
      id: 'transportCreateTime',
      word: '????????????',
    },
    {
      id: 'deliveryTime',
      word: '????????????',
    },
    {
      id: 'receivingTime',
      word: '????????????',
    },
    {
      id: 'predictArriveTime',
      word: '??????????????????',
    },
    {
      id: 'transportTime',
      word: '????????????',
    },
    {
      id: 'consignmentOrganizationName',
      word: '?????????',
    },
    {
      id: 'maximumShippingPrice',
      word: '??????????????????',
    }
  ]

  searchSchema = {
    transportNo: {
      label: '?????????',
      placeholder: '??????????????????',
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
      label: '????????????',
      placeholder: '?????????????????????',
      component: 'input',
    },
    projectName: {
      label: '????????????',
      placeholder: '?????????????????????',
      component: 'input',
    },
    status: {
      label: '????????????',
      placeholder: '?????????????????????',
      component: 'select',
      options: TRANSPORT_STATUS_OPTIONS.map(item => ({
        key: item.key,
        value: item.value,
        label: item.title,
      })),
      mode: 'multiple',
    },
    deliveryName: {
      label: '?????????',
      placeholder: '??????????????????',
      component: 'input',
    },
    receivingName: {
      label: '?????????',
      placeholder: '??????????????????',
      component: 'input',
    },
    shipmentOrganizationName: {
      label: '?????????',
      placeholder: '??????????????????',
      component: 'input',
      visible: () => this.organizationType !== 5,
    },
    createTime: {
      label: '????????????',
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
      label: '????????????',
      placeholder: '?????????????????????',
      component: 'input',
    },
    driverPhone: {
      label: '????????????',
      placeholder: '?????????????????????',
      component: 'input',
    },
    plateNumber: {
      label: '?????????',
      placeholder: '??????????????????',
      component: 'input',
    },
    errorSign: {
      label: '????????????',
      component: 'select',
      placeholder: '?????????????????????',
      props: {
        mode: 'multiple',
      },
      options: [{
        label: '??????????????????',
        value: 1,
      }, {
        label: '??????????????????',
        value: 2,
      }, {
        label: '??????????????????',
        value: 3,
      }, {
        label: '????????????',
        value: 5,
      }, {
        label: '????????????',
        value: 6,
      }, {
        label: '???????????????',
        value: 7,
      }],
    },
    overDue: {
      label: '????????????',
      placeholder: '?????????',
      component: 'select',
      options: [
        {
          key: 0,
          label: '?????????',
          value: 0,
        },
        {
          key: 1,
          label: '?????????',
          value: 1,
        },
      ],
    },
    createUserName: {
      label: '????????????',
      placeholder: '?????????????????????',
      component: 'input',
    },
    deliveryTimeRange: {
      label: '????????????',
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
      label: '????????????',
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
      label: '????????????',
      placeholder: '?????????????????????',
      component: 'select',
      options: [
        {
          key: 0,
          label: '?????????',
          value: 0,
        },
        {
          key: 1,
          label: '?????????',
          value: 1,
        },
      ],
    },
    accountTransportDriver: {
      label: '????????????',
      placeholder: '?????????????????????',
      component: 'select',
      options: [
        {
          key: 1,
          label: '?????????',
          value: 1,
        },
        {
          key: 2,
          label: '?????????',
          value: 2,
        },
      ],
    },
    isCreateInvoice: {
      label: '????????????',
      placeholder: '?????????????????????',
      component: 'select',
      options: [
        {
          key: 0,
          label: '?????????',
          value: 0,
        },
        {
          key: 1,
          label: '?????????',
          value: 1,
        },
        {
          key: 2,
          label: '?????????',
          value: 2,
        },
      ],
    },
    outboundStatusList: {
      label: '??????????????????',
      placeholder: '???????????????????????????',
      component: 'select',
      options: [
        {
          label: '?????????',
          key: 0,
          value: 0
        },
        {
          label: '????????????',
          key: 1,
          value: 1
        },
        {
          label: '?????????',
          key: 2,
          value: 2
        },
      ]
    },
    billRecycleStatusList: {
      label: '?????????????????????',
      placeholder: '???????????????????????????',
      component: 'select',
      options: [
        {
          label: '??????',
          key: '1,2',
          value: '1,2'
        },
        {
          label: '???????????????',
          key: 3,
          value: 3
        },
        {
          label: '???????????????',
          key: 4,
          value: 4
        },
        {
          label: '???????????????',
          key: 5,
          value: 5
        }
      ]
    },
    totalQuantity: {
      label: '????????????',
      placeholder: '????????????????????????',
      visible: this.organizationType === CONSIGNMENT,
      component: 'select',
      options: [
        {
          label: '??????',
          key: 1,
          value: true
        },
        {
          label: '?????????',
          key: 2,
          value: false
        },
      ]
    },
    replenishmentStatus : {
      label : '????????????',
      placeholder : '?????????????????????',
      component : 'select',
      options : renderOptions(REPLENISHMENT_STATUS_DIST)
    }
  }

  cancelSchema = {
    verifyReason: {
      component: 'input.textArea',
      placeholder: '?????????????????????',
      maxLength: 200,
      rows: 4,
      rules: {
        required: [true, '?????????????????????'],
        max: [200, '????????????????????????200?????????'],
      },
    },
  }

  modifySchema = {
    receivingId: {
      label: '?????????',
      component: 'select',
      rules: {
        required: [true, '?????????????????????'],
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
      placeholder: '??????????????????',
    },
    receivingAddress: {
      label: '????????????',
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
      label: '?????????',
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
      label: '????????????',
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
      label: '????????????',
      component: 'input.textArea',
      rules: {
        required: [true, '?????????????????????'],
      },
      placeholder: '?????????????????????',
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

    // ????????????
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
    // ??????????????????????????? ?????????????????? ??????????????????
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
    // TODO ???????????????
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
        <Menu.Item onClick={this.handleOutputExcelBtnClick}>????????????</Menu.Item>
        <Menu.Item onClick={this.showTemplateModal}>????????????</Menu.Item>
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
            <DebounceFormButton label='??????' type='primary' className='mr-10' onClick={this.handleSearchButtonClick} />
            <DebounceFormButton label='??????' className='mr-10' onClick={this.handleResetClick} />
            {this.viewSupplementPermission &&
              <Checkbox checked={replenishmentChecked} onChange={this.replenishmentVisible}>???????????????</Checkbox>}
          </div>
          <div>
            <DebounceFormButton className='mr-10' label='?????????????????????' onClick={this.onToggleInvoicePicModal} />
            <DebounceFormButton className='mr-10' label='???????????????PDF' onClick={this.onTogglePdfModal} />
            <Dropdown overlay={menu}>
              <Button type='primary' className='mr-10'>??????Excel</Button>
            </Dropdown>
            <Authorized authority={[TRANSPORT_EVENTS_EXPORT]}>
              <DebounceFormButton label='??????????????????' onClick={this.handleOutputTransportEventsBtnClick} />
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
    let params = { ..._status, accessToken: this.accessToken, organizationType: this.organizationType, organizationId: this.organizationId, fileName: '????????????' };
    // ????????????????????????
    if (isNumber(templateId)) params = { ...params, templateId };
    /*
    * ?????????????????????????????????
    * ????????????
    * */
    if (isEmpty(omit(newFilter, 'isPermissonSelectAll')) && selectedRow.length < 1) {
      if (count > 20000) {
        return Modal.error({
          title: '???????????????????????????????????????20000???????????????????????????'
        });
      }
      return sendTransportExcelPost(params).then(() => router.push('/buiness-center/exportAndImportRecord'));
    }
    // ????????????
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
          title: '???????????????????????????????????????20000???????????????????????????'
        });
      }

      return sendTransportExcelPost(params).then(() => router.push('/buiness-center/exportAndImportRecord'));
    }
    // ?????????????????????
    if (selectedRow.length > 20000) {
      return Modal.error({
        title: '???????????????????????????????????????20000???????????????????????????'
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

    // ?????????????????????
    if (selectedRow.length) {
      if (selectedRow.length > 500) {
        return Modal.error({
          title: '??????????????????????????????????????????500??????'
        });

      }
      const idList = selectedRow.map(item => item.transportId);
      params = { ...params, idList };

      routerToExportPage(exportTransportsPdf, params);
    }

    // ?????????????????????(??????????????????)
    if (selectedRow.length === 0) {
      if (count > 500) {
        return Modal.error({
          title: '??????????????????????????????????????????500??????'
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
      fileName: "????????????",
    };

    // ?????????????????????
    if (selectedRow.length) {
      if (selectedRow.length > 500) {
        return Modal.error({
          title: '??????????????????????????????????????????500??????'
        });
      }
      const idList = selectedRow.map(item => item.transportId);
      params = { ...params, idList };

      routerToExportPage(exportTransportZip, params);
    } else {
      // ?????????????????????(??????????????????)
      if (count > 500) {
        return Modal.error({
          title: '??????????????????????????????????????????500??????'
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
        message: '???????????????????????????!',
        description: '????????????????????????',
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
      const fileName = `????????????${startDistributTime}-${endDistributTime}`;
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
      <span>??????
        <InputNumber
          disabled={!!releaseHall}
          onBlur={this.changeAcceptPrice}
          min={0}
          autoFocus
          defaultValue={price}
          style={{ width: '80px' }}
        />
        {`${unit[measurementUnit]?.label || '???/???'} ????????????${source[measurementSource]?.label || '?????????????????????'}`}
      </span>
    );
  }

  acceptPass = () => {
    const { auditInfo: { transportId, deliveryItems }, acceptSinglePrice } = this.state;
    if (!isNumber(+acceptSinglePrice)) return message.error('????????????????????????');
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
        <div>???????????????
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
        >???????????????{`${item.freightPriceConsignment}${unit[measurementUnit]?.label || '???/???'}`}
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
                <div style={{ lineHeight: '300px', textAlign: 'center', height: '100%' }}>????????????????????????...</div>
              </div>
            </Col>
          </Row> :
          <Carousel>
            {imgArr}
          </Carousel>
        }
        <div className='transport_delivery_info_modal'>
          {deliveryinfo}
          <div style={{ height: '32px', lineHeight: '32px' }}>???????????????<InputNumber
            min={0}
            style={{ width: '80px' }}
            disabled={!releaseHall}
            onChange={(value) => this.totalPrice = +value}
            defaultValue={`${price}`}
          />???
          </div>
        </div>
        <div style={{ marginTop: '20px', display: 'flex' }}>
          <label htmlFor='auditRadioGroup'>?????????</label>
          <Radio.Group id='auditRadioGroup' onChange={radioChange} defaultValue={3}>
            <Radio value={3}>??????</Radio>
            <Radio value={2}>??????</Radio>
          </Radio.Group>
          <label htmlFor='verifyReason'>?????????</label>
          <Input.TextArea id='verifyReason' style={{ width: '200px' }} maxLength={50} />
        </div>
        <div style={{ textAlign: 'right' }}>
          <Button onClick={deliveryPass} type='primary'>??????</Button>
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
            title: '????????????',
            content: (
              <>
                {
                  accountBill.map(item =>
                    <div key={item.accountTransportNo}>
                      <div>???????????????{ORGANIZATION_TEXT[item.organizationType]}????????????????????????????????????</div>
                      <div>???????????????{item.accountTransportNo}</div>
                    </div>)
                }
              </>
            ),
          });
        } else {
          notification.success({ message: '????????????', description: '????????????' });
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
          title: '????????????',
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
                      item.word === '?????????' && record.transportType === 2 && [1, 4, 5].findIndex((item) => item === this.organizationType) !== -1
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
                            >???
                            </span>
                            <span className={record.payStatus > 1 ? (record.payStatus === 2 ? styles.leftRightCircle : styles.circleGreen) : styles.circleGray}>???</span>
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
                            >???
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
          title: '?????????',
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
              >???
              </span>;
            if (this.organizationType !== 1) replenishmentStatus = '';
            if (`${record.overDue}` === '1') {
              chao = <img width='22' height='22' src={chaoSvg} alt='??????' />;
            }
            if ((record.isMileageException || record.isTrailException || record.isSeriesOperate || record.modifyReceiving || record.modifyDentryid || record.modifyNum) && (this.organizationType === 4 || this.organizationType === 5)) {
              error = <img width='22' height='22' src={yiIcon} alt='??????' />;
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
          title: '????????????',
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
                  >???
                  </span>
                  :
                  null
              }
            </div>
          ),
        },

        {
          title: '????????????',
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
          title: '?????????',
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
          title: '????????????',
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
          title: '????????????',
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
          title: '??????????????????',
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
          title: '?????????',
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
          title: '?????????',
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
          title: '?????????',
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
          title: '?????????',
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
          title: '????????????',
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
          title: '??????????????????',
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
          title: this.organizationType === 5 ? '??????' : '?????????',
          dataIndex: 'consignmentOrganizationName',
          width: 232,
          render: (text) => <div
            title={text}
            className='test-ellipsis'
            style={{
              display: 'inline-block',
              width: '200px',
            }}
          >{this.organizationType === 5 ? '??????????????????' : text}
                            </div>,
        },
        {
          title: '?????????',
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
          title: '?????????',
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
          title: '????????????',
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
          title: '?????????',
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
          title: '????????????',
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
          title: '??????',
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
          title: '????????????',
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
          title: '????????????',
          dataIndex: 'createUserName',
          width: 172
        },
        {
          title: '????????????',
          dataIndex: 'outboundStatus',
          width: 132,
          render: (text) => {
            const dist = {
              0: '',
              1: '????????????',
              2: '?????????'
            };
            if (dist[text]) return dist[text];
            return '-';
          }
        },
        {
          title: '????????????',
          dataIndex: 'billRecycleStatus',
          width : 132,
          render: (text) => {
            const dist = {
              1: '??????',
              2: '??????',
              3: '???????????????',
              4: '???????????????',
              5: '???????????????',
            };
            if (dist[text]) return dist[text];
            return '';
          }
        },
        {
          title: '??????????????????',
          dataIndex: 'maximumShippingPrice',
          width : 100,
        },
        {
          title: '????????????',
          dataIndex: 'replenishmentStatus',
          width: 150,
          render: (text) => (REPLENISHMENT_STATUS_DIST[text])
        },
        {
          title: '????????????',
          dataIndex: 'trajectoryNo',
          // width: 250,
          render: (text) => text || '-'
        },
      ],
      operations: (record) => {
        const status = translateTransportStauts(record);
        const { receivingId } = record;
        const detail = {
          title: '??????',
          onClick: (record) => {
            router.push(`/buiness-center/transportList/transport/transportDetail?transportId=${record.transportId}`);
          },
        };
        const modify = {
          title: '??????',
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
          title: '????????????',
          onClick: (record) => {
            this.setState({
              selectTransportId: record.transportId,
              showCancelTransportModal: true
            });
          },
          auth: (record.shipmentOrganizationId !== this.organizationId) ? ['hide'] : undefined
        };

        const viewCertificate = {
          title: record.orderPayDentryid ? '??????????????????' : '???????????????',
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
          title: '???????????????',
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
              title: '????????????',
              onClick: (record) => {
                changeTransportStatus({
                  transportId: record.transportId,
                  iseffectiveStatus: IS_EFFECTIVE_STATUS.IS_EFFECTIVE_DELETE,
                })
                  .then(() => this.props.getTransports(this.props.filter));
              },
              confirmMessage: () => `???????????????????????????`,
              // TODO??????????????????????????????????????????
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
              title: '????????????',
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
          [TRANSPORT_FINAL_STATUS.TRANSPORTING]: [modifyReceiving, modify],  // ?????????
          [TRANSPORT_FINAL_STATUS.RECEIVED]: [modifyReceiving, modify],  // ?????????
          [TRANSPORT_FINAL_STATUS.SIGNED]: [ // ?????????
            {
              title: '??????',
              onClick: (record) => {
                this.setState({ showVerifyModal: true, verifyRecord: record });
              },
              auth: (this.organizationType === 4) ? [TRANSPORT_JUDGE_RECEIPT] : ['hide'],
            },
            modify,
          ],
          // TODO ?????????????????????????????????????????????5.15????????????????????????5.30???????????????????????????????????????????????????????????????????????????????????????????????????????????????
          [TRANSPORT_FINAL_STATUS.TRANSPORT_EXECPTION]: [
            {
              title: '????????????',
              onClick: (record) => {
                getExceptions({ transportId: record.transportId, isProcessing: true, limit: 100, offset: 0 })
                  .then(data => changeTransportStatus({
                    transportId: record.transportId,
                    transpotExceptionId: data.items[0].transpotExceptionId,
                    iseffectiveStatus: IS_EFFECTIVE_STATUS.IS_EFFECTIVE_DELETE,
                  }))
                  .then(() => this.props.getTransports(this.props.filter));
              },
              confirmMessage: () => `???????????????????????????`,
              auth: record.shipmentOrganizationId !== this.organizationId ? ['hide'] : [TRANSPORT_DELETE],
            },
            {
              title: '????????????',
              onClick: (record) => {
                router.push(`transport/transportModify?transportId=${record.transportId}`);
              },
              auth: [TRANSPORT_MODIFY],
            },
            {
              title: '??????',
              onClick: (record) => {
                getExceptions({ transportId: record.transportId, isProcessing: true, limit: 100, offset: 0 })
                  .then(data =>
                    // TODO transpotExceptionId??????????????????????????????????????????????????????????????????
                    changeTransportStatus({
                      transportId: record.transportId,
                      transpotExceptionId: data.items[0].transpotExceptionId,
                      exceptionStatus: EXECPTION_STATUS.EXECPTION_REFUSE,
                    }),
                  )
                  .then(() => this.props.getTransports(this.props.filter));
              },
              confirmMessage: () => `???????????????????????????`,
              auth: [TRANSPORT_JUDGE_EXCEPTION],
            },
          ],
          [TRANSPORT_FINAL_STATUS.SHIPMENT_UNAUDITED]: [
            {
              title: '??????',
              onClick: (record) => {
                this.setState({ showVerifyModal: true, verifyRecord: record });
              },
              auth: (this.organizationType === 5) ? undefined : ['hide'],
            },
            modify,
          ],
          [TRANSPORT_FINAL_STATUS.ACCEPT_UNTREATED]: [
            {
              title: '??????',
              onClick: async (record) => {
                const auditInfo = await getTransportDetail(record.transportId);
                this.setState({ acceptAuditModal: true, auditInfo });
              },
              auth: (this.organizationType === 5) ? undefined : ['hide'],
            },
            {
              title: '??????',
              onClick: (record) => {
                confirmTransport({ transportId: record.transportId, isConfirm: false })
                  .then(() => this.props.getTransports(this.props.filter));
              },
              confirmMessage: () => `????????????????????????`,
              auth: (this.organizationType === 5) ? undefined : ['hide'],
            },
            modify,
          ],
          [TRANSPORT_FINAL_STATUS.DELIVERY_UNTREATED]: [
            {
              title: '??????',
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
        // ??????????????????
        const cancel = {
          title: '????????????',
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
      }, // ???article.jsx?????????
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
          <div style={{ color: '#1890FF' }}>??????????????????: {transports.deliveryTotal || 0}??? ????????????{transports.receivingTotal || 0}??? ????????????{transports.weighTotal || 0}</div>
          : null
        }

        <Modal
          width='750px'
          visible={showCancelTransportModal}
          maskClosable={false}
          destroyOnClose
          onCancel={() => this.setState({ showCancelTransportModal: false })}
          footer={null}
          title='????????????'
        >
          <CancelTransportModal
            refrash={this.refrash}
            changeTransportStatus={changeTransportStatus}
            transportId={selectTransportId}
            onCancel={() => this.setState({ showCancelTransportModal: false })}
          />
        </Modal>

        <Modal title='??????PDF' footer={null} width={648} visible={showPdfModal} onCancel={this.onTogglePdfModal}>
          <ExportPdf
            onCancel={this.onTogglePdfModal}
            func={this.exportPdf}
          />
        </Modal>

        <Modal title='?????????????????????' footer={null} width={648} visible={showInvoicePicModal} onCancel={this.onToggleInvoicePicModal}>
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
          title='????????????'
          destroyOnClose
          onCancel={() => this.setState({ acceptAuditModal: false })}
          footer={null}
        >
          {acceptAuditModal &&
            <div className='transport_accept_info_modal'>
              <div>?????????<span>{auditInfo.driverUserName}</span></div>
              <div>???????????????<span>{auditInfo.driverUserPhone}</span></div>
              <div>?????????<span>{auditInfo.plateNumber}</span></div>
              <div>??????: <span>???</span></div>
              <div style={{ width: '100%' }}>??????: {this.acceptCheck()}</div>
              <div style={{ width: '100%', textAlign: 'center' }}>
                <Button type='primary' onClick={this.acceptPass}>??????</Button>
              </div>
            </div>}
        </Modal>
        <Modal
          visible={deleveryAuditModal}
          maskClosable={false}
          title='????????????'
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
          title='????????????'
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
          title='???????????????'
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
              <Button className='mr-10' type='default' onClick={this.closeModifyReceivingModal}>??????</Button>
              <DebounceFormButton label='??????' type='primary' onClick={this.handleModifyReceiving} />
            </div>
          </SchemaForm>
        </Modal>
        <Modal
          visible={cancelModal}
          maskClosable={false}
          destroyOnClose
          title='????????????'
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
              <h4>????????????<span style={{ color: 'red' }}>(??????)</span></h4>
              <Item field='verifyReason' />
              <div style={{ textAlign: 'right', marginTop: '25px' }}>
                <Button className='mr-10' type='default' onClick={this.toggleCancelModal}>??????</Button>
                <DebounceFormButton label='??????' type='primary' onClick={this.confirmCancel} />
              </div>
            </div>
          </SchemaForm>
        </Modal>
        {/* ???????????? */}
        <Modal
          visible={modifyModal}
          title='??????'
          onCancel={this.toggleModifyModal}
          width={900}
          footer={null}
        >
          <div style={{ color: 'grey' }}>???????????????????????????????????????????????????????????????????????????????????????????????????????????????</div>
          {modifyModal &&
            <ModifyModal data={this.modifyTransport} onCloseModal={this.toggleModifyModal} refrash={this.refrash} />}
        </Modal>
      </>
    );
  }
}

export default Transport;
