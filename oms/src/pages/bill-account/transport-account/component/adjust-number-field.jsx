import React, { useState, useCallback, useEffect } from 'react';
import { Radio, InputNumber  } from 'antd';
import {
  ACCOUNT_BILL_NUMBER_RULE,
  DELIVERY_NUMBER,
  SIGN_NUMBER,
  THREE_NUMBER_MIN,
  WEIGH_NUMBER,
  HANDLE_INPUT
} from "@/constants/account";


const AdjustNumberField = ({ onChange, transportPriceEntities  }) =>{
  const { measurementSource, manualQuantity } = transportPriceEntities;
  const [inputValue, setInputValue] = useState(manualQuantity);
  const [selectedRadio, setSelectedRadio] = useState(measurementSource);

  useEffect(()=>{
    if (selectedRadio === HANDLE_INPUT){
      onChange({ measurementSource : HANDLE_INPUT, manualQuantity : inputValue });
    } else {
      onChange({ measurementSource : selectedRadio, manualQuantity : undefined });
    }
  }, [selectedRadio, inputValue]);

  const selectRule = (e)=>{
    setSelectedRadio(e.target.value);
  };

  const onHandleInput = (val) =>{
    setInputValue(val);
  };


  return (
    <>
      <div style={{ marginBottom : '1rem' }}>请选择数量取值规则：</div>
      <Radio.Group value={selectedRadio} onChange={selectRule}>
        <Radio style={{ marginBottom : '1rem' }} value={ACCOUNT_BILL_NUMBER_RULE[DELIVERY_NUMBER].val}>{ACCOUNT_BILL_NUMBER_RULE[DELIVERY_NUMBER].text}</Radio>
        <Radio style={{ marginBottom : '1rem' }} value={ACCOUNT_BILL_NUMBER_RULE[WEIGH_NUMBER].val}>{ACCOUNT_BILL_NUMBER_RULE[WEIGH_NUMBER].text}</Radio>
        <Radio style={{ marginBottom : '1rem' }} value={ACCOUNT_BILL_NUMBER_RULE[SIGN_NUMBER].val}>{ACCOUNT_BILL_NUMBER_RULE[SIGN_NUMBER].text}</Radio>
        <Radio style={{ marginBottom : '1rem' }} value={ACCOUNT_BILL_NUMBER_RULE[THREE_NUMBER_MIN].val}>{ACCOUNT_BILL_NUMBER_RULE[THREE_NUMBER_MIN].text}</Radio>
        <Radio style={{ marginBottom : '1rem' }} value={ACCOUNT_BILL_NUMBER_RULE[HANDLE_INPUT].val}>
          <span>{ACCOUNT_BILL_NUMBER_RULE[HANDLE_INPUT].text}</span>
          <InputNumber style={{ marginLeft : '0.5rem' }} min={0} value={inputValue} onChange={onHandleInput} />
        </Radio>
      </Radio.Group>
    </>
  );
};

export default  AdjustNumberField;
