/**
 * schema标准化：
 *  - 根据不同的模式,对schema进行补充属性等处理
 */
import { isFunction, isArray, isString, isObject, find, trim } from 'lodash'
import { FORM_MODE } from './constants'

const FIELDS_KEY = 'fields'

const initSchema = {

  fields: [],
  operations: [],
  buttonLayout: 'right'
}

export default function normalizeForm (schema, mode = FORM_MODE.ADD, fieldsKey = FIELDS_KEY) {
  const standardSchema = { ...initSchema, ...schema }
  const fields = standardSchema[fieldsKey]
  const { operations } = standardSchema
  switch (mode) {
    case FORM_MODE.DETAIL:
      detailSchema(fields)
      break
    case FORM_MODE.MODIFY:
      modifySchema(fields)
      if (!find(standardSchema.operations, { action: 'submit' })) {
        operations.push(defaultSubmitAction)
      }
      break
    case FORM_MODE.ADD:
      addSchema(fields)
      if (!find(operations, { action: 'submit' })) {
        operations.push(defaultSubmitAction)
      }
      break;
    case FORM_MODE.SEARCH:
      addSchema(fields)
      break
    default:
      throw new Error('schemaForm must set the "mode" property')
  }
  schemaFormat(fields, standardSchema.scope)

  // createObserver(standardSchema, fields)
  return standardSchema

}


function schemaFormat (fields, scope) {
  fields.forEach(field => {
    field.scope = scope
    field._key = field.key
    field.isCustomField = !isString(field.component)
    if (isString(field.required)){
      field.requireRemindMessage = field.required
    } else if (isFunction(field.required)){
      field.requiredAction = field.required
    }

    field.required = !!field.required
    normalizeOptions(field)
    normalizeWatch(field)
    normalizeValidate(field)
  })
}


function normalizeValidate (field){
  const validators = []
  const { component, required, requireRemindMessage } = field
  switch (component){
    case 'input':
      validators.push(validatorLength)
      break;
    case 'picker':
      if (required){
        const _required = true
        // if (isFunction(required) && required(value)){
        //   _required = required(value)
        // }
        if (_required){
          validators.push(({ value })=>{
            if (value.length===0){
              return requireRemindMessage || `请填写[${field.label || field.key}]`
            }
          })
        }
      }

      break;
    default:break;
  }
  // if (field.validator) validators.push(field.validator)
  // field.validator = awarpValidator(field.key, validators)
}


function validatorLength ({ field, value }){
  const { maxLength, minLength, label, key } = field
  const fieldName = label || key
  if (isString(value)){
    if (maxLength && maxLength < value.length) {
      return `[${fieldName}]长度不能超过 ${maxLength} 个字符`
    }
    if (minLength && minLength > value.length) {
      return `[${fieldName}]长度不能小于 ${maxLength} 个字符`
    }
  }
}

// 数据验证
// todo 使用form 本身的验证机制来处理
/* eslint no-restricted-syntax:0 no-await-in-loop:0 */
export async function validator ({ fields, formData }){

  let errorInfo
  for (const field of fields){
    const { validator, required = false, key, requireRemindMessage, label, maxLength, minLength } = field
    let value = formData[key]

    const fieldName = label || key
    if (isString(value)){
      value = trim(value)
      if (maxLength && maxLength < value.length) {
        errorInfo = `[${fieldName}]长度不能超过 ${maxLength} 个字符`
        break
      }
      if (minLength && minLength > value.length) {
        errorInfo = `[${fieldName}]长度不能小于 ${maxLength} 个字符`
        break
      }
    }

    if (required!==false){
      if (isFunction(required) && required(value)){
        errorInfo = requireRemindMessage || `请填写[${fieldName}]`
        break
      } else if (!value){
        errorInfo = requireRemindMessage || `请填写[${fieldName}]`
        break
      }
    }

    if (validator){
      errorInfo = await validator({ value, entity:formData })
      if (errorInfo) break
    }
  }

  return errorInfo
}



const defaultSubmitAction = {
  type: 'primary',
  action: 'submit',
  label: '保存',
  onClick: 'default'
}

function addSchema (fields) {
  fields.forEach((field) => {
    field.disabled = field.readOnly || false
    if (!field.required) field.optionalLabel = true
  })
}

function detailSchema (fields) {
  fields.forEach(field => {
    field.disabled = true
  })
}

function modifySchema (fields) {
  fields.forEach(field => {
    if (field.modifiable === false) {
      field.disabled = true
    } else {
      field.disabled = false
    }

    if (!field.required) field.optionalLabel = true
  })
}

function normalizeOptions (field) {
  const { options } = field
  switch (typeof options) {
    case 'function':
      field.optionConfig = {
        action: options
      }
      field.options = []
      break;
    case 'object':
      const { watch, action } = options
      if (!isFunction(action)) break
      field.optionConfig = { action }
      if (isArray(watch)) {
        field.optionConfig.watch = watch
      } else if (isString(watch)) {
        field.optionConfig.watch = [watch]
      }
      field.options = []
      break;
    default: break
  }
}

function normalizeWatch (field) {
  const { watch } = field
  if (!watch) return
  const _watcher = {}
  let _watch = watch
  if (isObject(watch)) {
    _watch = [watch]
  }
  _watch.forEach(({ key, action }) => {
    switch (typeof key) {
      case 'object':
        key.forEach(_key => {
          addWatcher(_watcher, _key, action)
        })
        break
      case 'string':
        addWatcher(_watcher, key, action)
        break
      default:
        console.error('watch 属性的key只接受 array与string')
    }
  })
  field.watcher = _watcher
}

function addWatcher (watcher, key, action) {
  if (watcher[key]) {
    watcher[key].push(action)
  } else {
    watcher[key] = [action]
  }
}

// 添加一个属性的监听方法
function addListener (observers, listener, target, action) {
  // 获取观察者列表
  if (!Object.prototype.hasOwnProperty.call(observers, target)) observers[target] = []
  const _observer = observers[target]
  const _listener = find(_observer, { listener })
  // 如果已存在对应属性的监听，则将方法加入到callback列表
  if (_listener) {
    _listener.callback.push(action)
  } else {
    _observer.push({ listener, callback: [action] })
  }

}


// 执行监听
export function callListener ({ observers, target, newValue, entity }) {
  if (Object.prototype.hasOwnProperty.call(observers, target)) {
    const results = {}
    const targetObserver = observers[target]
    for (let i = 0; i < targetObserver.length; i++) {
      const { listener, callback } = targetObserver[i]
      const oldValue = entity[target] ? entity[target].value : undefined
      const listenerValue = entity[listener] ? entity[listener].value : undefined
      const newListenerValue = callback(listenerValue, { newValue, oldValue })
      Object.assign(results, { [listener]: newListenerValue })
    }
    return results
  }
  return {}
}
