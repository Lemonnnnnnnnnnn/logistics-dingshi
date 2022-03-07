const errMessageObj = {
  'LOGISTICS/FAILED_TO_IDENTIFY_THE_TRACKING_NUMBER': {
    needAlert: true,
    way: 'message',
    type: 'error',
    message: '快递单号识别失败！'
  },
  'LOGISTICS/PAYORDER_INVALID_OVERRUN_TIMES_ONE': {
    tips: '验证码输入错误！还剩2次机会，输错3次将被锁定30分钟',
    needAlert: false
  },
  'LOGISTICS/PAYORDER_INVALID_OVERRUN_TIMES_TWO': {
    tips: '验证码输入错误！还剩1次机会，输错3次将被锁定30分钟',
    needAlert: false
  },
  'LOGISTICS/PAYORDER_INVALID_OVERRUN_TIMES': {
    tips: '您因多次输错手机验证码，账号已被锁定30分钟！',
    needAlert: false
  },
  'LOGISTICS/PAYMENT_AUTHORIZATION_PHONE_INVALID_OVERRUN_TIMES_ONE': {
    tips: '验证码输入错误！还剩2次机会，输错3次将被锁定30分钟',
    needAlert: false
  },
  'LOGISTICS/PAYMENT_AUTHORIZATION_PHONE_INVALID_OVERRUN_TIMES_TWO': {
    tips: '验证码输入错误！还剩1次机会，输错3次将被锁定30分钟',
    needAlert: false
  },
  'LOGISTICS/PAYMENT_AUTHORIZATION_PHONE_INVALID_OVERRUN_TIMES': {
    tips: '您因多次输错手机验证码，账号已被锁定30分钟！',
    needAlert: false
  },
  'LOGISTICS/CHINA_TRAFFIC_DATE_ERROR': {
    tips: '起始日期大于结束日期',
    needAlert: true,
    way: 'Modal',
    type: 'warning',
    message: '温馨提示'
  },
  'LOGISTICS/CHINA_TRAFFIC_GET_TRACK_ERROR_SYSTEM': {
    tips: '无法获得轨迹信息-内部系统出错，请联系平台管理员',
    needAlert: true,
    way: 'Modal',
    type: 'warning',
    message: '温馨提示'
  },
  'LOGISTICS/CHINA_TRAFFIC_DATE_MORE_THAN_THREE': {
    tips: '行程不能大于7天',
    needAlert: true,
    way: 'Modal',
    type: 'warning',
    message: '温馨提示'
  },
  'LOGISTICS/CHINA_TRAFFIC_GET_TRACK_ERROR_NOT_DATA': {
    tips: '无法获得轨迹信息-该车轨迹数据不存在',
    needAlert: true,
    way: 'Modal',
    type: 'warning',
    message: '温馨提示'
  }
}

export default errMessageObj