import React, { useEffect } from 'react';
import { Select, Input, Form, Button, message } from 'antd';
import { connect } from 'dva';
import { getLocal, isEmpty } from '@/utils/utils';
import { putServiceCar, getServiceCarDetail } from '@/services/deviceManageService';

const initData = {
  organizationId: undefined,
  providerId: undefined,
  serviceUserId: undefined,
  soid: undefined,
  carBrand: undefined,
};

const Edit = ({ form, history, location, tabs, activeKey, deleteTab, commonStore, getOrganizations, organizations, dictionarys, getDictionarys, getServiceUsers, serviceUsers }) => {
  const currentTab = tabs.find(item => item.id === activeKey);
  const localData = currentTab && getLocal(currentTab.id) || { formData: {} };
  const serviceCarId = location.query && location.query.pageKey;
  const organizationId = form.getFieldValue('organizationId');
  const providerId = form.getFieldValue('providerId');
  useEffect(() => {
    if (serviceCarId && isEmpty(localData.formData)) {
      getServiceCarDetail(serviceCarId).then(res => {
        const { carBrand, providerId, serviceUserId, soid, organizationId } = res;
        form.setFieldsValue({ carBrand, providerId: providerId && providerId.toString(), soid, organizationId: organizationId && organizationId.toString(), serviceUserId: serviceUserId && serviceUserId.toString() });
      });
    }
    if (localData && !isEmpty(localData.formData)) {
      form.setFieldsValue({ ...initData, ...localData.formData });
    }

    if (!organizations.length) {
      getOrganizations();
    }
    if (!dictionarys.legth) {
      getDictionarys();
    }
    return () => {
      // 页面销毁的时候自己 先移除原有的 再存储最新的
      localStorage.removeItem(currentTab.id);
      if (getLocal('local_commonStore_tabsObj').tabs.length > 1) {
        localStorage.setItem(currentTab.id, JSON.stringify({ formData: form.getFieldsValue() }));
      }
    };
  }, [location]);
  useEffect(() => {
    if (providerId && organizationId) {
      getServiceUsers({ providerId, organizationId, isAvailable: true, limit: 10000, offset: 0 });
    }
  }, [organizationId, providerId]);
  const onSave = () => {
    form.validateFields((err, values) => {
      if (err) {
        return message.error('请把信息填写完整！');
      }
      putServiceCar(serviceCarId, { ...values }).then(() => {
        deleteTab(commonStore, { id: currentTab.id });
        history.push('/deviceManage/GPSManage');
        message.success('修改GPS设备管理成功');
      });
    });
  };

  return (
    <div className="form-edit">
      <Form>
        <Form.Item label="设备所属公司">
          {form.getFieldDecorator(`organizationId`, {
            initialValue: '310582128678101',
            rules: [{
              required: true,
            }],
          })(
            <Select disabled>
              {
                organizations.map(item => (
                  <Select.Option key={item.organizationId}>
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
            <Select optionFilterProp="children" showSearch>
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
        <Form.Item label="查询账号">
          {form.getFieldDecorator(`serviceUserId`, {
            rules: [{
              required: true,
              whitespace: true,
              message: "请输入查询账号！"
            }],
          })(
            <Select optionFilterProp="children" showSearch>
              {
                serviceUsers.items && serviceUsers.items.map(item => (
                  <Select.Option key={item.serviceUserId}>
                    {item.userName}
                  </Select.Option>
                ))
              }
            </Select>
          )}
        </Form.Item>
        <Form.Item label="设备SN">
          {form.getFieldDecorator(`soid`)(<Input />)}
        </Form.Item>
        <Form.Item label="车牌号">
          {form.getFieldDecorator('carBrand', {
            rules: [{
              required: true,
              whitespace: true,
              message: "请输入车牌号！"
            }],
          })(<Input />)}
        </Form.Item>
        <div className="form-edit-btn">
          <Form.Item>
            <Button onClick={onSave} type='primary'>
              保存
            </Button>
            <Button
              onClick={() => {
                history.push('/deviceManage/GPSManage');
                const dele = tabs.find(item => item.id === activeKey);
                deleteTab(commonStore, { id: dele.id });
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
}), mapDispatchToProps)(Form.create()(Edit));
