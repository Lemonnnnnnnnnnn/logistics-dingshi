export default {
  'GET /v1/consignments/1/projects': (req, res) => {
    const { offset, limit } = req.query
    res.json({
      "count":11,       // 总数
      "projectItems":[
        {
          "id":1,                        // 项目Id
          "projectName":"成兰八标",             // 项目名称
          "projectStatus":0,                    // 项目状态。0待审，1已审，3拒绝
          "isStatus":0,                           // 项目使用状态。1启用，0禁用
          "createTime":"2019-01-15T15:16:24",   // 项目日期
          "shipmentType":0,                     // 承运类型,0平台，1承运方
          "organizationName":"平台方",          // shipmentType为0平台方，为1是托运方名称
          "consignmentType":0,                  // 交易模式。0直发，1代发
          "responsiblerName":"刘鑫威",          // 项目负责人
          "responsiblerPhone":"18650454578",    // 联系人电话
          "goodsItems":[{
            "goodsId":1,
            "goodsName":"利森P.O42.1（散装）"
          }, {
            "goodsId":2,
            "goodsName":"利森P.O42.2（散装）"
          }, {
            "goodsId":3,
            "goodsName":"利森P.O42.2（散装）"
          }, {
            "goodsId":4,
            "goodsName":"利森P.O42.2（散装）"
          }, {
            "goodsId":5,
            "goodsName":"利森P.O42.2（散装）"
          }, {
            "goodsId":6,
            "goodsName":"利森P.O42.2（散装）"
          }, {
            "goodsId":7,
            "goodsName":"利森P.O42.2（散装）"
          }, {
            "goodsId":8,
            "goodsName":"利森P.O42.2（散装）"
          }],
          "projectRemark":"大项目"              // 备注信息
        }, {
          "id":4,                        // 项目Id
          "projectName":"成兰六标",             // 项目名称
          "projectStatus":1,                    // 项目状态。0待审，1已审，3拒绝
          "isStatus":1,                           // 项目使用状态。1启用，0禁用
          "createTime":"2019-01-15T15:16:24",   // 项目日期
          "shipmentType":0,                     // 承运类型,0平台，1承运方
          "organizationName":"平台方",          // shipmentType为0平台方，为1是托运方名称
          "consignmentType":0,                  // 交易模式。0直发，1代发
          "responsiblerName":"刘鑫威",          // 项目负责人
          "responsiblerPhone":"18650454578",    // 联系人电话
          "goodsItems":[{
            "goodsId":1,
            "goodsName":"利森P.O42.3（散装）"
          }],
          "projectRemark":"大项目"              // 备注信息
        }, {
          "id":2,                        // 项目Id
          "projectName":"成兰七标",             // 项目名称
          "projectStatus":3,                    // 项目状态。0待审，1已审，3拒绝
          "isStatus":1,                           // 项目使用状态。1启用，0禁用
          "createTime":"2019-01-15T15:16:24",   // 项目日期
          "shipmentType":0,                     // 承运类型,0平台，1承运方
          "organizationName":"平台方",          // shipmentType为0平台方，为1是托运方名称
          "consignmentType":0,                  // 交易模式。0直发，1代发
          "responsiblerName":"刘鑫威",          // 项目负责人
          "responsiblerPhone":"18650454578",    // 联系人电话
          "goodsItems":[{
            "goodsId":1,
            "goodsName":"利森P.O42.4（散装）"
          }],
          "projectRemark":"大项目"              // 备注信息
        }, {
          "id":3,                        // 项目Id
          "projectName":"成兰三标",             // 项目名称
          "projectStatus":1,                    // 项目状态。0待审，1已审，3拒绝
          "isStatus":0,                           // 项目使用状态。1启用，0禁用
          "createTime":"2019-01-15T15:16:24",   // 项目日期
          "shipmentType":0,                     // 承运类型,0平台，1承运方
          "organizationName":"平台方",          // shipmentType为0平台方，为1是托运方名称
          "consignmentType":0,                  // 交易模式。0直发，1代发
          "responsiblerName":"刘鑫威",          // 项目负责人
          "responsiblerPhone":"18650454578",    // 联系人电话
          "goodsItems":[{
            "goodsId":1,
            "goodsName":"利森P.O42.5（散装）"
          }],
          "projectRemark":"大项目"              // 备注信息
        }].slice(offset, (offset + limit))
    })
  },
  'GET /v1/consignments/projects/1': (req, res) => {
    res.json({
      "projectId": 1,
      "projectName": "成兰八标",              // 托运方项目名称
      "responsiblerName": "刘鑫威",           // 项目负责人
      "responsiblerPhone": "18650454578",    // 联系人电话
      "transactionalMode": 1,                // 轨迹方式 ,0为车辆轨迹，1为手机轨迹 ----->车辆轨迹采用中交兴路车载GPS定位，若不勾选则采用app轨迹定位，需要用户手机开启app定位权限，并保持登录状态，才能正常获取
      "consignmentType": 0,                  // 交易模式。0直发，1代发
      "cargoesId": 1,                       // 代发货权方Id|交易模式为代发情况
      "cargoesName": "四川能投有限公司",    // 代发货权方名称|交易模式为代发情况must
      "shipmentType": 0, // 承运类型,0平台，1承运方
      "goodsIdItems": [                       // 货品ids|
        {
          "goodsId": "100212424023565056",    // 货品Id
          "goodsName": "利森P.O42.5（散装）"  // 货品名称
        }
      ],
      "deliveryIdItems": [                    // 提货点Ids
        {
          "deliveryId": "100212424023565056",
          "deliveryName": "利森水泥厂",              // 提货点
          "deliveryAddress": "四川省德阳市什邡市洛水镇中国建材西南水泥厂",  // 提货地址
          "contactName": "白立忠",         // 联系人
          "contactPhone": "13909023944",  // 联系电话
        }
      ],
      "organizationName": "",               // 所属机构
      "organizationId": "",                 // 所属机构Id
      "deliveryItems": [{                   //
        "deliveryId": 1,                  // 提货点Id
        "deliveryName": "利森水泥厂",     // 提货点
        "deliveryAddress": "四川省德阳市什邡市洛水镇中国建材西南水泥厂",  // 提货地址
        "contactName": "白立忠",          // 联系人
        "contactPhone": ""                // 联系电话
      }
      ],
      "receivingItems": [{
        "receivingId": 1,                 // 卸货点Id
        "receivingName": "白果",          // 卸货点名称
        "receivingAddress": "四川省成都市金堂县白果镇田家堰", // 卸货地址
        "contactName": "廖江华",          // 联系人
        "contactPhone": "18723392672",    // 联系电话
        "signOssDentryId": "100212454023565056" // 样签Id
      }],
      "shipmentItems": [{
        "shipmentId": 1,                  // 承运方ID
        "shipmentName": "金泽信物流有限公司",  // 承运方单位名称
        "contactId": 1,                  // 联系人Id
        "contactName": "郭杰",           // 联系人
        "contactPhone": "18990223857",   // 联系电话
        "shipmentRemark": ""              // 备注
      }],
      "operationUserIdItems": [            // 操作员Id
        {
          "userId": "100212424023565056",
          "userName": "白立忠"
        }
      ],
      "projectRemark": ""                  // 项目备注
    })
  }
}
