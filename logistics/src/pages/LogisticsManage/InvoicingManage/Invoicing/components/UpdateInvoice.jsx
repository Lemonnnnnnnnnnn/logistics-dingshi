import React, { useEffect, useState } from 'react';
import { Modal, Form, Input, notification, message } from 'antd';
import { INVOICES_LIST_STATE } from '../../../../../constants/project/project';
import UploadFile from '../../../../../components/Upload/UploadFile';
import { patchInvoice, updateInvoiceInfo } from "../../../../../services/apiService";
import { pick, omit, compact } from '../../../../../utils/utils';
import styles from './InvoicingList.less';

const UpdateInvoice = ({
  expressVisible,
  expressFormHandleCancel,
  invoiceCorrelationEntityList,
  expressFormData,
  modalType,
  refresh,
  patchInvoiceId,
  form,
}) => {

  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (modalType === 'update' && invoiceCorrelationEntityList) {
      const data = invoiceCorrelationEntityList.map(item => pick(item, ['invoiceNo', 'actualInvoiceAmount', 'expressNo', 'expressCompany', 'invoiceDentryid', 'invoiceCorrelationId']));
      form.setFieldsValue({
        item: data.map(item => (omit({ ...item, uploadFile: [item.invoiceDentryid], actualInvoiceAmount: item.actualInvoiceAmount.toString() }, ['invoiceDentryid']))),
      });
    }
  }, [modalType]);

  const onOk = () => {
    form.validateFields((err, arr) => {
      if (err) {
        return message.error('请把信息填写完整！');
      }
      if (modalType === 'add') {
        const data = arr.item.map(item => {
          const invoiceDentryid = item.uploadFile[0];
          const values = { ...item, invoiceDentryid };
          delete values.uploadFile;
          const { hadSended, shouldInvoiceAmount } = expressFormData;
          if ((Number(hadSended) + Number(item.actualInvoiceAmount)).toFixed(2) === Number(shouldInvoiceAmount)) {
            values.invoiceState = INVOICES_LIST_STATE.DONE;
          } else {
            values.invoiceState = INVOICES_LIST_STATE.PARTIALLY_DONE;
          }
          return {
            ...values,
          };
        });
        setLoading(true);
        patchInvoice(patchInvoiceId, data[0]).then(() => {
          notification.success({
            message: '开出成功',
            description: '已成功提交开票信息',
          });
          setLoading(false);
          expressFormHandleCancel();
          refresh();
        }).catch(() => {
          setLoading(false);
        });

      } else {
        // const arr = form.getFieldsValue();
        const data = arr.item.map(item => {
          const invoiceDentryid = item.uploadFile[0];
          const values = { ...item, invoiceDentryid, actualInvoiceAmount: Number(item.actualInvoiceAmount) };
          delete values.uploadFile;
          return {
            ...values,
          };
        });
        updateInvoiceInfo(patchInvoiceId, data).then(() => {
          notification.success({
            message: '修改成功',
            description: '已成功提交修改后的发票信息',
          });
          expressFormHandleCancel();
          refresh();
        });
      }


    });
  };
  const validator = (rule, value, callback) => {
    if (!/^\d+\.?\d{0,2}$/.test(value) && !value) callback('请正确输入开票金额!   (最高支持两位小数)');
    if (value <= 0) callback('请正确输入开票金额!   (最高支持两位小数)');
    const { hadSended, shouldInvoiceAmount } = expressFormData;
    if (Number(value) > (Number(shouldInvoiceAmount) - Number(hadSended)).toFixed(2)) {
      callback('开票金额超出剩余可开票金额');
    }
    callback();
  };
  const validatorImg = (rule, value, callback) => {
    if (compact(value).length) {
      callback();
    } else {
      callback('请上传发票！');
    }
  };
  return (
    <Modal
      title={modalType === 'add' ? "已开出" : "修改发票信息"}
      destroyOnClose
      maskClosable={false}
      visible={expressVisible}
      onOk={onOk}
      confirmLoading={loading}
      onCancel={expressFormHandleCancel}
      width={700}
    >
      {/* 开发时都改成不是必填项 */}
      <div className={styles.formEdit}>
        <Form>
          {modalType === 'add' ?
            (
              <>
                <Form.Item label="发票号码">
                  {form.getFieldDecorator(`item[0].invoiceNo`, {
                    rules: [{
                      required: true,
                      whitespace: true,
                      message: "请输入发票号码！"
                    }],
                  })(<Input placeholder="请输入发票号码" />)}
                </Form.Item>
                <Form.Item label="开票金额">
                  {form.getFieldDecorator(`item[0].actualInvoiceAmount`, {
                    rules: [{
                      required: true,
                      whitespace: true,
                      message: "请输入开票金额！",
                    }, { validator }],
                  })(<Input placeholder="请输入开票金额" />)}
                </Form.Item>
                <Form.Item label="快递单号">
                  {form.getFieldDecorator(`item[0].expressNo`, {
                    rules: [{
                      required: true,
                      whitespace: true,
                      message: "请输入快递单号！"
                    }],
                  })(<Input placeholder="请输入快递单号" />)}
                </Form.Item>
                <Form.Item label="快递公司">
                  {form.getFieldDecorator(`item[0].expressCompany`, {
                    rules: [{
                      required: true,
                      whitespace: true,
                      message: "请输入快递公司！"
                    }],
                  }
                  )(<Input placeholder="请输入快递公司" />)}
                </Form.Item>
                <Form.Item label="上传发票" className={styles.uploadImg}>
                  {form.getFieldDecorator(`item[0].uploadFile`, {
                    rules: [{
                      validator: validatorImg
                    }],
                  })(<UploadFile saveIntoBusiness />)}
                </Form.Item>
              </>) :
            invoiceCorrelationEntityList && invoiceCorrelationEntityList.map((item, index) =>
              (
                <div key={item.invoiceNo}>
                  <Form.Item label="发票号码">
                    {form.getFieldDecorator(`item[${index}].invoiceNo`, {
                      rules: [{
                        required: true,
                        whitespace: true,
                        message: "请输入发票号码！"
                      }],
                    })(<Input placeholder="请输入发票号码" />)}
                  </Form.Item>
                  <Form.Item label="开票金额">
                    {form.getFieldDecorator(`item[${index}].actualInvoiceAmount`, {
                      rules: [{
                        required: true,
                        whitespace: true,
                        message: "请输入开票金额！",
                      }, {
                        validator: (rule, value, callback) => {
                          if (!/^\d+\.?\d{0,2}$/.test(value) && !value) callback('请正确输入开票金额!   (最高支持两位小数)');
                          if (value <= 0) callback('请正确输入开票金额!   (最高支持两位小数)');
                          const { shouldInvoiceAmount } = expressFormData;
                          const currentTotal = form.getFieldsValue().item.reduce((r, n) => r += Number(n.actualInvoiceAmount), 0);
                          if (Number(currentTotal) > Number(shouldInvoiceAmount)) {
                            callback('开票金额超出剩余可开票金额');
                          }
                          callback();
                        }
                      }],
                    })(<Input placeholder="请输入开票金额" />)}
                  </Form.Item>
                  <Form.Item label="快递单号">
                    {form.getFieldDecorator(`item[${index}].expressNo`, {
                      rules: [{
                        required: true,
                        whitespace: true,
                        message: "请输入快递单号！"
                      }],
                    })(<Input placeholder="请输入快递单号" />)}
                  </Form.Item>
                  <Form.Item label="快递公司">
                    {form.getFieldDecorator(`item[${index}].expressCompany`, {
                      rules: [{
                        required: true,
                        whitespace: true,
                        message: "请输入快递公司！"
                      }],
                    })(<Input placeholder="请输入快递公司" />)}
                  </Form.Item>
                  <Form.Item label="上传发票" className={styles.uploadImg}>
                    {form.getFieldDecorator(`item[${index}].uploadFile`, {
                      rules: [{ validator: validatorImg }],
                    })(<UploadFile saveIntoBusiness />)}
                  </Form.Item>
                  <Form.Item label="id" style={{ opacity: 0 }}>
                    {form.getFieldDecorator(`item[${index}].invoiceCorrelationId`)(<Input />)}
                  </Form.Item>

                </div>)
            )
          }
        </Form>
      </div>
    </Modal>
  );
};

export default Form.create()(UpdateInvoice);
