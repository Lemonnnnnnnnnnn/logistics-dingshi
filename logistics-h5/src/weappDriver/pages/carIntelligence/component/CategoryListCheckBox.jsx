import React, { Component } from 'react'
import { List, ActionSheet, Icon, Flex, Checkbox, Button } from 'antd-mobile'
import CSSModules from 'react-css-modules';
import { getGoodsCategories } from '@/services/apiService'
import styles from './CategoryListCheckBox.less'

const { CheckboxItem } = Checkbox;

@CSSModules(styles, { allowMultiple: true })
export default class CategoryListCheckBox extends Component {
  state = {
    selectRowStr : ''
  }

  componentDidMount () {
    // value中是当前车辆的可承接类型数组
    const { value } = this.props

    getGoodsCategories({ parentId : 0 }).then(({ items })=> {
      // 第一次进入页面时生成标签信息和默认选中状态
      const tagsArray = items.map(item=>({ categoryId : item.categoryId, categoryName : item.categoryName, checked : !!value.find(_item=>_item.categoryId === item.categoryId) }))
      // 生成已选的字符串
      const selectRowStr = value.map(item=>(item.categoryName)).join(',')

      this.setState({ tagsArray, selectRowStr })
    })
  }

  onChange = ({ target : { checked } }, id) =>{
    const { tagsArray } = this.state
    const currentElement = tagsArray.find(item=> item.categoryId === id)
    currentElement.checked = checked

    this.setState({ tagsArray })
  }


  onOpen = () =>{
    // value中是当前车辆的可承接类型数组,生成当前选择状态

    const { value } = this.props
    const { tagsArray : _tagsArray } = this.state
    const tagsArray = _tagsArray.map(item=>({ categoryId : item.categoryId, categoryName : item.categoryName, checked : !!value.find(_item=>_item.categoryId === item.categoryId) }))
    this.setState({ tagsArray })

    // const { tagsArray } = this.state
    // const operationButton = (
    //   <Flex justify='between' style={{ marginBottom : '20px' }}>
    //     <div style={{ color : '#108ee9', fontSize : '17px' }}> 取消</div>
    //     <div style={{ fontSize : '17px' }}> 请选择车辆类型</div>
    //     <div style={{ color : '#108ee9', fontSize : '17px' }} onClick={this.handleConfirm}> 确认</div>
    //   </Flex>
    // )
    const operationButton = (
      <Flex justify='between' style={{ position : 'fixed', bottom : 0, width : '100%', zIndex : 999 }}>
        <Button style={{ width : '50%' }}>取消</Button>
        <Button style={{ width : '50%' }} type='primary' onClick={this.handleConfirm}>确认</Button>
      </Flex>
    )

    const modalData = (
      <>
        {/* {operationButton} */}

        <List>
          {
            tagsArray.map(item=>(
              <CheckboxItem defaultChecked={item.checked} key={item.categoryId} onChange={e=>this.onChange(e, item.categoryId)}>{item.categoryName}</CheckboxItem>
            ))
          }
        </List>
      </>
    )

    const checkbox = [modalData];


    ActionSheet.showActionSheetWithOptions({
      options : [operationButton],
      message: checkbox,
      title : '请选择车辆类型',
    }, (index)=>{
      console.log(index)
    });
  }


  handleConfirm = ()=>{
    // 只有点确认的时候提交数据
    const { tagsArray } = this.state
    const selectRow = tagsArray.filter(item=>item.checked)

    // 生成已选的字符串
    const selectRowStr = selectRow.map(item=>(item.categoryName)).join(',')
    this.setState({ selectRowStr })

    this.props.onChange(selectRow)
  }

  render () {
    const { selectRowStr } = this.state
    return (
      <div>
        <Flex onClick={this.onOpen}>
          <span>{selectRowStr || '请选择车辆类型'}</span>
          <Icon type='right' size='md' />
        </Flex>
      </div>);
  }
}
