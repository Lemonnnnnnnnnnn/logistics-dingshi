import React, { Component } from 'react'
import CSSModules from 'react-css-modules'
import { Icon, message, Spin } from 'antd'
import {
  Card,
  WhiteSpace,
  Toast,
  Modal,
  DatePicker,
  List,
  Flex,
  Switch,
} from 'antd-mobile'
import moment from 'moment'
import zhCN from 'antd-mobile/lib/date-picker/locale/zh_CN';
import router from 'umi/router'
import { SchemaForm, Item, FormButton, Observer } from '@gem-mine/mobile-schema-form'
import DebounceFormButton from '@/components/DebounceFormButton'
import Calender from '@/components/DatePicker'
import { omit, dealWithErrorDate } from '@/utils/utils'
import hasHeader from '@/assets/driver/header_default.png'
import noHeader from '@/assets/driver/back_default.png'
import { patchCompleteInformation, getNowUser, getOcrIdCard, getOcrDrivingLicense } from '@/services/apiService'
import BigItem from '@/weappDriver/components/uploadImg/addComponent/BigItem'
import { DRIVER_LICENSE_TYPE } from '@/constants/driver/driver'
import SwitchItem from '@/weappDriver/components/SwitchItem'
import styles from './certification.less'
import '@gem-mine/mobile-schema-form/src/fields'

const { alert } = Modal

@CSSModules(styles, { allowMultiple: true })
export default class UnComplete extends Component {

  state = {
    ready: false,
  }

  lastData = JSON.parse(localStorage.getItem('lastSave')) || {}

  formSchema = {
    hide:{
      component:'hide',
      value:({ form }) => {
        this._form = form
      },
      keepAlive:false
    },
    idcardFrontDentryid: {
      label: '上传身份证人像面',
      component: BigItem,
      max: 1,
      saveIntoBusiness:true,
      backImg: hasHeader,
      rules: {
        required: [true, '请上传身份证人像面'],
      },
      imageStyle: {
        width: '223px',
        height: '123px',
        display: 'block',
        margin: '0 auto'
      },
      previewConfig: {
        width: 300,
        height: 300
      },
      afterUpload : async (idcardFrontDentryid, { form } )=>{
        let ocrData = {}
        if (idcardFrontDentryid?.[0]){
          try {
            Toast.loading('证件识别中', 100)
            ocrData = await getOcrIdCard({ idCardDentryId : idcardFrontDentryid, idCardSide : 'front' })
            Toast.hide()
            const { address } = ocrData
            let sex
            if (ocrData?.sex === '男') sex = 1
            if (ocrData?.sex === '女') sex = 2
            form.setFieldsValue({ idCardAddress : address, idCardSex :[sex] })
          } catch (e){
            console.log(e)
          }
        }
      }
    },
    idCardSex:{
      label : '性别',
      component: 'picker',
      options : [
        {
          key : 1,
          value : 1,
          label : '男'
        },
        {
          key : 2,
          value : 2,
          label : '女'
        },
      ],
      placeholder: '请输入性别',
    },
    idCardAddress:{
      label : '住址',
      component: 'textArea',
      placeholder: '请输入住址',
    },
    idIssuingAuthority:{
      label : '签发机关',
      component: 'inputItem',
      placeholder: '请输入签发机关',
    },
    idValidityDate:{
      label : '有效期限',
      component: Calender,
    },
    idcardBackDentryid: {
      label: '上传身份证背面',
      component: BigItem,
      saveIntoBusiness:true,
      max: 1,
      backImg: noHeader,
      rules: {
        required: [true, '请上传身份证背面'],
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
      afterUpload : async (idcardBackDentryid, { form })=>{
        let ocrData = {}
        if (idcardBackDentryid?.[0]){
          try {
            Toast.loading('证件识别中', 100)
            ocrData = await getOcrIdCard({ idCardDentryId : idcardBackDentryid, idCardSide : 'back' })
            Toast.hide()
            const { issuingAuthority, expiryDate } = ocrData
            let idValidityDate
            if (expiryDate !== '长期'){
              idValidityDate = `${expiryDate.slice(0, 4) }/${ expiryDate.slice(4, 6) }/${ expiryDate.slice(6)}`
            }
            form.setFieldsValue({ idIssuingAuthority : issuingAuthority, idValidityDate })
          } catch (e){
            console.log(e)
          }
        }

      }
    },
    nickName: {
      label: '*姓名',
      component: 'inputItem',
      rules: {
        required: [true, '请输入姓名'],
      },
      placeholder: '请输入姓名',
      disabled: true
    },
    idcardNo: {
      label: '*身份证号',
      component: 'inputItem',
      rules: {
        required: [true, '请输入身份证号'],
        pattern:[/^(([1][1-5])|([2][1-3])|([3][1-7])|([4][1-6])|([5][0-4])|([6][1-5])|([7][1])|([8][1-2]))\d{4}(([1][9]\d{2})|([2]\d{3}))(([0][1-9])|([1][0-2]))(([0][1-9])|([1-2][0-9])|([3][0-1]))\d{3}[0-9xX]$/, '请正确输入身份证号'],
      },
      placeholder: '请输入身份证号',
      disabled: true
    },
    licenseFrontDentryid: {
      label: '上传驾驶证正页',
      component: BigItem,
      saveIntoBusiness:true,
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
      afterUpload : async (licenseFrontDentryid, { form })=>{
        let ocrData = {}
        if (licenseFrontDentryid?.[0]){
          try {

            Toast.loading('证件识别中', 100)
            ocrData = await getOcrDrivingLicense({ drivingLicenseDentryId : licenseFrontDentryid })
            Toast.hide()
            const { termOfValidity, quasiDrivingType } = ocrData
            if (termOfValidity === '长期'){
              const licenseValidityType = 2
              const licenseType = DRIVER_LICENSE_TYPE.find(item=>item.text === quasiDrivingType)?.value
              form.setFieldsValue({ licenseValidityType, licenseType : [licenseType] })
            } else {
              const licenseValidityDate = `${termOfValidity.slice(0, 4) }/${ termOfValidity.slice(4, 6) }/${ termOfValidity.slice(6)}`
              const licenseType = DRIVER_LICENSE_TYPE.find(item=>item.text === quasiDrivingType)?.value
              form.setFieldsValue({ licenseValidityDate, licenseType : [licenseType], licenseValidityType : 1 })
            }
          } catch (e){
            console.log(e)
          }
        }

      }
    },
    licenseViceDentryid: {
      label: '上传驾驶证副页',
      component: BigItem,
      saveIntoBusiness:true,
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
      component: 'inputItem',
      rules: {
        required: [true, '请输入驾驶证号'],
      },
      placeholder: '请输入驾驶证号',
    },
    licenseType: {
      label: '*驾驶证类型',
      component: 'picker',
      rules: {
        required: [true, '请选择驾驶证类型'],
      },
      placeholder: '请选择驾驶证类型',
      options: () => DRIVER_LICENSE_TYPE.map(item => ({ ...item, label: item.text }))
    },
    licenseValidityDate: {
      component: Observer({
        watch : 'licenseValidityType',
        action : (licenseValidityType)=>{
          if (!licenseValidityType || licenseValidityType === 1 ) return Calender
          return 'hide'
        }
      }),
      label: '*驾驶证有效期',
      placeholder: '请选择驾驶证有效期',
    },
    _licenseValidityDate : {
      component : Observer({
        watch : 'licenseValidityType',
        action : licenseValidityType =>{
          if (licenseValidityType === 2) return ()=>(
            <Flex style={{ margin : '9.5px 0 ' }} className='am-input-label' justify='between'>
              <span>*驾驶证有效期</span>
              <span>长期</span>
            </Flex>)
          return 'hide'
        }
      })
    },
    licenseValidityType : {
      component : SwitchItem,
    },
    qualificationFrontDentryid: {
      label: '上传货物运输从业资格证',
      component: BigItem,
      saveIntoBusiness:true,
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
    qualificationValidityDate : {
      label : '资格证有效期',
      component: Calender,
      placeholder : '选择有效期'
    },
    driverCertificationCreateReqList: {
      component: Qualification
    },
    qualificationNumber: {
      component: 'inputItem',
      label: '*资格证号',
      placeholder: '根据身份证号自动填充',
      rules: {
        required: [true, '请填写货物运输从业资格证号']
      },
      disabled: true,
      value: Observer({
        watch: 'idcardNo',
        action: (idcardNo) => idcardNo
      })
    }
  }

  submitForm = (value) => {
    const flag = (value.driverCertificationCreateReqList || []).find(item => item.qualificationFrontDentryid && !item.qualificationValidityDate || !item.qualificationFrontDentryid && item.qualificationValidityDate)
    if (flag) return message.error('存在部分填写的资格证信息，请填写完整')
    if ((!value.licenseValidityType || value.licenseValidityType === 1) && !value.licenseValidityDate) return Toast.fail('请填写驾驶证有效期')
    if (!value.licenseType) return Toast.fail('请选择驾驶证类型')
    const driverCertificationCreateReqList = (value.driverCertificationCreateReqList || []).filter(item => item.qualificationFrontDentryid && item.qualificationValidityDate)
    Toast.loading('认证识别上传中...预计等待1分钟', 0)

    const params = {
      idcardFrontDentryid: value.idcardFrontDentryid[0],
      idcardBackDentryid: value.idcardBackDentryid[0],
      nickName: value.nickName,
      idcardNo: value.idcardNo,
      licenseFrontDentryid: value.licenseFrontDentryid[0],
      licenseViceDentryid: value.licenseViceDentryid[0],
      licenseNo: value.licenseNo,
      licenseType: value.licenseType[0],

      driverCertificationCreateReqList: driverCertificationCreateReqList.map(current => ({
        qualificationValidityDate: dealWithErrorDate(current.qualificationValidityDate) ? moment(current.qualificationValidityDate).utc().startOf('day').format() : undefined,
        qualificationFrontDentryid: current.qualificationFrontDentryid
      })),

      qualificationFrontDentryid: value.qualificationFrontDentryid[0],
      qualificationValidityDate : dealWithErrorDate(value.qualificationValidityDate) ? moment(value.qualificationValidityDate).startOf('day').format('YYYY/MM/DD HH:mm:ss') : undefined,

      qualificationNumber: value.qualificationNumber,
      isContainsRealNameInformation:true,
      idCardSex : value.idCardSex && value.idCardSex[0],
      idCardAddress : value.idCardAddress,
      idIssuingAuthority : value.idIssuingAuthority,
      idValidityDate : dealWithErrorDate(value.idValidityDate) ? moment(value.idValidityDate).startOf('day').format('YYYY/MM/DD HH:mm:ss') : undefined,
      licenseValidityType : value.licenseValidityType,
      licenseValidityDate: dealWithErrorDate(value.licenseValidityDate) ? moment(value.licenseValidityDate).startOf('day').format('YYYY/MM/DD HH:mm:ss') : undefined,
    }
    if (params.licenseValidityType === 2) delete params.licenseValidityDate

    patchCompleteInformation(params).then(() => {
      Toast.hide()
      this.setState({
        success:true
      })
      alert('上传成功', '请等待审核结果', [
        { text: 'OK', onPress: () => router.replace('intelligence') },
      ])
    })
  }

  componentDidMount () {
    getNowUser().then(data => {
      this.nowUser = data
      const nowUserData = this.lastData[data.userId] || {}

      localStorage.setItem('lastSave', JSON.stringify(omit(this.lastData, data.userId)))

      const { location: { query: { type } } } = this.props
      if (type === 'modify') {
        this.formData = {
          nickName: data.nickName,
          licenseNo: data.idcardNo,
          idcardNo: data.idcardNo,
          idCardAddress : data.idCardAddress,
          idCardSex : [data.idCardSex],
          idIssuingAuthority : data.idIssuingAuthority,
          idValidityDate : data.idValidityDate,
          idcardFrontDentryid: [data.idcardFrontDentryid],
          idcardBackDentryid: [data.idcardBackDentryid],
          licenseFrontDentryid: [data.licenseFrontDentryid],
          licenseViceDentryid: [data.licenseViceDentryid],
          licenseType: [data.licenseType],
          licenseValidityDate: data.licenseValidityDate,
          driverCertificationCreateReqList: (data.driverCertificationEntities || []).map((item, index) => ({
            id: index,
            qualificationValidityDate: item.certificationValidityDate,
            qualificationFrontDentryid: item.certificationDentryid
          })),
          qualificationValidityDate : data.qualificationValidityDate,
          qualificationFrontDentryid: [data.qualificationFrontDentryid],
          licenseValidityType : data.licenseValidityType,
          ...nowUserData
        }
      } else {
        this.formData = {
          nickName: data.nickName,
          licenseNo: data.idcardNo,
          idcardNo: data.idcardNo,
          ...nowUserData
        }
      }
      this.setState({
        ready: true,
      })
    })
  }

  componentWillUnmount (){
    const data = this._form.getFieldsValue()
    const { success } = this.state

    const { lastData, nowUser:{ userId } } = this
    if (!success) {
      localStorage.setItem('lastSave', JSON.stringify({ ...lastData, [userId]: data }))
    }
  }

  renderErrors = (errors) => {
    Toast.fail(errors[0])
  }

  toService = () => {
    router.push('/WeappDriver/customerService')
  }

  render () {
    const { ready } = this.state

    return (
      ready
      &&
      <div styleName='container'>
        <div styleName='container_box'>
          <SchemaForm schema={this.formSchema} data={this.formData}>
            <Card className='weappDriver_certification_card_title'>
              <Card.Header
                title="实名认证"
              />
              <div styleName='card_body'>
                <p styleName='font_size14'>
                  <span styleName='red'>*</span>
                  <span>请确保身份证照片</span>
                  <span styleName='red'>字体清晰、边框完整、亮度均匀</span>
                </p>
                <div styleName='image_box'>
                  <Item field='hide' />
                  <Item field='idcardFrontDentryid' />
                  <WhiteSpace styleName='height5' />
                  <Item field='idcardBackDentryid' />
                  <WhiteSpace styleName='height5' />
                </div>
                <Item field='nickName' />
                <Item field='idcardNo' />

                <Item field='idCardSex' />
                <Item field='idCardAddress' />
                <Item field='idIssuingAuthority' />
                <Item field='idValidityDate' />

              </div>
            </Card>
            <WhiteSpace styleName='height15' />
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
            <WhiteSpace styleName='height15' />
            <Card className='weappDriver_certification_card_title'>
              <Card.Header
                title="货物运输从业资格证"
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
            <WhiteSpace styleName='height15' />
            <Card className='weappDriver_certification_card_title'>
              <Card.Header
                title="资格证"
              />
              <div styleName='card_body'>
                <p styleName='font_size14'>
                  {/* <span styleName='red'>*</span> */}
                  <span>请确保下列资格证属于司机本人，如有违反，平台 有权停止支付运输费用，直到停止司机在本平台接单</span>
                  {/* <span styleName='red'>字体清晰、边框完整、亮度均匀</span> */}
                </p>
                <Item field='driverCertificationCreateReqList' />
              </div>
            </Card>
            <div styleName='footer_box'>
              <div styleName='footer_container'>
                <p styleName='chat'>认证出现问题，立即<span onClick={this.toService}>联系客服</span></p>
                <DebounceFormButton debounce type='primary' label='提交' onError={this.renderErrors} onClick={this.submitForm} />
              </div>
            </div>
          </SchemaForm>
        </div>
      </div>
    )
  }
}

@CSSModules(styles, { allowMultiple: true })
class Qualification extends React.Component{
  state = {
    info: []
  }

  componentDidMount () {
    const { value } = this.props
    if (value && value?.length > 0) {
      this.setInfo(value)
    }
  }

  bigItemProps = {
    backImg: noHeader,
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
    saveIntoBusiness:true,
    label: '上传资格证图片',
    max: 1
  }

  setInfo = (info) => {
    this.setState({
      info
    })
    this.props.onChange(info)
  }

  onChangeInfo = (val, index, type) => {
    const { info } = this.state
    if (type === 'img') info[index].qualificationFrontDentryid = val[0]
    if (type === 'date') {
      info[index].qualificationValidityDate = val
    }
    this.setInfo(info)
  }

  addQualification = () => {
    const { info } = this.state
    if (!info || info?.length === 0) {
      const tempArr = [{
        id: 0,
        qualificationFrontDentryid: '',
        qualificationValidityDate: ''
      }]
      this.setInfo(tempArr)
    }
    info.push({
      id: info.length,
      qualificationFrontDentryid: '',
      qualificationValidityDate: ''
    })
    this.setInfo(info)
  }

  renderLists = () => {
    const { info } = this.state
    return info.map((item, index) => (
      <>
        <div styleName='image_box'>
          <BigItem field={this.bigItemProps} value={item.qualificationFrontDentryid? [item.qualificationFrontDentryid]: []} onChange={val => this.onChangeInfo(val, index, 'img')} />
        </div>
        <DatePicker
          mode='date'
          locale={zhCN}
          value={item.qualificationValidityDate?new Date(moment(item.qualificationValidityDate)) : undefined}
          title='选择有效期'
          extra='选择有效期'
          minDate={new Date(new Date().getFullYear(), new Date().getMonth(), new Date().getDate(), new Date().getHours(), 60)}
          maxDate={new Date(2100, new Date().getMonth(), new Date().getDate(), new Date().getHours(), 60)}
          format={(date) => moment(new Date(date)).format('YYYY-MM-DD')}
          onChange={val => this.onChangeInfo(val, index, 'date')}
        >
          <List.Item arrow="horizontal">资格证有效期</List.Item>
        </DatePicker>
      </>
    ))
  }

  render () {
    return (
      <>
        {this.renderLists()}
        <div styleName="add_box" onClick={this.addQualification}>
          <Icon type="plus" /><span styleName='tips'>添加其他资格证</span>
        </div>
      </>
    )
  }
}


// class SwitchItem extends Component {
//   onHandleChange = (val) =>{
//     this.props.onChange(val ? 2 : 1)
//   }

//   render () {
//     const { value } = this.props
//     return (
//       <List>
//         <List.Item extra={<Switch checked={value === 2} onChange={this.onHandleChange} />}>
//           长期驾驶证
//         </List.Item>
//       </List>
//     );
//   }
// }
