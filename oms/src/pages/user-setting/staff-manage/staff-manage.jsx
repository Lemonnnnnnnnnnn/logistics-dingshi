import React from 'react';
import { SchemaForm, FORM_MODE, Item, Observer } from '@gem-mine/antd-schema-form';
import { Button } from 'antd';
import DebounceFormButton from '@/components/debounce-form-button';
import { getRoles } from '@/services/apiService';
import { encodePassword } from '@/utils/utils';
import '@gem-mine/antd-schema-form/lib/fields';

export default class StaffManage extends React.Component {

  constructor (props) {
    super(props);
    this.schema = {
      nickName: {
        label: '职员姓名',
        component: 'input',
        rules:{
          required: [true, '请输入职员名称']
        },
        placeholder: '请输入职员名称'
      },
      phone: {
        label: '登陆账号',
        component: Observer({
          watch: '*mode',
          action: mode => (
            mode === FORM_MODE.MODIFY ? 'input.text' : 'input'
          )
        }),
        placeholder:'请输入11位手机号码',
        name:'11位手机号',
        rules:{
          required: [true, '请输入登陆账号'],
          pattern: props.mode === 'add' ?/^1\d{10}$/ : undefined
        }
      },
      password: {
        label: '密码',
        component: 'input',
        placeholder: '请输入密码',
        props:{
          type: 'password'
        },
        rules: Observer({
          watch: '*mode',
          action: () => {
            if (this.props.staff.userId){
              return {};
            }
            return { required: true };
          }
        })
      },
      roleItems: {
        label: '角色名称',
        component: 'select',
        props:{
          mode: 'multiple',
          filterOption: (value, option) => option.props.label.indexOf(value) > -1,
          showSearch: true,
        },
        rules:{
          required:[true, '请选择角色']
        },
        placeholder: '选择角色',
        options: async () => {
          const { items: roles } = await getRoles({ limit: 200, offset: 0 });
          return roles.map(({ roleId, roleName }) => ({
            value: roleId,
            text: roleName
          }));
        }
      },
      remarks:{
        label: '备注（可选）',
        component: 'input.textArea',
        placeholder: '请输入备注'
      }
    };
  }

  handleSaveBtnClick = value => {
    value.roleItems = value.roleItems.map(item => ({ roleId: item }));
    value.password = value.password ? encodePassword(value.password) : undefined;
    this.props.onOk(value);
  }

  render () {
    const { staff } = this.props;
    const entity = { ...staff, roleItems: staff.roleItems.map(item => item.roleId) };
    const mode = staff.userId ? FORM_MODE.MODIFY : FORM_MODE.ADD;
    return (
      <SchemaForm
        data={entity}
        schema={this.schema}
        layout="vertical"
        mode={mode}
      >
        <Item field="nickName" />
        <Item field="phone" />
        <Item field="password" />
        <Item field="roleItems" />
        <Item field="remarks" />
        <div style={{ paddingRight:"20px", textAlign:"right" }}>
          <Button className="mr-10" onClick={this.props.onCancel}>取消</Button>
          <DebounceFormButton label="保存" type="primary" onClick={this.handleSaveBtnClick} />
        </div>
      </SchemaForm>
    );
  }
}
