import React from 'react';
import { SchemaForm, Item, FORM_MODE, Observer } from '@gem-mine/antd-schema-form';
import CSSModules from 'react-css-modules';
import { connect } from 'dva';
import '@gem-mine/antd-schema-form/lib/fields';
import { Row, Col, Button, Checkbox, notification } from 'antd';
import { getElectronicDocuments } from '../../services/apiService';
import styles from './business-type-setting.less';
import DebounceFormButton from '../../components/debounce-form-button';
import CheckBox from './component/check-box';
import LinkageCheckBox from './component/linkage-check-box';
import SelectWithPicture from './component/select-with-picture';
import model from '../../models/businessTypes';
import { pick, intersection, getLocal, isEmpty } from '../../utils/utils';
import moreIcon from '../../assets/more.png';

const { actions: { getBusinessTypes, postBusinessTypes } } = model;

function mapStateToProps (state) {
  return {
    lists: pick(state.businessTypes, ['items', 'count']),
    commonStore: state.commonStore,
    // detail: pick(state.businessTypes, ['entity'])
  };
}

@connect(mapStateToProps, { getBusinessTypes, postBusinessTypes })
@CSSModules(styles, { allowMultiple: true })
export default class BusinessTypeSetting extends React.Component {
  currentTab = this.props.commonStore.tabs.find(item => item.id === this.props.commonStore.activeKey);

  localData = getLocal(this.currentTab.id) || { formData: {} };

  form1 = null

  state = {
    ready: false,
    more: false,
    formMode: FORM_MODE.DETAIL
  }

  fakeData = {}

  form = React.createRef()

  formLayout = {
    labelCol: {
      xs: { span: 24 }
    },
    wrapperCol: {
      xs: { span: 24 }
    }
  }

  formSchema = {
    driverDeliveryAudit: {
      label: '司机提货后是否需要托运方审核：',
      component: 'radio',
      rules: {
        required: [true, '请选择司机提货后是否需要托运方审核'],
      },
      options: [{
        label: '需要',
        key: 1,
        value: 1
      }, {
        label: '不需要',
        key: 0,
        value: 0
      }],
      disabled: Observer({
        watch: '*formMode',
        action: formMode => formMode === FORM_MODE.DETAIL
      }),
      observer: Observer({
        watch: '*localData',
        action: (itemValue, { form }) => {
          if (this.form1 !== form) {
            this.form1 = form;
          }
          return { };
        }
      }),
    },
    manualTrigger: {
      component: 'select',
      rules: {
        required: [true, '请选择触发节点'],
      },
      placeholder: '请选择触发节点',
      options: [{
        label: '已到站',
        key: 1,
        value: 1
      }, {
        label: '已签收',
        key: 2,
        value: 2
      }, {
        label: '审核通过',
        key: 3,
        value: 3
      }],
      visible: Observer({
        watch: ['transportCompleteType'],
        action: (transportCompleteType) => transportCompleteType === 1
      }),
      disabled: Observer({
        watch: '*formMode',
        action: formMode => formMode === FORM_MODE.DETAIL
      }),
    },
    transportCompleteType: {
      label: '触发运单完成的操作：',
      component: 'radio',
      rules: {
        required: [true, '请选择触发运单完成的操作'],
      },
      options: [{
        label: '手动触发',
        key: 1,
        value: 1
      }, {
        label: '自动触发',
        key: 2,
        value: 2
      }],
      disabled: Observer({
        watch: '*formMode',
        action: formMode => formMode === FORM_MODE.DETAIL
      }),
    },
    auditorOrganization1: {
      component: 'select',
      label: '第一审核方：',
      rules: {
        required: [true, '请选择第一审核方'],
      },
      placeholder: '请选择第一审核方',
      options: [{
        label: '托运',
        key: 4,
        value: 4
      }, {
        label: '承运',
        key: 5,
        value: 5
      }],
      visible: Observer({
        watch: ['manualTrigger', 'transportCompleteType'],
        action: ([manualTrigger, transportCompleteType], { form }) => {
          if (manualTrigger !== 3) {
            form.setFieldsValue({
              auditorOrganization1: undefined,
              auditorOrganization2: undefined
            });
          }
          if (transportCompleteType === 2) {
            form.setFieldsValue({
              manualTrigger: undefined
            });
          }
          return manualTrigger === 3 && transportCompleteType === 1;
        }
      }),
      disabled: Observer({
        watch: '*formMode',
        action: formMode => formMode === FORM_MODE.DETAIL
      }),
    },
    auditorOrganization2: {
      component: SecondOrganizationCheckBox,
      placeholder: '第二审核方（可选）：',
      visible: Observer({
        watch: ['auditorOrganization1', 'transportCompleteType', 'manualTrigger'],
        action: ([auditorOrganization1, transportCompleteType, manualTrigger], { form }) => {
          if (auditorOrganization1 !== 5) {
            form.setFieldsValue({
              auditorOrganization2: undefined,
            });
          }
          if (transportCompleteType === 2) {
            form.setFieldsValue({
              auditorOrganization1: undefined,
            });
          }
          if (manualTrigger !== 3) {
            form.setFieldsValue({
              auditorOrganization2: undefined,
            });
          }
          return auditorOrganization1 === 5;
        }
      }),
      disabled: Observer({
        watch: '*formMode',
        action: formMode => formMode === FORM_MODE.DETAIL
      }),
    },
    deliveryType: {
      label: '提货点：',
      component: 'radio',
      rules: {
        required: [true, '请选择提货点配置'],
      },
      options: [{
        label: '单提',
        key: 1,
        value: 1
      }, {
        label: '多提',
        key: 2,
        value: 2
      }, {
        label: '未知提货点',
        key: 3,
        value: 3
      }],
      disabled: Observer({
        watch: '*formMode',
        action: formMode => formMode === FORM_MODE.DETAIL
      }),
    },
    receivingType: {
      label: '卸货点：',
      component: 'radio',
      rules: {
        required: [true, '请选择卸货点配置'],
      },
      options: [{
        label: '单卸',
        key: 1,
        value: 1
      }, {
        label: '多卸',
        key: 2,
        value: 2
      }, {
        label: '无卸货点',
        key: 3,
        value: 3
      }],
      disabled: Observer({
        watch: '*formMode',
        action: formMode => formMode === FORM_MODE.DETAIL
      }),
    },
    releaseHall: {
      label: '是否允许发布到货源大厅：',
      component: 'radio',
      rules: {
        required: [true, '请选择是否允许发布到货源大厅'],

      },
      disabled: Observer({
        watch: '*formMode',
        action: formMode => formMode === FORM_MODE.DETAIL
      }),
      options: [{
        label: '是',
        key: 1,
        value: 1
      }, {
        label: '否',
        key: 0,
        value: 0
      }],
    },
    driverAcceptAudit: {
      label: '司机接单后是否需要确认：',
      component: 'radio',
      rules: {
        required: [true, '请选择司机接单后是否需要确认'],
      },
      options: [{
        label: '是',
        key: 1,
        value: 1
      }, {
        label: '否',
        key: 0,
        value: 0
      }],
      disabled: Observer({
        watch: '*formMode',
        action: formMode => formMode === FORM_MODE.DETAIL
      })
    },
    prebookingCompleteType: {
      customLabel: '预约单关闭条件：',
      component: CheckBox,
      disabled: Observer({
        watch: '*formMode',
        action: formMode => formMode === FORM_MODE.DETAIL
      }),
      rules: {
        required: [true, '请选择预约单关闭条件'],
      },
      options: [{
        label: '预约重量全部调度完成则关闭',
        key: 1,
        value: 1
      }, {
        label: '超过截止日期则自动关闭',
        key: 2,
        value: 2
      }, {
        label: '手动关闭',
        key: 3,
        value: 3
      }, {
        label: '每天自动关闭（0点）',
        key: 4,
        value: 4
      }]
    },
    transportBill: {
      customLabel: '可多选，至少需要勾选一个单据：',
      component: CheckBox,
      disabled: Observer({
        watch: '*formMode',
        action: formMode => formMode === FORM_MODE.DETAIL
      }),
      rules: {
        required: [true, '请选择所需运输单据'],
      },
      options: [{
        label: '提货单',
        key: 1,
        value: 1
      }, {
        label: '过磅单',
        key: 2,
        value: 2
      }, {
        label: '签收单',
        key: 3,
        value: 3
      }, {
        label: '到站图片',
        key: 4,
        value: 4
      }]
    },
    billNumberType: {
      customLabel: '选择需要自动生成单号的单据类型(可选)：',
      component: LinkageCheckBox,
      disabled: Observer({
        watch: '*formMode',
        action: formMode => formMode === FORM_MODE.DETAIL
      }),
      visible: Observer({
        watch: 'transportBill',
        action: (transportBill) => {
          if (transportBill === '2' || transportBill === '4' || transportBill === '2,4') return false;
          return !!transportBill;
        }
      }),
      options: Observer({
        watch: 'transportBill',
        action: transportBill => {
          if (!transportBill) return [];
          if (transportBill.indexOf('1') !== -1 && transportBill.indexOf('3') !== -1) return [{
            label: '自动生成提货单号',
            key: 1,
            value: 1
          }, {
            label: '自动生成签收单号',
            key: 3,
            value: 3
          }];
          if (transportBill.indexOf('1') !== -1) return [{
            label: '自动生成提货单号',
            key: 1,
            value: 1
          }];
          if (transportBill.indexOf('3') !== -1) return [{
            label: '自动生成签收单号',
            key: 3,
            value: 3
          }];
        }
      }),
    },
    deliveryElectronicDocumentsId: {
      label:'提货单',
      component: SelectWithPicture,
      disabled: Observer({
        watch: '*formMode',
        action: formMode => formMode === FORM_MODE.DETAIL
      }),
      options: async () => {
        const { items } = await getElectronicDocuments({ electronicDocumentsType:1, limit:1000, offset:0 });
        return [
          { label:'无', value:'temp', key:'temp' },
          ...(items || []).map(item => ({
            key: item.electronicDocumentsId,
            value: item.electronicDocumentsId,
            label: item.electronicDocumentsName,
            url: item.electronicDocumentsDentryid
          }))];
      },
      visible: Observer({
        watch: 'transportBill',
        action: (transportBill) => {
          if (!transportBill) return false;
          if (transportBill.indexOf('1') !== -1) return true;
          return false;
        }
      }),
    },
    receivingElectronicDocumentsId: {
      label:'签收单',
      component: SelectWithPicture,
      disabled: Observer({
        watch: '*formMode',
        action: formMode => formMode === FORM_MODE.DETAIL
      }),
      options: async () => {
        const { items } = await getElectronicDocuments({ electronicDocumentsType:3, limit:1000, offset:0 });
        return [
          { label:'无', value:'temp', key:'temp' },
          ...(items || []).map(item => ({
            key: item.electronicDocumentsId,
            value: item.electronicDocumentsId,
            label: item.electronicDocumentsName,
            url: item.electronicDocumentsDentryid
          }))];
      },
      visible: Observer({
        watch: 'transportBill',
        action: (transportBill) => {
          if (!transportBill) return false;
          if (transportBill.indexOf('3') !== -1) return true;
          return false;
        }
      }),
    },
    poundDifference: {
      label: '允许的磅差范围： 千分之 ',
      component: 'input',
      // type: 'number', // number类型后无法写入现有数据
      disabled: Observer({
        watch: '*formMode',
        action: formMode => formMode === FORM_MODE.DETAIL
      }),
      rules: {
        required: [true, '请输入允许的磅差范围'],
        validator: ({ value }) => {
          const reg = /^(?:0|[1-9]?|9)$/;
          if (!reg.test(value)) return '仅支持0-9以内整数';
        }
      },
    },
    priceType: {
      label: '价格类型：',
      component: 'radio',
      disabled: Observer({
        watch: '*formMode',
        action: formMode => formMode === FORM_MODE.DETAIL
      }),
      rules: {
        required: [true, '请选择价格类型'],
      },
      options: [{
        label: '单价',
        key: 1,
        value: 1
      }]
    },
    measurementUnit: {
      component: 'select',
      disabled: Observer({
        watch: '*formMode',
        action: formMode => formMode === FORM_MODE.DETAIL
      }),
      rules: {
        required: [true, '请选择计量单位'],
      },
      options: [{
        label: '吨/公里',
        key: 1,
        value: 1
      }, {
        label: '方',
        key: 2,
        value: 2
      }, {
        label: '元/吨',
        key: 3,
        value: 3
      }, {
        label: '元/方',
        key: 4,
        value: 4
      }],
      placeholder: '请选择计量单位'
    },
    measurementSource: {
      component: 'select',
      rules: {
        required: [true, '请选择计量来源'],
      },
      options: Observer({
        watch: 'transportBill',
        action: (transportBill)=> {
          if (!transportBill) return [];
          const options = [];
          if (transportBill.indexOf('1') !== -1) {
            options.push({
              label: '按提货数量计算',
              key: 1,
              value: 1
            });
          }
          if (transportBill.indexOf('3') !== -1) {
            options.push({
              label: '按签收数量计算',
              key: 2,
              value: 2
            });
          }
          if (transportBill.indexOf('3') !== -1 && transportBill.indexOf('1') !== -1) {
            options.push({
              label: '按最小数量计算',
              key: 3,
              value: 3
            });
          }
          return options;
        }
      }),
      disabled: Observer({
        watch: '*formMode',
        action: formMode => formMode === FORM_MODE.DETAIL
      }),
      placeholder: '请选择计量来源'
    },
    businessTypeName: {
      label: '业务类型：',
      component: 'input',
      placeholder: '请输入业务类型名称',
      disabled: Observer({
        watch: '*formMode',
        action: formMode => formMode === FORM_MODE.DETAIL
      }),
      rules: {
        required: [true, '请输入业务类型'],
      },
    },
    remarks: {
      label: '业务类型描述：',
      component: 'input',
      placeholder: '请输入业务类型描述',
      rules: {
        required: [true, '请输入业务类型描述'],
      },
      disabled: Observer({
        watch: '*formMode',
        action: formMode => formMode === FORM_MODE.DETAIL
      }),
    },
    confirmOrganization: {
      component: 'select',
      rules: {
        required: [true, '请选择确认方'],
      },
      disabled: Observer({
        watch: '*formMode',
        action: formMode => formMode === FORM_MODE.DETAIL
      }),
      options: [{
        label: '发起方',
        key: 0,
        value: 0
      }, {
        label: '托运方',
        key: 4,
        value: 4
      }, {
        label: '承运方',
        key: 5,
        value: 5
      }],
      visible:Observer({
        watch:"driverAcceptAudit",
        action: (driverAcceptAudit, { form })=>{
          if (!driverAcceptAudit) {
            form.setFieldsValue({
              confirmOrganization: undefined
            });
          }
          return driverAcceptAudit === 1;
        }
      }),
      placeholder: '请选择确认方'
    },
    deliveryLaterKilometre: {
      label: '提货后行驶',
      component: 'input',
      rules: {
        required: [true, '请输入公里数'],
        validator: ({ value })=>{
          if (!/^[1-9]\d*$/.test(value)) return '仅支持整数';
        }
      },
      visible: Observer({
        watch: ['transportCompleteType'],
        action: (transportCompleteType) => transportCompleteType === 2
      }),
      disabled: Observer({
        watch: '*formMode',
        action: formMode => formMode === FORM_MODE.DETAIL
      }),
    },
    deliveryLaterMinute: {
      label: '公里且停车超过',
      component: 'input',
      rules: {
        required: [true, '请输入分钟数'],
        validator: ({ value })=>{
          if (!/^[1-9]\d*$/.test(value)) return '仅支持整数';
        }
      },
      visible: Observer({
        watch: ['transportCompleteType'],
        action: (transportCompleteType) => transportCompleteType === 2
      }),
      disabled: Observer({
        watch: '*formMode',
        action: formMode => formMode === FORM_MODE.DETAIL
      }),
    },
    deliveryLaterHour: {
      label: '分钟，或提货后超过',
      component: 'input',
      rules: {
        required: [true, '请输入小时数'],
        validator: ({ value })=>{
          if (!/^\d+\.?\d{0,2}$/.test(value)) return '最高支持两位小数';
          if (value < 0) return '请输入大于等于0的数';
        },
      },
      visible: Observer({
        watch: ['transportCompleteType'],
        action: (transportCompleteType) => transportCompleteType === 2
      }),
      disabled: Observer({
        watch: '*formMode',
        action: formMode => formMode === FORM_MODE.DETAIL
      }),
    },
    hoursTip: {
      label: '小时',
      component: 'input',
      visible: Observer({
        watch: ['transportCompleteType'],
        action: (transportCompleteType) => transportCompleteType === 2
      }),
      disabled: Observer({
        watch: '*formMode',
        action: formMode => formMode === FORM_MODE.DETAIL
      }),
    }
  }

  formatBillNumberType = data => {
    const { billNumberType, transportBill } = data;
    const billNumberTypeArray = (billNumberType || '').split(',');
    const transportBillArray = (transportBill || '').split(',');
    return intersection(billNumberTypeArray, transportBillArray).join(',');
  }

  handleSaveBtnClick = data => {
    const formData = {};
    formData.businessTypeName = data.businessTypeName;
    formData.remarks = data.remarks;
    formData.deliveryType = data.deliveryType;
    formData.receivingType = data.receivingType;
    formData.prebookingCompleteType = data.prebookingCompleteType;
    formData.releaseHall = data.releaseHall;
    formData.driverAcceptAudit = data.driverAcceptAudit;
    if (data.driverAcceptAudit === 1) {
      formData.confirmOrganization = data.confirmOrganization;
    }
    formData.transportBill = data.transportBill;
    formData.billNumberType = this.formatBillNumberType(data);
    formData.electronicDocumentsIdList = [data.deliveryElectronicDocumentsId, data.receivingElectronicDocumentsId].filter(value => value && value !== 'temp');
    formData.poundDifference = data.poundDifference / 1000;
    formData.priceType = data.priceType;
    formData.measurementUnit = data.measurementUnit;
    formData.measurementSource = data.measurementSource;
    formData.driverDeliveryAudit = data.driverDeliveryAudit;
    formData.transportCompleteType = data.transportCompleteType;
    if (data.transportCompleteType === 1) {
      formData.manualTrigger = data.manualTrigger;
      if (data.manualTrigger === 3) {
        if (data.auditorOrganization1 === 4) {
          formData.auditorOrganization = 4;
        }
        if (data.auditorOrganization1 === 5) {
          if (data.auditorOrganization2) {
            formData.auditorOrganization = '5,4';
          } else {
            formData.auditorOrganization = 5;
          }
        }
      }
    } else {
      formData.deliveryLaterKilometre = data.deliveryLaterKilometre;
      formData.deliveryLaterMinute = data.deliveryLaterMinute;
      formData.deliveryLaterHour = data.deliveryLaterHour;
    }
    this.props.postBusinessTypes(formData).then(() => {
      notification.success({
        message: '创建成功',
        description: '成功创建业务类型配置'
      });
      localStorage.removeItem(this.currentTab.id);
      this.localData = { formData: {} };
      this.props.getBusinessTypes({ offset: 0, limit: 1000, isOrderByTime: true }).then(data => {
        this.setState({
          formMode: FORM_MODE.DETAIL,
          more: false,
          tab: Number(data.items[0].businessTypeId)
        });
      });
    });
  }

  refresh = () => {
    this.props.getBusinessTypes({ offset: 0, limit: 1000, isOrderByTime: true }).then(data => {
      if (data.items.length > 0) {
        const { location: { query: { businessTypeId } } } = this.props;
        if (businessTypeId) {
          return this.setState({
            ready: true,
            tab: Number(businessTypeId),
            formMode: FORM_MODE.DETAIL
          });
        }
        this.setState({
          ready: true,
          tab: data.items[0].businessTypeId,
          formMode: FORM_MODE.DETAIL
        });
      } else {
        this.setState({
          ready: true
        });
      }
    });
  }

  componentDidMount () {
    if (!isEmpty(this.localData.formData)) {
      this.setState({
        formMode: FORM_MODE.ADD,
        more: false,
        tab: '',
        ready: true,
      });
    } else {
      this.refresh();
    }
  }

  componentWillUnmount() {
    if  (this.state.formMode === FORM_MODE.ADD) {
      // 页面销毁的时候自己 先移除原有的 再存储最新的
      const formData = this.form1 ? this.form1.getFieldsValue() : null;
      localStorage.removeItem(this.currentTab.id);
      if (getLocal('local_commonStore_tabs').tabs.length > 1) {
        localStorage.setItem(this.currentTab.id, JSON.stringify({
          formData: { ...formData, projectDentryid:  formData && formData.projectDentryid || '' },
        }));
      }
    }
  }

  seeMore = () => {
    this.setState({
      more: !this.state.more,
    });
  }

  addNewBusinessType = () => {
    this.setState({
      formMode: FORM_MODE.ADD,
      more: false,
      tab: ''
    });
  }

  selectTab = e => {
    this.setState({
      tab: Number(e.target.getAttribute('value')),
      more: false,
      formMode: FORM_MODE.DETAIL,
    });
  }

  renderTabs = () => {
    const { lists } = this.props;
    const { tab } = this.state;
    if (lists.count === 0) return null;
    return (
      <>
        <ul styleName='ul_tabs_container'>
          {
            lists.items.map((item, index) =>
              // if ((index + 1) % 4 === 0) {
              //   return (
              //     <>
              //       <li key={item.businessTypeId} onClick={this.selectTab} styleName={tab === item.businessTypeId? 'active_li': ''} value={item.businessTypeId}>{item.businessTypeName}</li>
              //       <br />
              //     </>
              //   )
              // }
              <li key={item.businessTypeId} onClick={this.selectTab} styleName={tab === item.businessTypeId? 'active_li': ''} value={item.businessTypeId}>{item.businessTypeName}</li>
            )
          }
        </ul>
      </>
    );
  }

  getActiveData = () => {
    if (this.state.formMode === FORM_MODE.ADD) return this.localData && this.localData.formData || null;
    const { lists } = this.props;
    if (lists.count === 0) return null;
    const { tab } = this.state;
    const active = lists.items.find(item => item.businessTypeId === tab);
    const formData = Object.assign(JSON.parse(JSON.stringify(active)));
    formData.poundDifference = Number(active.poundDifference * 1000).toFixed(2)._toFixed(2);
    formData.confirmOrganization = Number(active.confirmOrganization);
    formData.deliveryElectronicDocumentsId = ((active.electronicDocumentsEntities || []).find(item => item.electronicDocumentsType === 1)|| {} ).electronicDocumentsId;
    formData.receivingElectronicDocumentsId = ((active.electronicDocumentsEntities || []).find(item => item.electronicDocumentsType === 3)|| {} ).electronicDocumentsId;
    if (formData.manualTrigger === 3) {
      formData.auditorOrganization1 = Number(active.auditorOrganization.split(',')[0]);
      formData.auditorOrganization2 = Number(active.auditorOrganization.split(',')[1]);
    }
    return formData;
  }

  render () {
    const { ready, more, formMode } = this.state;
    const { lists } = this.props;
    const formLayout = {
      labelCol: {
        span: 24
      },
      wrapperCol: {
        span: 24
      }
    };
    return (
      ready
      &&
      <>
        <SchemaForm {...formLayout} layout="vertical" schema={{ ...this.formSchema }} mode={FORM_MODE.ADD} trigger={{ formMode }} data={this.getActiveData()} hideRequiredMark className='businessType_setting_form'>
          <div styleName='tabs_container'>
            <h3>业务类型</h3>
            <div styleName={more? 'tabs_group_container': 'tabs_group_container overflow_hidden'}>
              {
                lists.count > 4?
                  <img styleName='more_icon' src={moreIcon} alt="加载失败" onClick={this.seeMore} />
                  :
                  null
              }
              <div styleName={more? 'tabs_group show_border': 'tabs_group'}>
                {this.renderTabs()}
              </div>
            </div>
            <Button type="primary" onClick={this.addNewBusinessType}>新增业务类型</Button>
          </div>
          {
            lists.count > 0 || formMode === FORM_MODE.ADD?
              <>
                <div styleName='item_box'>
                  <Row>
                    <Col span={6}><Item wrapperCol={{ span: 12 }} field='businessTypeName' /></Col>
                    <Col span={8}><Item wrapperCol={{ span: 20 }} field='remarks' /></Col>
                  </Row>
                </div>
                <h3 styleName='form_title'>运输路线</h3>
                <div styleName='item_box'>
                  <Item styleName='flex_align_start' field='deliveryType' />
                  <br />
                  <Item styleName='flex_align_start' field='receivingType' />
                  <br />
                </div>
                <h3 styleName='form_title'>预约单</h3>
                <div styleName='item_box'>
                  <Item field='prebookingCompleteType' />
                  <br />
                  <Row>
                    <Col span={7}>
                      <Item className='businessType_setting_form_releaseHall' field='releaseHall' />
                    </Col>
                    <Col span={7} style={{ width: 'auto' }}>
                      <Item className='businessType_setting_form_releaseHall' field='driverAcceptAudit' />
                    </Col>
                    <Col span={7}>
                      <Item field='confirmOrganization' />
                    </Col>
                  </Row>
                  <br />
                </div>
                <h3 styleName='form_title'>运单</h3>
                <div styleName='item_box'>
                  <Item field='transportBill' />
                  <Item field='billNumberType' />
                  <Item field='deliveryElectronicDocumentsId' />
                  <Item field='receivingElectronicDocumentsId' />
                  <br />
                  <Item className='businessType_setting_form_poundInput' field='poundDifference' />
                  <br />
                  <Row>
                    <Col span={7} style={{ width: 'auto' }}>
                      <Item className='businessType_setting_form_priceType' field='priceType' />
                    </Col>
                    <Col span={7} style={{ width: 'auto' }}>
                      <Item field='measurementUnit' />
                    </Col>
                    <Col span={7}>
                      <Item field='measurementSource' />
                    </Col>
                  </Row>
                  <br />
                  <Item styleName='flex_align_start' field='driverDeliveryAudit' />
                  <p styleName='mar0'>（当司机提货后需要托运审核，则运单状态从待提货状态变为提货审核，托运审核通过后，状态变为运输中；</p>
                  <p styleName='mar0'>若不需要托运审核，则提货后状态直接变为运输中）</p>
                  <br />
                  <Row>
                    <Col span={6} styleName='autoWidth'>
                      <Item className='businessType_setting_form_transportCompleteType' field='transportCompleteType' />
                    </Col>
                    <Col span={18}>
                      <Row>
                        <Col span={6} styleName='autoWidth'>
                          <Item field='manualTrigger' />
                        </Col>
                        <Col span={6} styleName='autoWidth pdl10'>
                          <Item className='businessType_setting_form_auditorOrganization businessType_setting_form_firstOrganization' styleName='flex_align_start' field='auditorOrganization1' />
                        </Col>
                        <Col span={6}>
                          <Item className='businessType_setting_form_auditorOrganization' field='auditorOrganization2' />
                        </Col>
                      </Row>
                      <Row styleName='mrTop20'>
                        <Col span={6} styleName='autoWidth'>
                          <Item styleName='flex_align_start' field='deliveryLaterKilometre' />
                        </Col>
                        <Col span={6} styleName='autoWidth'>
                          <Item styleName='flex_align_start' field='deliveryLaterMinute' />
                        </Col>
                        <Col span={6} styleName='autoWidth'>
                          <Item styleName='flex_align_start' field='deliveryLaterHour' />
                        </Col>
                        <Col span={6} styleName='autoWidth'>
                          {/* <span styleName='hours'>小时</span> */}
                          <Item styleName='flex_align_start hours' field='hoursTip' />
                        </Col>
                      </Row>
                    </Col>
                  </Row>
                  <p>（若选择自动触发结束，则当运单超过设置时长后，自动结束）</p>
                </div>
                <div styleName='saveBtn_box'>
                  {
                    formMode === FORM_MODE.ADD?
                      <DebounceFormButton label="保存" className="mr-10" type="primary" onClick={this.handleSaveBtnClick} />
                      :
                      null
                  }
                </div>
              </>
              :
              null
          }
        </SchemaForm>
      </>
    );
  }
}

@CSSModules(styles, { allowMultiple: true })
class SecondOrganizationCheckBox extends React.Component{
  onChange = e => {
    if (e.target.checked) {
      this.props.onChange(4);
    } else {
      this.props.onChange(undefined);
    }
  }

  render () {
    return (
      <div styleName='second_organization_container'>
        <span styleName='second_organization'>{this.props.placeholder}</span>
        <Checkbox disabled={this.props.disabled} checked={this.props.value === 4} onChange={this.onChange}>托运</Checkbox>
      </div>
    );
  }
}
