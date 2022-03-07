import React, { useEffect, useState } from "react";
import styles from "./index.scss";
import { History } from "history";
import {
  IAuthBidderInfo,
  IOrganizationInfo,
  IStoreProps,
  TENDER_TYPE_DICT
} from "@/declares";
import { connect } from "dva";
import ProjectItem from "@/components/project-item";
import { getAuthOrganizationInfo } from "@/services/home";
import ResultDetailContent from "../components/result-detail-content";
import dayjs from "dayjs";

interface ILocation extends Location {
  state: {
    tenderId: number;
    isShowPrice: number;
  };
}

interface IProps extends IStoreProps {
  history: History;
  location: ILocation;
  getAuthBidderInfo: (params: { tenderId: number; isShowPrice: number }) => any;
}

const getAuthBidderInfoType = "homeStore/getAuthBidderInfo";

const ResultDetail: React.FC<IProps> = ({
  history,
  location,
  getAuthBidderInfo,
  homeStore: { authBidderInfo }
}): JSX.Element => {
  const [consignmentOrganization, setconsignmentOrganization] = useState<
    IOrganizationInfo
  >({
    enquiryNumber: 0,
    organizationIconDentryid: "",
    organizationName: "",
    tenderNotLoginListResp: [],
    tenderNumber: 0
  });

  // const isShowPrice = 1;

  useEffect(() => {
    getAuthBidderInfo({
      tenderId: location?.state?.tenderId,
      isShowPrice: location?.state?.isShowPrice
      // isShowPrice
    }).then((data: IAuthBidderInfo) => {
      getAuthOrganizationInfo({
        consignmentOrganizationId: data?.organizationId,
        limit: 10000,
        offset: 0
      }).then(res => setconsignmentOrganization(res));
    });
  }, []);

  // console.log(homeStore);

  const isFull = location?.state?.isShowPrice; // 收否是复杂版
  return (
    <div className={`center-main ${styles.noticeDetail}`}>
      <div className={`wrapBox ${styles.noticeDetailHeader}`}>
        <div style={{ width: "100%" }}>
          <h2>
            {authBidderInfo.tenderTitle}
            {TENDER_TYPE_DICT[authBidderInfo.tenderType]}结果公示
          </h2>
          <div className={styles.noticeDetailItem}>
            <p className="fontP">
              <span>项目名称：</span>
              <span>
                {authBidderInfo.tenderTitle}
                {TENDER_TYPE_DICT[authBidderInfo.tenderType]}
              </span>
            </p>
            <p className="fontP">
              <span>编号：</span>
              <span>{authBidderInfo.tenderNo}</span>
            </p>
          </div>
          <div className={styles.noticeDetailItem}>
            <p className="fontP">
              <span>更新时间：</span>
              <span>
                {dayjs(authBidderInfo.updateTime).format("YYYY-MM-DD HH:mm:ss")}
              </span>
            </p>
            <p className="fontP">
              <span>类型：</span>
              <span>{TENDER_TYPE_DICT[authBidderInfo.tenderType]}</span>
            </p>
          </div>
        </div>
      </div>

      <div className={styles.noticeDetailContent}>
        {!isFull ? (
          <div className={styles.noticeDetailContentLeft}>
            <div className={styles.noticeDetailContentTitle}>
            <span>{authBidderInfo.tenderTitle}</span>
              {authBidderInfo.tenderType === 1 && <span>项目招标评标工作已经结束，中标人已经确定。现将结果公布如下：</span> || null}
              {authBidderInfo.tenderType === 2 && <span>项目询价工作已经结束，现将结果公布如下：</span> || null}
            </div>
            <div className={styles.noticeDetailContentPackage}>
              {authBidderInfo.bidderPackageItems?.map((item, key) => (
                <div key={item.tenderPackageId} style={{ marginTop: 20 }}>
                  <h3>
                    第{key + 1}包 {item.tenderPackageTitle}供应商
                  </h3>
                  {item.bidderOrgItems.map(_item => (
                    <p key={_item.tenderPackageId}>{_item.organizationName}</p>
                  ))}
                </div>
              ))}
            </div>

            <h3>评标说明</h3>
            {authBidderInfo.tenderEvaluationResult}
          </div>
        ) : (
          <ResultDetailContent authBidderInfo={authBidderInfo} />
        )}

        <div className={styles.noticeDetailContentRight}>
          <div className={styles.noticeDetailCompany}>
            <img src={require("../../../assets/imgs/mr.png")} alt="" />
            <div>{consignmentOrganization.organizationName}</div>
            <p>
              <span>询价</span>
              <span>{consignmentOrganization.enquiryNumber}</span>
            </p>
            <p>
              <span>招投标</span>
              <span>{consignmentOrganization.tenderNumber}</span>
            </p>
          </div>
          <div className={styles.noticeDetailCompanyInfo}>
            <ProjectItem
              data={consignmentOrganization.tenderNotLoginListResp}
              history={history}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

const mapStoreToProps = ({ commonStore, homeStore, loading }: IStoreProps) => ({
  commonStore,
  homeStore,
  loading
});

const mapDispatchToProps = (
  dispatch: (arg0: { type: string; payload?: any }) => any
) => ({
  getAuthBidderInfo: (params: { tenderId: number; isShowPrice: number }) =>
    new Promise((resolve, reject) => {
      dispatch({
        type: getAuthBidderInfoType,
        payload: { ...params, resolve }
      });
    })
});

export default connect(mapStoreToProps, mapDispatchToProps)(ResultDetail);
