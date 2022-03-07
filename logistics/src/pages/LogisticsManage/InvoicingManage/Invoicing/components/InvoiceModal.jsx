import React, { useEffect, useState } from 'react';
import { connect } from 'dva';
import { Modal, Form, notification, Button, DatePicker, message } from 'antd';
import { SchemaForm, Observer, Item } from '@gem-mine/antd-schema-form';
import { INVOICES_LIST_STATE } from '../../../../../constants/project/project';
import DebounceFormButton from '../../../../../components/DebounceFormButton';
import UploadFile from '../../../../../components/Upload/UploadFile';
import { patchInvoice } from "../../../../../services/apiService";
import ExpressNoInput from './ExpressNoInput';

const { RangePicker } = DatePicker;

const  InvoiceModal = ({
  expressVisible,
  expressFormHandleCancel,
  writeExpressCompany,
  expressFormData,
  company,
  refresh,
  patchInvoiceId,
} ) => {
  const formItemLayout = {
    labelCol: {
      xs: { span: 24 },
      sm: { span: 6 },
    },
    wrapperCol: {
      xs: { span: 24 },
      sm: { span: 18 },
    },
  };
  const formSchema = {
    invoiceNo: {
      label: '发票号码:',
      component: 'input',
      rules: {
        required: [true, '请输入发票号码'],
        validator: ({ value }) => {
          if (!value.toString().trim()) {
            return '发票号码不能为空';
          }
        },
      },
      placeholder: '请输入发票号码',
    },
    actualInvoiceAmount: {
      label: '开票金额:',
      component: 'input',
      rules: {
        required: [true, '请输入发票号码'],
        validator: ({ value }) => {
          if (!/^\d+\.?\d{0,2}$/.test(value)) return '请正确输入开票金额!   (最高支持两位小数)';
          if (value <= 0) return '请正确输入开票金额!   (最高支持两位小数)';
          const { hadSended, shouldInvoiceAmount } = expressFormData;
          if (Number(value) > (Number(shouldInvoiceAmount) - Number(hadSended)).toFixed(2)) {
            return '开票金额超出剩余可开票金额';
          }
        },
      },
      placeholder: '请输入开票金额',
    },
    expressNo: {
      label: '快递单号:',
      component: ExpressNoInput,
      rules: {
        required: [true, '请输入快递单号'],
        validator: ({ value }) => {
          if (!value.toString().trim()) {
            return '快递单号不能为空';
          }
        },
      },
      placeholder: '请输入快递单号',
      writeExpressCompany,
    },
    expressCompany: {
      label: '快递公司:',
      component: 'input',
      rules: {
        required: [true, '请输入快递公司'],
        validator: ({ value }) => {
          if (!value.toString().trim()) {
            return '快递公司不能为空';
          }
        },
      },
      placeholder: '请输入快递公司',
      value: Observer({
        watch: '*company',
        action: (company) => company,
      }),
    },
    uploadFile: {
      label: '上传发票:',
      component: UploadFile,
      rules: {
        required: [true, '请上传发票'],
      },
    },
  };
  const expressFormRef = React.createRef();

  const postExpressInfo = (value) => {
    // PARTIALLY_DONE
    const invoiceDentryid = value.uploadFile[0];
    delete value.uploadFile;
    value = { ...value, invoiceDentryid };
    const { hadSended, shouldInvoiceAmount } = expressFormData;
    if ((Number(hadSended) + Number(value.actualInvoiceAmount)).toFixed(2) === Number(shouldInvoiceAmount)) {
      value.invoiceState = INVOICES_LIST_STATE.DONE;
    } else {
      value.invoiceState = INVOICES_LIST_STATE.PARTIALLY_DONE;
    }
    patchInvoice(patchInvoiceId, value).then(() => {
      notification.success({
        message: '开出成功',
        description: '已成功提交开票信息',
      });
      expressFormHandleCancel();
      refresh();
    });
  };

  return (
    <Modal
      visible={expressVisible}
      destroyOnClose
      maskClosable={false}
      title='已开出'
      onCancel={expressFormHandleCancel}
      footer={null}
    >
      <SchemaForm
        hideRequiredMark
        className='invoicingList_form'
        ref={expressFormRef}
        layout='vertical'
        {...formItemLayout}
        schema={formSchema}
        trigger={{ company }}
      >
        <Item field='invoiceNo' />
        <Item field='actualInvoiceAmount' />
        <Item field='expressNo' />
        <Item field='expressCompany' />
        <Item field='uploadFile' />
        <div styleName='button_box'>
          <Button style={{ marginRight: '20px' }} onClick={expressFormHandleCancel}>取消</Button>
          <DebounceFormButton label='确定' type='primary' onClick={postExpressInfo} />
        </div>
      </SchemaForm>
    </Modal>
  );
};

export default connect(({ basicSettingStore, dictionaries, loading }) => ({
  loading,
  dictionaries,
  ...basicSettingStore,
}))(Form.create()(InvoiceModal));;
