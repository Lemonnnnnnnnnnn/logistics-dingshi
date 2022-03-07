import { formatModel } from '@/tools/utils';
import bindSource from '@/tools/bindSource';
import request from '@/utils/request';
import { DRIVER } from '@/constants/certification/certificationType';
import { isArray, pick } from '@/utils/utils';
import { getCertificationEvents, certificate } from '@/services/apiService';
import message from './message';

function toArray (target, key) {
  if (isArray(target[key])) return false;
  if (!target[key]) return target[key] = [];
  return target[key] = [target[key]];
}

export default formatModel(bindSource({
  name: 'drivers',
  rowKey: 'userId',
  certificateDriver: params => certificate(params),
  getCertificationEvents: driverId => getCertificationEvents({ authObjId: driverId, authObjType: DRIVER }),
  postDrivers: params => request.post('/v1/users', { data: params }),
  // deleteDrivers: params => request.delete(` /v1/orgization/drivers/${params.orgDriverId}`),
  detailDrivers: params => request.get(`/v1/users/${params.userId}`),
  patchDrivers: params => request.patch(`/v1/users/${params.userId}`, { data: params }),
  dataSchema: {
    detail: data => {
      const keys = ['idcardBackDentryid', 'idcardFrontDentryid', 'licenseViceDentryid', 'licenseFrontDentryid', 'qualificationCertificateDentryid', 'driverFrontDentryid', 'driverIdcardDentryid', 'qualificationFrontDentryid'];

      keys.forEach(key => toArray(data, key));
      return data;
    }
  },
  displace: ({ userId, password }) => request.get(`/v1/users/check/${userId}`, { params: {
    password
  } }),
  detailInfo: ({ userId, password }) => request.get(`/v1/users/check/${userId}`, { params: {
    password
  } }),
})({
  namespace: 'drivers',
  effects: {
    getCertificationEvents: (userId, requests) => requests.getCertificationEvents(userId),
    certificateDriver: (params, requests) => requests.certificateDriver(params),
    displace: (params, requests) => requests.displace(params),
    detailInfo: (params, requests) => requests.detailInfo(params),
  },
  reducers: {
    _getCertificationEventsReduce (state, { payload }) {
      return { ...state, certificationEvents: payload.items };
    },
    _displaceReduce (state, { payload }) {
      if (!payload) return;
      const { items } = state;
      const index = items.findIndex(item => item.userId === payload.userId);
      const driver = pick(payload, ['userId', 'auditStatus', 'nickName', 'phone', 'idcardNo', 'licenseType', 'bankAccountItems', 'auditStatus', 'perfectStatus']);
      return {
        ...state, items: [
          ...items.slice(0, index),
          driver,
          ...items.slice(index + 1)
        ]
      };
    },
    recover (state, { payload }) {
      const { items } = state;
      const index = items.findIndex(item => item.userId === payload.userId);
      return {
        ...state, items: [
          ...items.slice(0, index),
          payload,
          ...items.slice(index + 1)
        ]
      };
    },
    _detailInfoReduce (state, { payload }) {
      if (!payload) return;
      return {
        ...state,
        entity: payload
      };
    }
  }
}));
