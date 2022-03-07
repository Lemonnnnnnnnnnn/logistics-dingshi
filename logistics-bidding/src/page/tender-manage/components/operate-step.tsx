import React, { useState, useCallback, useEffect } from "react";
import { Steps } from "antd";
import { CloseOutlined } from "@ant-design/icons";
import styles from "../index.scss";

const { Step } = Steps;

const OperateStep = () => {
  const [show, setShowStatus] = useState(true);

  const step = [
    {
      label: "发布招标/询价信息",
      key: 1
    },
    {
      label: "邀请商家（可选）",
      key: 2
    },
    {
      label: "评标",
      key: 3
    },
    {
      label: "发起二次报价（可选）",
      key: 4
    },
    {
      label: "录入评标结果（草稿）",
      key: 5
    },
    {
      label: "发起价格确认（可选）",
      key: 6
    },
    {
      label: "公布评标结果",
      key: 7
    }
  ];
  return show ? (
    <div className={styles.operateStep}>
      <CloseOutlined
        onClick={() => setShowStatus(false)}
        className="position-absolute text-large"
        style={{ right: 20 }}
      />
      <div className="text-large pb-2">操作步骤</div>
      <Steps progressDot className="mt-1" current={7}>
        {step.map(item => (
          <Step key={item.key} title={item.label} />
        ))}
      </Steps>
    </div>
  ) : null;
};

export default OperateStep;
