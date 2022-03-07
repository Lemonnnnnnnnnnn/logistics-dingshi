import React, { Component, useState, useEffect } from 'react'
import CSSModules from 'react-css-modules'
import ReactDOM from 'react-dom'
import { Input } from 'antd'
import { SearchBar, Toast } from 'antd-mobile'
import Search from 'antd/lib/input/Search'
import styles from './CityPicker.less'
import citys from '@/constants/city'

export default function CityPicker (props) {
  const [flag, setFlag] = useState(false)
  const [count, setCount] = useState(0)
  const [value, setValue] = useState('')
  const toggle = () => {
    setFlag(!flag)
  }
  useEffect(() => {
    setCount(count + 1)
  }, [flag])
  const setFormValue = value => {
    if (props.field.styleName === 'leftInput') {
      props.form.setFieldsValue({
        delivery: value
      })
    } else {
      props.form.setFieldsValue({
        receive: value
      })
    }
  }
  return (
    <>
      <Input onClick={toggle} className={styles[props.field.styleName]} placeholder={props.field.placeholder} value={value} readOnly type="text" />
      <ProtalModal>
        <CityList count={count} activeStatus={flag} setValue={setValue} setFormValue={setFormValue} form={props.form} setFlag={setFlag} mark={props.field.styleName} exchange={props.field.exchange} toggle={toggle} />
      </ProtalModal>
    </>
  )
}

@CSSModules(styles, { allowMultiple: true })
class CityList extends Component {
  state = {
    keyWord: '',
    active: '',
  }

  constructor (props) {
    super(props)
    this.mark = this.props.mark
  }

  list = React.createRef()

  clear = () => {
    this.setState({ keyWord: '' })
  }

  onChange = (value) => {
    this.setState({ keyWord: value })
  }

  search = () => {
    const { keyWord } = this.state
    this.setState({
      active: `${this.mark}${keyWord}`
    })
    const obj = document.getElementById(`${this.mark}${keyWord}`)
    if (obj) {
      setTimeout(() => {
        obj.scrollIntoView(
          { behavior: 'smooth', block: 'center' }
        )
      }, 300)
    } else {
      Toast.offline('无查询结果', 1)
    }
  }

  toHash = (e) => {
    const hashId = e.currentTarget.getAttribute('to-hash')
    const obj = document.getElementById(hashId)
    obj.scrollIntoView(
      { behavior: 'smooth', block: 'center' }
    )
  }

  shouldComponentUpdate (nextProps) {
    if (this.props.exchange !== nextProps.exchange) {
      if (nextProps.form.getFieldValue('receive') && nextProps.form.getFieldValue('delivery')) {
        const receive = nextProps.form.getFieldValue('delivery')
        const delivery = nextProps.form.getFieldValue('receive')
        if (this.mark === 'leftInput') {
          nextProps.form.setFieldsValue({
            receive,
            delivery
          })
        }
        this.props.setValue(delivery)
        this.setState({
          active: `leftInput${delivery}`
        })
      }
    }
    return true
  }

  pickCity = (e) => {
    const value = e.currentTarget.innerHTML
    this.setState({
      active: `${this.mark}${value}`
    })
    this.props.setValue(value)
    this.props.setFormValue(value)
    setTimeout(() => {
      this.props.setFlag(false)
    }, 200)
  }

  renderCity = () => {
    const { active } = this.state
    const naviBar = []
    const cityList = []
    citys.forEach((item, index) => {
      naviBar.push(<a to-hash={`${this.mark}${item.title}`} onClick={this.toHash} key={index}>{item.title}</a>)
      cityList.push(<h4 key={index} id={`${this.mark}${item.title}`}>{item.title}</h4>)
      item.lists.forEach((val, inx) => {
        cityList.push(<span styleName={active === `${this.mark}${val}`? 'citySpan activeCity': 'citySpan'} onClick={this.pickCity} key={`${index}.${inx}`} id={`${this.mark}${val}`}>{val}</span>)
      })
    })
    return (
      <div styleName='list_container'>
        <div styleName='navibar'>
          {naviBar}
        </div>
        <div styleName='cityContainer'>
          <div ref={this.list}>
            {cityList}
          </div>
        </div>
      </div>
    )
  }

  render () {
    const { count } = this.props
    if (count === 1) {
      return (
        <div styleName='init_active'>
          <div styleName='cityList_container'>
            <SearchBar
              value={this.state.keyWord}
              placeholder="搜索"
              onSubmit={this.search}
              onClear={this.clear}
              onCancel={this.clear}
              onChange={this.onChange}
            />
            {this.renderCity()}
          </div>
        </div>
      )
    }
    return (
      <div styleName={this.props.activeStatus? 'show_active': 'leave_active'}>
        <div styleName='cityList_container'>
          <SearchBar
            value={this.state.keyWord}
            placeholder="搜索"
            onSubmit={this.search}
            onClear={this.clear}
            onCancel={this.clear}
            onChange={this.onChange}
          />
          {this.renderCity()}
        </div>
      </div>
    )
  }
}

class ProtalModal extends Component{
  el = document.createElement('div')

  componentDidMount () {
    document.body.appendChild(this.el)
  }

  componentWillUnmount () {
    document.body.removeChild(this.el)
  }

  render () {
    return ReactDOM.createPortal(
      this.props.children,
      this.el
    )
  }
}