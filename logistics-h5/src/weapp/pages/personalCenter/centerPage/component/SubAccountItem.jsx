import React, { Component } from 'react'
import { Switch, Modal, Toast, TextareaItem } from 'antd-mobile'
import { getWxUser, patchResponsibleStatus } from '@/services/apiService'
import { USERPROJECTSTATUS } from '@/constants/project/project'

const { alert } = Modal

const Operation = (props) => {
  switch (props.auditStatus){
    case USERPROJECTSTATUS.SUCCESS:
      return (
        <div style={{ display: 'inline-block', textAlign: 'right' }}>
          <Switch
            checked={props.isAvailable}
            color="#108ee9"
            onChange={props.handleSwitchClick}
          />
        </div>
      )
    case USERPROJECTSTATUS.UNTREATED:
      return <div style={{ display: 'inline-block', textAlign: 'right', color: '#FF9900' }}>待审核</div>
    case USERPROJECTSTATUS.FAIL:
      return <div style={{ display: 'inline-block', textAlign: 'right', color: '#ff0000' }}>已拒绝</div>
    default: return <></>
  }

}
class SubAccountItem extends Component {

  constructor (props){
    super(props)
    this.textAreaRef = React.createRef()
    this.state = {
      visible:false
    }
  }

  componentWillUnmount (){
    if (this.auditAlert){
      this.auditAlert.close()
    }
  }

  handleSwitchClick = (checked) => {
    const { responsibleCorrelationId } = this.props
    const title = checked ? '启用确认' : '禁用确认'
    const content = checked ? '确定启用该子账号吗?' : '确定禁用该子账号吗?'
    alert(title, content,
      [
        { text: '取消' },
        { text: '确定', onPress: ()=>{
          patchResponsibleStatus({ responsibleCorrelationId, isAvailable: checked })
            .then(()=>{
              Toast.success('修改成功', 1, null, false)
              this.props.refresh()
            })
            .catch(()=>{
              Toast.fail('修改失败', 1, null, false)
            })
        } }
      ] )
  }

  closeAlert = () => {
    this.auditAlert.close()
  }

  onClick = () => {
    const { auditStatus, responsibleName, responsiblePhone, responsibleCorrelationId, responsibleId } = this.props
    if (auditStatus === USERPROJECTSTATUS.UNTREATED){
      getWxUser({ userId: responsibleId })
        .then(({ headImgUrl })=>{
          this.auditAlert = alert(
            <div style={{ textAlign: 'left' }}>
              <span>审核</span>
              <span onClick={this.closeAlert} style={{ float: 'right', display:'inline-block' }}>X</span>
            </div>
            ,
            <div style={{ textAlign: 'center' }}>
              <div style={{ margin: '10px 0 20px' }}>
                <img src={headImgUrl} alt="" style={{ width: '50px', height: '50px', borderRadius: '25px' }} />
              </div>
              {responsibleName}<br />{responsiblePhone}
            </div>
            ,
            [
              { text: '拒绝', onPress: ()=>{
                this.setState({
                  visible:true
                })
              } },
              { text: '通过', onPress: ()=>{
                patchResponsibleStatus({ responsibleCorrelationId, auditStatus: USERPROJECTSTATUS.SUCCESS })
                  .then(()=>{
                    Toast.success('审核已成功', 1, null, false)
                    this.props.refresh()
                  })
                  .catch(()=>{
                    Toast.fail('审核失败', 1, null, false)
                  })
              } }
            ])

        })
    }
  }

  render () {
    const { responsibleName, responsiblePhone, isAvailable, accountType, auditStatus, projectName, responsibleCorrelationId } = this.props
    const { visible } = this.state
    return accountType !== 1 ?
      <>
        <div onClick={auditStatus !== USERPROJECTSTATUS.SUCCESS?this.onClick:()=>{}} style={{ padding: '20px 12px', backgroundColor: 'white', border:'1px solid rgba(229, 229, 229, 1)', fontSize: '16px' }}>
          <div style={{ height: '31px' }}>
            <div style={{ display: 'inline-block', width: '28vw' }}>{responsibleName}</div>
            <div style={{ display: 'inline-block', width: '40vw' }}>{responsiblePhone}</div>
            <Operation isAvailable={isAvailable} auditStatus={auditStatus} handleSwitchClick={this.handleSwitchClick} />
          </div>
          <div style={{ fontSize: '14px' }}>
            绑定合同:<span>{projectName}</span>
          </div>
        </div>
        <Modal
          visible={visible}
          transparent
          maskClosable={false}
          onClose={()=>this.setState({ visible:false })}
          title={<div style={{ textAlign:'left' }}>确认拒绝</div>}
          footer={[
            { text: '返回', onPress: ()=>{
              this.onClick()
              this.setState({ visible:false })
            } },
            { text: '确认', onPress: () =>{
              const { value } = this.textAreaRef.current.state
              if (!value) return Toast.fail('请输入拒绝理由', 1)
              patchResponsibleStatus({ responsibleCorrelationId, auditStatus: USERPROJECTSTATUS.FAIL, remarks:value })
                .then(()=>{
                  Toast.success('审核已拒绝', 1, null, false)
                  this.props.refresh()
                })
                .catch(()=>{
                  Toast.fail('审核失败', 1, null, false)
                })
              this.setState({ visible:false })
            } }
          ]}
        >
          <TextareaItem
            ref={this.textAreaRef}
            style={{ fontSize:'14px' }}
            maxLength={150}
            rows={3}
            placeholder="请输入拒绝理由"
          />
        </Modal>
      </>
      :
      <></>
  }
}

export default SubAccountItem;
