import React, { useCallback, useEffect } from "react";
import { connect } from "dva";
import { Menu } from "antd";
import { Location, History } from "history";
import styles from "./index.scss";
import { ICommonStoreProps, IStoreProps } from "../../../declares";

interface IProps {
  history: History;
  location: Location;
  commonStore: ICommonStoreProps;
  setCurrentMenu: (store: ICommonStoreProps, text: string) => void;
}

const HeaderMenu: React.FunctionComponent<IProps> = ({
  location,
  history,
  commonStore,
  setCurrentMenu
}): JSX.Element => {
  const menuList = [
    {
      title: "首页",
      key: "home"
    },
    {
      title: "招标公告",
      key: "notice"
    },
    {
      title: "中标结果",
      key: "result"
    },
    {
      title: "易键达简介",
      key: "introduction"
    }
  ];
  useEffect(() => {
    const path = menuList.find(
      item => item.key === location.pathname.split("/")[1]
    );
    if (path && commonStore.currentMenuKey !== path.key) {
      setCurrentMenu(commonStore, path.key);
    }
  }, [location]);
  const handleClick = useCallback(val => {
    if (val.key === "introduction") {
      window.open("http://www.dingshikj.com/");
    } else {
      setCurrentMenu(commonStore, val.key);
      history.push(`${val.key}`);
    }
  }, []);
  return (
    <div className={`center-main ${styles.homeNav}`}>
      <Menu
        onClick={handleClick}
        selectedKeys={[commonStore.currentMenuKey]}
        mode="horizontal"
      >
        {menuList.map(item => (
          <Menu.Item key={item.key}>{item.title}</Menu.Item>
        ))}
      </Menu>
    </div>
  );
};
const mapDispatchToProps = (
  dispatch: (arg0: {
    type: string;
    store: IStoreProps;
    payload: string;
  }) => void
) => ({
  setCurrentMenu: (store: IStoreProps, payload: string) =>
    dispatch({ type: "commonStore/setCurrentMenu", store, payload })
});
const mapStoreToProps = ({ commonStore }: IStoreProps) => ({
  commonStore
});

export default connect(mapStoreToProps, mapDispatchToProps)(HeaderMenu);
