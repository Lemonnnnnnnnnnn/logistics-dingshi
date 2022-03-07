import React, { Component } from 'react'
import { Select } from 'antd'
import { connect } from 'dva'
import normalizeOptions from '@/services/selectOptions'
import { isArray } from '@/utils/utils'


const { Option } = Select
const optionStyle = {
  overflow: 'hidden',
  textOverflow:'ellipsis', /* 超出部分显示省略号 */
  whiteSpace: 'nowrap' /* 规定段落中的文本不进行换行 */
}

function mapStateToProps (state) {
  return {
    transportsSelectList: state.transports.transportsSelectList || [],
    projectFilter: state.transports.filter.projectName
  }
}

@connect(mapStateToProps, null)
export default class SelectByRemoteData extends Component {

  normalizeType = () =>{
    const { filterType:type, projectFilter } = this.props
    if ( typeof(type)!== 'string') return []
    let list = normalizeOptions[`normalize${type.replace(type[0], type[0].toUpperCase())}Options`](this.props.transportsSelectList)
    if (projectFilter){
      list = list.map(item => ({ ...item, display:this.filterByProject(item.projectName)?'block':'none' }))
    }
    return list.map(({ value, label, projectName, display }) => <Option key={value} style={{ display }} value={value} title={label} projectname={projectName}>{label}</Option>)
  }

  filterOption = (inputValue, option) => {
    const { projectname:optionProject, children } = option.props
    return this.dealWithOptionProject({ value:children, optionProject }, inputValue)
  }

  filterByProject = (optionProject) => {
    let projectCheck = true
    const { projectFilter } = this.props
    if (isArray(optionProject) && projectFilter){
      projectCheck = optionProject.find(item=>item.indexOf(projectFilter)>-1)
    } else if (projectFilter) {
      projectCheck = optionProject.indexOf(projectFilter)>-1
    }
    return projectCheck
  }

  dealWithOptionProject = (filterObject, inputValue) => {
    const { value } = filterObject
    // const projectCheck = this.filterByProject(optionProject)
    const labelCheck = value.indexOf(inputValue)>-1
    // if (isArray(optionProject)){
    //   check = optionProject.findIndex(item=>{
    //     let isFit = false
    //     if (projectFilter && !inputValue){
    //       isFit = item.indexOf(projectFilter)>-1
    //     }
    //     if (!projectFilter && inputValue) {
    //       isFit = item.indexOf(inputValue)>-1
    //     }
    //     if (projectFilter && inputValue) {
    //       isFit = item.indexOf(projectFilter)>-1 && item.indexOf(inputValue)>-1
    //     }
    //     return isFit
    //   })
    // } else if (projectFilter && inputValue){
    //   check = (optionProject.indexOf(projectFilter)>-1 && optionProject.indexOf(inputValue)>-1)
    // } else {
    //   const filterWord = projectFilter || inputValue
    //   check = optionProject.indexOf(filterWord)>-1
    // }
    return labelCheck
  }

  render () {
    const { transportsSelectList } = this.props
    let optionsList = []
    if (transportsSelectList?.length){
      optionsList = this.normalizeType()
    }
    return (
      <Select {...this.props} allowClear dropdownStyle={optionStyle} mode='multiple' maxTagCount={3} maxTagTextLength={3} filterOption={this.filterOption}>{optionsList}</Select>
    )
  }
}
