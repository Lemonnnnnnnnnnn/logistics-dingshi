import React, { Component } from 'react';
import { Checkbox, List, Button, Toast } from 'antd-mobile';
import { connect } from 'dva'
import router from 'umi/router';
import receivingModel from '@/models/receiving'
import { PROJECT_AUDIT_STATUS } from '@/constants/project/project'
import model from '@/models/contract'
import styles from './AddContractInfo.css'
import { AddContractReceiving } from '@/services/apiService'

const { CheckboxItem } = Checkbox
const { Brief } = List.Item
const { actions:{ getReceiving } } = receivingModel
const { actions:{ patchProjects } } = model

function mapStateToProps (state) {
  return {
    receiving: state.receiving.items,
    project: state.project.entity
  }
}
@connect(mapStateToProps, { getReceiving, patchProjects })
class AddContractInfo extends Component {
  state = {
    selectList:[],
    ready:false
  }

  componentDidMount (){
    const { getReceiving, project } = this.props
    getReceiving({ isAvailable:true, limit:500, offset:0 })
      .then(({ items })=>{
        let receiving
        let selectList = []
        // 判断合同状态 状态为非客户待审则说明已有卸货点,这时候要将已有的卸货点勾选并且置灰,并将置灰的置顶
        if ( project.projectStatus !== PROJECT_AUDIT_STATUS.CUSTOMER_UNAUDITED){
          selectList = [...project.receivingItems]
          receiving = items.map(item => {
            project.receivingItems.forEach(_item =>{
              if (_item.receivingId === item.receivingId){
                item.checked = true
                return false
              }
            })
            return item
          })
        } else {
          receiving = items
        }
        receiving.sort((a)=>{
          if (a.checked) return -1
          return 1
        })
        this.setState({
          ready:true,
          receiving,
          selectList
        })
      })
  }

  onChange = ({ receivingId, signDentryid }) =>{
    const { selectList } = this.state
    const newSelectList = selectList
    const check = selectList.findIndex(item=>item.receivingId === receivingId)
    if (check<0) {
      newSelectList.push({ receivingId, signDentryid })
    } else {
      newSelectList.splice(check, 1)
    }
    this.setState({
      selectList:newSelectList
    })
  }

  addReceivingInfo = () =>{
    const { selectList } = this.state
    const { project:{ projectStatus } } = this.props
    if (selectList.length===0) return Toast.fail('请添加卸货点', 1)
    const { location:{ query:{ projectId } }, patchProjects } = this.props
    if (projectStatus === PROJECT_AUDIT_STATUS.CUSTOMER_UNAUDITED){
      patchProjects({ projectId, projectStatus:PROJECT_AUDIT_STATUS.CUSTOMER_AUDITED, receivingItems:selectList })
        .then(()=>{
          Toast.success('创建成功', 1, ()=>router.replace('/Weapp/personalCenter/contractList'))
        })
    } else {
      AddContractReceiving({ projectId, receivingItems:selectList })
        .then(()=>{
          Toast.success('添加成功', 1, ()=>router.replace('/Weapp/personalCenter/contractList'), null, false)
        })
    }
  }

  renderReceivingList = () =>{
    const { receiving=[] } = this.state
    return receiving.map(item=>(
      <CheckboxItem key={item.receivingId} style={item.checked&&{ background: '#f5f5f5' }} defaultChecked={item.checked} disabled={item.checked} multipleLine onChange={() => this.onChange({ receivingId:item.receivingId, signDentryid:item.signDentryid })}>
        <Brief>
          <div style={{ color:'black' }}>
            卸货点名称：{item.receivingName}
          </div>
          <div style={{ whiteSpace:'normal' }}>
            {item.receivingAddress}
          </div>
          <div>
            <span>{item.contactName}</span>
            <span style={{ float:'right', marginRight:'50px' }}>{item.contactPhone}</span>
          </div>
        </Brief>
      </CheckboxItem>
    ))
  }

  jumpToCreateReceiving = () => {
    router.push('/weapp/addreceiving?mode=add')
  }

  render () {
    const { ready } = this.state
    return (
      <div style={{ position: 'relative', height:'100%', background: 'white' }}>
        {ready&&
        <List renderHeader={() => '卸货点选择'} style={{ height:'calc(100% - 44px)', overflowY:'scroll' }}>
          {this.renderReceivingList()}
        </List>}
        <Button className={styles.addBtn} onClick={this.jumpToCreateReceiving}>新建卸货点</Button>
        <Button type='primary' className={styles.confirmBtn} onClick={this.addReceivingInfo}>确认完成</Button>
      </div>
    );
  }
}

export default AddContractInfo;
