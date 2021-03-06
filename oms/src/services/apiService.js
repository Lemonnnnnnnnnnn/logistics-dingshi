import moment from 'moment';
import request from '@/utils/request';
import { zipObject, routerToExportPage } from '@/utils/utils';
import { getUserInfo } from '@/services/user';

export const login = (userInfo) => request.post('/authcreate?', { data: userInfo, noAuth: true });
export const getBanner = (str) => request.get(`/authJumpUrl?key=${str}`, {  noAuth: true });

export const homepageModifyPassword = (params) => request.patch('/authupdatepwd', { data: params, noAuth: true });

export const test = () => request.get('/v1/transportsSelectList');

export const getProjectDetail = projectId => request.get(`/v1/projects/${projectId}`);

export const patchProject = params => request.patch('/v1/projects', { params });

export const getExportData = params => request.get('/v1/exportData', { params });

export const getOSSToken = () => request.get('/v1/securitytokenoss');

export const getPrebookingDetail = params => request.get(`/v1/prebookings/${params.prebookingId}`, { params });

export const postPreBooking = params => request.post('/v1/prebookings', { data: params });

export const postReleaseHallPrebooking = params => request.post('/v1/prebookings/releaseHall', { data: params });

export const getProject = params => request.get('/v1/projects', { params });

export const getUser = params => request.get('/v1/users', {
  params: {
    ...params,
    organizationId: JSON.parse(localStorage.getItem('token')).organizationId,
  },
});
export const getAllUser = params => request.get('/v1/users', {
  params: {
    ...params
  },
});
export const getReceivingLabel = params => request.get('/v1/receivingLabels', { params });

export const patchUser = ({ userId, ...data }) => request.patch(`/v1/users/${userId}`, { data });

export const modifyPassword = params => request.patch(`/v1/users/myself`, { data: params });

export const postUser = (data) => request.post(`/v1/users`, { data });

export const findAllShipment = params => request.get('/v1/organizations', {
  params: {
    ...params,
    selectType: 1,
    organizationType: 5,
    isAvailable: true,
    auditStatus: 1,
  },
});

export const addOrganization = data => request.post('/v1/organizations', { data });

export const getAllShipment = params => request.get('/v1/organizations', {
  params: {
    ...params,
    selectType: 3,
    vagueSelect: params.searchKey,
    organizationType: 5,
    isAvailable: true,
    auditStatus: 1,
  },
});

export const getAllCustomer = params => request.get('/v1/organizations', {
  params: {
    ...params,
    organizationType: 7,
    selectType: params.selectType,
    auditStatus: 1,
    isAvailable: true,
    vagueSelect: params.searchKey,
  },
});

export const getAllCargoes = params => request.get('/v1/organizations', {
  params: {
    ...params,
    selectType: 3,
    vagueSelect: params.searchKey,
    organizationType: 3,
    isAvailable: true,
    auditStatus: 1,
  },
});

export const getOrganizations = params => request.get('/v1/organizations', {
  params: {
    ...params,
    vagueSelect: params.searchKey,
    isAvailable: true,
    auditStatus: 1,
  },
});

export const getAllConsignment = params => request.get('/v1/organizations', {
  params: {
    ...params,
    selectType: 3,
    vagueSelect: params.searchKey,
    organizationType: 4,
    isAvailable: true,
    auditStatus: 1,
  },
});

export const getOrganizationNameList = params => request.get('/v1/organizationNameList', {
  params: {
    ...params,
    organizationName: params.searchKey,
    organizationTypeList: [4],
    isAvailable: true,
    auditStatus: 1,
  },
});

// ???????????????????????????
export const getSupplierOrganizationNameList = params => request.get('/v1/organizationNameList', {
  params: {
    ...params,
    organizationName: params.searchKey,
    organizationTypeList:6,
    isAvailable: true,
    auditStatus: 1,
  },
});

// ??????????????????
export const getAllProjectsList = params => request.get('/v1/projects', {
  params: {
    ...params,
    projectName: params.searchKey,
  },
});

export const getAllOperator = () => request.get('/v1/organizations', {
  params: {
    selectType: 1,
    organizationType: 2,
    isAvailable: true,
    auditStatus: 1,
    limit: 1000,
    offset: 0,
  },
});

export const getAllDriver = params => request.get(`/v1/drivers`, { params });

export const deleteDriverFromShipment = params => request.delete(`/v1/orgization/drivers/${params.orgDriverId}`);

export const addDriverToShipment = params => request.post(`/v1/orgization/drivers/${params.userId}`, { data: params });

export const shipmentAuditeProject = params => request.put(`/v1/projects/${params.projectId}/actions/audit`, { data: params });

export const shipmentDeleteProject = params => request.patch(`/v1/projectCorrelations/${params.projectCorrelationId}`, { data: params });

export const changeTransportStatus = params => request.patch(`/v1/transports/${params.transportId}/status`, { data: params });

export const getExceptions = params => request.get(`/v1/transports/${params.transportId}/exceptions`, { params });

export const platRefuseProject = params => request.post(`/v1/logistics/verifys`, { data: params });

export const getDriverByShipment = params => request.get(`/v1/shiment/drivers`, { params });

export const getCarByShipment = params => request.get(`/v1/shiment/cars`, { params });

export const getTransportRejects = transportId => request.get(`/v1/transportProcesses/${transportId}/reject`);

export const deleteCustomerRelationships = params => request.delete(`/v1/consignmentRelationships/${params.consignmentRelationshipId}`);

export const postConsignmentRelationships = params => request.post(`/v1/consignmentRelationships`, { data: params });

export const getAuthNotCode = (params) => request.post(`/authnotcode`, { data: params });

export const confirmTransport = params => request.patch(`/v1/transports/${params.transportId}/confirmTransport`, { data: params });

// ????????????
export const getCars = ({
                          carId,
                          ...restParams
                        }) => request.get(`/v1/cars${carId ? `/${carId}` : ''}`, { params: restParams });

export const detailCars = (params) => request.get(`/v1/cars/${params.carsId}`);

export const addCar = (params) => request.post('/v1/cars', params);

export const bindCarSearch = (params) => request.get(`/v1/cars/driver/${params.carNo}`, params);

export const carBasicAuth = params => request.post('/v1/carBasicAuth', { data: params });

export const completeCarInfo = (params) => request.patch(`/v1/completeCarInformation/${params.carId}`, { data: params });

export const getDictionaries = params => request.get('/v1/dictionaries', { params });

export const setTransportStatus = (transportId, params) => request.patch(`/v1/transports/${transportId}/status`, { data: params });


/**
 *
 * @description ??????????????????
 */
export const platAddCar = (params) => request.post('/v1/cars/platform', { data: params });
/**
 *
 * @description ??????????????????
 * @param {Object} params
 */

export const getTransport = (transportId) => request.get(`/v1/transports/${transportId}`);

export const getTransportList = params => request.get('/v1/transports', { params });

export const getTransportsSelectIdType = (params) => request.get('/v1/transportsSelectIdType', { params :{ selectTransportPriceType : true, ...params } });

export const getCertificationEvents = params => request.get('/v1/logisticsAuthEvents', { params });

export const certificate = data => request.post('/v1/logistics/verifys', { data });

export const auditedReceipt = params => request.patch(`/v1/transports/${params.transportId}/status`, { data: params });

export const saveRoleAuth = ({ roleId, ...data }) => request.post(`/v1/roles/${roleId}/permissions`, { data });

export const getAllAuth = params => request.get('/v1/organization/permissions', { params });

export const getRolePermissions = roleId => request.get(`/v1/roles/${roleId}/permissions`);

export const getRoles = params => request.get('/v1/roles', { params });

export const saveUserRoles = ({ userId, ...data }) => request.post(`/v1/users/${userId}/roles`, { data });

export const deleteShipmentCar = params => request.delete(`/v1/orgization/cars/${params.orgCarId}`, { data: params });

export const addShipmentCar = params => request.post(`/v1/orgization/cars/${params.carId}`, { data: params });

export const auditDelivery = params => request.patch(`/v1/transports/${params.transportId}/auditDelivery`, { data: params });

export const updateReceiving = params => request.patch(`/v1/transports/${params.transportId}/updateReceiving`, { data: params });

export const findUnKnownDelivery = params => request.get(`/v1/deliveries/findUnKnownDelivery`, { params });


export const getTrackDentry = params => {
  let total = 0;
  const pagesize = 999;
  const result = { points: [], distance: 0 };
  const mapPoint = ({
                      location,
                      locatetime,
                    }) => zipObject(['longitude', 'latitude', 'locatetime'], [...location.split(','), locatetime]);
  const createParams = ({ page = 1, ...params }) => ({
    ...params,
    page,
    pagesize,
    gap: 1000,
    recoup: 0,
    key: window.envConfig.mapWebKey,
    correction: 'mode=driving,denoise=1,threshold=100',
  });
  const createRequest = params => request.get('https://tsapi.amap.com/v1/track/terminal/trsearch', {
    noAuth: true,
    params,
  });

  return createRequest(createParams({ ...params, page: 1 }))
    .then(({ data }) => {
      const { counts, tracks: [track] } = data;
      total = track.counts;

      if (counts) {
        result.points = track.points.map(mapPoint) || [];
        result.distance = track.distance;
        const restRequest = new Array(Math.ceil(((total) / pagesize) || 1) - 1).fill(0)
          .map((item, index) => createRequest(createParams({ ...params, page: index + 2 })));
        return Promise.all(restRequest);
      }

      return Promise.resolve([]);
    })
    .then(restData => {
      restData.forEach(({ data }) => {
        result.points = [...result.points, ...data.tracks[0].points.map(mapPoint) || []];
      });

      return result;
    });
};

export const getZhongJiaoTrace = params => request.get('/v1/trace', { params });

export const getTransportProcesses = transportId => request.get(`/v1/transportProcesses/${transportId}/all`);


export const modifyTransportReject = params => request.patch(`/v1/transports/${params.transportId}/transportProcesses`, { data: params });

export const getElectronicDocuments = params => request.get('/v1/electronicDocuments', { params });

export async function queryNotices() {
  return request.get('/v1/message', { params: { limit: 100, offset: 0 } });
}

export const readMessage = params => request.patch(`/v1/message/${params.messageId}`, { data: params });

export const readAllMessage = () => request.patch('/v1/message/batch', { data: {} });

export async function queryAuthorizations() {
  return request.get('/v1/user/permissions');
}

export default {
  login,
  patchProject,
};
// ?????? ?????????/????????????
export const getAuthnticationInfo = () => request.get('/v1/home/platform/authentication');

// ??????????????????
export const getTransportInfo = params => request.get('/v1/home/platform/transport', { params });
// ??????????????????
export const getPrebookingInfo = params => request.get('/v1/home/platform/prebooking', { params });

// ??????????????? ????????????????????????
export const getconTodayAndYesIn = params => request.get('/v1/home/conTodayAndYesIn', { params });

//
export const getConTranStatusTotal = () => request.get('/v1/home/conTranStatusTotal');

export const getRroRecivingList = (params) => request.get('/v1/home/conProReceivingList', { params });

export const patchAuditGoodsAccount = params => request.patch(`/v1/account/goods/audit`, { data: params });

export const patchGoodsAccount = (accountGoodsId, params) => request.patch(`/v1/account/goods/${accountGoodsId}`, { data: params });

export const detailGoodsAccount = (accountGoodsId) => request.get(`/v1/account/goods/${accountGoodsId}`);

export const createGoodsAccount = params => request.post(`/v1/account/goods`, { data: params });

export const postGoodsPrice = params => request.post(`/v1/account/modifyPrice`, { data: params });

export const getSlideVerify = () => request.get('/authslidecode');

// ???????????????

export const getGoodsPlansList = (params) => request.get('/v1/goodsPlans', { params });

export const getGoodsPlanDetail = goodsPlanId => request.get(`/v1/goodsPlans/${goodsPlanId}`);

export const patchGoodsPlan = params => request.patch(`/v1/goodsPlans/${params.goodsPlanId}`, { data: params });

// excel??????

export const getTemplate = params => request.get('/v1/templates', { params });

export const postTemplate = params => request.post('/v1/templates', { data: params });

export const patchTemplate = params => request.patch(`/v1/templates/${params.templateId}`, { data: params });

// ??????????????????

export const getTransportDataAnalysis = params => request.get('/v1/transportDataAnalysis', { params });

// ??????????????????excel

export const exportTransportDataAnalysisExcel = params => {
  const { organizationId, organizationType } = getUserInfo();
  const createDateStart = params?.createTime?.[0]?.set({
    hour: 0,
    minute: 0,
    second: 0,
    millisecond: 0,
  }).format('YYYY/MM/DD HH:mm:ss');
  const createDateEnd = params?.createTime?.[1]?.set({
    hour: 23,
    minute: 59,
    second: 59,
    millisecond: 999,
  }).format('YYYY/MM/DD HH:mm:ss');
  const timestamp = String(new Date().valueOf());
  const newParams = { ...params, createDateStart, createDateEnd, organizationType, organizationId, fileName : `??????????????????${timestamp}` };
  delete newParams.createTime;

  routerToExportPage(sendTransportDataAnalysisExcelPost, newParams);
};

// ????????????

export const signContract = params => request.post('/v1/contracts', { data: params });

export const patchContract = (contractId, params) => request.patch(`/v1/contracts/${contractId}`, { data: params });

export const contractCorrelation = (contractId, params) => request.post(`/v1/contractCorrelation/${contractId}`, { data: params });

export const getAllProject = (params) => request.get('/v1/projects', { params });

export const getTransportsSelectProject = (params) => request.get(`/v1/transportsSelectProject`, { params });

// ????????????

export const getAuthorizationPhone = params => request.get(`/v1/paymentAuthorizationPhone`, { data: params });

export const changePaymentAuthorizationPhone = params => request.patch(`/v1/paymentAuthorizationPhone`, { data: params });

export const getUserInvoice = () => request.get('/v1/userInvoice');

export const patchUserInvoice = (params) => request.patch('/v1/userInvoice', { data: params });

export const fundsRecharge = (params) => request.post('/v1/recharges', { data: params });


export const getLogisticsVirtualAccount = (params) => request.get('/v1/logisticsVirtualAccount', { params });

export const getAccountsInformation = (params) => request.get('/v1/internalTransfers/getAccountsInformation', { params });

export const postInternalTransfer = (params) => request.post('/v1/internalTransfers/initiatingInternalTransfer', { data: params });

export const postWithdraw = (params) => request.post('/v1/internalTransfers/incomeAccountWithdrawDeposit', { data: params });

export const postBussinessBehalfPay = (params) => request.post(`/v1/orderDetail/${params.financeBusinessId}/reBehalfPayBusiness`, { data: params });

export const postTransferBehalfPay = (params) => request.post(`/v1/financeBusiness/${params.financeBusinessId}/repayInternalTransfer`, { data: params });

export const postScanPayOrderPay = (params) => request.post(`/v1/orders/${params.businessId}/scanPayOrder`, { data : params });

// ?????????

export const createOrder = (params) => request.post('/v1/orders', { data: params });

export const transportsAdjustment = (params) => request.patch('/v1/orders/list', { data: params });

export const payOrder = (params) => request.post('/v1/orders/behalfPayOrder', { data: params });


export const patchOrders = (orderId, params) => request.patch(`/v1/orders/${orderId}`, { data: params });

export const detailOrders = orderId => request.get(`/v1/orders/${orderId}`);

export const getOldOrders = (orderIdList) => request.get(`/v1/orders?orderIdList=${orderIdList}&limit=10000&offset=0`);


export const getTransports = (params) => request.get(`/v1/orders/transports`, { params });

export const getTransportsPost = (params) => request.post(`/v1/orders/transports/post`, { data : params });

// ??????????????????

export const getPublicKey = () => request.post('/v1/getPublicKey');

// ????????????

export const patchInvoice = (invoiceId, params) => request.patch(`/v1/invoices/${invoiceId}`, { data: params });

export const getExpressCompany = (params) => request.get(`/v1/getExpressCompany`, { params });

export const postInvoice = (params) => request.post(`/v1/invoices`, { data: params });

export const detailInvoice = (invoiceId) => request.get(`/v1/invoices/${invoiceId}`);

// ????????????

export const patchUserInvoices = params => request.patch(`/v1/userInvoices`, { data: params });


// ??????????????????

export const getTransportAccountDetail = params => request.get(`/v1/account/transport/${params.accountTransportId}`, { params })
  .then(data => {
    const newAccountDetailItems = data.accountDetailItems.map(item => {
      item.projectId = data.projectId;
      item.deliveryItems = (item.accountCorrelationCnItems || []).map(deliveryItem => {
        deliveryItem.transportId = item.transportId;
        return deliveryItem;
      });
      item.chargeMode = item.deliveryItems[0].chargeMode;
      item.shipmentType = data.shipmentType;
      delete item.accountCorrelationCnItems;
      return item;
    });
    data.accountDetailItems = newAccountDetailItems;
    return data;
  });

export const modifyTransportAccount = params => request.patch(`/v1/account/transport/${params.accountTransportId}`, { data: params });

export const modifyTransportCost = params => request.post('/v1/transports/transportPrice', { data: params });

export const refuseTransport = params => request.patch('/v1/account/transport/detail/audit', { data: params });

export const getAccountEvent = params => request.get(`/v1/account/transport/event/${params.accountTransportId}`, { params });

export const postExpenses = params => request.post('/v1/account/transport/expenses', { data: params });


// ????????????????????????

export const getPlatformVirtualAccount = params => request.get('/v1/platformVirtualAccount', { params });

export const getShipmentVirtualAccount = params => request.get('/v1/virtualAccount', { params });

// ??????????????????

export const checkIdCard = params => request.get('/v1/users/checkIdCard', { params });

export const detailGroup = params => request.get(`/v1/groups/${params.groupId}`, { params });

// ??????????????????

export const getBusinessType = params => request.get('/v1/businessTypes', { params });

export const detailBusinessType = businessTypeId => request.get(`/v1/businessType/${businessTypeId}`);

// ??????????????????

export const postTradingSchemes = params => request.post(`/v1/tradingSchemes/`, { data: params });

export const patchTradingScheme = (tradingSchemeId, params) => request.patch(`/v1/tradingSchemes/${tradingSchemeId}`, { data: params });

export const getTradingSchemes = tradingSchemeId => request.get(`/v1/tradingSchemes/${tradingSchemeId}`);

export const getTradingSchemesList = params => request.get(`/v1/tradingSchemes`, { params });

// ????????????

export const patchProjectConfigure = (projectId, params) => request.patch(`/v1/projects/configure/${projectId}`, { data: params });


// ???????????????

export const getBankInfo = params => request.get(`/v1/users/getBankInfo`, { params });

// ????????????

export const postDriverBasicAuth = params => request.post('/v1/driverBasicAuth', { data: params });

export const patchCompleteInformation = params => request.patch('/v1/drivers/completeInformation', { data: params });

// ??????

export const postSupplementTransport = params => request.post('/v1/supplementTransport', { data: params });

export const getSupplementDetails = params => request.get('/v1/supplementDetails', { params });

export const updateSupDetailList = params => request.patch('/v1/updateSupDetailList', { data: params });

export const patchSupplementTransport = params => request.patch(`/v1/supplementTransport/${params.supplementId}`, { data: params });

// ??????????????????

export const patchSupplementTransportAsync = params => request.patch(`/v1/supplementTransport/${params.supplementId}/asy`, { data: params });

// ????????????

export const postFinanceAccounts = params => request.post('/v1/financeAccounts', { data: params });

export const patchFinanceAccounts = params => request.patch(`/v1/financeAccounts/${params.transactionId}`, { data: params });

export const getBranchBanks = params => request.get('/v1/branchBanks', { params });

// ????????????

/**
 *
 * @description ?????????????????????
 */
export const getAbnormal = params => request.get('/v1/accountReconciliation/abnormal', { params });

/**
 *
 *
 * @description ????????????????????????????????? - ????????????
 */
export const refundRepay = financeAccountTransactionId => request.post(`/v1/financeAccounts/${financeAccountTransactionId}/repayAbnormalRechargeRefund`);

/**
 * @description ???????????????????????????
 */
export const getCalcOrders = params => request.get('/v1/orders/sumData', { params });



/**
 * @description ??????????????????
 */
export const detailCustomerBalance = (params) => request.get(`/v1/logisticsVirtualAccount/check/${params.virtualAccountId}`, { params });

/**
 * @description ????????????
 */

export const getRevenueData = (params) => request.get(`/v1/operationRevenue`, { params });

/**
 * @description ????????????
 */

export const getBusinessData = (params) => request.get(`/v1/operationData`, { params });

export const getTransportBoardCategory = (params) => request.get(`/v1/transportBoard/category`, { params });

export const getTransportBoardTransportList = (params) => request.get(`/v1/transportBoard/transportList`, { params });

export const getOwnerPayTime = (params) => request.get(`/v1/transportBoard/getOwnerPayTime`, { params })
  .then((data) => {
    const { items, count } = data;
    const _items = items.map((item) => {
      const time = moment.duration(Math.abs(item.avgTime), 's');
      const hours = time.asHours().toFixed(2);
      const timeWord = `${Math.floor(time.asHours())}:${time.minutes()}:${time.seconds()}`;
      return {
        ...item,
        hours,
        timeWord,
      };
    });
    return {
      count,
      items: _items,
    };
  });

export const getPlatPayTime = (params) => request.get(`/v1/transportBoard/getPlatPayTime`, { params })
  .then((data) => {
    const { items, count } = data;
    const _items = items.map((item) => {
      const time = moment.duration(item.avgTime, 's');
      const hours = time.asHours().toFixed(2);
      const timeWord = `${Math.floor(time.asHours())}:${time.minutes()}:${time.seconds()}`;
      return {
        ...item,
        hours,
        timeWord,
      };
    });
    return {
      count,
      items: _items,
    };
  });

export const getTransportAuditRate = (params) => request.get(`/v1/transportBoard/transportAuditRate`, { params });

export const getTransportBoardDriverActivity = (params) => request.get(`/v1/transportBoard/driverActivity`, { params })
  .then((data) => {
    const _data = data.map(item => ({
      ...item,
      formatDate: item.type === 1 ? moment(item.date).format('YY-MM-DD') : item.date,
    }));
    return _data;
  });

/**
 * @description ????????????
 */

export const getCarGroups = (params) => request.get(`/v1/carGroups`, { params });


/**
 * @description ????????????
 */

export const createCarGroups = (params) => request.post(`/v1/carGroups`, { data: params });

/**
 * @description ????????????
 */

export const patchCarGroups = (params) => request.patch(`/v1/carGroups/${params.carGroupId}`, { data: params });

/**
 * @description ????????????
 */

export const detailCarGroups = (carGroupId) => request.get(`/v1/carGroups/${carGroupId}`);

/**
 * @description ??????????????????
 */

export const modifyCarGroups = (params) => request.patch(`/v1/carGroupCorrelations/${params.carGroupId}`, { data: params });

/**
 * @description ????????????????????????
 */

export const singleModifyCarGroups = (params) => request.patch(`/v1/carGroupCorrelations/${params.carGroupId}/add`, { data: params });

/**
 * @description ???????????????????????????????????????
 */

export const getAccountCarReminds = (params) => request.get('/v1/accountCarReminds', { params });

/**
 * @description ????????????????????????
 */

export const getAccountBalance = (params) => request.get('/v1/accountBreakEven', { params });

/**
 * @description ????????????
 */

export const getAccountReconciliationApi = (params) => request.get('/v1/accountReconciliation', { params });

/**
 * @description ????????????????????????
 */

export const getAccountReconciliationBankAccount = () => request.get('/v1/accountReconciliation/getBankAccount');

/**
 * @description ??????????????????
 */
export const setTransportMsgApi = (transportId, params) => request.patch(`/v1/transports/${transportId}`, { data: params });

/**
 * @description ???????????????
 */
export const addBankAccount = (params) => request.post('/v1/bankAccount/platformToDriver', { data: params });

/**
 * @description ??????/???????????????
 */
export const changeBankAccountStatus = (bankAccountId) => request.patch(`/v1/bankAccount/${bankAccountId}/isAvailable`);

/**
 * @description ????????????????????????
 */
export const getUsersNow = () => request.get('/v1/users/now');


/**
 * @description ?????????????????????????????????????????????
 */
export const getDriverBankAccountInfo = (params) => request.get('/v1/bankAccount/userId', { params });


/**
 * @description ??????????????????
 */
export const manualEntryToAccount = params => request.post('/v1/manualEntryToAccount', { data : params });

/**
 * @description ????????????-????????????
 */
export const repayManualEntry = params => request.post(`/v1/manualEntryToAccount/${params.financeBusinessId}/repayManualEntry`, { data : params });

/**
 * @description ????????????
 */
export const getAccountStatementSpecified = (params) =>request.get('/v1/accountStatementSpecified', { params });

/**
 * @description ??????????????????excel
 */
export const sendTransportExcelPost = params => request.get('/v1/transports/excel', { params });

/**
 * @description ??????????????????excel
 */
export const sendTransportEventsExcelPost = params => request.get('/v1/transportEvents/excel', { params });

/**
 * @description ????????????????????????excel
 */
export const sendAccountTransportExcelPost = (params) => request.get(`/v1/account/excel`, { params });

/**
 * @description ????????????????????????excel
 */
export const sendAccountTransportListExcelPost = (params) => request.get(`/v1/account/transportList/excel`, { params });

/**
 * @description ????????????????????????excel
 */
export const sendAccountGoodsDetailExcelPost = (params) => request.get(`/v1/accountGoodsDetail/excel`, { params });

/**
 * @description ????????????????????????excel
 */
export const sendAccountGoodsAccountListExcelPost = (params) => request.get(`/v1/account/goodsAccountList/excel`, { params });

/**
 * @description ??????????????????excel
 */
export const sendConsignmentreportExcelPost = (params) => request.get(`/v1/consignmentreport/excel`, { params });

/**
 * @description ??????????????????excel
 */
export const sendTransportDataAnalysisExcelPost = (params) => request.get(`/v1/transportDataAnalysis/excel`, { params });

/**
 * @description ??????????????????excel
 */
export const sendTransportBoardTransportListExcelPost = (params) => request.get(`/v1/transportBoard/transportList/excel`, { params });

/**
 * @description ???????????????????????????excel
 */
export const sendTransportBoardTransportAuditRateExcelPost = (params) => request.get(`/v1/transportBoard/transportAuditRate/excel`, { params });

/**
 * @description ?????????????????????excel
 */
export const sendTransportBoardDriverActivityExcelPost = (params) => request.get(`/v1/transportBoard/driverActivity/excel`, { params });

/**
 * @description ????????????????????????excel
 */
export const sendTransportBoardGetOwnerPayTimeExcelPost = (params) => request.get(`/v1/transportBoard/getOwnerPayTime/excel`, { params });

/**
 * @description ????????????????????????excel
 */
export const sendTransportBoardGetPlatPayTimeExcelPost = (params) => request.get(`/v1/transportBoard/getPlatPayTime/excel`, { params });

/**
 * @description ??????????????????excel
 */
export const sendOperationRevenueExcelPost = (params) => request.get(`/v1/operationRevenue/excel`, { params });

/**
 * @description ??????????????????excel
 */
export const sendOperationDataExcelPost = (params) => request.get(`/v1/operationData/excel`, { params });


/**
 * @description ??????????????????excel
 */
export const sendInvoicesExcelPost = (params) => request.get(`/v1/invoices/excel`, { params });

/**
 * @description ??????????????????excel
 */
export const sendInvoiceDetailExcelPost = (params) => request.get(`/v1/invoices/${params.invoiceId}/excel`, { params } );

/**
 * @description ????????????????????????excel
 */
export const sendManualEntryExcelPost = (params) => request.get(`/v1/manualEntry/excel`, { params });

/**
 * @description ??????????????????excel
 */
export const sendOrdersExcelPost = (params) => request.get(`/v1/orders/excel`, { params });

/**
 * @description ?????????????????????excel
 */
export const sendOrdersDetailExcelPost = ( params) => request.get(`/v1/orders/${params.orderId}/excel`, { params });

/**
 * @description ??????????????????excel
 */
export const sendFinanceBusinessExcelPost = ( params) => request.get(`/v1/financeBusiness/excel`, { params });


/**
 * @description ??????????????????excel
 */
export const sendBankFlowingsExcelPost = ( params) => request.get(`/v1/bankFlowings/excel`, { params });

/**
 * @description ????????????????????????excel
 */
export const sendFinanceAccountsBalanceExcelPost = ( params) => request.get(`/v1/financeAccounts/balance/createExcel`, { params });

/**
 * @description ??????????????????(??????????????????)excel
 */
export const sendAccountReconciliationExcelPost = ( params) => request.get(`/v1/accountReconciliation/createExcel`, { params });

/**
 * @description ??????????????????excel
 */
export const sendFinanceAccountsExcelPost = ( params) => request.get(`/v1/financeAccounts/createExcel`, { params });

/**
 * @description ???????????????PDF
 */
export const sendAccountGoodsDetailPdfPost = ( params) => request.get(`/v1/accountGoodsDetail/${params.accountGoodsId}/pdf`, { params });

/**
 * @description ??????????????????PDF
 */
export const sendInvoicePdfPost = ( params) => request.get(`/v1/invoices/${params.invoiceId}/pdf`, { params });

/**
 * @description ?????????????????????????????????PDF
 */
export const sendOrderPdfPost = ( params) => request.get(`/v1/orders/${params.orderId}/pdf`, { params });

/**
 * @description ??????????????????
 */
export const getGoodsCategories = ( params) => request.get(`/v1/goodsCategories`, { params });



/* ???????????????????????????API ??? */
/**
 * @description ?????????????????????????????????????????????
 */
export const getAccountOutboundDeliveryInformationByOutboundDetailId = ( params) => request.get(`/v1/account/outbound/deliveryInformation/${params.outboundDetailId}`, { params });

/**
 * @description ??????????????????????????????
 */
export const pathAccountOutboundDeliveryByOutboundDetailId = ( params) => request.patch(`/v1/account/outbound/delivery/${params.outboundDetailId}`, { data:params });

/**
 * @description ????????????
 */
export const pathAccountOutboundMatchByOutboundDetailId = ( params) => request.patch(`/v1/account/outbound/match/${params.outboundDetailId}`, { data:params });

/**
 * @description ?????????????????????
 */
export const refreshAccountOutbound = (params) => request.patch(`/v1/account/outbound/refresh/${params.accountOutboundId}`);

/**
 * @description ?????????????????????
 */
export const removeAccountOutbound = accountOutboundId => request.patch(`/v1/account/outbound/${accountOutboundId}/remove` );

/**
 * @description ??????token
 */
export const authdelete = (params) => request.delete(`/authdelete`, { params });

/**
 * @description ?????????????????????
 */
export const accountTransportRecall = (accountTransportId) => request.patch(`/v1/account/transport/${accountTransportId}/recall`);

/**
 * @description ??????????????????
 */
export const changeCarOrg = ({ carId, carBelong }) => request.patch(`/v1/cars/${carId}/changeOrg`,  { data : { carBelong } });

/**
 * @description ?????????????????????
 */
export const getOrganizationSupplier = (params) => request.get('/v1/organizations/supplier', { params });

/**
 * @description ???????????????
 */
export const  createOrganizationSupplier = (params) => request.post('/v1/organizations/supplier', { data : params });

/**
 * @description ???????????????
 */
export const  modifyOrganizationSupplier = (params) => request.patch(`/v1/organizations/supplier/${params.organizationId}`, { data : params });

/**
 * @description ??????????????????
 */
export const getOrganizationDetail = (organizationId) => request.get(`/v1/organizationsOnly/${organizationId}`);

/**
 * @description ????????????????????????
 */
export const getAccountGoodsEvent = (params) => request.get(`/v1/account/goods/event/${params.accountGoodsId}`, { params });

/**
 * @description ?????????OCR
 */
export const getOcrDrivingLicense = (params) => request.get(`/v1/users/ocrDrivingLicense`, { params });

/**
 * @description ?????????OCR
 */
export const getOcrIdCard = (params) => request.get(`/v1/users/ocrIdCard`, { params });

/**
 * @description ?????????Id??????????????????
 */
export const getTaxationByOrderIdList = params => request.get('/v1/taxationByOrderIdList', { params });


/**
 * @description ?????????Id??????????????????
 */
export const getTaxationByOrderDetailIdList = params => request.post('/v1/taxationByOrderDetailIdList', { data : params });

/**
 * @description ??????????????????????????????
 */
export const getMonthTaxes = params =>request.get('/v1/getMonthTaxes', { params });

/**
 * @description ??????????????????
 */
export const withholdTaxCashOut = params => request.post('/v1/internalTransfers/withholdTaxCashOut', { data : params });

/**
 * @description ??????????????????
 */
export const exportVirtualAccountExcel = params =>request.get('/v1/virtualAccount/excel', { params });

/**
 * @description ????????????PDF
 */
export const exportTransportsPdf = params =>request.get('/v1/transports/pdf', { params });


// ????????????
export const updateInvoiceInfo = (invoiceId, params) => request.patch(`/v1/invoiceCorrelation/${invoiceId}`, { data: params });


/**
 * @description ?????????????????????
 */
export const postAudit = (projectId, params) => request.put(`/v1/projects/${projectId}/actions/audit`, { data : params });

/**
 * @description ???????????????????????????
 */
export const getProjectCorrelations = (projectCorrelationId) => request.get(`/v1/projectCorrelations/${projectCorrelationId}`);

/**
 * @description ?????????????????????
 */
export const getContract = (params) => request.get(`/v1/contracts`, { params });

/**
 * @description ?????????????????????
 */

export const postTransportAccount = params => request.post('/v1/account/transport', { data:params });
/**
 * @description ????????????????????????
 */

export const updatePlatFormUsers = (userId, params) => request.patch(`/v1/users/platform/${userId}`, { data:params });

// ????????????
export const detailTransports = params => request.get(`/v1/transports/${params.transportId}`, { params })
  .then(data => {
    data.createTime = moment(data.createTime).format('YYYY/MM/DD HH:mm:ss');
    const time = data.signItems[0].processPointCreateTime===null? '--':moment(data.signItems[0].processPointCreateTime).format('YYYY-MM-DD HH:mm:ss');
    data.processPointCreateTime = time;
    data.deliveryItems = data.deliveryItems.map(item=>{
      item.correlationObjectId = item.deliveryId;
      return item;
    });
    const freightPrice = data.deliveryItems.reduce((total, current) => total+current.freightPrice, 0);
    data.freightPrice = `${freightPrice}???`;
    return data;
  });

// ???????????????????????????ZIP
export const exportTransportZip = params => request.get('/v1/transports/zip', { params });

// ??????????????????????????????Excel
export const exportInvoicesTransport = params => request.get('/v1/invoices/transport/excel', { params });

// ????????????????????????????????????????????????
export const getOrdersTransportsDriver = params => request.get('/v1/orders/transports/driver', { params : { ...params, limit : 100000, offset : 0 } });

// ???????????????????????????
export const saveChoiceTransport = params => request.post(`/v1/orders/${params.orderId}/choiceTransport`, { data :  params  });

// ????????????
export const detailProjects = params => request.get(`/v1/projects/${params.projectId}`, { params })
  .then(data => {
    data.goodsIds = data.goodsItems.map(item => item.goodsId);
    if (data.isCustomerAudit === 1 ){
      data.receivingItems.forEach(item=>{
        item.customerOrgName = data.customerName;
      });
    }
    return data;
  });
