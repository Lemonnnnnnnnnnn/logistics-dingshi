import React from "react";
import BreadcrumbsBar from "../header-breadcrumb-bar";
import styles from "./index.scss";

const HeaderMenu: React.FunctionComponent = ({ history }: any): JSX.Element => {
  return (
    <div className={`center-main ${styles.breadcrumb}`}>
      <div className={styles.breadcrumbImg}>
        <img src={require("../../../assets/imgs/bg.png")} alt="" />
      </div>
      <div className={styles.breadcrumbList}>
        <BreadcrumbsBar history={history} />
      </div>
    </div>
  );
};

export default HeaderMenu;
