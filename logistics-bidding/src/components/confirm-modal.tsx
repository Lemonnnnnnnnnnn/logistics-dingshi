import React from "react";
import { Modal } from "antd";
import { ExclamationCircleOutlined } from "@ant-design/icons";

const ConfirmModal = (title: string, onOk: any ) => () =>
  Modal.confirm({
    title,
    icon: <ExclamationCircleOutlined />,
    okText: "确认",
    cancelText: "取消",
    centered: true,
    content: "",
    onOk
  });

export default ConfirmModal;
