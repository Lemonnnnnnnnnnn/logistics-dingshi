export default {
  'GET /v1/goodsplans': (req, res) => {

    const count = 10
    const items = new Array(count).fill(0).map((v, index) => ({
      "goodsPlanId":index+1,  // 要货计划单id
      "goodsPlanName": `要货2222222222222计划单${index+1}`, // 要货计划单名称
      "projectId": 123, // 项目(合同)id
      "projectName": `合同${index+1}`, // 合同名称
      "customerId":1231,   // 客户id
      "customerName":'1231',   // 客户名称
      "consignmentId":1,                   // 托运方id
      "consignmentName":1231,   // 托运方名称
      "arrivalTime":"2019-01-15T15:16:24",               // 到货时间
      "planStatus":Math.floor(Math.random()*6),            // 计划单状态  0.托运待确认 1.托运已拒绝 2.进行中 3.已完成 4.已撤销 5.已结束
      "goodsPlanNo":"12312312sds",            // 要货计划单编号
      "isEffect":1,            // 是否有效。0无效，1有效
      "createUserId":1,   // 创建用户id
      "createTime":"2019-01-15T15:16:24",            // 创建时间
      "updateUserId":1,            // 修改用户id
      "updateTime":"2019-01-15T15:16:24",            // 修改时间
    }))
    res.json({
      count:20,
      items
    })
  },
  'GET /v1/goodsPlans/1' : (req, res) => res.json({
    "goodsPlanId":1,  // 要货计划单id
    "goodsPlanName": '123', // 要货计划单名称
    "projectId": 1, // 项目(合同)id
    "projectName": '123', // 合同名称
    "customerId":1231,   // 客户id
    "customerName":'1231',   // 客户名称
    "consignmentId":1,                   // 托运方id
    "consignmentName":'1231',   // 托运方名称
    "arrivalTime":"2019-01-15T15:16:24",               // 到货时间
    "planStatus":1,            // 计划单状态  0.托运待确认 1.托运已拒绝 2.进行中 3.已完成 4.已撤销 5.已结束
    "goodsPlanNo":"12312312sds",            // 要货计划单编号
    "remarks":"12312312sds",            // 备注
    "isEffect":1,            // 是否有效。0无效，1有效
    "createUserId":1,   // 创建用户id
    "createTime":"2019-01-15T15:16:24",            // 创建时间
    "updateUserId":1,            // 修改用户id
    "updateTime":"2019-01-15T15:16:24",            // 修改时间
    "consignmentResponsibleItems": [ // 托运方项目负责人
      {
        "responsibleId":1,   // 合同负责人id
        "responsibleName":"123",  // 合同负责人名称
        "responsiblePhone":"123"  // 合同负责人电话
      }
    ],
    "goodsCorrelationItems": [
      {
        "goodsCorrelationId": 5456278,
        "goodsId": 348784580199680,
        "goodsNum": 42.000,
        "goodsUnit": '吨',
        "isEffect": 1,
        "createTime": "2019-10-30T14:40:36.000+0800",
        "createUserId": 1,
        "receivingId": 339940969252096,
        "receivingItems": [
          {
            "receivingId": 339940969252096,
            "receivingName": "12工区 小湾隧洞",
            "receivingAddress": "资阳市安岳县安岳县",
            "receivingLabelId": 328687149769984,
            "receivingLabel": "毗河六分部",
            "receivingLongitude": 105.3424550000,
            "receivingLatitude": 105.3424550000,
            "signDentryid": null,
            "organizationId": 328687151011072,
            "isAvailable": true,
            "contactName": "李晨",
            "contactPhone": "17396256152",
            "createUserId": 1,
            "updateUserId": 1,
            "createTime": "2019-08-15T08:16:15.000+0800",
            "updateTime": "2019-08-15T08:16:15.000+0800",
            "remarks": "系统割接导入",
            "isEffect": 1,
            "customerOrgId": 328687149769984,
            "customerOrgName": "毗河六分部",
            "isUsed": null
          }
        ],
        "goodItems": [
          {
            "goodsId": 311102782334208,
            "goodsName": "利森水泥PO42.5(散装)",
            "organizationId": 310582128678101,
            "categoryId": 3,
            "materialQuality": "杠杠的",
            "remarks": null,
            "isEffect": 1,
            "createUserId": 110582128678101,
            "updateUserId": 110582128678101,
            "createTime": "2019-04-24T10:21:33.000+0800",
            "updateTime": "2019-04-24T10:21:33.000+0800",
            "categoryName": null,
            "specificationType": "郑锋DD",
            "packagingMethod": 1
          }
        ]
      },
      {
        "goodsCorrelationId": 545678,
        "goodsId": 348784580199680,
        "goodsNum": 42.000,
        "goodsUnit": '吨',
        "isEffect": 1,
        "createTime": "2019-10-30T14:40:36.000+0800",
        "createUserId": 1,
        "receivingId": 339940969252096,
        "receivingItems": [
          {
            "receivingId": 339940969252096,
            "receivingName": "12工区 小湾隧洞",
            "receivingAddress": "资阳市安岳县安岳县",
            "receivingLabelId": 328687149769984,
            "receivingLabel": "毗河六分部",
            "receivingLongitude": 105.3424550000,
            "receivingLatitude": 105.3424550000,
            "signDentryid": null,
            "organizationId": 328687151011072,
            "isAvailable": true,
            "contactName": "李晨",
            "contactPhone": "17396256152",
            "createUserId": 1,
            "updateUserId": 1,
            "createTime": "2019-08-15T08:16:15.000+0800",
            "updateTime": "2019-08-15T08:16:15.000+0800",
            "remarks": "系统割接导入",
            "isEffect": 1,
            "customerOrgId": 328687149769984,
            "customerOrgName": "毗河六分部",
            "isUsed": null
          }
        ],
        "goodItems": [
          {
            "goodsId": 311102782334208,
            "goodsName": "利森水泥PO42.5(散装)",
            "organizationId": 310582128678101,
            "categoryId": 3,
            "materialQuality": "杠杠的",
            "remarks": null,
            "isEffect": 1,
            "createUserId": 110582128678101,
            "updateUserId": 110582128678101,
            "createTime": "2019-04-24T10:21:33.000+0800",
            "updateTime": "2019-04-24T10:21:33.000+0800",
            "categoryName": null,
            "specificationType": "郑锋DD",
            "packagingMethod": 1
          }
        ]
      }
    ],
    "transportCorrelationCnItems": [
      {
        "transportCorrelationId": 363350917940480,
        "transportId": 363350917858560,
        "correlationObjectId": 344207683867904,
        "goodsId": 348784580199680,
        "goodsName": "gangchang",
        "goodsNum": 1.000,     // 已经调度
        "goodsUnit": '吨',
        "deliveryNum": 1.000,  // 提货 如果是transportImmediateStatus:7则算运输中
        "deliveryUnit": 4,
        "receivingNum": 460.000, // 卸货重量
        "receivingUnit": 4,
        "freightPrice": 0.00,
        "isEffect": 1,
        "createTime": "2019-09-19T14:39:46.000+0800",
        "createUserId": 110582128678105,
        "auditStatus": 1,
        "isPicked": 1,
        "goodsUnitCN": "袋",
        "deliveryUnitCN": "袋",
        "receivingUnitCN": "袋",
        "packagingMethodCN": null,
        "materialQuality": "Q235",  // 材质
        "categoryName": "钢材,工字钢,H", // 类目名称
        "specificationType": "20",  // 规格型号
        "packagingMethod": null,  // 包装方式 1.袋装，2.散装
        "deliveryName": "提货踢错",
        "transportImmediateStatus": 4  // 运单即时状态(1.未接单;2.已接单;3.已取消;4.已完成;5.待提货;6.已到站;7.运输中;8.承运已拒绝;9.承运已审核;10.托运已拒绝;11.已签收;12.重新签收;13.司机拒绝;14.运单异常)
      },
      {
        "transportCorrelationId": 363350917940480,
        "transportId": 363350917858560,
        "correlationObjectId": 344207683867904,
        "goodsId": 348784580199680,
        "goodsName": "gangchang",
        "goodsNum": 1.000,     // 已经调度
        "goodsUnit": '吨',
        "deliveryNum": 1.000,  // 提货 如果是transportImmediateStatus:7则算运输中
        "deliveryUnit": 4,
        "receivingNum": 460.000, // 卸货重量
        "receivingUnit": 4,
        "freightPrice": 0.00,
        "isEffect": 1,
        "createTime": "2019-09-19T14:39:46.000+0800",
        "createUserId": 110582128678105,
        "auditStatus": 1,
        "isPicked": 1,
        "goodsUnitCN": "袋",
        "deliveryUnitCN": "袋",
        "receivingUnitCN": "袋",
        "packagingMethodCN": null,
        "materialQuality": "Q235",  // 材质
        "categoryName": "钢材,工字钢,H", // 类目名称
        "specificationType": "20",  // 规格型号
        "packagingMethod": null,  // 包装方式 1.袋装，2.散装
        "deliveryName": "提货踢错",
        "transportImmediateStatus": 4  // 运单即时状态(1.未接单;2.已接单;3.已取消;4.已完成;5.待提货;6.已到站;7.运输中;8.承运已拒绝;9.承运已审核;10.托运已拒绝;11.已签收;12.重新签收;13.司机拒绝;14.运单异常)
      }
    ]
  })
}
