import React, { Component } from 'react'
import { connect } from 'dva'
import { WhiteSpace, WingBlank, Toast } from 'antd-mobile'
import moment from 'moment';
import router from 'umi/router'
import { SchemaForm, FORM_MODE, Item, FormButton } from '@gem-mine/mobile-schema-form';
import GoodsInfo from './component/GoodsInfo'
import ReceivingInfo from './component/ReceivingInfo'
import { bindContract, patchResponsibleStatus } from '@/services/apiService'
import model from '@/models/contract'
// import receivingModel from '@/models/receiving'
import SmsCode from '@/components/SmsCode'
import { PROJECT_AUDIT_STATUS, USERPROJECTSTATUS, USERPROJECTSTATUSSCRIPT } from '@/constants/project/project'
import UpLoadImage from '@/weapp/component/UpLoadImage'
import { getUserInfo } from '@/services/user'
import '@gem-mine/mobile-schema-form/src/fields'
import styles from './ContractDetail.css'


const { actions: { detailProjects, detailProjectsByQrCode } } = model
// const { actions: { getReceiving } } = receivingModel
const valueStyle = {
  textAlign: 'right',
  color: '#9B9B9B'
}

function mapStateToProps (state) {
  return {
    project: state.project.entity,
    nowUser: state.user.nowUser
  }
}

@connect(mapStateToProps, { detailProjects, detailProjectsByQrCode })
export default class RelationTransport extends Component {

  state = {
    ready: false
  }

  accountType = getUserInfo().accountType

  constructor (props) {
    super(props)
    const { location: { query: { projectId, qrCodeValue } } } = this.props
    this.schema = {
      projectStatus:{
        component:'hide'
      },
      projectStatusWord:{
        label: '合同状态',
        component: 'inputItem',
        style: valueStyle
      },
      // refuseReason: {
      //   component: 'inputItem',
      //   label: '拒绝理由',
      //   style: valueStyle,
      //   value: ({ formData }) => {
      //     const verifyItems = formData.verifyItems || []
      //     // TODO 客户合同审核verifyObjectType编码未定义
      //     const customerVerify = verifyItems.find(item => item.verifyObjectType === 66)
      //     if (!customerVerify) return '--'
      //     return customerVerify.verifyReason
      //   },
      //   visible: ({ formData }) => {
      //     // 合同状态为客户拒绝时展示拒绝理由
      //     if (formData.projectStatus=== PROJECT_AUDIT_STATUS.CUSTOMER_REFUSE) return true
      //     return false
      //   }
      // },
      // verifyTime: {
      //   component: 'inputItem',
      //   label: '审核时间',
      //   style: valueStyle,
      //   value: ({ formData }) => {
      //     const verifyItems = formData.verifyItems || []
      //     // TODO 客户合同审核verifyObjectType编码未定义
      //     const customerVerify = verifyItems.find(item => item.verifyObjectType === 66)
      //     if (!customerVerify) return '--'
      //     return moment(customerVerify.createTime).format('YYYY-MM-DD')
      //   },
      //   visible: ({ formData }) => {
      //     // 合同状态为客户拒绝时展示拒绝理由
      //     if (formData.projectStatus!== PROJECT_AUDIT_STATUS.CUSTOMER_UNAUDITED) return true
      //     return false
      //   }
      // },
      projectName: {
        component: 'inputItem',
        style: valueStyle,
        label: '合同名称'
      },
      projectNo: {
        component: 'inputItem',
        style: valueStyle,
        label: '合同编号'
      },
      customerName: {
        component: 'inputItem',
        style: valueStyle,
        label: '客户'
      },
      projectTime: {
        component: 'inputItem',
        label: '合同签订日期',
        style: valueStyle,
        format: {
          input: (value) => moment(value || undefined).format('YYYY-MM-DD')
        }
      },
      projectRemark: {
        component: 'textArea',
        label: '备注信息',
        arrow: 'empty',
        props: {
          rows: 3,
          count: 100,
          autoHeight: true,
          style: {
            background: 'rgba(247,247,247,1)',
            borderRadius: '7px',
            width: '95%',
            fontSize: '12px',
            padding: '3px 10px'
          }
        }
      },
      customerContactName: {
        component: 'inputItem',
        style: valueStyle,
        label: '客户联系人'
      },
      customerContactPhone: {
        component: 'inputItem',
        style: valueStyle,
        label: '客户联系电话'
      },
      goodsItems: {
        component: GoodsInfo,
        label: '合同商品'
      },
      receivingItems: {
        component: ReceivingInfo,
        label: '卸货点'
      },
      consignmentName: {
        component: 'inputItem',
        style: valueStyle,
        label: '合同托运方'
      },
      projectDentryid: {
        label: '合同图片',
        component: UpLoadImage,
        style: {
          display: 'flex'
        },
        valueStyle: {
          textAlign: 'right',
          flex: '1 1'
        },
        format: {
          input: (value) => value ? value.split(',') : []
        }
      },
      smsCode: {
        component: SmsCode,
        label: '短信验证码',
        props: {
          smsType: 'SMS_177243321',
          isCheckPhone: false,
          phoneField: 'customerContactPhone'
        },
        visible:({ formData })=>{
          if (projectId) return false
          if (formData.projectStatus === PROJECT_AUDIT_STATUS.CUSTOMER_UNAUDITED || qrCodeValue) return true
          return false
        }
      },
      verifyItems: {
        component: 'hide',
      }
    }
  }

  getProjectStatus = (project) => {
    const { projectStatus, isAvailable } = project
    const { auditStatus = USERPROJECTSTATUS.NO_JOINED } = this.state
    let statusWord
    // 当账号类型为子账号时
    if (!isAvailable) return '禁用'
    if (this.accountType === 3 && auditStatus !== USERPROJECTSTATUS.SUCCESS) {
      statusWord = USERPROJECTSTATUSSCRIPT[auditStatus]
    } else {
      const config = [
        { word: '平台已拒绝', color: 'red' },
        { word: '合同进行中', color: 'green' },
        { word: '平台待审核', color: 'orange' },
        { word: '承运待审核', color: 'orange' },
        { word: '承运已拒绝', color: 'red' },
        { word: '客户待确认', color: 'orange' },
        { word: '客户拒绝', color: 'red' },
        { word: '待托运确认', color: 'orange' },
      ][projectStatus]
      statusWord = config.word
    }
    return statusWord
  }

  componentDidMount () {
    const { location: { query: { projectId, qrCodeValue } }, detailProjects, detailProjectsByQrCode } = this.props
    if (projectId) {
      detailProjects({ projectId })
        .then(({ customerResponsibleItems }) => {
          this.callbackFun(customerResponsibleItems)
        })
    } else {
      detailProjectsByQrCode(qrCodeValue)
        .then(({ customerResponsibleItems }) => {
          this.callbackFun(customerResponsibleItems)
        })
    }
  }

  callbackFun = (customerResponsibleItems) => {
    const { nowUser:{ userId } } = this.props
    const hasResponsible = (customerResponsibleItems||[]).findIndex( item => item.auditStatus === USERPROJECTSTATUS.SUCCESS)
    const auditStatus = (customerResponsibleItems||[]).find( item => item.responsibleId === userId)?.auditStatus
    const isAvailable = (customerResponsibleItems||[]).find( item => item.responsibleId === userId)?.isAvailable
    // 为主账号时，无合同负责人不可操作
    if (hasResponsible <0 && this.accountType === 1) {
      Toast.fail('该合同尚未绑定合同负责人', 2)
    }
    if (isAvailable || isAvailable === undefined || this.accountType === 1) {
      this.setState({
        ready: true,
        auditStatus
      })
    } else {
      router.replace(`/Weapp/bindContract/error?error=noSameOrganization&word=查看失败`)
    }
  }

  joinContractButton = () => {
    const { auditStatus = USERPROJECTSTATUS.NO_JOINED } = this.state
    let config = { showCheck:false, disabled: false, text:'内容无误，添加合同' }
    if (this.accountType === 3){
      switch (auditStatus){
        case USERPROJECTSTATUS.FAIL:
          config = { showCheck:true, disabled: false, text:'重新申请加入合同', reapply:true }
          break;
        case USERPROJECTSTATUS.UNTREATED:
          config = { showCheck:true, disabled: true, text:'审核中...' }
          break;
        case USERPROJECTSTATUS.NO_JOINED:
          config = { showCheck:true, disabled: false, text:'内容无误，添加合同' }
          break;
        default:
      }
    }
    return config.showCheck
      ? <FormButton debounce disabled={config.disabled} style={{ borderRadius: '23.5px', marginBottom:'5px' }} onClick={config.reapply?this.reapply:this.bindContract} type="primary" label={config.text} />
      : <FormButton debounce style={{ borderRadius: '23.5px', marginBottom:'5px' }} onClick={this.back} type="primary" label="返回" />
  }

  renderButton = () =>(
    <WingBlank>
      {this.joinContractButton()}
    </WingBlank>
  )

  bindContract = () => {
    const { projectId, customerContactPhone } = this.props.project
    bindContract({ projectId, phone: customerContactPhone })
      .then(() => {
        Toast.success('已提交申请加入合同，请等待主账号审核', 2, ()=>{
          router.replace('/Weapp/main/index')
        }, false)
      })
  }

  reapply = () => {
    const { nowUser:{ userId }, project:{ customerResponsibleItems } } = this.props
    const responsibleCorrelationId = (customerResponsibleItems||[]).find( item => item.responsibleId === userId)?.responsibleCorrelationId
    patchResponsibleStatus({ responsibleCorrelationId, auditStatus:USERPROJECTSTATUS.UNTREATED })
      .then(()=>{
        Toast.success('已重新申请加入合同，请等待主账号审核。', 2, ()=>{
          router.replace('/Weapp/main/index')
        }, false)
      })
  }

  addReceiving = () => {
    const { projectId } = this.props.project
    router.replace(`contractDetail/customerAddInfo?projectId=${projectId}`)
  }

  back = () => {
    router.goBack()
  }

  render () {
    const { project={} } = this.props
    const { ready, auditStatus } = this.state
    const data = { ...project, projectStatusWord: this.getProjectStatus(project), auditStatus }
    return (
      <div className={styles.layout}>
        {/* <Modal
          afterClose={this.back}
          visible={visible}
          transparent
          maskClosable={false}
          onClose={()=>this.setState({ visible:false })}
          title="拒绝合同"
          footer={[
            { text: '取消', onPress: ()=>this.setState({ visible:false }) },
            { text: '确认', onPress: () =>{
              const { value } = this.textAreaRef.current.state
              if (!value) return Toast.fail('请输入拒绝理由')
              this.setState({ visible:false })
            } }
          ]}
        >
          <div style={{ textAlign:'left' }}>拒绝理由</div>
          <TextareaItem
            ref={this.textAreaRef}
            style={{ fontSize:'12px' }}
            rows={3}
            placeholder="请输入"
          />
        </Modal> */}
        {ready &&
          <SchemaForm schema={this.schema} data={data} mode={FORM_MODE.DETAIL}>
            <Item field="projectStatusWord" />
            <Item field="projectName" />
            {/* <Item field="refuseReason" /> */}
            <Item field="projectNo" />
            <Item field="customerName" />
            <Item field="projectTime" />
            <Item field="projectRemark" />
            <Item field="customerContactName" />
            <Item field="customerContactPhone" />
            <Item field="goodsItems" />
            <Item field="receivingItems" />
            <WhiteSpace />
            <Item field="projectDentryid" />
            <WhiteSpace />
            {this.renderButton()}
          </SchemaForm>
        }
      </div>
    )
  }

}
