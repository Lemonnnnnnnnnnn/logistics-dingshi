import React, { Component } from 'react';
import { Card, List, WhiteSpace, Toast, Modal, Button } from 'antd-mobile'
import { connect } from 'dva'
import router from 'umi/router'
import { SchemaForm, Item, FormButton, Observer, FORM_MODE } from '@gem-mine/mobile-schema-form'
import { ocrBankAccount, getBankAccount, postBankAccount, getWeAppBankList } from '@/services/apiService'
import { businessNameToTempName, lodashDebounce, isEmpty } from '@/utils/utils'
import { getUserInfo } from '@/services/user'
import '@gem-mine/mobile-schema-form/src/fields'
import style from './driverPickup.less'
import InputCamera from './component/InputCamera'
import UpLoadImage from './component/DriverUpLoadImage'

function mapStateToProps (state) {
  return {
    nowUser: state.user.nowUser
  }
}

@connect(mapStateToProps, dispatch => ({
  getNowUser: () => dispatch({ type: 'user/getNowUser' })
}))
class receivablesAccount extends Component {

  state = {
    ready:false,
    checkVisible:false,
    mismatch:false,
    mode:FORM_MODE.ADD,
    renderItem : {}
  }

  check = false

  userInfo = getUserInfo()

  basicInfoField = [
    {
      label:'姓名',
      name:'nickName'
    },
    {
      label:'身份证号',
      name:'idcardNo'
    },
    {
      label:'手机号',
      name:'phone'
    }
  ]

  constructor (props) {
    super(props)
    this.debounceGetOcrBankAccount = lodashDebounce(this.getOcrBankAccount, 5000)
    this.schema = {
      nickName:{
        component:'inputItem',
        className:style.listInput,
        label:'持卡人姓名',
        placeholder: '请输入持卡人姓名',
      },
      bankAccount:{
        component:InputCamera,
        rules:{
          required:[true, '请输入银行卡号']
        },
        value:Observer({
          watch:'bankDentryid',
          action:async (bankDentryid, { formData }) => {
            let number = formData.bankAccount
            if (bankDentryid?.[0]){
              Toast.loading('银行卡号识别中', 1000)
              let ocrData = {}
              try {
                ocrData = await ocrBankAccount({ bankAccountDentryid:businessNameToTempName(bankDentryid[0]) })
                // needWeightOcr = false
                // if (`${ocrData.baiDuAiImage.conclusionType}` !== '1' && `${ocrData.baiDuAiImage.conclusionType}` !== '4') {
                //   Toast.fail('您上传的过磅单清晰度过低请重新拍照上传', 2)
                //   // needWeightOcr = true
                //   form.setFields({ weighDentryid:{ value:[] } })
                // }
              } catch (error) {
                console.log(error)
              }
              if (!ocrData.cardtype) {
                Toast.fail('未能识别银行卡号', 1)
              }
              const value = ocrData.bankAccount || ''
              number = value.replace(/\s*/g, "") || formData.bankAccount
            }
            return number
          }
        }),
      },
      bankDentryid:{
        component:UpLoadImage,
        addMode:'camera',
        disabled:true,
        showHeader:true,
        visible:({ formData }) => formData['*mode'] === FORM_MODE.ADD
      },
      bankname:{
        component:'inputItem',
        label:'开户银行',
        rules:{
          required:[true, '未识别开户银行']
        },
        placeholder:"根据银行卡号自动识别",
        className:style.listInput,
        editable:false,
        value:Observer({
          watch:'bankAccount',
          action:this.debounceGetOcrBankAccount
        }),
        visible:({ formData }) => formData['*mode'] === FORM_MODE.ADD
      }
    }
  }

  componentDidMount (){
    const { getNowUser } = this.props
    getNowUser()
      .then(({ bankAccountItems:[userAccount={}] })=>{
        getWeAppBankList({ offset: 0, limit: 1000 }).then(data => {
          const { nickName } = getUserInfo()
          const list = data.items.filter(item=>item.nickName === nickName)
          const renderItem = list.find(item=>item.isAvailable) || list[Math.floor(Math.random() * list.length)] || {}

          this.setState({
            renderItem,
            ready: true,
            mode:isEmpty(userAccount)? FORM_MODE.ADD : FORM_MODE.MODIFY
          })
        })
      })
  }

  getOcrBankAccount = async (bankAccount, { form }) => {
    if (!bankAccount) return ''
    const bankData = await getBankAccount({ bankAccount })
      .catch(()=>{
        this.check = false
      })
    Toast.hide()
    if (bankData) {
      const { city, province } = bankData
      this.check = true
      this.cardAddress = {
        city,
        province,
      }
      form.setFieldsValue({ bankname:bankData.bankName || '' })
    }
    return bankData.bankName || ''
  }

  renderBasicInfo = () => {
    const { nowUser } = this.props
    return this.basicInfoField.map(item => (
      <List.Item key={item.name} extra={<span style={{ color:'rgba(153, 153, 153, 0.85)' }}>{nowUser[item.name]}</span>}>
        {item.label}
      </List.Item>
    ))
  }

  modifyBankInfo = () => {
    this.setState({
      mode:FORM_MODE.ADD
    })
  }

  renderReceivablesAccount = () => {
    // const { nowUser:{ bankAccountItems: [bankInfo={}] } } = this.props
    const { renderItem } = this.state

    const { bankAccount, bankName, nickName } = renderItem
    return (
      this.state.mode === FORM_MODE.ADD ?
        <>
          <Item field='nickName' />
          <List.Item extra={<span><Item field='bankAccount' /><Item field='bankDentryid' /></span>}>
            银行卡号
          </List.Item>
          <Item field='bankname' />
        </> :
        <>
          <List.Item extra={<span style={{ color: 'rgba(153, 153, 153, 0.85)', fontSize: '14px' }}>{nickName}</span>}>
            持卡人姓名
          </List.Item>
          <List.Item extra={<span style={{ color: 'rgba(153, 153, 153, 0.85)', fontSize:'14px' }}>{bankAccount}</span>}>
            银行卡号
          </List.Item>
          <List.Item extra={<span style={{ color: 'rgba(153, 153, 153, 0.85)', fontSize:'14px' }}>{bankName}</span>}>
            开户银行
          </List.Item>
        </>
    )
  }

  renderBankUpdate = () => {
    //  && this.renderBankUpdate()
    const { nowUser: { bankAccountItems: [bankInfo = {}] } } = this.props
    const { bankAccount } = bankInfo
    if (!bankAccount) {
      return (<Button onClick={this.modifyBankInfo} style={{ width:'80px', float:'right' }} type='ghost' size='small'>修改</Button>)
    }
    return (<span />)
  }

  formOnError = error => {
    Toast.fail(error[0], 2)
  }

  saveData = value => {
    if (this.check) {
      this.setState({
        checkData:value,
        checkVisible:true
      })
    } else {
      this.setState({
        mismatch:true
      })
    }
  }

  cancelCheck = () => {
    this.setState({
      checkVisible:false
    })
  }

  handleData = () => {
    const { checkData } = this.state
    const { bankDentryid, bankname } = checkData
    postBankAccount({ ...checkData, bankDentryid:bankDentryid&&bankDentryid[0], ...this.cardAddress, bankName:bankname })
      .then(()=>{
        Toast.success('银行卡绑定成功', 2)
        this.cancelCheck()
        setTimeout(()=>{
          router.goBack()
        }, 1000)
      })
      .catch(()=>{
        this.cancelCheck()
      })
  }

  resetFrom = () => {
    this.setState({
      mismatch:false
    })
  }

  render () {
    const { ready, checkVisible, mismatch, mode, renderItem } = this.state
    return (
      <>
        {ready &&
          <>
            <Card className='base-info' full>
              <Card.Header
                title={<div style={{ color:'rgba(51, 51, 51, 0.85)' }}>基本信息</div>}
              />
              <Card.Body>
                <List className="list-line">
                  {this.renderBasicInfo()}
                </List>
              </Card.Body>
            </Card>
            <WhiteSpace />
            {/* <SchemaForm mode={mode} schema={this.schema}> */}
              {/* { */}
              {/*  Object.keys(renderItem).length ? */}
              {/*    <Card className='base-info' full> */}
              {/*      <Card.Header */}
              {/*        extra={mode === FORM_MODE.MODIFY} */}
              {/*        title={<div style={{ color: 'rgba(51, 51, 51, 0.85)' }}>收款账号信息</div>} */}
              {/*      /> */}
              {/*      <Card.Body> */}
              {/*        <List className='list-line'> */}
              {/*          {this.renderReceivablesAccount()} */}
              {/*        </List> */}
              {/*      </Card.Body> */}
              {/*    </Card> : null */}
              {/*  // ) */}
              {/* } */}
              {/* {mode === FORM_MODE.ADD && */}
              {/* <div style={{ position: 'fixed', bottom: '0', width: '100%', height: '47px', backgroundColor: '#FFFFFF' }}> */}
              {/*  <FormButton label='保存' onError={this.formOnError} onClick={this.saveData} style={{ color: '#FF6633', borderRadius: '54px', fontSize: '13px', width: '80px', height: '28px', margin: '9px 10px', float: 'right', lineHeight: '28px', border: '1px solid #FF6633' }} /> */}
              {/* </div>} */}
            {/* </SchemaForm> */}
            <Modal
              visible={checkVisible}
              transparent
            >
              <div style={{ width:'200px', margin:'15px auto' }}>请确认收款信息是否填写正确？一经确认再无法修改！</div>
              <div>
                <Button inline size="small" onClick={this.cancelCheck}>取消</Button>
                <Button inline size="small" type='primary' style={{ marginLeft:'40px' }} onClick={this.handleData}>确认无误</Button>
              </div>
            </Modal>
            <Modal
              visible={mismatch}
              transparent
            >
              <div style={{ width:'200px', margin:'15px auto' }}>您填写的银行卡号有误，请确认填写的是本人的银行卡号！</div>
              <div>
                <Button inline size="small" type='primary' onClick={this.resetFrom}>重新填写</Button>
              </div>
            </Modal>
          </>
        }
      </>
    );
  }
}

export default receivablesAccount;
