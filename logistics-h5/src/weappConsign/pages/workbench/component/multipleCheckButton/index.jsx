import React, { Component } from 'react'
import { Tag, Input } from 'antd'
import { Tag as TagMobile } from 'antd-mobile'
import CSSModules from 'react-css-modules'
import styles from './index.less'

const { CheckableTag } = Tag
const { TextArea } = Input

const statusDist = { unChose : 0, receive : 1, reject : 2 }

const tagsFromServer= ['数据错误', '图片模糊', '单号错误', '单据重复', '无签收人签字', '其他']


@CSSModules(styles)
export default class MultipleCheckButton extends Component {

  state = {
    status : 0,
    selectedTags: [],
    remark : ''
  }

  // 选择标签
  handleChange (tag, checked) {
    const { selectedTags } = this.state;
    const nextSelectedTags = checked ? [...selectedTags, tag] : selectedTags.filter(t => t !== tag);
    this.setState({ selectedTags: nextSelectedTags });
  }

  onChangeStatus = (status, val)=>{
    if (!status) return this.setState({ status : 0 })
    if (val === statusDist.receive){
      this.setState({ selectedTags : [] })
    }
    this.setState({ status : val })
  }

  handleInputRemark=e=>{
    this.setState({ remark : e.target.value })
  }

  render () {
    const { status, selectedTags, remark } = this.state

    return (
      <div className='mt-10 mb-10'>
        <TagMobile style={{ width : '50%' }} selected={status === statusDist.receive} onChange={(e)=> this.onChangeStatus(e, statusDist.receive)}>通过</TagMobile>
        <TagMobile style={{ width : '50%' }} selected={status === statusDist.reject} onChange={(e)=> this.onChangeStatus(e, statusDist.reject)}>拒绝</TagMobile>
        {status === statusDist.reject &&
        <div>
          <div styleName='multipleCheckButton' className='mt-10 mb-10'>
            {tagsFromServer.map(tag => (
              <CheckableTag
                key={tag}
                color='red'
                checked={selectedTags.indexOf(tag) > -1}
                onChange={checked => this.handleChange(tag, checked)}
              >
                {tag}
              </CheckableTag>
            ))}
          </div>
          <TextArea placeholder='请输入备注' value={remark} onChange={this.handleInputRemark} />
        </div>}
      </div>)
  }
}

