import React, { Component } from 'react'
import router from 'umi/router'
import { Modal } from 'antd-mobile'
import { deleteReceiving, modifyAddReceiving } from '@/services/apiService'
// import deleteIcon from '@/assets/delete.svg'
import editIcon from '@/assets/edit.svg'
// import lockIcon from '@/assets/lock.svg'
// import unLockIcon from '@/assets/unlock.svg'



const Alert = Modal.alert

export default class ReceivingListItemCard extends Component{

  goToReceivingDetailPage = () => {
    const { receivingId } = this.props.item
    router.push(`./receivingDetail?mode=detail&receivingId=${receivingId}`)
  }

  // deleteItem = (e) => {
  //   e.stopPropagation()
  //   const { isUsed, receivingId } = this.props.item
  //   const { refresh } = this.props
  //   if (isUsed){
  //     Alert('提示', '用过的卸货点不支持删除', [
  //       { text: '确定', onPress: () => {} }
  //     ]);
  //   } else {
  //     Alert('删除确认', '确认要删除该卸货点吗？', [
  //       { text: '取消', onPress: () => {} },
  //       { text: '确定', onPress: () => {
  //         deleteReceiving(receivingId)
  //           .then(()=> refresh())
  //       } }
  //     ]);
  //   }
  // }

  enableReceiving = (e) => {
    e.stopPropagation()
    const { item:{ receivingId }, refresh } = this.props
    Alert('启用确认', '确认启用该卸货点吗？', [
      { text: '取消', onPress: () => {} },
      { text: '确定', onPress: () => {
        modifyAddReceiving({ receivingId, isAvailable:true })
          .then(()=> refresh())
      } }
    ])
  }

  disableReceiving = (e) => {
    e.stopPropagation()
    const { item:{ receivingId }, refresh } = this.props
    Alert('禁用确认', '确认禁用该卸货点吗？', [
      { text: '取消', onPress: () => {} },
      { text: '确定', onPress: () => {
        modifyAddReceiving({ receivingId, isAvailable:false })
          .then(()=> refresh())
      } }
    ])
  }

  goToEditReceivingDetailPage = (e) => {
    e.stopPropagation()
    const { receivingId } = this.props.item
    router.push(`./modifyreceiving?mode=modify&receivingId=${receivingId}`)
  }

  render (){
    const { item:{ receivingAddress, receivingName, contactName, contactPhone, isAvailable, projectName }, editAuthority } = this.props
    const cardStyle={
      background:'rgba(255,255,255,1)',
      borderRadius: '8px',
      padding:'20px 15px',
    }
    const receivingNameStyle={
      fontSize: '16px',
      fontWeight: '600',
      color:'rgba(51,51,51,1)',
      width: '22vw',
      display: 'inline-block',
      verticalAlign: 'top',
      whiteSpace: 'nowrap',
      textOverflow: 'ellipsis',
      overflow:'hidden'
    }
    const lockedReceivingNameStyle={
      fontSize: '16px',
      color:'#ccc',
      width: '22vw',
      display: 'inline-block',
      verticalAlign: 'top',
      whiteSpace: 'nowrap',
      textOverflow: 'ellipsis',
      overflow:'hidden'
    }
    const receivingAddStyle={
      fontSize: '16px',
      fontWeight: '600',
      color:'rgba(51,51,51,1)',
      width: '55vw',
      display: 'inline-block',
      whiteSpace: 'nowrap',
      textOverflow: 'ellipsis',
      overflow:'hidden',
      verticalAlign: 'top'
    }
    const lockedReceivingAddStyle={
      fontSize: '16px',
      color:'#ccc',
      width: '55vw',
      display: 'inline-block',
      whiteSpace: 'nowrap',
      textOverflow: 'ellipsis',
      overflow:'hidden',
      verticalAlign: 'top'
    }
    const contactNameStyle={
      width:'25%',
      fontSize:'14px',
      fontWeight:'400',
      color:'rgba(102,102,102,1)',
      display: 'inline-block'
    }
    const phoneStyle={
      width:'30%',
      fontSize:'14px',
      fontWeight:'400',
      color:'rgba(102,102,102,1)',
      display: 'inline-block'
    }
    const operationStyle={
      float:'right',
      display: 'inline-block'
    }
    return (
      <div style={cardStyle} onClick={this.goToReceivingDetailPage}>
        <div style={isAvailable ? receivingNameStyle : lockedReceivingNameStyle}>
          {receivingName}{!isAvailable&&'(已禁用)'}
        </div>
        <div style={isAvailable ? receivingAddStyle : lockedReceivingAddStyle}>
          {receivingAddress}
        </div>
        <div style={{ marginTop: '10px' }}>
          <div style={contactNameStyle}>{contactName}</div>
          <div style={phoneStyle}>{contactPhone}</div>
        </div>
        <div style={{ marginTop: '10px' }}>
          <div style={contactNameStyle}>{projectName}</div>
          {
            editAuthority &&
            <div style={operationStyle}>
              <a className="mr-10" onClick={this.goToEditReceivingDetailPage}>
                <img src={editIcon} style={{ width:"18px", position:'relative', bottom: '-1px' }} alt="" />
              </a>

              {/* { isAvailable?
                <a onClick={this.disableReceiving}>
                  <img src={lockIcon} style={{ width:"25px", marginLeft: '3px' }} alt="" />
                </a>
                :
                <a onClick={this.enableReceiving}>
                  <img src={unLockIcon} style={{ width:"25px", marginLeft: '3px' }} alt="" />
                </a>
              } */}
            </div>
          }
        </div>
      </div>
    )
  }
}
