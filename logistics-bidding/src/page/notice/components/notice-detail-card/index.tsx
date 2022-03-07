import React, { useCallback, useMemo, useState } from "react";
import { Button, Modal } from "antd";
import dayjs from "dayjs";
import styles from "./index.scss";
import {
  IPublicBidderDetailReqs,
  IUserInfo,
  OrganizationType,
  SUPPLIER_SCOPE_ENUM,
  TENDER_BIDDER_STATUS_DICT,
  TENDER_BIDDER_STATUS_ENUM,
  TenderStatus,
  BidderStatus
} from "../../../../declares";
import { History } from "history";
import { getLoginUrl } from "@/utils/utils";
import { postTendersRemind } from "@/services/home";
import { CheckCircleOutlined } from "@ant-design/icons";

interface IProps {
  history: History;
  noticeDetail: IPublicBidderDetailReqs;
  userInfo: IUserInfo;
  isLogin: boolean;
}

const NoticeDetailCard: React.FunctionComponent<IProps> = ({
  history,
  noticeDetail,
  userInfo,
  isLogin
}): JSX.Element => {
  const { tenderBidderResps, supplierScope } = noticeDetail;
  const haveBtn = userInfo.organizationType === OrganizationType.SHIPMENT;
  const [remindStatus, setRemindStatus] = useState(false);

  const toLogin = () => {
    window.location.href = getLoginUrl();
  };

  const setRemind = () => {
    if (!isLogin) {
      toLogin();
    } else {
      postTendersRemind(noticeDetail.tenderId).then(() => {
        Modal.success({
          title: "设置成功！将在投标开始当天10：00短信通知您！",
          icon: <CheckCircleOutlined style={{ fontSize: 35 }} />,
          okText: "确认",
          centered: true
        });
        setRemindStatus(true);
      });
    }
  };

  const start = dayjs(noticeDetail.offerStartTime);
  const end = dayjs(noticeDetail.offerEndTime);
  const renderText = useMemo(() => {
    switch (noticeDetail.tenderStatus) {
      case TenderStatus.InBidEvaluation:
        return "待开标 ";
      case TenderStatus.twoPrice:
        return "二次报价";
      case TenderStatus.PriceSure:
        return "价格确认";
      case TenderStatus.NotPublicized:
        return "待开标";
      default:
        return "-";
    }
  }, [noticeDetail.tenderStatus]);

  const onClickBid = useCallback(() => {
    // 未登录进行跳转
    if (!isLogin) {
      return toLogin();
    }

    if (
      supplierScope === SUPPLIER_SCOPE_ENUM.Appoint &&
      !tenderBidderResps?.length
    ) {
      return Modal.info({
        title: "系统提示",

        content: (
          <div>
            <p>抱歉，该项目为指定商家投标项目！</p>
            <p>若没有被邀请，则不能参与！</p>
          </div>
        ),
        centered: true
      });
    }
    return history.push({
      pathname: "/notice/noticeDetail/myDid",
      state: {
        tenderTitle: noticeDetail.tenderTitle,
        tenderId: noticeDetail.tenderId,
        tenderNo: noticeDetail.tenderNo
      }
    });
  }, [noticeDetail, history, isLogin]);

  const onClickViewBidderDetail = useCallback(() => {
    history.push({
      pathname: "/biddingManage/lookBiddingInfo",
      state: {
        tenderTitle: noticeDetail.tenderTitle,
        tenderNo: noticeDetail.tenderNo,
        tenderId: noticeDetail.tenderId
      }
    });
  }, [noticeDetail]);

  const viewBidderDetailBtnRender = useCallback(() => {
    if (!haveBtn) {
      return null;
    }
    return (
      <Button type="primary" onClick={onClickViewBidderDetail}>
        查看投标详情
      </Button>
    );
  }, [noticeDetail]);

  // 已登录  未投标 ： 立即投标
  // 已登录  已投标 ： 投标中 + 查看投标详情
  // 未登录 ： 立即投标

  const renderBidBtn = useMemo(() => {
    const bidding = (
      <div>
        <span style={{ color: "#fff" }}>投标中</span>
        {viewBidderDetailBtnRender()}
      </div>
    );

    const toBid = haveBtn ? (
      <span
        style={{ color: "#f4ea2a", cursor: "pointer" }}
        onClick={onClickBid}
      >
        立即投标
      </span>
    ) : (
      <div>
        <span style={{ color: "#fff" }}>投标中</span>
        {viewBidderDetailBtnRender()}
      </div>
    );

    // if (!haveBtn) {
    //   return null;
    // }
    if (!isLogin) {
      return toBid;
    }
    if (!tenderBidderResps?.length) {
      return toBid;
    } // 没有人投标 -> 当前用户没投过标
    const relateBidderMessage = tenderBidderResps.find(
      bidder => bidder.organizationId === userInfo.organizationId
    ); // 找到相关的投标者信息
    if (!relateBidderMessage) {
      return toBid;
    } // 如果找不到，当前用户没投过标
    if (
      relateBidderMessage.tenderBidderStatus ===
      TENDER_BIDDER_STATUS_ENUM.WaitBidding
    ) {
      return toBid;
    } // 如果是邀标待投， 当前用户没投过标
    return bidding; // 投过标
  }, [noticeDetail, isLogin]);

  const onClickConfirm = useCallback(() => {
    history.push({
      pathname: "/biddingManage/surePrice",
      state: {
        tenderTitle: noticeDetail.tenderTitle,
        tenderNo: noticeDetail.tenderNo,
        tenderId: noticeDetail.tenderId
      }
    });
  }, [noticeDetail]);

  const onClickTwoPrice = useCallback(() => {
    history.push({
      pathname: "/biddingManage/twoOfferPrice",
      state: {
        tenderTitle: noticeDetail.tenderTitle,
        tenderNo: noticeDetail.tenderNo,
        tenderId: noticeDetail.tenderId
      }
    });
  }, [noticeDetail]);

  const twoPriceBtnRender = () => {
    if (!haveBtn) {
      return null;
    }
    if (noticeDetail.tenderStatus === TenderStatus.twoPrice) {
      const bidderList = noticeDetail.tenderBidderResps //  投标者列表
      const currentBidderMessage = bidderList.find(bidder => bidder.organizationId === userInfo.organizationId)
      if (!currentBidderMessage) return null // 如果在投标者列表中找不到当前用户，则没有二次报价资格
      if (currentBidderMessage.tenderBidderStatus === TENDER_BIDDER_STATUS_ENUM.NotBidding) return null // 如果当前投标状态为【未投标】，则没有二次报价资格 

      return (
        <Button
          style={{ backgroundColor: "#00d38a", border: "0" }}
          onClick={onClickTwoPrice}
        >
          立即去报价
        </Button>
      );
    }
  };

  const PriceSureBtnRender = () => {
    if (!haveBtn) {
      return null;
    }

    const tenderBidderResps = noticeDetail?.tenderBidderResps || [];

    // 从投标者信息中筛选出与自身相关的那条投标者信息
    const my_bidderMessage = tenderBidderResps.find(
      bidder => bidder.organizationId === userInfo.organizationId
    );
    if (!my_bidderMessage) {
      return null;
    }

    if (noticeDetail.tenderStatus === TenderStatus.PriceSure) {
      const bidderPackageDetailResps =
        my_bidderMessage?.bidderPackageDetailResps; // 投标包件
      // tslint:disable-next-line:prefer-for-of
      for (let index = 0; index < bidderPackageDetailResps.length; index++) {
        const bidderPackageDetail = bidderPackageDetailResps[index];

        if (
          bidderPackageDetail.bidderOfferEntities.find(
            item => item.offerTimes === 0 && item.offerConfirmation === 0
          )
        ) {
          return (
            <Button
              style={{ backgroundColor: "#00d38a", border: "0" }}
              onClick={onClickConfirm}
            >
              立即去确认
            </Button>
          );
        }
      }
    }
  };

  const renderCard = useMemo(() => {
    const endDay = Math.abs(dayjs(end).diff(dayjs(), "day")); // 距离截止时间多少天
    const allEndHours = Math.abs(dayjs(end).diff(dayjs(), "hours")); // 距离截止时间一共多少小时
    const allEndMinutes = Math.abs(dayjs(end).diff(dayjs(), "minutes")); // 距离截止时间一共多少分钟
    const endHours = allEndHours - endDay * 24; // 多少小时
    const endMinutes = allEndMinutes % 60; // 多少分钟
    switch (noticeDetail.tenderStatus) {
      case TenderStatus.Prediction:
        const allStartday = Math.abs(dayjs(start).diff(dayjs(), "day")); // 距离开始时间多少天
        const allStartHours = Math.abs(dayjs(start).diff(dayjs(), "hours")); // 距离开始时间一共多少小时
        const allStartMinutes = Math.abs(dayjs(start).diff(dayjs(), "minutes")); // 距离截止时间一共多少分钟
        const starthours = allStartHours - allStartday * 24; // 多少小时
        const startMinutes = allStartMinutes % 60; // 多少分钟
        return (
          <div className={styles.noticeDetailHeaderCard}>
            <div>
              <p>距离开始时间还剩</p>
              <span>
                {allStartday > 0
                  ? `${allStartday}天${starthours}小时`
                  : `${starthours}小时${startMinutes}分钟`}
              </span>
            </div>
            <p>
              {dayjs().valueOf() < start.valueOf() && allStartHours < 24 ? (
                <span>即将开始</span>
              ) : (
                <span>预报中</span>
              )}

              {haveBtn ? (
                !remindStatus ? (
                  <span style={{ cursor: "pointer" }} onClick={setRemind}>
                    <img
                      src={require("../../../../assets/imgs/notice/clock.png")}
                      alt=""
                    />
                    设提醒
                  </span>
                ) : (
                  <span style={{ cursor: "pointer", color: "#CCCCCC" }}>
                    <img
                      src={require("../../../../assets/imgs/notice/clock.png")}
                      alt=""
                    />
                    已提醒
                  </span>
                )
              ) : null}
            </p>
          </div>
        );
      case TenderStatus.InBidding:
        return (
          <div
            className={styles.noticeDetailHeaderCard}
            style={{ backgroundColor: "#14428A" }}
          >
            <div>
              <p>距离截止时间还剩</p>
              <span>
                {endDay > 0
                  ? `${endDay}天${endHours}小时`
                  : `${endHours}小时${endMinutes}分钟`}
              </span>
            </div>
            <p className={styles.noticeDetailCardHasButton}>
              {renderBidBtn}
              {/* {bidStatus ? (
                <div>
                  <span style={{ color: "#fff" }}>投标中</span>
                  {viewBidderDetailBtnRender()}
                </div>
              ) : haveBtn ? (
                <span
                  style={{ color: "#f4ea2a", cursor: "pointer" }}
                  onClick={onClickBid}
                >
                  立即投标
                </span>
              ) : null} */}
            </p>
          </div>
        );
      case TenderStatus.BidOpened:
        return (
          <div
            className={styles.noticeDetailHeaderCard}
            style={{ backgroundColor: "#ccc" }}
          >
            <div>
              <img
                src={require("../../../../assets/imgs/notice/end1.png")}
                alt=""
              />
            </div>
            <p className={styles.noticeDetailCardHasButton}>
              <span style={{ color: "#666" }}>已开标</span>
              {viewBidderDetailBtnRender()}
            </p>
          </div>
        );
      case TenderStatus.Withdrawn:
        return (
          <div
            className={styles.noticeDetailHeaderCard}
            style={{ backgroundColor: "#ccc" }}
          >
            <div>
              <img
                src={require("../../../../assets/imgs/notice/end1.png")}
                alt=""
              />
            </div>
            <p className={styles.noticeDetailCardHasButton}>
              <span style={{ color: "#666" }}>已撤回</span>
            </p>
          </div>
        );
      default:
        let showLookDetail = false;
        noticeDetail.tenderBidderResps?.forEach(item => {
          if (
            item.bidderPackageDetailResps.every(
              bidder =>
                bidder.tenderBidderPackageStatus === BidderStatus.PriceSure
            )
          ) {
            showLookDetail = true;
          }
        });
        return (
          <div className={styles.noticeDetailHeaderCard}>
            <div>
              <img
                src={require("../../../../assets/imgs/notice/end.png")}
                alt=""
              />
            </div>
            <p className={styles.noticeDetailCardHasButton}>
              <span>{renderText}</span>
              {twoPriceBtnRender()}
              {PriceSureBtnRender()}
              {!(
                noticeDetail.tenderStatus === TenderStatus.twoPrice ||
                noticeDetail.tenderStatus === TenderStatus.PriceSure
              ) ||
                (showLookDetail && viewBidderDetailBtnRender()) ||
                null}
            </p>
          </div>
        );
    }
  }, [noticeDetail.tenderStatus, remindStatus]);

  return <>{renderCard}</>;
};
export default NoticeDetailCard;
