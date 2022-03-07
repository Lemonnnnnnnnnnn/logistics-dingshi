import React, { useMemo, useEffect, useCallback, useState } from "react";
import { Input } from "antd";
import { Location, History } from "history";
import { connect } from "dva";
import { Link } from "dva/router";
import styles from "./index.scss";
import {
  ICommonStoreProps,
  IHomePageListParams,
  IHomeStoreProps,
  IStoreProps,
  OrganizationType
} from "@/declares";
import { getBaseUrl, getLoginUrl } from "@/utils/utils";
import { LogoutOutlined } from "@ant-design/icons";

const { Search } = Input;

interface IProps {
  commonStore: ICommonStoreProps;
  location: Location;
  history: History;
  homeStore: IHomeStoreProps;
  getCurrentUserInfo: () => void;
  setFuzzySearchStr: (store: ICommonStoreProps, text: string) => void;
}

const Header: React.FunctionComponent<IProps> = ({
  commonStore: { currentUserInfo, userInfo, fuzzySearchStr },
  history,
  commonStore,
  setFuzzySearchStr,
  getCurrentUserInfo
}): JSX.Element => {
  const [value, setValue] = useState(fuzzySearchStr);
  const onSearch = e => {
    setFuzzySearchStr(commonStore, e);
    history.push({ pathname: "/notice", state: { fuzzySearchStr: e } });
  };
  useEffect(() => {
    if (!currentUserInfo && localStorage.getItem("tender_token")) {
      getCurrentUserInfo();
    }
  }, [currentUserInfo]);
  const renderTitle = useCallback(() => {
    if (userInfo.organizationType === OrganizationType.SHIPMENT) {
      return (
        <Link to="/biddingManage" style={{ marginRight: "1rem" }}>
          投标管理
        </Link>
      );
    }
    return (
      <Link to="/tenderManage" style={{ marginRight: "1rem" }}>
        招标管理
      </Link>
    );
  }, [userInfo]);
  const str = useMemo(() => {
    switch (userInfo.organizationType) {
      case OrganizationType.SHIPMENT:
        return `你好！${currentUserInfo?.organizationName}`;
      case OrganizationType.PLATFORM:
        return `你好！平台-${currentUserInfo?.nickName}`;
      case OrganizationType.CONSIGNMENT:
        return `托运-${currentUserInfo?.organizationName}-${currentUserInfo?.nickName}`;
      default:
    }
  }, [userInfo, currentUserInfo]);
  // const redirectStr = location.pathname.includes("/tender")
  //   ? location.pathname
  // //   : `/tender${location.pathname}`;
  const redirectStr = "/tender/home";
  return (
    <div>
      <div className={styles.header}>
        <div className={`center-main ${styles.headerContent}`}>
          <div>
            {!localStorage.getItem("tender_token") ? (
              <>
                <a href={getLoginUrl()}>你好！请登录</a>｜
                <a
                  href={`${getBaseUrl()}user/register?redirect=${redirectStr}`}
                >
                  免费注册
                </a>
              </>
            ) : (
              <>{str}</>
            )}
          </div>
          <div>
            {!localStorage.getItem("tender_token") ? (
              <a
                style={{ marginRight: "1rem" }}
                href={`${getBaseUrl()}oms/user/login?redirect=${redirectStr}`}
              >
                发布招标信息
              </a>
            ) : (
              renderTitle()
            )}
            <span>服务热线：400-8888-9999</span>
            {localStorage.getItem("tender_token") ? (
              <span
                style={{ marginLeft: 15 }}
                onClick={() => {
                  const tender_token_str =
                    localStorage.getItem("tender_token_str") || "";
                  localStorage.removeItem("tender_token_str");
                  localStorage.removeItem(tender_token_str);
                  localStorage.removeItem("tender_token");
                  if (tender_token_str === "token") {
                    window.location.replace(
                      `${getBaseUrl()}oms/user/login?redirect=/tender/home`
                    );
                  } else if (tender_token_str === "token_storage") {
                    window.location.replace(
                      `${getBaseUrl()}user/login?redirect=/tender/home`
                    );
                  }
                }}
              >
                <LogoutOutlined />
              </span>
            ) : null}
          </div>
        </div>
      </div>
      <div className={`center-main ${styles.homeSearch}`}>
        <div
          className={styles.homeSearchLogo}
          onClick={() => history.push("/home")}
        >
          <img src={require("../../../assets/imgs/home/homeLogo.png")} alt="" />
          <span>物流招标平台</span>
        </div>
        <div className={styles.homeSearchInput}>
          <Search
            allowClear
            placeholder="请输入采购企业名称\货品名称\项目名称"
            enterButton="搜索"
            size="large"
            onChange={e => {
              setValue(e.target.value);
            }}
            value={value}
            onSearch={onSearch}
          />
        </div>
      </div>
    </div>
  );
};

const mapDispatchToProps = (
  dispatch: (arg0: { type: string; payload?: any }) => void
) => ({
  setFuzzySearchStr: (store: IStoreProps, payload: string) =>
    dispatch({ type: "commonStore/setFuzzySearchStr", store, payload }),
  getCurrentUserInfo: () => dispatch({ type: "commonStore/getCurrentUserInfo" })
});
const mapStoreToProps = ({ commonStore, homeStore }: IStoreProps) => ({
  commonStore,
  homeStore
});
export default connect(mapStoreToProps, mapDispatchToProps)(Header);
