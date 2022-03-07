import React from 'react';
import { SchemaForm, Item, FORM_MODE, Observer } from '@gem-mine/antd-schema-form';
import DebounceFormButton from '@/components/DebounceFormButton';
import { connect } from 'dva';
import router from 'umi/router';
import CSSModules from 'react-css-modules';
import '@gem-mine/antd-schema-form/lib/fields';
import { Row, Col, Button, notification, Select, Modal } from "antd";
import {
  postTradingSchemes,
  getTradingSchemes,
  getTradingSchemesList,
  patchProjectConfigure,
  patchTradingScheme,
  detailProjects
} from "@/services/apiService";
import { getLocal } from '@/utils/utils';
import styles from './AddLogisticsTransaction.less';

const { Option } = Select;
function mapStateToProps (state) {
  return {
    commonStore: state.commonStore,
  };
}

const mapDispatchToProps = (dispatch) => ({
  deleteTab: (store, payload) => dispatch({ type: "commonStore/deleteTab", store, payload }),
});

@connect(mapStateToProps, mapDispatchToProps )
@CSSModules(styles, { allowMultiple: true })
export default class AddLogisticsTransaction extends React.Component{
  currentTab = this.props.commonStore.tabs.find(item => item.id === this.props.commonStore.activeKey);

  localData = getLocal(this.currentTab.id) || { formData: {} };

  form = null;

  state = {
    formMode: '',
    formData: {},
    shipmentType : 0,
    ready: false,
    errorMsg: false
  }

  formSchema = {
    tradingSchemeName: {
      label: "交易方案名称：",
      component: 'input',
      placeholder: '请输入交易方案名称',
      rules: {
        required: [true, '请输入交易方案名称'],
      },
      disabled: Observer({
        watch: '*formMode',
        action: formMode => formMode === FORM_MODE.DETAIL
      }),
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
    tradingSchemeCode: {
      label: "交易方案代码：",
      component: 'input',
      placeholder: '请输入交易方案代码',
      rules: {
        required: [true, '请输入交易方案代码'],
      },
      disabled: Observer({
        watch: '*formMode',
        action: formMode => formMode === FORM_MODE.DETAIL || formMode === FORM_MODE.MODIFY
      }),
    },
    tradingSchemeDescription: {
      label: "交易方案描述：",
      component: 'input',
      placeholder: '请输入交易方案描述',
      rules: {
        required: [true, '请输入交易方案描述'],
      },
      disabled: Observer({
        watch: '*formMode',
        action: formMode => formMode === FORM_MODE.DETAIL
      }),
    },
    consignmentServiceBasis: {
      label: "平台服务费收费依据（针对托运）：",
      component: 'radio',
      rules: {
        required: [true, '请选择服务费收费依据'],
      },
      disabled: Observer({
        watch: '*formMode',
        action: formMode => formMode === FORM_MODE.DETAIL  || formMode === FORM_MODE.MODIFY
      }),
      options: [{
        label: '按运单运费金额收取',
        key: 1,
        value: 1
      }, {
        label: '按运单数量单位收取',
        key: 2,
        value: 2
      }, {
        label: '按运单收取固定费用',
        key: 3,
        value: 3
      }]
    },
    consignmentServiceStandard: {
      label: "货主发单手续费标准：",
      component: 'radio',
      rules: {
        required: [true, '请选择发单手续费标准'],
      },
      options: [{
        label: '比率（不带上限）',
        key: 1,
        value: 1
      }, {
        label: '比率（带最大上限）',
        key: 2,
        value: 2
      }, {
        label: '固定额度',
        key: 3,
        value: 3
      }, {
        label: '每单位',
        key: 4,
        value: 4
      }],
      disabled: Observer({
        watch: '*formMode',
        action: formMode => formMode === FORM_MODE.DETAIL  || formMode === FORM_MODE.MODIFY
      }),
    },
    consignmentServiceRate1: {
      placeholder: '请输入比率',
      rules: {
        required: [true, '请输入比率'],
        validator: ({ value })=>{
          if (!/^\d+\.?\d{0,2}$/.test(value)) return '最高支持两位小数';
          if (value < 0) return '请输入大于等于0的数';
        },
      },
      visible: Observer({
        watch:["consignmentServiceStandard"],
        action:(consignmentServiceStandard, { form })=>{
          if (consignmentServiceStandard !== 1) {
            form.setFieldsValue({
              consignmentServiceRate1: undefined
            });
          }
          return consignmentServiceStandard === 1;
        }
      }),
      component: 'input',
      disabled: Observer({
        watch: '*formMode',
        action: formMode => formMode === FORM_MODE.DETAIL || formMode === FORM_MODE.MODIFY
      }),
    },
    consignmentServiceRate2: {
      placeholder: '请输入比率',
      rules: {
        required: [true, '请输入比率'],
        validator: ({ value })=>{
          if (!/^\d+\.?\d{0,2}$/.test(value)) return '最高支持两位小数';
          if (value < 0) return '请输入大于等于0的数';
        },
      },
      visible: Observer({
        watch:["consignmentServiceStandard"],
        action:(consignmentServiceStandard, { form })=>{
          if (consignmentServiceStandard !== 2) {
            form.setFieldsValue({
              consignmentServiceRate2: undefined
            });
          }
          return consignmentServiceStandard === 2;
        }
      }),
      disabled: Observer({
        watch: '*formMode',
        action: formMode => formMode === FORM_MODE.DETAIL || formMode === FORM_MODE.MODIFY
      }),
      component: 'input',
    },
    consignmentServiceUnivalence: {
      placeholder: '请输入金额',
      rules: {
        required: [true, '请输入金额'],
        validator: ({ value })=>{
          if (!/^\d+\.?\d{0,2}$/.test(value)) return '最高支持两位小数';
          if (value < 0) return '请输入大于等于0的数';
        },
      },
      disabled: Observer({
        watch: '*formMode',
        action: formMode => formMode === FORM_MODE.DETAIL || formMode === FORM_MODE.MODIFY
      }),
      visible: Observer({
        watch:["consignmentServiceStandard"],
        action:(consignmentServiceStandard, { form })=>{
          if (consignmentServiceStandard !== 4) {
            form.setFieldsValue({
              consignmentServiceUnivalence: undefined
            });
          }
          return consignmentServiceStandard === 4;
        }
      }),
      component: 'input',
    },
    consignmentServiceAmount2: {
      label: '上限',
      placeholder: '请输入金额',
      rules: {
        required: [true, '请输入金额'],
        validator: ({ value })=>{
          if (!/^\d+\.?\d{0,2}$/.test(value)) return '最高支持两位小数';
          if (value < 0) return '请输入大于等于0的数';
        },
      },
      disabled: Observer({
        watch: '*formMode',
        action: formMode => formMode === FORM_MODE.DETAIL || formMode === FORM_MODE.MODIFY
      }),
      component: 'input',
      visible: Observer({
        watch:["consignmentServiceStandard"],
        action:(consignmentServiceStandard, { form })=>{
          if (consignmentServiceStandard !== 2) {
            form.setFieldsValue({
              consignmentServiceAmount2: undefined
            });
          }
          return consignmentServiceStandard === 2;
        }
      }),
    },
    consignmentServiceAmount3: {
      placeholder: '请输入金额',
      rules: {
        required: [true, '请输入金额'],
        validator: ({ value })=>{
          if (!/^\d+\.?\d{0,2}$/.test(value)) return '最高支持两位小数';
          if (value < 0) return '请输入大于等于0的数';
        },
      },
      disabled: Observer({
        watch: '*formMode',
        action: formMode => formMode === FORM_MODE.DETAIL || formMode === FORM_MODE.MODIFY
      }),
      visible: Observer({
        watch:["consignmentServiceStandard"],
        action:(consignmentServiceStandard, { form })=>{
          if (consignmentServiceStandard !== 3) {
            form.setFieldsValue({
              consignmentServiceAmount3: undefined
            });
          }
          return consignmentServiceStandard === 3;
        }
      }),
      component: 'input',
    },
    consignmentServiceAmount4: {
      label: '上限',
      placeholder: '请输入金额',
      rules: {
        required: [true, '请输入金额'],
        validator: ({ value })=>{
          if (!/^\d+\.?\d{0,2}$/.test(value)) return '最高支持两位小数';
          if (value < 0) return '请输入大于等于0的数';
        },
      },
      disabled: Observer({
        watch: '*formMode',
        action: formMode => formMode === FORM_MODE.DETAIL || formMode === FORM_MODE.MODIFY
      }),
      visible: ({
        watch:["consignmentServiceStandard"],
        action:(consignmentServiceStandard, { form })=>{
          if (consignmentServiceStandard !== 4) {
            form.setFieldsValue({
              consignmentServiceAmount4: undefined
            });
          }
          return consignmentServiceStandard === 4;
        }
      }),
      component: 'input',
    },
    salesTransactionMode: {
      label: "销售交易模式：",
      component: 'radio',
      rules: {
        required: [true, '请选择发单手续费标准'],
      },
      disabled: Observer({
        watch: '*formMode',
        action: formMode => formMode === FORM_MODE.DETAIL || formMode === FORM_MODE.MODIFY
      }),
      options: [{
        label: '自动生成对账单/自动生成收款单/手动收款/先款后票',
        key: 1,
        value: 1
      }, {
        label: '手动生成对账单/手动生成收款单/手动收款/先款后票',
        key: 2,
        value: 2
      }, {
        label: '手动生成对账单/手动生成收款单/手动收款/先票后款',
        key: 3,
        value: 3
      }, {
        label : '自动生成对账单/自动生成收款单/自动收款/先款后票/先付运费后付服务费',
        key : 4,
        value : 4
      }],
    },
    automaticGatheringTrigger: {
      component: 'select',
      placeholder: '请选择自动收款触发节点',
      rules: {
        required: [true, '请选择自动收款触发节点'],
      },
      options: [{
        label: '当运单状态变为运输中自动触发',
        key: 1,
        value: 1
      }, {
        label: '当运单状态变为已完成时自动触发',
        key: 2,
        value: 2
      }],
      visible: Observer({
        watch:["salesTransactionMode"],
        action:(salesTransactionMode, { form })=>{
          if (salesTransactionMode !== 1) {
            form.setFieldsValue({
              automaticGatheringTrigger: undefined
            });
          }
          return salesTransactionMode === 1;
        }
      }),
      disabled: Observer({
        watch: '*formMode',
        action: formMode => formMode === FORM_MODE.DETAIL || formMode === FORM_MODE.MODIFY
      }),
    },
    // isConsignmentInitiate: {
    //   component: 'radio',
    //   label: '对账发起方：',
    //   rules: {
    //     required: [true, '请选择对账发起方'],
    //   },
    //   options: [{
    //     label: '由货主方（托运/承运）发起平台对账',
    //     key: 1,
    //     value: 1
    //   }, {
    //     label: '由平台发起货主方（托运/承运）对账',
    //     key: 2,
    //     value: 2
    //   }],
    //   disabled: Observer({
    //     watch: ['*formMode', 'salesTransactionMode'],
    //     action: (data) => data[0] === FORM_MODE.DETAIL || data[1] === 4
    //   }),
    //   observer : Observer({
    //     watch: ['*formMode', 'salesTransactionMode'],
    //     // action : formData => formData === 4 && 1
    //     action : (data) => {
    //       if (data[0] !== FORM_MODE.DETAIL && data[1] === 4){
    //
    //         return { value : 1 };
    //       }
    //     }
    //   }),
    //   // value : Observer({
    //   //   watch: ['*formMode', 'salesTransactionMode'],
    //   //   action : data => {
    //   //     if (data[0] !== FORM_MODE.DETAIL){
    //   //       return data[1] === 4 && 1
    //   //     }
    //   //   }
    //   // }),
    // },
    // isReceiverAudit: {
    //   component: 'radio',
    //   label: '对账接收方是否需要审核：',
    //   rules: {
    //     required: [true, '请选择对账接收方是否需要审核'],
    //   },
    //   options: [{
    //     label: '审核',
    //     key: 1,
    //     value: 1
    //   }, {
    //     label: '不审核',
    //     key: 0,
    //     value: 0
    //   }],
    //   disabled: Observer({
    //     watch: '*formMode',
    //     action: formMode => formMode === FORM_MODE.DETAIL || formMode === FORM_MODE.MODIFY
    //   }),
    // },
    shipmentServiceBasis: {
      label: "平台服务费收费依据：",
      component: 'radio',
      rules: {
        required: [true, '请选择服务费收费依据'],
      },
      options: [{
        label: '按运单运费金额收取',
        key: 1,
        value: 1
      // }, {
      //   label: '按运单数量单位收取',
      //   key: 2,
      //   value: 2
      // }, {
      //   label: '按运单收取固定费用',
      //   key: 3,
      //   value: 3
      }],
      disabled: Observer({
        watch: '*formMode',
        action: formMode => formMode === FORM_MODE.DETAIL || formMode === FORM_MODE.MODIFY
      }),
    },
    shipmentServiceStandard: {
      label: "承运接单手续费：",
      component: 'radio',
      rules: {
        required: [true, '请选择接单手续费标准'],
      },
      options: [{
        label: '比率（不带上限）',
        key: 1,
        value: 1
      // }, {
      //   label: '比率（带最大上限）',
      //   key: 2,
      //   value: 2
      // }, {
      //   label: '固定额度',
      //   key: 3,
      //   value: 3
      // }, {
      //   label: '每单位',
      //   key: 4,
      //   value: 4
      }],
      disabled: Observer({
        watch: '*formMode',
        action: formMode => formMode === FORM_MODE.DETAIL || formMode === FORM_MODE.MODIFY
      }),
    },
    shipmentServiceRate1: {
      placeholder: '请输入比率',
      rules: {
        required: [true, '请输入比率'],
        validator: ({ value })=>{
          if (!/^\d+\.?\d{0,2}$/.test(value)) return '最高支持两位小数';
          if (value < 0) return '请输入大于等于0的数';
        },
      },
      visible: Observer({
        watch:["shipmentServiceStandard"],
        action:(shipmentServiceStandard, { form })=>{
          if (shipmentServiceStandard !== 1) {
            form.setFieldsValue({
              shipmentServiceRate1: undefined
            });
          }
          return shipmentServiceStandard === 1;
        }
      }),
      disabled: Observer({
        watch: '*formMode',
        action: formMode => formMode === FORM_MODE.DETAIL || formMode === FORM_MODE.MODIFY
      }),
      component: 'input',
    },
    shipmentServiceRate2: {
      placeholder: '请输入比率',
      rules: {
        required: [true, '请输入比率'],
        validator: ({ value })=>{
          if (!/^\d+\.?\d{0,2}$/.test(value)) return '最高支持两位小数';
          if (value < 0) return '请输入大于等于0的数';
        },
      },
      visible: Observer({
        watch:["shipmentServiceStandard"],
        action:(shipmentServiceStandard, { form })=>{
          if (shipmentServiceStandard !== 2) {
            form.setFieldsValue({
              shipmentServiceRate2: undefined
            });
          }
          return shipmentServiceStandard === 2;
        }
      }),
      disabled: Observer({
        watch: '*formMode',
        action: formMode => formMode === FORM_MODE.DETAIL || formMode === FORM_MODE.MODIFY
      }),
      component: 'input',
    },
    shipmentServiceUnivalence: {
      placeholder: '请输入金额',
      rules: {
        required: [true, '请输入金额'],
        validator: ({ value })=>{
          if (!/^\d+\.?\d{0,2}$/.test(value)) return '最高支持两位小数';
          if (value < 0) return '请输入大于等于0的数';
        },
      },
      visible: Observer({
        watch:["shipmentServiceStandard"],
        action:(shipmentServiceStandard, { form })=>{
          if (shipmentServiceStandard !== 4) {
            form.setFieldsValue({
              shipmentServiceUnivalence: undefined
            });
          }
          return shipmentServiceStandard === 4;
        }
      }),
      disabled: Observer({
        watch: '*formMode',
        action: formMode => formMode === FORM_MODE.DETAIL || formMode === FORM_MODE.MODIFY
      }),
      component: 'input',
    },
    shipmentServiceAmount2: {
      label: '上限',
      placeholder: '请输入金额',
      rules: {
        required: [true, '请输入金额'],
        validator: ({ value })=>{
          if (!/^\d+\.?\d{0,2}$/.test(value)) return '最高支持两位小数';
          if (value < 0) return '请输入大于等于0的数';
        },
      },
      component: 'input',
      visible: Observer({
        watch:["shipmentServiceStandard"],
        action:(shipmentServiceStandard, { form })=>{
          if (shipmentServiceStandard !== 2) {
            form.setFieldsValue({
              shipmentServiceAmount2: undefined
            });
          }
          return shipmentServiceStandard === 2;
        }
      }),
      disabled: Observer({
        watch: '*formMode',
        action: formMode => formMode === FORM_MODE.DETAIL || formMode === FORM_MODE.MODIFY
      }),
    },
    shipmentServiceAmount3: {
      placeholder: '请输入金额',
      rules: {
        required: [true, '请输入金额'],
        validator: ({ value })=>{
          if (!/^\d+\.?\d{0,2}$/.test(value)) return '最高支持两位小数';
          if (value < 0) return '请输入大于等于0的数';
        },
      },
      visible: Observer({
        watch:["shipmentServiceStandard"],
        action:(shipmentServiceStandard, { form })=>{
          if (shipmentServiceStandard !== 3) {
            form.setFieldsValue({
              shipmentServiceAmount3: undefined
            });
          }
          return shipmentServiceStandard === 3;
        }
      }),
      component: 'input',
      disabled: Observer({
        watch: '*formMode',
        action: formMode => formMode === FORM_MODE.DETAIL || formMode === FORM_MODE.MODIFY
      }),
    },
    shipmentServiceAmount4: {
      label: '上限',
      placeholder: '请输入金额',
      rules: {
        required: [true, '请输入金额'],
        validator: ({ value })=>{
          if (!/^\d+\.?\d{0,2}$/.test(value)) return '最高支持两位小数';
          if (value < 0) return '请输入大于等于0的数';
        },
      },
      visible: Observer({
        watch:["shipmentServiceStandard"],
        action:(shipmentServiceStandard, { form })=>{
          if (shipmentServiceStandard !== 4) {
            form.setFieldsValue({
              shipmentServiceAmount4: undefined
            });
          }
          return shipmentServiceStandard === 4;
        }
      }),
      component: 'input',
      disabled: Observer({
        watch: '*formMode',
        action: formMode => formMode === FORM_MODE.DETAIL || formMode === FORM_MODE.MODIFY
      }),
    },
    purchasingTransactionMode: {
      label: "采购交易模式：",
      component: 'radio',
      rules: {
        required: [true, '请选择采购交易模式'],
      },
      options: [{
        label: '自动支付运单/自动生成对账单/自动生成付款单',
        key: 1,
        value: 1
      }],
      disabled: Observer({
        watch: '*formMode',
        action: formMode => formMode === FORM_MODE.DETAIL || formMode === FORM_MODE.MODIFY
      }),
    },
    driverServiceStandard: {
      label: "司机接单手续费：",
      component: 'radio',
      rules: {
        required: [true, '请选择接单手续费标准'],
      },
      options: [{
        label: '比率（不带上限）',
        key: 1,
        value: 1
      },
      // {
      //   label: '比率（带最大上限）',
      //   key: 2,
      //   value: 2
      // },
      {
        label: '固定额度',
        key: 3,
        value: 3
      },
      // {
      //   label: '每单位',
      //   key: 4,
      //   value: 4
      // }
      ],
      disabled: Observer({
        watch: '*formMode',
        action: formMode => formMode === FORM_MODE.DETAIL || formMode === FORM_MODE.MODIFY
      }),
    },
    driverServiceRate1: {
      placeholder: '请输入比率',
      rules: {
        required: [true, '请输入比率'],
        validator: ({ value })=>{
          if (!/^\d+\.?\d{0,2}$/.test(value)) return '最高支持两位小数';
          if (value < 0) return '请输入大于等于0的数';
        },
      },
      visible: Observer({
        watch:["driverServiceStandard"],
        action:(driverServiceStandard, { form })=>{
          if (driverServiceStandard !== 1) {
            form.setFieldsValue({
              driverServiceRate1: undefined
            });
          }
          return driverServiceStandard === 1;
        }
      }),
      component: 'input',
      disabled: Observer({
        watch: '*formMode',
        action: formMode => formMode === FORM_MODE.DETAIL || formMode === FORM_MODE.MODIFY
      }),
    },
    driverServiceRate2: {
      placeholder: '请输入比率',
      rules: {
        required: [true, '请输入比率'],
        validator: ({ value })=>{
          if (!/^\d+\.?\d{0,2}$/.test(value)) return '最高支持两位小数';
          if (value < 0) return '请输入大于等于0的数';
        },
      },
      visible: Observer({
        watch:["driverServiceStandard"],
        action:(driverServiceStandard, { form })=>{
          if (driverServiceStandard !== 2) {
            form.setFieldsValue({
              driverServiceRate2: undefined
            });
          }
          return driverServiceStandard === 2;
        }
      }),
      component: 'input',
      disabled: Observer({
        watch: '*formMode',
        action: formMode => formMode === FORM_MODE.DETAIL || formMode === FORM_MODE.MODIFY
      }),
    },
    driverServiceUnivalence: {
      placeholder: '请输入金额',
      rules: {
        required: [true, '请输入金额'],
        validator: ({ value })=>{
          if (!/^\d+\.?\d{0,2}$/.test(value)) return '最高支持两位小数';
          if (value < 0) return '请输入大于等于0的数';
        },
      },
      visible: Observer({
        watch:["driverServiceStandard"],
        action:(driverServiceStandard, { form })=>{
          if (driverServiceStandard !== 4) {
            form.setFieldsValue({
              driverServiceUnivalence: undefined
            });
          }
          return driverServiceStandard === 4;
        }
      }),
      component: 'input',
      disabled: Observer({
        watch: '*formMode',
        action: formMode => formMode === FORM_MODE.DETAIL || formMode === FORM_MODE.MODIFY
      }),
    },
    driverServiceAmount2: {
      label: '上限',
      placeholder: '请输入金额',
      rules: {
        required: [true, '请输入金额'],
        validator: ({ value })=>{
          if (!/^\d+\.?\d{0,2}$/.test(value)) return '最高支持两位小数';
          if (value < 0) return '请输入大于等于0的数';
        },
      },
      component: 'input',
      visible: Observer({
        watch:["driverServiceStandard"],
        action:(driverServiceStandard, { form })=>{
          if (driverServiceStandard !== 2) {
            form.setFieldsValue({
              driverServiceAmount2: undefined
            });
          }
          return driverServiceStandard === 2;
        }
      }),
      disabled: Observer({
        watch: '*formMode',
        action: formMode => formMode === FORM_MODE.DETAIL || formMode === FORM_MODE.MODIFY
      }),
    },
    driverServiceAmount3: {
      placeholder: '请输入金额',
      rules: {
        required: [true, '请输入金额'],
        validator: ({ value })=>{
          if (!/^\d+\.?\d{0,2}$/.test(value)) return '最高支持两位小数';
          if (value < 0) return '请输入大于等于0的数';
        },
      },
      visible: Observer({
        watch:["driverServiceStandard"],
        action:(driverServiceStandard, { form })=>{
          if (driverServiceStandard !== 3) {
            form.setFieldsValue({
              driverServiceAmount3: undefined
            });
          }
          return driverServiceStandard === 3;
        }
      }),
      component: 'input',
      disabled: Observer({
        watch: '*formMode',
        action: formMode => formMode === FORM_MODE.DETAIL || formMode === FORM_MODE.MODIFY
      }),
    },
    driverServiceAmount4: {
      label: '上限',
      placeholder: '请输入金额',
      rules: {
        required: [true, '请输入金额'],
        validator: ({ value })=>{
          if (!/^\d+\.?\d{0,2}$/.test(value)) return '最高支持两位小数';
          if (value < 0) return '请输入大于等于0的数';
        },
      },
      visible: Observer({
        watch:["driverServiceStandard"],
        action:(driverServiceStandard, { form })=>{
          if (driverServiceStandard !== 4) {
            form.setFieldsValue({
              driverServiceAmount4: undefined
            });
          }
          return driverServiceStandard === 4;
        }
      }),
      component: 'input',
      disabled: Observer({
        watch: '*formMode',
        action: formMode => formMode === FORM_MODE.DETAIL || formMode === FORM_MODE.MODIFY
      }),
    },
    automaticPaymentTrigger: {
      label: '付款触发节点：',
      component: 'radio',
      rules: {
        required: [true, '请选择付款触发节点'],
      },
      options: [{
        label: '平台收款后自动触发',
        key: 1,
        value: 1
      }],
      disabled: Observer({
        watch: '*formMode',
        action: formMode => formMode === FORM_MODE.DETAIL || formMode === FORM_MODE.MODIFY
      }),
    },
    defaultSettlementMode: {
      label: '默认结算方式：',
      component: 'radio',
      rules: {
        required: [true, '请选择默认结算方式'],
      },
      options: [{
        label: '线上支付',
        key: 1,
        value: 1
      }],
      disabled: Observer({
        watch: '*formMode',
        action: formMode => formMode === FORM_MODE.DETAIL || formMode === FORM_MODE.MODIFY
      }),
    }
  }

  projectSettingSaveBtnClick = () => {
    const { formData, shipmentType } = this.state;

    if (formData.shipmentServiceRate !== 0.00 && shipmentType === 1){
      return Modal.error({
        title: '指定承运不能配置承运接单手续费，请选择配置为货主发单手续费的交易方案',
      });
    }

    if (!formData.tradingSchemeId) {
      this.setState({
        errorMsg: true
      });

    }
    const { tradingSchemeId } = formData;

    patchProjectConfigure(this.projectId, { tradingSchemeId }).then(data => {
      notification.success({
        message: '配置成功',
        description: `已成功配置该项目`,
      });
      if (this.props.location.pathname.indexOf('/buiness-center') !== -1){
        router.replace('/buiness-center/project/projectManagement');
      } else {
        router.replace('/basic-setting/logisticsTransaction');
      }
      this.props.deleteTab(this.props.commonStore, { id: this.currentTab.id });
    });
  }

  handleSaveBtnClick = data => {
    const formData = {};

    formData.tradingSchemeName = data.tradingSchemeName;
    formData.tradingSchemeCode = data.tradingSchemeCode;
    formData.tradingSchemeDescription = data.tradingSchemeDescription;
    formData.consignmentServiceBasis = data.consignmentServiceBasis;
    formData.consignmentServiceStandard = data.consignmentServiceStandard;
    if (formData.consignmentServiceStandard === 1) {
      formData.consignmentServiceRate = (+data.consignmentServiceRate1)/100;
    }
    if (formData.consignmentServiceStandard === 2) {
      formData.consignmentServiceRate = (+data.consignmentServiceRate2)/100;
      formData.consignmentServiceAmount = +data.consignmentServiceAmount2;
    }
    if (formData.consignmentServiceStandard === 3) {
      formData.consignmentServiceAmount = +data.consignmentServiceAmount3;
    }
    if (formData.consignmentServiceStandard === 4) {
      formData.consignmentServiceUnivalence = +data.consignmentServiceUnivalence;
      formData.consignmentServiceAmount = +data.consignmentServiceAmount4;
    }
    formData.salesTransactionMode = data.salesTransactionMode;
    if (formData.salesTransactionMode === 1) formData.automaticGatheringTrigger = +data.automaticGatheringTrigger;
    if (formData.salesTransactionMode === 4) formData.automaticGatheringTrigger = 1;
    // formData.isConsignmentInitiate = data.isConsignmentInitiate;
    // formData.isReceiverAudit = data.isReceiverAudit;
    formData.shipmentServiceBasis = data.shipmentServiceBasis;
    formData.shipmentServiceStandard = data.shipmentServiceStandard;
    if (formData.shipmentServiceStandard === 1) {
      formData.shipmentServiceRate = (+data.shipmentServiceRate1) / 100;
    }
    if (formData.shipmentServiceStandard === 2) {
      formData.shipmentServiceRate = (+data.shipmentServiceRate2) / 100;
      formData.shipmentServiceAmount = +data.shipmentServiceAmount2;
    }
    if (formData.shipmentServiceStandard === 3) {
      formData.shipmentServiceAmount = +data.shipmentServiceAmount3;
    }
    if (formData.shipmentServiceStandard === 4) {
      formData.shipmentServiceUnivalence = +data.shipmentServiceUnivalence;
      formData.shipmentServiceAmount = +data.shipmentServiceAmount4;
    }
    formData.driverServiceStandard = data.driverServiceStandard;
    if (formData.driverServiceStandard === 1) {
      formData.driverServiceRate = (+data.driverServiceRate1) / 100;
    }
    if (formData.driverServiceStandard === 2) {
      formData.driverServiceRate = (+data.driverServiceRate2) / 100;
      formData.driverServiceAmount = +data.driverServiceAmount2;
    }
    if (formData.driverServiceStandard === 3) {
      formData.driverServiceAmount = +data.driverServiceAmount3;
    }
    if (formData.driverServiceStandard === 4) {
      formData.driverServiceUnivalence = +data.driverServiceUnivalence;
      formData.driverServiceAmount = +data.driverServiceAmount4;
    }
    formData.purchasingTransactionMode = data.purchasingTransactionMode;
    formData.automaticPaymentTrigger = data.automaticPaymentTrigger;
    formData.defaultSettlementMode = data.defaultSettlementMode;
    postTradingSchemes(formData).then(() => {
      notification.success({
        message: '创建成功',
        description: `物流交易方案配置成功`,
      });
      router.replace('/basic-setting/logisticsTransaction');
      this.props.deleteTab(this.props.commonStore, { id: this.currentTab.id });
    });
  }

  handleSaveModifyBtnClick = data=>{
    const { location: { query: { tradingSchemeId } } } = this.props;
    const { tradingSchemeName, tradingSchemeDescription } = data;

    patchTradingScheme(tradingSchemeId, { tradingSchemeName, tradingSchemeDescription  })
      .then(() => {
        notification.success({
          message: '修改成功',
          description: `物流交易方案配置成功`,
        });
        router.replace('/basic-setting/logisticsTransaction');
        this.props.deleteTab(this.props.commonStore, { id: this.currentTab.id });
      });
  }

  componentDidMount () {
    const { location: { query: { tradingSchemeId, projectId } } } = this.props;
    if (this.props.route.name === '添加') {
      this.setState({
        formMode: FORM_MODE.ADD,
        ready: true
      });
    }
    if (this.props.route.name === '配置详情') {
      getTradingSchemes(tradingSchemeId).then(data => {
        this.setActiveData(data);
        this.setState({
          formMode: FORM_MODE.DETAIL
        });
      });
    }
    if (this.props.route.name === '修改配置') {
      getTradingSchemes(tradingSchemeId).then(data => {
        this.setActiveData(data);
        this.setState({
          formMode: FORM_MODE.MODIFY
        });
      });
    }
    if (projectId) {
      detailProjects({ projectId }).then(({ shipmentType })=>{
        getTradingSchemesList({ offset: 0, limit: 1000, isAvailable: true }).then(data => {
          this.tradingSchemeList = data.items;
          this.projectId = projectId;
          this.setState({
            formMode: FORM_MODE.DETAIL,
            shipmentType,
            ready: true
          });
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
      }));
    }
  }

  setActiveData = detail => {
    const formData = JSON.parse(JSON.stringify(detail));
    if (detail.tradingSchemeId) {
      if (detail.consignmentServiceStandard === 1) {
        formData.consignmentServiceRate1 = Number(detail.consignmentServiceRate * 100).toFixed(2)._toFixed(2);
      }
      if (detail.consignmentServiceStandard === 2) {
        formData.consignmentServiceRate2 = Number(detail.consignmentServiceRate * 100).toFixed(2)._toFixed(2);
        formData.consignmentServiceAmount2 = detail.consignmentServiceAmount;
      }
      if (detail.consignmentServiceStandard === 3) {
        formData.consignmentServiceAmount3 = detail.consignmentServiceAmount;
      }
      if (detail.consignmentServiceStandard === 4) {
        formData.consignmentServiceUnivalence = detail.consignmentServiceUnivalence;
        formData.consignmentServiceAmount4 = detail.consignmentServiceAmount;
      }
    }
    if (detail.tradingSchemeId) {
      if (detail.shipmentServiceStandard === 1) {
        formData.shipmentServiceRate1 = Number(detail.shipmentServiceRate * 100).toFixed(2)._toFixed(2);
      }
      if (detail.shipmentServiceStandard === 2) {
        formData.shipmentServiceRate2 = Number(detail.shipmentServiceRate * 100).toFixed(2)._toFixed(2);
        formData.shipmentServiceAmount2 = detail.shipmentServiceAmount;
      }
      if (detail.shipmentServiceStandard === 3) {
        formData.shipmentServiceAmount3 = detail.shipmentServiceAmount;
      }
      if (detail.shipmentServiceStandard === 4) {
        formData.shipmentServiceUnivalence = detail.shipmentServiceUnivalence;
        formData.shipmentServiceAmount4 = detail.shipmentServiceAmount;
      }
    }
    if (detail.tradingSchemeId) {
      if (detail.driverServiceStandard === 1) {
        formData.driverServiceRate1 = Number(detail.driverServiceRate * 100).toFixed(2)._toFixed(2);
      }
      if (detail.driverServiceStandard === 2) {
        formData.driverServiceRate2 = Number(detail.driverServiceRate * 100).toFixed(2)._toFixed(2);
        formData.driverServiceAmount2 = detail.driverServiceAmount;
      }
      if (detail.driverServiceStandard === 3) {
        formData.driverServiceAmount3 = detail.driverServiceAmount;
      }
      if (detail.driverServiceStandard === 4) {
        formData.driverServiceUnivalence = detail.driverServiceUnivalence;
        formData.driverServiceAmount4 = detail.driverServiceAmount;
      }
    }
    // if (detail.isConsignmentInitiate){
    //   formData.isConsignmentInitiate = detail.isConsignmentInitiate;
    // }

    this.setState({
      formData,
      ready: true
    });
  }

  onChange = value => {
    const active = this.tradingSchemeList.find(item => item.tradingSchemeId === Number(value));
    if (active) {
      this.setState({
        errorMsg: false
      });
    }
    this.setActiveData(active);
  }

  switchSaveBtn = () => {
    const { formMode } = this.state;
    if (formMode === FORM_MODE.ADD) return <DebounceFormButton label="保存" className="mr-10" type="primary" onClick={this.handleSaveBtnClick} />;
    if (this.projectId) return <Button className="mr-10" type="primary" onClick={this.projectSettingSaveBtnClick}>保存</Button>;
    if (formMode === FORM_MODE.MODIFY) return <DebounceFormButton label="保存" className="mr-10" type="primary" onClick={this.handleSaveModifyBtnClick} />;
  }

  render () {
    const { formMode, formData, ready, errorMsg } = this.state;
    const formLayout = {
      labelCol: {
        span: 6
      },
      wrapperCol: {
        span: 14
      }
    };
    const data = Object.assign(formData.tradingSchemeId ? formData : {},  this.localData && this.localData.formData || {});

    return (
      ready
      &&
      <>
        <SchemaForm {...formLayout} layout="vertical" schema={{ ...this.formSchema }} data={{ ...data }} mode={FORM_MODE.ADD} hideRequiredMark className='logisticsTransaction_setting_form' trigger={{ formMode }}>
          <h3 styleName='form_title'>基本信息</h3>
          <div styleName='item_box'>
            <Row>
              <Col span={8}>
                {
                  this.projectId?
                    <>
                      <span>交易方案：</span>
                      <Select
                        value={formData.tradingSchemeId}
                        onChange={this.onChange}
                        style={{ width: 200 }}
                        placeholder='请选择交易方案'
                      >
                        {
                          this.tradingSchemeList.map(item => (
                            <Option title={item.tradingSchemeName} value={item.tradingSchemeId}>{item.tradingSchemeName}</Option>
                          ))
                        }
                      </Select>
                      {errorMsg?<p styleName='red'>请选择交易方案</p>: null}
                    </>
                    :
                    <Item field='tradingSchemeName' />
                }
              </Col>
              <Col span={8}>
                <Item field='tradingSchemeCode' />
              </Col>
              <Col span={8}>
                <Item field='tradingSchemeDescription' />
              </Col>
            </Row>
          </div>
          <h3 styleName='form_title'>销售配置</h3>
          <div styleName='item_box'>
            <Row>
              <Col span={8}>
                <Item styleName='flex_col' field='consignmentServiceBasis' />
              </Col>
              <Col span={12}>
                <Row>
                  <Col span={7} style={{ width: '155px' }}>
                    <Item styleName='flex_col' wrapperCol={{ span: 24 }} field='consignmentServiceStandard' />
                  </Col>
                  <Col span={7} style={{ padding: '32px 0 0' }}>
                    <div>
                      <div styleName='separateDiv'>
                        <Item wrapperCol={{ span: 20 }} styleName='percentUnit' field='consignmentServiceRate1' />
                      </div>
                      <div styleName='separateDiv'>
                        <Item wrapperCol={{ span: 20 }} styleName='percentUnit' field='consignmentServiceRate2' />
                      </div>
                      <div styleName='separateDiv'>
                        <Item wrapperCol={{ span: 20 }} styleName='yuanUnit' field='consignmentServiceAmount3' />
                      </div>
                      <div styleName='separateDiv'>
                        <Item wrapperCol={{ span: 20 }} styleName='yuanUnit' field='consignmentServiceUnivalence' />
                      </div>
                    </div>
                  </Col>
                  <Col span={7} style={{ padding: '32px 0 0' }}>
                    <div>
                      <div styleName='separateDiv' />
                      <div styleName='separateDiv'>
                        <Item styleName='yuanUnit' field='consignmentServiceAmount2' />
                      </div>
                      <div styleName='separateDiv' />
                      <div styleName='separateDiv'>
                        <Item styleName='yuanUnit' field='consignmentServiceAmount4' />
                      </div>
                    </div>
                  </Col>
                </Row>
              </Col>
            </Row>
            <Row>
              <Col span={7} style={{ width: '370px' }}>
                <Item styleName='flex_col' wrapperCol={{ span: 24 }} field='salesTransactionMode' />
              </Col>
              <Col span={7} style={{ padding: '35px 0 0' }}>
                <Item className='logisticsTransaction_automaticGatheringTrigger' wrapperCol={{ span: 24 }} field='automaticGatheringTrigger' />
              </Col>
            </Row>
            {/* <Row> */}
            {/*  <Item styleName='flex_col' field='isConsignmentInitiate' /> */}
            {/* </Row> */}
            {/* <Row> */}
            {/*  <Item styleName='flex_col' field='isReceiverAudit' /> */}
            {/* </Row> */}
          </div>
          <h3 styleName='form_title'>采购配置</h3>
          <div styleName='item_box'>
            <Row>
              <Col span={8}>
                <Item styleName='flex_col' field='shipmentServiceBasis' />
              </Col>
              <Col span={12}>
                <Row>
                  <Col span={7} style={{ width: '155px' }}>
                    <Item styleName='flex_col' wrapperCol={{ span: 24 }} field='shipmentServiceStandard' />
                  </Col>
                  <Col span={7} style={{ padding: '32px 0 0' }}>
                    <div>
                      <div styleName='separateDiv'>
                        <Item wrapperCol={{ span: 20 }} styleName='percentUnit' field='shipmentServiceRate1' />
                      </div>
                      <div styleName='separateDiv'>
                        <Item wrapperCol={{ span: 20 }} styleName='percentUnit' field='shipmentServiceRate2' />
                      </div>
                      <div styleName='separateDiv'>
                        <Item wrapperCol={{ span: 20 }} styleName='yuanUnit' field='shipmentServiceAmount3' />
                      </div>
                      <div styleName='separateDiv'>
                        <Item wrapperCol={{ span: 20 }} styleName='yuanUnit' field='shipmentServiceUnivalence' />
                      </div>
                    </div>
                  </Col>
                  <Col span={7} style={{ padding: '32px 0 0' }}>
                    <div>
                      <div styleName='separateDiv' />
                      <div styleName='separateDiv'>
                        <Item styleName='yuanUnit' field='shipmentServiceAmount2' />
                      </div>
                      <div styleName='separateDiv' />
                      <div styleName='separateDiv'>
                        <Item styleName='yuanUnit' field='shipmentServiceAmount4' />
                      </div>
                    </div>
                  </Col>
                </Row>
              </Col>
            </Row>
            <Row>
              <Col span={8}>
                <Item styleName='flex_col' field='purchasingTransactionMode' />
              </Col>
              <Col span={12}>
                <Row>
                  <Col span={7} style={{ width: '155px' }}>
                    <Item styleName='flex_col' wrapperCol={{ span: 24 }} field='driverServiceStandard' />
                  </Col>
                  <Col span={7} style={{ padding: '32px 0 0' }}>
                    <div>
                      <div styleName='separateDiv'>
                        <Item wrapperCol={{ span: 20 }} styleName='percentUnit' field='driverServiceRate1' />
                      </div>
                      {/* <div styleName='separateDiv'>
                        <Item wrapperCol={{span: 20}} styleName='percentUnit' field='driverServiceRate2' />
                      </div> */}
                      <div styleName='separateDiv'>
                        <Item wrapperCol={{ span: 20 }} styleName='yuanUnit' field='driverServiceAmount3' />
                      </div>
                      <div styleName='separateDiv'>
                        <Item wrapperCol={{ span: 20 }} styleName='yuanUnit' field='driverServiceUnivalence' />
                      </div>
                    </div>
                  </Col>
                  <Col span={7} style={{ padding: '32px 0 0' }}>
                    <div>
                      <div styleName='separateDiv' />
                      <div styleName='separateDiv'>
                        <Item styleName='yuanUnit' field='driverServiceAmount2' />
                      </div>
                      <div styleName='separateDiv' />
                      <div styleName='separateDiv'>
                        <Item styleName='yuanUnit' field='driverServiceAmount4' />
                      </div>
                    </div>
                  </Col>
                </Row>
              </Col>
            </Row>
            <Row>
              <Col span={8}>
                <Item styleName='flex_col' field='automaticPaymentTrigger' />
              </Col>
              <Col span={12}>
                <Item styleName='flex_col' field='defaultSettlementMode' />
              </Col>
            </Row>
          </div>
          <div styleName='saveBtn_box'>
            {
              this.switchSaveBtn()
            }
          </div>
        </SchemaForm>
      </>
    );
  }
}
