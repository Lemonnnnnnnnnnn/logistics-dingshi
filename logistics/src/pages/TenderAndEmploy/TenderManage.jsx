import React, { useEffect } from "react";
import { getUserInfo } from '@/services/user';

const TenderManage = ()=>{
  const userInfo = getUserInfo();
  const url = userInfo.organizationType === 5 ? '/tender/biddingManage' : '/tender/tenderManage';
  useEffect(()=>{
    window.open(url, "_blank");
    localStorage.removeItem("tender_token_str");
    localStorage.setItem("tender_token_str", "token_storage");
  }, []);

  return (
    <a href={url} target='_blank' rel="noreferrer">打开{userInfo.organizationType === 5 ? '投标' : '招标'}管理</a>
  );
};

export default TenderManage;
