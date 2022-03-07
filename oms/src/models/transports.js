import moment from 'moment';
import { formatModel } from '@/tools/utils';
import { modifyTransportCost, getTransportList } from '@/services/apiService';
import bindSource from '@/tools/bindSource';
import request from '@/utils/request';


export default formatModel(bindSource({
  name: 'transports',
  getSpecialTransport: params => getTransportList(params)
    .then((data) => {
      const { items } = data;
      items || [].forEach(item => {
        const { transportPriceEntities, shipmentType } = item;
        const transportConfig = (transportPriceEntities || []).find(item => `${item.transportPriceType}` === '2' ) || {};
        const { shipmentTransportCost } = transportConfig;
        if (!shipmentType) {
          item.transportCost = shipmentTransportCost;
        }
      });
      return data;
    }),
  detailTransports: params => request.get(`/v1/transports/${params.transportId}`, { params })
    .then(data => {
      data.createTime = moment(data.createTime).format('YYYY/MM/DD HH:mm:ss');
      const time = data.signItems[0].processPointCreateTime===null? '--':moment(data.signItems[0].processPointCreateTime).format('YYYY-MM-DD HH:mm:ss');
      data.processPointCreateTime = time;
      data.deliveryItems = data.deliveryItems.map(item=>{
        item.correlationObjectId = item.deliveryId;
        return item;
      });
      const freightPrice = data.deliveryItems.reduce((total, current) => total+current.freightPrice, 0);
      data.freightPrice = `${freightPrice}元`;
      return data;
    }),
  getTransportReject: transportId => request.get(`/v1/transportProcesses/${transportId}/reject`),
  // getTransports : params => request.get('/v1/transports' , {data : { ...params ,  } }),
  getTransportsSelectList: params => request.get(`/v1/transportsSelectList`, { params }),
  // TODO 账单调价
  modifyTransportCost: ({ dataArray, priceType, ...args }) => modifyTransportCost({ items:dataArray, priceType, ...args }),
  // refuseTransport: (parmas) => refuseTransport(parmas)
})({
  namespace: 'transports',
  effects:{
    getTransportReject: async (transportId, requests) => requests.getTransportReject(transportId),
    getTransportsSelectList: async (params, request) => request.getTransportsSelectList(params),
    modifyTransportCost : (params, request) => request.modifyTransportCost(params),
    getSpecialTransport: (params, request) => request.getSpecialTransport(params),
  },
  reducers: {
    _getTransportRejectReduce (state, { payload }) {
      return {
        ...state,
        transportReject: payload.items
      };
    },
    _getTransportsSelectListReduce (state, { payload }) {
      return {
        ...state,
        transportsSelectList: payload.items
      };
    },
    _modifyTransportCostReduce (state, { payload: dataArray }) {
      const transportArray = dataArray.map(item => item.transportId);
      const _transports = state.items.map(item => {
        const check = transportArray.indexOf(item.transportId);
        if (check > -1) {
          return {
            ...item,
            transportPriceEntities:[dataArray[check]],
            transportCost:dataArray[check].transportCost,
            serviceCharge:dataArray[check].serviceCharge
          };
        }
        return item;
      });
      return {
        ...state,
        items: _transports
      };
    },
    _getSpecialTransportReduce (state, { payload }) {
      return {
        ...state,
        items: payload.items,
        count: payload.count,
      };
    },
  }
}));
