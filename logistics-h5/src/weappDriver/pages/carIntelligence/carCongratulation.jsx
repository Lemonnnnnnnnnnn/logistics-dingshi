import React from 'react'
import { Button } from 'antd-mobile'
import { Icon } from 'antd'
import router from 'umi/router'

export default class carCongratulation extends React.Component{
  toCertification = () => {
    const { location:{ query:{ carId } } } = this.props
    router.replace(`carCertification?carId=${carId}`)
  }

  toOderHall = () => {
    router.push('/WeappDriver/main/hall')
  }

  render () {
    return (
      <>
        <div style={{ width: '80px', margin: '60px auto 25px' }}>
          <Icon type="check-circle" style={{ fontSize: '80px', color: 'rgb(9, 187 ,7)' }} theme="filled" />
        </div>
        <h3 style={{ color: 'rgba(34, 34, 34, 1)', fontSize: '17px', textAlign: 'center', fontWeight: 'bold', marginBottom: '100px' }}>恭喜你已完成车辆注册</h3>
        <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0 35px' }}>
          <Button type="ghost" inline size='small' style={{ width: '135px', fontSize: '17px', height: '40px', lineHeight: '40px' }} onClick={this.toCertification}>完善车辆信息</Button>
          <Button type="primary" inline size='small' style={{ width: '135px', fontSize: '17px', height: '40px', lineHeight: '40px' }} onClick={this.toOderHall}>去抢单</Button>
        </div>
      </>
    )
  }
}
