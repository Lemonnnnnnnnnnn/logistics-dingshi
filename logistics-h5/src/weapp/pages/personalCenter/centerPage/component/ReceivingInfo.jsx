import React, { Component } from 'react';
import { Card, WingBlank, WhiteSpace, InputItem, Button } from 'antd-mobile'
import { connect } from 'dva'
import router from 'umi/router'
import { USERPROJECTSTATUS } from '@/constants/project/project'
import { getUserInfo } from '@/services/user'


function mapStateToProps (state) {
  return {
    project: state.project.entity,
    nowUser: state.user.nowUser
  }
}

@connect(mapStateToProps, null)
class ReceivingInfo extends Component {

  accountType = getUserInfo().accountType

  state = {
    showAllReceiving:false,
  }

  renderReceivingItems = () => {
    const value = this.props.value ?? []
    const { showAllReceiving } = this.state
    const receivingList = value.map(item => (
      <WingBlank key={item.receivingId}>
        <WhiteSpace />
        <Card>
          <Card.Body>
            <div style={{ color: 'black' }}>
              卸货点名称：{item.receivingName}
            </div>
            <div style={{ whiteSpace: 'normal' }}>
              {item.receivingAddress}
            </div>
            <div>
              <span>{item.contactName}</span>
              <span style={{ float: 'right', marginRight: '150px' }}>{item.contactPhone}</span>
            </div>
          </Card.Body>
        </Card>
      </WingBlank>
    )).slice(0, showAllReceiving? value.length : 5)
    return (
      <>
        {receivingList}
        {!!value.length && !showAllReceiving &&
          <Button
            onClick={this.showAllReceiving}
            type="ghost"
            size="small"
            style={{
              marginTop:10,
              borderColor:'rgba(145, 213, 255, 1)',
              backgroundColor:'rgba(230, 247, 255, 1)',
              color:'rgba(0, 0, 0, 0.647058823529412)'
            }}
          >{`显示更多卸货点，共${value.length}个卸货点`}
          </Button>
        }
      </>
    )
  }

  showAllReceiving = () => this.setState({ showAllReceiving:true })

  hasResponsibleCustomer = () => {
    const { customerResponsibleItems } = this.props.project
    const index = (customerResponsibleItems||[]).findIndex(item => item.auditStatus === 1)
    return index > -1
  }

  receiveButtomDisplay = () => {
    const { project:{ customerResponsibleItems }, nowUser:{ userId } } = this.props
    let display = 'none'
    const auditStatus = (customerResponsibleItems||[]).find( item => item.responsibleId === userId)?.auditStatus
    // 子账号
    if (auditStatus === USERPROJECTSTATUS.SUCCESS && this.accountType === 3){
      display = 'block'
    } else if (this.accountType === 1 && this.hasResponsibleCustomer()) {
      display = 'block'
    }
    return display
  }

  addReceiving = () => {
    const { projectId, receivingItems } = this.props.project
    console.log((receivingItems||[]).length === 0, receivingItems)
    router.push(`/Weapp/addreceiving?projectId=${projectId}&mode=add&isFirstAdd=${(receivingItems||[]).length === 0}`)
  }

  render () {
    const { field: { label } } = this.props
    return (
      <>
        <InputItem extra={<Button size="small" onClick={this.addReceiving} style={{ fontSize:'12px', height:'20px', lineHeight:'20px', display:this.receiveButtomDisplay() }} inline type="primary">新建卸货点</Button>} editable={false}>{label}</InputItem>
        {this.renderReceivingItems()}
        <WhiteSpace />
      </>
    );
  }
}

export default ReceivingInfo;
