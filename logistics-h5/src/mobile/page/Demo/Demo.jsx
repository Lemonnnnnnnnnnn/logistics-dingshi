import React, { Component } from 'react'
import { SchemaForm, FORM_MODE, Item } from '@gem-mine/mobile-schema-form'
import '@gem-mine/mobile-schema-form/src/fields'
import UpLoadImage from '@/mobile/page/driverApp/component/DriverUpLoadImage'

const schema = {
  'userName': {
    key: 'userName',
    component: UpLoadImage,
    // addMode:'button',
    // buttonProps:{
    //   buttonStyle:{
    //     width:'256px',
    //     margin:'0 0 10px 0',
    //     position:'relative',
    //     height:'58px',
    //     background:'rgba(84,104,255,1)',
    //     boxShadow:'0px 10px 25px 0px rgba(84,104,255,0.3)',
    //     borderRadius:'8px'
    //   },
    //   buttonIcon:<img style={{ position:'absolute', right:'0', top:'8px', width:'42px', height:'42px' }} alt="" />,
    //   buttonLabel:<div style={{ fontSize:'16px', fontWeight:600, lineHeight:'58px', color:'white', letterSpacing:'1px', display:'inline-block' }}>拍照或上传</div>
    // },
  }
}

export default class FormDemo extends Component {

  componentDidMount () {
    // console.warn('componentDidMount=', this.props)
  }

  render () {
    return (
      <SchemaForm schema={schema} mode={FORM_MODE.ADD}>
        <Item field='userName' />
      </SchemaForm>)
  }
}
