import { pick, isArray, uniq } from '@/utils/utils';
// 业务组件SelectByRemoteData的相关service

const usefulField = ['projectName', 'receivingName', 'receivingId'];
const _usefulField = ['projectName', 'deliveryItems'];

const normalizeReceivingOptions = (transoportList) => {
  const usefulFieldArray = pickUsefulField(transoportList, usefulField);
  const normalizeItem = removeDuplicateItem(usefulFieldArray, 'receivingId');
  const optionsList = normalizeItem.map(({ receivingId, receivingName, ...rest })=>({ ...rest, value:receivingId, label:receivingName }));
  return optionsList;
};

const normalizeGoodsOptions = (transoportList) => {
  const usefulFieldArray = pickUsefulField(transoportList, _usefulField);
  const flatItems = flatDeliveryItems(usefulFieldArray);
  const normalizeItem = removeDuplicateItem(flatItems, 'goodsId');
  const optionsList = normalizeItem.map(({ goodsId, goodsName, ...rest })=>({ ...rest, value:goodsId, label:goodsName }));
  return optionsList;
};

// 去除无用字段
const pickUsefulField = (transoportList=[], usefulField) => transoportList.map(item => pick(item, usefulField));

// 去除重复选项，并整合其他字段
const removeDuplicateItem = (handleArray, removeDuplicateField) => {
  const newItems = handleArray.reduce((previousArray, currentArray) => {
    const index = previousArray.findIndex(item => item[removeDuplicateField] === currentArray[removeDuplicateField]);
    if (index<0){
      return [...previousArray, currentArray];
    }
    Object.keys(currentArray).forEach(field =>{
      const previousFieldVule = previousArray[index][field];
      if (typeof(previousFieldVule) !== 'undefined' && field !== removeDuplicateField){
        if (previousFieldVule === currentArray[field]) return;
        previousArray[index][field] = uniq(isArray(previousFieldVule)? [...previousFieldVule, currentArray[field]]: [previousFieldVule, currentArray[field]]);
      }
    });
    return previousArray;
  }, []);
  return newItems;
};

const flatDeliveryItems = transoportList =>{
  const newList = [];
  transoportList.forEach(item => {
    if (isArray(item.deliveryItems)){
      item.deliveryItems.forEach(deliveryItem => {
        newList.push({ projectName:item.projectName, goodsId:deliveryItem.goodsId, goodsName:`${deliveryItem.categoryName}${deliveryItem.goodsName}` });
      });
    }
  });
  return newList;
};

export default {
  normalizeGoodsOptions,
  normalizeReceivingOptions
};
