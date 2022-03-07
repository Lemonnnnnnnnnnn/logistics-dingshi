import React, { useEffect } from 'react';
import { Row, Button, Form, message, Input, Select } from "antd";
import { connect } from 'dva';
import '@gem-mine/antd-schema-form/lib/fields';
import { createOrganizationSupplier, modifyOrganizationSupplier, getOrganizationDetail } from '../../services/apiService';
import { getLocal, isEmpty, removeSpace } from "../../utils/utils";

const initData = {
  isAvailable: true,
  contactPhone: undefined,
  contactName: undefined,
  creditCode: undefined,
  organizationAddress: undefined,
  organizationName :undefined,
  abbreviationName : undefined
};

const AddSupplier  = ({ commonStore, location, form, history, deleteTab, tabs, activeKey  }) =>{
  const currentTab = tabs.find(item => item.id === activeKey);
  const localData = currentTab && getLocal(currentTab.id) || { formData: {} };
  const pageKey = location.query && location.query.pageKey;
  const organizationId = location.query && location.query.organizationId;
  const organizationType = location.state && location.state.organizationType;

  useEffect(()=>{
    // 如果是修改页面
    if (pageKey){
      // 如果缓存为空
      if (isEmpty(localData.formData)){
        getOrganizationDetail(organizationId).then(({ isAvailable, contactPhone, contactName, creditCode, organizationAddress, organizationName, abbreviationName  })=>{
          form.setFieldsValue({
            isAvailable,
            contactPhone,
            contactName,
            creditCode,
            organizationAddress,
            organizationName,
            abbreviationName
          });
        });
      } else {
        form.setFieldsValue({ ...initData, ...localData.formData });
      }
    }

    // 如果是添加页面

    if (!pageKey) {
      if (isEmpty(localData.formData)){
        form.setFieldsValue({ ...initData });
      } else {
        form.setFieldsValue({ ...initData, ...localData.formData });
      }
    }

    return ()=>{
      // 页面销毁的时候自己 先移除原有的 再存储最新的
      localStorage.removeItem(currentTab.id);
      if (getLocal('local_commonStore_tabsObj').tabs.length > 1) {
        localStorage.setItem(currentTab.id, JSON.stringify({ formData: form.getFieldsValue() }));
      }
    };
  }, [location]);

  const onSave = ()=>{
    form.validateFields((err, val)=>{
      if (err) {
        return message.error('请把信息填写完整！');
      }
      // 需求是中间也要去空格，无法用trim方法
      const params = removeSpace(val);

      if (!organizationId){
        createOrganizationSupplier(params).then(()=>{
          message.success('添加成功，正在返回列表页...', 0.5);
          // 清除当前缓存并关闭tab
          history.push('/basic-setting/supplierManage');
          const dele = tabs.find(item => item.id === activeKey);
          deleteTab(commonStore, { id: dele.id });
        });
      }
      if (organizationId){
        modifyOrganizationSupplier({ ...params, organizationId }).then(()=>{
          message.success('修改成功，正在返回列表页...', 0.5);
          // 清除当前缓存并关闭tab
          history.push('/basic-setting/supplierManage');
          const dele = tabs.find(item => item.id === activeKey);
          deleteTab(commonStore, { id: dele.id });
        });
      }
    });
  };

  return (
    <Row type='flex' justify='center'>
      <Form style={{ width : '30rem'  }}>
        <Form.Item label="供应商简称">
          {form.getFieldDecorator(`abbreviationName`, { rules : [{ required : true, message: "请输入供应商简称！", whitespace: true }] })(<Input />)}
          {
            organizationType === 1 ? null : <p>（请填写便于识别的名称，简称将用于关联表单的搜索添加和展示）</p>
          }
        </Form.Item>
        <Form.Item label="供应商全称">
          {form.getFieldDecorator(`organizationName`, { rules : [{ required : true, message: "请输入供应商全称！", whitespace: true  }] })(<Input />)}
          {
            organizationType === 1 ? null : <p>（请填写该供应商营业执照上的公司名称）</p>
          }
        </Form.Item>
        <Form.Item label="办公地址">
          {form.getFieldDecorator(`organizationAddress`, { rules : [{ required : true, message: "请输入办公地址！", whitespace: true  }] })(<Input />)}
          {
            organizationType === 1 ? null : <p>（请填写该供应商的办公地址）</p>
          }
        </Form.Item>
        <Form.Item label="营业执照编号">
          {form.getFieldDecorator(`creditCode`, { rules : [
            { required : true, message: "请输入营业执照编号！", whitespace: true },
            { max : 18, message : '营业执照编号最多18位' }
          ] })(<Input />)}
        </Form.Item>
        {
          organizationType === 1 && (
            <>
              <Form.Item label="联系人">
                {form.getFieldDecorator(`contactName`)(<Input />)}
              </Form.Item>
              <Form.Item label="联系电话">
                {form.getFieldDecorator(`contactPhone`)(<Input />)}
              </Form.Item>
              <Form.Item label="状态">
                {form.getFieldDecorator(`isAvailable`, { rules : [{ required : true, message: "请选择状态！" }] })(
                  <Select>
                    {<Select.Option key={1} value>启用</Select.Option>}
                    {<Select.Option key={2} value={false}>禁用</Select.Option>}
                  </Select>
                )}
              </Form.Item>
            </>
          )
        }
        <Form.Item>
          <Row className='mt-1' type='flex' justify='space-around'>
            <Button onClick={onSave} type='primary'>
              保存
            </Button>
            <Button
              onClick={() => {
                history.push('/basic-setting/supplierManage');
                const dele = tabs.find(item => item.id === activeKey);
                deleteTab(commonStore, { id: dele.id });
              }}
            >
              取消
            </Button>
          </Row>
        </Form.Item>
      </Form>
    </Row>
  );
};

const mapDispatchToProps = (dispatch) => ({
  deleteTab: (store, payload) => dispatch({ type: 'commonStore/deleteTab', store, payload }),
});

export default connect(({ commonStore })=>({
  ...commonStore
}), mapDispatchToProps)(Form.create()(AddSupplier));
