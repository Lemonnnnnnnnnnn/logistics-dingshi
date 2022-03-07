import { formatModel } from '@/tools/utils';
import bindSource from '@/tools/bindSource';
import request from '@/utils/request';
import { getCertificationEvents, certificate, detailCars } from '@/services/apiService';
import { getUserInfo } from '@/services/user';
import { CAR } from '@/constants/certification/certificationType';


export default formatModel(bindSource({
  name: 'cars',
  getCertificationEvents: carId => getCertificationEvents({ authObjId: carId, authObjType: CAR }),
  detailCars:params => detailCars(params).then(data=>{
    const { organizationId } = getUserInfo();
    data.carBelong = organizationId === data.organizationId ? 1 : 2;
    if (data.categoryList ){
      data.categoryList = data.categoryList.map(item=> item.categoryId);
    }
    return data;
  }),
  certificateCar: params => certificate(params),
  dataSchema: {
    detail: data => {
      if (!data.permitFrontDentryid) {
        data.permitFrontDentryid = [];
      }

      if (!data.permitBackDentryid) {
        data.permitBackDentryid = [];
      }

      if (!data.carFrontDentryid) {
        data.carFrontDentryid = [];
      }

      if (!data.drivingLicenseFrontDentryid) {
        data.drivingLicenseFrontDentryid = [];
      }

      if (!data.drivingLicenseBackDentryid) {
        data.drivingLicenseBackDentryid = [];
      }

      if (!data.carType) {
        data.carType = undefined;
      }

      if (!data.axlesNum) {
        data.axlesNum = undefined;
      }

      return data;
    }
  },
  detailInfo: ({ carId, password }) => request.get(`/v1/cars/check/${carId}`, { params: {
    password
  } }),
})({
  namespace: 'cars',
  effects: {
    getCertificationEvents: (carId, requests) => requests.getCertificationEvents(carId),
    certificateCar: (params, requests) => requests.certificateCar(params),
    detailInfo: (params, requests) => requests.detailInfo(params),
  },
  reducers: {
    _getCertificationEventsReduce (state, { payload }) {
      return { ...state, certificationEvents: payload.items };
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
