import * as React from "react";
import zhCN from "antd/lib/locale/zh_CN";
import { History, Location } from "history";
import { ConfigProvider, Layout } from "antd";
import Header from "../components/common/header";
import Exception403 from "../components/exception/403";
import HeaderBreadcrumb from "../components/common/header-breadcrumb";
import Footer from "../components/common/footer";
import AskModal from "./ask-role-modal";
import "../../node_modules/antd/dist/antd.css";
import styles from "./index.scss";
import { ICommonStoreProps, IStoreProps } from "../declares";
import { connect } from "dva";
const { Content } = Layout;
interface IProps {
  history: History;
  commonStore: ICommonStoreProps;
  location: Location;
  routes: any;
  getUserInfo: (tokenStr: string) => void;
  getCurrentUserInfo: () => void;
}
class Other extends React.Component<IProps> {
  componentWillMount() {
    const {
      getCurrentUserInfo,
      getUserInfo,
      commonStore: { currentUserInfo, userInfo }
    } = this.props;
    if (!userInfo.accessToken) {
      localStorage.removeItem("tender_token");
      if (localStorage.getItem("tender_token_str")) {
        getUserInfo(localStorage.getItem("tender_token_str") || "");
      } else if (
        localStorage.getItem("token") &&
        localStorage.getItem("token_storage")
      ) {
        // 托运和平台或承运同时登录起的时候让用户选择登录角色
        this.setState({ visible: true });
      } else if (localStorage.getItem("token")) {
        // 托运登录
        getUserInfo("token");
        if (!currentUserInfo) {
          getCurrentUserInfo();
        }
      } else if (localStorage.getItem("token_storage")) {
        // 承运或平台登录
        getUserInfo("token_storage");
        if (!currentUserInfo) {
          getCurrentUserInfo();
        }
      }
    }
    // 开发的时候打开
    // getUserInfo("token");
  }
  getRouterAuthority = (pathname: string, routeData: any) => {
    let routeAuthority: any[] = [];
    const getAuthority = (key, routes) => {
      routes.map(route => {
        if (route.path === key) {
          routeAuthority = route.authority;
        } else if (route.routes) {
          routeAuthority = getAuthority(key, route.routes);
        }
        return route;
      });
      return routeAuthority;
    };
    return getAuthority(pathname, routeData);
  };
  state = {
    visible: false
  };

  setVisible = () => {
    this.setState({ visible: false });
  };
  render() {
    const {
      children,
      location: { pathname },
      history,
      commonStore: { userInfo },
      getUserInfo,
      getCurrentUserInfo,
      routes
    } = this.props;
    const routerConfig = this.getRouterAuthority(pathname, routes);
    //如果配置了权限就判断有无权限如果没有就默认有权限
    const hasAuthority = routerConfig
      ? routerConfig.find(item => item === userInfo.organizationType)
      : true;
    return (
      <Layout className={styles.layout}>
        <ConfigProvider locale={zhCN}>
          <Header location={location} history={history} />
          {hasAuthority ? <HeaderBreadcrumb history={history} /> : null}

          <Content>
            {hasAuthority ? <div>{children}</div> : <Exception403 />}
          </Content>
          <Footer />
        </ConfigProvider>
        <AskModal
          visible={this.state.visible}
          setVisible={this.setVisible}
          getUserInfo={getUserInfo}
          getCurrentUserInfo={getCurrentUserInfo}
        />
      </Layout>
    );
  }
}
const mapDispatchToProps = (
  dispatch: (arg0: { type: string; payload?: { tokenStr: string } }) => void
) => ({
  getUserInfo: (tokenStr: string) =>
    dispatch({ type: "commonStore/getUserInfo", payload: { tokenStr } }),
  getCurrentUserInfo: () => dispatch({ type: "commonStore/getCurrentUserInfo" })
});
const mapStoreToProps = ({ commonStore }: IStoreProps) => ({
  commonStore
});
export default connect(mapStoreToProps, mapDispatchToProps)(Other);
