import { connect } from "dva";
import React, { useEffect, useState } from "react";
import { Location, History } from "history";
import HomeBanner from "./components/home-banner";
import HomeProjectItem from "./components/home-project-item";
import {
  IAuthLastWonTender,
  IHomePageListParams,
  INIT_TENDER_STATUS,
  IStoreProps
} from "../../declares";
import styles from "./index.scss";
import { getAuthLastWonTender } from "@/services/home";
import { uniqBy } from "lodash";

interface IProps extends IStoreProps {
  history: History;
  location: Location;
  getAllCategory: () => void;
  getHomePageListBidding: (params: IHomePageListParams) => void;
  getHomePageListInquiry: (params: IHomePageListParams) => void;
}

const Home: React.FunctionComponent<IProps> = ({
  history,
  homeStore: { categoryList, homePageListBidding, homePageListInquiry },
  getAllCategory,
  getHomePageListBidding,
  getHomePageListInquiry
}): JSX.Element => {
  const [winningBidsList, setWinningBidsList] = useState<IAuthLastWonTender[]>(
    []
  );

  useEffect(() => {
    getAllCategory();
    getHomePageListBidding({
      offset: 0,
      limit: 6,
      tenderType: 1,
      tenderStatusArray: INIT_TENDER_STATUS
    });
    getHomePageListInquiry({
      offset: 0,
      limit: 6,
      tenderType: 2,
      tenderStatusArray: INIT_TENDER_STATUS
    });
    getAuthLastWonTender({ limit: 2, offset: 0 }).then(res => {
      setWinningBidsList(uniqBy(res, "wonTenderOrganizationName"));
    });
  }, []);

  return (
    <div className={styles.home}>
      {/* banner */}
      <HomeBanner history={history} categoryList={categoryList} />

      {/* 公告 */}
      <div className={`center-main ${styles.homeContent}`}>
        <div className={styles.homeNotice}>
          <span>
            <img src={require("../../assets/imgs/home/notice.png")} />
            最新中标公告
          </span>
          {winningBidsList.map(item => (
            <span
              key={item.tenderId}
              onClick={() =>
                history.push({
                  pathname: "result/resultDetail",
                  state: { tenderId: item.tenderId }
                })
              }
            >
              【中标】恭喜{item.wonTenderOrganizationName}
            </span>
          ))}
        </div>
        {homePageListBidding.items.length ? (
          <div className={styles.homeTitle}>
            <span>招标采购</span>
            <span
              onClick={() => history.push("/notice")}
              style={{ cursor: "pointer" }}
            >
              查看更多 &gt;
            </span>
          </div>
        ) : null}
        <div className={styles.homeProjects}>
          {homePageListBidding.items.map(item => (
            <HomeProjectItem
              data={item}
              key={item.tenderId}
              history={history}
            />
          ))}
        </div>
        {homePageListInquiry.items.length ? (
          <div className={styles.homeTitle}>
            <span>询价采购</span>
            {/*<span onClick={() => history.push("/notice")}>查看更多 &gt;</span>*/}
          </div>
        ) : null}
        <div className={styles.homeProjects}>
          {homePageListInquiry.items.map(item => (
            <HomeProjectItem
              data={item}
              key={item.tenderId}
              history={history}
            />
          ))}
        </div>
      </div>
    </div>
  );
};

const mapStoreToProps = ({ commonStore, homeStore }: IStoreProps) => ({
  commonStore,
  homeStore
});

const mapDispatchToProps = (
  dispatch: (arg0: { type: string; payload?: any }) => any
) => ({
  getAllCategory: () =>
    dispatch({
      type: "homeStore/getAllCategory"
    }),
  getHomePageListBidding: (params: IHomePageListParams) =>
    dispatch({
      type: "homeStore/getHomePageListBidding",
      payload: params
    }),
  getHomePageListInquiry: (params: IHomePageListParams) =>
    dispatch({
      type: "homeStore/getHomePageListInquiry",
      payload: params
    })
});

export default connect(mapStoreToProps, mapDispatchToProps)(Home);
