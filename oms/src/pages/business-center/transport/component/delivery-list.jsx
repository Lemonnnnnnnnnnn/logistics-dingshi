import React, { Component } from 'react';
import { Input, Form } from "antd";

export default class DeliveryList extends Component{

  constructor (props){
    super(props);
    this.InputGroupRef = React.createRef();
  }

  componentDidMount (){
    this.props.getValues(this.changeValue);
  }

  changeValue = () =>{
    const { value } = this.props;
    const _value = [...value ];
    const valueData = this.InputGroupRef.current.getFieldsValue();
    const changeArray = Object.keys(valueData).map(v => +v);
    _value.forEach((item, index) => {
      const { goodsId } = item;
      if (changeArray.indexOf(goodsId) >= 0){
        _value[index].receivingNum = +valueData[goodsId];
      }
    });
    return _value;
  }

  renderNumInput = () =>{
    const { value=[] } = this.props;
    return <InputGroup ref={this.InputGroupRef} value={value} />;

  }

  render (){
    return (
      <>
        {this.renderNumInput()}
      </>
    );
  }
}


class ReceivingGoodsNumInput extends Component{

  render (){
    const { value=[], form } = this.props;

    return (
      <Form layout="horizontal" onSubmit={this.getValues}>
        {value.reduce((final, current) => (
          <>
            {final}
            <Form.Item key={current.transportCorrelationId} label={`${current.categoryName}-${current.goodsName}:`}>
              {form.getFieldDecorator(`${current.goodsId}`, {
                initialValue: current.receivingNum,
                rules: [{
                  required: true,
                  message: '请输入签收重量',
                }, {
                  pattern: /^\d+(\.\d+)?$/,
                  message: '请填写正确的货品数量',
                }, {
                  validator: (rule, value, callback) => {
                    if (+value===0) {
                      callback('签收重量不能为0');
                    }
                    callback();
                  }
                }],
              })(<Input placeholder="请输入签收重量" addonAfter={current.goodsUnitCN || '吨'} />)}
            </Form.Item>
          </>
        ), null)}
      </Form>

    );
  }
}

const InputGroup = Form.create({})(ReceivingGoodsNumInput);
