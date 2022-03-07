import React from 'react';
import { FORM_MODE, FormButton, Item, SchemaForm } from "@gem-mine/antd-schema-form";
import { Button, Col, notification, Row } from "antd";
import CheckBox from "@/components/CheckBox";
import { routerToExportPage } from "@/utils/utils";
// import { sendAccountGoodsDetailPdfPost } from "@/services/apiService";
const createBillLayout = {

  labelCol: {
    xs: { span: 7 },
  },
  wrapperCol: {
    xs: { span: 17 },
  }
};

const pdfSchema = {
  fileScale : {
    label : '导出文件大小',
    component : 'radio',
    rules: {
      required: [true, '请选择需导出文件大小'],
    },
    defaultValue : 2,
    options: [{
      key: 1,
      label: '原文件（较大）',
      value: 1
    }, {
      key: 2,
      label: '压缩后的文件（较小）',
      value: 2
    }]
  },
  billTypeOptions : {
    label : '需导出单据类型',
    component : CheckBox,
    rules: {
      required: [true, '请选择需导出单据类型'],
    },
    options: [{
      label: '提货单',
      key: 1,
      value: 1
    }, {
      label: '过磅单',
      key: 2,
      value: 2
    }, {
      label: '签收单',
      key: 3,
      value: 3
    }]
  }
};

const ExportPdf = ({ onCancel, func })=>{

  const handleExportPDFBtnClick = (formdata)=>{
    func(formdata);
  };

  return <SchemaForm mode={FORM_MODE.ADD} schema={pdfSchema}>
    <Item {...createBillLayout} field='billTypeOptions' />
    <Item {...createBillLayout} field='fileScale' />
    <Row type='flex' className='mt-2'>
      <Col span={6} />
      <Col span={6}><Button onClick={onCancel}>取消</Button></Col>
      <Col span={6}><FormButton label='确认' onClick={handleExportPDFBtnClick} type='primary' /></Col>
      <Col span={6} />
    </Row>
  </SchemaForm>;
};

export default ExportPdf;
