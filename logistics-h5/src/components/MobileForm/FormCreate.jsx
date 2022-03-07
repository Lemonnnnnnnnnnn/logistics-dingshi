import React, { useState } from 'react'
import { find, findIndex, forEach, isEqual, isFunction } from '@/utils/utils';
import { createForm, createFormField } from 'rc-form';
import { formatValue } from './Item'
import FormContext from './FormContext'
/**
 * 用于创建表单装饰器,是对 antd的 Form.create的包装
 * 主要作用：
 *  - 创建表单
 *  - 实现值监听
 *  - 实现初始值设置
 *
 * @param normalizeSchema  标准化 schema , 主要提取（observers，fields）两个属性，处理field联动
 * @param onValuesChange
 * @returns {function(*=): React.ComponentClass<RcBaseFormProps & Omit<FormComponentProps, keyof FormComponentProps>>}
 * @constructor
 */
export default function FormCreate ({ normalizeSchema, onValuesChange }){
  let _entity = null
  let _formData
  let oldEntity = null
  console.info('FormCreate', onValuesChange)
  return (CustomForm)=>createForm({
    onFieldsChange (props, fields) {
      // todo 会触发两次 onFieldsChange
    },
    onValuesChange: (props, changeValues, allValues) => {
      _entity = allValues
      isFunction(onValuesChange) && onValuesChange(props, changeValues, allValues)
    },
    mapPropsToFields: (props) => {
      const { entity } = props
      let entityField = null
      if (oldEntity !== entity){
        oldEntity = entity
        _entity = { ...oldEntity }
      }

      entityField = _entity?{ ..._entity }: { ...entity }

      const _fields = normalizeSchema.fields

      forEach(entityField, (value, name) => {
        const field = find(_fields, { key: name }) || {}
        const _value = formatValue(field.component, value)
        entityField[name] = createFormField({ ...field, value:_value })
      })
      return {
        ...entityField
      }
    }
  })((props)=>{     // 添加 form,normalizeSchema,formData 到 context 中
    const { form } = props
    const [_normalizeSchema, setNormalizeSchema] = useState(normalizeSchema)
    const changeValues = form.getFieldsValue()
    // debugger
    const formData = {
      ...props.entity,
      ...changeValues
    }
    if (!isEqual(_formData, formData)) {
      _formData = formData
    }
    function setField (field){
      const { fields } = _normalizeSchema
      const index = findIndex(fields, { key:field.key })
      const oldField = fields[index]
      if (oldField){
        Object.assign(oldField, field)
        setNormalizeSchema({ ..._normalizeSchema })
      }
    }
    console.warn('render mobile form',_formData)
    const providerData = { form, normalizeSchema:_normalizeSchema, formData: _formData, setField, setNormalizeSchema }
    return (
      <FormContext.Provider value={providerData}>
        <CustomForm {...props} form={form} normalizeSchema={_normalizeSchema} setNormalizeSchema={setNormalizeSchema} />
      </FormContext.Provider>
    )
  })
}
