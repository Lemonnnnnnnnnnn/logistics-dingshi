import React, { Component } from 'react';
import { Radio, Row, Col } from 'antd';
import { Item, FORM_MODE } from '@gem-mine/antd-schema-form';

class ConsignmentRadio extends Component {

  state = {

  }

  radioChange = e => {
    const { value } = e.target;
    this.props.form.setFieldsValue({ consignmentType: value });
  }

  render () {
    const options = { 0: '直发', 1: '代发' };
    const shown = this.props.value;
    const { mode } = this.props;
    const { readOnly = false } = mode === FORM_MODE.DETAIL;
    return (
      readOnly
        ?
          <>
            <span>{options[shown]}</span>
            <Item {...this.props} field='cargoesId' />
          </>
        :
        <Row>
            <Col span={7}>
            <Radio.Group value={shown} onChange={this.radioChange}>
                <Radio value={0}>直发</Radio>
                <Radio value={1}>代发</Radio>
              </Radio.Group>
          </Col>
            <Col span={17}>
            {
              shown
                ? <Item field='cargoesId' />
                : <Item className='displayNone' field='cargoesId' />
            }
          </Col>
          </Row>
    );
  }
}

export default ConsignmentRadio;
