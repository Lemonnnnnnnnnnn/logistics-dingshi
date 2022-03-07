// 代码中会兼容本地 service mock 以及部署站点的静态数据
export default {
  'POST /authcreate': (req, res) => {
    res.json({"accessToken":"eyJhbGciOiJIUzUxMiJ9.eyJzdWIiOiI2MTI4NzcxNDY0ODY1MzEiLCJpc3MiOiJodHRwczovL2RzLmlvIiwic2NvcGVzIjoiQ09OU0lHTk1FTlQiLCJleHAiOjE2NDYzNzU1NDcsImlhdCI6MTYzNzczNTU0N30.xau8oWHk5n7CSlDz5tenkmZNab55f8kJUTMxNod5VSVS_O4L08WBopMlLr5BrQ4W7v7gQcjXn5lRWqYU9AXLKQ","refreshToken":"eyJhbGciOiJIUzUxMiJ9.eyJzdWIiOiI2MTI4NzcxNDY0ODY1MzEiLCJpc3MiOiJodHRwczovL2RzLmlvIiwic2NvcGVzIjoiQ09OU0lHTk1FTlQiLCJleHAiOjE2NTUwMTU1NDcsImlhdCI6MTYzNzczNTU0N30.KBOzee2v6BkMhpZw0CrazCQXu5Hj_fEg8bdvhisarrXqqRF-tAppdeisjkILv6g_jYmNjJdckms8MAI_2-u5Eg","expiresIn":0,"scope":"CONSIGNMENT","serverTime":1637735547216,"tokenType":"Bearer","organizationId":612877146486541,"organizationName":"易键达托运测试物流有限公司","organizationType":4,"nickName":"易键达托运测试物流有限公司","portraitDentryid":null,"isNewUser":false,"isFillInfo":true,"auditStatus":1,"accountType":1})
  },
  // 支持值为 Object 和 Array
  'POST /api/login': (req, res) => {
    res.send({
      name: 'Serati Ma',
      avatar: 'https://gw.alipayobjects.com/zos/rmsportal/BiazfanxmamNRoxxVxka.png',
      userid: '00000001',
      email: 'antdesign@alipay.com',
      signature: '海纳百川，有容乃大',
      title: '交互专家',
      group: '蚂蚁金服－某某某事业群－某某平台部－某某技术部－UED',
      tags: [
        {
          key: '0',
          label: '很有想法的',
        },
        {
          key: '1',
          label: '专注设计',
        },
        {
          key: '2',
          label: '辣~',
        },
        {
          key: '3',
          label: '大长腿',
        },
        {
          key: '4',
          label: '川妹子',
        },
        {
          key: '5',
          label: '海纳百川',
        },
      ],
      notifyCount: 12,
      unreadCount: 11,
      country: 'China',
      geographic: {
        province: {
          label: '浙江省',
          key: '330000',
        },
        city: {
          label: '杭州市',
          key: '330100',
        },
      },
      address: '西湖区工专路 77 号',
      phone: '0752-268888888',
    })
  },
  'GET /api/currentUser': {
    name: 'Serati Ma',
    avatar: 'https://gw.alipayobjects.com/zos/rmsportal/BiazfanxmamNRoxxVxka.png',
    userid: '00000001',
    email: 'antdesign@alipay.com',
    signature: '海纳百川，有容乃大',
    title: '交互专家',
    group: '蚂蚁金服－某某某事业群－某某平台部－某某技术部－UED',
    tags: [
      {
        key: '0',
        label: '很有想法的',
      },
      {
        key: '1',
        label: '专注设计',
      },
      {
        key: '2',
        label: '辣~',
      },
      {
        key: '3',
        label: '大长腿',
      },
      {
        key: '4',
        label: '川妹子',
      },
      {
        key: '5',
        label: '海纳百川',
      },
    ],
    notifyCount: 12,
    unreadCount: 11,
    country: 'China',
    geographic: {
      province: {
        label: '浙江省',
        key: '330000',
      },
      city: {
        label: '杭州市',
        key: '330100',
      },
    },
    address: '西湖区工专路 77 号',
    phone: '0752-268888888',
  },
  // GET POST 可省略
  'GET /api/users': [
    {
      key: '1',
      name: 'John Brown',
      age: 32,
      address: 'New York No. 1 Lake Park',
    },
    {
      key: '2',
      name: 'Jim Green',
      age: 42,
      address: 'London No. 1 Lake Park',
    },
    {
      key: '3',
      name: 'Joe Black',
      age: 32,
      address: 'Sidney No. 1 Lake Park',
    },
  ],
  'POST /api/login/account': (req, res) => {
    const { password, userName, type } = req.body;
    if (password === 'ant.design' && userName === 'admin') {
      res.send({
        status: 'ok',
        type,
        currentAuthority: 'admin',
      });
      return;
    }
    if (password === 'ant.design' && userName === 'user') {
      res.send({
        status: 'ok',
        type,
        currentAuthority: 'user',
      });
      return;
    }
    res.send({
      status: 'error',
      type,
      currentAuthority: 'guest',
    });
  },
  'POST /api/register': (req, res) => {
    res.send({ status: 'ok', currentAuthority: 'user' });
  },
  'GET /api/500': (req, res) => {
    res.status(500).send({
      timestamp: 1513932555104,
      status: 500,
      error: 'error',
      message: 'error',
      path: '/base/category/list',
    });
  },
  'GET /api/404': (req, res) => {
    res.status(404).send({
      timestamp: 1513932643431,
      status: 404,
      error: 'Not Found',
      message: 'No message available',
      path: '/base/category/list/2121212',
    });
  },
  'GET /api/403': (req, res) => {
    res.status(403).send({
      timestamp: 1513932555104,
      status: 403,
      error: 'Unauthorized',
      message: 'Unauthorized',
      path: '/base/category/list',
    });
  },
  'GET /api/401': (req, res) => {
    res.status(401).send({
      timestamp: 1513932555104,
      status: 401,
      error: 'Unauthorized',
      message: 'Unauthorized',
      path: '/base/category/list',
    });
  },
  'GET /v1/user/permissions': (req, res) => {
    res.json({"count":null,"items":[{"permissionId":1066,"permissionCode":"02","permissionName":"用户设置","permissionType":1,"permissionUrl":"haha.html"},{"permissionId":1067,"permissionCode":"0201","permissionName":"系统角色","permissionType":2,"permissionUrl":"haha.html"},{"permissionId":1068,"permissionCode":"020101","permissionName":"浏览","permissionType":3,"permissionUrl":"haha.html"},{"permissionId":1069,"permissionCode":"020102","permissionName":"创建","permissionType":3,"permissionUrl":"haha.html"},{"permissionId":1070,"permissionCode":"020103","permissionName":"修改","permissionType":3,"permissionUrl":"haha.html"},{"permissionId":1071,"permissionCode":"020104","permissionName":"禁用","permissionType":3,"permissionUrl":"haha.html"},{"permissionId":1072,"permissionCode":"020105","permissionName":"启用","permissionType":3,"permissionUrl":"haha.html"},{"permissionId":1073,"permissionCode":"020106","permissionName":"删除","permissionType":3,"permissionUrl":"haha.html"},{"permissionId":1074,"permissionCode":"020107","permissionName":"角色赋权","permissionType":3,"permissionUrl":"haha.html"},{"permissionId":1075,"permissionCode":"0202","permissionName":"用户管理","permissionType":2,"permissionUrl":"haha.html"},{"permissionId":1076,"permissionCode":"020201","permissionName":"浏览","permissionType":3,"permissionUrl":"haha.html"},{"permissionId":1077,"permissionCode":"020202","permissionName":"创建","permissionType":3,"permissionUrl":"haha.html"},{"permissionId":1078,"permissionCode":"020203","permissionName":"修改","permissionType":3,"permissionUrl":"haha.html"},{"permissionId":1079,"permissionCode":"020204","permissionName":"禁用","permissionType":3,"permissionUrl":"haha.html"},{"permissionId":1080,"permissionCode":"020205","permissionName":"启用","permissionType":3,"permissionUrl":"haha.html"},{"permissionId":1081,"permissionCode":"020206","permissionName":"审核","permissionType":3,"permissionUrl":"haha.html"},{"permissionId":1082,"permissionCode":"020207","permissionName":"删除","permissionType":3,"permissionUrl":"haha.html"},{"permissionId":1083,"permissionCode":"03","permissionName":"基础设置","permissionType":1,"permissionUrl":"haha.html"},{"permissionId":1084,"permissionCode":"0301","permissionName":"货权方管理","permissionType":2,"permissionUrl":"haha.html"},{"permissionId":1085,"permissionCode":"030101","permissionName":"浏览","permissionType":3,"permissionUrl":"haha.html"},{"permissionId":1086,"permissionCode":"030102","permissionName":"添加","permissionType":3,"permissionUrl":"haha.html"},{"permissionId":1087,"permissionCode":"030103","permissionName":"删除","permissionType":3,"permissionUrl":"haha.html"},{"permissionId":1088,"permissionCode":"0302","permissionName":"承运方管理","permissionType":2,"permissionUrl":"haha.html"},{"permissionId":1089,"permissionCode":"030201","permissionName":"浏览","permissionType":3,"permissionUrl":"haha.html"},{"permissionId":1090,"permissionCode":"030202","permissionName":"添加","permissionType":3,"permissionUrl":"haha.html"},{"permissionId":1091,"permissionCode":"030203","permissionName":"删除","permissionType":3,"permissionUrl":"haha.html"},{"permissionId":1100,"permissionCode":"0305","permissionName":"常用货品","permissionType":2,"permissionUrl":"haha.html"},{"permissionId":1101,"permissionCode":"030501","permissionName":"浏览","permissionType":3,"permissionUrl":"haha.html"},{"permissionId":1102,"permissionCode":"030502","permissionName":"创建","permissionType":3,"permissionUrl":"haha.html"},{"permissionId":1103,"permissionCode":"030503","permissionName":"修改","permissionType":3,"permissionUrl":"haha.html"},{"permissionId":1104,"permissionCode":"030504","permissionName":"删除","permissionType":3,"permissionUrl":"haha.html"},{"permissionId":1105,"permissionCode":"0306","permissionName":"提货点管理","permissionType":2,"permissionUrl":"haha.html"},{"permissionId":1106,"permissionCode":"030601","permissionName":"浏览","permissionType":3,"permissionUrl":"haha.html"},{"permissionId":1107,"permissionCode":"030602","permissionName":"创建","permissionType":3,"permissionUrl":"haha.html"},{"permissionId":1108,"permissionCode":"030603","permissionName":"修改","permissionType":3,"permissionUrl":"haha.html"},{"permissionId":1109,"permissionCode":"030604","permissionName":"禁用","permissionType":3,"permissionUrl":"haha.html"},{"permissionId":1110,"permissionCode":"030605","permissionName":"启用","permissionType":3,"permissionUrl":"haha.html"},{"permissionId":1111,"permissionCode":"030606","permissionName":"删除","permissionType":3,"permissionUrl":"haha.html"},{"permissionId":1112,"permissionCode":"0307","permissionName":"卸货点管理","permissionType":2,"permissionUrl":"haha.html"},{"permissionId":1113,"permissionCode":"030701","permissionName":"浏览","permissionType":3,"permissionUrl":"haha.html"},{"permissionId":1114,"permissionCode":"030702","permissionName":"创建","permissionType":3,"permissionUrl":"haha.html"},{"permissionId":1115,"permissionCode":"030703","permissionName":"修改","permissionType":3,"permissionUrl":"haha.html"},{"permissionId":1116,"permissionCode":"030704","permissionName":"禁用","permissionType":3,"permissionUrl":"haha.html"},{"permissionId":1117,"permissionCode":"030705","permissionName":"启用","permissionType":3,"permissionUrl":"haha.html"},{"permissionId":1118,"permissionCode":"030706","permissionName":"删除","permissionType":3,"permissionUrl":"haha.html"},{"permissionId":1126,"permissionCode":"04","permissionName":"业务中心","permissionType":1,"permissionUrl":"haha.html"},{"permissionId":1127,"permissionCode":"0401","permissionName":"项目管理","permissionType":2,"permissionUrl":"haha.html"},{"permissionId":1128,"permissionCode":"040101","permissionName":"浏览","permissionType":3,"permissionUrl":"haha.html"},{"permissionId":1129,"permissionCode":"040102","permissionName":"创建","permissionType":3,"permissionUrl":"haha.html"},{"permissionId":1130,"permissionCode":"040103","permissionName":"修改","permissionType":3,"permissionUrl":"haha.html"},{"permissionId":1131,"permissionCode":"040104","permissionName":"禁用","permissionType":3,"permissionUrl":"haha.html"},{"permissionId":1132,"permissionCode":"040105","permissionName":"启用","permissionType":3,"permissionUrl":"haha.html"},{"permissionId":1133,"permissionCode":"040106","permissionName":"删除","permissionType":3,"permissionUrl":"haha.html"},{"permissionId":1139,"permissionCode":"0402","permissionName":"预约单管理","permissionType":2,"permissionUrl":"haha.html"},{"permissionId":1140,"permissionCode":"040201","permissionName":"浏览","permissionType":3,"permissionUrl":"haha.html"},{"permissionId":1141,"permissionCode":"040202","permissionName":"创建","permissionType":3,"permissionUrl":"haha.html"},{"permissionId":1142,"permissionCode":"040203","permissionName":"修改","permissionType":3,"permissionUrl":"haha.html"},{"permissionId":1143,"permissionCode":"040204","permissionName":"删除","permissionType":3,"permissionUrl":"haha.html"},{"permissionId":1144,"permissionCode":"040205","permissionName":"取消","permissionType":3,"permissionUrl":"haha.html"},{"permissionId":1145,"permissionCode":"040206","permissionName":"完结","permissionType":3,"permissionUrl":"haha.html"},{"permissionId":1151,"permissionCode":"0404","permissionName":"运单管理","permissionType":2,"permissionUrl":"haha.html"},{"permissionId":1152,"permissionCode":"040401","permissionName":"浏览","permissionType":3,"permissionUrl":"haha.html"},{"permissionId":1155,"permissionCode":"040404","permissionName":"审核回单","permissionType":3,"permissionUrl":"haha.html"},{"permissionId":1218,"permissionCode":"06","permissionName":"个人中心","permissionType":1,"permissionUrl":"haha.html"},{"permissionId":1219,"permissionCode":"0601","permissionName":"我的评价","permissionType":2,"permissionUrl":"haha.html"},{"permissionId":1220,"permissionCode":"0602","permissionName":"我的配置","permissionType":2,"permissionUrl":"haha.html"},{"permissionId":1221,"permissionCode":"0603","permissionName":"操作日志","permissionType":2,"permissionUrl":"haha.html"},{"permissionId":1222,"permissionCode":"0604","permissionName":"认证信息","permissionType":2,"permissionUrl":"haha.html"},{"permissionId":1223,"permissionCode":"060401","permissionName":"修改","permissionType":3,"permissionUrl":"haha.html"},{"permissionId":1254,"permissionCode":"0504","permissionName":"托运对货权发起对账","permissionType":2,"permissionUrl":"haha.html"},{"permissionId":1255,"permissionCode":"050401","permissionName":"浏览","permissionType":3,"permissionUrl":"haha.html"},{"permissionId":1256,"permissionCode":"050402","permissionName":"创建","permissionType":3,"permissionUrl":"haha.html"},{"permissionId":1257,"permissionCode":"050403","permissionName":"修改","permissionType":3,"permissionUrl":"haha.html"},{"permissionId":1258,"permissionCode":"050404","permissionName":"作废","permissionType":3,"permissionUrl":"haha.html"},{"permissionId":1260,"permissionCode":"050406","permissionName":"调账","permissionType":3,"permissionUrl":"haha.html"},{"permissionId":1261,"permissionCode":"050407","permissionName":"导出签收单为PDF","permissionType":3,"permissionUrl":"haha.html"},{"permissionId":1262,"permissionCode":"050408","permissionName":"导出excel","permissionType":3,"permissionUrl":"haha.html"},{"permissionId":1263,"permissionCode":"050409","permissionName":"导出运单明细","permissionType":3,"permissionUrl":"haha.html"},{"permissionId":1269,"permissionCode":"0506","permissionName":"托运审核平台对账","permissionType":2,"permissionUrl":"haha.html"},{"permissionId":1270,"permissionCode":"050601","permissionName":"浏览","permissionType":3,"permissionUrl":"haha.html"},{"permissionId":1271,"permissionCode":"050602","permissionName":"导出excel","permissionType":3,"permissionUrl":"haha.html"},{"permissionId":1272,"permissionCode":"050603","permissionName":"导出运单明细","permissionType":3,"permissionUrl":"haha.html"},{"permissionId":1273,"permissionCode":"050604","permissionName":"审核","permissionType":3,"permissionUrl":"haha.html"},{"permissionId":1274,"permissionCode":"0507","permissionName":"托运审核承运对账","permissionType":2,"permissionUrl":"haha.html"},{"permissionId":1275,"permissionCode":"050701","permissionName":"浏览","permissionType":3,"permissionUrl":"haha.html"},{"permissionId":1276,"permissionCode":"050702","permissionName":"导出excel","permissionType":3,"permissionUrl":"haha.html"},{"permissionId":1277,"permissionCode":"050703","permissionName":"导出运单明细","permissionType":3,"permissionUrl":"haha.html"},{"permissionId":1278,"permissionCode":"050704","permissionName":"审核","permissionType":3,"permissionUrl":"haha.html"},{"permissionId":1284,"permissionCode":"05","permissionName":"对账结算","permissionType":1,"permissionUrl":"haha.html"},{"permissionId":1300,"permissionCode":"07","permissionName":"报表统计","permissionType":1,"permissionUrl":"haha.html"},{"permissionId":1301,"permissionCode":"0701","permissionName":"发货统计","permissionType":2,"permissionUrl":"haha.html"},{"permissionId":1302,"permissionCode":"070101","permissionName":"浏览","permissionType":3,"permissionUrl":"haha.html"},{"permissionId":1303,"permissionCode":"070102","permissionName":"导出excel","permissionType":3,"permissionUrl":"haha.html"},{"permissionId":1310,"permissionCode":"0405","permissionName":"要货计划单","permissionType":2,"permissionUrl":"haha.html"},{"permissionId":1311,"permissionCode":"040501","permissionName":"浏览","permissionType":3,"permissionUrl":"haha.html"},{"permissionId":1314,"permissionCode":"040504","permissionName":"审核","permissionType":3,"permissionUrl":"haha.html"},{"permissionId":1316,"permissionCode":"0310","permissionName":"客户管理","permissionType":2,"permissionUrl":"haha.html"},{"permissionId":1317,"permissionCode":"031001","permissionName":"浏览","permissionType":3,"permissionUrl":"haha.html"},{"permissionId":1318,"permissionCode":"031002","permissionName":"添加","permissionType":3,"permissionUrl":"haha.html"},{"permissionId":1319,"permissionCode":"031003","permissionName":"删除","permissionType":3,"permissionUrl":"haha.html"},{"permissionId":1331,"permissionCode":"0509","permissionName":"付款单","permissionType":2,"permissionUrl":"haha.html"},{"permissionId":1332,"permissionCode":"050901","permissionName":"浏览","permissionType":3,"permissionUrl":"haha.html"},{"permissionId":1333,"permissionCode":"050902","permissionName":"创建","permissionType":3,"permissionUrl":"haha.html"},{"permissionId":1334,"permissionCode":"050903","permissionName":"作废","permissionType":3,"permissionUrl":"haha.html"},{"permissionId":1335,"permissionCode":"050904","permissionName":"支付","permissionType":3,"permissionUrl":"haha.html"},{"permissionId":1336,"permissionCode":"050905","permissionName":"导出excel","permissionType":3,"permissionUrl":"haha.html"},{"permissionId":1337,"permissionCode":"050906","permissionName":"导出付款单明细","permissionType":3,"permissionUrl":"haha.html"},{"permissionId":1338,"permissionCode":"050907","permissionName":"查看支付凭证","permissionType":3,"permissionUrl":"haha.html"},{"permissionId":1339,"permissionCode":"08","permissionName":"开票管理","permissionType":1,"permissionUrl":"haha.html"},{"permissionId":1340,"permissionCode":"0801","permissionName":"物流开票","permissionType":2,"permissionUrl":"haha.html"},{"permissionId":1341,"permissionCode":"080101","permissionName":"浏览","permissionType":3,"permissionUrl":"haha.html"},{"permissionId":1342,"permissionCode":"080102","permissionName":"创建","permissionType":3,"permissionUrl":"haha.html"},{"permissionId":1343,"permissionCode":"080103","permissionName":"修改","permissionType":3,"permissionUrl":"haha.html"},{"permissionId":1344,"permissionCode":"080104","permissionName":"作废","permissionType":3,"permissionUrl":"haha.html"},{"permissionId":1345,"permissionCode":"080105","permissionName":"提交申请","permissionType":3,"permissionUrl":"haha.html"},{"permissionId":1347,"permissionCode":"080107","permissionName":"导出明细","permissionType":3,"permissionUrl":"haha.html"},{"permissionId":1349,"permissionCode":"09","permissionName":"资金管理","permissionType":1,"permissionUrl":"haha.html"},{"permissionId":1365,"permissionCode":"0905","permissionName":"我的资金","permissionType":2,"permissionUrl":"haha.html"},{"permissionId":1366,"permissionCode":"090501","permissionName":"浏览","permissionType":3,"permissionUrl":"haha.html"},{"permissionId":1367,"permissionCode":"090502","permissionName":"修改","permissionType":3,"permissionUrl":"haha.html"},{"permissionId":1368,"permissionCode":"090503","permissionName":"充值","permissionType":3,"permissionUrl":"haha.html"},{"permissionId":1369,"permissionCode":"090504","permissionName":"收支记录","permissionType":3,"permissionUrl":"haha.html"},{"permissionId":1370,"permissionCode":"090505","permissionName":"导出excel","permissionType":3,"permissionUrl":"haha.html"},{"permissionId":1426,"permissionCode":"060201","permissionName":"账户安全","permissionType":3,"permissionUrl":"haha.html"},{"permissionId":1427,"permissionCode":"060202","permissionName":"用户指南","permissionType":3,"permissionUrl":"haha.html"},{"permissionId":1428,"permissionCode":"060203","permissionName":"法律条款","permissionType":3,"permissionUrl":"haha.html"},{"permissionId":1429,"permissionCode":"060204","permissionName":"用户协议","permissionType":3,"permissionUrl":"haha.html"},{"permissionId":1440,"permissionCode":"0512","permissionName":"托运对平台发起对账","permissionType":2,"permissionUrl":"haha.html"},{"permissionId":1441,"permissionCode":"051201","permissionName":"浏览","permissionType":3,"permissionUrl":"haha.html"},{"permissionId":1442,"permissionCode":"051202","permissionName":"创建","permissionType":3,"permissionUrl":"haha.html"},{"permissionId":1443,"permissionCode":"051203","permissionName":"修改","permissionType":3,"permissionUrl":"haha.html"},{"permissionId":1444,"permissionCode":"051204","permissionName":"作废","permissionType":3,"permissionUrl":"haha.html"},{"permissionId":1445,"permissionCode":"051205","permissionName":"调账","permissionType":3,"permissionUrl":"haha.html"},{"permissionId":1446,"permissionCode":"051206","permissionName":"导出签收单为PDF","permissionType":3,"permissionUrl":"haha.html"},{"permissionId":1447,"permissionCode":"051207","permissionName":"导出excel","permissionType":3,"permissionUrl":"haha.html"},{"permissionId":1448,"permissionCode":"051208","permissionName":"导出运单明细","permissionType":3,"permissionUrl":"haha.html"},{"permissionId":1462,"permissionCode":"090506","permissionName":"申请退款","permissionType":3,"permissionUrl":"haha.html"},{"permissionId":1505,"permissionCode":"0514","permissionName":"出库对账单","permissionType":2,"permissionUrl":"haha.html"},{"permissionId":1506,"permissionCode":"051401","permissionName":"浏览","permissionType":3,"permissionUrl":"haha.html"},{"permissionId":1507,"permissionCode":"051402","permissionName":"创建","permissionType":3,"permissionUrl":"haha.html"},{"permissionId":1510,"permissionCode":"051405","permissionName":"导出excel","permissionType":3,"permissionUrl":"haha.html"},{"permissionId":1515,"permissionCode":"0406","permissionName":"交票清单","permissionType":2,"permissionUrl":"haha.html"},{"permissionId":1516,"permissionCode":"040601","permissionName":"浏览","permissionType":3,"permissionUrl":"haha.html"},{"permissionId":1524,"permissionCode":"040609","permissionName":"签收","permissionType":3,"permissionUrl":"haha.html"},{"permissionId":1526,"permissionCode":"040611","permissionName":"导出excel","permissionType":3,"permissionUrl":"haha.html"}]})
  },
  'GET /v1/users/now': (req, res) => {
    res.json({"userId":612877146486531,"nickName":"易键达托运测试物流有限公司","userName":"易键达托运测试物流有限公司","sex":1,"phone":"13666666671","organizationId":612877146486541,"isAvailable":true,"createTime":"2021-08-24T17:47:31.000+08:00","updateTime":null,"accountType":1,"idcardNo":null,"licenseType":null,"licenseDentryid":null,"feedbackRate":null,"fixtureNumber":null,"qualificationCertificateDentryid":null,"idcardFrontDentryid":null,"idcardBackDentryid":null,"auditStatus":null,"remarks":null,"organizationName":"易键达托运测试物流有限公司","licenseNo":null,"qualificationUnit":null,"qualificationValidityDate":null,"licenseValidityDate":null,"licenseFrontDentryid":null,"licenseViceDentryid":null,"qualificationFrontDentryid":null,"qualificationBackDentryid":null,"driverFrontDentryid":null,"driverIdcardDentryid":null,"createUserId":null,"updateUserId":null,"portraitDentryid":null,"orgDriverId":null,"driverContractDentryid":null,"driverContractNo":null,"perfectStatus":null,"roleItems":[{"roleId":10002,"baseRoleId":10001,"roleCode":"consignment","roleName":"托运方","organizationId":1,"createTime":"2019-01-15T15:16:25.000+08:00","updateTime":"2020-06-04T16:27:36.000+08:00","isAvailable":true,"remarks":"这是备注","userItems":null}],"bankAccountItems":[{"bankAccountId":612896070239232,"bankAccount":"6212261535239872222","userId":612877146486531,"bankName":"中国建设银行成都支行","bankCode":null,"createTime":"2021-08-24T18:01:35.000+08:00","createUserId":612877146486531,"updateTime":"2021-08-24T18:01:35.000+08:00","updateUserId":612877146486531,"isAvailable":true,"isEffect":1,"bankDentryid":null,"province":null,"city":null,"isApprove":1,"cardAccountType":1,"invoiceTitle":"易键达托运测试物流有限公司","invoiceNo":"91330000682900555M","organizationId":612877146486541,"nickName":null,"idcardNo":null,"bankAccountBalance":null}],"driverCertificationEntities":null,"driverContractEventEntities":null,"idCardSex":null,"idCardAddress":null,"idIssuingAuthority":null,"idValidityDate":null,"licenseValidityType":null})
  }
};
