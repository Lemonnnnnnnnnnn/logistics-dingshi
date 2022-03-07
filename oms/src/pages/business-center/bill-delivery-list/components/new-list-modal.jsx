import React, { useState, useCallback } from 'react';
import { Modal, message, Select } from 'antd';
import isEmpty from 'lodash/isEmpty';

const  NewListModal = ({ visible, setVisible, projectList, history }) => {
  const [projectItem, setProjectItem] = useState({});

  const onOk = useCallback(() => {
    if  (!isEmpty(projectItem)) {
      history.push('billDelivery/newBillDeliveryList', { projectId: projectItem.value, projectName: projectItem.label });
      setVisible(false);
      return;
    }
    return message.info('请先选择项目！');
  }, [projectItem]);

  return (
    <Modal
      title="创建交票清单"
      centered
      visible={visible}
      onOk={onOk}
      onCancel={() => setVisible(false)}
      width={500}
      okText="下一步"
    >
      <span>请选择项目：</span>
      <Select onChange={(_, row) => setProjectItem(row.props)} showSearch optionFilterProp="children">
        {projectList &&
          projectList.slice(1).map(option => (
            <Select.Option key={option.key} {...option}>
              {option.label}
            </Select.Option>
          ))}
      </Select>
    </Modal>
  );
};

export default NewListModal;
