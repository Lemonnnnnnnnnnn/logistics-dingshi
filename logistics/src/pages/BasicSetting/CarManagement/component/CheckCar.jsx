import React, { Component } from 'react'
import { Modal, Tooltip } from 'antd'
import { FormButton } from '@gem-mine/antd-schema-form'
import DebounceFormButton from '@/components/DebounceFormButton';
import router from 'umi/router'
import { addDriverToShipment, getAllDriver } from '@/services/apiService'

// const {actions:{getDrivers}} = driverModel

// @connect(null,{getDrivers})
export default class CheckDriver extends Component {

  checkDriverInfo = (formData) => {
    const { phone = '', nickName = '', idcardNo = '' } = formData
    if (phone&&nickName&&idcardNo){
      getAllDriver({ selectType:3, phone, nickName, idcardNo, limit:10, offset:0 })
        .then(data=>{
          if (!data) return
          const driver = data.items[0]
          const noMatch = driver === null
          if (noMatch){
            Modal.info({
              title: '匹配失败',
              content:'未查询到相关司机，请完善信息后添加'
            })
          } else {
            Modal.confirm({
              content:this.confirmBox(driver),
              cancelText:'取消',
              okText:'添加',
              onOk (){
                addDriverToShipment({ userId:driver.userId })
                  .then(()=>{
                    Modal.success({
                      title: '成功',
                      content:'添加司机成功',
                      onOk (){
                        router.push('/basic-setting/driverManagement')
                      }
                    })
                  })
              }
            })
          }
        },
        )
    } else {
      Modal.error({
        title: '匹配失败',
        content:'请先填写基础信息'
      })
    }
  }

  confirmBox=driver=>(
    <>
      <p>{`系统已存在该司机：${driver.nickName}`}</p>
      <p>是否直接添加？</p>
    </>
  )

  render () {
    const text = <span>填入司机姓名、电话及身份证号，可对已有司机进行快速添加</span>
    return (
      <>
        <Tooltip placement="right" title={text}>
          <DebounceFormButton validate={false} label="检测车辆" type='primary' onClick={this.checkDriverInfo} />
        </Tooltip>
      </>
    )
  }
}
