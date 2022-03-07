export default {
  'GET /v1/prebookings': (req, res) => {
    res.json({
      "count": 10,       // 总数
      "preBookingsItems": [
        {
          "preBookingId": 1,  // 预约单Id
          "preBookingNo ": "YF2019010300000001",      // 预约单号
          "preBookingStatus": 0,                // 预约单状态 0待调度，1调度中，2调度完成，3被拒绝，4已取消
          "createTime": "2019-01-15T15:16:24",   // 下单时间
          "projectName": "成兰一标",             // 项目名称
          "shipmentName": "金泽信物流",           // 承运方名称
          "deliveryName": "利森水泥厂",          // 提货点名称
          "receivingItems": [{
            "receivingId": 4654654,           // 卸货点Id
            "receivingName": "白果",           // 卸货点名称
          }],
          "goodsName": "利森水泥PO42.5",         // 货品名称
          "goodsNum": 64,                   // 货品数量(计划数量)
          "goodsUnit": "吨",                  // 单位
          "preBookingRemark": ""                  // 备注信息
        },
        {
          "preBookingId": 2,  // 预约单Id
          "preBookingNo ": "YF2019010300000001",      // 预约单号
          "preBookingStatus": 1,                // 预约单状态 0待调度，1调度中，2调度完成，3被拒绝，4已取消
          "createTime": "2019-01-15T15:16:24",   // 下单时间
          "projectName": "成兰一标",             // 项目名称
          "shipmentName": "金泽信物流",           // 承运方名称
          "deliveryName": "利森水泥厂",          // 提货点名称
          "receivingItems": [{
            "receivingId": 4654654,           // 卸货点Id
            "receivingName": "白果",           // 卸货点名称
          }],
          "goodsName": "利森水泥PO42.5",         // 货品名称
          "goodsNum": 64,                   // 货品数量(计划数量)
          "goodsUnit": "吨",                  // 单位
          "preBookingRemark": ""                  // 备注信息
        },
        {
          "preBookingId": 3,  // 预约单Id
          "preBookingNo ": "YF2019010300000001",      // 预约单号
          "preBookingStatus": 2,                // 预约单状态 0待调度，1调度中，2调度完成，3被拒绝，4已取消
          "createTime": "2019-01-15T15:16:24",   // 下单时间
          "projectName": "成兰一标",             // 项目名称
          "shipmentName": "金泽信物流",           // 承运方名称
          "deliveryName": "利森水泥厂",          // 提货点名称
          "receivingItems": [{
            "receivingId": 4654654,           // 卸货点Id
            "receivingName": "白果",           // 卸货点名称
          }],
          "goodsName": "利森水泥PO42.5",         // 货品名称
          "goodsNum": 64,                   // 货品数量(计划数量)
          "goodsUnit": "吨",                  // 单位
          "preBookingRemark": ""                  // 备注信息
        }, {
          "preBookingId": 4,  // 预约单Id
          "preBookingNo ": "YF2019010300000001",      // 预约单号
          "preBookingStatus": 3,                // 预约单状态 0待调度，1调度中，2调度完成，3被拒绝，4已取消
          "createTime": "2019-01-15T15:16:24",   // 下单时间
          "projectName": "成兰一标",             // 项目名称
          "shipmentName": "金泽信物流",           // 承运方名称
          "deliveryName": "利森水泥厂",          // 提货点名称
          "receivingItems": [{
            "receivingId": 4654654,           // 卸货点Id
            "receivingName": "白果",           // 卸货点名称
          }],
          "goodsName": "利森水泥PO42.5",         // 货品名称
          "goodsNum": 64,                   // 货品数量(计划数量)
          "goodsUnit": "吨",                  // 单位
          "preBookingRemark": ""                  // 备注信息
        }]
    })
  },
  'GET /v1/prebookings/1': (req, res) => {
    res.json({
      "prebookingId":100212454023565056,      // 预约单Id
      "projectId":100212454023565056,         // 项目Id
      "projectName":"毗河一分部",               // 项目名称
      "preBookingNo":"YF2019010300000001",     // 预约单号
      "consignmentType":0,                      // 交易模式。0直发，1代发
      "cargoesName":"四川能投有限公司",           // 代发企业名称
      "shipmentId":"100212454023565056",        // 承运方Id
      "shipmentName":"金泽信物流有限公司",      // 承运方单位名称
      "shipmentContactName":"郭杰",             // 承运方单联系人
      "shipmentContactPhone":"18990223857",     // 承运方单联系电话
      "shipmentBillMode":"",                    // 承运方开票方式。0平台向货主开票。1承运方提供进项发票给平台，再由平台向货主开票。2承运方提供发票给货主
      "acceptanceTime":"2019-01-15T15:16:24",   // 计划送达时间。备注：如果超过这个计划送达时间承运方还未接单的话，这个预约单就自动取消
      "receivingItems":[{
        "prebookingCorrelationId":132132132,
        "prebookingObjectId":"100212454023565056",    // 卸货点Id
        "name":"白果",                                // 卸货点名称
        "address":"成都市新都区木兰小学",             // 卸货点地址
        "goodsId":132,                                // 货品Id
        "contactName":"廖江华",                       // 卸货点联系人
        "contactPhone":"18628165797",                 // 卸货点联系电话
        "receivingNum":20.000,                         // 预计卸货量
        "goodsUnit":1                                 // 货品单位
      }],
      "deliveryItems":[{
        "prebookingCorrelationId":132132132,
        "prebookingObjectId":"100212454023565056",    // 提货点Id
        "name":"白果",                                // 提货点名称
        "address":"成都市新都区木兰小学",             // 提货点地址
        "goodsId":132,                                // 货品Id
        "contactName":"廖江华",                       // 提货点联系人
        "contactPhone":"18628165797",                 // 提货点联系电话
        "receivingNum":20.000,                         // 预计卸货量
        "goodsUnit":1                                 // 货品单位
      }],
      "transportItems":[{
        "transportId":"100212454023565056",      // 运单Id
        "transportStatus":"",                    // 运单状态，0:等待处理 1:承运方取消作废 2:司机拒绝  3:司机处理中 4:司机提交异常 5:回单被拒绝 6:回单审核中 7:回单审核通过 8:完成
        "transportNo ":"YD2019010300000001",      // 运单号
        "driverUserId":"100212454023565056", // 司机Id
        "driverUserName":"张一",                // 司机姓名
        "driverUserPhone":"13800000007",        // 司机电话
        "deliveryId":"100212454023565056",       // 提货点Id
        "deliveryName":"利森水泥厂",             // 提货点名称
        "receivingId":"100212454023565056",      // 卸货点Id
        "receivingName":"白果",                  // 卸货点名称
        "loadingNum":"25",             // 提货数量
        "receivingNum":"24.8"           // 卸货数量
      }],
      "verifyItems":[{     // 预约单事件
        "verifyId":"100212454023565056",            // 预约单事件Id
        "createTime":"2019-01-15T15:16:24",       // 时间
        "userId":"100212454023565056",            // 操作人Id
        "userName":"郭杰",                        // 操作人
        "companyName":"金泽信物流",               // 操作单位
        "verifyReason":"",                        // 原因
        "verifyStatus":3                          // 操作状态 。预约单状态 0待调度，1调度中，2调度完成，3被拒绝，4已取消
      }, {     // 预约单事件
        "verifyId":"100212454023565055",            // 预约单事件Id
        "createTime":"2019-01-15T15:16:24",       // 时间
        "userId":"100212454023565056",            // 操作人Id
        "userName":"郭杰",                        // 操作人
        "companyName":"金泽信物流",               // 操作单位
        "verifyReason":"",                        // 原因
        "verifyStatus":3                          // 操作状态 。预约单状态 0待调度，1调度中，2调度完成，3被拒绝，4已取消
      }, {     // 预约单事件
        "verifyId":"100212454023565054",            // 预约单事件Id
        "createTime":"2019-01-15T15:16:24",       // 时间
        "userId":"100212454023565056",            // 操作人Id
        "userName":"郭杰",                        // 操作人
        "companyName":"金泽信物流",               // 操作单位
        "verifyReason":"",                        // 原因
        "verifyStatus":3                          // 操作状态 。预约单状态 0待调度，1调度中，2调度完成，3被拒绝，4已取消
      }, {     // 预约单事件
        "verifyId":"100212454023565053",            // 预约单事件Id
        "createTime":"2019-01-15T15:16:24",       // 时间
        "userId":"100212454023565056",            // 操作人Id
        "userName":"郭杰",                        // 操作人
        "companyName":"金泽信物流",               // 操作单位
        "verifyReason":"",                        // 原因
        "verifyStatus":3                          // 操作状态 。预约单状态 0待调度，1调度中，2调度完成，3被拒绝，4已取消
      }],
      "prebookingStatus":4,                  // 预约单状态 0待调度，1调度中，2调度完成，3被拒绝，4已取消
      "prebookingRemark":""                  // 预约单备注
    })
  }
}
