import React, { Component } from 'react';
import { Card, Icon, Toast, Modal } from 'antd-mobile'
import { connect } from 'dva'
import { Map } from 'react-amap'
import { SchemaForm, Item, FormButton, FORM_MODE, Observer } from '@gem-mine/mobile-schema-form'
import '@gem-mine/mobile-schema-form/src/fields'
import driverPickUpHeader from '@/assets/driverPickUpHeader.png'
import { useOcrGeneral, postTransportProcess } from '@/services/apiService'
import { getOssImg, businessNameToTempName, browser } from '@/utils/utils'
import driverArrow from '@/assets/driverArrow.png'
import formError from '@/assets/formError.png'
import pageBack from '@/assets/pageBack.png'
import save from '@/assets/save.png'
import nativeApi from '@/utils/nativeApi'
import transporModel from '@/models/transports'
import moment from 'moment'
import FieldInput from './component/FieldInput'
import TipsBox from './component/TipsBox'
import UpLoadImage from './component/DriverUpLoadImage'
// import UpLoadImage from './component/DriverUpLoadImage'
import style from './driverPickup.less'

const { actions:{ detailTransports } } = transporModel

let needOcr = true

const buttonText = (
  <div style={{ fontSize: '17px' }}>
    <img src={save} alt="" />
    <div style={{ color: 'white', marginLeft: '11px', display: 'inline-block', fontWeight: '600px', lineHeight: '59px' }}>保存</div>
  </div>
)

const errorWord = (
  <>
    <div>您还有未填写的项目</div>
    <div>请返回补充完成后再次保存</div>
  </>
)

@connect(null, { detailTransports })
class driverPickup extends Component {

  state = {
    errorVisible:false,
    ready:false,
    ocrData:{}
  }

  errorButton = [
    { text: '确定', onPress: ()=>this.closeErrorModal(), style:{ color: 'rgba(251,164,79,1)', fontSize:'18px', lineHeight:'50px' } },
  ]

  constructor (props){
    super(props)
    window.amapkey = window.envConfig.mapWebKey
    needOcr = true
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
    const { location:{ query: { transportId, transpotCorrelationId:transportCorrelationId } }, detailTransports } = this.props

    detailTransports({ transportId })
      .then(data=>{
        const { billNumberType, billPictureType } = data.logisticsBusinessTypeEntity || {};
        const billNumberTypeArray = (billNumberType || '').split(',');
        this.autoBillNumber = billNumberTypeArray.some(item => `${item}` === '1');
        this.billNumber = this.autoBillNumber ? this.randomBillNumber() : '';
        console.log(this.billNumber)
        this.billPictureType = billPictureType || '';
        const schema = {
          billDentryid:{
            component: this.billPictureType.indexOf('1') !== -1 ? 'hide' : UpLoadImage,
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
              required:[this.billPictureType.indexOf('1') === -1, '请上传提货单']
            },
          },
          billNumber:{
            label:'交货单号',
            rules:{
              required:[true, '请输入交货单号']
            },
            component: FieldInput,
            // fieldInputType:'money',
            observer: Observer({
              watch: 'billDentryid',
              action: async (billDentryid, { formData, form }) => {
                const { location:{ query: { transportId } } } = this.props
                let number = formData.billNumber
                if (billDentryid?.[0] && needOcr && !this.autoBillNumber){
                  Toast.loading('图片单号识别中', 100)
                  let _ocrData = {}
                  try {
                    _ocrData = await useOcrGeneral({ transportId, image:getOssImg(businessNameToTempName(billDentryid[0])), ocrType:0 })
                    needOcr = false
                    if (`${_ocrData.baiDuAiImage.conclusionType}` !== '1' && `${_ocrData.baiDuAiImage.conclusionType}` !== '4') {
                      Toast.fail('您上传的提货单清晰度过低请重新拍照上传', 2)
                      needOcr = true
                      form.setFields({ billDentryid:{ value:[] } })
                      return number
                    }
                    this.setState({
                      ocrData:_ocrData
                    })
                  } catch (error) {
                    console.log(error)
                  }
                  number = _ocrData.billNo || formData.billNumber
                  Toast.hide()
                }
                console.log(number)
                return { value: this.autoBillNumber ? this.billNumber : number, editable: !this.autoBillNumber }
              }
            }),
            prefixCls:'billNumber'
          }
        };
        const deliveryNum = {
          label:'净重',
          rules:{
            required:[true, '请输入'],
            pattern: /^\d+(\.\d+)?$/
          },
          component: FieldInput,
          // fieldInputType:'money',
          extra:(data.deliveryItems || []).find(item => +transportCorrelationId === item.transportCorrelationId)?.goodsUnitCN || '吨',
          prefixCls:'billNumber',
          value: Observer({
            watch: '*ocrData',
            action: async (ocrData, { formData }) => {
              let { deliveryNum } = formData
              if (ocrData.receivingWeight){
                deliveryNum = ocrData.receivingWeight
              }
              return deliveryNum
            }
          }),
        }
        this.setState({
          ready:true,
          schema:{ ...schema, deliveryNum }
        })
      })
  }

  randomBillNumber = () => {
    const head = 'TH';
    const timeString = moment().format('MMDDHHmmss');
    const randomString = Math.random().toString().substr(2, 4);
    return `${head}${timeString}${randomString}`;
  }

  closeErrorModal = () => {
    this.setState({
      errorVisible:false
    })
  }

  formatData = (value) => {
    const { location:{ query: { transpotCorrelationId:transportCorrelationId, transportId } } } = this.props
    const submitData = {
      ...value,
      deliveryNum:value.deliveryNum.toString(),
      transportCorrelationId,
      transportId,
      billDentryid: '',
      pointType: 2,
    };
    if (this.billPictureType.indexOf('1') === -1) {
      Object.defineProperty(submitData, 'billDentryid', { value: (value.billDentryid).join(',') });
    }
    this.getLocation(submitData)
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
          this.saveData(submitData, location)
        })
        .catch(()=> {
          this.getLocationError()
        })
    } else {
      Toast.hide()
      nativeApi.onSaveLoading(JSON.stringify(submitData))
        .catch(()=>{
          Toast.loading('正在获取当前定位', 100)
          console.log(this.geolocation)
          this.geolocation.getCurrentPosition((status, result)=> {
            Toast.hide()
            if (status === 'complete') {
              const { position:{ lat:latitude, lng:longitude } } = result
              const location = { latitude, longitude }
              console.log(submitData, location)
              this.saveData(submitData, location)
            } else {
              this.getLocationError()
            }
          })
          // Toast.fail('请更新易键达最新版本')
        })
    }
  }

  getLocationError = () => {
    Toast.fail('获取当前定位失败，请检查网络与定位服务', 2)
  }

  saveData = (data, location) =>{
    const { location:{ query: { isFinalGoods } } } = this.props
    Toast.loading('提交数据中', 100)
    postTransportProcess({ ...data, ...location })
      .then(()=>{
        Toast.success('提交成功', 1)
        setTimeout(()=>{
          if (isFinalGoods === 'true' || isFinalGoods === '1') {
            nativeApi.onSuccess(1)
            nativeApi.showHeader()
          } else {
            nativeApi.onSuccess(1)
            nativeApi.showHeader()
          }
        }, 1000)
      })
  }

  formOnError = () => {
    this.setState({
      errorVisible:true
    })
  }

  goback = () => {
    // router.go(-1)
    nativeApi.onFinish()
    nativeApi.showHeader()
  }

  render () {
    const { errorVisible, ready, schema, ocrData } = this.state
    return (
      <>
        <div style={{ marginTop:'5px' }} onClick={this.goback}>
          <img src={pageBack} style={{ marginLeft:'18px' }} alt="" />
        </div>
        {ready&&
          <SchemaForm schema={schema} mode={FORM_MODE.ADD} trigger={{ ocrData }}>
            <Card style={{ overflow:'hidden', paddingBottom:'25px', width:'315px', margin:'9px auto 0 auto' }}>
              <Card.Body prefixCls='driverPickCard'>
                <div className={style.leftTop}>
                  <Icon type="check" style={{ position:'absolute', width:'25px', height:'18px', color:'white', left:'-20px', top:'-18px' }} color="white" />
                </div>
                <div style={{ position:'relative', left:'33px', width:'256px', top:'26px', display:'inline-block' }}>
                  <img src={driverPickUpHeader} alt="" />
                  <div style={{ marginLeft:'39px', display:'inline-block', verticalAlign:'top' }}>
                    <div style={{ fontSize:'14px', lineHeight:'20px', color:'rgba(52,67,86,0.5)', fontFamily:'PingFangSC-Regular,PingFang SC', fontWeight:600 }}>提货</div>
                    <div style={{ marginTop:'4px', fontSize:'23px', lineHeight:'27px', color:'rgba(14,27,66,1)', fontFamily:'PingFangSC-Regular,PingFang SC', fontWeight:600 }}>请上传提货单</div>
                  </div>
                  <div style={{ margin:'15px auto 20px auto ', fontFamily:'PingFangSC-Regular,PingFang SC', color:'rgba(52,67,86,0.7)', fontSize:'19px', width:'256px', height:'56px', lineHeight:'28px', fontWeight:600 }}>请拍照或上传图片，可识别货物相关信息</div>
                  <Item field="billDentryid" />
                  <Item field="billNumber" />
                  <Item field="deliveryNum" />
                </div>
              </Card.Body>
            </Card>

            <FormButton label={buttonText} onError={this.formOnError} debounce onClick={this.formatData} style={{ width:'315px', position:'relative', height:'59px', background:'rgba(251,164,79,1)', borderRadius:'8px', margin:'23px auto 23px auto' }} />
          </SchemaForm>
        }
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
      // <UpLoadImage mode="add" isOcr={false} ocrParams={ocrParams} ocrCallBack={this.ocrCallBack} />
    );
  }
}

export default driverPickup;
