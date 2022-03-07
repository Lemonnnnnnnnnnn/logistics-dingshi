import { ExclamationCircleOutlined } from "@ant-design/icons";
import { Form, message, Modal, Radio } from "antd";
import React, { useCallback } from "react";
import { putWithdraw } from "@/services/tender-manage-server";
import styles from "./index.scss";

interface IProps {
  visible: boolean;
  tenderId: number;
  setVisible: (bool: boolean) => void;
}
const WithdrawModal: React.FunctionComponent<IProps> = ({
  visible,
  tenderId,
  setVisible
}): JSX.Element => {
  const [form] = Form.useForm();
  const handleOk = useCallback(() => {
    form.validateFields().then(values => {
      putWithdraw(tenderId, values.reason).then(res => {
        message.success("撤回成功！");
        setVisible(false);
      });
    });
  }, [visible]);
  return (
    <Modal
      title="系统提示"
      visible={visible}
      onOk={handleOk}
      className="modal"
      width={800}
      centered
      onCancel={() => {
        setVisible(false);
        form.resetFields();
      }}
    >
      <div className="modalTitle">
        <ExclamationCircleOutlined />
        <span>确认要撤回“月球国土运输项目招标”项目？此操作不可逆！</span>
      </div>
      <Form form={form}>
        <Form.Item
          className={styles.modalContent}
          name="reason"
          label="请选择撤回原因"
          rules={[{ required: true }]}
        >
          <Radio.Group>
            <Radio value="信息有误重新发布">信息有误重新发布</Radio>
            <Radio value="项目临时取消">项目临时取消</Radio>
            <Radio value="已找到合适的供应商">已找到合适的供应商</Radio>
            <Radio value="其它原因">其它原因</Radio>
          </Radio.Group>
        </Form.Item>
      </Form>
    </Modal>
  );
};
export default WithdrawModal;
