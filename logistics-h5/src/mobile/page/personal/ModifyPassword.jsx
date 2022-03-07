import React, { Component } from 'react';
import { SchemaForm, FORM_MODE, Item, FormButton, ErrorNoticeBar } from '@gem-mine/mobile-schema-form/src';
import '@gem-mine/mobile-schema-form/src/fields'
import { Toast } from 'antd-mobile';
import { modifyUserInfo } from '@/services/apiService'
import { ACCOUNT_TYPE } from '@/constants/user/accountType'
import { encodePassword } from '@/utils/utils'
import nativeApi from '@/utils/nativeApi'

export default class ModifyPassword extends Component{

  state = {
    errors:[]
  }

  constructor (props){
    super(props)
    this.schema={
      'password':{
        label: '旧密码',
        component: 'inputItem',
        props:{
          type:'password'
        },
        format:{
          output:value=>encodePassword(value)
        },
        rules:{
          required:true,
        },
        placeholder: '请填写旧密码',
      },
      'newPassword':{
        label: '新密码',
        component: 'inputItem',
        props:{
          type:'password'
        },
        format:{
          output:value=>encodePassword(value)
        },
        rules:{
          required:true,
          pattern:/^[A-Za-z0-9_]{6,16}$/,
          // validator: ({ value }) => {
          //   const reg = /^[A-Za-z0-9_]{6,16}$/
          //   if (!reg.test(value)) {
          //     return '密码由6-16位大小写字母数字组成'
          //   }
          // }
        },
        placeholder: '请输入新密码',
      },
      'checkNewPassword':{
        label: '确认密码',
        component: 'inputItem',
        props:{
          type:'password'
        },
        format:{
          output:value=>encodePassword(value)
        },
        rules:{
          required:true,
          // pattern:/^[A-Za-z0-9_]{6,16}$/,
          validator: ({ value, formData }) => {
            const { newPassword } = formData
            if (!(value === newPassword)){
              return '两次输入密码不一致'
            }
          }
        },
        placeholder: '请再次输入新密码',
      },
    }
    this.FormButtonConfig = [
      {
        label:'保存',
        onClick:formData =>{
          delete formData.checkNewPassword
          modifyUserInfo({ ...formData, accountType:ACCOUNT_TYPE.NORMAL_ACCOUNT })
            .then(()=>{
              Toast.success('修改密码成功', 1, ()=>{ nativeApi.onPwdChanged() })
            })
        },
        onError:(errors)=>this.setState({ errors }),
        // validate:true,
        style:{ color:'#FF6633', borderRadius:'54px', fontSize:'13px', width:'80px', height:'28px', margin:'9px 10px', float:'right', lineHeight:'28px', border:'1px solid #FF6633' }
      }
    ]
  }

  render (){
    return (
      <SchemaForm schema={this.schema} mode={FORM_MODE.ADD} onChange={()=>this.setState({ errors:[] })}>
        <ErrorNoticeBar errors={this.state.errors} />
        <Item field="password" />
        <Item field="newPassword" />
        <Item field="checkNewPassword" />
        <div style={{ position:'absolute', bottom:'0', width:'100%', height:'47px', backgroundColor:'#FFFFFF' }}>
          {this.FormButtonConfig.map(item=><FormButton debounce validate {...item} />)}
        </div>
      </SchemaForm>
    )
  }
}
