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
        return message.error('请把信息填写完整！');
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
          message.success('修改税率配置成功');
          setState({ currentId: '', showModal: false });
          getData();
        });
      } else {
        putTaxRate( { ...omit(values, 'periodTime'), startPeriodTime, endPeriodTime }).then(() => {
          message.success('创建税率配置成功');
          setState({ currentId: '', showModal: false });
          getData();
        });
      }

    });
  };
  return (
    <Modal
      title="添加税率"
      centered
      visible={state.showModal}
      onOk={onOk}
      onCancel={() => setState({ currentId: '', showModal: false })}
      width={1000}
      okText="确定"
    >
      {/* 开发时都改成不是必填项 */}
      <div className={styles.formEdit}>
        <Form>
          <Form.Item label="业务类型">
            {form.getFieldDecorator(`rateBusiness`, {
              rules: [{
                required: true,
                message: "请选择业务类型！"
              }],
            })(
              <Select optionFilterProp="children" showSearch placeholder="请选择业务类型" disabled={!!state.currentId}>
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
          <Form.Item label="税种">
            {form.getFieldDecorator(`taxType`, {
              rules: [{
                required: true,
                message: "请选择税种！"
              }],
            })(
              <Select placeholder="请选择税种" optionFilterProp="children" showSearch disabled={!!state.currentId}>
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
          <Form.Item label="核定征收率（%）" disabled={!!state.currentId}>
            {form.getFieldDecorator(`appraiseLevyRate`, {
              rules: [{
                required: true,
                whitespace: true,
                message: "请输入核定征收率！"
              }],
            })(<Input placeholder="请输入核定征收率" disabled={!!state.currentId} />)}
          </Form.Item>
          <Form.Item label="税率（%）" placeholder="请输入税率" disabled={!!state.currentId}>
            {form.getFieldDecorator(`taxRate`, {
              rules: [{
                required: true,
                whitespace: true,
                message: "请输入税率！"
              }],
            })(<Input placeholder="请输入税率" disabled={!!state.currentId} />)}
          </Form.Item>
          <Form.Item label="应纳税所得额">
            {form.getFieldDecorator(`taxableIncomeOperator`, {
              rules: [{
                required: true,
                // whitespace: true,
                message: "请选择应纳税所得额！"
              }],
            })(
              <Select placeholder="运算符" className="min-width" disabled={!!state.currentId}>
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
                message: "请输入应纳税所得额！"
              }],
            })(
              <Input className="min2-width" placeholder="请输入应纳税所得额" disabled={!!state.currentId} />
            )}
          </Form.Item>
          <Form.Item label="速算扣除数（元/月）">
            {form.getFieldDecorator(`quickCalculationDeduction`, {
              rules: [{
                required: true,
                whitespace: true,
                message: "请输入速算扣除数！"
              }],
            })(<Input placeholder="请输入速算扣除数" disabled={!!state.currentId} />)}
          </Form.Item>
          <Form.Item label="优惠折扣">
            <div style={{ display: 'flex', flexDirection: 'column' }}>
              {form.getFieldDecorator(`preferentialDiscount`, {
                rules: [{
                  required: true,

                  whitespace: true,
                  message: "请输入优惠折扣！"
                }],
              })( <Input placeholder="请输入优惠折扣" disabled={!!state.currentId} /> )}
              <span>（若5折填写为0.5，若无折扣，请填写为1）</span>
            </div>
          </Form.Item>
          <Form.Item label="有效期限">
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
                <Radio value={1}>长期</Radio>
                <Radio value={0}>短期</Radio>
              </Radio.Group>
            )}
          </Form.Item>
          <Form.Item label=" " colon={false}>
            {form.getFieldValue('longTerm') ?
              <div style={{ width: '300px' }}>
                {form.getFieldDecorator(`periodTime`, {
                  rules: [{
                    required: true,
                    message: "请选择有效期限！"
                  }],
                })(<DatePicker className="min2-width" />)} ~ 长期
              </div> :
              form.getFieldDecorator(`periodTime`, {
                rules: [{
                  required: true,
                  message: "请选择有效期限！"
                }],
              })(<RangePicker />)
            }
          </Form.Item>
          <Form.Item label="状态">
            {form.getFieldDecorator(`isAvailable`, {
              initialValue: 1,
            })(
              <Radio.Group>
                <Radio value={1}>启用</Radio>
                <Radio value={0}>禁用</Radio>
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
