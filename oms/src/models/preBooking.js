import moment from 'moment';
import { formatModel } from '@/tools/utils';
import bindSource from '@/tools/bindSource';
import request from '@/utils/request';
// function createEmptyRow () {
//   return { deliveryId: Math.random() }
// }

export default formatModel(bindSource({
  name: 'preBooking',
  url: 'prebookings',
  rowKey:'prebookingId',
  detailPreBooking: params => request.get(`/v1/prebookings/${params.prebookingId}`, { params })
    .then(data => {
      // data.transportItems.forEach(item => item._added = true)
      data.selfSupportItems = (data.transportItems || []).filter(item => item.transportType === 1).map(item => ({ ...item, dirty:true }));
      data.netFreightItems = (data.transportItems || []).filter(item => item.transportType === 2).map(item => ({ ...item, dirty:true }));
      data.acceptanceTime = moment(data.acceptanceTime);
      return data;
    }),
  getPreBookingEvents: prebookingId => request.get(`/v1/prebookings/${prebookingId}/event`, { params:{ prebookingId, limit:1000, offset:0 } }),
  patchPreBooking:params => {
    if (params.receivingItems&&params.deliveryItems){
      params.receivingItems.map(item=>{
        item.prebookingObjectId=item.receivingId;
        delete item.deliveryId;
        return item;
      });
      params.deliveryItems.map(item=>{
        item.prebookingObjectId=item.deliveryId;
        delete item.receivingId;
        return item;
      });
    }
    return request.patch(`/v1/prebookings/${params.prebookingId}`, { data:params });
  }
})({
  namespace: 'preBooking',
  effects: {
    getPreBookingEvents: async (prebookingId, requests) => requests.getPreBookingEvents(prebookingId)
  },
  reducers: {
    _getPreBookingEventsReduce (state, { payload }) {
      return {
        ...state,
        events: payload.items
      };
    }
  }
}));
