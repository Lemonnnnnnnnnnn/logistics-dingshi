import React, { Component } from 'react';
import { Icon } from 'antd'
import { Toast } from 'antd-mobile'
import CopyToClipboard from 'react-copy-to-clipboard'
import nativeApi from '@/utils/nativeApi'
import consignmentPic from '@/assets/aboutUs_consignment.png'
import driverPic from '@/assets/aboutUs_driver.png'
import shipmentPic from '@/assets/aboutUs_shipment.png'
import styles from './aboutUs.css'

const picStyle = {
  width: '100%',
}

const callPhone = () => {
  nativeApi.onPhoneCall('17760427036')
}

export default class AboutUs extends Component {

  headPicture = {
    'consignment': <img alt='' style={picStyle} src={consignmentPic} />,
    'shipment': <img alt='' style={picStyle} src={shipmentPic} />,
    'driver': <img alt='' style={picStyle} src={driverPic} />,
  }

  listContent = [
    {
      label: '客服电话',
      content: <div>17760427036 <Icon onClick={callPhone} type="phone" theme="filled" style={{ float:'right', marginTop: '13px', width: '13px', height: '13px' }} /></div>,
      icon: <span>电话</span>,
      text:'17760427036',
      isCopy: false
    },
    {
      label: '微信公众号',
      content: 'ejianda56',
      isCopy: true
    },
    {
      label: '公司邮箱',
      content: 'ejianda@dingshikj.com',
      isCopy: true
    },
    {
      label: '公司地址',
      content: '成都市青羊区光华东三路489号西环广场4栋10楼1003-1005号',
      isCopy: true,
      style:{
        label: {
          verticalAlign: 'top'
        },
        value: {
          padding: '10px 0',
          lineHeight: '20px'
        }
      }
    }
  ]

  onCopy = (value, state) => {
    state ? Toast.success('已复制信息到剪切板', 1.3) : Toast.fail('剪切失败', 1.3)
  }

  renderList = () => {
    const conntent = this.listContent.map(item => (
      <li key={item.label} className={styles.item}>
        <div className={styles['item-label']} style={item.style&&item.style.label || {}}>{item.label}</div>
        <div className={styles['item-value']} style={item.style&&item.style.value || {}}>
          {
            item.isCopy ?
              <CopyToClipboard onCopy={this.onCopy} text={item.text||item.content}>
                <span>
                  {item.content}
                </span>
              </CopyToClipboard>
              :
              item.content
          }
        </div>

      </li>
    ))
    return (
      <ul className={styles.content}>
        {conntent}
      </ul>
    )
  }

  render () {
    const { location: { query: { type= 'driver', versionCode = '2.2.0', versionName = '2.2.0' } } } = this.props
    return (
      <>
        {this.headPicture[type]}
        <div className={styles.version}>版本号:2.3.1</div>
        {this.renderList()}
      </>
    )
  }
}
