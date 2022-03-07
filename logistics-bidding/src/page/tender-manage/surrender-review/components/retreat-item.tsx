import React from "react";
import { Form, FormInstance, Input, Radio } from "antd";
import styles from "./index.scss";
import dayjs from "dayjs";

interface IProps {
  dataItem: any;
  form: FormInstance;
}

const { TextArea } = Input;

const RetreatItem: React.FC<IProps> = ({ dataItem, form }) => {
  const currentData = form.getFieldValue("packageList")[dataItem.name];
  return (
    <div className={styles.retreatItem}>
      <div className={styles.retreatItemTitle}>
        退还保证金申请详情{currentData?.packageSequence}：
      </div>
      <div className={styles.retreatItemInfo}>
        <div>
          <p>
            <span>申请商家：</span>
            <span>{currentData.applyOrganizationName}</span>
          </p>
          <p>
            <span>中标包件：</span>
            <span>{currentData.tenderPackageTitles.join(",")}</span>
          </p>
          <p>
            <span>业务联系人：</span>
            <span>
              {currentData.contactName.split(",").map((item: any) => (
                <div>{item}</div>
              ))}
            </span>
          </p>
        </div>
        <div>
          <p>
            <span>申请时间：</span>
            <span>
              {dayjs(currentData.earnestMoneyApplyTime).format(
                "YYYY-MM-DD HH:mm:ss"
              )}
            </span>
          </p>
          <p>
            <span>保证金金额：</span>
            <span>{currentData.earnestMoney}</span>
          </p>
          <p>
            <span>申请原因：</span>
            <span>{currentData.refundApplyRemark}</span>
          </p>
        </div>
      </div>
      <Form.Item
        name={[dataItem.name, "isConsentRefund"]}
        label="审核意见"
        rules={[{ required: true, message: "请选择审核意见" }]}
      >
        <Radio.Group>
          <Radio value={true}>同意</Radio>
          <Radio value={false}>拒绝</Radio>
        </Radio.Group>
      </Form.Item>
      <Form.Item
        name={[dataItem.name, "remarks"]}
        label="审核备注"
        style={{ marginTop: "20px" }}
        rules={[
          {
            required:
              form.getFieldsValue()[dataItem.name] &&
              form.getFieldsValue()[dataItem.name].isConsentRefund === 3
                ? true
                : false
          }
        ]}
      >
        <TextArea rows={5} style={{ width: "100%" }} />
      </Form.Item>
    </div>
  );
};

export default RetreatItem;
