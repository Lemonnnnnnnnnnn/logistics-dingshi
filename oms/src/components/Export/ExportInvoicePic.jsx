import React from 'react';
import { FORM_MODE, FormButton, Item, SchemaForm } from "@gem-mine/antd-schema-form";
import { Button, Col, notification, Row } from "antd";
import CheckBox from "@/components/check-box";
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
  fileSizeRule : {
    label : '导出文件大小',
    component : 'radio',
    rules: {
      required: [true, '请选择需导出文件大小'],
    },
    defaultValue : 1,
    options: [{
      key: 0,
      value: 0,
      label: '原文件（较大）',
    }, {
      key: 1,
      value: 1,
      label: '压缩后的文件（较小）',
    }]
  },
  billPictureList : {
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
  },
  fileNameRule : {
    label : '导出图片名称',
    component :'radio',
    rules: {
      required: [true, '请选择需导出文件大小'],
    },
    // defaultValue : 1,
    options: [{
      key: 0,
      value: 0,
      label: '子单据单号',
    }, {
      key: 1,
      value: 1,
      label: '运单号+单据类型拼音前缀',
    }]
  }
};

const ExportInvoicePic = ({ onCancel, func })=>{

  const handleExportPDFBtnClick = (formdata)=>{
    func(formdata);
  };

  return (
    <>
      <div style={{ color :'#5B76D3', fontWeight : 'bold' }}>说明：导出的文件为zip压缩包，里面的图片格式为上传的原格式，每次最多支持500张运单的导出！</div>
      <SchemaForm mode={FORM_MODE.ADD} schema={pdfSchema}>
        <Item {...createBillLayout} field='billPictureList' />
        <Item {...createBillLayout} field='fileSizeRule' />
        <Item {...createBillLayout} field='fileNameRule' />
        <Row type='flex' className='mt-2'>
          <Col span={6} />
          <Col span={6}><Button onClick={onCancel}>取消</Button></Col>
          <Col span={6}><FormButton label='确认' onClick={handleExportPDFBtnClick} type='primary' /></Col>
          <Col span={6} />
        </Row>
      </SchemaForm>
    </>
  );

};

export default ExportInvoicePic;
