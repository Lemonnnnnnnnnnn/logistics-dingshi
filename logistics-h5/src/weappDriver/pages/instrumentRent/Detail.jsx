import React, { useEffect, useState } from 'react'
import CSSModules from 'react-css-modules'
import { Flex, Button } from 'antd-mobile'
import moment from 'moment'
import { router } from 'umi'
import { Row, Col } from 'antd'
import { getServiceLeaseDetail } from '@/services/apiService'
import { getOssImg } from '@/utils/utils'
import styles from './List.less'


const Detail = (props) => {
  const { location: { query: { leaseId } } } = props
  const [leaseConfigurePhoto, setLeaseConfigurePhoto] = useState('')
  const [logisticsServiceCarEntity, setLogisticsServiceCarEntity] = useState({})
  const [logisticsServiceLeaseEntity, setLogisticsServiceLeaseEntity] = useState({})


  const serviceStateDist = {
    0: '欠费停机',
    1: '正常',
    2: '保号停机',
    3: '欠费',
    4: '暂时开机',
  }

  const refundStatusDist = {
    0: '未归还',
    1: '已申请',
    2: '审核拒绝',
    3: '已归还',
  }

  useEffect(() => {
    getServiceLeaseDetail({ leaseId }).then(serviceLeaseDetail => {
      setLeaseConfigurePhoto(serviceLeaseDetail.leaseConfigurePhoto)
      setLogisticsServiceCarEntity(serviceLeaseDetail.logisticsServiceCarEntity)
      setLogisticsServiceLeaseEntity(serviceLeaseDetail.logisticsServiceLeaseEntity)
    })
  }, [])

  const retService = () =>{
    // 等待接口
    console.log('归还设备')
  }

  const getMoneyBack = () =>{
    // 等待接口
    console.log('退押金')
  }

  return (
    <div className={styles.block}>
      <div className={styles.title}>我租赁的设备</div>
      <Flex justify='center'>
        <img className={styles.photo} src={getOssImg(leaseConfigurePhoto)} alt='设备图片' />
      </Flex>
      <div
        className={styles.providerName}
      >{logisticsServiceCarEntity ? logisticsServiceCarEntity.deviceName : `${logisticsServiceLeaseEntity?.providerName}GPS终端`}
      </div>
      <div className={styles.textMessage}>
        <div className='mt-10'>设备厂家：{logisticsServiceLeaseEntity?.providerName}</div>
        <div className='mt-10'>设备SN号：{logisticsServiceCarEntity?.soid}</div>
        {/* <div className='mt-10'>租赁时间：{refundStatus}</div> */}
        <div className='mt-10'>使用车辆：{logisticsServiceLeaseEntity?.carNo}</div>
        <Row type='flex' align='middle' className='mt-10'>租赁状态：
          <div>{refundStatusDist[logisticsServiceLeaseEntity?.refundStatus]}</div>
          {/* {logisticsServiceLeaseEntity?.refundStatus === 0 && <Button onClick={retService} style={{ marginLeft : '0.5rem' }} type='ghost' size='small'>归还</Button>} */}
        </Row>
        <div
          className='mt-10'
        >设备状态：{logisticsServiceCarEntity ? serviceStateDist[logisticsServiceCarEntity.serviceState] : ''}
        </div>
        <Row type='flex' align='middle'>
          <div className='mt-10'>押金：{logisticsServiceLeaseEntity?.depositAmount}元</div>

          {/* {logisticsServiceLeaseEntity?.refundStatus === 3 && <Button onClick={getMoneyBack} style={{ marginLeft: '0.5rem' }} type='ghost' size='small'>退押金</Button>} */}
        </Row>
        <div className='mt-10'>押金交纳时间：{logisticsServiceLeaseEntity.depositPayTime ? moment(logisticsServiceLeaseEntity.depositPayTime).format('YYYY-MM-DD') : ''}</div>
        {logisticsServiceLeaseEntity?.depositRefundTime && (
          <div>
            押金退还时间：{logisticsServiceLeaseEntity.depositRefundTime ? moment(logisticsServiceLeaseEntity?.depositRefundTime.format('YYYY-MM-DD')) : ''}
          </div>)}
      </div>
    </div>
  )
}
export default CSSModules(Detail, styles)
