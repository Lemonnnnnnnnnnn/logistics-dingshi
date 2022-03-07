import { Button, Divider, message, Row } from "antd";
import { History } from "history";
import React, { useMemo, useState } from "react";
import { PageType, TenderStatus } from "@/declares";
import styles from "./index.scss";
import ConfirmModal from "@/components/confirm-modal";
import { ITenderMainDetail } from "@/declares/tender-manage/tenderMainDetail";
import PriceModal from "@/page/tender-manage/input-result/components/price-modal";
import { putPublic } from "@/services/tender-manage-server";
import dayjs from "dayjs";

interface IProps {
  history: History;
  bidEvaluationResults: ITenderMainDetail;
}

const resultHeader: React.FunctionComponent<IProps> = ({
  history,
  bidEvaluationResults
}): JSX.Element => {
  const [visible, setVisible] = useState(false);
  const onPublicTender = () => {
    putPublic(bidEvaluationResults.tenderId).then(res => {
      message.success("公示成功");
      history.push("/tenderManage");
    });
  };

  const renderRight = useMemo(() => {
    if (
      bidEvaluationResults.tenderStatus === TenderStatus.NotPublicized ||
      bidEvaluationResults.tenderStatus === TenderStatus.InBidEvaluation
    ) {
      return (
        <div>
          {/* 如果没有priceConfirmTime字段就证明没有发起过价格确认 */}
          {!bidEvaluationResults.priceConfirmTime ? (
            <Button
              type="primary"
              onClick={() => {
                if (
                  bidEvaluationResults.tenderPackageEntities
                    .filter(item => !item.isAbortive)
                    .every(
                      item =>
                        item.bidderPackageDetailResps.filter(
                          org => org.tenderBidderPackageStatus
                        ).length === 1
                    )
                ) {
                  return message.info(
                    "所有非流标包件的中标人均只有一个或者没有，不能发起价格确认!"
                  );
                }
                setVisible(true);
              }}
            >
              发起价格确认
            </Button>
          ) : null}
          <Button
            type="primary"
            onClick={ConfirmModal(
              "一旦公示，评标结果不可更改和撤回！确认要公示？",
              onPublicTender
            )}
          >
            公示
          </Button>
          <Button
            type="primary"
            onClick={() => {
              history.push({
                pathname: "/tenderManage/inputResult",
                state: {
                  tenderTitle: bidEvaluationResults.tenderTitle,
                  tenderNo: bidEvaluationResults.tenderNo,
                  tenderId: bidEvaluationResults.tenderId,
                  modify: true
                }
              });
            }}
          >
            修改
          </Button>
        </div>
      );
    }
    if (bidEvaluationResults.tenderStatus === TenderStatus.BidOpened) {
      return (
        <div>
          <Button type="primary" disabled>
            已公示
          </Button>
          <Button
            type="primary"
            onClick={() => {
              history.push({
                pathname: "/tenderManage/bidEvaluationResults/resultPrint",
                state: {
                  tenderTitle: bidEvaluationResults.tenderTitle,
                  tenderNo: bidEvaluationResults.tenderNo,
                  tenderId: bidEvaluationResults.tenderId
                }
              });
            }}
          >
            打印
          </Button>
        </div>
      );
    }
    const time =
      bidEvaluationResults.tenderStatus === TenderStatus.PriceSure
        ? bidEvaluationResults.priceConfirmTime
        : bidEvaluationResults.priceTwoTime;
    if (time && dayjs(time).valueOf() > dayjs().valueOf()) {
      const day = Math.abs(dayjs(time).diff(dayjs(), "day")); // 距离结束多少天
      const allHours = Math.abs(dayjs(time).diff(dayjs(), "hours")); // 距离结束一共多少小时
      const allMinutes = Math.abs(dayjs(time).diff(dayjs(), "minute")); // 距离结束一共多少小时
      const hours = allHours - day * 24; // 多少小时
      const minutes = allMinutes - (day * 24 + hours) * 60; // 多少分钟
      return allMinutes > 0 ? (
        <div className={styles.countDown}>
          <span>
            {bidEvaluationResults.tenderStatus === TenderStatus.PriceSure
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
  }, [bidEvaluationResults]);

  return (
    <>
      <div className={styles.commonHeader}>
        <Row justify="space-between">
          <div>
            <span className="text-bold text-large">项目标题：</span>
            <span className="text-large">
              {bidEvaluationResults.tenderTitle}
            </span>
            <span
              className="ml-2"
              style={{ cursor: "pointer", color: "#1890ff" }}
              onClick={() =>
                history.push("/tenderManage/tenderInfo", {
                  pageType: PageType.Detail,
                  tenderId: bidEvaluationResults.tenderId
                })
              }
            >
              查看招标详情
            </span>
            <span
              className="ml-2"
              style={{ cursor: "pointer", color: "#1890ff" }}
              onClick={() =>
                history.push("/tenderManage/lookBiddingInfo", {
                  tenderNo: bidEvaluationResults.tenderNo,
                  tenderTitle: bidEvaluationResults.tenderTitle,
                  tenderId: bidEvaluationResults.tenderId
                })
              }
            >
              查看投标详情
            </span>
          </div>
          <div className={styles.commonHeaderRight}>
            <div>
              <span className="text-bold text-large">项目编号：</span>
              <span className="text-large">
                {bidEvaluationResults.tenderNo}
              </span>
            </div>
            {renderRight}
          </div>
        </Row>
      </div>
      {visible && (
        <PriceModal
          visible={visible}
          history={history}
          setVisible={setVisible}
          tenderId={bidEvaluationResults.tenderId}
        />
      )}

      <Divider className="border-gray" style={{ marginTop: 0 }} />
    </>
  );
};
export default resultHeader;
