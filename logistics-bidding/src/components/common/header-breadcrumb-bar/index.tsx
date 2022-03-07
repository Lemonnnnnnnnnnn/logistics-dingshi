import React from "react";
import { NavLink } from "dva/router";
import withBreadcrumbs from "react-router-breadcrumbs-hoc";
import routes from "../../../router";
import flatten from "../../../utils/flatten";
import { IStoreProps } from "@/declares";
import { connect } from "dva";

const BreadcrumbsBar: React.FunctionComponent = ({
  breadcrumbs,
  homeStore,
  history
}: any): JSX.Element => {
  const newBreaadcrumbs = breadcrumbs.filter(
    (item: { name: string }) => item.name !== "首页"
  );
  return (
    <div>
      <span>位置 &gt; </span>
      <NavLink to="/home" style={{ color: "#1890ff" }}>
        易键达物流招标平台
      </NavLink>
      <i>&nbsp;&gt;&nbsp;</i>
      {newBreaadcrumbs.map(({ match, name, ...other }: any, index: number) => {
        return name ? (
          <span key={match.url}>
            <span
              style={{ cursor: "pointer", color: "#1890ff" }}
              onClick={() => {
                let url = match.url;
                let state = null;
                if (other.location.search) {
                  url = `${match.url}${other.location.search}`;
                } else if (other.location.state && name === "项目招标") {
                  url = `${match.url}?tenderId=${other.location.state.tenderId}`;
                } else if (other.location.state) {
                  state = other.location.state;
                }
                history.push(url, state);
              }}
            >
              {["项目招标", "中标结果公示"].includes(name)
                ? `(${homeStore.noticeTitle})${name}`
                : name}
            </span>
            {index < newBreaadcrumbs.length - 1 && <i>&nbsp;&gt;&nbsp;</i>}
          </span>
        ) : null;
      })}
    </div>
  );
};
const mapStoreToProps = ({ homeStore }: IStoreProps) => ({
  homeStore
});
export default withBreadcrumbs(flatten(routes, "routes"))(
  connect(mapStoreToProps)(BreadcrumbsBar)
);
// noticeTitle
