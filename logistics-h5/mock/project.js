export default {
  'GET /v1/projects/:projectId': (req, res) => {
    const { projectId } = req.params
    res.json({
      "projectId":1,
      "projectName":"成兰八标",              // 托运方项目名称
      "responsiblerId":454531321,             // 项目负责人Id
      "responsiblerName":"刘鑫威",           // 项目负责人
      "responsiblerPhone":"18650454578",    // 联系人电话
      "transactionalMode":1,                // 轨迹方式 ,0为车辆轨迹，1为手机轨迹 ----->车辆轨迹采用中交兴路车载GPS定位，若不勾选则采用app轨迹定位，需要用户手机开启app定位权限，并保持登录状态，才能正常获取
      "consignmentType":0,                  // 交易模式。0直发，1代发
      "projectStatus":1,
      "cargoesId":1,                       // 代发货权方Id|交易模式为代发情况
      "cargoesName":"四川能投有限公司",    // 代发货权方名称|交易模式为代发情况must
      "shipmentType":1, // 承运类型,0平台，1承运方
      "goodsItems":[                       // 货品ids|
        { "projectGoodsId":123486786,
          "goodsId":"100212424023565056",    // 货品Id
          "goodsName":"利森P.O42.5（散装）1",  // 货品名称
          "categoryName":"分类一,分类二,分类三" // 类目
        }, { "projectGoodsId":123486787,
          "goodsId":"100212424023565057",    // 货品Id
          "goodsName":"利森P.O42.5（散装）2",  // 货品名称
          "categoryName":"分类一,分类二,分类三" // 类目
        }, { "projectGoodsId":123486788,
          "goodsId":"100212424023565058",    // 货品Id
          "goodsName":"利森P.O42.5（散装）3",  // 货品名称
          "categoryName":"分类一,分类二,分类三" // 类目
        }
      ],
      "deliveryIdItems": [                    // 提货点Ids
        {
          "deliveryId": "100212424023565056",
          "deliveryName": "利森水泥厂1",              // 提货点
          "deliveryAddress": "四川省德阳市什邡市洛水镇中国建材西南水泥厂1",  // 提货地址
          "contactName": "白立忠",         // 联系人
          "contactPhone": "13909023944",  // 联系电话
        }, {
          "deliveryId": "100212424023565057",
          "deliveryName": "利森水泥厂2",              // 提货点
          "deliveryAddress": "四川省德阳市什邡市洛水镇中国建材西南水泥厂2",  // 提货地址
          "contactName": "白立忠",         // 联系人
          "contactPhone": "13909023944",  // 联系电话
        }, {
          "deliveryId": "100212424023565058",
          "deliveryName": "利森水泥厂3",              // 提货点
          "deliveryAddress": "四川省德阳市什邡市洛水镇中国建材西南水泥厂3",  // 提货地址
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
        "contactPhone": "123212321"                // 联系电话
      }
      ],
      "receivingItems": [{
        "receivingId": 1,                 // 卸货点Id
        "receivingName": "白果1",          // 卸货点名称
        "receivingAddress": "四川省成都市金堂县白果镇田家堰", // 卸货地址
        "contactName": "廖江华",          // 联系人
        "contactPhone": "18723392672",    // 联系电话
        "signOssDentryId": "100212454023565056" // 样签Id
      }, {
        "receivingId": 2,                 // 卸货点Id
        "receivingName": "白果2",          // 卸货点名称
        "receivingAddress": "四川省成都市金堂县白果镇田家堰", // 卸货地址
        "contactName": "廖江华",          // 联系人
        "contactPhone": "18723392672",    // 联系电话
        "signOssDentryId": "100212454023565056" // 样签Id
      }, {
        "receivingId": 3,                 // 卸货点Id
        "receivingName": "白果3",          // 卸货点名称
        "receivingAddress": "四川省成都市金堂县白果镇田家堰", // 卸货地址
        "contactName": "廖江华",          // 联系人
        "contactPhone": "18723392672",    // 联系电话
        "signOssDentryId": "100212454023565056" // 样签Id
      }],
      "shipmentItems": [{
        "shipmentId": 1,                  // 承运方ID
        "shipmentOrganizationName": `金泽信物流有限公司_${projectId}`,  // 承运方单位名称
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
  },
  'GET /v1/receivings': (req, res) => {
    res.json({
      "count":20,       // 总数
      "items":[
        {
          "receivingId":12313,                             // 卸货点id|
          "receivingName":"白果",                             // 卸货点名称|string|must|
          "receivingAddress":"成都市金堂县田家堰",            // 卸货点地址|string|must|
          "receivingLongitude":119.30,                        // 卸货点经度|decimal|must|
          "receivingLatitude":26.08,                           // 卸货点纬度|decimal|must|
          "receivingLable":"永辉",                           // 卸货点标签|string|must|
          "contactName":"张三",                               // 联系人名称|string|must|
          "contactPhone":13352366957,                         // 联系人电话|string|must|
          "signDentryid":"asdasdasd",             // 样签|string|must|
          "remarks":"",                                       // 备注
          "isAvailable":true,                                 // 是否启用|boolean|must|false.禁用;true.启用
          "userId":12313,                                // 创建人id|
          "is_effect":1,                            // 是否生效|int|(0.失效;1.生效)
          "createUserId":2,
          "updateUserId":2,
          "createTime":"2019-01-15T15:16:24",
          "updateTime":"2019-01-15T15:16:24"
        }
      ]
    })
  },
  'GET /v1/users': (req, res) => {
    res.json({
      "count":20,       // 总数
      "items":[
        {
          "userId":1,
          "nickName":"张三",
          "userName":"",
          "sex":1,
          "phone":"1368886666",
          "organizationId":1,
          "isAvailable":true,
          "createTime":"2019-01-15T15:16:24",
          "updateTime":"2019-01-15T15:16:24"
        }
      ]
    })
  },
  'PATCH /v1/receivings/12313': (req, res) => {
    res.json({
      "receivingId":12313,                             // 卸货点id|
      "receivingName":"白果",                             // 卸货点名称|string|must|
      "receivingAddress":"成都市金堂县田家堰",            // 卸货点地址|string|must|
      "receivingLongitude":119.30,                        // 卸货点经度|decimal|must|
      "receivingLatitude":26.08,                           // 卸货点纬度|decimal|must|
      "receivingLable":"永辉",                           // 卸货点标签|string|must|
      "contactName":"张三",                               // 联系人名称|string|must|
      "contactPhone":13352366957,                         // 联系人电话|string|must|
      "signDentryid":"asdasdasd",             // 样签|string|must|
      "remarks":"",                                       // 备注
      "isAvailable":false,                                 // 是否启用|boolean|must|false.禁用;true.启用
      "userId":12313,                                // 创建人id|
      "is_effect":1,                            // 是否生效|int|(0.失效;1.生效)
      "createUserId":2,
      "updateUserId":2,
      "createTime":"2019-01-15T15:16:24",
      "updateTime":"2019-01-15T15:16:24"

    })
  },
}
