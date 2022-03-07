import React, { Component } from 'react'
import { SchemaForm, Item, FormButton, FORM_MODE, ErrorNoticeBar } from '@gem-mine/mobile-schema-form'
import { Toast, Button, Modal, Icon } from 'antd-mobile'
import { connect } from 'dva'
import '@gem-mine/mobile-schema-form/src/fields'
import router from 'umi/router'
import styles from './AddReceiving.css'
import { PROJECT_AUDIT_STATUS } from '@/constants/project/project'
import { isArray } from '@/utils/utils'
import { getReceivingDetail, addReceiving, modifyAddReceiving, AddContractReceiving } from '@/services/apiService'
import MapInput from './components/MapInput'
import model from '@/models/contract'
import UpLoadImage from '@/weapp/component/UpLoadImage'

const { alert } = Modal

const { actions:{ patchProjects } } = model

function mapStateToProps (state) {
  return {
    receiving: state.receiving.items,
    project: state.project.entity
  }
}
@connect(mapStateToProps, { patchProjects })
export default class AddReceiving extends Component{

  state={
    data: {},
    errors: []
  }

  schema = {
    receivingAddressObject:{
      label: '详细地址',
      component: MapInput, // TODO这里要用地图组件
      rules: {
        required: true
      },
      placeholder: '请选择卸货地址'
    },
    receivingName:{
      label: '卸货点名称',
      component: 'inputItem',
      rules: {
        required: true
      },
      placeholder: '请输入卸货点名称'
    },
    contactName:{
      label: '联系人名称',
      component: 'inputItem',
      rules: {
        required: true
      },
      placeholder: '请输入联系人名称'
    },
    contactPhone:{
      label: '联系电话',
      component: 'inputItem',
      rules: {
        required: true,
        pattern: /^1\d{10}$/
      },
      placeholder: '请输入联系电话'
    },
    isOpenFence:{
      label: '开启电子围栏',
      component: 'picker',
      options: [
        { label: '开启', value: true },
        { label: '关闭', value: false }
      ],
      defaultValue: [false]
    },
    radius:{
      label: '围栏半径',
      component: 'inputItem',
      type:'number',
      visible:{
        watch: 'isOpenFence',
        action: (isOpenFence)=> isOpenFence[0]
      },
      format:{
        input:(value)=>value,
        output:(value)=> parseInt(value, 10)
      },
      disabled:true,
      props:{
        step:100,
        min:100,
        max:1000,
        extra:'米',
        style:{
          textAlign:'right'
        }
      },
      defaultValue:1000,
      rules:{
        required: true,
        // validator: ({ value })=>{
        //   if (value>1000 || value < 100){
        //     return '围栏范围为100-1000米'
        //   }
        // }
      }
    },
    signDentryid: {
      label: '样签',
      component: UpLoadImage, // TODO这里需要图片上传组件
      rules: {
        required: [true, '样签不得为空']
      }
    }
  }

  componentDidMount (){
    const { location:{ query: { mode, receivingId } } } = this.props
    if ( mode !== FORM_MODE.ADD){
      getReceivingDetail(receivingId)
        .then(data=>{
          data.receivingAddressObject={
            receivingAddress: data.receivingAddress,
            receivingLongitude: data.receivingLongitude,
            receivingLatitude: data.receivingLatitude
          }
          data.isOpenFence=[data.isOpenFence]
          this.setState({
            data
          })
        })
    }
  }

  saveData = (formData) => {
    const { receivingAddressObject: { receivingAddress, receivingLongitude, receivingLatitude }, signDentryid, isOpenFence } = formData
    const newData = { ...formData, receivingAddress, receivingLongitude, receivingLatitude, signDentryid:isArray(signDentryid)?signDentryid[0]:signDentryid, isAvailable: true, isOpenFence:isOpenFence[0] }
    const { location:{ query: { mode, receivingId, isFirstAdd, projectId } }, patchProjects } = this.props
    if (mode===FORM_MODE.ADD){
      addReceiving(newData)
        .then(data => {
          const receivingItems = [{ receivingId:data.receivingId, signDentryid:data.signDentryid }]
          return isFirstAdd === 'true'
            ? patchProjects({ projectId, projectStatus:PROJECT_AUDIT_STATUS.CUSTOMER_AUDITED, receivingItems })
            : AddContractReceiving({ projectId, receivingItems })
        })
        .then(()=>{
          alert(
            <div>添加成功</div>
            ,
            <div style={{ textAlign: 'center' }}>
              <div style={{ margin: '10px 0 20px' }}>
                <Icon type="check" size='lg' />
              </div>
              {`${formData.receivingName}添加成功，是否继续添加？`}
            </div>
            ,
            [
              { text: '返回', onPress: ()=> router.goBack() },
              { text: '继续添加', onPress: ()=> {
                router.replace(`/Weapp/addreceiving?projectId=${projectId}&mode=add&isFirstAdd=false}`)
                router.go(0)
              } }
            ])
        })
    } else if (mode===FORM_MODE.MODIFY){
      modifyAddReceiving({ ...newData, receivingId })
        .then(({ message }) => {
          if (message){
            Toast.info(message, 1, router.goBack, false)
          } else {
            Toast.success('修改成功', 1, router.goBack, false)
          }
        })

    }

  }

  render (){

    const { location:{ query: { mode } } } = this.props
    return (
      <div style={{ position:'relative', height: '100%' }}>
        <SchemaForm schema={this.schema} mode={mode} data={this.state.data} onChange={() => this.setState({ errors: [] })}>
          <ErrorNoticeBar errors={this.state.errors} />
          <Item field="receivingAddressObject" />
          <Item field="receivingName" />
          <Item field="contactName" />
          <Item field="contactPhone" />
          <Item field="isOpenFence" />
          <Item field="radius" />
          <Item field="signDentryid" />
          {
            mode !== FORM_MODE.DETAIL ?
              <div>
                <Button className={styles.goBackBtn} onClick={router.goBack}>返回</Button>
                <FormButton debounce className={styles.saveBtn} type="primary" label="保存" onClick={this.saveData} onError={(errors) => this.setState({ errors })} />
              </div>

              :
              <Button className={styles.goBackBtn2} type="primary" onClick={router.goBack}>返回</Button>
          }
        </SchemaForm>
      </div>
    )
  }
}
