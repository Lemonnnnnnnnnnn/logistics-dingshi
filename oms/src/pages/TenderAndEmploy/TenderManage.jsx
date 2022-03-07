import React, { useEffect } from "react";

const url = '/tender/tenderManage';
const TenderManage = ()=>{
  useEffect(()=>{
    window.open(url, "_blank");
    localStorage.removeItem("tender_token_str");
    localStorage.setItem("tender_token_str", "token");
  }, []);

  return (
    <a href={url} target='_blank' rel="noreferrer">打开招标管理</a>
  );
};

export default TenderManage;
