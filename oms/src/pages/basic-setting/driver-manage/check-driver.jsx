import React, { Component } from 'react';
import { Modal, Tooltip, message, notification } from 'antd';
import router from 'umi/router';
import DebounceFormButton from '../../../components/debounce-form-button';
import { addDriverToShipment, postDriverBasicAuth, getAllDriver } from '../../../services/apiService';

// const {actions:{getDrivers}} = driverModel

// @connect(null,{getDrivers})
export default class CheckDriver extends Component {

  checkDriverInfo = (formData) => {
    const { phone = '', nickName = '', idcardNo = '' } = formData;
    if (phone){
      let params = { selectType:3, phone, limit:10, offset:0 };
      if (nickName) params = { ...params, nickName };
      if (idcardNo) params = { ...params, idcardNo };

      getAllDriver(params)
        .then(data=>{
          // let noMatch
          const driver = data && data.items && data.items[0] || null;
          const noMatch = driver === null || !data?.items?.length;
          const _this = this;
          if (noMatch){
            Modal.confirm({
              title: '匹配失败',
              content: '未查询到相关司机，是否添加？',
              cancelText:'取消',
              okText:'添加',
              onOk (){
                if (nickName && idcardNo){
                  postDriverBasicAuth({ phone, nickName, idcardNo })
                    .then((res)=>{
                      if (res.description !== '一致') return message.error('身份证与姓名不匹配');
                      _this.props.checkBtnClick(res.userId);
                      Modal.success({
                        title: '成功',
                        content:'添加司机成功, 请继续完善资料',
                      });
                    });
                } else {
                  notification.error({
                    message : '请检查姓名和身份证号是否已填写',
                  });
                }

              }
            });
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
                        router.push('/basic-setting/driverManagement');
                      }
                    });
                  });
              }
            });
          }
        },
        );
    } else {
      Modal.error({
        title: '匹配失败',
        content:'请先填写基础信息'
      });
    }
  }

  confirmBox=driver=>(
    <>
      <p>{`系统已存在该司机：${driver.nickName}`}</p>
      <p>是否直接添加？</p>
    </>
  )

  render () {
    const text = <span>填入司机姓名、电话及身份证号，可对已有司机进行快速添加</span>;
    return (
      <>
        <Tooltip placement="right" title={text}>
          <DebounceFormButton validate={false} label="检测司机" type='primary' onClick={this.checkDriverInfo} />
        </Tooltip>
      </>
    );
  }
}
