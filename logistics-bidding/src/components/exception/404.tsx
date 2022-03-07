import React from "react";
import Exception from "@/components/exception";
import { Link } from "dva/router";

const Exception404 = () => (
  <Exception
    type="404"
    desc={"暂无该页面"}
    linkElement={Link}
    backText="返回首页"
  />
);

export default Exception404;
