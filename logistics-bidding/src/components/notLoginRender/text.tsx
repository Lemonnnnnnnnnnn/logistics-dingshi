import React from "react";
import { Row } from "antd";

const NotLoginRenderText: React.FC = () => (
  <Row>
    <img
      className="mr-1"
      width={20}
      src={require("@/assets/imgs/home/lock.png")}
      alt=""
    />
    <span>登录后可见</span>
  </Row>
);

export default NotLoginRenderText;
