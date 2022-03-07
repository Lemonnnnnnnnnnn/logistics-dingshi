import { putTwoPrice } from "@/services/tender-manage-server";
import { DatePicker, Form, message, Modal } from "antd";
import React, { useCallback, useState } from "react";
import { History } from "history";
import styles from "./index.scss";
import dayjs from 'dayjs';

interface IProps {
  visible: boolean;
  tenderId: number;
  history: History;
  setVisible: (bool: boolean) => void;
}
const SecondQuoteModal: React.FunctionComponent<IProps> = ({
  visible,
  tenderId,
  history,
  setVisible
}): JSX.Element => {
  const [form] = Form.useForm();
  const handleOk = useCallback(() => {
    form.validateFields().then(values => {
      putTwoPrice(
        tenderId,
        dayjs(values.priceTwoTime).format("YYYY/MM/DD HH:mm:ss")
      ).then(res => {
        message.success("二次报价发起成功！");
        setVisible(false);
        history.push("/tenderManage");
      });
    });
  }, [visible]);
  return (
    <Modal
      title="二次报价"
      visible={visible}
      centered
      onOk={handleOk}
      // confirmLoading={confirmLoading}
      className={styles.payModal}
      width={540}
      onCancel={() => {
        setVisible(false);
      }}
    >
      <div>
        <Form form={form}>
          <Form.Item
            name="priceTwoTime"
            label="请输入二次报价截止时间"
            rules={[{ required: true }]}
          >
            <DatePicker showTime disabledDate={current => current && current < dayjs()} />
          </Form.Item>
        </Form>
        <p style={{ marginTop: "20px", color: "#999" }}>
          （提示：超过该时间二次报价的入口将关闭）
        </p>
      </div>
    </Modal>
  );
};
export default SecondQuoteModal;
