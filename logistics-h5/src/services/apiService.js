import moment from 'moment'
import request from '@/utils/request'
import { zipObject } from '@/utils/utils'
import { CARGOES } from '@/constants/organization/organizationType'

export const login = (userInfo) => request.post('/authcreate?', { data: userInfo, noAuth: true })

export const getProjectDetail = projectId => request.get(`/v1/projects/${projectId}`)

export const getBanner = (str) => request.get(`/authJumpUrl?key=${str}`, { noAuth: true });

export const getProjectList = params => request.get('/v1/projects', { params })

export const patchProject = params => request.patch('/v1/projects', { params })

export const getOSSToken = () => request.get('/v1/securitytokenoss')

export const useOcrGeneral = params => request.post('/v1/ocr/general', { data: params })

export const ocrBankAccount = params => request.get('/v1/users/ocrBankAccount', { params })

export const getBankAccount = params => request.get('/v1/users/getBankInfo', { params })

export const getProject = params => request.get('/v1/projects', { params })

export const getPrebooking = params => request.get('/v1/prebookings', { params })

export const patchPrebooking = params => request.patch(`/v1/prebookings/${params.prebookingId}`, { data: params })

export const getUser = params => request.get('/v1/users', {
  params: {
    ...params,
    organizationId: JSON.parse(localStorage.getItem('token')).organizationId,
  },
})

export const getReceivingLabel = params => request.get('/v1/receivingLabels', { params })

// 修改密码（使用原密码修改新密码）
export const patchUser = ({ userId, ...data }) => request.patch(`/v1/users/${userId}`, { data })

export const modifyUserInfo = params => request.patch(`/v1/users/myself`, { data: params })

export const postUser = (data) => request.post(`/v1/users`, { data })

export const getNowUser = () => request.get('/v1/users/now')

export const findAllShipment = params => request.get('/v1/organizations', {
  params: {
    ...params,
    selectType: 1,
    organizationType: 5,
    isAvailable: true,
    auditStatus: 1,
  },
})

export const getAllShipment = params => request.get('/v1/organizations', {
  params: {
    ...params,
    selectType: 3,
    vagueSelect: params.searchKey,
    organizationType: 5,
    isAvailable: true,
    auditStatus: 1,
  },
})

export const getAllCustomer = params => request.get('/v1/organizations', {
  params: {
    ...params,
    organizationType: 7,
    selectType: 1,
    auditStatus: 1,
    isAvailable: 1,
  },
})

export const getAllCargoes = params => request.get('/v1/organizations', {
  params: {
    ...params,
    selectType: 3,
    vagueSelect: params.searchKey,
    organizationType: 3,
    isAvailable: true,
    auditStatus: 1,
  },
})

export const getAllOperator = () => request.get('/v1/organizations', {
  params: {
    selectType: 1,
    organizationType: 2,
    isAvailable: true,
    auditStatus: 1,
    limit: 1000,
    offset: 0,
  },
})

export const getAllDriver = params => request.get(`/v1/drivers`, { params })

export const deleteDriverFromShipment = params => request.delete(`/v1/orgization/drivers/${params.orgDriverId}`)

export const addDriverToShipment = params => request.post(`/v1/orgization/drivers/${params.userId}`, { data: params })

export const shipmentAuditeProject = params => request.put(`/v1/projects/${params.projectId}/actions/audit`, { data: params })

export const shipmentDeleteProject = params => request.patch(`/v1/projectCorrelations/${params.projectCorrelationId}`, { data: params.isEffect })

export const changeTransportStatus = params => request.patch(`/v1/transports/${params.transportId}/status`, { data: params })

export const getExceptions = params => request.get(`/v1/transports/${params.transportId}/exceptions`, { params })

export const postExceptions = params => request.post(`/v1/transports/${params.transportId}/exceptions`, { data: params })

export const platRefuseProject = params => request.post(`/v1/logistics/verifys`, { data: params })

export const getDriverByShipment = params => request.get(`/v1/shiment/drivers`, { params })

export const getCarByShipment = params => request.get(`/v1/shiment/cars`, { params })

export const getTransportRejects = (transportId, selectRejectType) => request.get(`/v1/transportProcesses/${transportId}/reject`, { params: { selectRejectType } })

export const getMessage = params => request.get(`/v1/message`, { params })

export const readMessage = params => request.patch(`/v1/message/${params.messageId}`, { data: params })

export const readAllMessage = params => request.patch('/v1/message/batch', { data: params })

export const addDelivery = params => request.post('/v1/deliveries', { data: params })

// 车辆管理
export const getCars = ({
  carId,
  ...restParams
}) => request.get(`/v1/cars${carId ? `/${carId}` : ''}`, { params: restParams })

export const addCar = (params) => request.post('/v1/cars', { data: params })

export const getCarsList = (params) => request.get('/v1/cars', { params })

export const editCar = (params) => request.patch(`/v1/cars/${params.carId}`, { data: params })

export const carBasicAuth = params => request.post('/v1/carBasicAuth', { data: params })

export const completeCarInfo = (params) => request.patch(`/v1/completeCarInformation/${params.carId}`, { data: params })

export const noCompleteCarList = params => request.get(`/v1/cars/transportCarList`, { params })

export const getDictionaries = params => request.get('/v1/dictionaries', { params })

export const getTransport = (transportId) => request.get(`/v1/transports/${transportId}`)

export const ocrVehicleLicenseOcr = params => request.get(`/v1/cars/ocrVehicleLicenseOcr`, { params })

// 承运方(司机)查询司机最近开的那辆车
export const driverRecentCar = id => request.get(`/v1/shipment/driverRecentCar`, { params: { userId: id } })

// 获取运单详情
export const _getTransport = (transportId) => getTransport(transportId)
  .then(data => {
    data.processPointCreateTime = data.signItems[0].processPointCreateTime
    data.billNumber = data.signItems[0].billNumber
    data.billDentryid = data.signItems[0].billDentryid?.split(',')
    data.transportInfrom = {
      transportNo: data.transportNo,
      // shipmentName: data.shipmentName,
      driverUserName: data.driverUserName,
      plateNumber: data.plateNumber,
      driverUserPhone: data.driverUserPhone,
      expectTime: moment(data.expectTime).format('YYYY-MM-DD hh:mm:ss'),
      supplier: data.createOrgType === CARGOES ? data.cargoesName : data.consignmentName,
    }
    return data
  })

export const getCertificationEvents = params => request.get('/v1/logisticsAuthEvents', { params })

export const certificate = data => request.post('/v1/logistics/verifys', { data })

export const auditedReceipt = params => request.patch(`/v1/transports/${params.transportId}/status`, { data: params })

export const saveRoleAuth = ({ roleId, ...data }) => request.post(`/v1/roles/${roleId}/permissions`, { data })

export const getAllAuth = params => request.get('/v1/organization/permissions', { params })

export const getRolePermissions = roleId => request.get(`/v1/roles/${roleId}/permissions`)

export const getRoles = params => request.get('/v1/roles', { params })

export const saveUserRoles = ({ userId, ...data }) => request.post(`/v1/users/${userId}/roles`, { data })

export const deleteShipmentCar = params => request.delete(`/v1/orgization/cars/${params.orgCarId}`, { data: params })

export const addShipmentCar = params => request.post(`/v1/orgization/cars/${params.carId}`, { data: params })

export const getZhongJiaoTrace = params => request.get('/v1/trace', { params })

export const getTrackDentry = params => request.get('https://tsapi.amap.com/v1/track/terminal/trsearch', {
  noAuth: true,
  params: {
    ...params,
    key: window.envConfig.mapWebKey,
    correction: 'mode=driving,denoise=1,threshold=100',
    recoup: 0,
    gap: 1000,
    pagesize: 999,
    // sid: 50557,
    // tid: 187306880,
    // trid: 3100
  },
})
  .then(({ data }) => {
    const { counts, tracks: [track] } = data
    const mapPoint = ({ location }) => zipObject(['longitude', 'latitude'], location.split(','))
    return counts
      ? { points: track.points.map(mapPoint) || [], distance: track.distance }
      : { points: [], distance: 0 }
  })

export const getTransportProcesses = transportId => request.get(`/v1/transportProcesses/${transportId}/all`)

export const getTransportEvent = transportId => request.get(`/v1/transportEvents/${transportId}`)

export const modifyTransportReject = params => request.patch(`/v1/transports/${params.transportId}/transportProcesses`, { data: params })

// 生成Excel

// export const outputTransportExcel = params => request.get('/v1/transports/excel', { params })

// export const outputConsignmentreportExcel = params => request.get('/v1/consignmentreportexcel', { params })

// export const outputTransportAccountListExcel = params => request.get('/v1/account/goodsAccountList/excel', { params })

// export const outputTransportAccountDetailExcel = params => request.get(`/v1/accountGoodsDetail/${params.accountGoodsId}/excel`, { params })

export async function queryNotices () {
  return request.get('/api/notices')
}

export async function queryAuthorizations () {
  return request.get('/v1/user/permissions')
}

export default {
  login,
  patchProject,
}
// 首页 取认证/审核数量
export const getAuthnticationInfo = () => request.get('/v1/home/platform/authentication')

// 首页运单数量
export const getTransportInfo = params => request.get('/v1/home/platform/transport', { params })
// 取预约单数量
export const getPrebookingInfo = params => request.get('/v1/home/platform/prebooking', { params })

// 托运方首页 昨天今天增量统计
export const getconTodayAndYesIn = params => request.get('/v1/home/conTodayAndYesIn', { params })

//
export const getConTranStatusTotal = () => request.get('/v1/home/conTranStatusTotal')

export const getRroRecivingList = (params) => request.get('/v1/home/conProReceivingList', { params })

export const sendSMSCode = data => request.post('/authnotcode', { data })

export const register = data => request.post('/authregister', { data })

export const changePassword = data => request.patch('/authupdatepwd', { data })

// 托运项目维度统计
export const getChartTotal = params => request.get('/v1/home/getChartTotal', { params })

// 要货计划单

export const getGoodsPlansList = params => request.get('/v1/goodsPlans', { params })

export const getGoodsPlansDetail = goodsPlanId => request.get(`/v1/goodsPlans/${goodsPlanId}`)

export const postGoodsPlans = data => request.post('/v1/goodsPlans', { data })

export const patchGoodPlans = (params) => request.patch(`/v1/goodsPlans/${params.goodsPlanId}`, { data: params })

export const cancelGoodPlans = projectId => request.patch('/v1/goodsPlans', { data: { projectId, planStatus: 4 } })

// 卸货点

export const getReceivingList = params => request.get('/v1/receivings', { params })

export const deleteReceiving = receivingId => request.patch(`/v1/receivings/${receivingId}`, { data: { isEffect: 0 } })

export const getReceivingDetail = receivingId => request.get(`/v1/receivings/${receivingId}`)

export const addReceiving = data => request.post('/v1/receivings', { data })

export const modifyAddReceiving = data => request.patch(`/v1/receivings/${data.receivingId}`, { data })

export const getContractFromAuthCode = code => request.get(`/v1/projects/checkQrCode/${code}`)

export const getSMSCode = data => request.post('/authsendsms', { data })

export const bindContract = params => request.patch(`/v1/projects/${params.projectId}/action/joinProject`, { data: params })

export const getToDoList = (params) => request.get('/v1/pendings', { params })

export const getJsSDKConfig = (params) => request.get('/authJsApiSignature', { params })

export const AddContractReceiving = data => request.post(`/v1/projects/${data.projectId}/action/customerAddReceiving`, { data })

// 校验合同下有无未确认收货的运单
export const checkTransport = projectId => request.get(`/v1/projects/${projectId}/actions/checkTransport`)

// 修改运单状态
export const modifyTransportStatus = pramas => request.patch(`/v1/transports/${pramas.transportId}/status`, { data: pramas })

// 登出
export const exit = () => request.patch('/v1/exit')

// 客户首页项目维度统计

export const getCustomerChartTotal = params => request.get(`/v1/customer/chart/project/${params.projectId}`, { params })

// 子账号列表

export const getResponsible = params => request.get('/v1/projects/responsible', { params })

// 禁用启用子账号合同

export const patchResponsibleStatus = params => request.patch(`/v1/projects/responsible/${params.responsibleCorrelationId}`, { data: params })

// 取微信账号详情

export const getWxUser = params => request.get(`/v1/wxUser/${params.userId}`)

// 司机端点位过程处理

export const postTransportProcess = params => request.post(`/v1/transports/${params.transportId}/process`, { data: params })

// 司机端绑定银行卡

export const driverFindCar = params => request.get(`/v1/cars/driver/${params.carNo}`, { params })

export const driverBindCar = params => request.patch(`/v1/cars/driverBind/${params.carId}`, { data: params })

export const driverUnbindCar = params => request.patch(`/v1/cars/driverUnbind/${params.carId}`, { data: params })

export const setDefaultCar = params => request.patch(`/v1/cars/driver/${params.carId}`, { data: params })

export const postBankAccount = params => request.post('/v1/users/bankAccount', { data: params })

export const getIncomeDetails = params => request.get('/v1/financeAccountTransaction', { params })

export const getIncomeDetailsTotal = params => request.get('/v1/financeAccount/total', { params })

export const getWithdrawalTotal = params => request.get('/v1/financeCashOuts/getFinanceCashOutTotal', { params })

export const patchPasswordFirst = params => request.patch('/authgetuserid', { data: params })

export const patchPasswordSecond = params => request.patch('/authbyidpwd', { data: params })


// 查询托运项目列表

export const getProjects = params => request.get(`/v1/projects`, { params })

// 新建预约单

export const postPrebookings = params => request.post('/v1/prebookings', { data: params })

export const postPrebookingsReleaseHall = params => request.post('/v1/prebookings/releaseHall', { data: params })

export const patchPrebookings = params => request.patch(`/v1/prebookings/${params.prebookingId}`, { data: params })

// 评价

export const postEvaluate = params => request.post('/v1/evaluate', { data: params })

// 抢单

export const patchGrabbingOrder = params => request.patch('/v1/prebookings/grabbingOrder', { data: params })

export const auditDelivery = params => request.patch(`/v1/transports/${params.transportId}/auditDelivery`, { data: params })

// 修改手机号确认旧手机号

export const getConfirmPhone = params => request.get(`/v1/confirmPhone`, { params })

export const patchPhone = params => request.patch(`/v1/updateSelfPhone`, { data: params })

// 小程序绑定银行卡

export const getBankCard = params => request.get(`/v1/users/bankAccount/${params.bankAccountId}`)

export const getWeAppBankList = params => request.get(`/v1/bankAccount/bindList`, { params })

export const postWeAppBankAccount = params => request.post('/v1/weiChatBankAccount', { data: params })

export const patchWeAppBankCard = bankAccountId => request.patch(`/v1/bankAccount/${bankAccountId}/isAvailable`)

export const patchUnbindBankCard = bankAccount => request.patch(`/v1/bankAccount/${bankAccount}/removeBankAccount`)

// 虚拟账户

export const getVirtualAccount = params => request.get('/v1/virtualAccount', { params })

//  获取公钥

export const getPublicKey = () => request.post('/v1/getPublicKey')

// 托运付款

export const postPayOrder = params => request.post('/v1/orders/behalfPayOrder', { data: params })

// 查询接单大厅最新的预约单

export const latestPrebooking = () => request.get('/authPrebookingsNew')

// 数据总览

export const getDataOverview = params => request.get('/v1/transports/dataOverview', { params })

export const getArrayTransportAmount = params => request.get('/v1/transports/arrayTransportAmount', { params })

// 司机实名认证

export const postDriverBasicAuth = params => request.post('/v1/driverBasicAuth', { data: params })

export const patchCompleteInformation = params => request.patch('/v1/drivers/completeInformation', { data: params })

export const getFinanceCashOuts = params => request.get('/v1/financeCashOuts', { params })

export const getFinanceCashOutsMonth = params => request.get('/v1/financeCashOuts/month', { params })

export const getFinanceCashOutsDetail = cashOutId => request.get(`/v1/financeCashOuts/${cashOutId}`)

// 获取运单关联司机车辆列表

export const getUsefulCarList = params => request.get('/v1/cars/transportCarList', { params })

// 设置支付密码
export const setPayPassword = params => request.patch('/v1/setPayPassword', { data: params })

// 验证是否设置了支付密码
export const checkIsSetPayPassword = () => request.patch('/v1/checkIsSetPayPassword')

// 验证支付验证码

export const checkPayCode = (params) => request.patch('/v1/checkPayCode', { data: params })

// 托运个人中心- 待开余额，余额和项目数

export const getSelfTotalData = () => request.get('/v1/home/selfTotalData')

// 扫码生成运单

export const scanCreateTransport = (params) => request.post('/v1/transports/scanCreateTransport', { data: params })

// 扫码支付订单

export const scanPayOrder = params => request.post('/v1/orders/scanPayOrder', { data: params })

// 获取授权人手机号

export const getPaymentAuthorizationPhone = () => request.get('/v1/paymentAuthorizationPhone')

// 查询货品类目

export const getGoodsCategories = (params) => request.get(`/v1/goodsCategories`, { params })

// 获取设备租赁记录
export const getDriverServiceLease = params => request.get(`/v1/serviceLease/driver/${params.dirverUserId}`)

// 获取可租赁设备列表
export const getServiceLeaseConfigure = params => request.get('/v1/serviceLeaseConfigure/all', { params })

// 获取设备租赁记录详情
export const getServiceLeaseDetail = params => request.get(`/v1/serviceLease/${params.leaseId}`)

// 创建设备租赁记录
export const createServiceLease = params => request.post('/v1/serviceLease', { data: params })

// 身份OCR
export const getOcrIdCard = params => request.get('/v1/users/ocrIdCard', { params })

// 驾驶证OCR
export const getOcrDrivingLicense = params => request.get('/v1/users/ocrDrivingLicense', { params })

// 意见反馈列表
export const getFeedbackList = params => request.get('/v1/feedback', { params })

// 意见反馈详情
export const getFeedbackDetail = params => request.get(`/v1/feedback/${params.feedbackId}`, { params })

// 回复意见反馈
export const replyFeedback = params => request.patch(`/v1/feedback/reply/${params.feedbackId}`, { data: params })

// 创建意见反馈

export const postFeedBack = params => request.post('/v1/feedback', { data: params })

// 修改意见反馈
export const modifyFeedback = params => request.patch(`/v1/feedback/${params.feedbackId}`, { data: params })

/*= ======================项目看板========================== */
// 首页项目看板
export const getProjectBoard = params => request.get('/v1/projectBoard', { params })

// 查询项目看板的项目列表
export const getProjectBoardAttention = params => request.get('/v1/projectBoard/attention', { params })

// 单个项目看板
export const getProjectBoardSingle = params => request.get('/v1/projectBoard/single', { params })

// 最近天数托运单个项目看板数据
export const getProjectBoardRecent = params => request.get('/v1/projectBoard/recent', { params })

// 查询已关注和未关注的项目列表
export const getProjectAttentions = params => request.get('/v1/projectAttentions', { params })

// 保存所有关注项目  (删除原先关注,保存新传入的)
export const postProjectAttentionsAll = params => request.post('/v1/projectAttentions/all', { data: params })

// 取消关注项目
export const delProjectAttentions = params => request.delete('/v1/projectAttentions', { data: params })

// 新增关注项目
export const postProjectAttentions = params => request.post('/v1/projectAttentions', { data: params })

// 行驶证有效期OCROCR
export const getCarsDrivingLicenseValidityDateOcr = params => request.get('/v1/cars/drivingLicenseValidityDateOcr', { params })

// 司机修改驾驶证
export const driversUpdateCertificate = params => request.patch('/v1/drivers/updateCertificate', { data: params })