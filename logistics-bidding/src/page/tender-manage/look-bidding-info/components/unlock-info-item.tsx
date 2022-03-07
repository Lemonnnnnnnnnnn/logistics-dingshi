import React, { useState, useCallback } from "react";
import { Button, message } from "antd";
import styles from "./index.scss";
import SmsInput from "@/components/sms-input";
import { IContactConfirmEntitiesData } from "@/declares";
import { putUnlockSms } from "@/services/tender-manage-server";
import { renderPhone } from "@/utils/utils";
interface IProps {
  data: IContactConfirmEntitiesData;
  unlockStartTime: string;
  tenderId: number;
  getBiddingDetail: (tenderId: number) => void;
}
const UnlockInfoItem: React.FunctionComponent<IProps> = ({
  data,
  tenderId,
  getBiddingDetail,
  unlockStartTime
}): JSX.Element => {
  const [code, setCode] = useState("");
  const handleOk = useCallback(() => {
    if (code) {
      putUnlockSms(tenderId, data.contactPhone, code).then(() => {
        message.success("解锁成功！");
        getBiddingDetail(tenderId);
      });
    } else {
      message.info("请输入验证码!");
    }
  }, [code]);
  return (
    <div className={styles.unlockInfoItem}>
      <span>{data.contactName}</span>
      <span>{data.contactPhone ? renderPhone(data.contactPhone) : "--"}</span>
      {data.isUnlock ? (
        <span>已解锁</span>
      ) : (
        <>
          <Button type="primary" onClick={handleOk}>
            解锁
          </Button>
          <SmsInput
            code={code}
            submitMobile={data.contactPhone}
            setCode={setCode}
            template={"SMS_231451177"}
            startTime={unlockStartTime}
            localStorageKey={`${data.contactId}Time`}
          />
        </>
      )}
    </div>
  );
};
export default UnlockInfoItem;
