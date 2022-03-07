import React from "react";
import styles from "./index.scss";

const Footer: React.FunctionComponent = (): JSX.Element => {
  return (
    <div className={styles.footer}>
      <p>
        Copyright © {new Date().getFullYear()} 鼎石科技有限公司 | 闽ICP备17029994号| ICP资格证书： 闽B2-20200286 | 道路运输经营许可证：闽交管许可岚字 3589000200036号 网络货运资格 版本号：#GIT_VERSION
      </p>
    </div>
  );
};
export default Footer;
