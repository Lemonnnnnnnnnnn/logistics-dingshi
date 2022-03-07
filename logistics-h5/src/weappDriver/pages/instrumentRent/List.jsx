import React, { useEffect, useState } from 'react';
import CSSModules from 'react-css-modules'
import { Button } from 'antd-mobile'
import router from 'umi/router'
import { Row, Col } from 'antd'
import { getDriverServiceLease, getNowUser, getServiceLeaseConfigure } from '@/services/apiService'
import Item from './component/Item'
import styles from './List.less'

const InstrumentList = (props) =>{
  const { location: { query: { externalLink } } } = props

  const [canRentList, setCanRentList] = useState([])
  const [possessList, setPossessList ]= useState([])
  const [auditStatus, setAuditStatus] = useState(0);

  useEffect(()=>{
    getPossessList()
    getCanRentList()
  }, [])

  const getPossessList = async () => {
    const { userId, auditStatus } = await getNowUser()
    setAuditStatus(auditStatus)
    getDriverServiceLease({ dirverUserId : userId }).then(list=> {
      setPossessList(list)
    })
  }

  const getCanRentList = () =>{
    getServiceLeaseConfigure().then(list=> {
      setCanRentList(list)
    })
  }

  return (
    <div>
      {externalLink && externalLink !== 'undefined' && <Button type='ghost' size="small" className={styles.returnButton} onClick={()=>router.replace('/WeappDriver/main/personalCenter')}>回到首页</Button>}
      <div className={styles.block}>
        <div className={styles.title}>我租赁的设备</div>
        <Row type='flex'>
          {possessList.map(props=>
            <Col span={12}>
              <Item type='possess' key={props.logisticsServiceCarEntity?.serviceCarId} {...props} />
            </Col>
          )}
        </Row>
      </div>

      <div className={styles.block}>
        <div className={styles.title}>可租赁的设备</div>
        <Row type='flex'>
          {canRentList.map(props=>
            <Col span={12}>
              <Item type='canRent' auditStatus={auditStatus} key={props.leaseConfigureId} {...props} />
            </Col>
          )}
        </Row>
      </div>
    </div>)
}

export default CSSModules(InstrumentList, styles)
