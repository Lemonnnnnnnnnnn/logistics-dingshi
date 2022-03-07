import React, { Component } from 'react'
import { connect } from 'dva'
import { Button } from 'antd-mobile'
import router from 'umi/router'
import model from '@/models/contract'
import CardList from '@/weapp/component/CardList'
import { getUserInfo } from '@/services/user'
import { getStatusConfig } from '@/services/project'
import { USERPROJECTSTATUS, USERPROJECTSTATUSCONFIG } from '@/constants/project/project'
import styles from './ConstractList.css'

const { actions : { getProjects } } = model
function mapStateToProps (state) {
  return {
    __mac: state.user.__mac,
    nowUser: state.user.nowUser
  }
}

@connect(mapStateToProps, { getProjects })
export default class RelationTransport extends Component{

  accountType = getUserInfo().accountType

  fieldConfig = [
    {
      key:'projectName',
      contentStyle: {
        width: '70%',
        wordWrap:'break-word',
        wordBreak: 'break-all',
        overflow: 'hidden',
        textOverflow: 'ellipsis', /* 超出部分显示省略号 */
        whiteSpace: 'nowrap', /* 规定段落中的文本不进行换行 */
      }
    }, {
      key:'projectNo',
      label:'合同编号',
      render: item => item.projectNo
    }, {
      key:'status',
      render:item=>{
        const { projectStatus, isAvailable, customerResponsibleItems } = item
        const auditStatus = (customerResponsibleItems||[]).find( item => item.responsibleId === this.props.nowUser.userId)?.auditStatus
        let config = {}
        if (this.accountType === 3 && auditStatus !== USERPROJECTSTATUS.SUCCESS) {
          config = USERPROJECTSTATUSCONFIG[auditStatus]
        } else {
          [config] = getStatusConfig(projectStatus, isAvailable)
        }
        return (
          <span style={{ color:config.color, position:'absolute', right:20, top:15 }}>{config.word}</span>
        )
      }
    }
  ]

  routerToDetail = item => {
    router.push(`contractList/contractDetail?projectId=${item.projectId}&fromList=1`)
  }

  getContract = (params) => this.props.getProjects(params)

  render (){
    const _props = {
      action:this.getContract,
      params:{},
      searchBarProps:{
        placeholder:'关键字'
      },
      style:{
        height: 'calc(100% - 110px)'
      }
    }
    return (
      <div style={{ height: '100%', position: 'relative' }}>
        <CardList primaryKey='projectId' keyName='vagueSelect' showSearchBar onCardClick={this.routerToDetail} {..._props} fieldConfig={this.fieldConfig} />
        <Button type="primary" className={styles.addButton} onClick={()=>{ window.location.href=`/weapp/bindContract` }}>绑定合同</Button>
      </div>
    )
  }
}
