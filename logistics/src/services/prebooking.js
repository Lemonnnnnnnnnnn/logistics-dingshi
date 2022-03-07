import { classifyGoodsWeight, flatMap } from '@/utils/utils';
import request from '@/utils/request';
import { PREBOOKING_STAUTS } from '@/constants/project/project';

// 计算预约单计划重量
const countPrebookingPlanWeight = deliveryItems => classifyGoodsWeight(deliveryItems, 'goodsId', ['goodsId', 'specificationType', 'materialQuality', 'goodsName', 'categoryName', 'goodsUnitCN', 'receivingNum'], (summary, current) => summary.receivingNum += current.receivingNum);

// 计算运单已分配重量
const countTransportPlanWeight = transportItems => {
  const items = flatMap(transportItems.filter(item=>item.iseffectiveStatus===1||item.iseffectiveStatus===undefined), item => item.transportDeliveryItems||item.deliveryItems);
  const transportPlanWeight = classifyGoodsWeight(items, 'goodsId', ['goodsId', 'goodsName', 'categoryName', 'goodsUnitCN', 'loadingNum'], (summary, current) => summary.loadingNum += current.loadingNum);
  return transportPlanWeight;
};

// 计算预约单剩余重量

export const countRemainWeight = (deliveryItems, transportItems) => {
  const prebookingPlanWeight = countPrebookingPlanWeight(deliveryItems);
  const transportPlanWeight = countTransportPlanWeight(transportItems);
  const remainWeights = prebookingPlanWeight.map(planItem => {
    const transportItem = transportPlanWeight.find(item => item.goodsId === planItem.goodsId) || { goodsId: planItem.goodsId, loadingNum: 0 };
    return {
      goodsId: planItem.goodsId,
      loadingNum:transportItem.loadingNum,
      planNum:planItem.receivingNum,
      goodsName:planItem.goodsName,
      specificationType : planItem.specificationType,
      materialQuality : planItem.materialQuality,
      categoryName:planItem.categoryName,
      goodsUnitCN: planItem.goodsUnitCN,
      remainingNum: ((planItem.receivingNum*100) - (transportItem.loadingNum*100))/100
    };
  });
  return remainWeights;
};

export const getPreBookingStauts = (preBookingStatus) => {
  const statusConfig = {
    [PREBOOKING_STAUTS.UNCERTAINTY]: [
      { key: 1, word: "● 待确定", _word: '待确定', color: "red" },
      { key: 2, word: "● 待确定", color: "red", authority: '2' },
      { key: 3, word: "● 待确定", color: "red", authority: '3' }
    ],
    [PREBOOKING_STAUTS.UNCOMPLETED]: [
      { key: 1, word: "● 调度中", _word: '调度中', color: "orange" },
      { key: 2, word: "● 调度中", color: "orange", authority: '2' },
      { key: 3, word: "● 调度中", color: "orange", authority: '3' }
    ],
    [PREBOOKING_STAUTS.COMPLETE]: [
      { key: 1, word: "● 调度完成", _word: '调度完成', color: "green" },
      { key: 2, word: "● 调度完成", color: "green", authority: '2' },
      { key: 3, word: "● 调度完成", color: "green", authority: '3' }
    ],
    [PREBOOKING_STAUTS.REFUSE]: [
      { key: 1, word: "● 已拒绝", _word: '已拒绝', color: "red" },
      { key: 2, word: "● 已拒绝", color: "gray", authority: '2' },
      { key: 3, word: "● 已拒绝", color: "gray", authority: '3' }
    ],
    [PREBOOKING_STAUTS.CANCELED]: [
      { key: 1, word: "● 已取消", _word: '已取消', color: "black" },
      { key: 2, word: "● 已取消", color: "black", authority: '2' },
      { key: 3, word: "● 已取消", color: "black", authority: '3' }
    ],
    [PREBOOKING_STAUTS.WHOLE_COMPLETE]: [
      { key: 1, word: "● 调度完成", _word: '调度完成', color: "green" },
      { key: 2, word: "● 调度完成", color: "green", authority: '2' },
      { key: 3, word: "● 调度完成", color: "green", authority: '3' }
    ]
  }[preBookingStatus];

  // if (!statusConfig) {
  //   throw new Error("Error projectStatus!")
  // }

  return statusConfig || [{ key: 1, word: "● bug", color: "red" }];
};
// 预约单调度近驾
export const carRecentDriver = (params) =>
  request.get('/v1/shipment/carRecentDriver', { params });

export default {
  countPrebookingPlanWeight,
  countTransportPlanWeight
};
