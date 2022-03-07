import React from 'react'
import moment from 'moment'
import { DatePicker, Icon } from 'antd'
import CSSModules from 'react-css-modules'
import styles from './Qualification.less'
import UploadFile from '@/components/Upload/UploadFile'

@CSSModules(styles, { allowMultiple: true })
export default class Qualification extends React.Component{
  id = 0

  state = {
    date: '',
    info: [
      // {
      //   id: 0,
      //   qualificationValidityDate: '',
      //   qualificationFrontDentryid: undefined
      // }
    ],
    needAuthority: this.props.mode === 'detail',
    allow: false
  }

  UploadFileProps = {
    labelUpload: '请上传资格证图片',
    readOnly: this.props.mode === 'detail'
  }

  componentDidMount () {
    const { value } = this.props
    if (value && value.length > 0) {
      this.id = value.length - 1
      this.setInfo(value.map((item, index) => ({
        id: index,
        qualificationValidityDate: moment(item.certificationValidityDate),
        qualificationFrontDentryid: item.certificationDentryid
      })))
    }
    this.props.addFunc(this.addQualification)
  }

  componentWillReceiveProps ({ needAuthority, allow }) {
    this.setState({
      needAuthority,
      allow
    })
  }

  setInfo = (info) => {
    this.setState({
      info
    })
    this.props.onChange(info)
  }

  onChangeInfo = (val, index, type) => {
    const { info } = this.state
    if (type === 'img') info[index].qualificationFrontDentryid = val[0]
    if (type === 'date') {
      info[index].qualificationValidityDate = val
    }
    this.setInfo(info)
  }

  addQualification = () => {
    const { info } = this.state
    if (!info || info?.length === 0) {
      this.id = 0
      const tempArr = [{
        id: this.id,
        qualificationFrontDentryid: undefined,
        qualificationValidityDate: ''
      }]
      this.setInfo(tempArr)
    }
    info.push({
      id: ++this.id,
      qualificationFrontDentryid: undefined,
      qualificationValidityDate: ''
    })
    this.setInfo(info)
  }

  delete = e => {
    const id = Number(e.currentTarget.getAttribute('data-id'))
    const { info } = this.state
    const index = info.findIndex(item => item.id === id)
    info.splice(index, 1)
    this.setInfo(info)
  }

  renderLists = () => {
    const { info, needAuthority, allow } = this.state
    return info.map((item, index) => (
      <div styleName='container' key={item.id}>
        {
          this.props.mode === 'detail' || this.props.mode === 'modify' && this.props.perfectStatus !== 2?
            <div>
              <UploadFile needAuthority={needAuthority} allow={allow} mode={this.props.mode} value={item.qualificationFrontDentryid && [item.qualificationFrontDentryid] || []} {...this.UploadFileProps} onChange={val => this.onChangeInfo(val, index, 'img')} />
            </div>
            :
            <div>
              <UploadFile needAuthority={needAuthority} allow={allow} mode={this.props.mode} value={[]} {...this.UploadFileProps} onChange={val => this.onChangeInfo(val, index, 'img')} />
            </div>
        }
        <div styleName='marl-10'>
          <span>资格证有效期至</span>
          <br />
          {
            this.props.mode === 'detail'?
              <span>{moment(item.qualificationValidityDate)._isValid && moment(item.qualificationValidityDate).format('YYYY年MM月DD日') || '--'}</span>
              :
              <>
                <DatePicker
                  value={item.qualificationValidityDate}
                  format='YYYY年MM月DD日'
                  onChange={val => this.onChangeInfo(val, index, 'date')}
                />
                <br />
                {
                  item.id === 0?
                    null
                    :
                    <span styleName='red' data-id={item.id} onClick={this.delete}>删除资格证</span>
                }
              </>
          }
        </div>
      </div>
    ))
  }

  render () {
    const { date } = this.state
    return (
      <>
        {
          this.props.mode === 'detail' && (!this.props.value || this.props.value.length === 0)?
            '暂无数据'
            :
            <div styleName='list_container'>
              {this.renderLists()}
            </div>
        }
      </>
    )
  }
}