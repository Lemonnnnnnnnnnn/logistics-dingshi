import { Form, Modal, Button } from "antd";
import React from "react";
import styles from "./index.scss";

interface IProps {
  visible: boolean;
  getUserInfo: (tokenStr: string) => void;
  getCurrentUserInfo: () => void;
  setVisible: () => void;
}
const PriceModal: React.FunctionComponent<IProps> = ({
  visible,
  getUserInfo,
  getCurrentUserInfo,
  setVisible
}): JSX.Element => {
  const [form] = Form.useForm();
  const handleModal = (str: string) => () => {
    setVisible();
    getUserInfo(str);
    getCurrentUserInfo();
  };
  return (
    <Modal
      title="系统提示"
      visible={visible}
      className={`modal ${styles.priceModal}`}
      // width={1100}
      centered
      footer={null}
      onCancel={() => {
        setVisible();
      }}
    >
      请选择您要登录的身份！
      <div style={{ marginTop: "20px", textAlign: "center" }}>
        <Button type="primary" onClick={handleModal("token_storage")}>
          承运/平台登录
        </Button>
        <Button
          type="primary"
          style={{ marginLeft: "20px" }}
          onClick={handleModal("token")}
        >
          托运登录
        </Button>
      </div>
    </Modal>
  );
};
export default PriceModal;
