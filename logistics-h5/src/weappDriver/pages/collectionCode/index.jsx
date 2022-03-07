import React, { Component } from 'react'
import { Icon, InputItem, Toast, Flex, Modal } from 'antd-mobile'
import { Avatar } from 'antd'
import wechat from '@/assets/consign/wechat.png'
import codeErr from '@/assets/driver/codeErr.png'
import { clearUserInfo, getUserInfo } from '@/services/user'
import CSSModules from 'react-css-modules'
import { connect } from 'dva'
import { createForm } from 'rc-form'
import { getCarByShipment, driverRecentCar, exit } from '@/services/apiService'
import QRCode from 'qrcode.react'
import router from 'umi/router'
import styles from './index.less'


function mapStateToProps (state) {
  return {
    nowUser: state.user.nowUser,
  }
}

@connect(mapStateToProps)
@CSSModules(styles, { allowMultiple: true })
class collectionCode extends Component {
  constructor (props) {
    super(props)
    this.userInfo = getUserInfo()
    this.state = {
      modal1: false,
      list: [],
      value: '',
      index: null,
      qrCode: false,
      carNo: null,
      currentList: [],
      qrCodeMsg: '',
      currentCar : {}
    }
  }

  componentDidMount () {
    this.getData()
    const wxUserInfo = JSON.parse(localStorage.getItem('wxUserInfo'))
    const { nickName, avatarUrl } = wxUserInfo
    if (!nickName && !avatarUrl){
      Modal.alert(undefined, '您尚未授权获取微信昵称和头像的权限，请退出登录后重新授权', [{ text: '取消', onPress:()=>router.goBack() }, { text: '确定', onPress:()=>{
        exit()
          .then(()=>{
            clearUserInfo()
            this.userLogin()
          })
          .catch(()=>{
            clearUserInfo()
            this.userLogin()
          })
      }
      }]
      )
    }
    this.showModal()
  }

  userLogin = () => {
    wx.miniProgram.reLaunch({
      url: '/pages/index/index?setIsLoggedFalse=true'
    })
  }

  // 获取数据
  getData () {
    driverRecentCar(this.props.nowUser.userId).then(data => {
      getCarByShipment({ limit: 100, offset: 0, selectType: 4 })
        .then(res => {
          // 进行一轮遍历，把忙碌车辆插入最后一位
          res.items.forEach((item, key) => {
            if (item.isBusy === 0) {
              const busyCar = res.items.splice(key, 1)[0]
              res.items.push(busyCar)
            }
          })

          // 把最近使用的车放到数组第一位
          const index = res.items.findIndex(item => item.carId === data.carId)

          if (index !== -1) {
            const defaultCar = res.items.splice(index, 1)
            res.items.splice(0, 0, defaultCar[0])
          }

          const list = res.items.map(item => {
            item.select = false
            if (data.carId === item.carId) {

              // 默认选中最近的车辆

              item.select = true
              item.lately = true
              // 如果当前车辆已被占用，二维码破裂，不可使用
              this.generateQrCodeMsg(item)
              this.onClose()

            } else {
              item.lately = false
            }
            return item
          })

          this.setState({
            list,
            currentList: list,
          })
        })
    })
  }


  // 前往添加车辆
  addCard = () => {
    router.push(`findCar?plat=${true}`)
  }

  // 打开model并启动渲染list
  showModal = () => {
    this.setState({
      modal1: true,
    })
  }

  // 选择车辆
  onSelect = carId => {
    const { currentList } = this.state
    const data = currentList.map((item, index) => {
      if (item.carId === carId) {
        if (item.isBusy === 0) {
          Toast.info('车辆忙碌，请选择空闲车辆！')
          return item
        }
        item.select = true
        this.setState({
          index,
        })
      } else {
        item.select = false
      }
      return item
    })
    this.setState({
      currentList: data,
    })
  }

  // 搜索
  search = (value) => {
    this.setState({
      value,
    })
    const { list } = this.state
    if (value) {
      const currentList = []
      list.forEach(item => {
        if (item.carNo.search(value) !== -1) {
          currentList.push(item)
        }
      })
      this.setState({
        currentList,
      })
    } else {
      this.setState({
        currentList: list,
      })
    }
  }

  // 确认提交
  onSubmit = () => {
    const { currentList } = this.state

    // 寻找当前的选择的车辆信息
    if (this.state.index !== null) {
      const currentCar = currentList[this.state.index]
      this.generateQrCodeMsg(currentCar)
    } else {
      Toast.fail('请选择车辆！')
    }
    this.onClose()
  }

  generateQrCodeMsg = (currentCar) =>{
    const wxUserInfo = JSON.parse(localStorage.getItem('wxUserInfo'))
    const { openId, nickName, avatarUrl } = wxUserInfo
    const { phone, userId, feedbackRate, fixtureNumber } = this.props.nowUser
    const realName = this.userInfo.nickName

    const { carId, carNo, carType, isBusy, carCategoryEntityList } = currentCar

    /*
    * 将车辆可承接类型的id集合转化为字符串存储在二维码中，用于在托运端扫码后根据是否匹配进行提示
    * */
    const carCategoryEntityListStr = carCategoryEntityList ? carCategoryEntityList.map(item=>item.categoryId).join(',') : ''

    const qrCodeMsg = JSON.stringify({
      carId,
      carNo,
      carType,
      isBusy,
      openId,
      nickName,
      phone,
      userId,
      avatar:avatarUrl,
      feedbackRate,
      fixtureNumber,
      realName,
      carCategoryEntityListStr
    })

    this.setState({
      qrCode: true,
      carNo,
      qrCodeMsg,
      currentCar,
    })
  }

  // 关闭model
  onClose = () => {
    this.setState({
      modal1: false,
    })
  }

  renderQrCode = ()=>{
    const { qrCode, qrCodeMsg, currentCar } = this.state
    if (qrCode){
      // 如果之前有选择过车辆，分两种情况：最近选择车辆忙碌、空闲
      if (currentCar.isBusy === 1){
        return <QRCode
          id='qrCode'
          value={qrCodeMsg}
          size={200} // 二维码的大小
          fgColor='#000000' // 二维码的颜色
          style={{ margin: 'auto' }}
        />
      }
      return <img src={codeErr} alt='图片显示错误' />

    }
    // 如果之前没选择过车辆，展示选择车辆按钮
    return <div styleName='codeBtn' onClick={() => this.showModal()}>选择车辆</div>

  }

  render () {
    const { getFieldProps } = this.props.form
    const { currentList, value, carNo, currentCar } = this.state

    const wxUserInfo = JSON.parse(localStorage.getItem('wxUserInfo'))
    const { nickName, avatarUrl } = wxUserInfo

    return (
      <>
        <div styleName='warp'>
          <div styleName='codeBlock'>
            {currentCar.isBusy === 0 && <div style={{ fontSize : '1.2em', textAlign : 'center', color :'#FF0066', margin : '1.5em' }}>当前车辆已被占用，请重新选择车辆</div>}

            <div styleName='code'>
              {this.renderQrCode()}
            </div>
            <div styleName='tipsBlock'>
              <div styleName='tips'>收款码用于提货后向对方展示</div>
            </div>
            <div styleName='tipsText'>请注意您的使用车辆和收款方式是否准确</div>
          </div>
          <div styleName='codeItem'>
            <div>车辆</div>
            <div styleName={carNo ? 'plat' : ''} onClick={() => this.showModal()}>{carNo || '选择车辆'}<Icon type='right' />
            </div>
          </div>

          <div style={{ background : '#fff', padding: '1em' }}>
            <div styleName='codeItem2'>
              <div>收款方式</div>
              <div>
                <img className='mr-10' src={wechat} alt='' />
                <div>微信</div>
              </div>
            </div>
            <Flex className='mt-10'>
              <Avatar size='large' src={avatarUrl} />
              <div className='ml-10'>{nickName}</div>
            </Flex>
          </div>

          <div styleName={this.state.modal1 ? 'model model2' : 'model'}>
            <div styleName='modelHead'>
              <div onClick={() => this.onClose()}>取消</div>
              <div>选择车辆</div>
              <div onClick={() => this.onSubmit()}>确定</div>
            </div>
            <div styleName='modelBody'>
              <div styleName='searchBox'>
                <div styleName='search'>
                  <Icon type='search' size='xxs' color='#999' />
                  <InputItem
                    {...getFieldProps('input3')}
                    value={value}
                    type='text'
                    placeholder='请输入车牌号进行检索'
                    onChange={(value) => this.search(value)}
                  />
                </div>
                <div styleName='modelAdd' onClick={() => this.addCard()}>+</div>
              </div>
              <div styleName='list'>
                {currentList.map(item => (
                  <div
                    key={item.carId}
                    styleName={item.select ? 'listItem active' : 'listItem'}
                    onClick={() => this.onSelect(item.carId)}
                  >
                    <div styleName='name'>{item.carNo}</div>
                    <div styleName='descAndState'>
                      <div>{item.isBusy === 1 ? '空闲' : '忙碌'}</div>
                    </div>
                    {item.lately ? <div styleName='lately'>最近使用</div> : ''}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </>
    )
  }
}

export default createForm()(collectionCode)
