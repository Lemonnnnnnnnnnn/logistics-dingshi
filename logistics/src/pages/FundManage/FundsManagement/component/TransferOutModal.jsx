import React, { useEffect, useState } from "react";
import { Row, Col, Button, Checkbox, message } from "antd";
import { getMonthTaxes, withholdTaxCashOut } from "@/services/apiService";

const CheckboxGroup = Checkbox.Group;
/*
* 财务说这个账号基本不会变，所以可以写死
* */
const payeeAccountName = '福建鼎石科技有限公司';
const payeeAccount = '405274755424';
// const payeeAccount = '4052747554241111';
const bankCode = '104391012008';

const TransferOutModal = ({ onCancel, refresh }) => {
  const [cashOutParams, setCashOutParams] = useState({ payeeAccountName, payeeAccount, bankCode, transferAmount : 0 });
  const [monthTaxesDist, setMonthTaxesDist] = useState({});
  useEffect(() => {
    getMonthTaxes().then(data => {
      const monthTaxesDist = {};
      data.forEach(item=>{
        monthTaxesDist[item.monthDate] = { totalTaxes : item.totalTaxes, remitDetailIdString : item.remitDetailIdString };
      });
      setMonthTaxesDist(monthTaxesDist);
    });
  }, []);

  const onHandleClickTaxCashOut = () => {
    if (cashOutParams.transferAmount === 0){
      return message.error('转出税费为0，请选择转出金额');
    }
    withholdTaxCashOut(cashOutParams)
      .then(() => {
        message.success("操作成功");
        onCancel();
        refresh();
      });
  };

  const onCheckMonth = (monthList) => {
    let transferAmount = 0;
    let remitDetailIdList = [];

    monthList.forEach(item => {
      transferAmount += monthTaxesDist[item].totalTaxes;
      const _remitDetailIdList = monthTaxesDist[item].remitDetailIdString.split(',');
      remitDetailIdList = remitDetailIdList.concat(_remitDetailIdList);
    });

    setCashOutParams({ ...cashOutParams, transferAmount, remitDetailIdList });
  };

  return (
    <div style={{ margin: "0 3rem" }}>
      <div style={{ marginBottom: "1rem" }}>请选择转出金额：</div>
      <CheckboxGroup onChange={onCheckMonth}>
        {
          Object.keys(monthTaxesDist).map(key=>(
            <div key={key} style={{ marginTop : '0.8rem' }}>
              <Checkbox value={key}>
                <span style={{ fontWeight: "bold", fontSize: "1rem" }}>{monthTaxesDist[key].totalTaxes}元 </span>
                <span>{key} 代扣</span>
              </Checkbox>
            </div>
          ))
        }

      </CheckboxGroup>
      <div style={{ marginTop: "1rem" }}>
        <span>转出</span>
        <span style={{ fontSize: "1rem", fontWeight: "bold" }}> {cashOutParams.transferAmount}元</span>
        <span>到如下账户：</span>
      </div>

      <div style={{ marginTop: "1rem" }}>
        <div><span style={{ fontWeight: "bold" }}>开户行：</span>{payeeAccountName}</div>
        <div><span style={{ fontWeight: "bold", marginTop: "0.5rem" }}>账户：</span>{payeeAccount}</div>
      </div>

      <Row type="flex" justify="space-around" style={{ marginTop: "2rem" }}>
        <Button onClick={onHandleClickTaxCashOut} type="primary">确定</Button>
        <Button onClick={onCancel}>取消</Button>
      </Row>
    </div>);
};

export default TransferOutModal;
