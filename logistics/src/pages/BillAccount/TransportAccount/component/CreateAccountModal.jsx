import React, { useState, useEffect } from "react";
import { Button, Col, Modal, notification, Row, Select } from "antd";
import router from "umi/router";
import { getTransportsSelectProject } from "@/services/apiService";
import { SHIPMENT_TO_CONSIGN } from '@/constants/account';
import { judgeMenuType } from '@/utils/account';

const { Option } = Select;

const CreateAccountModal = ({ onCancelModal, path }) => {
  const [selectedProject, setSelectedProject] = useState(-1);
  const [projectOptions, setProjectOptions] = useState([]);

  useEffect(() => {
    getTransportsSelectProject({ offset: 0, limit: 100000 }).then(({ items }) => {
      setProjectOptions(items);
    });
  }, []);

  const onSelectProject = (val) => {
    setSelectedProject(val);
  };

  const addPageRouter = () => {
    if (selectedProject === -1) {
      return notification.error({ message: "请选择项目" });
    }
    const projectMsg = projectOptions.find(item => item.projectId === selectedProject);

    if (judgeMenuType(path) === SHIPMENT_TO_CONSIGN){
      router.push({
        pathname: `${path}createTransportAccountBill`,
        query: { ...projectMsg, menu :  SHIPMENT_TO_CONSIGN },
      });
    } else {
      router.push({
        pathname: `${path}createTransportAccountBill`,
        query: projectMsg,
      });
    }

  };


  return (
    <>
      <span>请选择项目：</span>
      <Select
        placeholder="请输入项目名称"
        optionFilterProp="children"
        showSearch
        style={{ width: 250 }}
        onChange={onSelectProject}
        filterOption={(input, option) =>
          option.props.children.toLowerCase().indexOf(input.toLowerCase()) >= 0
        }
      >
        {
          projectOptions.map(item => (
            <Option
              key={item.projectId}
              value={item.projectId}
            >{item.projectName}
            </Option>)
          )
        }
      </Select>
      <Row type="flex" className="mt-2">
        <Col span={6} />
        <Col span={6}><Button type="primary" onClick={addPageRouter}>下一步</Button></Col>
        <Col span={6}><Button onClick={onCancelModal}>取消</Button></Col>
        <Col span={6} />
      </Row>
    </>
  );
};

export default CreateAccountModal;
