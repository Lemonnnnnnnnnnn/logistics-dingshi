import React, { Component } from 'react';
import { Button, Modal, Checkbox, Col, message, Form, Select } from "antd";
import { SchemaForm, Item, FORM_MODE, Observer } from '@gem-mine/antd-schema-form';
import { connect } from 'dva';
import Link from 'umi/link';
import router from 'umi/router';
import moment from 'moment';
import CSSModules from 'react-css-modules';
import QRCode from 'qrcode.react';
import html2canvas from 'html2canvas';
import DebounceFormButton from '../../../components/debounce-form-button';
import Authorized from '../../../utils/Authorized';
import { PREBOOKING_STAUTS, NETWORK_CONTRACT_LIST_STATUS } from '../../../constants/project/project';
import Table from '../../../components/table/table';
import model from '../../../models/preBooking';
import { unit } from '../../../constants/prebooking/prebooking';
import { pick, translatePageType, values as getValues, classifyGoodsWeight, unionBy, difference, isFunction, getLocal, omit, getGoodsName, renderOptions } from '../../../utils/utils';
import auth from '../../../constants/authCodes';
import { getRole, getUserInfo } from '../../../services/user';
import { countRemainWeight, getPreBookingStauts } from '../../../services/prebooking';
import { FilterContextCustom } from '../../../components/table/filter-context';
import SearchForm from '../../../components/table/search-form2';
import ORGANIZATION_TYPE from '../../../constants/organization/organization-type';
import DeliveryField from './component/delivery-field';
import DispatchField from './component/dispatch-field';
import '@gem-mine/antd-schema-form/lib/fields';
import styles from './pre-booking-list.css';
import { REPLENISHMENT_STATUS_DIST } from '@/constants/transport';

const transportStatusLayout = {
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

const { actions: { getPreBooking, patchPreBooking, detailPreBooking } } = model;

const {
  PREBOOKING_CREATE,
  PREBOOKING_MODIFY,
  PREBOOKING_DELETE,
  PREBOOKING_CANCEL,
  PREBOOKING_COMPLETE,
  DISPATCH_DISPATCHING,
  DISPATCH_REJECT
} = auth;

function mapStateToProps(state) {
  return {
    preBooking: pick(state.preBooking, ['items', 'count']),
    commonStore: state.commonStore,
  };
}

@connect(mapStateToProps, { getPreBooking, patchPreBooking })
@FilterContextCustom
@CSSModules(styles, { allowMultiple: true })
class PreBooking extends Component {

  QRCode = React.createRef()

  currentTab = this.props.commonStore.tabs.find(item => item.id === this.props.commonStore.activeKey);

  localData = getLocal(this.currentTab.id) || { formData: {} };

  form = null;

  searchFormSchema = {
    preBookingNo: {
      label: '????????????',
      placeholder: '?????????????????????',
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
    projectName: {
      label: '????????????',
      placeholder: '?????????????????????',
      component: 'input'
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
    prebookingStatus: {
      label: '??????',
      component: 'select',
      placeholder: '????????????????????????',
      options: [{
        label: '?????????',
        value: PREBOOKING_STAUTS.REFUSE,
        key: PREBOOKING_STAUTS.REFUSE,
      }, {
        label: '????????????',
        value: PREBOOKING_STAUTS.COMPLETE,
        key: PREBOOKING_STAUTS.COMPLETE,
      }, {
        label: '?????????',
        value: PREBOOKING_STAUTS.UNCERTAINTY,
        key: PREBOOKING_STAUTS.UNCERTAINTY,
      }, {
        label: '?????????',
        value: PREBOOKING_STAUTS.UNCOMPLETED,
        key: PREBOOKING_STAUTS.UNCOMPLETED
      }, {
        label: '?????????',
        value: PREBOOKING_STAUTS.CANCELED,
        key: PREBOOKING_STAUTS.CANCELED
      }]
    },
    replenishmentStatus : {
      label : '????????????',
      placeholder : '?????????????????????',
      component : 'select',
      options : renderOptions(REPLENISHMENT_STATUS_DIST)
    }

  }

  organizationType = getUserInfo().organizationType

  organizationId = getUserInfo().organizationId

  constructor(props) {
    super(props);

    const columns = {
      statusKey: {
        title: '??????',
        dataIndex: 'statusKey',
        fixed: 'left',
        width: 105,
        render: (text, record) => {
          const statusArr = getPreBookingStauts(record.prebookingStatus);
          return (
            <>
              {statusArr.map((item, index) => (
                <Authorized key={index} authority={item.authority}>
                  <span style={{ color: item.color }}>
                    {item.word}
                  </span>
                </Authorized>
              ))}
            </>
          );
        }
      },
      prebookingNo: {
        title: '????????????',
        dataIndex: 'prebookingNo',
        fixed: 'left',
        width: 170
      },
      createTime: {
        title: '????????????',
        dataIndex: 'createTime',
        width: 182,
        render: (time) => <div>{moment(time).format('YYYY-MM-DD HH:mm:ss')}</div>,
      },
      projectName: {
        title: '????????????',
        dataIndex: 'projectName',
        width: 252,
        render: (text) => <div title={text} className="test-ellipsis" style={{ display: 'inline-block', width: '220px' }}>{text}</div>
      },

      consignmentName: {
        title: '?????????',
        key: 'consignmentName',
        width: 158,
        render: (row) => {
          if (this.organizationId === row.receiverOrganizationId) {
            return <div title={row.shipmentName} className="test-ellipsis" style={{ display: 'inline-block', width: '126px' }}>{row.shipmentName}</div>;
          }
          return <div title={row.consignmentName} className="test-ellipsis" style={{ display: 'inline-block', width: '126px' }}>{row.consignmentName}</div>;
        }
      },
      shipmentName: {
        title: '?????????',
        key: 'shipmentName',
        width: 152,
        render: (row) => {
          if (this.organizationId === row.receiverOrganizationId) {
            return <div className="test-ellipsis" style={{ display: 'inline-block', width: '120px' }}>{row.receiverOrganizationName}</div>;
          }
          return <div title={row.shipmentName} className="test-ellipsis" style={{ display: 'inline-block', width: '120px' }}>{row.shipmentName}</div>;
        }
      },
      receiverOrganizationName: {
        title: '???????????????',
        key: 'receiverOrganizationName',
        width: 152,
        render: (row) => {
          if (this.organizationId === row.receiverOrganizationId) {
            return <div className="test-ellipsis" style={{ display: 'inline-block', width: '120px' }}>???</div>;
          }
          return <div title={row.receiverOrganizationName} className="test-ellipsis" style={{ display: 'inline-block', width: '120px' }}>{row.receiverOrganizationName}</div>;
        }
      },
      deliveryItems: {
        title: '?????????',
        dataIndex: 'deliveryItems',
        width: 182,
        render: (text) => {
          const list = (text || []).map(item => <li title={item.name} className="test-ellipsis" style={{ width: '150px' }} key={item.prebookingCorrelationId}>{item.name}</li>);

          return <ul style={{ padding: 0, margin: 0 }}>{list}</ul>;
        }
      },
      receivingItems: {
        title: '?????????',
        dataIndex: 'receivingItems',
        width: 182,
        render: (text) => {
          const list = (text || []).map(item => <li title={item.name} style={{ width: '150px' }} className="test-ellipsis" key={item.prebookingCorrelationId}>{item.name}</li>);

          return <ul style={{ padding: 0, margin: 0 }}>{list}</ul>;
        }
      },
      goodsName: {
        title: '????????????',
        dataIndex: 'goodsName',
        width: 282,
        render: (text, record) => {
          const list = record.deliveryItems.map(item => {
            const word = getGoodsName(item);
            return (
              <li
                title={word}
                style={{ width: "250px" }}
                className="test-ellipsis"
                key={item.prebookingCorrelationId}
              >
                {word}
              </li>);
          });
          return <ul style={{ padding: 0, margin: 0 }}>{list}</ul>;
        }
      },
      plannedweight: {
        title: '????????????',
        dataIndex: 'plannedweight',
        width: 132,
        render: (text, record) => {
          if (!record.deliveryItems) return '--';
          const plannedGoodsweight = classifyGoodsWeight(record.deliveryItems, 'goodsId', ['goodsId', 'goodsUnitCN', 'receivingNum'], (summary, current) => summary.receivingNum += current.receivingNum);
          const renderItem = ({ goodsId, receivingNum, goodsUnitCN }) => <li className="test-ellipsis" key={goodsId}>{receivingNum.toFixed(2)}{goodsUnitCN}</li>;

          return <ul style={{ width: '100px', padding: 0, margin: 0 }}>{plannedGoodsweight.map(renderItem)}</ul>;
        }
      },
      transportDeliveryItems: {
        title: '????????????',
        dataIndex: 'transportDeliveryItems',
        width: 132,
        render: (items) => {
          if (!items) return '--';
          const weightItems = classifyGoodsWeight(items, 'goodsId', ['goodsId', 'goodsNum', 'goodsUnitCN'], (summary, current) => summary.goodsNum += current.goodsNum);
          const renderItem = ({ goodsId, goodsNum, goodsUnitCN }) => <li style={{ width: '100px' }} key={goodsId}>{(goodsNum || 0).toFixed(3)}{goodsUnitCN}</li>;

          return <ul style={{ padding: 0, margin: 0 }}>{weightItems.map(renderItem)}</ul>;
        }
      },
      remainingNum: {
        title: '????????????',
        key: 'remainingNum',
        dataIndex: 'deliveryItems',
        width: 132,
        render: (items, record) => {
          if (!items) return '--';
          // ?????????????????????
          const prebookingPlanWeights = classifyGoodsWeight(items, 'goodsId', ['goodsId', 'goodsUnitCN', 'receivingNum'], (summary, current) => summary.receivingNum += current.receivingNum);
          // ??????????????????
          const transportPlanWeight = classifyGoodsWeight(record.transportDeliveryItems, 'goodsId', ['goodsId', 'goodsUnitCN', 'goodsNum'], (summary, current) => summary.goodsNum += current.goodsNum);
          // ????????????
          const remainWeights = prebookingPlanWeights.map(planItem => {
            const transportItem = transportPlanWeight.find(item => item.goodsId === planItem.goodsId) || { goodsId: planItem.goodsId, goodsNum: 0 };
            return {
              goodsId: planItem.goodsId,
              goodsUnitCN: planItem.goodsUnitCN,
              remainingNum: planItem.receivingNum - transportItem.goodsNum
            };
          });
          const renderItem = ({ goodsId, remainingNum, goodsUnitCN }) => <li style={{ width: '100px' }} key={goodsId}>{remainingNum.toFixed(2)}{goodsUnitCN}</li>;

          return <ul style={{ padding: 0, margin: 0 }}>{remainWeights.map(renderItem)}</ul>;
        },
      },
      transportCars: {
        title: '??????????????????',
        key: 'transportCars',
        dataIndex: 'transportNum',
        width: 132,
        render: (text) => <div title={text} style={{ display: 'inline-block', width: '100px', whiteSpace: 'normal', breakWord: 'break-all' }}>{text}</div>
      },
      deliveryNum: {
        title: '????????????',
        dataIndex: 'deliveryNum',
        width: 132,
        render: (num, record) => {
          if (!record.transportDeliveryItems) return '--';
          const plannedGoodsweight = classifyGoodsWeight(record.transportDeliveryItems, 'goodsId', ['goodsId', 'deliveryUnitCN', 'deliveryNum'], (summary, current) => summary.deliveryNum += current.deliveryNum);
          const renderItem = ({ goodsId, deliveryUnitCN, deliveryNum }) => deliveryNum ? <li className="test-ellipsis" key={goodsId}>{deliveryNum.toFixed(2)}{deliveryUnitCN}</li> : '--';
          return <ul style={{ width: '100px', padding: 0, margin: 0 }}>{plannedGoodsweight.map(renderItem)}</ul>;
        }
      },
      receivingNum: {
        title: '????????????',
        dataIndex: 'receivingNum',
        width: getRole() !== 4 && getRole() !== 5 ? '' : 132,
        render: (num, record) => {
          if (!record.transportDeliveryItems) return '--';
          const plannedGoodsweight = classifyGoodsWeight(record.transportDeliveryItems, 'goodsId', ['goodsId', 'receivingUnitCN', 'receivingNum'], (summary, current) => summary.receivingNum += current.receivingNum);
          const renderItem = ({ goodsId, receivingUnitCN, receivingNum }) => receivingNum ? <li className="test-ellipsis" key={goodsId}>{receivingNum.toFixed(2)}{receivingUnitCN}</li> : '--';

          return <ul style={{ width: '100px', padding: 0, margin: 0 }}>{plannedGoodsweight.map(renderItem)}</ul>;
        }
      },
      maximumShippingPrice: {
        title: '???????????????',
        width : 150,
        dataIndex: 'maximumShippingPrice',
        render: (text, record) => {
          const { logisticsTradingSchemeEntity, logisticsBusinessTypeEntity } = record;
          let unitText = '???/???';
          if (logisticsBusinessTypeEntity) {
            const { measurementUnit } = logisticsBusinessTypeEntity;
            unitText = unit[measurementUnit]?.label || '???/???';
          }
          if (this.organizationType === 4) return text ? `${text}${unitText}` : '--';
          const { shipmentServiceRate } = logisticsTradingSchemeEntity || {};
          return text ? `${((text || 0) * (1 - ((shipmentServiceRate || 0)))).toFixed(2)._toFixed(2)}${unitText}` : '--';
        }
      },
      replenishmentStatus: {
        title: '????????????',
        dataIndex: 'replenishmentStatus',
        width: 150,
        render: (text) => (REPLENISHMENT_STATUS_DIST[text])
      },
      trajectoryNo: {
        title: '????????????',
        dataIndex: 'trajectoryNo',
        // width: 250,
        render : (text)=> text || '-'
      },
    };

    this.tableSchema = {
      variable: true,
      // ?????? 2300?????????2900?????????2100
      // eslint-disable-next-line no-nested-ternary
      minWidth: getRole() === 5 ? 3200 : getRole() === 4 ? 2800 : 2600,
      minHeight: 400,
      columns: (() => {
        const role = getRole();
        const colKeys = {
          4:
            [
              'statusKey', 'prebookingNo', 'createTime', 'projectName',
              'consignmentName', 'shipmentName', 'deliveryItems', 'receivingItems',
              'goodsName', 'plannedweight', 'deliveryNum', 'receivingNum', 'maximumShippingPrice', 'replenishmentStatus', 'trajectoryNo',
            ],
          5:
            [
              'statusKey', 'prebookingNo', 'createTime', 'projectName', 'consignmentName',
              'shipmentName', 'receiverOrganizationName', 'deliveryItems', 'receivingItems', 'goodsName', 'transportCars',
              'plannedweight', 'transportDeliveryItems', 'remainingNum', 'deliveryNum', 'receivingNum', 'maximumShippingPrice', 'replenishmentStatus', 'trajectoryNo'
            ]
        }[role]
          || [
            'statusKey', 'prebookingNo', 'createTime', 'projectName',
            'consignmentName', 'shipmentName', 'deliveryItems', 'receivingItems',
            'goodsName', 'plannedweight', 'deliveryNum', 'receivingNum', 'replenishmentStatus', 'trajectoryNo',
          ];

        return getValues(pick(columns, colKeys));
      })(),
      operations: (record) => {
        const rowPreBookingStatus = record.prebookingStatus;
        const { logisticsBusinessTypeEntity, transferType, receiverOrganizationId, prebookingStatus } = record;
        const { releaseHall } = logisticsBusinessTypeEntity || {};
        const detail = {
          title: '??????',
          onClick: (record) => {
            const paramsStr = Object.entries(pick(record, ['prebookingId', 'goodsPlanId']))
              .filter(([key, value]) => value !== null)
              .map(([key, value]) => `${key}=${value}`)
              .join('&');
            this.organizationType === ORGANIZATION_TYPE.SHIPMENT
              ? router.push(`preBooking/dispatch?pageKey=${record.prebookingId}&${paramsStr}&mode=${FORM_MODE.DETAIL}`) // ??????
              : router.push(`preBooking/detail?${paramsStr}&mode=${FORM_MODE.DETAIL}`); // ???????????????
          }
        };
        const operations = {
          [PREBOOKING_STAUTS.UNCERTAINTY]: [{
            title: '??????',
            onClick: (record) => {
              const paramsStr = Object.entries(pick(record, ['prebookingId', 'goodsPlanId']))
                .filter(([key, value]) => value !== null)
                .map(([key, value]) => `${key}=${value}`)
                .join('&');
              router.push(`preBooking/createPreBooking?${paramsStr}`);
            },
            auth: [PREBOOKING_MODIFY]
          }, {
            title: '??????',
            confirmMessage: () => `??????????????????????????????`,
            onClick: (record) => {
              this.props.patchPreBooking({ shipmentId: record.shipmentId, prebookingId: record.prebookingId, prebookingStatus: PREBOOKING_STAUTS.CANCELED })
                .then(() => this.props.getPreBooking(this.props.filter));
            },
            auth: [PREBOOKING_CANCEL]
          }, (this.organizationId === receiverOrganizationId || transferType === 0 || receiverOrganizationId === null) && {
            title: '??????',
            onClick: (record) => {
              this.setState({
                dispatchModal: true,
                prebooking: record
              });
            },
            auth: releaseHall ? ['hide'] : [DISPATCH_DISPATCHING]
          }, (this.organizationId === receiverOrganizationId || transferType === 0 || receiverOrganizationId === null) && prebookingStatus === 0 && {
            title: '??????',
            onClick: (record) => { this.showModal({ prebookingId: record.prebookingId, shipmentId: record.shipmentId }); },
            auth: releaseHall ? ['hide'] : [DISPATCH_REJECT]
          }],
          [PREBOOKING_STAUTS.UNCOMPLETED]: [{
            title: '??????',
            confirmMessage: () => `???????????????????????????????????????????????????????????????????????????????????????????????????`,
            // TODO ?????????????????????????????????????????????????????????
            onClick: (record) => {
              this.props.patchPreBooking({ shipmentId: record.shipmentId, prebookingId: record.prebookingId, prebookingStatus: PREBOOKING_STAUTS.COMPLETE })
                .then(() => this.props.getPreBooking(this.props.filter));
            },
            auth: [PREBOOKING_COMPLETE]
          }, {
            title: '??????',
            // TODO ????????????????????????
            onClick: (record) => { router.push(`/buiness-center/transportList/transport?prebookingId=${record.prebookingId}`); },
          }, (this.organizationId === receiverOrganizationId || transferType === 0 || receiverOrganizationId === null) && {
            title: '??????',
            onClick: (record) => {
              this.setState({
                dispatchModal: true,
                prebooking: record
              });
            },
            auth: releaseHall ? ['hide'] : [DISPATCH_DISPATCHING]
          }],
          [PREBOOKING_STAUTS.COMPLETE]: [{
            title: '??????',
            onClick: (record) => { router.push(`/buiness-center/transportList/transport?prebookingId=${record.prebookingId}`); },
          }],
          [PREBOOKING_STAUTS.REFUSE]: [{
            title: '??????',
            onClick: (record) => { router.push(`preBooking/createPreBooking?prebookingId=${record.prebookingId}`); },
            auth: [PREBOOKING_MODIFY]
          }, {
            title: '??????',
            confirmMessage: () => `??????????????????????????????`,
            // TODO ?????????????????????????????????????????????????????????
            onClick: (record) => {
              this.props.patchPreBooking({ shipmentId: record.shipmentId, prebookingId: record.prebookingId, prebookingStatus: PREBOOKING_STAUTS.CANCELED })
                .then(() => this.props.getPreBooking(this.props.filter));
            },
            auth: [PREBOOKING_CANCEL]
          }
          ],
          [PREBOOKING_STAUTS.CANCELED]: [{
            title: '??????',
            confirmMessage: () => `??????????????????????????????`,
            onClick: (record) => {
              this.props.patchPreBooking({ shipmentId: record.shipmentId, prebookingId: record.prebookingId, isEffect: 0 })
                .then(() => {
                  if (this.props.preBooking.items.length === 1 && this.props.filter.offset !== 0) {
                    const newFilter = this.props.setFilter({ ...this.props.filter, offset: this.props.filter.offset - this.props.filter.limit });
                    this.setState({
                      nowPage: this.state.nowPage - 1
                    });
                    this.props.getPreBooking({ ...newFilter });
                  } else {
                    this.props.getPreBooking({ ...this.props.filter });
                  }
                });
            },
            auth: [PREBOOKING_DELETE]
          }],
          [PREBOOKING_STAUTS.WHOLE_COMPLETE]: [{
            title: '??????',
            onClick: (record) => { router.push(`/buiness-center/transportList/transport?prebookingId=${record.prebookingId}`); },
          }],
          // TODO ????????????
        }[rowPreBookingStatus] || [];
        if (transferType === 2 && !receiverOrganizationId && this.organizationType === ORGANIZATION_TYPE.SHIPMENT) {
          operations.push(
            {
              title: '??????',
              onClick: (record) => {
                this.setState({
                  transferModal: true,
                  prebooking: record
                });
              },
              // auth: releaseHall ? ['hide'] : [DISPATCH_DISPATCHING]
            }
          );
        }
        if (record.logisticsBusinessTypeEntity && record.logisticsBusinessTypeEntity.releaseHall === 1 && (record.prebookingStatus === PREBOOKING_STAUTS.UNCERTAINTY || record.prebookingStatus === PREBOOKING_STAUTS.UNCOMPLETED) && this.organizationType === 4) {
          const downloadQrCode = {
            title: '???????????????',
            onClick: (record) => {
              this.setState({
                codeValue: `${window.envConfig.QRCodeEntry}/driver/prebooking/${record.prebookingId}`,
                qrCodeModal: true,
                nowPrebookingNo: record.prebookingNo
              });
            }
          };
          return [detail, ...operations, downloadQrCode];
        }
        return [detail, ...operations];
      }
    };

    const schema = {
      rejectReason: {
        label: '??????',
        rules: {
          required: true,
          max: 200
        },
        component: 'input.textArea',
        placeholder: '?????????????????????'
      }

    };
    this.state = {
      // TODO ?????????????????????????????????????????????????????????
      suggestModal: false,
      schema,
      nowPage: 1,
      pageSize: 10,
      dispatchModal: false,
      transferModal: false,
      prebooking: {},
      qrCodeModal: false
    };
  }

  componentDidMount() {
    const { localData = { formData: {} } } = this;
    const { getPreBooking, location: { query: { projectId, prebookingStatus, projectName, goodsPlanId, goodsPlanName } }, filter, setFilter } = this.props;
    const params = {
      ...localData.formData,
      offset: localData.nowPage ? localData.pageSize * (localData.nowPage - 1) : 0,
      limit: localData.pageSize ? localData.pageSize : 10,
      createDateStart: localData.formData.createTime && localData.formData.createTime.length ? moment(localData.formData.createTime[0]).startOf('day').format('YYYY/MM/DD HH:mm:ss') : undefined,
      createDateEnd: localData.formData.createTime && localData.formData.createTime.length ? moment(localData.formData.createTime[1]).endOf('day').format('YYYY/MM/DD HH:mm:ss') : undefined,
    };
    const newStatus = prebookingStatus === undefined ? filter.prebookingStatus : +prebookingStatus;
    const indexPageFilter = setFilter({ ...params, prebookingStatus: localData.formData.prebookingStatus || newStatus });
    if (projectId || goodsPlanId) {
      const newFilter = setFilter({ projectId, projectName, goodsPlanId, goodsPlanName });
      getPreBooking({ ...indexPageFilter, ...newFilter })
        .then(() => {
          this.setState({
            nowPage: this.localData.nowPage || 1,
            pageSize: this.localData.pageSize || 10,
          });
        });
    } else {
      getPreBooking(omit({ ...params, ...indexPageFilter, prebookingNo: this.localData.formData && this.localData.formData.preBookingNo || undefined }, 'createTime'))
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
    if (getLocal('local_commonStore_tabs').tabs.length > 1) {
      localStorage.setItem(this.currentTab.id, JSON.stringify({
        formData: { ...formData },
        pageSize: this.state.pageSize,
        nowPage: this.state.nowPage,
      }));
    }
  }


  // ??????????????????????????????
  detectZoom = () => {
    let ratio = 0;
    const { screen } = window;
    const ua = navigator.userAgent.toLowerCase();

    if (window.devicePixelRatio !== undefined) {
      ratio = window.devicePixelRatio;
    } else if (ua.indexOf('msie')) {
      if (screen.deviceXDPI && screen.logicalXDPI) {
        ratio = screen.deviceXDPI / screen.logicalXDPI;
      }
    } else if (window.outerWidth !== undefined && window.innerWidth !== undefined) {
      ratio = window.outerWidth / window.innerWidth;
    }

    if (ratio) {
      ratio = Math.round(ratio * 100);
    }
    return Number(ratio) / 100;
  }

  download = () => {
    window.scroll(0, 0);
    const newCanvas = document.createElement("canvas");
    const element = this.QRCode;
    const domWidth = parseInt(window.getComputedStyle(element).width);
    const domHeight = parseInt(window.getComputedStyle(element).height);
    const zoom = this.detectZoom();
    const heightScale = zoom * Number(window.screen.height) / 1080;
    const widthScale = zoom * Number(window.screen.width) / 1920;
    // return
    // ???canvas?????????????????????????????????????????????????????????????????????????????????
    newCanvas.width = domWidth * 1;
    newCanvas.height = domHeight * 1;
    newCanvas.style.width = `${domWidth}px`;
    newCanvas.style.height = `${domHeight}px`;
    const context = newCanvas.getContext("2d");
    context.scale(1 / widthScale, 1 / heightScale);

    html2canvas(element, { canvas: newCanvas }).then((canvas) => {
      const imgUri = canvas.toDataURL("image/png").replace("image/png", "image/octet-stream"); // ????????????????????????url
      const base64ToBlob = (code) => {
        const parts = code.split(';base64,');
        const contentType = parts[0].split(':')[1];
        const raw = window.atob(parts[1]);
        const rawLength = raw.length;

        const uInt8Array = new Uint8Array(rawLength);

        for (let i = 0; i < rawLength; ++i) {
          uInt8Array[i] = raw.charCodeAt(i);
        }
        return new Blob([uInt8Array], { type: contentType });
      };
      const blob = base64ToBlob(imgUri);
      const fileName = '??????????????????.png';
      if (window.navigator.msSaveOrOpenBlob) {
        navigator.msSaveBlob(blob, fileName);
      } else {
        const blobURL = window.URL.createObjectURL(blob);
        const vlink = document.createElement('a');
        vlink.style.display = 'none';
        vlink.href = blobURL;
        vlink.setAttribute('download', fileName);

        if (typeof vlink.download === 'undefined') {
          vlink.setAttribute('target', '_blank');
        }

        document.body.appendChild(vlink);

        const evt = document.createEvent("MouseEvents");
        evt.initEvent("click", false, false);
        vlink.dispatchEvent(evt);

        document.body.removeChild(vlink);
        window.URL.revokeObjectURL(blobURL);
      }
    });
  }

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
    return (
      <>
        <Authorized authority={[PREBOOKING_CREATE]}>
          <Button type="primary"><Link to="preBooking/createPreBooking">+ ???????????????</Link></Button>
        </Authorized>
        <SearchForm layout="inline" {...layout} mode={FORM_MODE.SEARCH} schema={this.searchFormSchema}>
          <Item field="preBookingNo" />
          <Item field="projectName" />
          <Item {...transportStatusLayout} field="createTime" />
          <Item {...transportStatusLayout} field="prebookingStatus" />
          <Item field='replenishmentStatus' />
          <DebounceFormButton label="??????" type="primary" className="mr-10" onClick={this.handleSearchBtnClick} />
          <DebounceFormButton label="??????" onClick={this.handleResetBtnClick} />
        </SearchForm>
      </>
    );
  }

  handleSearchBtnClick = value => {
    this.setState({
      nowPage: 1
    });
    const createDateStart = value.createTime && value.createTime.length ? moment(value.createTime[0]).set({ hour: 0, minute: 0, second: 0, millisecond: 0 }).format('YYYY/MM/DD HH:mm:ss') : undefined;
    const createDateEnd = value.createTime && value.createTime.length ? moment(value.createTime[1]).set({ hour: 23, minute: 59, second: 59, millisecond: 999 }).format('YYYY/MM/DD HH:mm:ss') : undefined;
    const { preBookingNo: prebookingNo, projectName, prebookingStatus } = value;
    const newFilter = this.props.setFilter({ ...this.props.filter, createDateStart, createDateEnd, offset: 0, prebookingNo, prebookingStatus, projectName });
    this.props.getPreBooking({ ...newFilter });
  }

  handleResetBtnClick = () => {
    if (this.props.location.query.projectId || this.props.location.query.prebookingStatus || this.props.location.query.goodsPlanId) {
      router.replace('preBooking');
    }
    const newFilter = this.props.resetFilter({});
    this.setState({
      nowPage: 1,
      pageSize: 10
    });
    this.props.getPreBooking({ ...newFilter });
  }

  onChange = (pagination) => {
    const { offset, limit, current } = translatePageType(pagination);
    this.setState({
      nowPage: current,
      pageSize: limit
    });
    const newFilter = this.props.setFilter({ offset, limit });
    this.props.getPreBooking({ ...newFilter });
  }

  showModal = ({ prebookingId, shipmentId }) => {
    this.setState({
      showRefuseModal: true,
      prebookingId,
      shipmentId
    });
  }

  handleCancel = () => {
    this.setState({
      showRefuseModal: false
    });
  }

  cancelDispatch = () => {
    this.setState({
      dispatchModal: false
    });
  }

  openSuggestModal = () => {
    this.setState({
      suggestModal: true
    });
  }

  handleSaveBtnClick = value => {
    this.props.patchPreBooking({ shipmentId: this.state.shipmentId, prebookingId: this.state.prebookingId, prebookingStatus: PREBOOKING_STAUTS.REFUSE, rejectReason: value.rejectReason })
      .then(() => {
        this.setState({
          showRefuseModal: false,
        });
        this.props.getPreBooking(this.props.filter);
      });
  }

  cancelSuggest = () => {
    this.setState({
      suggestModal: false
    });
  }

  goContract = () => {
    router.push('/contract-manage/freightContract');
  }

  closeDownloadModal = () => {
    this.setState({
      qrCodeModal: false
    });
  }

  transferOk = () => {
    this.props.form.validateFields((err, values) => {
      if (err) {
        return message.error('???????????????????????????');
      }
      this.props.patchPreBooking({ prebookingId: this.state.prebooking.prebookingId, projectTransferId: Number(values.projectTransferId) })
        .then(() => {
          message.success('???????????????');
          this.setState({ transferModal: false });
          this.props.getPreBooking(this.props.filter);
        });
    });
  }

  render() {
    const { preBooking, form } = this.props;
    const { nowPage, pageSize, showRefuseModal, dispatchModal, prebooking, suggestModal, qrCodeModal, codeValue, nowPrebookingNo, transferModal } = this.state;
    return (
      <>
        <Modal
          title="??????"
          visible={showRefuseModal}
          onCancel={this.handleCancel}
          destroyOnClose
          centered
          footer={null}
        >
          <SchemaForm layout='vertical' mode={FORM_MODE.ADD} schema={this.state.schema}>
            <Item field="rejectReason" />
            <div style={{ paddingRight: '20px', textAlign: 'right' }}>
              <Button className='mr-10' onClick={this.handleCancel}>??????</Button>
              <DebounceFormButton label="??????" type="primary" onClick={this.handleSaveBtnClick} />
            </div>
          </SchemaForm>
        </Modal>
        <Modal
          title="??????"
          visible={dispatchModal}
          destroyOnClose
          maskClosable={false}
          width={800}
          onCancel={this.cancelDispatch}
          // centered
          footer={null}
        >
          <DispatchBox closeModal={this.cancelDispatch} openSuggestModal={this.openSuggestModal} prebooking={prebooking} />
        </Modal>
        <Modal
          title="???????????????"
          visible={transferModal}
          destroyOnClose
          maskClosable={false}
          onOk={this.transferOk}
          width={800}
          onCancel={() => { this.setState({ transferModal: false }); }}

        // centered
        >
          <Form>
            <Form.Item label="?????????????????????" style={{ display: 'flex' }}>
              {form.getFieldDecorator(`projectTransferId`, {
                rules: [{
                  required: true,
                  message: '????????????????????????'
                }],
              })(
                <Select
                  style={{ width: '100%' }}
                  optionFilterProp="children"
                  showSearch
                  placeholder="????????????????????????"
                >
                  {
                    prebooking.projectTransferEntities && prebooking.projectTransferEntities.map(item => (
                      <Select.Option key={item.projectTransferId}>{item.shipmentOrganizationName}</Select.Option>
                    ))
                  }
                </Select>
              )}
            </Form.Item>
          </Form>
        </Modal>
        <Modal
          title="??????"
          visible={suggestModal}
          destroyOnClose
          maskClosable={false}
          width={800}
          onCancel={this.cancelSuggest}
          // centered
          footer={[
            <Button key="back" onClick={this.cancelSuggest}>
              ??????
            </Button>
          ]}
        >
          <p>???????????????????????????<span style={{ fontWeight: 'bold' }}>??????</span>???</p>
          <p>1???????????????????????????</p>
          <p>2?????????????????????????????????????????????????????????</p>
          <p>???????????????????????????<span style={{ fontWeight: 'bold' }}>??????</span>???</p>
          <p>1????????????????????????????????????</p>
          <p>2??????????????????????????????????????????</p>
          <p><span style={{ fontWeight: 'bold' }}>????????????</span>?????????????????????</p>
          <p>1???????????????????????????????????????<a onClick={this.goContract}>?????????????????????</a></p>
          <p>2??????????????????????????????????????????????????????????????????????????????<a onClick={this.goContract}>?????????????????????</a></p>
        </Modal>
        <Table rowKey="prebookingId" renderCommonOperate={this.searchTableList} pagination={{ current: nowPage, pageSize }} onChange={this.onChange} schema={this.tableSchema} dataSource={preBooking} />
        <Modal
          title="??????????????????"
          visible={qrCodeModal}
          destroyOnClose
          maskClosable={false}
          width={386}
          onCancel={this.closeDownloadModal}
          // centered
          footer={[
            <Button type="primary" onClick={this.download}>
              ???????????????
            </Button>
          ]}
        >
          <div styleName='qrCode' ref={ref => this.QRCode = ref}>
            <QRCode
              value={codeValue}
              size={108}
              fgColor="#000000"
              style={{
                margin: '0 auto'
              }}
            />
            <h3 styleName='prebookingNo'>??????????????? {nowPrebookingNo}</h3>
            <p styleName='mar0 ft13'>??????????????????????????????????????????????????????????????????</p>
            <p styleName='textCenter ft13'>????????????????????????????????????</p>
            <p styleName='mar0 ft13'>??????????????????????????????????????????????????????????????????????????????????????????????????????www.dingshikj.com</p>
          </div>
        </Modal>
      </>
    );
  }
}

function _mapStateToProps(state) {
  return {
    data: state.preBooking.entity
  };
}
@connect(_mapStateToProps, { detailPreBooking })
class DispatchBox extends Component {

  layout = {
    wrapperCol: {
      xs: { span: 24 },
      sm: { span: 24 },
      xl: { span: 24 }
    }
  }

  deliveryFieldLayout = {
    labelCol: {
      xs: { span: 9 },
      sm: { span: 9 },
      xl: { span: 9 }
    },
    wrapperCol: {
      xs: { span: 15 },
      sm: { span: 15 },
      xl: { span: 15 }
    }
  }

  constructor(props) {
    super(props);
    this.form = {};
    const { prebooking: { contractItems = [] } } = props;
    const hasNetContract = (contractItems || []).findIndex(({ contractState, isAvailable, contractType }) => contractType === 2 && contractState === NETWORK_CONTRACT_LIST_STATUS.AUDITED && isAvailable) > -1;
    const hasSelfContract = (contractItems || []).findIndex(({ contractState, isAvailable, contractType }) => contractType !== 2 && contractState === NETWORK_CONTRACT_LIST_STATUS.AUDITED && isAvailable) > -1;
    this.dispatchOptions = [
      { label: '??????', value: 'selfSupport', field: 'selfSupport', disabled: !hasSelfContract },
      { label: '????????????', value: 'netFreight', field: 'netFreight' }
    ];
    const dispatchSchema = {
      selfSupport: {
        component: DispatchField,
        selfSupport: true,
        rules: {
          validator: ({ formData }) => {
            let error = false;
            let errorWord = '';
            const { selfSupport = [], netFreight = [] } = pick(formData, this.state.dispatch);
            const { data: { transportItems, deliveryItems } } = this.props;
            const remainWeights = countRemainWeight(deliveryItems, transportItems);
            const totalDispatch = classifyGoodsWeight([...selfSupport, ...netFreight], 'goodsId', ['goodsId', 'goodsNum'], (summary, current) => summary.goodsNum += (current.goodsNum || 0));
            const selfGoodsId = selfSupport.map(item => item.goodsId);
            const _totalDispatch = totalDispatch.filter(item => selfGoodsId.indexOf(item.goodsId) > -1);
            _totalDispatch.forEach(compareItem => {
              const restItem = remainWeights.find(goods => goods.goodsId === compareItem.goodsId);
              if (restItem.remainingNum < compareItem.goodsNum) {
                error = true;
                errorWord = `${restItem.categoryName}${restItem.goodsName}??????????????????`;
                return false;
              }
            });
            if (error) {
              return errorWord;
            }
          }
        },
        observer: Observer({
          watch: 'netFreight',
          action: (value, { form }) => {
            if (this.form !== form) {
              this.form = form;
            }
            form.validateFields(['selfSupport']);
            return {};
          }
        })
      },
      netFreight: {
        component: DispatchField,
        rules: {
          validator: ({ formData }) => {
            let error = false;
            let errorWord = '';
            const { selfSupport = [], netFreight = [] } = pick(formData, this.state.dispatch);
            const { data: { transportItems, deliveryItems } } = this.props;
            const remainWeights = countRemainWeight(deliveryItems, transportItems);
            const totalDispatch = classifyGoodsWeight([...selfSupport, ...netFreight], 'goodsId', ['goodsId', 'goodsNum'], (summary, current) => summary.goodsNum += (current.goodsNum || 0));
            const selfGoodsId = netFreight.map(item => item.goodsId);
            const _totalDispatch = totalDispatch.filter(item => selfGoodsId.indexOf(item.goodsId) > -1);
            _totalDispatch.forEach(compareItem => {
              const restItem = remainWeights.find(goods => goods.goodsId === compareItem.goodsId);
              if (restItem.remainingNum < compareItem.goodsNum) {
                error = true;
                errorWord = `${restItem.categoryName}${restItem.goodsName}??????????????????`;
                return false;
              }
            });
            if (error) {
              return errorWord;
            }
          }
        },
        onlySelfSupport: hasSelfContract,
        observer: Observer({
          watch: 'selfSupport',
          action: (value, { form }) => {
            if (this.form !== form) {
              this.form = form;
            }
            form.validateFields(['netFreight']);
            return {};
          }
        })
      }
    };

    const dispatchCheckBox = () => {
      let checkBox = [];
      if (hasNetContract) {
        checkBox = ['netFreight'];
      } else if (hasSelfContract) {
        checkBox = ['selfSupport'];
      }
      return checkBox;
    };

    this.state = {
      ready: false,
      dispatch: dispatchCheckBox(),
      dispatchSchema,
    };
  }

  componentDidMount() {
    const { prebooking: { prebookingId, deliveryItems }, detailPreBooking } = this.props;
    const { dispatchSchema } = this.state;
    const newSchema = this.reduceDeliverySchema(unionBy(deliveryItems, 'prebookingObjectId'));
    detailPreBooking({ prebookingId })
      .then(() => {
        this.setState({
          ready: true,
          dispatchSchema: { ...dispatchSchema, ...newSchema }
        });
      });
  }

  reduceDeliverySchema = deliveryItems => {
    const deliverySchema = deliveryItems.reduce((newSchema, current) => {
      const addSchema = {
        [`${current.prebookingObjectId}`]: {
          label: `${current.name}`,
          component: DeliveryField,
          rules: {
            // required:[true, `?????????${current.name}??????`],
            validator: ({ value }) => {
              if (!value || !value.price) {
                return `?????????${current.name}??????`;
              }
              if (value.price <= 0) {
                return '????????????????????????';
              }
            }
          },
          placeholder: '???????????????(???)',
        }
      };
      return { ...newSchema, ...addSchema };
    }, {});
    return deliverySchema;
  }

  renderRest = () => {
    const { data: { transportItems, deliveryItems } } = this.props;
    const numberStyle = {
      paddingLeft: 20,
      fontSize: '14px',
      lineHeight: '1.5em'
    };
    const remainWeights = countRemainWeight(deliveryItems, transportItems);
    const planWeight = remainWeights.map(item => <li key={item.goodsId}><span style={numberStyle}>{`${item.categoryName}-${item.goodsName}: ??????${item.planNum}${item.goodsUnitCN}?????????${item.remainingNum}${item.goodsUnitCN}`}</span></li>);
    return (
      <ul style={{ padding: 0, marginLeft: '10px', marginTop: '10px' }}>
        {planWeight}
      </ul>
    );
  }

  dispatchOnChange = value => {
    const { dispatch } = this.state;
    const { openSuggestModal } = this.props;
    const { validateFields } = this.form;
    const diff = difference(value, dispatch);
    const check = diff.indexOf('netFreight') > -1;
    if (check) {
      return isFunction(openSuggestModal) && openSuggestModal();
    }
    if (value.length < 1) {
      message.error('??????????????????????????????');
      this.setState({
        dispatch
      });
    } else {
      this.setState({
        dispatch: value
      }, () => {
        validateFields(value);
      });
    }
  }

  handleDispatch = (value) => {
    const defaultValue = { selfSupport: [], netFreight: [] };
    let check = true;
    const { dispatch } = this.state;
    const { setFields } = this.form;
    const { prebooking: record } = this.props;
    const dispatchData = pick({ ...defaultValue, ...value }, dispatch);
    Object.entries(dispatchData)
      .forEach(([key]) => {
        if (dispatchData[key].length === 0) {
          check = false;
        }
        dispatchData[key].forEach(({ goodsNum = 0 }) => {
          if (!goodsNum > 0) {
            check = false;
          }
        });
        if (!check) return setFields({ [key]: { errors: [new Error('????????????????????????')] } });
      });
    if (!check) return false;
    localStorage.setItem('dispatchConfig', JSON.stringify(dispatchData));
    router.push(`preBooking/dispatch?pageKey=${record.prebookingId}&prebookingId=${record.prebookingId}&mode=${FORM_MODE.ADD}`);
  }

  noContractContent = () => (
    <div>??????????????????</div>
  )

  render() {
    const { ready, dispatch, dispatchSchema } = this.state;
    const { prebooking: { deliveryItems, transferType } } = this.props;
    return (
      <>
        <div style={{ fontSize: '14px', fontWeight: 'bold' }}>?????????????????????</div>
        {ready && dispatch.length === 0 && transferType === 0 && this.noContractContent()}
        {ready && dispatch.length !== 0 && this.renderRest()}
        {ready && dispatch.length !== 0 &&
          <SchemaForm {...this.layout} schema={dispatchSchema}>
            <Checkbox.Group
              defaultValue={['selfSupport']}
              value={dispatch}
              onChange={this.dispatchOnChange}
              style={{ width: '100%' }}
            >
              {
                this.dispatchOptions.map(item => (
                  <div key={item.value}>
                    <Col span={5}>
                      <Checkbox disabled={item.disabled} style={{ fontSize: '20px', marginRight: '30px' }} value={item.value}>{item.label}</Checkbox>
                    </Col>
                    <Col span={19}>
                      <Item field={item.field} />
                    </Col>
                  </div>
                ))
              }
            </Checkbox.Group>
            {dispatch.indexOf('netFreight') > -1 &&
              <>
                <div style={{ fontSize: '14px', fontWeight: 'bold' }}>???????????????</div>
                {unionBy(deliveryItems, 'prebookingObjectId').map(item => <Item key={item.prebookingObjectId} {...this.deliveryFieldLayout} field={`${item.prebookingObjectId}`} />)}
              </>
            }
            <div style={{ textAlign: 'right' }}>
              <Button style={{ marginRight: '10px' }} onClick={this.props.closeModal}>??????</Button>
              <DebounceFormButton label="??????" type="primary" onClick={this.handleDispatch} />
            </div>
          </SchemaForm>
        }
      </>
    );
  }
}

export default Form.create()(PreBooking);
