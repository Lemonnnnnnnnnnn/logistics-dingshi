import React, { useEffect, useState } from "react";
import {
  Form,
  Input,
  Radio,
  DatePicker,
  Col,
  Row,
  Select,
  Checkbox,
  FormInstance,
  InputNumber
} from "antd";
import styles from "./index.scss";
import { IUsersParams, IStoreProps, ITenderManageStoreProps } from "@/declares";
import { connect } from "dva";

const { RangePicker } = DatePicker;
const { Option } = Select;

interface IProps {
  form: FormInstance;
  disable: boolean;
  tenderManageStore: ITenderManageStoreProps;
  getUsersList: (params: IUsersParams) => void;
}

const BasicsInfo: React.FunctionComponent<IProps> = ({
  form,
  getUsersList,
  tenderManageStore: { biddingDetail, usersList },
  disable
}): JSX.Element => {
  const settlementType = form.getFieldValue("settlementType");
  const paymentType = form.getFieldValue("paymentType");
  const seeIsConfirm = form.getFieldValue("seeIsConfirm");
  const [show, setShow] = useState(false);
  useEffect(() => {
    getUsersList({
      limit: 1000,
      offset: 0,
      isAvailable: true,
      accountTypeArr: "1,3"
    });
  }, []);
  useEffect(() => {
    if (biddingDetail) {
      form.setFieldsValue({ seeIsConfirm: biddingDetail.seeIsConfirm });
    }
  }, [biddingDetail]);
  const onChange = e => {
    setShow(!show);
  };
  return (
    <div className={styles.basicsInfo}>
      <Row className="rowItem">
        <Col span={12}>
          <Form.Item
            name="tenderType"
            label="类型"
            rules={[{ required: true }]}
          >
            <Radio.Group disabled={disable}>
              <Radio value={1}>招标</Radio>
              <Radio value={2}>询价</Radio>
            </Radio.Group>
          </Form.Item>
        </Col>
        <Col span={12}>
          <Form.Item
            name="isMultipleWinner"
            label="中标是否可为多个投标单位"
            rules={[{ required: true }]}
          >
            <Radio.Group disabled={disable}>
              <Radio value={1}>是</Radio>
              <Radio value={0}>否</Radio>
            </Radio.Group>
          </Form.Item>
        </Col>
      </Row>
      <Row className="rowItem">
        <Col span={12}>
          <Form.Item
            name="tenderTitle"
            label="项目标题"
            rules={[{ required: true }]}
          >
            <Input maxLength={40} disabled={disable} />
          </Form.Item>
        </Col>
        <Col span={12}>
          <Form.Item
            name="offerTime"
            label="报价/投标起止日期"
            rules={[{ required: true }]}
          >
            <RangePicker showTime disabled={disable} />
          </Form.Item>
        </Col>
      </Row>
      <Row className="rowItem">
        <Col span={12}>
          <Form.Item
            name="contactPurchaseList"
            label="采购联系人"
            rules={[{ required: true }]}
          >
            <Select disabled={disable}>
              {usersList.map(item => (
                <Option value={item.userId} key={item.userId}>
                  {item.nickName}
                </Option>
              ))}
            </Select>
          </Form.Item>
        </Col>
        <Col span={12}>
          <Form.Item
            name="tenderOpenTime"
            label="开标日期"
            rules={[{ required: true }]}
          >
            <DatePicker showTime disabled={disable} />
          </Form.Item>
        </Col>
      </Row>
      <Row className="rowItem">
        <Col span={12}>
          <Form.Item
            name="invoiceRequirements"
            label="发票要求"
            rules={[{ required: true }]}
          >
            <Radio.Group disabled={disable}>
              <Radio value={1}>增值税专票（一般纳税人开具）</Radio>
              <Radio value={2}>增值税普通发票</Radio>
            </Radio.Group>
          </Form.Item>
        </Col>
        <Col span={12}>
          <Form.Item
            name="settlementType"
            label="结算方式"
            className={styles.basicsInfoRadio}
            rules={[{ required: true }]}
          >
            <Radio.Group disabled={disable} onChange={onChange}>
              <Radio value={1}>月结</Radio>
              <Radio value={2}>签收后</Radio>
              <Form.Item
                name="settlementTypeContent1"
                rules={[
                  {
                    required: settlementType === 2 ? true : false,
                    message: "请输入天数"
                  },
                  ({ getFieldValue }) => ({
                    validator(_, value) {
                      if (
                        !value ||
                        /^\d*$/.test(getFieldValue("settlementTypeContent1"))
                      ) {
                        return Promise.resolve();
                      }
                      return Promise.reject(new Error("只能输入正整字"));
                    }
                  })
                ]}
                className={styles.basicsInfoRadioInput}
              >
                <Input disabled={disable} />
              </Form.Item>
              <p style={{ fontSize: "14px", marginBottom: 0, marginRight: 15 }}>
                天结算
              </p>
              <Radio value={3}>其他</Radio>
              <Form.Item
                name="settlementTypeContent"
                rules={[
                  {
                    required: settlementType === 3,
                    message: "输入其他结算方式"
                  }
                ]}
                className={styles.basicsInfoRadioInput}
              >
                <Input disabled={disable} />
              </Form.Item>
            </Radio.Group>
          </Form.Item>
        </Col>
      </Row>
      <Row className="rowItem">
        <Col span={12}>
          <Form.Item
            name="supplierScope"
            label="供应商范围"
            rules={[{ required: true }]}
          >
            <Radio.Group disabled={disable}>
              <Radio value={1}>公开征集供应商</Radio>
              <Radio value={2}>定向邀请指定供应商</Radio>
            </Radio.Group>
          </Form.Item>
        </Col>
        <Col span={12}>
          <Form.Item
            name="performanceBond"
            label="履约保证金（合同金额占比）"
            // rules={[{pattern: /^\d+(\.\d+)?$/, message : "请输入数字"}]}
          >
            <InputNumber
              min={0}
              formatter={value => `${value}%`}
              parser={value => value.replace("%", "")}
              placeholder="请输入百分比，如5%"
              disabled={disable}
            />
          </Form.Item>
        </Col>
      </Row>
      <Row className="rowItem">
        <Col span={12}>
          <Form.Item
            name="paymentType"
            label="支付方式"
            className={styles.basicsInfoRadio}
          >
            <Radio.Group disabled={disable} onChange={onChange}>
              <Radio value={1}>银行转账</Radio>
              <Radio value={2}>银行承兑</Radio>
              <Radio value={3}>其他</Radio>
              <Form.Item
                name="paymentTypeContent"
                rules={[
                  {
                    required: paymentType === 3,
                    message: "请输入其他支付方式"
                  }
                ]}
                className={styles.basicsInfoRadioInput}
              >
                <Input disabled={disable} />
              </Form.Item>
            </Radio.Group>
          </Form.Item>
        </Col>
        <Col span={12}>
          <Form.Item
            name="seeTenderContent"
            label="查看投标信息条件"
            rules={[{ required: true }]}
            className={styles.basicsInfoTop}
          >
            <Radio.Group disabled={disable}>
              <Radio value={1}>随时可看</Radio>
              <Radio value={2}>投标截止日期后可看</Radio>
              <Form.Item name="seeIsConfirm" valuePropName="checked">
                <Checkbox onChange={onChange}>
                  需指定人员短信验证码确认后才能查看
                </Checkbox>
              </Form.Item>
              {seeIsConfirm ? (
                <Form.Item
                  name="contactConfirmList"
                  label="指定人员"
                  rules={[{ required: true }]}
                >
                  <Select mode="tags" disabled={disable}>
                    {usersList.map(item => (
                      <Option value={item.userId} key={item.userId}>
                        {item.nickName}
                      </Option>
                    ))}
                  </Select>
                </Form.Item>
              ) : null}
            </Radio.Group>
          </Form.Item>
        </Col>
      </Row>
    </div>
  );
};
const mapStoreToProps = ({ tenderManageStore }: IStoreProps) => ({
  tenderManageStore
});
const mapDispatchToProps = (
  dispatch: (arg0: { type: string; payload: IUsersParams }) => any
) => ({
  getUsersList: (params: IUsersParams) =>
    dispatch({ type: "tenderManageStore/getUsersList", payload: params })
});
export default connect(mapStoreToProps, mapDispatchToProps)(BasicsInfo);
