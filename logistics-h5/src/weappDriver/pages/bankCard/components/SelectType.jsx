import React from 'react'
import CSSModules from 'react-css-modules'
import styles from './selectType.less'

@CSSModules(styles, { allowMultiple: true })
export default class Add extends React.Component{
  state = {
    selected: ''
  }

  selectType = e => {
    this.setState({
      selected: e.currentTarget.getAttribute('type')
    })
    this.props.onChange(e.currentTarget.getAttribute('type'))
  }

  render () {
    const { selected } = this.state
    return (
      <div style={{ backgroundColor: 'white', padding: '15px' }}>
        <h3 style={{ color: 'rgba(34, 34, 34, 1)', fontSize: '17px' }}>{this.props.field.label}</h3>
        <div style={{ display: 'flex', justifyContent: 'center', alignContent: 'center' }}>
          <span styleName={selected === 'receive' ? 'receive active': 'receive'} onClick={this.selectType} type='receive'>收款银行卡</span>
          <span styleName={selected === 'pay' ? 'pay active': 'pay'} type='pay' onClick={this.selectType}>付款银行卡</span>
        </div>
      </div>
    )
  }
}