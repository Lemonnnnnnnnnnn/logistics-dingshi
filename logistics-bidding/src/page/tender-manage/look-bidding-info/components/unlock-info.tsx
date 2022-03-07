import React, { useState, useMemo, useEffect, useCallback } from "react";
import { History } from "history";
import TipsModal from "./tips-modal";
import { Button } from "antd";
import styles from "./index.scss";
import ConfirmModal from "../../../../components/confirm-modal";
import UnlockInfoItem from "./unlock-info-item";
import dayjs from "dayjs";
import {
  ICommonStoreProps,
  IContactConfirmEntitiesData,
  IStoreProps,
  ITenderManageStoreProps
} from "@/declares";
import { connect } from "dva";
import { putSendlockSms } from "@/services/tender-manage-server";
interface IProps {
  history: History;
  tenderId: number;
  commonStore: ICommonStoreProps;
  tenderManageStore: ITenderManageStoreProps;
  getBiddingDetail: (tenderId: number) => void;
}
// const expireTime = dayjs().add(15, "minute");
const UnlockInfo: React.FunctionComponent<IProps> = ({
  tenderId,
  history,
  commonStore: { currentUserInfo },
  tenderManageStore: { biddingDetail },
  getBiddingDetail
}): JSX.Element => {
  const [visible, setVisible] = useState(false);
  const [expireTime, setExpireTime] = useState<any>(null);
  const [time, setTime] = useState<number>(0);
  let timer: any = null;
  useEffect(() => {
    const current = biddingDetail
      ? biddingDetail.contactConfirmRespList?.find(
          (item: IContactConfirmEntitiesData) =>
            item.contactId === currentUserInfo?.userId
        )
      : null;
    // 解锁过期时间
    const addExpireTime = dayjs(biddingDetail?.unlockStartTime).add(
      15,
      "minute"
    );
    // 如果当前登录对象在指定验证人员中就可以发起解锁
    if (current) {
      // 如果当前登录对象已解锁且在解锁过期时间内就不用在解锁 否则需要解锁
      if (
        (current.isUnlock && addExpireTime.diff(dayjs(), "second") > 0) ||
        !biddingDetail?.contactConfirmRespList?.every(item => !item.isUnlock)
      ) {
        setVisible(false);
      } else {
        setVisible(true);
      }
    } else {
      setVisible(true);
    }
    if (biddingDetail?.unlockStartTime) {
      setExpireTime(addExpireTime);
    }
  }, [currentUserInfo, biddingDetail]);
  useEffect(() => {
    if (
      (expireTime && expireTime.diff(dayjs(), "second") > 0) ||
      !biddingDetail?.contactConfirmRespList?.some(item => !item.isUnlock)
    ) {
      timer = setInterval(() => {
        let second;
        if (biddingDetail?.unlockStartTime) {
          second = Math.abs(dayjs().diff(expireTime, "second"));
        } else {
          second = Math.abs(dayjs().diff(expireTime, "second"));
        }
        setTime(second);
        if (second < 1 && timer) {
          clearInterval(timer);
        }
      }, 1000);
      const current = biddingDetail
        ? biddingDetail.contactConfirmRespList?.find(
            (item: IContactConfirmEntitiesData) =>
              item.contactId === currentUserInfo?.userId
          )
        : null;
      if (current?.isUnlock && expireTime?.diff(dayjs(), "second") > 0) {
        setVisible(false);
      } else {
        clearInterval(timer);
      }
    } else {
      setVisible(true);
      clearInterval(timer);
    }
    return () => {
      clearInterval(timer);
    };
  }, [time, expireTime, biddingDetail]);
  const renderTime = useMemo(() => {
    const hours = Math.floor(time / 3600);
    const minute = Math.floor((time - hours * 3600) / 60);
    const second = time - (minute * 60 + hours * 3600);
    const hoursStr =
      hours < 10 ? (hours > 0 ? `0${hours}小时` : "") : `${hours}小时`;
    const minuteStr =
      minute < 10 ? (minute > 0 ? `0${minute}分` : "") : `${minute}分`;
    const secondStr = second < 10 ? `0${second}` : second;
    return `${hoursStr}${minuteStr}${secondStr}秒`;
  }, [time]);
  const onDelete = useCallback(() => {
    putSendlockSms(tenderId);
    setVisible(true);
  }, [tenderId]);
  return (
    <div className={styles.unlockInfo}>
      <div className={styles.unlockInfoTitle}>
        <span>
          该项目设置了[需指定人员短信验证码确认后才能查看]，解锁进度如下：
        </span>
        <div>
          <Button type="primary" onClick={() => getBiddingDetail(tenderId)}>
            刷新
          </Button>
          <Button onClick={() => history.push("/tenderManage")}>取消</Button>
        </div>
      </div>
      {!visible && expireTime ? (
        <>
          <div className={styles.unlockInfoTitle}>
            本轮解锁剩余时间：{renderTime}
          </div>
          {expireTime.diff(dayjs(), "second") > 0 && biddingDetail?.contactConfirmRespList?.length ? (
            biddingDetail.contactConfirmRespList.map(item => (
              <UnlockInfoItem
                data={item}
                tenderId={tenderId}
                key={item.contactId}
                unlockStartTime={biddingDetail?.unlockStartTime || ""}
                getBiddingDetail={getBiddingDetail}
              />
            ))
          ) : (
            <div>
              本轮解锁未成功！若要再次解锁，请
              <span
                style={{
                  color: "#1890ff",
                  cursor: "pointer",
                  marginLeft: "5px"
                }}
                onClick={ConfirmModal(
                  "新一轮解锁开启成功！请在15分钟内输入完毕所有的验证码！",
                  onDelete
                )}
              >
                点击
              </span>
            </div>
          )}
        </>
      ) : null}

      {visible ? (
        <TipsModal
          visible={visible}
          history={history}
          setVisible={setVisible}
          tenderId={tenderId}
          expireTime={expireTime && expireTime.diff(dayjs(), "second") > 0}
        />
      ) : null}
    </div>
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
export default connect(mapStoreToProps, mapDispatchToProps)(UnlockInfo);
