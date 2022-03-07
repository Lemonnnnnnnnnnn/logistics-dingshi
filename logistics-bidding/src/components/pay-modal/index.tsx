import { message, Modal } from "antd";
import React, { useCallback, useEffect, useMemo, useState } from "react";
import TableX from "../tableX";
import SmsInput from "../sms-input";
import { digitUppercase, formatMoney } from "../../utils/utils";
import styles from "./index.scss";
import { payTenderBidder } from "@/services/bidding-manage-server";
import { getAuthorizationPhone } from "@/services/common";

interface IProps {
  visible: boolean;
  // onOk: () => void;
  columns: any[];
  sumFeeDataSource: any[];
  tenderId: number;
  onCancel: () => void;
}

const PayModal: React.FunctionComponent<IProps> = ({
  visible,
  onCancel,
  tenderId,
  columns,
  sumFeeDataSource = []
}): JSX.Element => {
  const [code, setCode] = useState("");
  const [authorizationPhone, setAuthorizationPhone] = useState("");
  useEffect(() => {
    getAuthorizationPhone().then(({ paymentAuthorizationPhone }) =>
      setAuthorizationPhone(paymentAuthorizationPhone)
    );
  }, []);
  const handleOk = useCallback(() => {
    // onOk();

    const params = {
      smsCode: code,
      phone: String(authorizationPhone),
      tenderId
    };
    payTenderBidder(params).then(() => {
      message.success("支付成功！");
      onCancel();
    });
  }, [code]);

  const subTotal = useMemo(() => {
    return sumFeeDataSource.splice(-1, 1)[0].number;
  }, [sumFeeDataSource]);

  return (
    <Modal
      title="支付"
      visible={visible}
      centered
      onOk={handleOk}
      // confirmLoading={confirmLoading}
      className={styles.payModal}
      width={1000}
      onCancel={onCancel}
    >
      <div>
        <TableX
          loading={false}
          rowKey="id"
          columns={columns}
          dataSource={sumFeeDataSource}
        />
        <div className={styles.payModalPrice}>
          总共支付： ￥{formatMoney(subTotal)}{" "}
          <span>（{digitUppercase(subTotal)}）</span>
        </div>
        {/*<SmsInput mobile={authorizationPhone} code={code} setCode={setCode} />*/}
        <SmsInput
          type="PAYMENT"
          mobile={authorizationPhone}
          code={code}
          template="SMS_189621738"
          setCode={setCode}
        />
      </div>
    </Modal>
  );
};
export default PayModal;
