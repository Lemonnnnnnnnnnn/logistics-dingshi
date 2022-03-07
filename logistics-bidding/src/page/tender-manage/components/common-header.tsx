import { Button, Divider, Row } from "antd";
import { History } from "history";
import React, { useMemo } from "react";
import {
  ICommonStoreProps,
  IStoreProps,
  OrganizationType,
  PageType,
  TenderStatus
} from "@/declares";
import styles from "./index.scss";
import dayjs from "dayjs";
import { connect } from "dva";

interface IProps {
  tenderNo: string;
  tenderId: number;
  tenderTitle: string;
  history: any;
  goLook?: boolean;
  showRight?: boolean;
  showButton?: boolean;
  tenderStatus?: number;
  showLink?: boolean;
  commonStore: ICommonStoreProps;
  priceConfirmTime?: string;
}

const CommonHeader: React.FunctionComponent<IProps> = ({
  tenderId,
  tenderNo,
  goLook,
  history,
  tenderTitle,
  tenderStatus,
  showRight,
  priceConfirmTime,
  commonStore: { userInfo },
  showLink = true
}): JSX.Element => {
  const renderRight = useMemo(() => {
    if (tenderStatus) {
      if (
        priceConfirmTime &&
        dayjs(priceConfirmTime).valueOf() > dayjs().valueOf()
      ) {
        const day = Math.abs(dayjs(priceConfirmTime).diff(dayjs(), "day")); // 距离开始时间多少天
        const allHours = Math.abs(
          dayjs(priceConfirmTime).diff(dayjs(), "hours")
        ); // 距离结束一共多少小时
        const allMinutes = Math.abs(
          dayjs(priceConfirmTime).diff(dayjs(), "minute")
        ); // 距离结束一共多少小时
        const hours = allHours - day * 24; // 多少小时
        const minutes = allMinutes - (day * 24 + hours) * 60; // 多少分钟
        return allMinutes > 0 ? (
          <div className={styles.countDown}>
            <span>
              {tenderStatus === TenderStatus.PriceSure
                ? "价格确认倒计时： "
                : "二次报价倒计时："}
            </span>
            <span>
              {day > 0
                ? `${day}天${hours}小时${minutes}分钟`
                : hours > 0
                ? `${hours}小时${minutes}分钟`
                : minutes > 0
                ? `${minutes}分钟`
                : ""}
            </span>
          </div>
        ) : null;
      }
    }
  }, [priceConfirmTime, tenderStatus]);
  return (
    <>
      <div className={styles.commonHeader}>
        <Row justify="space-between">
          <div>
            <span className="text-bold text-large">项目标题：</span>
            <span className="text-large">{tenderTitle}</span>
            {showLink ? (
              <span
                className="ml-2"
                style={{ cursor: "pointer", color: "#1890ff" }}
                onClick={() =>
                  history.push(
                    userInfo.organizationType === OrganizationType.SHIPMENT
                      ? `/notice/noticeDetail?tenderId=${tenderId}`
                      : "/tenderManage/tenderInfo",
                    {
                      pageType: PageType.Detail,
                      tenderId
                    }
                  )
                }
              >
                {userInfo.organizationType === OrganizationType.SHIPMENT
                  ? "查看投标详情"
                  : "查看招标详情"}
              </span>
            ) : null}
            {goLook ? (
              <span
                className="ml-2"
                style={{ cursor: "pointer", color: "#1890ff" }}
                onClick={() =>
                  history.push("/tenderManage/lookBiddingInfo", {
                    tenderNo,
                    tenderTitle,
                    tenderId
                  })
                }
              >
                查看招标投标信息
              </span>
            ) : null}
          </div>
          <div className={styles.commonHeaderRight}>
            <div>
              <span className="text-bold text-large">项目编号：</span>
              <span className="text-large">{tenderNo}</span>
            </div>
            {showRight ? renderRight : null}
          </div>
        </Row>
      </div>

      <Divider className="border-gray" style={{ marginTop: 0 }} />
    </>
  );
};

const mapStoreToProps = ({ commonStore }: IStoreProps) => ({
  commonStore
});

export default connect(mapStoreToProps)(CommonHeader);
