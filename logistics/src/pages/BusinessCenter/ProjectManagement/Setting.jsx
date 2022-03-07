import React from 'react';
import { SchemaForm, Item, FORM_MODE } from '@gem-mine/antd-schema-form';
import DebounceFormButton from '@/components/DebounceFormButton';
import CSSModules from 'react-css-modules';
import '@gem-mine/antd-schema-form/lib/fields';
import { Row, Col, Button } from 'antd';
import styles from './Setting.less';

@CSSModules(styles, { allowMultiple: true })
export default class Setting extends React.Component{
  formSchema = {
    tradingSchemeName: {
      label: '交易方案：',
      component: 'select',
      rules: {
        required: [true, '请选择交易方案']
      },
      placeholder: '请选择交易方案'
    },
    tradingSchemeCode: {
      label: '交易方案代码：',
      component: 'input',
      disabled: true
    },
    tradingSchemeDescription: {
      label: '交易方案描述：',
      component: 'input',
      disabled: true
    },
  }

  render () {
    const formLayout = {
      labelCol: {
        span: 6
      },
      wrapperCol: {
        span: 16
      }
    };
    return (
      <>
        <SchemaForm layout="vertical" schema={{ ...this.formSchema }} mode={FORM_MODE.ADD} hideRequiredMark className='projectList_setting_form'>
          <h3 styleName='form_title'>基本信息</h3>
          <div styleName='item_box'>
            <Row>
              <Col span='6'>
                <Item {...formLayout} className='projectList_setting_tradingSchemeName' field='tradingSchemeName' />
              </Col>
              <Col span='8'>
                <Item {...{ labelCol: { span: 6 }, wrapperCol: { span: 12 } }} field='tradingSchemeCode' />
              </Col>
              <Col span='8'>
                <Item {...formLayout} field='tradingSchemeDescription' />
              </Col>
            </Row>
          </div>
          <h3 styleName='form_title'>销售配置</h3>
          <div styleName='item_box'>
            {/* <Item styleName='flex_align_start' field='deliveryType' />
            <br />
            <Item styleName='flex_align_start' field='receivingType' />
            <br /> */}
          </div>
          <h3 styleName='form_title'>采购配置</h3>
          <div styleName='item_box'>
            {/* <Item styleName='flex_align_start' field='deliveryType' />
            <br />
            <Item styleName='flex_align_start' field='receivingType' />
            <br /> */}
          </div>
          <div styleName='saveBtn_box'>
            <Button styleName='margin_right100'>返回</Button>
            <DebounceFormButton label="保存" className="mr-10" type="primary" onClick={this.handleSaveBtnClick} />
          </div>
        </SchemaForm>
      </>
    );
  }
}
