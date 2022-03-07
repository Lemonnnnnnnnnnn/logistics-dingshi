import { formatModel } from '../tools/utils';
import bindSource from '../tools/bindSource';

export default formatModel(bindSource({
  name:'orders',
})({
  namespace: 'orders',
  // effects: {
  //   getAllProject: (params, requests) => requests.getAllProject()
  // },
  reducers: {
    setPayOrders (state, { payload }) {
      return { ...state, payOrders: payload };
    }
  }
}));
