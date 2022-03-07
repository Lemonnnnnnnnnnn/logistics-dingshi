import React, { useState, useEffect } from 'react';
import { SchemaForm, Item, Observer } from '@gem-mine/mobile-schema-form'
import BigItem from '@/weappDriver/components/uploadImg/addComponent/BigItem'
import Calender from '@/components/DatePicker'
import hasHeader from '@/assets/driver/header_default.png'
import { getNowUser, driversUpdateCertificate } from '@/services/apiService'
import {
  Card,
  Toast,
  Modal
} from 'antd-mobile'
import { message } from 'antd'
import DebounceFormButton from '@/components/DebounceFormButton'
import router from 'umi/router'
import moment from 'moment'
import CSSModules from 'react-css-modules'
import styles from '../certification.less'
import '@gem-mine/mobile-schema-form/src/fields'

const { alert } = Modal

const Edit = () => {
  const [ready, setReady] = useState(false)
  const [formData, setFormData] = useState({})
  const formSchema = {
    qualificationFrontDentryid: {
      label: '上传货物运输从业资格证',
      component: BigItem,
      saveIntoBusiness: true,
      max: 1,
      backImg: hasHeader,
      rules: {
        required: [true, '上传货物运输从业资格证'],
      },
      imageStyle: {
        width: '225px',
        height: '125px',
        display: 'block',
        margin: '0 auto'
      },
      previewConfig: {
        width: 300,
        height: 300
      }
    },
    qualificationValidityDate: {
      label: '资格证有效期',
      component: Calender,
      placeholder: '选择有效期'
    },
    qualificationNumber: {
      component: 'text',
      label: '*货物运输从业资格证号',
      disabled: true,
    }
  }

  const submitForm = (value) => {
    Toast.loading('认证识别上传中...预计等待1分钟', 0)
    const params = {
      qualificationFrontDentryid: value.qualificationFrontDentryid[0],
      qualificationValidityDate: moment(value.qualificationValidityDate).endOf('day').format('YYYY/MM/DD HH:mm:ss'),
      // qualificationNumber: value.qualificationNumber,
    }

    driversUpdateCertificate(params).then(() => {
      Toast.hide()
      alert('修改成功', '', [
        { text: 'OK', onPress: () => router.replace('intelligence') },
      ])
    })
  }

  useEffect(() => {
    getNowUser().then(data => {
      console.log(data.idcardNo)
      setFormData({
        ...data,
        qualificationNumber : data.idcardNo,
        qualificationFrontDentryid: [data.qualificationFrontDentryid],
        qualificationValidityDate : data.qualificationValidityDate,
      })
      setReady(true)
    })
  }, [])

  const toService = () => {
    router.push('/WeappDriver/customerService')
  }

  const renderErrors = (errors) => {
    Toast.fail(errors[0])
  }

  return (ready &&
    <SchemaForm schema={formSchema} data={formData}>
      <Card className='weappDriver_certification_card_title'>

        <Card.Header
          title="资格证"
        />
        <div styleName='card_body'>
          <p styleName='font_size14'>
            <span styleName='red'>*</span>
            <span>请确保下列资格证属于司机本人，如有违反，平台 有权停止支付运输费用，直到停止司机在本平台接单</span>
            {/* <span styleName='red'>字体清晰、边框完整、亮度均匀</span> */}
          </p>
          <div styleName='image_box'>
            <Item field='qualificationFrontDentryid' />
          </div>
          <Item field='qualificationNumber' />
          <Item field='qualificationValidityDate' />
        </div>
      </Card>
      <div styleName='footer_box'>
        <div styleName='footer_container'>
          <p styleName='chat'>认证出现问题，立即<span onClick={toService}>联系客服</span></p>
          <DebounceFormButton type='primary' label='提交' onError={renderErrors} onClick={submitForm} />
        </div>
      </div>
    </SchemaForm> || null
  )
}

export default CSSModules(Edit, styles);