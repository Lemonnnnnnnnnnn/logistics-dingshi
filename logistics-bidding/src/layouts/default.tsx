import * as React from "react";
import zhCN from "antd/lib/locale/zh_CN";
import { History, Location } from "history";
import { ConfigProvider, Layout } from "antd";
import { connect } from "dva";
import Header from "../components/common/header";
import Footer from "../components/common/footer";
import AskModal from "./ask-role-modal";
import HeaderMenu from "../components/common/header-menu";
import "../../node_modules/antd/dist/antd.css";
import styles from "./index.scss";
import { ICommonStoreProps, IStoreProps } from "@/declares";
const { Content } = Layout;
interface IProps {
  history: History;
  location: Location;
  commonStore: ICommonStoreProps;
  getUserInfo: (tokenStr: string) => void;
  getCurrentUserInfo: () => void;
}
class Default extends React.Component<IProps> {
  state = {
    visible: false
  };
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
  setVisible = () => {
    this.setState({ visible: false });
  };
  render() {
    const {
      children,
      history,
      location,
      getUserInfo,
      getCurrentUserInfo
    } = this.props;
    return (
      <Layout className={styles.layout}>
        <ConfigProvider locale={zhCN}>
          <Header location={location} history={history} />
          <HeaderMenu history={history} location={location} />
          <Content>
            <div>{children}</div>
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
export default connect(mapStoreToProps, mapDispatchToProps)(Default);
