/**
 * 将 schema 转化为 react form 组件
 *
 * 需要解决的场景：
 *  1、filed 中为数组的情况
 *  2、个性化component 的实现, 包括验证等，是否需要提供一个FormItem 容器？
 *  4、
 *
 * @param schema
 */
import React from 'react'
import normalize from './normalize'
import FormCreate from './FormCreate'


export default class MobileForm extends React.Component {

  constructor (props) {
    super(props)
    this.FormComponent = this.createForm(props.mode)
  }

  componentWillReceiveProps ({ mode }){
    if (this.props.mode !== mode){
      this.FormComponent = this.createForm(mode)
    }
  }

  createForm (mode) {
    const { schema, onValuesChange } = this.props
    const normalizeSchema = normalize(schema, mode)

    @FormCreate({ normalizeSchema, onValuesChange })
    class FormComponent extends React.PureComponent {
      componentWillReceiveProps (nextProps){
        const { normalizeSchema, setNormalizeSchema } = this.props
        let hasChange = false
        const { operations } = normalizeSchema
        // todo 这种方式会造成两次调用，待优化
        operations.forEach((operate)=>{
          const { display, disabled } = operate
          if (display){
            const _display = display(nextProps)
            if (operate._display!==_display){
              operate._display = _display
              hasChange = true
            }
          }

          if (disabled){
            const _disabled = disabled(nextProps)
            if (operate._disabled !== _disabled){
              operate._disabled = _disabled
              hasChange = true
            }
          }
        })

        if (hasChange){
          setNormalizeSchema({ ...normalizeSchema })
        }
      }

      render () {
        return (
          <div className='mobile-form'>
            {this.props.children}
          </div>
        )
      }
    }
    return FormComponent
  }


  render () {
    const { FormComponent } = this
    return (
      <FormComponent {...this.props} />
    )
  }
}

