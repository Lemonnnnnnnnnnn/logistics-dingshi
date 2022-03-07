import React, { useEffect, useState } from "react";
import NoticeDetailHeader from "../components/notice-detail-header";
import NoticeDetailContent from "../components/notice-detail-content";
import styles from "./index.scss";
import { History } from "history";
import {
  IStoreProps,
  INoticeDetailParams,
  IPublicBidderDetailReqs,
  IOrganizationInfo
} from "@/declares";
import { connect } from "dva";
import { jqueryUrl } from "@/utils/utils";
import { getAuthOrganizationInfo } from "@/services/home";
import ProjectItem from "../../../components/project-item";
import { Spin } from 'antd'

// interface ILocation extends Location {
//   state: {
//     tenderId: number;
//   };
// }

interface IProps extends IStoreProps {
  history: History;
  location: Location;
  getNoticeDetail: (params: INoticeDetailParams) => any;
}

const getNoticeDetailType = "homeStore/getNoticeDetail";

const NoticeDetail: React.FC<IProps> = ({
  history,
  location,
  getNoticeDetail,
  commonStore: { userInfo },
  homeStore: { noticeDetail }
}): JSX.Element => {
  // const [ready, setReady] = useState(false);
  const isLogin = !!userInfo.accessToken;
  const [consignmentOrganization, setconsignmentOrganization] = useState<
    IOrganizationInfo
  >({
    enquiryNumber: 0,
    organizationIconDentryid: "",
    organizationName: "",
    tenderNotLoginListResp: [],
    tenderNumber: 0
  });
  const [ready, setReady] = useState(false);
  const urlParams = jqueryUrl(location.search);

  useEffect(() => {
    const params = {
      tenderId: urlParams.tenderId,
      login: isLogin,
      sysCode: urlParams.sysCode
    };

    getNoticeDetail(params).then((data: IPublicBidderDetailReqs) => {
      setReady(true);
      getAuthOrganizationInfo({
        consignmentOrganizationId: data?.organizationId,
        limit: 10000,
        offset: 0,
        currentTenderId :params.tenderId
      }).then(res => setconsignmentOrganization(res));
    });
  }, []);

  return (
    <Spin tip="Loading..." spinning={!ready}>
      <div className={`center-main ${styles.noticeDetail}`}>
        <div className={`wrapBox ${styles.noticeDetailHeader}`}>
          {ready ? (
            <NoticeDetailHeader
              userInfo={userInfo}
              noticeDetail={noticeDetail}
              history={history}
              isLogin={isLogin}
            />
          ) : null}
        </div>

        <div className={styles.noticeDetailContent}>
          {ready ? (
            <NoticeDetailContent
              userInfo={userInfo}
              noticeDetail={noticeDetail}
              history={history}
              isLogin={isLogin}
            />
          ) : null}

          <div className={styles.noticeDetailContentRight}>
            <div className={styles.noticeDetailCompany}>
              <img src={require("../../../assets/imgs/company.png")} alt="" />
              <div>{noticeDetail.organizationName}</div>
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
    </Spin>
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
  getNoticeDetail: (params: INoticeDetailParams) =>
    new Promise((resolve, reject) => {
      dispatch({
        type: getNoticeDetailType,
        payload: { ...params, resolve }
      });
    })
});

export default connect(mapStoreToProps, mapDispatchToProps)(NoticeDetail);
