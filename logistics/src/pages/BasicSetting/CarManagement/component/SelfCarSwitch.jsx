import React, { Component, useState } from "react";
import {  Switch, notification, message } from "antd";
import { changeCarOrg } from '@/services/apiService';

const SelfCarSwitch = ({ rowOrganizationId, organizationId, organizationName, carId, refresh })=> {
  const checked = rowOrganizationId === organizationId;

  const onChange = (val)=>{
    if (!rowOrganizationId || (rowOrganizationId === organizationId)){
      const params  ={ carId, carBelong : val ? 1 : 2 };
      changeCarOrg(params).then(()=> {
        refresh();
        message.success("修改成功！");
      });
    } else {
      notification.error({
        message : '操作失败',
        description : `该车辆已被${organizationName}调置为自有车辆！`
      });
    }
  };


  return <Switch checkedChildren="是" unCheckedChildren="否" checked={checked} onChange={onChange} />;
};



export default SelfCarSwitch;
