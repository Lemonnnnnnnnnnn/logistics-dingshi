export default {
  'GET /v1/deliveries': (req, res)=>{
    res.json({
      "count":20,       // 总数
      "items":[
        {
          "deliveryId":1,
          "deliveryName":"拉法基水泥厂1",
          "deliveryAddress":"深圳市南山区南一路飞亚达大厦5-10楼",
          "deliveryLongitude":119.30,
          "deliveryLatitude":26.08,
          "deliveryLable":"永辉",
          "contactName":0,
          "contactPhone":"13566789652",
          "remarks":"",
          "isAvailable":true,
          "createUserId":2,
          "updateUserId":2,
          "createTime":"2019-01-15T15:16:24",
          "updateTime":"2019-01-15T15:16:24"
        }, {
          "deliveryId":2,
          "deliveryName":"拉法基水泥厂2",
          "deliveryAddress":"深圳市南山区南一路飞亚达大厦5-10楼",
          "deliveryLongitude":119.30,
          "deliveryLatitude":26.08,
          "deliveryLable":"永辉",
          "contactName":0,
          "contactPhone":"13566789652",
          "remarks":"",
          "isAvailable":true,
          "createUserId":2,
          "updateUserId":2,
          "createTime":"2019-01-15T15:16:24",
          "updateTime":"2019-01-15T15:16:24"
        }, {
          "deliveryId":3,
          "deliveryName":"拉法基水泥厂3",
          "deliveryAddress":"深圳市南山区南一路飞亚达大厦5-10楼",
          "deliveryLongitude":119.30,
          "deliveryLatitude":26.08,
          "deliveryLable":"永辉",
          "contactName":0,
          "contactPhone":"13566789652",
          "remarks":"",
          "isAvailable":true,
          "createUserId":2,
          "updateUserId":2,
          "createTime":"2019-01-15T15:16:24",
          "updateTime":"2019-01-15T15:16:24"
        }, {
          "deliveryId":4,
          "deliveryName":"拉法基水泥厂4",
          "deliveryAddress":"深圳市南山区南一路飞亚达大厦5-10楼",
          "deliveryLongitude":119.30,
          "deliveryLatitude":26.08,
          "deliveryLable":"永辉",
          "contactName":0,
          "contactPhone":"13566789652",
          "remarks":"",
          "isAvailable":false,
          "createUserId":2,
          "updateUserId":2,
          "createTime":"2019-01-15T15:16:24",
          "updateTime":"2019-01-15T15:16:24"
        }
      ]
    })
  },
  'GET /v1/organizations':(req, res)=>{
    res.json({
      "count":20,       // 总数
      "items":[
        {
          "organizationId":1,
          "organizationName":"鼎石科技",
          "organizationAddress":"深圳市南山区南一路飞亚达大厦5-10楼",
          "contactName":"李四",
          "contactPhone":"13566789652",
          "consignmentRelationshipId":1,                                      // 托运方界面提供|托运方与其他机构关系id
          "auditStatus":0,                                                   // 审核状态|0.待认证;1.已认证;2.认证失败
          "isAvailable":true,                                                   // 是否启用|false.禁用;true.启用
          "remarks":0,                                                      // 审核时备注
          "isUsed":true                                                     // 是否添加|false.未添加  true.已添加
        }
      ]
    })
  },
  'GET /v1/consignments/shipments':(req, res)=>{
    res.json({
      "organizationId":1,
      "organizationName":"鼎石科技",  // 公司名称
      "items":[{
        "shipmentOrganizationId":123, // 承运公司orgid
        "shipmentOrganizationName":"橙卡", // 承运方名称
        "contactId":1,          // 联系人Id
        "contactName":"李四",  // 联系人
        "contactPhone":"13566789652",  // 联系人电话
      }]
    })
  },
  'POST /v1/deliveries':(req, res)=>{
    res.json({
      "deliveryId":5,                                                 // 提货点id
      "consignmentId":1,                                              // 托运方id
      "deliveryName":"拉法基水泥厂5",
      "deliveryAddress":"深圳市南山区南一路飞亚达大厦5-10楼",
      "deliveryLongitude":119.30,
      "deliveryLatitude":26.08,
      "deliveryLable":"永辉",
      "contactName":0,
      "contactPhone":"13566789652",
      "remarks":"",
      "isAvailable":true,
      "createUserId":2,
      "updateUserId":2,
      "createTime":"2019-01-15T15:16:24",
      "updateTime":"2019-01-15T15:16:24"
    })
  },
  'PATCH /v1/deliveries/4':(req, res)=>{
    res.json({
      "deliveryId":4,
      "deliveryName":"拉法基水泥厂4",
      "deliveryAddress":"深圳市南山区南一路飞亚达大厦5-10楼",
      "deliveryLongitude":119.30,
      "deliveryLatitude":26.08,
      "deliveryLable":"永辉",
      "contactName":0,
      "contactPhone":"13566789652",
      "remarks":"",
      "isAvailable":true,
      "createUserId":2,
      "updateUserId":2,
      "createTime":"2019-01-15T15:16:24",
      "updateTime":"2019-01-15T15:16:24"
    })
  },
}
