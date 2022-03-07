import React from 'react';
import { Form, Radio, Input, Row } from 'antd';
import '@gem-mine/antd-schema-form/lib/fields';
import CSSModules from 'react-css-modules';
import styles from './RadioCheckBox.less';

@CSSModules(styles, { allowMultiple: true })
export default class RadioCheckBox extends React.Component{
  state = {
    radioValue: '',
    inputValue: ''
  }

  onChange = e => {
    this.setState({
      radioValue: e.target.value,
    });
    this.props.onChange(e.target.value);
  }

  inputChange = e => {
    if (this.state.radioValue === 1) {
      this.props.form.setFieldsValue({ transportFreight: e.target.value });
    }
  }

  render () {
    return (
      <Form>
        <div className='global_form_container'>
          <span>{this.props.customLabel}</span>
          <Form.Item>
            <Radio.Group>
              <Radio value={0}>预约单报价</Radio>
              <Row>
                <Radio value={1}>合同执行价</Radio>
                <Form.Item>
                  <Input placeholder='请输入金额（元）' onChange={this.inputChange} />
                </Form.Item>
              </Row>
            </Radio.Group>
          </Form.Item>
        </div>
      </Form>
    );
  }
}
