import React, { useEffect, useState } from 'react'
import { Button, Flex, Picker, List, Toast } from 'antd-mobile'
import { Row, Col } from 'antd'
import CSSModules from 'react-css-modules'
import router from 'umi/router'
import wechat from '@/assets/consign/wechat.png'
import { getUserInfo } from '@/services/user'
import styles from './List.less'
import { getCarsList, createServiceLease } from '@/services/apiService'
import { getOssImg } from '@/utils/utils'

const Rent = (props) => {
  const {
    location: {
      query: {
        leaseConfigurePhoto,
        leaseConfigureName,
        providerName,
        leaseConfigureDeposit,
        leaseConfigureExplain,
        leaseConfigureId,
      },
    },
  } = props
  const [carList, setCarList] = useState([])
  const [selectedCar, setSelectedCar] = useState([])

  useEffect(() => {
    getCarList()
  }, [])

  const rent = () => {
    if (!selectedCar.length) return Toast.fail('请选择使用车辆')

    const selectedCarDetail = carList.find(item => item.value === selectedCar[0])
    const { label : carNo, value :carId } = selectedCarDetail
    createServiceLease({ leaseConfigureId, carNo, carId }).then(({ leaseId }) => {
      Toast.success('创建租赁记录成功，正在跳转支付...', 1)
      setTimeout(() => {
        routeToMiniProgram(leaseId)
      }, 1000)
    })
  }

  const routeToMiniProgram = (leaseId) => {
    const path = '/WeappDriver/instrument'
    const { accessToken } = getUserInfo()
    wx.miniProgram.reLaunch({
      url: `/pages/payment/payment?route=${path}&accessToken=${accessToken}&leaseId=${leaseId}`,
    })
  }

  const getCarList = () => {
    getCarsList({ offset: 0, limit: 10000, selectType: 4 }).then(({ items }) => {
      const carList = items.map(item => ({ label: item.carNo, value: item.carId }))
      setCarList(carList)
      if (!carList.length) Toast.fail('可用车辆列表为空')
      if (carList.length === 1) selectCar([carList[0].value])
    })
  }

  const selectCar = (val) => {
    setSelectedCar(val)
  }

  return (
    <div className={styles.block}>
      <Flex justify='center'>
        <img className={styles.photo} src={getOssImg(leaseConfigurePhoto)} alt='设备图片' />
      </Flex>
      <div className={styles.providerName}>{providerName}</div>
      <div className={styles.textMessage}>
        <div className='mt-10'>设备厂家：{leaseConfigureName}</div>
        <div className='mt-10'>租赁押金：{leaseConfigureDeposit}</div>
        <Row className='mt-10' type='flex'>
          <Col span={6}>租赁说明：</Col>
          <Col span={18}>{leaseConfigureExplain}</Col>
        </Row>
        <Picker data={carList} cols={1} onChange={selectCar} value={selectedCar}>
          <List.Item arrow='horizontal'>使用车辆：</List.Item>
        </Picker>
        <Flex align='center'>
          <span>支付方式：</span>
          <img src={wechat} alt='微信图标' />
          <span className='color-gray ml-10'>微信安全支付</span>
        </Flex>
      </div>
      <Flex justify='around'>
        <Button size='small' type='primary' onClick={rent}>确认租赁并支付押金</Button>
        <Button size='small' onClick={()=>router.goBack()}>取消</Button>
      </Flex>
    </div>)
}

export default CSSModules(Rent, styles)
