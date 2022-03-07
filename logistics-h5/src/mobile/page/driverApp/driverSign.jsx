import React, { Component } from 'react';
import { Card, Icon, Toast, Modal } from 'antd-mobile'
import { connect } from 'dva'
import { Map } from 'react-amap'
import { SchemaForm, Item, FormButton, FORM_MODE, Observer } from '@gem-mine/mobile-schema-form'
import WxImageViewer from 'react-wx-images-viewer';
import '@gem-mine/mobile-schema-form/src/fields'
import weightIcon from '@/assets/weightIcon.png'
import signIcon from '@/assets/signIcon.png'
import { useOcrGeneral, postTransportProcess } from '@/services/apiService'
import { getOssImg, businessNameToTempName, isNumber, isNaN, browser } from '@/utils/utils'
import driverArrow from '@/assets/driverArrow.png'
import pageBack from '@/assets/pageBack.png'
import save from '@/assets/save.png'
import formError from '@/assets/formError.png'
import nativeApi from '@/utils/nativeApi'
import transporModel from '@/models/transports'
import moment from 'moment'
import TipsBox from './component/TipsBox'
import FieldInput from './component/FieldInput'
import UpLoadImage from './component/DriverUpLoadImage'
import style from './driverPickup.less'

const { actions:{ detailTransports } } = transporModel

let needWeightOcr = true
let needSingOcr = true
const buttonText = (
  <div style={{ fontSize: '17px' }}>
    <img src={save} alt="" />
    <div style={{ color: 'white', marginLeft: '11px', display: 'inline-block', fontWeight: '600px', lineHeight: '59px' }}>保存</div>
  </div>
)

function mapStateToProps (state) {
  return {
    transport: state.transports.entity
  }
}

const errorWord = (
  <>
    <div>您还有未填写的项目</div>
    <div>请返回补充完成后再次保存</div>
  </>
)

@connect(mapStateToProps, { detailTransports })
class driverSign extends Component {

  location = {}

  state = {
    ready:false,
    overPoundDifference:false,
    showPicture:false,
    urls:[]
  }

  // 组件内部this存在指向问题
  overPoundButton = [
    { text: '继续保存', onPress: ()=>{ this.closeOverPoundModal(); this.postData() }, style:{ color: 'rgba(251,164,79,1)', fontSize:'18px', lineHeight:'50px' } },
  ]

  errorButton = [
    { text: '确定', onPress: ()=>this.closeErrorModal(), style:{ color: 'rgba(251,164,79,1)', fontSize:'18px', lineHeight:'50px' } },
  ]

  constructor (props){
    super(props)
    needWeightOcr = true
    needSingOcr = true
    window.amapkey = window.envConfig.mapWebKey
    nativeApi.hideHeader()
    this.mapEvents = {
      created: () => {
        window.AMap.plugin('AMap.Geolocation', () => {
          this.geolocation = new window.AMap.Geolocation();
        });
      }
    }
  }

  componentDidMount (){
    const { location:{ query: { transportId } }, detailTransports } = this.props
    detailTransports({ transportId })
      .then(data=>{
        const newSchema = this.reduceDeliverySchema(data.deliveryItems)
        const { billNumberType, transportBill, billPictureType } = data.logisticsBusinessTypeEntity || {};
        const billNumberTypeArray = (billNumberType || '').split(',');
        const billArray = (transportBill || '').split(',');
        const isSubmitWeigh = billArray.some(item => `${item}` === '2');
        const isSubmitSign = billArray.some(item => `${item}` === '3');
        this.autoBillNumber = billNumberTypeArray.some(item => `${item}` === '3');
        this.billNumber = this.autoBillNumber ? this.randomBillNumber() : '';
        this.billPictureType = billPictureType || '';
        const schema = {
          weighDentryid:{
            component: this.billPictureType.indexOf('2') !== -1 ? 'hide' : UpLoadImage,
            addMode:'button',
            buttonProps:{
              buttonStyle:{
                width:'256px',
                margin:'0 0 10px 0',
                position:'relative',
                height:'58px',
                background:'rgba(84,104,255,1)',
                boxShadow:'0px 10px 25px 0px rgba(84,104,255,0.3)',
                borderRadius:'8px'
              },
              buttonIcon:<img src={driverArrow} style={{ position:'absolute', right:'0', top:'8px', width:'42px', height:'42px' }} alt="" />,
              buttonLabel:<div style={{ fontSize:'16px', fontWeight:600, lineHeight:'58px', color:'white', letterSpacing:'1px', display:'inline-block' }}>拍照或上传</div>
            },
            rules:{
              required:[this.billPictureType.indexOf('2') === -1, '请上传过磅单']
            },
          },
          weighNumber:{
            label:'过磅单号',
            placeholder:'请输入',
            rules:{
              required:[isSubmitWeigh, '请输入过磅单号']
            },
            component: FieldInput,
            // fieldInputType:'money',
            value: Observer({
              watch: 'weighDentryid',
              action: async (weighDentryid, { formData, form }) => {
                const { location:{ query: { transportId } } } = this.props
                let number = formData.weighNumber
                if (weighDentryid?.[0] && needWeightOcr){
                  Toast.loading('图片单号识别中', 100)
                  let ocrData = {}
                  try {
                    ocrData = await useOcrGeneral({ transportId, image:getOssImg(businessNameToTempName(weighDentryid[0])), ocrType:1 })
                    needWeightOcr = false
                    if (`${ocrData.baiDuAiImage.conclusionType}` !== '1' && `${ocrData.baiDuAiImage.conclusionType}` !== '4') {
                      Toast.fail('您上传的过磅单清晰度过低请重新拍照上传', 2)
                      needWeightOcr = true
                      form.setFields({ weighDentryid:{ value:[] } })
                      return number
                    }
                  } catch (error) {
                    console.log(error)
                  }
                  number = ocrData.billNo || formData.weighNumber
                  Toast.hide()
                }
                return number
              }
            }),
            prefixCls:'billNumber'
          },
          billDentryid:{
            component: this.billPictureType.indexOf('3') !== -1 ? 'hide' :UpLoadImage,
            placeholder:'请输入',
            addMode:'button',
            buttonProps:{
              buttonStyle:{
                width:'256px',
                margin:'0 0 10px 0',
                position:'relative',
                height:'58px',
                background:'rgba(84,104,255,1)',
                boxShadow:'0px 10px 25px 0px rgba(84,104,255,0.3)',
                borderRadius:'8px'
              },
              buttonIcon:<img src={driverArrow} style={{ position:'absolute', right:'0', top:'8px', width:'42px', height:'42px' }} alt="" />,
              buttonLabel:<div style={{ fontSize:'16px', fontWeight:600, lineHeight:'58px', color:'white', letterSpacing:'1px', display:'inline-block' }}>拍照或上传</div>
            },
            rules:{
              required:[this.billPictureType.indexOf('3') === -1, '请上传签收单']
            },
          },
          billNumber:{
            label:'签收单号',
            placeholder:'请输入',
            rules:{
              required:[isSubmitSign, '请输入签收单号']
            },
            component: FieldInput,
            // fieldInputType:'money',
            observer: Observer({
              watch: 'billDentryid',
              action: async (billDentryid, { formData, form }) => {
                const { location:{ query: { transportId } } } = this.props
                let number = formData.billNumber
                if (billDentryid?.[0] && needSingOcr){
                  Toast.loading('图片单号识别中', 100)
                  let ocrData = {}
                  try {
                    ocrData = await useOcrGeneral({ transportId, image:getOssImg(businessNameToTempName(billDentryid[0])), ocrType:2 })
                    needSingOcr = false
                    if (`${ocrData.baiDuAiImage.conclusionType}` !== '1' && `${ocrData.baiDuAiImage.conclusionType}` !== '4') {
                      Toast.fail('您上传的签收单清晰度过低请重新拍照上传', 2)
                      needSingOcr = true
                      form.setFields({ billDentryid:{ value:[] } })
                      return number
                    }
                  } catch (error) {
                    console.log(error)
                  }
                  number = ocrData.billNo || formData.billNumber
                  Toast.hide()
                }
                return { value: this.autoBillNumber ? this.billNumber : number, editable: !this.autoBillNumber }
              }
            }),
            prefixCls:'billNumber'
          }
        }

        this.setState({
          ready:true,
          isSubmitWeigh,
          isSubmitSign,
          urls:[getOssImg(data.signDentryid)],
          schema:{ ...schema, ...newSchema },
          data:{ deliveryItems:data.deliveryItems }
        })
      })
  }

  randomBillNumber = () => {
    const head = 'QS'
    const timeString = moment().format('MMDDHHmmss')
    const randomString = Math.random().toString().substr(2, 4)
    return `${head}${timeString}${randomString}`
  }

  reduceDeliverySchema = deliveryItems => {
    const deliverySchema = deliveryItems.reduce((newSchema, current) => {
      const addSchema = {
        [`${current.transportCorrelationId}`]:{
          label:`${current.categoryName}${current.goodsName}`,
          component: FieldInput,
          // fieldInputType:'money',
          rules:{
            required:[true, `请输入${current.categoryName}${current.goodsName}数量`],
            pattern: /^\d+(\.\d+)?$/
          },
          placeholder:'请输入',
          extra:`${current.goodsUnitCN}`,
          prefixCls:'billNumber'
        },
        [`weigh_${current.transportCorrelationId}`]: {
          label: `${current.categoryName}${current.goodsName}`,
          component: FieldInput,
          rules: {
            required: [true, `请输入${current.categoryName}${current.goodsName}数量`],
            pattern: /^\d+(\.\d+)?$/,
          },
          placeholder: '请输入',
          extra: `${current.goodsUnitCN}`,
          prefixCls: 'billNumber',
        },
      }
      return { ...newSchema, ...addSchema }
    }, {})
    return deliverySchema
  }

  goback = () => {
    // nativeApi.showHeader()
    nativeApi.onFinish()
    nativeApi.showHeader()
  }

  closeOverPoundModal = () => {
    this.setState({
      overPoundDifference:false
    })
  }

  closeErrorModal = () => {
    this.setState({
      errorVisible:false
    })
  }

  getLocation = submitData =>{
    Toast.loading('正在获取当前定位', 100)
    if (browser.versions.android){
      nativeApi.getGpsLocation()
        .then(_data => {
          Toast.hide()
          const data1 = _data.replace('longitude', '"longitude"')
          const data2 = data1.replace('latitude', '"latitude"')
          const location = JSON.parse(data2)
          const _submitData = JSON.parse(JSON.stringify(submitData))
          const { receivingItems } = _submitData
          _submitData.deliveryList = receivingItems.map(({ transportCorrelationId, receivingNum, weighNum, processPointId, }) => ({ receivingNum, weighNum, transportCorrelationId, processPointId }))

          this.saveData(_submitData, location)
        })
        .catch(()=> {
          this.getLocationError()
        })
    } else {
      Toast.hide()
      nativeApi.onSaveSign(JSON.stringify(submitData))
        .catch(()=>{
          Toast.loading('正在获取当前定位', 100)
          console.log(this.geolocation)
          this.geolocation.getCurrentPosition((status, result)=> {
            Toast.hide()
            if (status === 'complete') {
              const { position:{ lat:latitude, lng:longitude } } = result
              const location = { latitude, longitude }
              this.saveData(submitData, location)
            } else {
              this.getLocationError()
            }
          })
          // Toast.fail('请更新易键达最新版本')
        })
    }
  }

  validatePound = (data) => {
    let poundDifferenceCheck = true
    const { location:{ query: { transportId } }, transport:{ deliveryItems } } = this.props
    const { billDentryid = [], weighDentryid = [], weighNumber, billNumber } = data
    // 将过磅数量整理成字典

    const weighGoodsField = Object.entries(data).reduce((result, val)=>{
      const key = val[0]
      const value = val[1]
      const newKey = key.split('weigh_')[1]
      if (newKey){
        return { ...result, [newKey] : value }
      }
      return { ...result }
    }, {})

    const receivingItems = Object.entries(data)
      .filter(([key]) => (!isNaN(+key)) && isNumber(+key))
      .map(([key, value]) => {
        let weighNum
        if (weighGoodsField[key]){
          weighNum = Number(weighGoodsField[+key]).toFixed(3)
        } else {
          weighNum = null
        }

        return ({ transportCorrelationId: +key, receivingNum: value.toString(), weighNum : isNaN(weighNum) ? null : weighNum })
      })

    receivingItems.forEach(item => {
      const { deliveryNum } = deliveryItems.find(({ transportCorrelationId }) => transportCorrelationId === item.transportCorrelationId) || { deliveryNum: 0 }
      if (item.receivingNum > 1.003 * deliveryNum || item.receivingNum < 0.997 * deliveryNum) {
        poundDifferenceCheck = false
      }
    })
    const submitData = { billNumber, weighNumber, billDentryid: '', weighDentryid: '', pointType: 4, receivingItems, transportId }

    if (this.billPictureType.indexOf('3') === -1) {
      Object.defineProperty(submitData, 'billDentryid', { value: billDentryid.join(',') });
    }
    if (this.billPictureType.indexOf('2') === -1) {
      Object.defineProperty(submitData, 'weighDentryid', { value: weighDentryid.join(',') });
    }

    if (poundDifferenceCheck) {
      this.getLocation(submitData)
    } else {
      this.poundDifferenceOnError(submitData)
    }
  }

  poundDifferenceOnError = submitData => {
    Toast.hide()
    this.setState({
      overPoundDifference:true,
      submitData
    })
  }

  getLocationError = () => {
    Toast.fail('获取当前定位失败，请检查网络与定位服务', 2)
  }

  saveData = (data, location) => {
    Toast.loading('提交数据中', 100)
    postTransportProcess({ ...data, ...location })
      .then(()=>{
        Toast.success('提交成功', 2)
        setTimeout(()=>{
          nativeApi.showHeader()
          nativeApi.onSuccess(2)
        }, 2000)
      })
  }

  postData = () => {
    const { submitData } = this.state
    this.getLocation(submitData)
  }

  renderGoodsFields = () => {
    const { deliveryItems=[] } = this.props.transport
    return (deliveryItems || []).map(item => <Item field={`${item.transportCorrelationId}`} />)
  }

  renderWeighGoodsFields = ()=>{
    const { deliveryItems = [] } = this.props.transport
    return (deliveryItems || []).map(item => <Item
      key={item.transportCorrelationId}
      field={`weigh_${item.transportCorrelationId}`}
    />)
  }

  formOnError = () => {
    this.setState({
      errorVisible:true
    })
  }

  watchSignPicture = () => {
    this.setState({
      showPicture:true
    })
  }

  closeSignPicture = () => {
    this.setState({
      showPicture:false
    })
  }

  render () {
    const { schema, ready, data, overPoundDifference, errorVisible, showPicture, urls, isSubmitWeigh, isSubmitSign } = this.state
    const wxImageViewerProps = {
      onClose:this.closeSignPicture,
      urls
      // index: imageListIndex
    }
    return (
      <>
        <div style={{ marginTop:'5px' }} onClick={this.goback}>
          <img src={pageBack} style={{ marginLeft:'18px' }} alt="" />
        </div>
        {ready&&
        <SchemaForm schema={schema} mode={FORM_MODE.ADD} data={data}>
          {isSubmitWeigh && <Card style={{ overflow:'hidden', paddingBottom:'25px', width:'315px', margin:'9px auto 18px auto' }}>
            <Card.Body prefixCls='driverPickCard'>
              <div className={style.leftTop}>
                <Icon type="check" style={{ position:'absolute', width:'25px', height:'18px', color:'white', left:'-20px', top:'-18px' }} color="white" />
              </div>
              <div style={{ position:'relative', left:'33px', width:'256px', top:'26px', display:'inline-block' }}>
                <img src={weightIcon} alt="" />
                <div style={{ marginLeft:'39px', display:'inline-block', verticalAlign:'top' }}>
                  <div style={{ fontSize:'14px', lineHeight:'20px', color:'rgba(52,67,86,0.5)', fontFamily:'PingFangSC-Regular,PingFang SC', fontWeight:600 }}>第 1 步</div>
                  <div style={{ marginTop:'4px', fontSize:'23px', lineHeight:'27px', color:'rgba(14,27,66,1)', fontFamily:'PingFangSC-Regular,PingFang SC', fontWeight:600 }}>请上传过磅单</div>
                </div>
                <div style={{ margin:'15px auto 20px auto ', fontFamily:'PingFangSC-Regular,PingFang SC', color:'rgba(52,67,86,0.7)', fontSize:'19px', width:'256px', height:'56px', lineHeight:'28px', fontWeight:600 }}>请拍照或上传图片，可识别货物相关信息</div>
                <Item field="weighDentryid" />
                <Item field="weighNumber" />
                {this.renderWeighGoodsFields()}
              </div>
            </Card.Body>
          </Card>}

          {isSubmitSign && <Card style={{ overflow:'hidden', paddingBottom:'25px', width:'315px', margin:'9px auto 0 auto' }}>
            <Card.Body prefixCls='driverPickCard'>
              {/* <div className={style.leftTop}>
                <Icon type="check" style={{ position:'absolute', width:'25px', height:'18px', color:'white', left:'-20px', top:'-18px' }} color="white" />
              </div> */}
              <div style={{ position:'relative', left:'33px', width:'256px', top:'26px', display:'inline-block' }}>
                <div style={{ display:'inline-block', width:'90px' }}>
                  <img src={signIcon} style={{ margin:'0 13px' }} alt="" />
                  <div style={{ width:'90px', fontSize:'14px', lineHeight:'26px', height:'26px', background:'rgba(231,231,231,1)', borderRadius:'8px', textAlign:'center' }} onClick={this.watchSignPicture}>查看样签</div>
                </div>
                <div style={{ marginLeft:'9px', display:'inline-block', verticalAlign:'top' }}>
                  <div style={{ fontSize:'14px', lineHeight:'20px', color:'rgba(52,67,86,0.5)', fontFamily:'PingFangSC-Regular,PingFang SC', fontWeight:600 }}>第 2 步</div>
                  <div style={{ marginTop:'4px', fontSize:'23px', lineHeight:'27px', color:'rgba(14,27,66,1)', fontFamily:'PingFangSC-Regular,PingFang SC', fontWeight:600 }}>请上传签收单</div>
                </div>
                <div style={{ margin:'15px auto 20px auto ', fontFamily:'PingFangSC-Regular,PingFang SC', color:'rgba(52,67,86,0.7)', fontSize:'19px', width:'256px', height:'56px', lineHeight:'28px', fontWeight:600 }}>请拍照或上传图片，可识别货物相关信息</div>
                <Item field="billDentryid" />
                <Item field="billNumber" />
                {this.renderGoodsFields()}
              </div>
            </Card.Body>
          </Card>}
          { showPicture && <WxImageViewer {...wxImageViewerProps} /> }
          <FormButton onError={this.formOnError} label={buttonText} debounce onClick={this.validatePound} style={{ width:'315px', position:'relative', height:'59px', background:'rgba(251,164,79,1)', borderRadius:'8px', margin:'23px auto 20px auto' }} />
        </SchemaForm>
        }
        <Modal
          popup
          maskClosable={false}
          className='modalBox'
          style={{ bottom: '37px', margin: '13px 10px', width: 'calc(100% - 20px)' }}
          visible={overPoundDifference}
          animationType="slide-up"
        >
          <div style={{ height: '47px', color: 'black', lineHeight: '30px', fontSize: '18px', fontWeight: '500' }} onClick={this.closeOverPoundModal}>重新填写</div>
        </Modal>
        <Modal
          popup
          footer={this.overPoundButton}
          onClose={this.closeOverPoundModal}
          className='modalBox'
          maskStyle={{ backgroundColor: 'rgba(0, 0, 0, 0)' }}
          style={{ bottom:'114px', margin:'13px 10px', width:'auto' }}
          visible={overPoundDifference}
          animationType="slide-up"
        >
          <TipsBox />
        </Modal>
        <Modal
          popup
          // maskClosable={false}
          onClose={this.closeErrorModal}
          footer={this.errorButton}
          className='modalBox'
          style={{ bottom:'34px', margin:'0 10px', width:'calc(100% - 20px)' }}
          visible={errorVisible}
          animationType="slide-up"
        >
          <TipsBox icon={formError} word={errorWord} />
        </Modal>
        <div style={{ display:'none' }}>
          <Map amapkey={window.envConfig.mpaWebJsKey} events={this.mapEvents} />
        </div>
      </>
    );
  }
}

export default driverSign;
