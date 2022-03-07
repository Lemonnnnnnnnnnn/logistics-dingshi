import React from 'react';
import { Modal, Icon } from 'antd';

const  NewListModal = (title, onOk ) => () =>  (Modal.confirm({
  title,
  icon: (<Icon
    style={{ color: 'rgba(250,173,20,0.85)', marginRight: '15px' }}
    type='exclamation-circle'
    theme='filled'
  />),
  okText: '确认',
  cancelText: '取消',
  content: '',
  onOk,
}));

export default NewListModal;
