import React from 'react'
import CSSModules from 'react-css-modules'
import { Card, WhiteSpace, Toast, Modal, Flex } from 'antd-mobile'
import WxImageViewer from 'react-wx-images-viewer';
import router from 'umi/router'
import { connect } from 'dva'
import { SchemaForm, Item, FormButton, ErrorNoticeBar, Observer } from '@gem-mine/mobile-schema-form'
import DebounceFormButton from '@/components/DebounceFormButton'
import { AXLES_NUM_OPTIONS, HEAD_STOCK_OPTIONS } from '@/constants/car'
import { isArray, businessNameToTempName, omit, getWeight } from '@/utils/utils'
import Calender from '@/components/DatePicker'
import { DICTIONARY_TYPE } from '@/services/dictionaryService'
import { getCars, completeCarInfo, ocrVehicleLicenseOcr, getNowUser, getCarsDrivingLicenseValidityDateOcr } from '@/services/apiService'
import hasHeader from '@/assets/driver/header_default.png'
import numTemp from '@/assets/numTemp.png'
import noHeader from '@/assets/driver/back_default.png'
import BigItem from '@/weappDriver/components/uploadImg/addComponent/BigItem'
import moment from 'moment'
import CategoryListCheckBox from './component/CategoryListCheckBox'
import styles from './carCertification.less'
import '@gem-mine/mobile-schema-form/src/fields'

function getDrivingLicenseValidityDate (inspectionRecordDate, drivingLicenseValidityDate) {
  if (!inspectionRecordDate) {  // 识别为空
    Modal.alert('行驶证有效期识别为空', '请手工填写行驶证有效期')
    return drivingLicenseValidityDate;
  }

  const date = moment(inspectionRecordDate).diff(moment(drivingLicenseValidityDate)) < 0 ? drivingLicenseValidityDate : inspectionRecordDate // 取最新的
  if (moment(date).diff(moment()) < 0) {
    Modal.alert('行驶证有效期已过期', '请补传副页背面或及时去进行车检')
  }
  return date
}

const { alert } = Modal

@connect(state => ({
  dictionaries: state.dictionaries.items,
}), null)
@CSSModules(styles, { allowMultiple: true })
export default class CarCertification extends React.Component {
  state = {
    errors: [],
    data: {},
    urls: [numTemp],
    ready: false
  }



  constructor (props) {
    super(props)
    this.formSchema = {
      hide: {
        component: 'hide',
        value: ({ form }) => {
          this._form = form
        },
        keepAlive: false
      },
      drivingLicenseFrontDentryid: {
        label: '请上传行驶证正页',
        component: BigItem,
        max: 1,
        backImg: hasHeader,
        rules: {
          required: [true, '请上传行驶证正页'],
        },
        saveIntoBusiness: true,
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

        afterUpload: async (drivingLicenseFrontDentryid, { formData, form }) => {
          const { engineNo, frameNo } = formData
          let _ocrData = {}
          if (drivingLicenseFrontDentryid?.[0]) {
            try {
              Toast.loading('行驶证识别中', 100)
              _ocrData = await ocrVehicleLicenseOcr({ drivingLicenseDentryId: drivingLicenseFrontDentryid?.[0], vehicleLicenseSide: 'front' })
            } catch (error) {
              console.log(error)
            }
            const { vehicleIdentificationNumber, engineNumber } = _ocrData
            form.setFieldsValue({ frameNo: vehicleIdentificationNumber || frameNo, engineNo: engineNumber || engineNo })
            Toast.hide()
          }
          // return _ocrData.engineNumber || engineNo
        }
      },
      drivingLicenseBackDentryid: {
        label: '请上传行驶证副页正面',
        component: BigItem,
        max: 1,
        backImg: noHeader,
        saveIntoBusiness: true,
        rules: {
          required: [true, '请上传行驶证副页正面'],
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
        afterUpload: async (drivingLicenseBackDentryid, { formData, form }) => {
          const { carLength, carWeight, carLoad, drivingLicenseValidityDate } = formData
          let _ocrData = {}

          // function getDrivingLicenseValidityDate(inspectionRecordDate) {
          //   let date;
          //   if (!inspectionRecordDate) {  // 识别为空
          //     Modal.alert('行驶证有效期识别为空', '请手工填写行驶证有效期')
          //     date = drivingLicenseValidityDate
          //   } else if (moment(inspectionRecordDate).diff(moment(drivingLicenseValidityDate)) < 0) {
          //     date = drivingLicenseValidityDate // 取识别出最新的
          //   } else if (moment(inspectionRecordDate).diff(moment()) < 0) {
          //     Modal.alert('行驶证有效期已过期', '请补传副页背面或及时去进行车检')
          //     date = drivingLicenseValidityDate
          //   } else {
          //     date = moment(inspectionRecordDate).format('YYYY-MM-DD')
          //   }
          //   return date
          // }

          if (drivingLicenseBackDentryid?.[0]) {
            try {
              Toast.loading('行驶证识别中', 100)
              _ocrData = await ocrVehicleLicenseOcr({ drivingLicenseDentryId: drivingLicenseBackDentryid?.[0], vehicleLicenseSide: 'back' })
            } catch (error) {
              console.log(error)
            }
            /*
            * 总质量没有数据，就识别整备质量+核定载质量/或准牵引总质量有数据的一条
            * 运输重量识别行驶证上的“核定载质量”或者“准牵引总质量”，取有数据的。
            *
            * 准牵引总质量：carWeight
            * 总质量：carLoad
            * 核定载质量：ratifiedLoadCapacity
            * 整备质量：curbWeight
            * */

            const { carLength: _carLength, carWeight: _carWeight, carLoad: _carLoad, ratifiedLoadCapacity, curbWeight, inspectionRecordDate } = _ocrData
            const carLoadVal = getWeight(ratifiedLoadCapacity) || getWeight(_carWeight)
            const carWeightVal = getWeight(_carLoad) || (getWeight(curbWeight) + (getWeight(ratifiedLoadCapacity) || getWeight(_carWeight)))

            form.setFieldsValue({
              carLength: _carLength || carLength,
              carWeight: carWeightVal || carWeight,
              carLoad: carLoadVal || carLoad,
              drivingLicenseValidityDate: getDrivingLicenseValidityDate(inspectionRecordDate, drivingLicenseValidityDate)
            })
            Toast.hide()
          }
          // return _ocrData.engineNumber || engineNo
        },
      },
      drivingLicenseBackDentryidLast: {
        label: '请上传行驶证副页背面',
        component: BigItem,
        max: 1,
        backImg: noHeader,
        saveIntoBusiness: true,
        // rules: {
        //   required: [true, '请上传行驶证副页背面'],
        // },
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
        afterUpload: async (drivingLicenseBackDentryidLast, { formData, form }) => {
          const { drivingLicenseValidityDate } = formData

          let _ocrData = {}
          if (drivingLicenseBackDentryidLast?.[0]) {
            try {
              Toast.loading('行驶证识别中', 100)
              _ocrData = await getCarsDrivingLicenseValidityDateOcr({ drivingLicenseBackDentryidLast: drivingLicenseBackDentryidLast?.[0] })
            } catch (error) {
              console.log(error)
            }

            const { drivingLicenseValidityDate: _drivingLicenseValidityDate } = _ocrData

            form.setFieldsValue({
              // drivingLicenseValidityDate: _drivingLicenseValidityDate || drivingLicenseValidityDate,/*  */
              drivingLicenseValidityDate: getDrivingLicenseValidityDate(_drivingLicenseValidityDate, drivingLicenseValidityDate)
            })
            Toast.hide()
          }
        }
      },
      carLength: {
        label: '*车长(mm)',
        component: 'inputItem',
        rules: {
          required: [true, '请输入车长'],
          pattern: /^\d+(\.\d+)?$/
        },
        placeholder: '请输入车长',
      },
      carWeight: {
        label: '*总质量(kg)',
        component: 'inputItem',
        rules: {
          required: [true, '总质量'],
          pattern: /^\d+(\.\d+)?$/
        },
        placeholder: '请输入总质量',
      },
      carLoad: {
        component: 'inputItem',
        label: '*运输重量(kg)',
        rules: {
          required: [true, '请输入运输重量'],
          pattern: /^\d+(\.\d+)?$/
        },
        placeholder: '请输入运输重量',
      },
      drivingLicenseValidityDate: {
        label: '*行驶证有效期限',
        component: Calender,
        rules: {
          required: [true, '请选择行驶证有效期限']
        },
      },
      carNo: {
        label: '*车牌号码',
        component: 'inputItem',
        rules: {
          required: [true, '请输入车牌号码'],
          pattern: /^[京津沪渝冀豫云辽黑湘皖鲁新苏浙赣鄂桂甘晋蒙陕吉闽贵粤青藏川宁琼使领A-Z]{1}[A-Z]{1}[A-Z0-9]{4}[A-Z0-9挂学警港澳]{1}$/
        },
        editable: false,
        placeholder: '请核实行驶证上的车牌号码',
      },
      engineNo: {
        label: '*发动机号',
        component: 'inputItem',
        rules: {
          required: [true, '请输入发动机号']
        },
        placeholder: '请核实行驶证的发动机号',
      },
      frameNo: {
        label: '*车架号',
        component: 'inputItem',
        rules: {
          required: [true, '请输入车架号']
        },
        placeholder: '请核实行驶证的车架号',
      },
      roadTransportDentryid: {
        label: '请上传道路运输证图片',
        component: BigItem,
        saveIntoBusiness: true,
        max: 1,
        backImg: noHeader,
        rules: {
          required: [true, '请上传道路运输证图片'],
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
      roadTransportNo: {
        label: '*道路运输证号',
        component: 'inputItem',
        labelNumber: 7,
        rules: {
          required: [true, '请输入道路运输证号']
        },
        placeholder: '请输入',
      },
      transportLicenseNo: {
        label: '*道路运输经营许可证号',
        component: 'inputItem',
        className: 'smallLabel',
        labelNumber: 9,
        rules: {
          required: [true, '请输入道路运输经营许可证号']
        },
        placeholder: '请输入',
      },
      carFrontDentryid: {
        label: '请上传车头照片',
        component: BigItem,
        max: 1,
        saveIntoBusiness: true,
        backImg: noHeader,
        rules: {
          required: [true, '请上传车头照片'],
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
      carBodyDentryid: {
        label: '请上传车身图片',
        component: BigItem,
        saveIntoBusiness: true,
        max: 1,
        backImg: noHeader,
        // rules: {
        //   required: [true, '请上传车身图片'],
        // },
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
      categoryList: {
        component: CategoryListCheckBox,
      },
      carType: {
        label: '*车型',
        component: 'picker',
        placeholder: '请选择车型',
        rules: {
          required: [true, '请选择车型']
        },
        options: () => {
          const cars = props.dictionaries.filter(item => item.dictionaryType === DICTIONARY_TYPE.CAR_TYPE)
          return cars.map(item => ({ label: item.dictionaryName, key: item.dictionaryId, value: item.dictionaryCode }))
        }
      },

      axlesNum: {
        component: 'picker',
        label: '*轴数',
        rules: {
          required: [true, '请选择轴数'],
        },
        placeholder: '请选择轴数',
        options: AXLES_NUM_OPTIONS
      },
      isHeadstock: {
        component: 'picker',
        label: '*是否车头',
        rules: {
          required: [true, '请选择是否车头'],
        },
        placeholder: '请选择是否车头',
        options: HEAD_STOCK_OPTIONS,
        // defaultValue : [true]
      },
    }
    this.lastData = JSON.parse(localStorage.getItem('lastSaveCar')) || {}
  }

  componentDidMount () {
    const { location: { query: { carId } } } = this.props

    const nowUserData = this.lastData[carId] || {}

    if (carId) {
      getCars({ carId })
        .then(res => {

          this.setState({
            ready: true,
            data: {
              ...res,
              ...nowUserData,
              carType: res.carType ? [res.carType] : [],
              axlesNum: res.axlesNum ? [res.axlesNum] : [],
              isHeadstock: res.isHeadstock ? [res.isHeadstock] : [true],
              drivingLicenseFrontDentryid: nowUserData.drivingLicenseFrontDentryid || res.drivingLicenseFrontDentryid || undefined, // 行驶证照片（正面）
              drivingLicenseBackDentryid: nowUserData.drivingLicenseBackDentryid || res.drivingLicenseBackDentryid || undefined,  // 行驶证照片（副面首页）
              drivingLicenseBackDentryidLast: nowUserData.drivingLicenseBackDentryidLast || res.drivingLicenseBackDentryidLast || undefined, // 行驶证照片（副面末页）
              roadTransportDentryid: nowUserData.roadTransportDentryid || res.roadTransportDentryid || undefined, //  道路运输证照片
              carFrontDentryid: nowUserData.carFrontDentryid || res.carFrontDentryid || undefined, // 车头照片
              carBodyDentryid: nowUserData.carBodyDentryid || res.carBodyDentryid || undefined,  // 车身照片
              drivingLicenseValidityDate: nowUserData.drivingLicenseValidityDate || res.drivingLicenseValidityDate || undefined,  // 行驶证有效期
              categoryList: res.categoryList ? res.categoryList.map(item => ({ categoryId: item.categoryId, categoryName: item.categoryName })) : [],
            }
          })
        })
    } else {
      this.setState({
        ready: true,
      })
    }

  }

  componentWillUnmount () {
    const data = this._form.getFieldsValue()
    const { location: { query: { carId } } } = this.props
    // const { success } = this.state

    const { lastData } = this
    // if (!success) {
    localStorage.setItem('lastSaveCar', JSON.stringify({ ...lastData, [carId]: data }))
    // }
  }

  submitForm = (value) => {
    const { location: { query: { carId } } } = this.props
    if (!value.categoryList || !value.categoryList.length) {
      return Toast.info('请选择车辆类型！')
    }
    const params = {
      drivingLicenseFrontDentryid: isArray(value.drivingLicenseFrontDentryid) ? value.drivingLicenseFrontDentryid[0] : value.drivingLicenseFrontDentryid, // 行驶证照片（正面）
      drivingLicenseBackDentryid: isArray(value.drivingLicenseBackDentryid) ? value.drivingLicenseBackDentryid[0] : value.drivingLicenseBackDentryid, // 行驶证照片（副面首页）
      drivingLicenseBackDentryidLast: isArray(value.drivingLicenseBackDentryidLast) ? value.drivingLicenseBackDentryidLast[0] : value.drivingLicenseBackDentryidLast, // 行驶证照片（副面末页）

      roadTransportDentryid: isArray(value.roadTransportDentryid) ? value.roadTransportDentryid[0] : value.roadTransportDentryid, //  道路运输证照片
      carFrontDentryid: isArray(value.carFrontDentryid) ? value.carFrontDentryid[0] : value.carFrontDentryid, // 车头照片
      carBodyDentryid: isArray(value.carBodyDentryid) ? value.carBodyDentryid[0] : value.carBodyDentryid, // 车身照片
      drivingLicenseValidityDate: moment(value.drivingLicenseValidityDate).startOf('day').format('YYYY/MM/DD HH:mm:ss'),  // 行驶证有效期
      carNo: value.carNo,
      engineNo: value.engineNo,
      frameNo: value.frameNo,
      roadTransportNo: value.roadTransportNo,
      transportLicenseNo: value.transportLicenseNo,
      carLength: value.carLength,
      carWeight: value.carWeight,
      carType: value.carType[0],
      carLoad: value.carLoad,
      axlesNum: value.axlesNum[0],
      isHeadstock: value.isHeadstock[0],
      categoryIdList: value.categoryList.map(item => item.categoryId),
    }
    Toast.loading('资料识别中，预计等待1分钟...', 0)
    completeCarInfo({ ...params, carId })
      .then(() => {
        Toast.hide()
        alert('上传成功', '请等待审核结果', [
          { text: 'OK', onPress: () => router.goBack() },
        ])
      })
  }

  watchSignPicture = () => {
    this.setState({
      showPicture: true
    })
  }

  closeSignPicture = () => {
    this.setState({
      showPicture: false
    })
  }

  toService = () => {
    router.push('/WeappDriver/customerService')
  }

  renderErrors = (errors) => {
    Toast.fail(errors[0])
  }

  render () {
    const { errors, data, ready, showPicture, urls } = this.state
    const wxImageViewerProps = {
      onClose: this.closeSignPicture,
      urls
    }
    return (
      ready &&
      <div styleName='container'>
        <div styleName='container_box'>
          <SchemaForm schema={this.formSchema} data={data}>
            <Item field='hide' />
            <ErrorNoticeBar errors={errors} />
            <Card className='weappDriver_certification_card_title'>
              <Card.Header
                title="行驶证"
              />
              <div styleName='card_body'>
                <p styleName='font_size14'>
                  <span styleName='red'>*</span>
                  <span>请确保行驶证照片</span>
                  <span styleName='red'>字体清晰、边框完整、亮度均匀</span>
                </p>
                <div styleName='image_box'>
                  <Item field='drivingLicenseFrontDentryid' />
                  <WhiteSpace styleName='height5' />
                  <Item field='drivingLicenseBackDentryid' />
                  <Item field='drivingLicenseBackDentryidLast' />
                  <WhiteSpace styleName='height5' />
                </div>
                <Item field='drivingLicenseValidityDate' />
                <Item field='carNo' />
                <Item field='engineNo' />
                <Item field='frameNo' />
                <Item field='carLength' />
                <Item field='carWeight' />
                <Item field='carLoad' />
              </div>
            </Card>
            <WhiteSpace styleName='height15' />
            <Card className='weappDriver_certification_card_title'>
              <Card.Header
                title="道路运输证"
              />
              <div styleName='card_body'>
                <p styleName='font_size14'>
                  <span styleName='red'>*</span>
                  <span>请确保道路运输证照片</span>
                  <span styleName='red'>字体清晰、边框完整、亮度均匀</span>
                </p>
                <p styleName='font_size14'>
                  <span>*请点击查看示例，</span>
                  <span onClick={this.watchSignPicture} style={{ color: '#02A7F0', textDecoration: 'underline' }}>查看示例</span>
                </p>
                <div styleName='image_box'>
                  <WhiteSpace styleName='height5' />
                  <Item field='roadTransportDentryid' />
                  <WhiteSpace styleName='height5' />
                </div>
                <Item field='roadTransportNo' />
                <Item field='transportLicenseNo' />
              </div>
            </Card>
            <WhiteSpace styleName='height15' />
            <Card className='weappDriver_certification_card_title'>
              <Card.Header
                title="其他信息"
              />
              <div styleName='card_body'>
                <p styleName='font_size14'>
                  <span styleName='red'>*</span>
                  <span>请确保车头照片</span>
                  <span styleName='red'>字体清晰、边框完整、亮度均匀</span>
                </p>
                <div styleName='image_box'>
                  <Item field='carFrontDentryid' />
                  <Item field='carBodyDentryid' />
                </div>
                <Flex justify='between' style={{ margin: '3px 0 ' }}>
                  <div style={{ fontSize: '14px' }}>*车辆类型</div>
                  <Item field='categoryList' />
                </Flex>

                <Item field='carType' />
                <Item field='axlesNum' />
                <Item field='isHeadstock' />
              </div>
            </Card>
            <WhiteSpace styleName='height15' />
            <div styleName='footer_box'>
              <div styleName='footer_container'>
                <p styleName='chat'>认证出现问题，立即<span onClick={this.toService}>联系客服</span></p>
                <DebounceFormButton debounce type='primary' label='提交' onError={this.renderErrors} onClick={this.submitForm} />
              </div>
            </div>
            {showPicture && <WxImageViewer {...wxImageViewerProps} />}
          </SchemaForm>
        </div>
      </div>
    )
  }
}
