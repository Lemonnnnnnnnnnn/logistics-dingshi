import React, { useEffect, useState } from 'react';
import { Modal, Form, Select, Input, Radio, DatePicker, message } from 'antd';
import moment from 'moment';
import { connect } from 'dva';
import {  omit } from '@/utils/utils';
import { putTaxRate, patchTaxRate, getTaxRateDetail } from '@/services/basicSettingService';
import styles from './TaxRateConfigModal.less';

const { RangePicker } = DatePicker;

const  TaxRateConfigModal = ({
  setState,
  state,
  form,
  dictionaries,
  getData,
} ) => {
  const rateBusinessOptions = dictionaries.items.filter(item => item.dictionaryType === 'rate_business');
  const taxType = dictionaries.items.filter(item => item.dictionaryType === 'tax_type').map(item => ({ key: item.dictionaryCode, value: item.dictionaryCode, label: item.dictionaryName }));
  const operatorOptions = dictionaries.items.filter(item => item.dictionaryType === 'taxable_income_operator');
  const [periodTime, setPeriodTime] = useState();
  useEffect(() => {
    if (state.currentId) {
      getTaxRateDetail(state.currentId).then(res =>{
        const {
          rateBusiness,
          taxType,
          appraiseLevyRate,
          taxRate,
          taxableIncomeOperator,
          taxableIncome,
          quickCalculationDeduction,
          preferentialDiscount,
          startPeriodTime,
          endPeriodTime,
          isAvailable,
          longTerm,
        } = res;
        setPeriodTime(longTerm ? moment(startPeriodTime) : [moment(startPeriodTime), moment(endPeriodTime)]);
        form.setFieldsValue({
          rateBusiness,
          taxType,
          appraiseLevyRate: `${appraiseLevyRate}`,
          taxableIncome,
          taxRate: `${taxRate}`,
          taxableIncomeOperator,
          quickCalculationDeduction: `${quickCalculationDeduction}`,
          preferentialDiscount:  `${preferentialDiscount}`,
          periodTime: longTerm ? moment(startPeriodTime) : [moment(startPeriodTime), moment(endPeriodTime)],
          isAvailable: isAvailable ? 1 : 0,
          longTerm: longTerm ? 1  : 0,
        });
      });
    }
  }, []);
  const onOk = () => {
    form.validateFields((err, values) => {
      if (err) {
        return message.error('???????????????????????????');
      }
      let startPeriodTime;
      let endPeriodTime;
      if (values.longTerm) {
        startPeriodTime = values.periodTime.startOf('day').format();
      } else {
        startPeriodTime = values.periodTime && values.periodTime[0].startOf('day').format();
        endPeriodTime = values.periodTime && values.periodTime[1].endOf('day').format();
      }
      if (state.currentId) {
        patchTaxRate(state.currentId, { ...omit(values, 'periodTime'), startPeriodTime, endPeriodTime }).then(() => {
          message.success('????????????????????????');
          setState({ currentId: '', showModal: false });
          getData();
        });
      } else {
        putTaxRate( { ...omit(values, 'periodTime'), startPeriodTime, endPeriodTime }).then(() => {
          message.success('????????????????????????');
          setState({ currentId: '', showModal: false });
          getData();
        });
      }

    });
  };
  return (
    <Modal
      title="????????????"
      centered
      visible={state.showModal}
      onOk={onOk}
      onCancel={() => setState({ currentId: '', showModal: false })}
      width={1000}
      okText="??????"
    >
      {/* ????????????????????????????????? */}
      <div className={styles.formEdit}>
        <Form>
          <Form.Item label="????????????">
            {form.getFieldDecorator(`rateBusiness`, {
              rules: [{
                required: true,
                message: "????????????????????????"
              }],
            })(
              <Select optionFilterProp="children" showSearch placeholder="?????????????????????" disabled={!!state.currentId}>
                {
                  rateBusinessOptions.length && rateBusinessOptions.map(item => (
                    <Select.Option key={item.dictionaryId} value={item.dictionaryCode}>
                      {item.dictionaryName}
                    </Select.Option>
                  ))
                }
              </Select>
            )}
          </Form.Item>
          <Form.Item label="??????">
            {form.getFieldDecorator(`taxType`, {
              rules: [{
                required: true,
                message: "??????????????????"
              }],
            })(
              <Select placeholder="???????????????" optionFilterProp="children" showSearch disabled={!!state.currentId}>
                {
                  taxType.length && taxType.map(item => (
                    <Select.Option key={item.key} value={item.value}>
                      {item.label}
                    </Select.Option>
                  ))
                }
              </Select>
            )}
          </Form.Item>
          <Form.Item label="??????????????????%???" disabled={!!state.currentId}>
            {form.getFieldDecorator(`appraiseLevyRate`, {
              rules: [{
                required: true,
                whitespace: true,
                message: "???????????????????????????"
              }],
            })(<Input placeholder="????????????????????????" disabled={!!state.currentId} />)}
          </Form.Item>
          <Form.Item label="?????????%???" placeholder="???????????????" disabled={!!state.currentId}>
            {form.getFieldDecorator(`taxRate`, {
              rules: [{
                required: true,
                whitespace: true,
                message: "??????????????????"
              }],
            })(<Input placeholder="???????????????" disabled={!!state.currentId} />)}
          </Form.Item>
          <Form.Item label="??????????????????">
            {form.getFieldDecorator(`taxableIncomeOperator`, {
              rules: [{
                required: true,
                // whitespace: true,
                message: "??????????????????????????????"
              }],
            })(
              <Select placeholder="?????????" className="min-width" disabled={!!state.currentId}>
                {
                  operatorOptions.length && operatorOptions.map(item => (
                    <Select.Option key={item.dictionaryId} value={item.dictionaryCode}>
                      {item.dictionaryName}
                    </Select.Option>
                  ))
                }
              </Select>
            )}
            {form.getFieldDecorator(`taxableIncome`, {
              rules: [{
                required: true,
                // whitespace: true,
                message: "??????????????????????????????"
              }],
            })(
              <Input className="min2-width" placeholder="???????????????????????????" disabled={!!state.currentId} />
            )}
          </Form.Item>
          <Form.Item label="?????????????????????/??????">
            {form.getFieldDecorator(`quickCalculationDeduction`, {
              rules: [{
                required: true,
                whitespace: true,
                message: "???????????????????????????"
              }],
            })(<Input placeholder="????????????????????????" disabled={!!state.currentId} />)}
          </Form.Item>
          <Form.Item label="????????????">
            <div style={{ display: 'flex', flexDirection: 'column' }}>
              {form.getFieldDecorator(`preferentialDiscount`, {
                rules: [{
                  required: true,

                  whitespace: true,
                  message: "????????????????????????"
                }],
              })( <Input placeholder="?????????????????????" disabled={!!state.currentId} /> )}
              <span>??????5????????????0.5??????????????????????????????1???</span>
            </div>
          </Form.Item>
          <Form.Item label="????????????">
            {form.getFieldDecorator(`longTerm`, {
              initialValue: 1,
            })(
              <Radio.Group onChange={(e) => {
                if (e.target.value === 0) {
                  form.setFieldsValue({
                    periodTime: periodTime &&  periodTime.length ? periodTime : [],
                  });
                } else  {
                  form.setFieldsValue({
                    periodTime: !periodTime ? periodTime : undefined,
                  });
                }
              }}
              >
                <Radio value={1}>??????</Radio>
                <Radio value={0}>??????</Radio>
              </Radio.Group>
            )}
          </Form.Item>
          <Form.Item label=" " colon={false}>
            {form.getFieldValue('longTerm') ?
              <div style={{ width: '300px' }}>
                {form.getFieldDecorator(`periodTime`, {
                  rules: [{
                    required: true,
                    message: "????????????????????????"
                  }],
                })(<DatePicker className="min2-width" />)} ~ ??????
              </div> :
              form.getFieldDecorator(`periodTime`, {
                rules: [{
                  required: true,
                  message: "????????????????????????"
                }],
              })(<RangePicker />)
            }
          </Form.Item>
          <Form.Item label="??????">
            {form.getFieldDecorator(`isAvailable`, {
              initialValue: 1,
            })(
              <Radio.Group>
                <Radio value={1}>??????</Radio>
                <Radio value={0}>??????</Radio>
              </Radio.Group>
            )}
          </Form.Item>
        </Form>
      </div>
    </Modal>
  );
};

export default connect(({ basicSettingStore, dictionaries, loading }) => ({
  loading,
  dictionaries,
  ...basicSettingStore,
}))(Form.create()(TaxRateConfigModal));;
