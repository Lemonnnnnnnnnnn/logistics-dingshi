import React from "react";
import dayjs from "dayjs";
import NoticeDetailCard from "../notice-detail-card";
import styles from "./index.scss";
import { History } from "history";
import {
  INVOICE_REQUIREMENT_DICT,
  IPublicBidderDetailReqs,
  IUserInfo,
  PAYMENT_TYPE_DICT,
  SETTLEMENT_TYPE_DICT,
  TENDER_TYPE_DICT
} from "@/declares";
import NotLoginRenderText from "@/components/notLoginRender/text";
import ShareLink from "@/page/notice/components/shareLink";

interface IProps {
  history: History;
  noticeDetail: IPublicBidderDetailReqs;
  userInfo: IUserInfo;
  isLogin: boolean;
}

const NoticeDetailHeader: React.FunctionComponent<IProps> = ({
  history,
  noticeDetail,
  userInfo,
  isLogin
}): JSX.Element => {
  return (
    <>
      <div className={styles.noticeDetailHeaderLeft}>
        <h2>{noticeDetail.tenderTitle}</h2>
        <div className={styles.noticeDetailItem}>
          <p className="fontP">
            <span>编号：</span>
            <span>{noticeDetail.tenderNo}</span>
          </p>
          <p className="fontP">
            <span>类型：</span>
            <span>{TENDER_TYPE_DICT[noticeDetail.tenderType]}</span>
          </p>
        </div>
        <div className={styles.noticeDetailItem}>
          <p className="fontP">
            <span>开始时间：</span>
            <span>
              {dayjs(noticeDetail.offerStartTime).format(
                "YYYY年MM月DD日 HH:mm:ss"
              )}
            </span>
          </p>
          <p className="fontP">
            <span>联系人：</span>
            {isLogin ? (
              <span>
                {noticeDetail.contactPurchaseRespList?.[0].contactName}
              </span>
            ) : (
              <NotLoginRenderText />
            )}
          </p>
        </div>
        <div className={styles.noticeDetailItem}>
          <p className="fontP">
            <span>截止时间：</span>
            <span>
              {dayjs(noticeDetail.offerEndTime).format(
                "YYYY年MM月DD日 HH:mm:ss"
              )}
            </span>
          </p>
          <p className="fontP">
            <span>联系电话：</span>
            {isLogin ? (
              <span>
                {noticeDetail.contactPurchaseRespList?.[0].contactPhone}
              </span>
            ) : (
              <NotLoginRenderText />
            )}
          </p>
        </div>
        <div className={styles.noticeDetailItem}>
          <p className="fontP">
            <span>开标日期：</span>
            <span>
              {dayjs(noticeDetail.tenderOpenTime).format(
                "YYYY年MM月DD日 HH:mm:ss"
              )}
            </span>
          </p>
          <p className="fontP">
            <span>发票要求：</span>
            <span>
              {INVOICE_REQUIREMENT_DICT[noticeDetail.invoiceRequirements]}
            </span>
          </p>
        </div>
        <div className={styles.noticeDetailItem}>
          {(noticeDetail.performanceBond && (
            <p className="fontP">
              <span>履约保证金（合同金额占比）：</span>
              <span>{noticeDetail.performanceBond}%</span>
            </p>
          )) ||
            null}
          <p className="fontP">
            <span>结算方式：</span>
            {noticeDetail.settlementType === 1 ? <span>按月结算</span> : null}
            {noticeDetail.settlementType === 2 ? (
              <span>
                {SETTLEMENT_TYPE_DICT[noticeDetail.settlementType]}
                {noticeDetail.settlementTypeContent}天结算
              </span>
            ) : null}
            {noticeDetail.settlementType === 3 ? (
              <span>{noticeDetail.settlementTypeContent}</span>
            ) : null}
          </p>
        </div>
        {noticeDetail.paymentType ? (
          <div className={styles.noticeDetailItem}>
            <p className="fontP">
              <span>支付方式：</span>
              {noticeDetail.paymentType === 1 ||
              noticeDetail.paymentType === 2 ? (
                <span>{PAYMENT_TYPE_DICT[noticeDetail.paymentType]}</span>
              ) : null}
              {(noticeDetail.paymentType === 3 && (
                <span>{noticeDetail.paymentTypeContent}</span>
              )) ||
                null}
            </p>
          </div>
        ) : null}
      </div>
      <div className={styles.noticeDetailHeaderRight}>
        <ShareLink isLogin={isLogin} tenderId={noticeDetail.tenderId} />
        {/*<div className={styles.noticeDetailHeaderShare}>*/}
        {/*  <ShareAltOutlined />*/}
        {/*  分享*/}
        {/*</div>*/}
        <NoticeDetailCard
          userInfo={userInfo}
          noticeDetail={noticeDetail}
          history={history}
          isLogin={isLogin}
        />
      </div>
    </>
  );
};
export default NoticeDetailHeader;
