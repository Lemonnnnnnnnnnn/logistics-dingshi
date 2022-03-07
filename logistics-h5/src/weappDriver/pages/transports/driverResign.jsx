import React, { Component } from 'react';
import { Card, Icon, Toast, Modal } from 'antd-mobile'
import { SchemaForm, Item, FormButton, FORM_MODE } from '@gem-mine/mobile-schema-form'
import DebounceFormButton from '@/components/DebounceFormButton'
import '@gem-mine/mobile-schema-form/src/fields'
import router from 'umi/router';
import { getTransportRejects, modifyTransportReject } from '@/services/apiService'
import { pick } from '@/utils/utils'
import UpLoadImage from '@/weappDriver/components/uploadImg/addComponent/ButtonUpload'
import driverPickUpHeader from '@/assets/driverPickUpHeader.png'
import pageBack from '@/assets/pageBack.png'
import save from '@/assets/save.png'
import formError from '@/assets/formError.png'
import signIcon from '@/assets/signIcon.png'
import TipsBox from './component/TipsBox'
import FieldInput from './component/FieldInput'
import style from './driverPickup.less'

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

class DriverResign extends Component {

  state = {
    errorVisible:false,
    schemaObject: {},
    ready:false,
  }

  errorButton = [
    { text: '确定', onPress: ()=>this.closeErrorModal(), style:{ color: 'rgba(251,164,79,1)', fontSize:'18px', lineHeight:'50px' } },
  ]

  constructor (props){
    super(props)
    this.state.schema = {
      billDentryid:{
        component: UpLoadImage,
        imageStyle:{
          width:'256px',
          height:'auto',
          margin:'10px 0'
        },
        rules:{
          required:[true, '请上传提货单']
        },
      },
      billNumber:{
        label:'交货单号',
        rules:{
          required:[true, '请输入交货单号']
        },
        placeholder:'请输入',
        component: FieldInput,
        // fieldInputType:'money',
        prefixCls:'billNumber'
      }
    }
  }

  componentDidMount (){
    const { location:{ query: { transportId } } } = this.props
    getTransportRejects(transportId)
      .then(({ items })=>{
        const deliveryItems = items.filter(item => item.pointType === 2)
        const receivingItems = items.filter(item => item.pointType === 4 && (item.additionalTypeAll && item.additionalTypeAll.indexOf('1') !== -1))
        const weighItems = items.filter(item => item.pointType === 4 && (item.additionalTypeAll && item.additionalTypeAll.indexOf('2') !== -1))


        // 将三个数组整合为一个数组
        const deliverySchema = deliveryItems.reduce((deliveryObject, current) => {
          const schema = {
            [`${current.transportCorrelationId}_billDentryid`]:{
              component: UpLoadImage,
              imageStyle:{
                width:'256px',
                height:'auto',
                margin:'10px 0'
              },
              rules:{
                required:[true, '请上传提货单']
              },
            },
            [`${current.transportCorrelationId}_billNumber`]:{
              label:'交货单号',
              rules:{
                required:[true, '请输入交货单号']
              },
              placeholder:'请输入',
              component: FieldInput,
              // fieldInputType:'money',
              prefixCls:'billNumber'
            },
            [`${current.transportCorrelationId}_deliveryNum`]:{
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
            [`${current.transportCorrelationId}_processPointId`]:{
              component:'hide',
              defaultValue: current.processPointId
            }
          }

          const renderer = () => (
            <Card style={{ overflow: 'hidden', paddingBottom: '25px', width: '315px', margin: '9px auto 30px auto' }}>
              <Card.Body prefixCls='driverPickCard'>
                <div className={style.leftTop}>
                  <Icon type="check" style={{ position: 'absolute', width: '25px', height: '18px', color: 'white', left: '-20px', top: '-18px' }} color="white" />
                </div>
                <div style={{ position: 'relative', left: '33px', width: '256px', top: '26px', display: 'inline-block' }}>
                  <img src={driverPickUpHeader} alt="" />
                  <div style={{ marginLeft: '39px', display: 'inline-block', verticalAlign: 'top' }}>
                    <div style={{ fontSize: '14px', lineHeight: '20px', color: 'rgba(52,67,86,0.5)', fontFamily: 'PingFangSC-Regular,PingFang SC', fontWeight: 600 }}>提货</div>
                    <div style={{ marginTop: '4px', fontSize: '23px', lineHeight: '27px', color: 'rgba(14,27,66,1)', fontFamily: 'PingFangSC-Regular,PingFang SC', fontWeight: 600 }}>请上传提货单</div>
                  </div>
                  <div style={{ margin: '15px auto 20px auto ', fontFamily: 'PingFangSC-Regular,PingFang SC', color: 'rgba(52,67,86,0.7)', fontSize: '19px', width: '256px', height: '56px', lineHeight: '28px', fontWeight: 600 }}>请拍照或上传图片，可识别货物相关信息</div>
                  <Item field={`${current.transportCorrelationId}_billDentryid`} />
                  <Item field={`${current.transportCorrelationId}_billNumber`} />
                  <Item field={`${current.transportCorrelationId}_deliveryNum`} />
                  <Item field={`${current.transportCorrelationId}_processPointId`} />
                </div>
              </Card.Body>
            </Card>
          )
          return {
            schema: { ...deliveryObject.schema, ...schema },
            renderer: [...deliveryObject.renderer, renderer]
          }
        }, { schema:{}, renderer:[] })
        const weighSchema = weighItems.reduce((receivingObject, current) => {
          const baseSchema = {
            weighDentryid:{
              component: UpLoadImage,
              placeholder:'请输入',
              imageStyle:{
                width:'256px',
                height:'auto',
                margin:'10px 0'
              },
              rules:{
                required:[true, '请上传过磅单']
              },
            },
            weighNumber : {
              label:'过磅单号',
              placeholder : '请输入',
              rules:{
                required:[true, '请输入过磅单号']
              },
              component: FieldInput,
              prefixCls:'billNumber'
            },
            processPointId: {
              component:'hide',
              defaultValue: current.processPointId
            }
          }
          const itemSchema = current.deliveryList && current.deliveryList.reduce((newSchema, current) => {
            const addSchema = {
              [`${current.transportCorrelationId}_weighNum`]:{
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
              // [`${current.transportCorrelationId}_signProcessPointIdWeigh`]: {
              //   component:'hide',
              //   defaultValue: current.processPointId
              // }
            }
            return { ...newSchema, ...addSchema }
          }, {})

          const renderer = () => (
            <Card style={{ overflow: 'hidden', paddingBottom: '25px', width: '315px', margin: '9px auto 0 auto' }}>
              <Card.Body prefixCls='driverPickCard'>
                <div style={{ position: 'relative', left: '33px', width: '256px', top: '26px', display: 'inline-block' }}>
                  <div style={{ display: 'inline-block', width: '90px' }}>
                    <img src={signIcon} style={{ margin: '0 13px' }} alt="" />
                    <div style={{ width: '90px', fontSize: '14px', lineHeight: '26px', height: '26px', background: 'rgba(231,231,231,1)', borderRadius: '8px', textAlign: 'center' }} onClick={this.watchSignPicture}>查看样签</div>
                  </div>
                  <div style={{ marginLeft: '9px', display: 'inline-block', verticalAlign: 'top' }}>
                    <div style={{ fontSize: '14px', lineHeight: '20px', color: 'rgba(52,67,86,0.5)', fontFamily: 'PingFangSC-Regular,PingFang SC', fontWeight: 600 }}>第 2 步</div>
                    <div style={{ marginTop: '4px', fontSize: '23px', lineHeight: '27px', color: 'rgba(14,27,66,1)', fontFamily: 'PingFangSC-Regular,PingFang SC', fontWeight: 600 }}>请上传过磅单</div>
                  </div>
                  <div style={{ margin: '15px auto 20px auto ', fontFamily: 'PingFangSC-Regular,PingFang SC', color: 'rgba(52,67,86,0.7)', fontSize: '19px', width: '256px', height: '56px', lineHeight: '28px', fontWeight: 600 }}>请拍照或上传图片，可识别货物相关信息</div>
                  <Item field='weighDentryid' />
                  <Item field='weighNumber' />
                  <Item field="processPointId" />
                  {current.deliveryList?.map(item => <Item field={`${item.transportCorrelationId}_weighNum`} /> )}
                </div>
              </Card.Body>
            </Card>
          )

          return {
            schema: { ...receivingObject.schema, ...baseSchema, ...itemSchema },
            renderer: [...receivingObject.renderer, renderer]
          }
        }, deliverySchema)
        const receivingSchema = receivingItems.reduce((receivingObject, current) => {
          const baseSchema = {
            billDentryid:{
              component: UpLoadImage,
              placeholder:'请输入',
              imageStyle:{
                width:'256px',
                height:'auto',
                margin:'10px 0'
              },
              rules:{
                required:[true, '请上传签收单']
              },
            },
            billNumber:{
              label:'签收单号',
              placeholder:'请输入',
              rules:{
                required:[true, '请输入签收单号']
              },
              component: FieldInput,
              prefixCls:'billNumber'
            },
            processPointId: {
              component:'hide',
              defaultValue: current.processPointId
            }
          }
          const itemSchema = current.deliveryList.reduce((newSchema, current) => {
            const addSchema = {
              [`${current.transportCorrelationId}_receivingNum`]:{
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
              [`${current.transportCorrelationId}_signProcessPointId`]: {
                component:'hide',
                defaultValue: current.processPointId
              }
            }
            return { ...newSchema, ...addSchema }
          }, {})

          const renderer = () => (
            <Card style={{ overflow: 'hidden', paddingBottom: '25px', width: '315px', margin: '9px auto 0 auto' }}>
              <Card.Body prefixCls='driverPickCard'>
                {/* <div className={style.leftTop}>
                  <Icon type="check" style={{ position:'absolute', width:'25px', height:'18px', color:'white', left:'-20px', top:'-18px' }} color="white" />
                </div> */}
                <div style={{ position: 'relative', left: '33px', width: '256px', top: '26px', display: 'inline-block' }}>
                  <div style={{ display: 'inline-block', width: '90px' }}>
                    <img src={signIcon} style={{ margin: '0 13px' }} alt="" />
                    <div style={{ width: '90px', fontSize: '14px', lineHeight: '26px', height: '26px', background: 'rgba(231,231,231,1)', borderRadius: '8px', textAlign: 'center' }} onClick={this.watchSignPicture}>查看样签</div>
                  </div>
                  <div style={{ marginLeft: '9px', display: 'inline-block', verticalAlign: 'top' }}>
                    <div style={{ fontSize: '14px', lineHeight: '20px', color: 'rgba(52,67,86,0.5)', fontFamily: 'PingFangSC-Regular,PingFang SC', fontWeight: 600 }}>第 3 步</div>
                    <div style={{ marginTop: '4px', fontSize: '23px', lineHeight: '27px', color: 'rgba(14,27,66,1)', fontFamily: 'PingFangSC-Regular,PingFang SC', fontWeight: 600 }}>请上传签收单</div>
                  </div>
                  <div style={{ margin: '15px auto 20px auto ', fontFamily: 'PingFangSC-Regular,PingFang SC', color: 'rgba(52,67,86,0.7)', fontSize: '19px', width: '256px', height: '56px', lineHeight: '28px', fontWeight: 600 }}>请拍照或上传图片，可识别货物相关信息</div>
                  <Item field="billDentryid" />
                  <Item field="billNumber" />
                  <Item field="processPointId" />
                  {current.deliveryList.map(item => [<Item field={`${item.transportCorrelationId}_receivingNum`} />, <Item field={`${item.transportCorrelationId}_signProcessPointId`} />])}
                </div>
              </Card.Body>
            </Card>
          )

          return {
            schema: { ...receivingObject.schema, ...baseSchema, ...itemSchema },
            renderer: [...receivingObject.renderer, renderer]
          }
        }, weighSchema)

        this.setState({
          ready:true,
          schemaObject:receivingSchema
        })
      })
  }


  closeErrorModal = () => {
    this.setState({
      errorVisible:false
    })
  }

  formOnError = () => {
    this.setState({
      errorVisible:true
    })
  }

  goback = () => {
    router.goBack()
  }

  formatData = (data) => {
    const { billDentryid, billNumber, processPointId, weighDentryid, weighNumber, ...others } = data
    const { location:{ query: { transportId } } } = this.props

    // 解析提货信息
    const dataObject = Object.entries(others).reduce((dataObject, [key, value]) => {
      const [transportCorrelationId, field] = key.split('_')
      if (dataObject[transportCorrelationId]) {
        return { ...dataObject, [transportCorrelationId]: { ...dataObject[transportCorrelationId], [field]: field === 'billDentryid'? value.toString() : value } }
      }
      return { ...dataObject, [transportCorrelationId]: { transportCorrelationId, [field]:value } }
    }, {})

    const objectItems = Object.keys(dataObject).map(key => ({ ...dataObject[key] }))
    const deliveryData = objectItems
      .filter(item => item.processPointId)
      .map(item => {
        const pickObject = pick(item, ['processPointId', 'billDentryid', 'deliveryNum', 'transportCorrelationId', 'billNumber'])
        return {
          ...pickObject,
          pointType:2
        }
      })

    let receivingData
    let deliveryList
    let items = deliveryData

    // 如果有签收或者过磅信息，添加签收过磅信息
    if (billDentryid || weighDentryid) {
      // 签收里有提货列表信息
      deliveryList = objectItems.map(({ receivingNum, weighNum, transportCorrelationId, signProcessPointId }) => ({ receivingNum, weighNum, transportCorrelationId, processPointId:signProcessPointId }))
      receivingData = { processPointId, deliveryList, pointType:4 }
      if (billDentryid){
        receivingData = { ...receivingData, billDentryid: billDentryid.toString(), billNumber }
      }
      if (weighDentryid){
        receivingData = { ...receivingData, weighDentryid : weighDentryid.toString(), weighNumber }
      }
      items = [...deliveryData, receivingData]
    }
    modifyTransportReject({ transportId, items })
      .then(() => {
        Toast.success('重新签收成功', 2, () => {
          router.goBack()
        })
      })
  }

  render () {
    const { schemaObject:{ schema, renderer }, ready, errorVisible } = this.state
    return (
      <>
        <div style={{ marginTop: '5px' }} onClick={this.goback}>
          <img src={pageBack} style={{ marginLeft: '18px' }} alt="" />
        </div>
        {ready &&
          <SchemaForm schema={schema} mode={FORM_MODE.ADD}>
            {renderer.map(func => func())}
            <DebounceFormButton label={buttonText} onError={this.formOnError} debounce onClick={this.formatData} style={{ width:'315px', position:'relative', height:'59px', background:'rgba(251,164,79,1)', borderRadius:'8px', margin:'23px auto 23px auto' }} />
          </SchemaForm>
        }
        <Modal
          popup
          // maskClosable={false}
          onClose={this.closeErrorModal}
          footer={this.errorButton}
          className='modalBox'
          style={{ bottom: '34px', margin: '0 10px', width: 'calc(100% - 20px)' }}
          visible={errorVisible}
          animationType="slide-up"
        >
          <TipsBox icon={formError} word={errorWord} />
        </Modal>
      </>
    );
  }
}

export default DriverResign;
