import React, { useMemo } from "react";
import dayjs from "dayjs";
import {
  GOODS_UNITS_DICT,
  IHomePageListRes,
  TenderStatus,
} from "../../../../declares";
import { Popover } from 'antd'
import styles from "./index.scss";

interface IProps {
  data: IHomePageListRes;
  history: any;
}

const HomeMenu = ({ data, history }: IProps) => {
  const renderIcon = useMemo(() => {
    switch (data.tenderStatus) {
      case TenderStatus.InBidding:
        return (
          <div className={styles.homeGoodsIcon}>
            <img
              src={require("../../../../assets/imgs/home/toubiaozhong@2x.png")}
              alt=""
            />
            投标中
          </div>
        );
      case TenderStatus.Prediction:
        return (
          <div className={styles.homeGoodsIcon} style={{ color: "#14428A" }}>
            <img
              src={require("../../../../assets/imgs/home/jijiangkaishi@2x.png")}
              alt=""
            />
            即将开始
          </div>
        );
      case TenderStatus.BidOpened:
        return (
          <div className={styles.homeGoodsIcon} style={{ color: "#CCCCCC" }}>
            <img
              src={require("../../../../assets/imgs/home/yikaibiao@2x.png")}
              alt=""
            />
            已开标
          </div>
        );
      case TenderStatus.InBidEvaluation:
        return (
          <div className={styles.homeGoodsIcon} style={{ color: "#D2B221" }}>
            <img
              src={require("../../../../assets/imgs/home/daikaishi@2x.png")}
              alt=""
            />
            待开标
          </div>
        );
      case TenderStatus.Withdrawn:
        return (
          <div className={styles.homeGoodsIcon} style={{ color: "#F4523B" }}>
            <img
              src={require("../../../../assets/imgs/home/yichehui@2x.png")}
              alt=""
            />
            已撤回
          </div>
        );
      default:
    }
  }, [data]);

  const renderDate = useMemo(() => {
    if (data.tenderStatus === TenderStatus.InBidding) {
      return (
        <div className={styles.homeDate}>
          <span>投标截止日期：</span>
          <span>{dayjs(data.offerEndTime).format("YYYY年MM月DD日")}</span>
        </div>
      );
    }
    if (data.tenderStatus === TenderStatus.Prediction) {
      return (
        <div>
          <div className={styles.homeDate}>
            <span>投标开始日期：</span>
            <span>{dayjs(data.offerStartTime).format("YYYY年MM月DD日")}</span>
          </div>
          <div className={styles.homeDate}>
            <span>投标截止日期：</span>
            <span>{dayjs(data.offerEndTime).format("YYYY年MM月DD日")}</span>
          </div>
        </div>
      );
    }
    return (
      <div className={styles.homeDate}>
        <span>已过期</span>
      </div>
    );
  }, [data]);

  const renderDateLastDay = useMemo(
    () => {
      if (data.tenderStatus === TenderStatus.InBidding) {
        return <div style={{ float: 'right' }}>
          {dayjs(data.offerEndTime).diff(dayjs(), "hour") <
            24 ? (
            <span>
              <img
                src={require("../../../../assets/imgs/home/shengyu@2x.png")}
                alt=""
              />
              剩余
              {dayjs(data.offerEndTime).diff(
                dayjs(),
                "minute"
              ) > 60 ? (
                <>
                  <span>
                    {dayjs(data.offerEndTime).diff(
                      dayjs(),
                      "hour"
                    )}
                  </span>
                  小时
                </>
              ) : (
                <>
                  <span>
                    {dayjs(data.offerEndTime).diff(
                      dayjs(),
                      "minute"
                    )}
                  </span>
                  分
                </>
              )}
            </span>
          ) : null}
        </div>
      }
      return null

    },
    [data]
  );

  const renderContent = useMemo(
    () => (
      <div className={styles.homeProjectContent}>
        <h2 className="mb-2">
          <span className="text-large">{data.tenderTitle}</span>
          {data.isMultipleWinner ? (
            <Popover content='可多家中标，运力不够可以投'>
              <img
                src={require("../../../../assets/imgs/home/duo@2x.png")}
                alt=""
              />
            </Popover>
          ) : null}
        </h2>
        <div className={styles.homeGoodsBox}>
          <div>
            <div className={styles.homeGoods}>
              <span>运输货物：</span>
              <div className={styles.homeGoodsFont}>
                {data.tenderNotLoginGoodsResps?.map(item => (
                  <p key={Math.random()}>
                    <span>{item.categoryName}-{item.goodsName}</span>
                    <span className="ml-2">
                      {item.estimateTransportVolume}
                      {GOODS_UNITS_DICT[item.goodsUnit]}
                    </span>
                  </p>
                ))}
              </div>
            </div>
            <div style={{ height: "60px" }}>{renderDate}</div>
          </div>
          {renderIcon}
        </div>

        <div style={{ height: "30px" }}>
          <div className={styles.homeProjectItemAddress}>
            <span>
              <img
                src={require("../../../../assets/imgs/home/dingwei@2x.png")}
                alt=""
              />
              {data.receivingAddressResolution?.slice(0, 2)?.join('')}
            </span>
            {renderDateLastDay}
          </div>
        </div>
      </div>
    ),
    [data]
  );

  return (
    <div
      className={styles.homeProjectItem}
      onClick={() =>
        history.push(`/notice/noticeDetail?tenderId=${data.tenderId}`)
      }
    >
      {renderContent}
      <div className={styles.homeProjectItemCompany}>
        <div className={styles.line} />
        <span>{data.tenderOrganizationName}</span>
      </div>
    </div>
  );
};
export default HomeMenu;
