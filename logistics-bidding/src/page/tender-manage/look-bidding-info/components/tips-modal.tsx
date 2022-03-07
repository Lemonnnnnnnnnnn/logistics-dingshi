import React, { useCallback, useState, useEffect } from "react";
import { connect } from "dva";
import { message, Modal } from "antd";
import { History } from "history";
import SmsInput from "../../../../components/sms-input";
import { putSendlockSms, putUnlockSms } from "@/services/tender-manage-server";
import styles from "./index.scss";
import dayjs from "dayjs";
import {
  IStoreProps,
  ICommonStoreProps,
  ITenderManageStoreProps
} from "@/declares";
import { AntTreeNodeSelectedEvent } from "antd/lib/tree";

interface IProps {
  visible: boolean;
  tenderId: number;
  history: History;
  commonStore: ICommonStoreProps;
  getBiddingDetail: (tenderId: number) => void;
  tenderManageStore: ITenderManageStoreProps;
  setVisible: (bool: boolean) => void;
  expireTime: any;
}
const TipsModal: React.FunctionComponent<IProps> = ({
  visible,
  tenderId,
  history,
  getBiddingDetail,
  expireTime,
  tenderManageStore: { biddingDetail },
  commonStore: { currentUserInfo },
  setVisible
}): JSX.Element => {
  const [code, setCode] = useState("");
  const [showCode, setShowCode] = useState(false);
  useEffect(() => {
    if (biddingDetail && currentUserInfo) {
      const bool =
        biddingDetail.contactConfirmRespList?.some(
          item => item.contactId === currentUserInfo?.userId
        ) || false;
      setShowCode(bool);
    }
  }, [biddingDetail]);
  const sendSms = () => putSendlockSms(tenderId);
  const handleOk = useCallback(() => {
    if (showCode) {
      if (code) {
        putUnlockSms(
          tenderId,
          currentUserInfo ? currentUserInfo.phone : "",
          code
        ).then(() => {
          message.success("身份验证成功！");
          setVisible(false);
          getBiddingDetail(tenderId);
        });
      }
    } else {
      setVisible(false);
      history.push("/tenderManage");
    }
  }, [visible, code]);
  return (
    <Modal
      title="系统提示"
      visible={visible}
      centered
      onOk={handleOk}
      className={styles.payModal}
      width={540}
      onCancel={() => {
        setVisible(false);
        history.push("/tenderManage");
      }}
    >
      {showCode ? (
        <div>
          <p style={{ paddingLeft: "20px" }}>请进行开标身份验证：</p>
          <SmsInput
            mobile={currentUserInfo ? currentUserInfo.phone : ""}
            code={code}
            setCode={setCode}
            sendSms={
              biddingDetail?.contactConfirmRespList?.every(
                item => !item.isUnlock
              ) || !expireTime
                ? sendSms
                : undefined
            }
            localStorageKey="unLockCode"
            startTime={biddingDetail?.unlockStartTime || undefined}
            template={"SMS_231451177"}
          />
        </div>
      ) : (
        <div>该页面尚未解锁，请解锁后再查看</div>
      )}
    </Modal>
  );
};
const mapStoreToProps = ({ commonStore, tenderManageStore }: IStoreProps) => ({
  commonStore,
  tenderManageStore
});
const mapDispatchToProps = (
  dispatch: (arg0: { type: string; payload: { tenderId: number } }) => any
) => ({
  getBiddingDetail: (tenderId: number) =>
    dispatch({
      type: "tenderManageStore/getBiddingDetail",
      payload: { tenderId }
    })
});
export default connect(mapStoreToProps, mapDispatchToProps)(TipsModal);
