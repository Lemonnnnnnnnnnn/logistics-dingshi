export const carParamsInit = {
  deliveryList: [],
  receivingList: [],
  longitude: 0,
  latitude: 0,
  hasCenter: false,
  isSelfCar: false,
  distance: 5,
  carType: { type: 0, label: '全部类型' },
  customAddress: { longitude: 0, latitude: 0, label: '' },
};

// 运单状态null 空车
/*
 * 筛选用：
 * 1. 运输中
 * 2. 卸货中
 * 3. 空车
 * 4. 异常
 *
 * 展示用：
 * 5. 待审核
 * 6. 超时
 * */
const initCarType = Array(22)
  .fill(0)
  .map((item, key) => key + 1);
initCarType.push(null);
export const carTypeDist = {
  0: initCarType,
  1: [1, 2, 5, 7, 21, 22],
  2: [6, 8, 10, 11, 12, 15, 16],
  3: [3, 4, 9, 13, 20, null],
  4: [14],
  5: [11, 15, 16, 21],
  6: [20],
};

/*
 * 类型权重值： 1 最小， 4最大
 * 异常 > 运输中 > 卸货中 > 空车
 * 运输中 carTypeDist[1]: [1, 2, 5, 7, 21, 22],
 * 卸货中 carTypeDist[2]: [6, 8, 10, 11, 12, 15, 16],
 * 空车  carTypeDist[3]: [3, 4, 9, 13, 20, null],
 * 异常  carTypeDist[4]: [14],
 * */

export const carWeighDist = {};
carTypeDist[0].forEach((item) => {
  if (carTypeDist[3].includes(item)) {
    // 空车
    carWeighDist[item] = 1;
  } else if (carTypeDist[2].includes(item)) {
    // 卸货中
    carWeighDist[item] = 2;
  } else if (carTypeDist[1].includes(item)) {
    // 运输中
    carWeighDist[item] = 3;
  } else if (carTypeDist[4].includes(item)) {
    // 异常
    carWeighDist[item] = 4;
  }
});

export const carStatusDist = {
  1: '未接单',
  2: '已接单',
  3: '已作废',
  4: '已完成',
  5: '待提货',
  6: '已到站',
  7: '运输中',
  8: '承运已拒绝',
  9: '承运已审核',
  10: '托运已拒绝',
  11: '承运待审',
  12: '重新签收',
  13: '司机拒绝',
  14: '运单异常',
  15: '客户待审',
  16: '托运待审',
  17: '接单待确认',
  20: '运单超时自动关闭',
  21: '提货待审核',
  22: '提货已拒绝',
};

export const carFilterDist = [
  { text: '未接单', value: 1 },
  { text: '已接单', value: 2 },
  // {text : '已作废', value : 3},
  // {text : '已完成', value : 4},
  { text: '待提货', value: 5 },
  { text: '已到站', value: 6 },
  { text: '运输中', value: 7 },
  { text: '承运已拒绝', value: 8 },
  { text: '承运已审核', value: 9 },
  { text: '托运已拒绝', value: 10 },
  { text: '承运待审', value: 11 },
  { text: '重新签收', value: 12 },
  // {text : '司机拒绝', value : 13},
  { text: '运单异常', value: 14 },
  { text: '客户待审', value: 15 },
  { text: '托运待审', value: 16 },
  { text: '接单待确认', value: 17 },
  // {text : '运单超时自动关闭', value : 20},
  { text: '提货待审核', value: 21 },
  { text: '提货已拒绝', value: 22 },
];

// 车辆列表不展示的车辆 : 已作废、已完成、司机拒绝、无运单、超时自动关闭
export const notShowCar = [3, 4, 13, null, 20];
