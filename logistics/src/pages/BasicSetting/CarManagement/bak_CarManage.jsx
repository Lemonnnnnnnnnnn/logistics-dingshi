import React, { Component } from 'react';
import { Modal, notification, Button } from 'antd';
import router from 'umi/router';
import CssModule from 'react-css-modules';
import { connect } from 'dva';
import { SchemaForm, Item, FormButton, FormCard, FORM_MODE } from '@gem-mine/antd-schema-form';
import moment from 'moment';
import DebounceFormButton from '@/components/DebounceFormButton';
import { AXLES_NUM_OPTIONS, HEAD_STOCK_OPTIONS } from '@/constants/car';
import model from '@/models/cars';
// import UploadPhoto from './UploadPhoto'
import styles from '@/pages/DriverManagement/DriverEdit.less';
import { getCars, addShipmentCar } from '@/services/apiService';
import { disableDateBeforeToday, disableDateAfterToday } from '@/utils/utils';
import '@gem-mine/antd-schema-form/lib/fields';
import UploadFile from '@/components/Upload/UploadFile';

const { actions } = model;

const { confirm } = Modal;
const formLayout = {
  labelCol: {
    span: 24
  },
  wrapperCol: {
    span: 24
  }
};
@connect(state => ({
  dictionaries: state.dictionaries.items,
  entity:state.cars.entity
}), actions)
@CssModule(styles, { allowMultiple: true })
export default class AddCar extends Component {
  constructor (props) {
    super(props);
    const { mode } = this.props;
    const readOnly = mode === FORM_MODE.DETAIL; // 在schema中会用到readOnly
    this.state = {
      mode,
    };
    this.schema = {
      carNo: {
        label: '车牌号',
        component: 'input',
        rules: {
          required: [true, '请输入正确的车牌号'],
          pattern: /^[京津沪渝冀豫云辽黑湘皖鲁新苏浙赣鄂桂甘晋蒙陕吉闽贵粤青藏川宁琼使领A-Z]{1}[A-Z]{1}[A-Z0-9]{4}[A-Z0-9挂学警港澳]{1}$/
        }
      },
      transportLicenseNo: {
        label: '经营许可证号',
        component: 'input',
        rules: {
          required: true
        }
      },
      carLoad: {
        label: '载重数量（吨）',
        component: 'input',
        rules: {
          required: true,
          pattern: /^[0-9]*$/
        }
      },
      carType: {
        label: '车辆类型',
        component: 'select',
        placeholder: '请选择车辆类型',
        rules: {
          required: true
        },
        options: ( ) => (
          this.props.dictionaries.filter(item => item.dictionaryType === "car_type").map(({ dictionaryCode, dictionaryName }) => ({
            value: dictionaryCode,
            label: dictionaryName,
            key:dictionaryName
          }))
        )
      },
      carBelong:{
        label: '车辆所属',
        component: 'select',
        placeholder: '请选择车辆所属',
        rules: {
          required: true
        },
        options:[{
          label:'自有车辆',
          value:1,
          key:1
        }, {
          label:'外部车辆',
          value:2,
          key:2
        }]
      },
      axlesNum: {
        label: '轴数',
        component: 'radio',
        rules: {
          required: [true, '请选择轴数']
        },
        options: AXLES_NUM_OPTIONS
      },
      isHeadstock: {
        label: '是否车头',
        component: 'radio',
        placeholder: '请选择有效期',
        options: HEAD_STOCK_OPTIONS,
        rules: {
          required: true
        }
      },
      engineNo: {
        label: '发动机号',
        component: 'input'
      },
      carWeight: {
        label: '车辆自重',
        component: 'input',
        props: {
          addonAfter: '吨'
        },
        rules: {
          pattern: /^[0-9]*$/
        }
      },
      frameNo: {
        label: '车架号',
        component: 'input',
        rules: {
          validator: ({ value }) => {
            if (value && value.length !== 17) {
              return '车架号为17位';
            }
          }
        }
      },
      carLength: {
        label: '车长',
        props: {
          addonAfter: 'mm'
        },
        component: 'input',
        rules: {
          validator: ({ value }) => {
            const reg = /^\d+(\.\d+)?$/;
            if (+value === 0 && value !== '') {
              return '车长不能为0';
            }
            if (reg.test(value)||!value) {
              return;
            }
            return '请输入车辆长度';
          }
        }
      },
      carWidth: {
        label: '车宽',
        props: {
          addonAfter: '米'
        },
        component: 'input',
        rules: {
          validator: ({ value }) => {
            const reg = /^\d+(\.\d+)?$/;
            if (+value === 0 && value !== '') {
              return '车宽不能为0';
            }
            if (reg.test(value)||!value) {
              return;
            }
            return '请输入车辆宽度';
          }
        }
      },
      dateOfPurchase: {
        label: '购车日期',
        component: 'datePicker',
        disabledDate: disableDateAfterToday,
        format:{
          input:(value)=>value?moment(value):undefined
        }
      },
      annualTrialDate: {
        label: '年审日期',
        component: 'datePicker',
        disabledDate: disableDateAfterToday,
        format:{
          input:(value)=>value?moment(value):undefined
        }
      },
      insuranceOverdueDate: {
        label: '交强险到期日期',
        component: 'datePicker',
        disabledDate: disableDateBeforeToday,
        format:{
          input:(value)=>value?moment(value):undefined
        }
      },
      bussinessOverdueDate: {
        label: '商业险到期日期',
        component: 'datePicker',
        disabledDate: disableDateBeforeToday,
        format:{
          input:(value)=>value?moment(value):undefined
        }
      },
      permitFrontDentryid: {
        component: UploadFile,
        props: {
          labelUpload: '行驶证照片',
          readOnly
        }
      },
      permitBackDentryid: {
        component: UploadFile,
        props: {
          labelUpload: '运营证照片',
          readOnly
        }
      },
      remarks: {
        label: '备注',
        component: 'input.textArea',
        props: {
          rows: 5
        },
        rules: {
          max: 500
        }
      }
    };
  }

  componentDidMount () {
    const { detailCars, location: { query: { carId: carsId } }, mode = FORM_MODE.ADD } = this.props;
    if (mode !== FORM_MODE.ADD) {
      detailCars({ carsId });
    }
  }

  modifyCar = (value) => {
    const { patchCars } = this.props;
    // todo 现在使用，分割   后续可能改成数组
    value.permitBackDentryid = value.permitBackDentryid.join(',');
    value.permitFrontDentryid = value.permitFrontDentryid.join(',');
    return patchCars(value);
  }

  addCar = (value) => {
    // 需先请求精确查询车辆接口，存在相同车辆则更新，否则新建
    const { postCars } = this.props;

    return getCars({ selectType: 3, carNo: value.carNo, transportLicenseNo: value.transportLicenseNo, limit: 10, offset: 0 })
      .then(({ items }) => {
        const car = items[0];
        const noMatch = car === null;
        return noMatch
          ? postCars(value)
          : addShipmentCar({ carId: car.carId });
      });
  }

  goBack = () => {
    router.go(-1);
  }

  handleCancel = () => {
    confirm({
      title: '提示',
      content: '确认放弃添加车辆吗？',
      okText: '确定',
      cancelText: '取消',
      onCancel: () => { },
      onOk: () => {
        router.push('/basic-setting/carManagement');
      }
    });
  }

  saveData = (formData) => {
    const newData = { ...formData,
      permitBackDentryid: formData.permitBackDentryid && formData.permitBackDentryid[0],
      permitFrontDentryid: formData.permitFrontDentryid && formData.permitFrontDentryid[0]
    };
    const { carId } = this.props.location.query;
    const message = carId ? '修改车辆成功' : '添加车辆成功';
    const work = carId
      ? (newData.carId = carId, this.modifyCar(newData))
      : this.addCar(newData);
    work.then((car) => {
      if (car) {
        notification.success({ message: '操作成功', description: message });
        router.push('/basic-setting/carManagement');
      }
    });
  }

  postData = formData => {
    const newData = { ...formData,
      permitBackDentryid: formData.permitBackDentryid && formData.permitBackDentryid[0],
      permitFrontDentryid: formData.permitFrontDentryid && formData.permitFrontDentryid[0]
    };
    const message = '添加车辆成功';
    this.addCar(newData)
      .then((car) => {
        if (car) {
          notification.success({ message: '操作成功', description: message });
          router.push('/basic-setting/carManagement');
        }
      });
  }

  patchData = formData => {
    const { carId } = this.props.location.query;
    formData.carId = carId;
    const message = '修改车辆成功';
    this.modifyCar(formData)
      .then((car) => {
        if (car) {
          notification.success({ message: '操作成功', description: message });
          router.push('/basic-setting/carManagement');
        }
      });
  }

  render () {
    const { mode } = this.state;
    const { entity: data } = this.props;

    return (
      <SchemaForm
        data={data}
        schema={this.schema}
        mode={mode}
        {...formLayout}
      >
        <FormCard title="基础信息" colCount="3">
          <Item field="carNo" />
          <Item field='transportLicenseNo' />
          <Item field='carLoad' />
          <Item field='carType' />
          <Item field='carBelong' />
          <Item field='axlesNum' />
          <Item field='isHeadstock' />
        </FormCard>
        <FormCard title="详细信息(选填)" colCount="3">
          {/* <FormItem fields={['engineNo', 'carWeight', 'frameNo', 'carLength', 'carWidth', 'dateOfPurchase', 'annualTrialDate', 'insuranceOverdueDate', 'bussinessOverdueDate']} /> */}
          <Item field='engineNo' />
          <Item field="carWeight" />
          <Item field='frameNo' />
          <Item field='carLength' />
          <Item field='carWidth' />
          <Item field='dateOfPurchase' />
          <Item field='annualTrialDate' />
          <Item field='insuranceOverdueDate' />
          <Item field='bussinessOverdueDate' />
          <div>
            <div styleName='formLabel'>上传证件照片</div>
            <Item styleName='float-left' field="permitFrontDentryid" />
            <Item styleName='float-left' field="permitBackDentryid" />
          </div>
          <Item field="remarks" />
        </FormCard>
        <div style={{ textAlign: 'right' }}>
          {mode === FORM_MODE.DETAIL
            ? <Button className='mr-10' type='default' onClick={this.goBack}>返回</Button>
            : <Button className='mr-10' type='default' onClick={this.handleCancel}>取消</Button>
          }
          {mode === FORM_MODE.ADD ? <DebounceFormButton validate label='保存' type='primary' onClick={this.postData} /> : null}
          {mode === FORM_MODE.MODIFY ? <DebounceFormButton validate label='保存' type='primary' onClick={this.patchData} /> : null}
        </div>
      </SchemaForm>
    );
  }
}
