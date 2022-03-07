import React, { useEffect } from "react";

const url = '/tender';
const EmployPlatform = ()=>{
  useEffect(()=>{
    window.open(url, "_blank");
    localStorage.removeItem("tender_token_str");
    localStorage.setItem("tender_token_str", "token");
  }, []);

  return (
    <a href={url} target='_blank' rel="noreferrer">打开招标平台</a>
  );
};

export default EmployPlatform;
