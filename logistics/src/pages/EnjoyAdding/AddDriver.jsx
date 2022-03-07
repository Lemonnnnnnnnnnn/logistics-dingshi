import React, { Component } from 'react';
import { Form, Input, Row, Col, Divider, Radio, message, Button, Select, DatePicker, notification } from 'antd';
import moment from "moment";
import { DRIVER_LICENSE_TYPE } from '@/constants/driver/driver';
import UploadFile from '@/components/Upload/UploadFile';
import request from '@/utils/request';
import { connect } from "dva";

const { Option } = Select;
const FormItem = Form.Item;
const style = { width: '160px' };
const styleCol = { paddingBottom: '10px' };
const options = [
  { label: '男', value: '1' },
  { label: '女', value: '2' }
];

function mapStateToProps(state) {
  const { dictionaries : { items } } = state;
  const licenseType = items.filter(item=>item.dictionaryType === 'license_type');

  return {
    licenseType
  };
}

@connect(mapStateToProps, null)
export default class AddDriver extends Component {
  render () {
    const { licenseType } = this.props;
    return (
      <SeoCreateForm licenseType={licenseType} />
    );
  }
}

const SeoCreateForm = Form.create()(
  (props) => {
    const { form, licenseType } = props;
    const children = licenseType.map(item=><Option key={Number(item.dictionaryCode)} value={Number(item.dictionaryCode)}>{item.dictionaryName}</Option>);

    const { getFieldDecorator } = form;
    const saveFormData = () => {
      form.validateFields((err, values) => {
        if (err) {
          return;
        }
        values.sex = Number(values.sex);
        values.remarks = '后台录入';
        values.userName = values.nickName;
        if (values.licenseDentryid !== undefined) {
          // eslint-disable-next-line prefer-destructuring
          values.licenseDentryid = values.licenseDentryid[0];
        }
        // eslint-disable-next-line prefer-destructuring
        values.qualificationCertificateDentryid = values.qualificationCertificateDentryid[0];
        // eslint-disable-next-line prefer-destructuring
        values.idcardFrontDentryid = values.idcardFrontDentryid[0];
        // eslint-disable-next-line prefer-destructuring
        values.idcardBackDentryid = values.idcardBackDentryid[0];
        values.licenseNo = values.idcardNo;
        values.accountType = 2;
        if (values.licenseFrontDentryid !== undefined) {
          // eslint-disable-next-line prefer-destructuring
          values.licenseFrontDentryid = values.licenseFrontDentryid[0];
        }
        // eslint-disable-next-line prefer-destructuring
        values.licenseViceDentryid = values.licenseViceDentryid[0];
        if (values.qualificationFrontDentryid !== undefined) {
          // eslint-disable-next-line prefer-destructuring
          values.qualificationFrontDentryid = values.qualificationFrontDentryid[0];
        }
        // eslint-disable-next-line prefer-destructuring
        values.qualificationBackDentryid = values.qualificationBackDentryid[0];
        if (values.driverFrontDentryid !== undefined) {
          // eslint-disable-next-line prefer-destructuring
          values.driverFrontDentryid = values.driverFrontDentryid[0];
        }
        if (values.driverIdcardDentryid !== undefined) {
          // eslint-disable-next-line prefer-destructuring
          values.driverIdcardDentryid = values.driverIdcardDentryid[0];
        }
        values.qualificationValidityDate = moment(values.qualificationValidityDate).startOf('day').format();
        values.licenseValidityDate = moment(values.licenseValidityDate).startOf('day').format();
        values.driverCertificationCreateReqList = [
          {
            qualificationValidityDate: values.qualificationValidityDate,
            qualificationFrontDentryid: values.qualificationCertificateDentryid
          }
        ];
        // 驾驶证默认不必填。未填等于第一行的驾驶证
        if (values.licenseFrontDentryid === '' || values.licenseFrontDentryid === null) {
          values.licenseFrontDentryid = values.licenseDentryid;
        }
        // 从业资格默认不必填。未填等于第一行的从业资格
        if (values.qualificationFrontDentryid === '' || values.qualificationFrontDentryid === null) {
          values.qualificationFrontDentryid = values.qualificationCertificateDentryid;
        }
        request.post(`/v1/autoCreateDriver`, { data: values }).then(result => {
          if (result) {
            notification.success({
              message: '保存成功',
              description: `保存成功！`
            });
          }
        }).catch(() => {
          message.success('保存失败！');
        });
        // message.success('保存成功！')
      });
    };

    return (
      <div className="new-wrap">
        <Form layout='vertical'>
          <Divider orientation="left">司机基本信息</Divider>
          <Row gutter={16}>
            <Col className="gutter-row" style={styleCol} span={16} xs={14} sm={12} md={10} lg={8} xl={6} xxl={6}>
              <FormItem
                label="司机姓名："
              >
                {getFieldDecorator('nickName', {
                  rules: [{ required: true, message: '请填写司机姓名' }],
                })(
                  <Input placeholder="司机姓名" maxLength={20} style={style} allowClear />
                )}
              </FormItem>
            </Col>
            <Col className="gutter-row" style={styleCol} span={16} xs={14} sm={12} md={10} lg={8} xl={6} xxl={6}>
              <FormItem
                label="性别："
              >
                {getFieldDecorator('sex', {
                  rules: [{ required: true, message: '请填写性别' }],
                })(
                  <Radio.Group options={options} />
                )}
              </FormItem>
            </Col>
            <Col className="gutter-row" style={styleCol} span={16} xs={14} sm={12} md={10} lg={8} xl={6} xxl={6}>
              <FormItem
                label="手机号："
              >
                {getFieldDecorator('phone', {
                  rules: [{ required: true, message: '请填写手机号' }],
                })(
                  <Input placeholder="手机号" maxLength={11} style={style} allowClear />
                )}
              </FormItem>
            </Col>
            <Col className="gutter-row" style={styleCol} span={16} xs={14} sm={12} md={10} lg={8} xl={6} xxl={6}>
              <FormItem
                label="身份证："
              >
                {getFieldDecorator('idcardNo', {
                  rules: [{ required: true, message: '请填写身份证' }],
                })(
                  <Input placeholder="身份证" maxLength={18} width="160px" allowClear />
                )}
              </FormItem>
            </Col>
          </Row>
          <Divider orientation="left">司机证件等信息</Divider>
          <Row gutter={16}>
            <Col className="gutter-row" style={styleCol} span={16} xs={14} sm={12} md={10} lg={8} xl={6} xxl={6}>
              <FormItem
                label="驾驶证类型："
              >
                {getFieldDecorator('licenseType', {
                  rules: [{ required: true, message: '请填写驾驶证类型' }],
                })(
                  <Select placeholder="驾驶证类型" style={style}>
                    {children}
                  </Select>
                )}
              </FormItem>
            </Col>
            <Col className="gutter-row" style={styleCol} span={16} xs={14} sm={12} md={10} lg={8} xl={6} xxl={6}>
              <FormItem
                label="从业资格证有效期："
              >
                {getFieldDecorator('qualificationValidityDate', {
                  rules: [{ required: true, message: '请填写从业资格证有效期' }],
                })(
                  <DatePicker />
                )}
              </FormItem>
            </Col>
            <Col className="gutter-row" style={styleCol} span={16} xs={14} sm={12} md={10} lg={8} xl={6} xxl={6}>
              <FormItem
                label="驾驶证有效期："
              >
                {getFieldDecorator('licenseValidityDate', {
                  rules: [{ required: true, message: '请填写驾驶证有效期' }],
                })(
                  <DatePicker />
                )}
              </FormItem>
            </Col>
          </Row>
          <Row gutter={16}>
            <Col className="gutter-row" style={styleCol} span={16} xs={14} sm={12} md={10} lg={8} xl={6} xxl={6}>
              <FormItem
                label="驾驶证照片："
              >
                {getFieldDecorator('licenseDentryid', {
                  rules: [{ required: true, message: '请填写驾驶证照片' }],
                })(
                  <UploadFile
                    width={200}
                    height={200}
                  />
                )}
              </FormItem>
            </Col>
            <Col className="gutter-row" style={styleCol} span={16} xs={14} sm={12} md={10} lg={8} xl={6} xxl={6}>
              <FormItem
                label="从业资格证："
              >
                {getFieldDecorator('qualificationCertificateDentryid', {
                  rules: [{ required: true, message: '请填写从业资格证' }],
                })(
                  <UploadFile
                    width={200}
                    height={200}
                  />
                )}
              </FormItem>
            </Col>
            <Col className="gutter-row" style={styleCol} span={16} xs={14} sm={12} md={10} lg={8} xl={6} xxl={6}>
              <FormItem
                label="身份证(正面)："
              >
                {getFieldDecorator('idcardFrontDentryid', {
                  rules: [{ required: true, message: '请填写身份证(正面)' }],
                })(
                  <UploadFile
                    width={200}
                    height={200}
                  />
                )}
              </FormItem>
            </Col>
            <Col className="gutter-row" style={styleCol} span={16} xs={14} sm={12} md={10} lg={8} xl={6} xxl={6}>
              <FormItem
                label="身份证(反面)："
              >
                {getFieldDecorator('idcardBackDentryid', {
                  rules: [{ required: true, message: '请填写身份证(反面)' }],
                })(
                  <UploadFile
                    width={200}
                    height={200}
                  />
                )}
              </FormItem>
            </Col>
          </Row>
          <Row gutter={16}>
            <Col className="gutter-row" style={styleCol} span={16} xs={14} sm={12} md={10} lg={8} xl={6} xxl={6}>
              <FormItem
                label="驾驶证正面(头像面)："
              >
                {getFieldDecorator('licenseFrontDentryid', {
                  rules: [{ required: false, message: '请填写驾驶证正面(头像面)' }],
                })(
                  <UploadFile
                    width={200}
                    height={200}
                  />
                )}
              </FormItem>
            </Col>
            <Col className="gutter-row" style={styleCol} span={16} xs={14} sm={12} md={10} lg={8} xl={6} xxl={6}>
              <FormItem
                label="驾驶证副页(记录面)："
              >
                {getFieldDecorator('licenseViceDentryid', {
                  rules: [{ required: true, message: '请填写驾驶证副页(记录面)' }],
                })(
                  <UploadFile
                    width={200}
                    height={200}
                  />
                )}
              </FormItem>
            </Col>
            <Col className="gutter-row" style={styleCol} span={16} xs={14} sm={12} md={10} lg={8} xl={6} xxl={6}>
              <FormItem
                label="从业资格证正面(头像面)："
              >
                {getFieldDecorator('qualificationFrontDentryid', {
                  rules: [{ required: false, message: '请填写从业资格证正面(头像面)' }],
                })(
                  <UploadFile
                    width={200}
                    height={200}
                  />
                )}
              </FormItem>
            </Col>
            <Col className="gutter-row" style={styleCol} span={16} xs={14} sm={12} md={10} lg={8} xl={6} xxl={6}>
              <FormItem
                label="从业资格证反面(国徽面)："
              >
                {getFieldDecorator('qualificationBackDentryid', {
                  rules: [{ required: true, message: '请填写从业资格证反面(国徽面)' }],
                })(
                  <UploadFile
                    width={200}
                    height={200}
                  />
                )}
              </FormItem>
            </Col>
          </Row>
          <Row gutter={16}>
            <Col className="gutter-row" style={styleCol} span={16} xs={14} sm={12} md={10} lg={8} xl={6} xxl={6}>
              <FormItem
                label="司机正面照："
              >
                {getFieldDecorator('driverFrontDentryid', {
                  rules: [{ required: false, message: '司机正面照' }],
                })(
                  <UploadFile
                    width={200}
                    height={200}
                  />
                )}
              </FormItem>
            </Col>
            <Col className="gutter-row" style={styleCol} span={16} xs={14} sm={12} md={10} lg={8} xl={6} xxl={6}>
              <FormItem
                label="手持身份证照："
              >
                {getFieldDecorator('driverIdcardDentryid', {
                  rules: [{ required: false, message: '请填写手持身份证照' }],
                })(
                  <UploadFile
                    width={200}
                    height={200}
                  />
                )}
              </FormItem>
            </Col>
          </Row>
          <div style={{ paddingRight: '20px', textAlign: 'right' }}>
            <Button type="primary" onClick={saveFormData}>保存</Button>
          </div>
        </Form>
      </div>
    );
  }
);
