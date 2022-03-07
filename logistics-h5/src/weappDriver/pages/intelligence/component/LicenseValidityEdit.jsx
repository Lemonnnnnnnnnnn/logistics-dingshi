import React, { useState, useEffect } from 'react';
import { SchemaForm, Item, Observer } from '@gem-mine/mobile-schema-form'
import BigItem from '@/weappDriver/components/uploadImg/addComponent/BigItem'
import Calender from '@/components/DatePicker'
import hasHeader from '@/assets/driver/header_default.png'
import { getNowUser, getOcrDrivingLicense, driversUpdateCertificate } from '@/services/apiService'
import {
  Card,
  WhiteSpace,
  Toast,
  Flex,
  Modal,
} from 'antd-mobile'
import DebounceFormButton from '@/components/DebounceFormButton'
import noHeader from '@/assets/driver/back_default.png'
import { DRIVER_LICENSE_TYPE } from '@/constants/driver/driver'
import SwitchItem from '@/weappDriver/components/SwitchItem'
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
    licenseFrontDentryid: {
      label: '上传驾驶证正页',
      component: BigItem,
      saveIntoBusiness: true,
      max: 1,
      backImg: hasHeader,
      rules: {
        required: [true, '请上传驾驶证正页'],
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
      },
      afterUpload: async (licenseFrontDentryid, { form }) => {
        let ocrData = {}
        if (licenseFrontDentryid?.[0]) {
          try {

            Toast.loading('证件识别中', 100)
            ocrData = await getOcrDrivingLicense({ drivingLicenseDentryId: licenseFrontDentryid })
            Toast.hide()
            const { termOfValidity, quasiDrivingType } = ocrData
            if (termOfValidity === '长期') {
              const licenseValidityType = 2
              const licenseType = DRIVER_LICENSE_TYPE.find(item => item.text === quasiDrivingType)?.value
              form.setFieldsValue({ licenseValidityType, licenseType: [licenseType] })
            } else {
              const licenseValidityDate = `${termOfValidity.slice(0, 4)}/${termOfValidity.slice(4, 6)}/${termOfValidity.slice(6)}`
              const licenseType = DRIVER_LICENSE_TYPE.find(item => item.text === quasiDrivingType)?.value
              form.setFieldsValue({ licenseValidityDate, licenseType: [licenseType], licenseValidityType: 1 })
            }
          } catch (e) {
            console.log(e)
          }
        }

      }
    },
    licenseViceDentryid: {
      label: '上传驾驶证副页',
      component: BigItem,
      saveIntoBusiness: true,
      imageStyle: {
        width: '225px',
        height: '125px',
        display: 'block',
        margin: '0 auto'
      },
      max: 1,
      backImg: noHeader,
      rules: {
        required: [true, '请上传驾驶证副页'],
      },
      previewConfig: {
        width: 300,
        height: 300
      }
    },
    licenseNo: {
      label: '*驾驶证号',
      component: 'text',
      placeholder: '请输入驾驶证号',
    },
    licenseType: {
      label: '*驾驶证类型',
      component: 'picker',
      disabled : true,
      placeholder: '请选择驾驶证类型',
      options: () => DRIVER_LICENSE_TYPE.map(item => ({ ...item, label: item.text }))
    },
    licenseValidityDate: {
      component: Observer({
        watch: 'licenseValidityType',
        action: (licenseValidityType) => {
          if (!licenseValidityType || licenseValidityType === 1) return Calender
          return 'hide'
        }
      }),
      label: '*驾驶证有效期',
      placeholder: '请选择驾驶证有效期',
    },
    _licenseValidityDate: {
      component: Observer({
        watch: 'licenseValidityType',
        action: licenseValidityType => {
          if (licenseValidityType === 2) return () => (
            <Flex style={{ margin: '9.5px 0 ' }} className='am-input-label' justify='between'>
              <span>*驾驶证有效期</span>
              <span>长期</span>
            </Flex>)
          return 'hide'
        }
      })
    },
    licenseValidityType: {
      component: SwitchItem,
    },
  }

  const submitForm = (value) => {
    if ((!value.licenseValidityType || value.licenseValidityType === 1) && !value.licenseValidityDate) return Toast.fail('请填写驾驶证有效期')
    if (!value.licenseType) return Toast.fail('请选择驾驶证类型')
    Toast.loading('认证识别上传中...预计等待1分钟', 0)
    const params = {
      licenseFrontDentryid: value.licenseFrontDentryid[0],
      licenseViceDentryid: value.licenseViceDentryid[0],
      // licenseNo: value.licenseNo,
      // licenseType: value.licenseType[0],

      licenseValidityType: value.licenseValidityType,
      licenseValidityDate: moment(value.licenseValidityDate).endOf('day').format('YYYY/MM/DD HH:mm:ss'),
    }
    if (params.licenseValidityType === 2) delete params.licenseValidityDate

    driversUpdateCertificate(params).then(() => {
      Toast.hide()
      alert('修改成功', '', [
        { text: 'OK', onPress: () => router.replace('intelligence') },
      ])
    })
  }

  useEffect(() => {
    getNowUser().then(data => {
      setFormData({
        licenseFrontDentryid: [data.licenseFrontDentryid],
        licenseViceDentryid: [data.licenseViceDentryid],
        licenseType: [data.licenseType],
        licenseNo: data.idcardNo,
        licenseValidityDate: data.licenseValidityDate,
        licenseValidityType: data.licenseValidityType,
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
          title="驾驶证"
        />
        <div styleName='card_body'>
          <p styleName='font_size14'>
            <span styleName='red'>*</span>
            <span>请确保驾驶证照片</span>
            <span styleName='red'>字体清晰、边框完整、亮度均匀</span>
          </p>
          <div styleName='image_box'>
            <Item field='licenseFrontDentryid' />
            <WhiteSpace styleName='height5' />
            <Item field='licenseViceDentryid' />
          </div>
          <Item field='licenseType' />
          <Item field='licenseNo' />
          <Item field='licenseValidityDate' />
          <Item field='_licenseValidityDate' />
          <Item field='licenseValidityType' />
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