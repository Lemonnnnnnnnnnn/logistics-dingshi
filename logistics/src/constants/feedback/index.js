export const FEEDBACK_PORT = {
  DRIVER_APP: 1, // 司机APP
  CARRY_APP: 2, // 承运APP
  CONSIGNMENT_APP: 3, // 托运APP
  DRIVER_LET: 10, // 司机小程序
  CARRY_LET: 11, // 承运小程序
  CONSIGNMENT_LET: 12, // 托运小程序
  CUSTOMER_LET: 13, // 客户小程序
};

export const renderPort = (port) => {
  switch (port) {
    case FEEDBACK_PORT.DRIVER_APP:
      return '司机APP';
    case FEEDBACK_PORT.CARRY_APP:
      return '承运APP';
    case FEEDBACK_PORT.CONSIGNMENT_APP:
      return '托运APP';
    case FEEDBACK_PORT.DRIVER_LET:
      return '司机小程序';
    case FEEDBACK_PORT.CARRY_LET:
      return '承运小程序';
    case FEEDBACK_PORT.CONSIGNMENT_LET:
      return '托运小程序';
    case FEEDBACK_PORT.CUSTOMER_LET:
      return '客户小程序';
    default:
  }
};
export const FEEDBACK_ASK_TYPE = {
  ABNORMAL: 1, // 功能异常
  PROPOSAL: 2, // 产品建议
  OTHER: 3, // 其他问题
};

export const renderAskStatus= (type) => {
  switch (type) {
    case FEEDBACK_ASK_TYPE.ABNORMAL:
      return '功能异常';
    case FEEDBACK_ASK_TYPE.PROPOSAL:
      return '产品建议';
    case FEEDBACK_ASK_TYPE.OTHER:
      return '其他问题';
    default:
  }
};

