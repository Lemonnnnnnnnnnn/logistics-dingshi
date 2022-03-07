import React, { useEffect } from 'react';
import { Select, Input, Form, Button, Radio, message } from 'antd';
import { connect } from 'dva';
import { getLocal, isEmpty, omit, uniqBy, trim } from '@/utils/utils';
import { postServiceUser, getServiceUserDetail, putServiceUser } from '@/services/deviceManageService';
import { getUserInfo } from "@/services/user";

const { TextArea } = Input;
const initData = {
  organizationId: undefined,
  providerId: undefined,
  accountName: undefined,
  userName: undefined,
  password: undefined,
  remark: undefined,
  isAvailable: undefined,
  loginType: undefined,
  carNoInfo: undefined,
  userOther: undefined,
};
const providerIds = {
  one: '352447261709560', // 中交
  two: '352447261709561', // 星软
  three: '352447261709562', // 网阔
};

const Edit = ({ form, history, activeKey, tabs, deleteTab, commonStore, location, organizations, getOrganizations, dictionarys, getDictionarys }) => {
  const currentTab = tabs.find(item => item.id === activeKey);
  const localData = currentTab && getLocal(currentTab.id) || { formData: {} };
  const serviceUserId = location.query && location.query.pageKey;
  const { organizationType, organizationId, organizationName } = getUserInfo();

  useEffect(() => {
    if (localData && !isEmpty(localData.formData)) {
      form.setFieldsValue({ ...initData, ...localData.formData });
    }
    if (!organizations.length && organizationType !== 5) {
      getOrganizations();
    }
    if (!dictionarys.legth) {
      getDictionarys();
    }
    if (serviceUserId && isEmpty(localData.formData)) {
      getServiceUserDetail(serviceUserId).then(res => {
        const {
          providerId,
          isAvailable,
          organizationId,
          accountName,
          userName,
          password,
          remark,
          loginType,
          carNoInfo,
          userOther,
        } = res;
        form.setFieldsValue({
          organizationId:  organizationId.toString(),
          accountName,
          userName,
          password,
          remark,
          loginType: loginType && loginType.toString(),
          carNoInfo,
          userOther,
          isAvailable: isAvailable ? 1 : 0,
          providerId: providerId.toString(),
        });
      });
    }
    return () => {
      // 页面销毁的时候自己 先移除原有的 再存储最新的
      localStorage.removeItem(currentTab.id);
      if (getLocal('local_commonStore_tabsObj').tabs.length > 1) {
        localStorage.setItem(currentTab.id, JSON.stringify({ formData: form.getFieldsValue() }));
      }
    };
  }, [serviceUserId]);
  const onSave = () => {
    form.validateFields((err, values) => {
      if (err) {
        return message.error('请把信息填写完整！');
      }
      let params = { ...values, organizationId: Number(values.organizationId), providerId: Number(values.providerId), loginType: 1 };
      switch (values.providerId) {
        case providerIds.two:
          params = omit(params, ['userOther', 'carNoInfo']);
          break ;
        case providerIds.one:
          params = omit(params, ['loginType', 'carNoInfo']);
          break ;
        case providerIds.three:
          params = omit(params, ['userOther', 'loginType']);
          break ;
        default:
      }
      if (params.carNoInfo) {
        if (uniqBy(trim(params.carNoInfo).split(/\s+/)).length > 100) {
          return message.error('车牌号最多填100条！');
        }
        params.carNoInfo = params.carNoInfo.toUpperCase();
        const reg = /^[京津沪渝冀豫云辽黑湘皖鲁新苏浙赣鄂桂甘晋蒙陕吉闽贵粤青藏川宁琼使领A-Z]{1}[A-Z]{1}[A-Z0-9]{4}[A-Z0-9挂学警港澳]{1}$/;
        const carNoList = uniqBy(trim(params.carNoInfo).split(/[\s,，]+/));
        for ( let i = 0 ; i < carNoList.length ; i ++){
          if (!reg.test(carNoList[i])) return message.error(`车牌号 ${carNoList[i]} 格式错误`);
        }
        params.carNoInfo = carNoList.join(',');
      }
      if (serviceUserId) {
        putServiceUser(serviceUserId, { ...params, isAvailable: !!params.isAvailable }).then(() => {
          deleteTab(commonStore, { id: currentTab.id });
          history.push('/deviceManage/accountManage');
          message.success('修改账号成功！');
        });
      } else {
        postServiceUser({ ...params, isAvailable: !!params.isAvailable, password: params.password }).then(() => {
          deleteTab(commonStore, { id: currentTab.id });
          history.push('/deviceManage/accountManage');
          message.success('创建账号成功！');
        });
      }
    });
  };
  const currentProviderId = form.getFieldValue('providerId');
  useEffect(() => {
    if (currentProviderId === providerIds.two) {
      form.setFieldsValue({
        loginType: '1',
      });
    }
  }, [currentProviderId]);
  return (
    <div className="form-edit">
      <Form>
        <Form.Item label="设备所属公司">
          {form.getFieldDecorator(`organizationId`, {
            initialValue: organizationId.toString(),
            rules: [{
              required: true,
              whitespace: true,
            }],
          })(
            <Select disabled={organizationType === 5} optionFilterProp="children" showSearch>
              {
                organizationType === 5 ?
                  <Select.Option value={organizationId.toString()}>{organizationName}</Select.Option> :
                  organizations.length && organizations.map(item => (
                    <Select.Option key={item.organizationId} value={item.organizationId.toString()}>
                      {item.organizationName}
                    </Select.Option>
                  ))
              }
            </Select>
          )}
        </Form.Item>
        <Form.Item label="设备厂家">
          {form.getFieldDecorator(`providerId`, {
            rules: [{
              required: true,
              whitespace: true,
              message: "请选择设备厂家！"
            }],
          })(
            <Select>
              {
                dictionarys.length && dictionarys.slice(1).map(item => (
                  <Select.Option key={item.value} value={item.value}>
                    {item.label}
                  </Select.Option>
                ))
              }
            </Select>
          )}
        </Form.Item>
        <Form.Item label="设备名称">
          {form.getFieldDecorator(`accountName`, {
            rules: [{
              required: true,
              whitespace: true,
              message: "请输入设备名称！"
            }],
          })(<Input />)}
        </Form.Item>
        <Form.Item label="用户名">
          {form.getFieldDecorator(`userName`, {
            rules: [{
              required: true,
              whitespace: true,
              message: "请输入用户名！"
            }],
          })(<Input />)}
        </Form.Item>
        <Form.Item label="密码">
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            {form.getFieldDecorator(`password`, {
              rules: [{
                required: true,
                whitespace: true,
                message: "请输入密码！"
              }],
            })( <Input.Password /> )}
            <span>（请填写GPS供应商提供的查询轨迹的用户名和密码）</span>
          </div>
        </Form.Item>
        <Form.Item label='登录类型' style={{ display: currentProviderId === providerIds.two ? '' : 'none' }}>
          {form.getFieldDecorator('loginType', {
            initialValue: '1',
            rules: [{
              required: currentProviderId === providerIds.two,
              whitespace: true,
            }],
          })(<Input disabled />
          )}
        </Form.Item>
        <Form.Item label='客户端ID' style={{ display: currentProviderId === providerIds.one ? '' : 'none' }}>
          {form.getFieldDecorator('userOther', {
            rules: [{
              required: currentProviderId === providerIds.one,
              whitespace: true,
              message:"请输入客户端ID！"
            }],
          })(<Input />
          )}
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
        <Form.Item label="备注">
          {form.getFieldDecorator(`remark`)(<TextArea rows={5} />)}
        </Form.Item>
        <Form.Item label="车牌号" style={{ display: currentProviderId === providerIds.three ? '' : 'none' }}>
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            {form.getFieldDecorator('carNoInfo', {
              rules: [{
                required: currentProviderId === providerIds.three,
                whitespace: true,
                message: "请输入正确的车牌号！",
              }],
            })(<TextArea rows={15} />)}
            <span>（支持输入多条数据，每条数据一行、或者用空格、逗号隔开；可从EXCEL复制粘贴，最多100条）</span>
          </div>
        </Form.Item>
        <div className="form-edit-btn">
          <Form.Item>
            <Button onClick={onSave} type='primary'>
              保存
            </Button>
            <Button
              onClick={() => {
                history.push('/deviceManage/accountManage');
                deleteTab(commonStore, { id: currentTab.id });
              }}
            >
              取消
            </Button>
          </Form.Item>
        </div>
      </Form>
    </div>
  );
};
const mapDispatchToProps = (dispatch) => ({
  getServiceUsers: (params) => dispatch({ type: 'deviceManageStore/getServiceUsers', payload: params  }),
  deleteTab: (store, payload) => dispatch({ type: 'commonStore/deleteTab', store, payload }),
  getDictionarys: () => dispatch({ type: 'deviceManageStore/getDictionarys' }),
  getOrganizations: () => dispatch({ type: 'deviceManageStore/getOrganizations', payload: { limit: 10000, offset: 0, selectType: 3, vagueSelect: '', organizationTypeList: '1, 5' } }),
});

export default connect(({ deviceManageStore, commonStore, loading }) => ({
  loading,
  ...deviceManageStore,
  ...commonStore,
  commonStore,
}), mapDispatchToProps)(Form.create()(Edit));
