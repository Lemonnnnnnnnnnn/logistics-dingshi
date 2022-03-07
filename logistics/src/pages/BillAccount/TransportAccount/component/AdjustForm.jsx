import React, { useEffect, useState, useCallback, useMemo } from "react";
import { Button, message, notification, Radio } from "antd";
import { Item, Observer, SchemaForm } from "@gem-mine/antd-schema-form";
import TotalPrice from "@/pages/BillAccount/TransportAccount/component/TotalPrice";
import AdjustNumberField from "./AdjustNumberField";
import { accountTransportCost } from '@/utils/account/transport';
import DebounceFormButton from "@/components/DebounceFormButton";
import { modifyTransportCost } from "@/services/apiService";
import {
  DELIVERY_NUMBER,
  HANDLE_INPUT,
  SHIPMENT_TO_CONSIGNMENT_INSTEAD_OF_PLAT,
  SHIPMENT_TO_PLAT,
  SIGN_NUMBER,
  WEIGH_NUMBER
} from "@/constants/account";
import { TRANSPORT_ACCOUNT_LIST_STATUS } from "@/constants/project/project";


const adjustmentLayout = {
  labelCol: {
    xs: { span: 4 }
  },
  wrapperCol: {
    xs: { span: 15 }
  }
};

const textLayout = {
  labelCol: {
    xs: { span: 2 }
  },
  wrapperCol: {
    xs: { span: 10 }
  }
};

const AdjustForm = ({
  accountEntity,
  handleCancelAccount,
  accountOrgType,
  selectedRow,
  adjustData,
  batchAccountModal,
  accountChangeCallback,
  accountTransportId,
  shipmentUnaudited // 本级承运待审核的调账
}) => {
  const [mode, setMode] = useState(shipmentUnaudited ? 4 : 1);
  const [formData, setFormData] = useState(accountEntity);
  const [allowConfirm, setAllowConfirm] = useState(true);

  const modes = useMemo(()=>{
    if (shipmentUnaudited){
      return [{ title: "承运服务费(价差)", key: 4 }];
    }

    if (Number(accountOrgType) === SHIPMENT_TO_PLAT || Number(accountOrgType) === SHIPMENT_TO_CONSIGNMENT_INSTEAD_OF_PLAT){
      return [
        { title: "每单单价", key: 1 },
        { title: "每单总价", key: 2 },
        { title: "每单数量", key: 3 },
        { title: "承运服务费(价差)", key: 4 }
      ];
    }

    return [
      { title: "每单单价", key: 1 },
      { title: "每单总价", key: 2 },
      { title: "每单数量", key: 3 },
    ];


  }, [shipmentUnaudited, accountOrgType]);

  // 获取当前的价格实体，用于填充调价表单
  const adjustList = batchAccountModal ? selectedRow : [adjustData];
  const transportPriceEntities = (adjustList[0].transportPriceEntities || []).find(item => item.transportPriceType === Number(accountOrgType)) || {};

  const adjustmentSchema = useMemo(() => ({
    price: {
      component: "input",
      rules: {
        required: [true, "请输入正确的价格（最多2位小数）"],
        pattern: [/^\d+\.?\d{0,2}$/, "请输入正确的价格（最多2位小数）"]
      },
      placeholder: "请输入价格"
    },
    damageCompensation: {
      component: "input",
      rules: {
        required: [true, "请输入每单货损赔付"],
        pattern: [/^\d+\.?\d{0,2}$/, "请输入数字，最多输入两位小数"]
      },
      visible : !shipmentUnaudited,
      placeholder: "请输入每单货损赔付",
    },
    total: {
      component: TotalPrice,
      value: Observer({
        watch : ["price", "damageCompensation"],
        action: (data) => {
          const price = +(data?.[0]);
          const damageCompensation = +(data?.[1]) || 0;

          if (Number.isNaN(price) || Number.isNaN(damageCompensation)) {
            return;
          }

          switch (mode) {
            case 1 : {
              const totalNum = adjustList.reduce((sum, current)=>{
                sum += current.manualQuantity;
                return sum;
              }, 0);

              return (price * +totalNum - damageCompensation).toFixed(2)._toFixed(2);

            }
            case 2 : {
              return (adjustList.length * price - damageCompensation).toFixed(2)._toFixed(2);
            }
            case 4 : {
              if (batchAccountModal) {
                const transportCost = adjustList.reduce((value, current) => {
                  value += accountTransportCost(current) - current.damageCompensation;
                  return value;
                }, 0);
                return transportCost._toFixed(2);
              }
              const { transportPriceEntities } = adjustList[0];
              const transportPriceEntity = (transportPriceEntities || []).find(item => `${item.transportPriceType}` === `${accountOrgType}`) || {};

              return (accountTransportCost({ transportPriceEntity, ...adjustList[0] }) - damageCompensation)._toFixed(2);

            }
            default :
              break;
          }

        }
      }),
      keepAlive: false
    },
    accountBillNumberRule: {
      component: AdjustNumberField,
      transportPriceEntities
    }
  }), [mode]);

  useEffect(() => {
    const field = {
      1: "freightCost",
      2: "transportCost",
      4: "shipmentDifferenceCharge"
    }[mode];

    const price = accountEntity[field];
    const { measurementSource, manualQuantity } = transportPriceEntities;
    const accountBillNumberRule = {
      measurementSource,
      manualQuantity
    };
    setFormData({ ...formData, price, accountBillNumberRule });
  }, [mode]);

  const accountChangeCheck = (value, mode) => {
    const { accountBillNumberRule = { } } = value;

    if (mode === 3) {
      if (!accountBillNumberRule.measurementSource && !accountBillNumberRule.manualQuantity ) {
        message.error("请选择数量取值规则");
        return false;
      }

      switch (accountBillNumberRule.measurementSource) {
        case DELIVERY_NUMBER : {
          const errorTransport = adjustList.reduce((precious, current)=>{
            const { transportNo, deliveryItems } = current;
            for (let i = 0 ; i < deliveryItems.length ; i ++){
              if (deliveryItems[i].deliveryNum === null) {
                precious.push(transportNo);
                break;
              }
            }
            return precious;
          }, []);
          if (errorTransport.length){
            message.error(`运单 ${errorTransport.join(",")} 没有提货量`);
            return false;
          }
          break;
        }
        case WEIGH_NUMBER : {
          const errorTransport = adjustList.reduce((precious, current)=>{
            const { transportNo, deliveryItems } = current;
            for (let i = 0 ; i < deliveryItems.length ; i ++){
              if (deliveryItems[i].weighNum === null) {
                precious.push(transportNo);
                break;
              }
            }
            return precious;
          }, []);
          if (errorTransport.length){
            message.error(`运单 ${errorTransport.join(",")} 没有过磅量`);
            return false;
          }
          break;
        }
        case SIGN_NUMBER : {
          const errorTransport = adjustList.reduce((precious, current)=>{
            const { transportNo, deliveryItems } = current;
            for (let i = 0 ; i < deliveryItems.length ; i ++){
              if (deliveryItems[i].receivingNum === null) {
                precious.push(transportNo);
                break;
              }
            }
            return precious;
          }, []);
          if (errorTransport.length){
            message.error(`运单 ${errorTransport.join(",")} 没有签收量`);
            return false;
          }
          break;
        }
        // case THREE_NUMBER_MIN :{
        //   break
        // }
        case HANDLE_INPUT : {
          if (!accountBillNumberRule.manualQuantity) {
            message.error("请输入手动输入量");
            return false;
          }
          break;
        }
        default :
          false;
      }
    }

    return true;
  };

  const accountChange = useCallback(value => {
    if (!accountChangeCheck(value, mode)) return;

    const field = {
      1: "freightCost",
      2: "transportCost",
      4: "shipmentDifferenceCharge"
    }[mode];

    let items;

    if (batchAccountModal) {
      const { price, accountBillNumberRule = {  } } = value;
      if (mode === 3) {
        items = selectedRow.map(item => ({
          transportId: item.transportId,
          transportType: item.transportType,
          measurementSource : accountBillNumberRule.measurementSource,
          manualQuantity : accountBillNumberRule.manualQuantity
        }));
      } else {
        items = selectedRow.map(item => ({
          transportId: item.transportId,
          [field]: +price,
          transportType: item.transportType
        }));
      }

    } else {
      const { price, damageCompensation, accountBillNumberRule = { } } = value;
      const { transportId, transportType } = adjustData;
      if (mode === 3) {
        items = [{
          transportId,
          damageCompensation,
          transportType,
          measurementSource : accountBillNumberRule.measurementSource,
          manualQuantity: accountBillNumberRule.manualQuantity,
        }];
      } else {
        items = [{
          transportId,
          [field]: +price,
          damageCompensation : shipmentUnaudited ? undefined : damageCompensation,
          transportType
        }];
      }
    }

    modifyTransportCost({ accountOrgType : +accountOrgType, accountTransportId, priceMode: mode, items, auditShipment : shipmentUnaudited })
      .then(() => {
        setAllowConfirm(true);
        notification.success({
          message: "调账成功",
          description: `账单调账成功`
        });
        accountChangeCallback();

      })
      .catch(() => setAllowConfirm(true));

  }, [mode, shipmentUnaudited]);

  const renderRadio = useCallback(() => (
    <Radio.Group value={mode} onChange={(e) => setMode(e.target.value)}>
      {
        modes.map(item => <Radio value={item.key} key={item.key}>{item.title}</Radio>)
      }
    </Radio.Group>
  ), [mode]);

  const renderForm = useCallback( () => {
    let formElement;
    if (mode === 3) {
      formElement = (
        <>
          <Item {...adjustmentLayout} field="accountBillNumberRule" />
          {
            !batchAccountModal && (
              <>
                <div
                  style={{ height: "40px", lineHeight: "40px", color: "rgba(0, 0, 0, 0.85)", fontWeight: "bold" }}
                >货损赔付
                </div>
                <Item {...adjustmentLayout} field="damageCompensation" />
                <div style={{ height: "20px" }} />
              </>
            )
          }
          <div style={{ paddingRight: "20px", textAlign: "right" }}>
            <Button className="mr-10" onClick={handleCancelAccount}>取消</Button>
            <DebounceFormButton disabled={!allowConfirm} label="保存" type="primary" onClick={accountChange} />
          </div>
        </>
      );
    } else {
      formElement = (
        <>
          <Item {...adjustmentLayout} field="price" />
          {
            !batchAccountModal && !shipmentUnaudited &&  (
            <>
              <div
                style={{ height: "40px", lineHeight: "40px", color: "rgba(0, 0, 0, 0.85)", fontWeight: "bold" }}
              >货损赔付
              </div>
              <Item {...adjustmentLayout} field="damageCompensation" />
              <div style={{ height: "20px" }} />
            </>
            )
          }
          <span>已选择<span style={{ fontWeight: "bold" }}>{adjustList.length}</span>单</span>
          <Item {...textLayout} field="total" />
          <div style={{ paddingRight: "20px", textAlign: "right" }}>
            <Button className="mr-10" onClick={handleCancelAccount}>取消</Button>
            <DebounceFormButton disabled={!allowConfirm} label="保存" type="primary" onClick={accountChange} />
          </div>
        </>
      );
    }

    return formElement;
  }, [mode]);
  return (
    <>
      {renderRadio()}
      <div style={{ height: "20px" }} />
      <SchemaForm layout="vertical" data={formData} schema={adjustmentSchema}>
        {renderForm()}
      </SchemaForm>
    </>
  );
};

export default AdjustForm;
