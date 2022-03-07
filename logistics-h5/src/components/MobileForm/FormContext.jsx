import React, { useContext } from 'react';

const FormContext = React.createContext({
  form: {},             // form对象
  normalizeSchema:{},
  formData:{}           // 当前表单数据
})

export default FormContext

export function FormContextCustom (Component){
  return (props) => {
    const formContextProps = useContext(FormContext)
    return <Component {...props} {...formContextProps} />
  }
}
