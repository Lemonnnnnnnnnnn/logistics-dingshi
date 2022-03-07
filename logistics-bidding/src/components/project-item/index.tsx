import React, { useMemo } from "react";
import dayjs from "dayjs";
import {
  IHomePageListRes,
  INoticeProjectItem,
  ITenderNotLoginListResp,
  TenderStatus
} from "../../declares";
import styles from "./index.scss";
import { History } from "history";
import { Row, Col, Popover } from "antd";
import { rendText } from "@/utils/utils";
import { uniqBy } from "lodash";

interface IProps {
  history: History;
  fuzzySearchStr: string;
  data: IHomePageListRes | ITenderNotLoginListResp;
}

const ProjectItem = ({ data, history, fuzzySearchStr }: IProps) => {
  const renderEndTime = useMemo(() => {
    switch (data.tenderStatus) {
      case TenderStatus.InBidding:
        const allEndHours = Math.abs(
          dayjs(data.offerEndTime).diff(dayjs(), "hours")
        ); // 距离截止时间一共多少小时
        return (
          <div className={styles.noticeDateBox}>
            <div className={styles.noticeDate}>
              <span>投标开始时间：</span>
              <span>{dayjs(data.offerStartTime).format("YYYY年MM月DD日")}</span>
            </div>
            <div className={styles.noticeDate}>
              <span>剩余时间：</span>
              <span>
                {allEndHours > 0 ? (
                  <>
                    <span>{allEndHours}</span>小时
                  </>
                ) : (
                  <>
                    <span>
                      {Math.abs(
                        dayjs(data.offerEndTime).diff(dayjs(), "minute")
                      )}
                    </span>
                    分
                  </>
                )}
              </span>
            </div>
          </div>
        );
      case TenderStatus.Prediction:
        return (
          <div className={styles.noticeDateBox}>
            <div className={styles.noticeDate}>
              <span>投标开始时间：</span>
              <span>{dayjs(data.offerStartTime).format("YYYY年MM月DD日")}</span>
            </div>
            <div className={styles.noticeDate}>
              <span>投标结束时间：</span>
              <span>{dayjs(data.offerEndTime).format("YYYY年MM月DD日")}</span>
            </div>
          </div>
        );
      default:
        return (
          <div className={styles.noticeDateBox}>
            <div className={styles.noticeDate}>已截止</div>
          </div>
        );
    }
  }, [data]);
  const renderStatus = useMemo(() => {
    switch (data.tenderStatus) {
      case TenderStatus.InBidding:
        return <span style={{ color: "#14428A" }}>投标中</span>;
      case TenderStatus.Prediction:
        return (
          <span style={{ color: "#00782b" }}>
            {Math.abs(dayjs(data.offerStartTime).diff(dayjs(), "hours")) > 0
              ? "预报中"
              : "即将开始"}
          </span>
        );
      case TenderStatus.BidOpened:
        return <span style={{ color: "#999" }}>已开标</span>;
      case TenderStatus.InBidEvaluation:
        return <span style={{ color: "#00782b" }}>待开标</span>;
      case TenderStatus.Withdrawn:
        return <span style={{ color: "#F4523B" }}>已撤回</span>;
      default:
    }
  }, []);
  return (
    <div
      className={styles.noticeProjectItem}
      onClick={() =>
        history.push(`/notice/noticeDetail?tenderId=${data.tenderId}`)
      }
    >
      <div className={styles.noticeProjectTitle}>
        <div className="text-ellipsis ml-1 mr-1">
          <Popover content={data.tenderTitle}>
            <span
              dangerouslySetInnerHTML={{
                __html: rendText(data.tenderTitle || "", fuzzySearchStr)
              }}
            />
          </Popover>
        </div>
      </div>

      <div className={styles.noticeProjectContent}>
        <h2>
          <div className={styles.noticeItemLabel}>
            {uniqBy(data.tenderNotLoginGoodsResps, "firstCategoryName")?.map(
              item => (
                <div
                  key={item.firstCategoryName}
                  dangerouslySetInnerHTML={{
                    __html: rendText(
                      item.firstCategoryName || "",
                      fuzzySearchStr
                    )
                  }}
                />
              )
            )}
          </div>
          {data.isMultipleWinner ? (
            <img src={require("../../assets/imgs/home/duo@2x.png")} alt="" />
          ) : null}
        </h2>
        {renderEndTime}
        <Row className="ml-1 mr-1 mb-1">
          <Col span={2}>
            <img
              src={require("../../assets/imgs/home/dingwei@2x.png")}
              alt=""
            />
          </Col>
          <Col span={16} className="text-ellipsis ml-1">
            <Popover
              content={data.receivingAddressResolution?.slice(0, 2)?.join("")}
            >
              {data.receivingAddressResolution?.slice(0, 2)?.join("")}
            </Popover>
          </Col>
          <Col span={5} style={{ textAlign: "end" }}>
            {renderStatus}
          </Col>
        </Row>
      </div>
      <div className={styles.noticeProjectItemCompany}>
        <div className={styles.line} />
        <span>{data.tenderOrganizationName}</span>
      </div>
    </div>
  );
};
export default ProjectItem;
