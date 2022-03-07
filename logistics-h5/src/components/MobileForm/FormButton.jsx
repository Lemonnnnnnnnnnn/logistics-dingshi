import React from 'react'
import { Button, Toast } from 'antd-mobile'
import Authorized from '@/utils/Authorized'
import { FormContextCustom } from './FormContext'
import { debounce, find, forEach } from '@/utils/utils';
import './mobileForm.css'

// 调用 schema 或 props 或 默认的 onSubmit方法，除非在 schema 中设置 onSubmit 为 false
// 判断当前是什么模式： 新增(post)/修改(put)/详情(不处理)
const onSubmit = ({ e, formData, form, onClick }) => {
  e.preventDefault()
  e.stopPropagation()
  form.validateFields((errors) => {
    if (errors) {
      forEach(errors, (error, key) => {
        Toast.fail(error.errors[0].message, 1)
        return false
      })
    } else if (onClick) {
      onClick(formData, form)
    }
  })
}

const FormButton = FormContextCustom(({ action, normalizeSchema, formData, form }) => {
  const operate = find(normalizeSchema.operations, { action })
  if (!operate || operate._display === false) return null
  const { label, onClick, auth, display, disabled, required, _disabled, ...rest } = operate

  const button = action === 'submit' ?
    <Button activeClassName='mobile-button' {...rest} activeStyle={false} disabled={_disabled} onClick={debounce((e) => onSubmit({ e, normalizeSchema, formData, form, onClick }), 500)}>{label}</Button> :
    <Button {...rest} disabled={_disabled} onClick={debounce(() => onClick(formData, form), 500)}>{label}</Button>

  if (!auth) {
    return (
      <Authorized key={action} authority={operate.auth}>
        {button}
      </Authorized>
    )
  }
  return button
})

export default FormButton

