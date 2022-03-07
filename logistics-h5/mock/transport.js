export default {
  'GET /v1/transports': (req, res) => {
    res.json({
      "count": 20,                // 总数
      "items": [
        {
          "transportId": 1,                 // 运单Id
          "transportNo": "YD2001",      // 运单编号
          "transportStatus": 0,                  // 运单状态
          "projectId": 1,               // 项目Id|long|must
          "projectName": "成兰一标",   // 项目名称
          "consignmentOrganizationId": 1,             // 托运方Id|long|
          "consignmentOrganizationName": "xx",        // 托运方公司
          "shipmentOrganizationId": 1,              // 承运方Id|long
          "shipmentOrganizationName": "yy",         // 承运方公司
          "prebookingId": 1,                 // 预约单Id
          "deliveryItems": [
            {
              "deliveryId": 1,              // 提货点Id|long
              "deliveryName": "利森水泥厂", // 提货点名称
              "longitude": 119.30,  // 提货点经度
              "latitude": 26.08,    // 提货点维度
              "goodsId": 1,                 // 货物id|long
              "goodsName": 1,               // 货物名称
              "goodsNum": 20.5,             // 货物重量|double
              "goodsUnit": 1,                // 货物重量单位|int 1:吨 2:斤 3:克 4:千克 5:米 6:千米
              "freightPrice": 20.5          // 单位运价，元|double
            }
          ],
          "receivingId": 1,             // 卸货点Id
          "receivingName": "白果",      // 卸货点名称
          "receivingLongitude": 123.30, // 卸货点经度
          "receivingLatitude": 28.08,   // 卸货点维度
          "plateNumber": "闽K888888",   // 车牌号
          "driverUserId": 1,       // 司机用户Id
          "driverUserName": "张三", // 司机用户名
          "driverPhone": "13800000001", // 司机手机号
          "driverCompanyName": "金泽信物流", // 司机所属机构
          "receivingNum": 20.3,         // 卸货重量
          "receivingNo": "QS0012345",   // 签收单号
          "deliveryTime": "2019-03-19T20:08:08",   // 装车时间
          "receivingTime": "2019-03-19T20:08:08",  // 卸货时间
          "createTime": "2019-03-19T20:08:08",     // 创建时间
          "updateTime": "2019-03-19T20:08:08"      // 更新时间
        }, {
          "transportId": 2,                 // 运单Id
          "transportNo": "YD2001",      // 运单编号
          "transportStatus": 1,                  // 运单状态
          "projectId": 1,               // 项目Id|long|must
          "projectName": "成兰一标",   // 项目名称
          "consignmentOrganizationId": 1,             // 托运方Id|long|
          "consignmentOrganizationName": "xx",        // 托运方公司
          "shipmentOrganizationId": 1,              // 承运方Id|long
          "shipmentOrganizationName": "yy",         // 承运方公司
          "prebookingId": 1,                 // 预约单Id
          "deliveryItems": [
            {
              "deliveryId": 1,              // 提货点Id|long
              "deliveryName": "利森水泥厂", // 提货点名称
              "longitude": 119.30,  // 提货点经度
              "latitude": 26.08,    // 提货点维度
              "goodsId": 1,                 // 货物id|long
              "goodsName": 1,               // 货物名称
              "goodsNum": 20.5,             // 货物重量|double
              "goodsUnit": 1,                // 货物重量单位|int 1:吨 2:斤 3:克 4:千克 5:米 6:千米
              "freightPrice": 20.5          // 单位运价，元|double
            }
          ],
          "receivingId": 1,             // 卸货点Id
          "receivingName": "白果",      // 卸货点名称
          "receivingLongitude": 123.30, // 卸货点经度
          "receivingLatitude": 28.08,   // 卸货点维度
          "plateNumber": "闽K888888",   // 车牌号
          "driverUserId": 1,       // 司机用户Id
          "driverUserName": "张三", // 司机用户名
          "driverPhone": "13800000001", // 司机手机号
          "driverCompanyName": "金泽信物流", // 司机所属机构
          "receivingNum": 20.3,         // 卸货重量
          "receivingNo": "QS0012345",   // 签收单号
          "deliveryTime": "2019-03-19T20:08:08",   // 装车时间
          "receivingTime": "2019-03-19T20:08:08",  // 卸货时间
          "createTime": "2019-03-19T20:08:08",     // 创建时间
          "updateTime": "2019-03-19T20:08:08"      // 更新时间
        }, {
          "transportId": 3,                 // 运单Id
          "transportNo": "YD2001",      // 运单编号
          "transportStatus": 2,                  // 运单状态
          "projectId": 1,               // 项目Id|long|must
          "projectName": "成兰一标",   // 项目名称
          "consignmentOrganizationId": 1,             // 托运方Id|long|
          "consignmentOrganizationName": "xx",        // 托运方公司
          "shipmentOrganizationId": 1,              // 承运方Id|long
          "shipmentOrganizationName": "yy",         // 承运方公司
          "prebookingId": 1,                 // 预约单Id
          "deliveryItems": [
            {
              "deliveryId": 1,              // 提货点Id|long
              "deliveryName": "利森水泥厂", // 提货点名称
              "longitude": 119.30,  // 提货点经度
              "latitude": 26.08,    // 提货点维度
              "goodsId": 1,                 // 货物id|long
              "goodsName": 1,               // 货物名称
              "goodsNum": 20.5,             // 货物重量|double
              "goodsUnit": 1,                // 货物重量单位|int 1:吨 2:斤 3:克 4:千克 5:米 6:千米
              "freightPrice": 20.5          // 单位运价，元|double
            }
          ],
          "receivingId": 1,             // 卸货点Id
          "receivingName": "白果",      // 卸货点名称
          "receivingLongitude": 123.30, // 卸货点经度
          "receivingLatitude": 28.08,   // 卸货点维度
          "plateNumber": "闽K888888",   // 车牌号
          "driverUserId": 1,       // 司机用户Id
          "driverUserName": "张三", // 司机用户名
          "driverPhone": "13800000001", // 司机手机号
          "driverCompanyName": "金泽信物流", // 司机所属机构
          "receivingNum": 20.3,         // 卸货重量
          "receivingNo": "QS0012345",   // 签收单号
          "deliveryTime": "2019-03-19T20:08:08",   // 装车时间
          "receivingTime": "2019-03-19T20:08:08",  // 卸货时间
          "createTime": "2019-03-19T20:08:08",     // 创建时间
          "updateTime": "2019-03-19T20:08:08"      // 更新时间
        }, {
          "transportId": 4,                 // 运单Id
          "transportNo": "YD2001",      // 运单编号
          "transportStatus": 3,                  // 运单状态
          "projectId": 1,               // 项目Id|long|must
          "projectName": "成兰一标",   // 项目名称
          "consignmentOrganizationId": 1,             // 托运方Id|long|
          "consignmentOrganizationName": "xx",        // 托运方公司
          "shipmentOrganizationId": 1,              // 承运方Id|long
          "shipmentOrganizationName": "yy",         // 承运方公司
          "prebookingId": 1,                 // 预约单Id
          "deliveryItems": [
            {
              "deliveryId": 1,              // 提货点Id|long
              "deliveryName": "利森水泥厂", // 提货点名称
              "longitude": 119.30,  // 提货点经度
              "latitude": 26.08,    // 提货点维度
              "goodsId": 1,                 // 货物id|long
              "goodsName": 1,               // 货物名称
              "goodsNum": 20.5,             // 货物重量|double
              "goodsUnit": 1,                // 货物重量单位|int 1:吨 2:斤 3:克 4:千克 5:米 6:千米
              "freightPrice": 20.5          // 单位运价，元|double
            }
          ],
          "receivingId": 1,             // 卸货点Id
          "receivingName": "白果",      // 卸货点名称
          "receivingLongitude": 123.30, // 卸货点经度
          "receivingLatitude": 28.08,   // 卸货点维度
          "plateNumber": "闽K888888",   // 车牌号
          "driverUserId": 1,       // 司机用户Id
          "driverUserName": "张三", // 司机用户名
          "driverPhone": "13800000001", // 司机手机号
          "driverCompanyName": "金泽信物流", // 司机所属机构
          "receivingNum": 20.3,         // 卸货重量
          "receivingNo": "QS0012345",   // 签收单号
          "deliveryTime": "2019-03-19T20:08:08",   // 装车时间
          "receivingTime": "2019-03-19T20:08:08",  // 卸货时间
          "createTime": "2019-03-19T20:08:08",     // 创建时间
          "updateTime": "2019-03-19T20:08:08"      // 更新时间
        }, {
          "transportId": 5,                 // 运单Id
          "transportNo": "YD2001",      // 运单编号
          "transportStatus": 4,                  // 运单状态
          "projectId": 1,               // 项目Id|long|must
          "projectName": "成兰一标",   // 项目名称
          "consignmentOrganizationId": 1,             // 托运方Id|long|
          "consignmentOrganizationName": "xx",        // 托运方公司
          "shipmentOrganizationId": 1,              // 承运方Id|long
          "shipmentOrganizationName": "yy",         // 承运方公司
          "prebookingId": 1,                 // 预约单Id
          "deliveryItems": [
            {
              "deliveryId": 1,              // 提货点Id|long
              "deliveryName": "利森水泥厂", // 提货点名称
              "longitude": 119.30,  // 提货点经度
              "latitude": 26.08,    // 提货点维度
              "goodsId": 1,                 // 货物id|long
              "goodsName": 1,               // 货物名称
              "goodsNum": 20.5,             // 货物重量|double
              "goodsUnit": 1,                // 货物重量单位|int 1:吨 2:斤 3:克 4:千克 5:米 6:千米
              "freightPrice": 20.5          // 单位运价，元|double
            }
          ],
          "receivingId": 1,             // 卸货点Id
          "receivingName": "白果",      // 卸货点名称
          "receivingLongitude": 123.30, // 卸货点经度
          "receivingLatitude": 28.08,   // 卸货点维度
          "plateNumber": "闽K888888",   // 车牌号
          "driverUserId": 1,       // 司机用户Id
          "driverUserName": "张三", // 司机用户名
          "driverPhone": "13800000001", // 司机手机号
          "driverCompanyName": "金泽信物流", // 司机所属机构
          "receivingNum": 20.3,         // 卸货重量
          "receivingNo": "QS0012345",   // 签收单号
          "deliveryTime": "2019-03-19T20:08:08",   // 装车时间
          "receivingTime": "2019-03-19T20:08:08",  // 卸货时间
          "createTime": "2019-03-19T20:08:08",     // 创建时间
          "updateTime": "2019-03-19T20:08:08"      // 更新时间
        }, {
          "transportId": 6,                 // 运单Id
          "transportNo": "YD2001",      // 运单编号
          "transportStatus": 5,                  // 运单状态
          "projectId": 1,               // 项目Id|long|must
          "projectName": "成兰一标",   // 项目名称
          "consignmentOrganizationId": 1,             // 托运方Id|long|
          "consignmentOrganizationName": "xx",        // 托运方公司
          "shipmentOrganizationId": 1,              // 承运方Id|long
          "shipmentOrganizationName": "yy",         // 承运方公司
          "prebookingId": 1,                 // 预约单Id
          "deliveryItems": [
            {
              "deliveryId": 1,              // 提货点Id|long
              "deliveryName": "利森水泥厂", // 提货点名称
              "longitude": 119.30,  // 提货点经度
              "latitude": 26.08,    // 提货点维度
              "goodsId": 1,                 // 货物id|long
              "goodsName": 1,               // 货物名称
              "goodsNum": 20.5,             // 货物重量|double
              "goodsUnit": 1,                // 货物重量单位|int 1:吨 2:斤 3:克 4:千克 5:米 6:千米
              "freightPrice": 20.5          // 单位运价，元|double
            }
          ],
          "receivingId": 1,             // 卸货点Id
          "receivingName": "白果",      // 卸货点名称
          "receivingLongitude": 123.30, // 卸货点经度
          "receivingLatitude": 28.08,   // 卸货点维度
          "plateNumber": "闽K888888",   // 车牌号
          "driverUserId": 1,       // 司机用户Id
          "driverUserName": "张三", // 司机用户名
          "driverPhone": "13800000001", // 司机手机号
          "driverCompanyName": "金泽信物流", // 司机所属机构
          "receivingNum": 20.3,         // 卸货重量
          "receivingNo": "QS0012345",   // 签收单号
          "deliveryTime": "2019-03-19T20:08:08",   // 装车时间
          "receivingTime": "2019-03-19T20:08:08",  // 卸货时间
          "createTime": "2019-03-19T20:08:08",     // 创建时间
          "updateTime": "2019-03-19T20:08:08"      // 更新时间
        }, {
          "transportId": 7,                 // 运单Id
          "transportNo": "YD2001",      // 运单编号
          "transportStatus": 6,                  // 运单状态
          "projectId": 1,               // 项目Id|long|must
          "projectName": "成兰一标",   // 项目名称
          "consignmentOrganizationId": 1,             // 托运方Id|long|
          "consignmentOrganizationName": "xx",        // 托运方公司
          "shipmentOrganizationId": 1,              // 承运方Id|long
          "shipmentOrganizationName": "yy",         // 承运方公司
          "prebookingId": 1,                 // 预约单Id
          "deliveryItems": [
            {
              "deliveryId": 1,              // 提货点Id|long
              "deliveryName": "利森水泥厂", // 提货点名称
              "longitude": 119.30,  // 提货点经度
              "latitude": 26.08,    // 提货点维度
              "goodsId": 1,                 // 货物id|long
              "goodsName": 1,               // 货物名称
              "goodsNum": 20.5,             // 货物重量|double
              "goodsUnit": 1,                // 货物重量单位|int 1:吨 2:斤 3:克 4:千克 5:米 6:千米
              "freightPrice": 20.5          // 单位运价，元|double
            }
          ],
          "receivingId": 1,             // 卸货点Id
          "receivingName": "白果",      // 卸货点名称
          "receivingLongitude": 123.30, // 卸货点经度
          "receivingLatitude": 28.08,   // 卸货点维度
          "plateNumber": "闽K888888",   // 车牌号
          "driverUserId": 1,       // 司机用户Id
          "driverUserName": "张三", // 司机用户名
          "driverPhone": "13800000001", // 司机手机号
          "driverCompanyName": "金泽信物流", // 司机所属机构
          "receivingNum": 20.3,         // 卸货重量
          "receivingNo": "QS0012345",   // 签收单号
          "deliveryTime": "2019-03-19T20:08:08",   // 装车时间
          "receivingTime": "2019-03-19T20:08:08",  // 卸货时间
          "createTime": "2019-03-19T20:08:08",     // 创建时间
          "updateTime": "2019-03-19T20:08:08"      // 更新时间
        }, {
          "transportId": 8,                 // 运单Id
          "transportNo": "YD2001",      // 运单编号
          "transportStatus": 7,                  // 运单状态
          "projectId": 1,               // 项目Id|long|must
          "projectName": "成兰一标",   // 项目名称
          "consignmentOrganizationId": 1,             // 托运方Id|long|
          "consignmentOrganizationName": "xx",        // 托运方公司
          "shipmentOrganizationId": 1,              // 承运方Id|long
          "shipmentOrganizationName": "yy",         // 承运方公司
          "prebookingId": 1,                 // 预约单Id
          "deliveryItems": [
            {
              "deliveryId": 1,              // 提货点Id|long
              "deliveryName": "利森水泥厂", // 提货点名称
              "longitude": 119.30,  // 提货点经度
              "latitude": 26.08,    // 提货点维度
              "goodsId": 1,                 // 货物id|long
              "goodsName": 1,               // 货物名称
              "goodsNum": 20.5,             // 货物重量|double
              "goodsUnit": 1,                // 货物重量单位|int 1:吨 2:斤 3:克 4:千克 5:米 6:千米
              "freightPrice": 20.5          // 单位运价，元|double
            }
          ],
          "receivingId": 1,             // 卸货点Id
          "receivingName": "白果",      // 卸货点名称
          "receivingLongitude": 123.30, // 卸货点经度
          "receivingLatitude": 28.08,   // 卸货点维度
          "plateNumber": "闽K888888",   // 车牌号
          "driverUserId": 1,       // 司机用户Id
          "driverUserName": "张三", // 司机用户名
          "driverPhone": "13800000001", // 司机手机号
          "driverCompanyName": "金泽信物流", // 司机所属机构
          "receivingNum": 20.3,         // 卸货重量
          "receivingNo": "QS0012345",   // 签收单号
          "deliveryTime": "2019-03-19T20:08:08",   // 装车时间
          "receivingTime": "2019-03-19T20:08:08",  // 卸货时间
          "createTime": "2019-03-19T20:08:08",     // 创建时间
          "updateTime": "2019-03-19T20:08:08"      // 更新时间
        }
      ]
    })
  },
  'GET /v1/transports/1': (req, res) => {
    res.json({
      "transportId":1,                       // 运单Id
      "transportNo":"YD2001",      // 运单编号
      "transportStatus":1,                  // 运单状态，0:等待处理 1::司机拒绝  2:司机处理中 3:异常待确认 4:异常确认 5异常拒绝  6:回单审核中 7:回单审核通过 8:回单被拒绝 9:完成
      "projectId":1,               // 项目Id|long|must
      "consignmentOrganizationId":1,          // 托运方Id|long|must
      "shipmentOrganizationId":1,            // 承运方Id|long|must
      "prebookingId":1,                 // 预约单Id
      "transportExceptionId":1,     // 关联的异常运单Id|long|not_must
      "deliveryItems":[
        {
          "deliveryId":1,              // 提货点Id
          "deliveryName":"白果",       // 提货点名称
          "deliveryAddress":"白果水泥厂", // 提货点地址
          "longitude":119.30,  // 提货点经度
          "latitude":26.08,    // 提货点维度
          "billNumber":"xxx1",          // 提货单号
          "billDentryid":"xxxa",     // 图片标识
          "goodsId":1,                 // 货物id|long|must
          "goodsNum":20.5,             // 货物重量|double|must
          "goodsUnit":1,               // 货物重量单位|int 1:吨 2:斤 3:克 4:千克 5:米 6:千米|must
        }
      ],
      "loadingItems":[
        {
          "longitude":121.3,   // 装货点经度
          "latitude":119.6,
          "billNumber":"xxx1",          // 装货单号
          "billDentryid":"xxxa",     // 图片标识
        }
      ],
      "receivingId":1,             // 卸货点Id
      "receivingLongitude":123.30, // 卸货点经度
      "receivingLatitude":28.08,   // 卸货点维度
      "receivingName":"木兰",       // 卸货点名称
      "receivingAddress":"木兰消息", // 卸货点地址.
      "longitude":121.3,   // 卸货点经度
      "latitude":119.6,    // 卸货点纬度
      "billNumber":"xxx1",   // 卸货点单号
      "billDentryid":"xxxa", // 卸货点图片标识
      "signItems":{
        "longitude":121.3,   // 签收点经度
        "latitude":119.6,    // 签收点维度
        "billNumber":"xxx1",          // 签收单号
        "billDentryid":"xxxa",     // 图片标识
      },
      "exceptionItems":[{
        "transpotExceptionId":1321321321,    // 异常运单Id
        "transportId":1221321323,            // 运单表Id
        "exceptionReason":"天气原因",        // 异常原因
        "exceptionDentryid":213123213,       // 异常图片Id
        "createTime":"2019-01-01T01:01:01",  // 创建时间
        "createUserId":213123213,            // 创建用户id
      }],
      // "refuseReason": "xdfdsfesfferrexdfdsfesfferrexdfdsfesfferrexdfdsfesfferrexdfdsfesfferrexdfdsfesfferrexdfdsfesfferrexdfdsfesfferrexdfdsfesfferrexdfdsfesfferrexdfdsfesfferrexdfdsfesfferrexdfdsfesfferrexdfdsfesfferrexdfdsfesfferre11111111",
      "projectName":"闽K888888",   // 项目名称
      "responsiblerName":"张鑫",   // 项目负责人
      "responsiblerPhone":"18650232323",   // 项目负责人电话
      "shipmentName":"金泽信物流",        // 所属承运方
      "shipmentContactName":"郭杰",   // 承运方联系人
      "shipmentContactPhone":"18650784523",   // 承运方联系人电话
      "plateNumber":"闽K888888",   // 车牌号
      "carId":15643213,         // 车辆ID
      "driverUserId":1,                   // 司机用户Id
      "driverUserName":"张三",            // 司机姓名
      "driverUserPhone":"18650454512",    // 司机电话
      "expectTime":"2019-03-19T20:08:08",  // 预计到达时间
      "createTime":"2019-03-19T20:08:08",     // 创建时间
      "updateTime":"2019-03-19T20:08:08"      // 更新时间
    })
  },
  'GET /v1/transports/all': (req, res) => {
    res.json({
      "count": 20,                // 总数
      "items": [
        {
          "transportId": 1,                 // 运单Id
          "transportNo": "YD2001",      // 运单编号
          "transportStatus": 0,                  // 运单状态
          "projectId": 1,               // 项目Id|long|must
          "projectName": "成兰一标",   // 项目名称
          "consignmentOrganizationId": 1,             // 托运方Id|long|
          "consignmentOrganizationName": "xx",        // 托运方公司
          "shipmentOrganizationId": 1,              // 承运方Id|long
          "shipmentOrganizationName": "yy",         // 承运方公司
          "prebookingId": 1,                 // 预约单Id
          "deliveryItems": [
            {
              "deliveryId": 1,              // 提货点Id|long
              "deliveryName": "利森水泥厂", // 提货点名称
              "longitude": 119.30,  // 提货点经度
              "latitude": 26.08,    // 提货点维度
              "goodsId": 1,                 // 货物id|long
              "goodsName": 1,               // 货物名称
              "goodsNum": 20.5,             // 货物重量|double
              "goodsUnit": 1,                // 货物重量单位|int 1:吨 2:斤 3:克 4:千克 5:米 6:千米
              "freightPrice": 20.5          // 单位运价，元|double
            }
          ],
          "receivingId": 1,             // 卸货点Id
          "receivingName": "白果",      // 卸货点名称
          "receivingLongitude": 123.30, // 卸货点经度
          "receivingLatitude": 28.08,   // 卸货点维度
          "plateNumber": "闽K888888",   // 车牌号
          "driverUserId": 1,       // 司机用户Id
          "driverUserName": "张三", // 司机用户名
          "driverPhone": "13800000001", // 司机手机号
          "driverCompanyName": "金泽信物流", // 司机所属机构
          "receivingNum": 20.3,         // 卸货重量
          "receivingNo": "QS0012345",   // 签收单号
          "deliveryTime": "2019-03-19T20:08:08",   // 装车时间
          "receivingTime": "2019-03-19T20:08:08",  // 卸货时间
          "createTime": "2019-03-19T20:08:08",     // 创建时间
          "updateTime": "2019-03-19T20:08:08"      // 更新时间
        }, {
          "transportId": 2,                 // 运单Id
          "transportNo": "YD2001",      // 运单编号
          "transportStatus": 1,                  // 运单状态
          "projectId": 1,               // 项目Id|long|must
          "projectName": "成兰一标",   // 项目名称
          "consignmentOrganizationId": 1,             // 托运方Id|long|
          "consignmentOrganizationName": "xx",        // 托运方公司
          "shipmentOrganizationId": 1,              // 承运方Id|long
          "shipmentOrganizationName": "yy",         // 承运方公司
          "prebookingId": 1,                 // 预约单Id
          "deliveryItems": [
            {
              "deliveryId": 1,              // 提货点Id|long
              "deliveryName": "利森水泥厂", // 提货点名称
              "longitude": 119.30,  // 提货点经度
              "latitude": 26.08,    // 提货点维度
              "goodsId": 1,                 // 货物id|long
              "goodsName": 1,               // 货物名称
              "goodsNum": 20.5,             // 货物重量|double
              "goodsUnit": 1,                // 货物重量单位|int 1:吨 2:斤 3:克 4:千克 5:米 6:千米
              "freightPrice": 20.5          // 单位运价，元|double
            }
          ],
          "receivingId": 1,             // 卸货点Id
          "receivingName": "白果",      // 卸货点名称
          "receivingLongitude": 123.30, // 卸货点经度
          "receivingLatitude": 28.08,   // 卸货点维度
          "plateNumber": "闽K888888",   // 车牌号
          "driverUserId": 1,       // 司机用户Id
          "driverUserName": "张三", // 司机用户名
          "driverPhone": "13800000001", // 司机手机号
          "driverCompanyName": "金泽信物流", // 司机所属机构
          "receivingNum": 20.3,         // 卸货重量
          "receivingNo": "QS0012345",   // 签收单号
          "deliveryTime": "2019-03-19T20:08:08",   // 装车时间
          "receivingTime": "2019-03-19T20:08:08",  // 卸货时间
          "createTime": "2019-03-19T20:08:08",     // 创建时间
          "updateTime": "2019-03-19T20:08:08"      // 更新时间
        }, {
          "transportId": 3,                 // 运单Id
          "transportNo": "YD2001",      // 运单编号
          "transportStatus": 2,                  // 运单状态
          "projectId": 1,               // 项目Id|long|must
          "projectName": "成兰一标",   // 项目名称
          "consignmentOrganizationId": 1,             // 托运方Id|long|
          "consignmentOrganizationName": "xx",        // 托运方公司
          "shipmentOrganizationId": 1,              // 承运方Id|long
          "shipmentOrganizationName": "yy",         // 承运方公司
          "prebookingId": 1,                 // 预约单Id
          "deliveryItems": [
            {
              "deliveryId": 1,              // 提货点Id|long
              "deliveryName": "利森水泥厂", // 提货点名称
              "longitude": 119.30,  // 提货点经度
              "latitude": 26.08,    // 提货点维度
              "goodsId": 1,                 // 货物id|long
              "goodsName": 1,               // 货物名称
              "goodsNum": 20.5,             // 货物重量|double
              "goodsUnit": 1,                // 货物重量单位|int 1:吨 2:斤 3:克 4:千克 5:米 6:千米
              "freightPrice": 20.5          // 单位运价，元|double
            }
          ],
          "receivingId": 1,             // 卸货点Id
          "receivingName": "白果",      // 卸货点名称
          "receivingLongitude": 123.30, // 卸货点经度
          "receivingLatitude": 28.08,   // 卸货点维度
          "plateNumber": "闽K888888",   // 车牌号
          "driverUserId": 1,       // 司机用户Id
          "driverUserName": "张三", // 司机用户名
          "driverPhone": "13800000001", // 司机手机号
          "driverCompanyName": "金泽信物流", // 司机所属机构
          "receivingNum": 20.3,         // 卸货重量
          "receivingNo": "QS0012345",   // 签收单号
          "deliveryTime": "2019-03-19T20:08:08",   // 装车时间
          "receivingTime": "2019-03-19T20:08:08",  // 卸货时间
          "createTime": "2019-03-19T20:08:08",     // 创建时间
          "updateTime": "2019-03-19T20:08:08"      // 更新时间
        }, {
          "transportId": 4,                 // 运单Id
          "transportNo": "YD2001",      // 运单编号
          "transportStatus": 3,                  // 运单状态
          "projectId": 1,               // 项目Id|long|must
          "projectName": "成兰一标",   // 项目名称
          "consignmentOrganizationId": 1,             // 托运方Id|long|
          "consignmentOrganizationName": "xx",        // 托运方公司
          "shipmentOrganizationId": 1,              // 承运方Id|long
          "shipmentOrganizationName": "yy",         // 承运方公司
          "prebookingId": 1,                 // 预约单Id
          "deliveryItems": [
            {
              "deliveryId": 1,              // 提货点Id|long
              "deliveryName": "利森水泥厂", // 提货点名称
              "longitude": 119.30,  // 提货点经度
              "latitude": 26.08,    // 提货点维度
              "goodsId": 1,                 // 货物id|long
              "goodsName": 1,               // 货物名称
              "goodsNum": 20.5,             // 货物重量|double
              "goodsUnit": 1,                // 货物重量单位|int 1:吨 2:斤 3:克 4:千克 5:米 6:千米
              "freightPrice": 20.5          // 单位运价，元|double
            }
          ],
          "receivingId": 1,             // 卸货点Id
          "receivingName": "白果",      // 卸货点名称
          "receivingLongitude": 123.30, // 卸货点经度
          "receivingLatitude": 28.08,   // 卸货点维度
          "plateNumber": "闽K888888",   // 车牌号
          "driverUserId": 1,       // 司机用户Id
          "driverUserName": "张三", // 司机用户名
          "driverPhone": "13800000001", // 司机手机号
          "driverCompanyName": "金泽信物流", // 司机所属机构
          "receivingNum": 20.3,         // 卸货重量
          "receivingNo": "QS0012345",   // 签收单号
          "deliveryTime": "2019-03-19T20:08:08",   // 装车时间
          "receivingTime": "2019-03-19T20:08:08",  // 卸货时间
          "createTime": "2019-03-19T20:08:08",     // 创建时间
          "updateTime": "2019-03-19T20:08:08"      // 更新时间
        }, {
          "transportId": 5,                 // 运单Id
          "transportNo": "YD2001",      // 运单编号
          "transportStatus": 4,                  // 运单状态
          "projectId": 1,               // 项目Id|long|must
          "projectName": "成兰一标",   // 项目名称
          "consignmentOrganizationId": 1,             // 托运方Id|long|
          "consignmentOrganizationName": "xx",        // 托运方公司
          "shipmentOrganizationId": 1,              // 承运方Id|long
          "shipmentOrganizationName": "yy",         // 承运方公司
          "prebookingId": 1,                 // 预约单Id
          "deliveryItems": [
            {
              "deliveryId": 1,              // 提货点Id|long
              "deliveryName": "利森水泥厂", // 提货点名称
              "longitude": 119.30,  // 提货点经度
              "latitude": 26.08,    // 提货点维度
              "goodsId": 1,                 // 货物id|long
              "goodsName": 1,               // 货物名称
              "goodsNum": 20.5,             // 货物重量|double
              "goodsUnit": 1,                // 货物重量单位|int 1:吨 2:斤 3:克 4:千克 5:米 6:千米
              "freightPrice": 20.5          // 单位运价，元|double
            }
          ],
          "receivingId": 1,             // 卸货点Id
          "receivingName": "白果",      // 卸货点名称
          "receivingLongitude": 123.30, // 卸货点经度
          "receivingLatitude": 28.08,   // 卸货点维度
          "plateNumber": "闽K888888",   // 车牌号
          "driverUserId": 1,       // 司机用户Id
          "driverUserName": "张三", // 司机用户名
          "driverPhone": "13800000001", // 司机手机号
          "driverCompanyName": "金泽信物流", // 司机所属机构
          "receivingNum": 20.3,         // 卸货重量
          "receivingNo": "QS0012345",   // 签收单号
          "deliveryTime": "2019-03-19T20:08:08",   // 装车时间
          "receivingTime": "2019-03-19T20:08:08",  // 卸货时间
          "createTime": "2019-03-19T20:08:08",     // 创建时间
          "updateTime": "2019-03-19T20:08:08"      // 更新时间
        }, {
          "transportId": 6,                 // 运单Id
          "transportNo": "YD2001",      // 运单编号
          "transportStatus": 5,                  // 运单状态
          "projectId": 1,               // 项目Id|long|must
          "projectName": "成兰一标",   // 项目名称
          "consignmentOrganizationId": 1,             // 托运方Id|long|
          "consignmentOrganizationName": "xx",        // 托运方公司
          "shipmentOrganizationId": 1,              // 承运方Id|long
          "shipmentOrganizationName": "yy",         // 承运方公司
          "prebookingId": 1,                 // 预约单Id
          "deliveryItems": [
            {
              "deliveryId": 1,              // 提货点Id|long
              "deliveryName": "利森水泥厂", // 提货点名称
              "longitude": 119.30,  // 提货点经度
              "latitude": 26.08,    // 提货点维度
              "goodsId": 1,                 // 货物id|long
              "goodsName": 1,               // 货物名称
              "goodsNum": 20.5,             // 货物重量|double
              "goodsUnit": 1,                // 货物重量单位|int 1:吨 2:斤 3:克 4:千克 5:米 6:千米
              "freightPrice": 20.5          // 单位运价，元|double
            }
          ],
          "receivingId": 1,             // 卸货点Id
          "receivingName": "白果",      // 卸货点名称
          "receivingLongitude": 123.30, // 卸货点经度
          "receivingLatitude": 28.08,   // 卸货点维度
          "plateNumber": "闽K888888",   // 车牌号
          "driverUserId": 1,       // 司机用户Id
          "driverUserName": "张三", // 司机用户名
          "driverPhone": "13800000001", // 司机手机号
          "driverCompanyName": "金泽信物流", // 司机所属机构
          "receivingNum": 20.3,         // 卸货重量
          "receivingNo": "QS0012345",   // 签收单号
          "deliveryTime": "2019-03-19T20:08:08",   // 装车时间
          "receivingTime": "2019-03-19T20:08:08",  // 卸货时间
          "createTime": "2019-03-19T20:08:08",     // 创建时间
          "updateTime": "2019-03-19T20:08:08"      // 更新时间
        }, {
          "transportId": 7,                 // 运单Id
          "transportNo": "YD2001",      // 运单编号
          "transportStatus": 6,                  // 运单状态
          "projectId": 1,               // 项目Id|long|must
          "projectName": "成兰一标",   // 项目名称
          "consignmentOrganizationId": 1,             // 托运方Id|long|
          "consignmentOrganizationName": "xx",        // 托运方公司
          "shipmentOrganizationId": 1,              // 承运方Id|long
          "shipmentOrganizationName": "yy",         // 承运方公司
          "prebookingId": 1,                 // 预约单Id
          "deliveryItems": [
            {
              "deliveryId": 1,              // 提货点Id|long
              "deliveryName": "利森水泥厂", // 提货点名称
              "longitude": 119.30,  // 提货点经度
              "latitude": 26.08,    // 提货点维度
              "goodsId": 1,                 // 货物id|long
              "goodsName": 1,               // 货物名称
              "goodsNum": 20.5,             // 货物重量|double
              "goodsUnit": 1,                // 货物重量单位|int 1:吨 2:斤 3:克 4:千克 5:米 6:千米
              "freightPrice": 20.5          // 单位运价，元|double
            }
          ],
          "receivingId": 1,             // 卸货点Id
          "receivingName": "白果",      // 卸货点名称
          "receivingLongitude": 123.30, // 卸货点经度
          "receivingLatitude": 28.08,   // 卸货点维度
          "plateNumber": "闽K888888",   // 车牌号
          "driverUserId": 1,       // 司机用户Id
          "driverUserName": "张三", // 司机用户名
          "driverPhone": "13800000001", // 司机手机号
          "driverCompanyName": "金泽信物流", // 司机所属机构
          "receivingNum": 20.3,         // 卸货重量
          "receivingNo": "QS0012345",   // 签收单号
          "deliveryTime": "2019-03-19T20:08:08",   // 装车时间
          "receivingTime": "2019-03-19T20:08:08",  // 卸货时间
          "createTime": "2019-03-19T20:08:08",     // 创建时间
          "updateTime": "2019-03-19T20:08:08"      // 更新时间
        }, {
          "transportId": 8,                 // 运单Id
          "transportNo": "YD2001",      // 运单编号
          "transportStatus": 7,                  // 运单状态
          "projectId": 1,               // 项目Id|long|must
          "projectName": "成兰一标",   // 项目名称
          "consignmentOrganizationId": 1,             // 托运方Id|long|
          "consignmentOrganizationName": "xx",        // 托运方公司
          "shipmentOrganizationId": 1,              // 承运方Id|long
          "shipmentOrganizationName": "yy",         // 承运方公司
          "prebookingId": 1,                 // 预约单Id
          "deliveryItems": [
            {
              "deliveryId": 1,              // 提货点Id|long
              "deliveryName": "利森水泥厂", // 提货点名称
              "longitude": 119.30,  // 提货点经度
              "latitude": 26.08,    // 提货点维度
              "goodsId": 1,                 // 货物id|long
              "goodsName": 1,               // 货物名称
              "goodsNum": 20.5,             // 货物重量|double
              "goodsUnit": 1,                // 货物重量单位|int 1:吨 2:斤 3:克 4:千克 5:米 6:千米
              "freightPrice": 20.5          // 单位运价，元|double
            }
          ],
          "receivingId": 1,             // 卸货点Id
          "receivingName": "白果",      // 卸货点名称
          "receivingLongitude": 123.30, // 卸货点经度
          "receivingLatitude": 28.08,   // 卸货点维度
          "plateNumber": "闽K888888",   // 车牌号
          "driverUserId": 1,       // 司机用户Id
          "driverUserName": "张三", // 司机用户名
          "driverPhone": "13800000001", // 司机手机号
          "driverCompanyName": "金泽信物流", // 司机所属机构
          "receivingNum": 20.3,         // 卸货重量
          "receivingNo": "QS0012345",   // 签收单号
          "deliveryTime": "2019-03-19T20:08:08",   // 装车时间
          "receivingTime": "2019-03-19T20:08:08",  // 卸货时间
          "createTime": "2019-03-19T20:08:08",     // 创建时间
          "updateTime": "2019-03-19T20:08:08"      // 更新时间
        }
      ]
    })
  },
}
