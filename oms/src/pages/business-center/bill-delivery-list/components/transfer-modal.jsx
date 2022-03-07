import React, { useState, useEffect } from 'react';
import { Modal, Radio, message, Select, Form, Input } from 'antd';
import { transferTangibleBill } from '../../../../services/billDeliveryService';
import { getProjectDetail } from '../../../../services/apiService';
import styles from './modal.less';

const  TransferModal = ({ transferObj, setTransferObj, form, getData } ) => {
  const showType = form.getFieldValue('transmissionType');
  const [ handoverOrganizationObj, setHandoverOrganizationObj] = useState({ consignmentId: '', consignmentName: '', cargoesId: '', cargoesName: '' });
  useEffect(() => {
    getProjectDetail(transferObj.projectId).then((res) => {
      const { consignmentId, consignmentName, cargoesId, cargoesName } = res;
      setHandoverOrganizationObj({ consignmentId, consignmentName, cargoesId, cargoesName });
    });
  }, []);
  const onOk = () => {
    form.validateFields((err, values) => {
      const { courierNumber, expressCompany, name, phone } = values;
      if (err) {
        return;
      }
      const data = {
        ...values,
        courierNumber : courierNumber || '无',
        expressCompany : expressCompany || '无',
        name : name || '无',
        phone : phone || '无',
        handoverOrganizationName: values.handoverOrganizationId === handoverOrganizationObj.cargoesId ?
          handoverOrganizationObj.cargoesName
          :
          handoverOrganizationObj.consignmentName
      };
      transferTangibleBill(transferObj.tangibleBillId, { ...data }).then(() => {
        message.success('操作成功!');
        getData();
        setTransferObj({ ...transferObj, transferVisible: false });
      });
    });
  };

  return (
    <Modal
      title="转交选择框"
      centered
      visible={transferObj.transferVisible}
      onOk={onOk}
      wrapClassName={styles.modal}
      onCancel={() => setTransferObj({ ...transferObj, transferVisible: false })}
      width={800}
      okText="确认"
    >
      <Form>
        <Form.Item label='实体单据交接方'>
          {form.getFieldDecorator(`handoverOrganizationId`, {
            rules: [
              {
                required: true,
                message: '请选择实体单据交接方!',
              },
            ],
          })(
            <Radio.Group>
              <Radio
                value={handoverOrganizationObj.consignmentId}
                disabled={!handoverOrganizationObj.consignmentName}
              >
                托运方（{handoverOrganizationObj.consignmentName}）
              </Radio>
              <Radio
                value={handoverOrganizationObj.cargoesId}
                disabled={!handoverOrganizationObj.cargoesName}
              >
                货权方（{handoverOrganizationObj.cargoesName ? handoverOrganizationObj.cargoesName : '暂无数据'}）
              </Radio>
            </Radio.Group>
          )}
        </Form.Item>
        <Form.Item label='送达方式'>
          {form.getFieldDecorator(`transmissionType`, {
            rules: [
              {
                required: true,
                message: '请选择送达方式!',
              },
            ],
          })(
            <Select>
              <Select.Option value={1}>
                快递送达
              </Select.Option>
              <Select.Option value={2}>
                公司专人送达
              </Select.Option>
            </Select>)}
        </Form.Item>
        {
          showType === 2 && (
            <>
              <Form.Item label='人员名称'>
                {form.getFieldDecorator(`name`)(<Input />)}
              </Form.Item>
              <Form.Item label='联系方式'>
                {form.getFieldDecorator(`phone`)(<Input />)}
              </Form.Item>
            </>
          )
        }
        {
          showType === 1 && (
            <>
              <Form.Item label='快递公司'>
                {form.getFieldDecorator(`expressCompany`)(<Input />)}
              </Form.Item>
              <Form.Item label='快递单号'>
                {form.getFieldDecorator(`courierNumber`)(<Input />)}
              </Form.Item>
            </>
          )
        }
      </Form>
    </Modal>
  );
};

export default Form.create()(TransferModal);
