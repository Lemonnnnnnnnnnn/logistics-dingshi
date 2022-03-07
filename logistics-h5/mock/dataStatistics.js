const getProjectBoard = (req, res) =>
  res.json({
    'planNum': 34,               // 计划量
    'goingNum': 23,              // 在途量
    'handOverNum': 45,           // 交付量
    'dayGrowthRate': 56,         // 日均交付增长率
    'goingTransport': 2,        // 在途运单
    'completeTransport': 3,     // 完成运单
    'projectBoardDetailResps': [   // 项目看板明细列表
      {
        'projectId': 633035916768256,     // 项目id
        'projectName': '提货需要审核',   // 项目名称
        'planNum': 34,       // 计划量
        'goingNum': 23,      // 在途量
        'handOverNum': 11,   // 交付量
        'dayGrowthRate': 27, // 日均交付增长率
      },
      {
        'projectId': 630877519787520,     // 项目id
        'projectName': '砂石合同',   // 项目名称
        'planNum': 32,       // 计划量
        'goingNum': 13,      // 在途量
        'handOverNum': 10,   // 交付量
        'dayGrowthRate': 17, // 日均交付增长率
      },
      {
        'projectId': 628808834163968,     // 项目id
        'projectName': 'xycs',   // 项目名称
        'planNum': 12,       // 计划量
        'goingNum': 3,      // 在途量
        'handOverNum': 1,   // 交付量
        'dayGrowthRate': 7, // 日均交付增长率
      },
    ],
  });


const getProjectBoardSingle = (req, res) =>
  res.json({
    'projectId': 630877519787520,    // 项目id
    'projectName': '砂石合同',  // 项目名称
    'planNum': 32,       // 计划量
    'goingNum': 13,      // 在途量
    'handOverNum': 10,   // 交付量
    'dayGrowthRate': 17, // 日均交付增长率
    'goingTransport': 2,        // 在途运单
    'completeTransport': 3,     // 完成运单
    'boardDayDataResps': [ // 近日数据统计
      {
        'dayType': 1,      // 查询日期类型 1.近14天 2.近6个月
        'planNum': 23,      // 计划量
        'handOverNum': 33,  // 交付量
        'dayPlanNum': 34,   // 日均计划
        'dayHandOverNum': 23, // 日均交付
        'planNumMax': 22,     // 计划峰值
        'handOverNumMax': 22, // 交付峰值
        'planNumMin': 2,     // 计划最少
        'handOverNumMin': 3, // 交付最少
        'transportNum': 4,   // 运单数
        'diagramDataRespList': [ // 项目看板曲线图数据列表
          {
            'monthDate': '2021-02-12',      // 时间
            'planNum': 12,      // 计划量
            'handOverNum': 14,  // 交付量
          },
          {
            'monthDate': '2021-02-13',      // 时间
            'planNum': 32,      // 计划量
            'handOverNum': 34,  // 交付量
          },
          {
            'monthDate': '2021-02-14',      // 时间
            'planNum': 42,      // 计划量
            'handOverNum': 44,  // 交付量
          },
        ],
      },
      {
        'dayType': 2,      // 查询日期类型 1.近14天 2.近6个月
        'planNum': 23,      // 计划量
        'handOverNum': 33,  // 交付量
        'dayPlanNum': 34,   // 日均计划
        'dayHandOverNum': 23, // 日均交付
        'planNumMax': 22,     // 计划峰值
        'handOverNumMax': 22, // 交付峰值
        'planNumMin': 2,     // 计划最少
        'handOverNumMin': 3, // 交付最少
        'transportNum': 4,   // 运单数
        'diagramDataRespList': [ // 项目看板曲线图数据列表
          {
            'monthDate': '2021-02-14',        // 时间
            'planNum': 32,      // 计划量
            'handOverNum': 34,  // 交付量
          },
          {
            'monthDate': '2021-02-16',        // 时间
            'planNum': 32,      // 计划量
            'handOverNum': 34,  // 交付量
          },
          {
            'monthDate': '2021-02-18',        // 时间
            'planNum': 32,      // 计划量
            'handOverNum': 34,  // 交付量
          },
        ],
      },
    ],
  });


const getProjectAttentions = (req, res) =>
  res.json({
    "projectAttentionResps": [  // 关注的项目列表
      {
        "projectId": 1,     // 项目id
        "projectName": "sd"  // 项目名称
      }
    ],
    "projectNotAttentionResps": [  // 未关注的项目列表
      {
        "projectId": 1,
        "projectName": "sd"
      }
    ]
  });

const PostProjectAttentions=(req, res)=>{
  res.json({
    success:true
  })
}

const DelProjectAttentions=(req, res)=>{
  res.json({
    success:true
  })
}

export default {
  /**
   * createDateStart:2019/01/15 00:00:00 // 起始时间
     createDateEnd:2019/01/15 23:59:59 // 结束时间
   */
  'GET /v1/projectBoard': getProjectBoard,


  /**
   * createDateStart:2019/01/15 00:00:00 // 起始时间
     createDateEnd:2019/01/15 23:59:59 // 结束时间
     projectId:12 //项目id
   */
  'GET /v1/projectBoard/single': getProjectBoardSingle,


  /**
   * 无传入参数
   */
  'GET /v1/projectAttentions': getProjectAttentions,

  /**
   * projectIdList:12,123 // 项目ID集合
   */
  'POST /v1/projectAttentions': PostProjectAttentions,

  /**
   * projectIdList:12,123 // 项目ID集合
   */
  'DELETE /v1/projectAttentions': DelProjectAttentions,
};
