import React from 'react';
import { SchemaForm, Item, FormCard } from '@gem-mine/antd-schema-form';
import CSSModules from 'react-css-modules';
import '@gem-mine/antd-schema-form/lib/fields';
import { Steps } from 'antd';
import styles from './modify.less';

const { Step } = Steps;

@CSSModules(styles, { allowMultiple: true })
export default class ModifyProject extends React.Component {
  state = {
    step: 0
  }

  fakeDate = {
    complateCode: 'ZYKP-0001'
  }

  formLayout = {
    labelCol: {
      xs: { span: 24 }
    },
    wrapperCol: {
      xs: { span: 24 }
    }
  }

  formSchema = {
    complate: {
      label: '销售模板：',
      component: 'select',
      rules: {
        required: [true, '请选择销售模板'],
        validator: ({ value })=>{
          this.nowType = value;
        },
      },
      options: [{
        label: '承运合同',
        key: 0,
        value: 0
      }, {
        label: '调度合同',
        key: 1,
        value: 1
      }, {
        label: '网络货运合同',
        key: 2,
        value: 2
      }],
      placeholder: '请选择合同类型'
    },
    complateCode: {
      label: '销售模板代码：',
      component: 'input',
      disabled: true
    },
    complateDesc: {
      label: '销售模板描述：',
      component: 'input'
    }
  }

  render () {
    const { step } = this.state;
    return (
      <>
        <SchemaForm layout="vertical" schema={this.formSchema} data={this.fakeDate} hideRequiredMark className='projectManagement_modifyProject_form'>
          <div styleName='stepBox'>
            <Steps current={step}>
              <Step title="销售配置" />
              <Step title="采购配置" />
              <Step title="完成" />
            </Steps>
          </div>
          {/* <h3 styleName='form_title'>基本信息</h3>
          <div styleName='item_box'>
            <Row>
              <Col span={8}>
                <Item field='complate' />
              </Col>
              <Col span={12}>col-12</Col>
            </Row>
          </div> */}
          <FormCard title='基本信息' colCount="3">
            <Item {...this.formLayout} field='complate' />
            <Item {...this.formLayout} field='complateCode' />
            <Item {...this.formLayout} field='complateDesc' />
          </FormCard>
          <h3 styleName='form_title'>业务模式配置</h3>
          <h3 styleName='form_title'>销售配置</h3>
          <h3 styleName='form_title'>上传合同</h3>
        </SchemaForm>
      </>
    );
  }
}
