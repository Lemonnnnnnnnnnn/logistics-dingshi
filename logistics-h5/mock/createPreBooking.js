export default {
  'GET /v1/projects': (req, res) => {
    res.json({
      "count":10,       // 总数
      "items":[
        {
          "projectId":0,                        // 项目Id
          "projectName":"成兰一标",             // 项目名称
          "projectStatus":0,                    // 项目状态。0拒绝，1已审，2待审
          "isAvailable":1,                           // 项目使用状态。1启用，0禁用
          "createTime":"2019-01-15T15:16:24",   // 项目日期
          "shipmentType":0,                     // 承运类型,0平台，1承运方
          "organizationName":"平台方",          // shipmentType为0平台方，为1是托运方名称
          "consignmentType":0,                  // 交易模式。0直发，1代发
          "responsiblerName":"刘鑫威",          // 项目负责人
          "responsiblerPhone":"18650454578",    // 联系人电话
          "goodsItems":[{
            "goodsId":1,
            "projectId": 123456786,
            "goodsName":"利森P.O42.5（散装）"
          }],
          "projectRemark":"大项目"              // 备注信息
        }, {
          "projectId":1,                        // 项目Id
          "projectName":"成兰二标",             // 项目名称
          "projectStatus":1,                    // 项目状态。0拒绝，1已审，2待审
          "isAvailable":1,                           // 项目使用状态。1启用，0禁用
          "createTime":"2019-01-15T15:16:24",   // 项目日期
          "shipmentType":0,                     // 承运类型,0平台，1承运方
          "organizationName":"平台方",          // shipmentType为0平台方，为1是托运方名称
          "consignmentType":0,                  // 交易模式。0直发，1代发
          "responsiblerName":"刘鑫威",          // 项目负责人
          "responsiblerPhone":"18650454578",    // 联系人电话
          "goodsItems":[{
            "goodsId":1,
            "projectId": 123456786,
            "goodsName":"利森P.O42.5（散装）"
          }],
          "projectRemark":"大项目"              // 备注信息
        },
        {
          "projectId":2,                        // 项目Id
          "projectName":"成兰三标",             // 项目名称
          "projectStatus":2,                    // 项目状态。0拒绝，1已审，2待审
          "isAvailable":1,                           // 项目使用状态。1启用，0禁用
          "createTime":"2019-01-15T15:16:24",   // 项目日期
          "shipmentType":0,                     // 承运类型,0平台，1承运方
          "organizationName":"平台方",          // shipmentType为0平台方，为1是托运方名称
          "consignmentType":0,                  // 交易模式。0直发，1代发
          "responsiblerName":"刘鑫威",          // 项目负责人
          "responsiblerPhone":"18650454578",    // 联系人电话
          "goodsItems":[{
            "goodsId":1,
            "projectId": 123456786,
            "goodsName":"利森P.O42.5（散装）"
          }],
          "projectRemark":"大项目"              // 备注信息
        },
        {
          "projectId":100212454023565056,                        // 项目Id
          "projectName":"成兰四标",             // 项目名称
          "projectStatus":2,                    // 项目状态。0拒绝，1已审，2待审
          "isAvailable":0,                           // 项目使用状态。1启用，0禁用
          "createTime":"2019-01-15T15:16:24",   // 项目日期
          "shipmentType":0,                     // 承运类型,0平台，1承运方
          "organizationName":"平台方",          // shipmentType为0平台方，为1是托运方名称
          "consignmentType":0,                  // 交易模式。0直发，1代发
          "responsiblerName":"刘鑫威",          // 项目负责人
          "responsiblerPhone":"18650454578",    // 联系人电话
          "goodsItems":[{
            "goodsId":1,
            "projectId": 123456786,
            "goodsName":"利森P.O42.5（散装）"
          }],
          "projectRemark":"大项目"              // 备注信息
        }
      ]
    })
  },
  'GET /v1/consignments/1/shipments': (req, res) => {
    res.json({
      "organizationId":1,
      "organizationName":"鼎石科技",  // 公司名称
      "shipmentItems":[{
        "shipmentOrganizationId":123, // 承运公司orgid
        "shipmentOrganizationName":"盛辉物流",
        "contactId":1,      // 联系人Id
        "contactName":"李四",  // 联系人
        "contactPhone":"13566789652",  // 联系人电话
      }]
    })
  },
  'PATCH /v1/projects':(req, res)=>{
    res.json({
      "projectId":100212454023565056,
      "projectName":"成兰八标",              // 托运方项目名称
      "responsiblerId":454531321,             // 项目负责人Id
      "responsiblerName":"刘鑫威",           // 项目负责人
      "responsiblerPhone":"18650454578",     // 联系人电话
      "transactionalMode":1,                 // 轨迹方式 ,0为车辆轨迹，1为手机轨迹 ----->车辆轨迹采用中交兴路车载GPS定位，若不勾选则采用app轨迹定位，需要用户手机开启app定位权限，并保持登录状态，才能正常获取
      "consignmentType":0,                   // 交易模式。0直发，1代发
      "cargoesId":1,                         // 代发货权方Id|交易模式为代发情况
      "cargoesName":"四川能投有限公司",      // 代发货权方名称|交易模式为代发情况must
      "shipmentType":0,                      // 承运类型,0平台，1承运方
      "organizationName":"平台方",                 // 所属机构
      // "organizationId":"",                   //所属机构Id
      "projectStatus":1,                      // 项目状态。0拒绝，1已审，2待审
      // "verifyReason":"太忙"                  //项目状态修改原因
      "isAvailable":1,                             // 是否禁用启用。1启用，0禁用
      "goodsItems":[                       // 货品
        { "projectGoodsId":100212424023565056, // 主键
          "goodsId":"100212424023565056",   // 货品Id
          "goodsName":"利森P.O42.5（散装）" // 货品名称
        }
      ],
      "operationUserIdItems":[            // 操作员Id
        { "projectOperatorId":46746854351435,
          "userId":"100212424023565056",
          "nickName":"白立忠"
        }
      ],
      "updateTime":"2019-01-15T15:16:24", // 修改时间
      "projectRemark":""                  // 项目备注
    })
  }
}
