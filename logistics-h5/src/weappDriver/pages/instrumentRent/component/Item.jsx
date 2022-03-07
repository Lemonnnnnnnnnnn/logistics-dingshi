import React, { useEffect } from 'react'
import CSSModules from 'react-css-modules'
import { Button, Toast, Modal } from 'antd-mobile'
import { router } from 'umi'
import { getOssImg } from '@/utils/utils'
import styles from './Item.less'

const Item = (props) => {
  const { type } = props

  if (type === 'canRent') {
    const {
      leaseConfigurePhoto,
      leaseConfigureName,
      providerName,
      leaseConfigureDeposit,
      leaseConfigureExplain,
      leaseConfigureId,
      auditStatus
    } = props

    const routerToRent = () =>{
      if (auditStatus !== 1){
        Modal.alert('提示', '亲，请先实名认证',
          [
            { text: '取消' },
            { text: '确定', onPress: ()=>{
              router.push('/WeappDriver/intelligence')
            } }
          ] )
      } else {
        router.push(`/WeappDriver/instrumentRent?leaseConfigurePhoto=${leaseConfigurePhoto}&providerName=${providerName}&leaseConfigureDeposit=${leaseConfigureDeposit}&leaseConfigureExplain=${leaseConfigureExplain}&leaseConfigureName=${leaseConfigureName}&leaseConfigureId=${leaseConfigureId}`)
      }
    }
    return (
      <div className={styles.instrumentItem}>
        <img src={getOssImg(leaseConfigurePhoto)} alt='设备图片' />
        <div style={{ margin: '0.4rem 0 ' }}>{leaseConfigureName}</div>
        <Button
          type='ghost'
          size='small'
          onClick={routerToRent}
        >
          租赁
        </Button>
      </div>
    )
  }
  if (type === 'possess') {
    const { logisticsServiceCarEntity, logisticsServiceLeaseEntity, leaseConfigurePhoto } = props
    const { depositAmount, refundStatus } = logisticsServiceLeaseEntity
    return (
      <div className={styles.instrumentItem} onClick={() => router.push(`/WeappDriver/instrumentDetail?leaseId=${logisticsServiceLeaseEntity?.leaseId}`)}>
        {refundStatus === 3 && <div className={styles.refundStatus}>已归还</div>}
        <img src={getOssImg(leaseConfigurePhoto)} alt='设备图片' />
        <div style={{ margin: '0.4rem 0 ' }}>{logisticsServiceCarEntity?.deviceName || '星软GPS终端'}</div>
        {logisticsServiceLeaseEntity?.depositStatus !== 2 && <div style={{ color: '#68A7E4' }}>{depositAmount}元</div>}
      </div>
    )
  }


}
export default CSSModules(Item, styles)
