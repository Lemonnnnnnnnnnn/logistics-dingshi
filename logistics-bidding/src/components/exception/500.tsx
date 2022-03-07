import React from "react";
import Exception from "@/components/exception";
import { Link } from "dva/router";

const Exception500 = () => (
  <Exception
    type="500"
    desc="服务器错误"
    linkElement={Link}
    backText="返回首页"
  />
);

export default Exception500;
