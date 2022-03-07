import React, { Component } from 'react';
import { FORM_MODE } from '@gem-mine/mobile-schema-form'
import { List, Picker, InputItem, Modal } from 'antd-mobile'
import { connect } from 'dva'
import addIcon from '@/assets/waybill_icon_add.svg'
import subtractIcon from '@/assets/waybill_icon_subtract.svg'

const { alert } = Modal
function mapStateToProps (state) {
  return {
    goodsUnits: state.dictionaries.items
  }
}
@connect(mapStateToProps, null)
class GoodsCorrelationItems extends Component {

  selectedGoodsId = []

  addItem = () => {
    const { disabled } = this.props.field
    const { mode } = this.props
    const _disabled = mode === FORM_MODE.DETAIL
    if (disabled || _disabled) return
    const { value = [{}], onChange } = this.props
    // 校验当前 卸货点信息是否填写完整
    const lastArray = value[value.length - 1]
    const keys = ['receivingId', 'goodsId', 'goodsNum']
    for (let i = 0; i < keys.length; i++) {
      if (!lastArray[keys[i]] || lastArray[keys[i]] === '') {
        alert('提示', '请填写完整本卸货点信息')
        return
      }
    }
    const newValue = [...value, {}]
    onChange(newValue)

  }

  reduceItem = (index) => {
    const { disabled } = this.props.field
    const { mode } = this.props
    const _disabled = mode === FORM_MODE.DETAIL
    if (disabled || _disabled) return
    const { value, onChange } = this.props
    const newValue = JSON.parse(JSON.stringify(value))
    newValue.splice(index, 1)
    onChange(newValue)
  }

  renderAddAndSubtractButton = (index) => {
    const { value = [{}] } = this.props
    const arrayLength = value.length
    if (index === arrayLength - 1 && index !== 0) {
      return (
        <>
          <img disabled src={subtractIcon} alt="" style={{ marginRight: '5px' }} onClick={() => (this.reduceItem(index))} />
          <img disabled src={addIcon} alt="" onClick={this.addItem} />
        </>
      )
    }

    if (index === 0 && arrayLength === 1) {
      return <img src={addIcon} alt="" onClick={this.addItem} />
    }

    return <img src={subtractIcon} alt="" onClick={() => (this.reduceItem(index))} />
  }

  onChange = () => {
    const { onChange: _onChange, value } = this.props
    _onChange(value)
  }

  getUnits = (dictionaryCode) => {
    if (!dictionaryCode) return
    const { goodsUnits } = this.props
    return goodsUnits.filter(item=> +item.dictionaryCode===dictionaryCode)[0]?.dictionaryName
  }

  render () {
    const { value = [{}], onChange, mode } = this.props
    const { optionConfig: { receivingOptions = [], goodsOptions = [] } = {} } = this.props.field
    if (!receivingOptions.length || !goodsOptions.length) return <></>
    let _goodsOptions = goodsOptions
    const disabled = mode === FORM_MODE.DETAIL
    return (
      <div style={{ background: 'white', marginBottom: '10px' }}>
        {
          value.map((data, index) => {
            const res = (
              <List key={data.categoryId}>
                <List.Item extra={this.renderAddAndSubtractButton(index)} disabled={disabled} onChange={this.onChange}>卸货点信息</List.Item>
                <Picker
                  extra="请选择卸货点"
                  data={receivingOptions}
                  cols={1}
                  onOk={(val) => {
                    const newValue = JSON.parse(JSON.stringify(value))
                    newValue[index].receivingId = val[0]
                    onChange(newValue)
                  }}
                  value={[data.receivingId]}
                  disabled={disabled}
                >
                  <List.Item arrow="horizontal">卸货点</List.Item>
                </Picker>
                <Picker
                  extra="请选择货品"
                  data={_goodsOptions}
                  cols={1}
                  onOk={(val) => {
                    const { materialQuality, receivingUnit } = goodsOptions.filter(item => item.value === val[0])[0]
                    const newValue = JSON.parse(JSON.stringify(value))
                    const current = newValue[index]
                    current.materialQuality = materialQuality
                    current.goodsUnit = receivingUnit
                    current.goodsId = val[0]
                    onChange(newValue)
                  }}
                  value={[data.goodsId]}
                  disabled={disabled}
                >
                  <List.Item arrow="horizontal">货品名称</List.Item>
                </Picker>
                <InputItem disabled style={{ textAlign: 'right' }} value={data.materialQuality}>规格型号</InputItem>
                <InputItem
                  onChange={
                    val => {
                      const newValue = value
                      newValue[index].goodsNum = val
                      onChange(newValue)
                    }}
                  style={{ textAlign: 'right' }}
                  placeholder="请输入要货重量"
                  extra={this.getUnits(data.goodsUnit)}
                  value={data.goodsNum}
                  disabled={disabled}
                  type="digit"
                >要货数量
                </InputItem>
              </List>
            )
            _goodsOptions = _goodsOptions.filter(item => item.value !== data.goodsId)
            return res
          })
        }
      </div>
    );
  }
}

export default GoodsCorrelationItems
