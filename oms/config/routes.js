import auth from "../src/constants/authCodes";

const {
  BUINESS,
  PROJECT,
  PROJECT_CREATE,
  PROJECT_VISIT,
  PREBOOKING,
  PREBOOKING_VISIT,
  PREBOOKING_CREATE,
  DISPATCH_VISTI,
  TRANSPORT,
  TRANSPORT_VISIT,
  BASIC_SETTING,
  DELIVERY_SETTING,
  RECEIVING_SETTING,
  CATEGORY_SETTING,
  GOODS_SETTING,
  SHIPMENT_SETTING,
  CARGO_SETTING,
  DRIVER_SETTING,
  DRIVER_SETTING_VISIT,
  DRIVER_SETTING_CREATE,
  CAR_SETTING_VISIT,
  CAR_SETTING,
  CAR_SETTING_CREATE,
  BANK_SETTING,
  DISPATCH,
  AUTH_CENTER,
  CARGO_AUTH,
  CONSIGNMENT_AUTH,
  SHIPMENT_AUTH,
  DRIVER_AUTH,
  CAR_AUTH,
  CARGO_JUDGE,
  CONSIGNMENT_JUDGE,
  SHIPMENT_JUDGE,
  DRIVER_JUDGE,
  CAR_JUDGE,
  CARGO_LIST_AUTH,
  CONSIGNMENT_LIST_AUTH,
  SHIPMENT_LIST_AUTH,
  DRIVER_LIST_AUTH,
  CAR_LIST_AUTH,
  USER,
  USER_SETTING,
  ROLE_SETTING,
  ROLE_SETTING_CREATE,
  ROLE_SETTING_MODIFY,
  PAY_SETTING,
  TRANSPORT_MODIFY,
  STATISTCS_REPORT,
  STATISTCS_REPORT_VISIT,
  CUSTOMER_SETTING,
  CONSIGNMENT_SETTING,
  GOODSPLAN,
  GOODSPLAN_VISIT,
  GROUP_SETTING,
  BUSINESS_TYPE_SETTING,
  LOGISTICS_TYPE_SETTING,
  TRANSPORT_SUPPLEMENT_ORDER,

  DATA_ANALYSIS,
  BUSINESS_BOARD,
  PAY_BILL,
  PAY_BILL_VISIT,
  PAY_BILL_CREATE,
  INVOICE_MANAGE,
  SHIPMENT_INVOICE,
  CONSIGNMENT_INVOICE,
  INVOICE_CREATE,
  INVOICE_MODIFY,
  CONTRACT_MANAGE,
  TRANSPORT_CONTRACT,
  FUNDS,
  FUNDS_CUSTOMER,
  FUNDS_INSIDETRANSFER,
  FUNDS_BUSINESS_DEALINGS,
  FUNDS_MANAGE,
  FUNDS_MANAGE_FUND_RECORD,
  BANK_FLOWING,
  PLAT_REFUND,
  CUSTOMER_BALANCE,
  ACCOUNT_SEARCH,
  UNRECORDED_FUNDS,
  //出库对账管理
  OUTBOUND_ACCOUNT,
  CONSIGNMENT_OUTBOUND_ACCOUNT_VISIT,
  SHIPMENT_OUTBOUND_ACCOUNT_VISIT,
  OUTBOUND_ACCOUNT_CREATE,

  //交票清单权限

  DELIVERY_LIST, // 交票清单
  DELIVERY_LIST_NEW, // 创建
  DELIVERY_LIST_PRINT, // 打印

  // 大屏权限

  BIG_SCREEN,

  // 设备管理权限
  DEVICE_MANAGE,
  GPS_ACCOUNT_MANAGE,
  GPS_DEVICE_MANAGE,
  DEVICE_RENT_MANAGE,

  // 供应商管理权限
  SUPPLIER_MANAGE,

  TAX_RATE_CONFIG_LISt,
  WITHHOLDING_MANAGE_LIST,
  WITHHOLDING_MANAGE_MONTH,
  WITHHOLDING_MANAGE_PERSONNEL,

  /*----------------- 对账权限 -------------*/
  ACCOUNT,
  CARGO_TO_CONSIGNMENT_ACCOUNT,
  CARGO_TO_CONSIGNMENT_ACCOUNT_VISIT,
  CARGO_TO_CONSIGNMENT_ACCOUNT_AUDITE,
  CARGO_ACCOUNT,
  CARGO_ACCOUNT_VISIT,
  CARGO_ACCOUNT_CREATE,
  CARGO_ACCOUNT_MODIFY,

  SHIPMENT_TO_PLAT_ACCOUNT_ADJUST_BILL,
  SHIPMENT_TO_PLAT_ACCOUNT_CREATE,
  SHIPMENT_TO_PLAT_ACCOUNT,
  SHIPMENT_TO_PLAT_ACCOUNT_VISIT,

  SHIPMENT_AUDIT_NEXT_SHIPMENT_ACCOUNT_EXECUTE,
  SHIPMENT_AUDIT_NEXT_SHIPMENT_ACCOUNT_VISIT,

  SHIPMENT_TO_CONSIGNMENT_ACCOUNT_VISIT,
  SHIPMENT_TO_CONSIGNMENT_ACCOUNT_ADJUST_BILL,
  SHIPMENT_TO_CONSIGNMENT_ACCOUNT_CREATE,
  SHIPMENT_TO_CONSIGNMENT_ACCOUNT,

  PLAT_AUDIT_CONSIGNMENT_ACCOUNT_VISIT,
  PLAT_AUDIT_CONSIGNMENT_ACCOUNT_EXECUTE,
  PLAT_AUDIT_SHIPMENT_ACCOUNT_EXECUTE,
  PLAT_AUDIT_SHIPMENT_ACCOUNT_VISIT,

  PLAT_TO_SHIPMENT_ACCOUNT,
  PLAT_TO_SHIPMENT_ACCOUNT_VISIT,

  CONSIGNMENT_AUDIT_SHIPMENT_ACCOUNT_VISIT,
  CONSIGNMENT_AUDIT_SHIPMENT_ACCOUNT_EXECUTE,
  CONSIGNMENT_TO_PLAT_ACCOUNT_VISIT,
  CONSIGNMENT_TO_PLAT_ACCOUNT_ADJUST_BILL,
  CONSIGNMENT_TO_PLAT_ACCOUNT_CREATE,
  CONSIGNMENT_TO_SHIPMENT_ACCOUNT,
  //  招投标权限

  TENDER_BIDDER_MANAGE, 
  TENDER_MANAGE,
  TENDER_PLATFORM

} = auth;

export default [
  {
    path: '/user',
    component: '../layouts/user-layout',
    routes: [
      { path: 'login', component: './login/login' },
      { path: 'register', component: './registered/index.jsx' },
      { path: 'authentication', component: './authentication/authentication' },
      { path: 'modifyPassword', component: './login/modify-password' },
    ],
  },
  {
    path: '/agreement',
    component: './business-center/project-manage/sub-page/agreement',
  },
  {
    path: '/userAgreement',
    component: './business-center/project-manage/sub-page/user-agreement',
  },
  {
    path: '/contract',
    component: './contract/driver-contract',
  },
  {
    path: '/',
    component: '../layouts/basic-layout',
    routes: [
      { path: '/index', name: '首页', icon: 'bank', component: './index/index'},
      { path: '/', redirect: '/index' },
      {
        path: 'buiness-center',
        name: '业务中心',
        icon: 'profile',
        authority: [BUINESS],
        routes: [
          {
            path: 'project',
            name: '_项目管理',
            authority: [PROJECT],
            skipLevel: true,
            component: '../components/cache-wrap/cache-wrap',
            routes: [
              {
                path: 'projectManagement',
                name: '项目管理',
                icon: 'project',
                authority: [PROJECT],
                component: './business-center/project-manage/project-list',
              },
              {
                path: 'projectManagement/modifyProject',
                name: '配置项目',
                component: './business-center/project-manage/sub-page/modify-project',
                // authority: [PROJECT_CREATE],
                hideInMenu: true,
              },
              {
                path: 'projectManagement/createProject',
                name: '创建合同',
                component: './business-center/project-manage/sub-page/create-project',
                authority: [PROJECT_CREATE],
                hideInMenu: true,
              },
              {
                path : 'projectManagement/templateSelect',
                name : "项目管理-选择业务模板",
                component: './business-center/project-manage/sub-page/template-select',
                authority: [PROJECT_CREATE],
                hideInMenu: true,
              },
              {
                path: 'projectManagement/edit',
                name: '修改合同',
                otherOpen: true, // 是否需要重新打开一个页面
                component: './business-center/project-manage/sub-page/create-project',
                authority: [PROJECT_CREATE],
                hideInMenu: true,
              },
              {
                path: 'projectManagement/setting',
                name: '配置项目',
                component: './basic-setting/add-logistics-transaction',
                // authority: [PROJECT_VISIT],
                hideInMenu: true,
              },
              {
                path: 'projectManagement/projectDetail',
                name: '合同详情',
                component: './business-center/project-manage/sub-page/project-detail',
                authority: [PROJECT_VISIT],
                hideInMenu: true,
              },
             
            ],
          },
          {
            path: 'goodsPlansList',
            name: '_要货计划单',
            authority: [GOODSPLAN],
            skipLevel: true,
            component: '../components/cache-wrap/cache-wrap',
            routes: [
              {
                path: 'goodsPlans',
                name: '要货计划单',
                authority: [GOODSPLAN],
                icon: 'book',
                component: './business-center/goods-plans/goods-plans-list',
              },
              {
                path: 'goodsPlans/goodsplansdetail',
                name: '要货计划单详情',
                authority: [GOODSPLAN_VISIT],
                component: './business-center/goods-plans/goods-plans-detail',
                hideInMenu: true,
              },
            ],
          },
          {
            path: 'preBookingList',
            name: '_预约单',
            authority: [PREBOOKING, DISPATCH],
            skipLevel: true,
            component: '../components/cache-wrap/cache-wrap',
            routes: [
              {
                path: 'preBooking',
                name: '预约单',
                icon: 'calendar',
                authority: [PREBOOKING, DISPATCH],
                component: './business-center/pre-booking/pre-booking-list',
              },
              {
                path: 'preBooking/createPreBooking',
                name: '创建预约单',
                authority: [PREBOOKING_CREATE],
                component: './business-center/pre-booking/sub-page/create-pre-booking',
                hideInMenu: true,
              },
              {
                path: 'preBooking/detail',
                name: '预约单-详情',
                authority: [PREBOOKING_VISIT],
                component: './business-center/pre-booking/sub-page/create-pre-booking',
                hideInMenu: true,
              },
              {
                path: 'preBooking/dispatch',
                name: '详情',
                authority: [DISPATCH_VISTI],
                otherOpen: true, // 是否需要重新打开一个页面
                component: './business-center/pre-booking/sub-page/dispatch',
                hideInMenu: true,
              },
            ],
          },
          {
            path: 'transportList',
            name: '_运单',
            authority: [TRANSPORT],
            skipLevel: true,
            component: '../components/cache-wrap/cache-wrap',
            routes: [
              {
                path: 'transport',
                name: '运单',
                icon: 'container',
                authority: [TRANSPORT],
                component: './business-center/transport/transport-list',
              },
              {
                path: 'transport/transportDetail',
                name: '运单详情',
                authority: [TRANSPORT_VISIT],
                component: './business-center/transport/sub-page/transport-detail',
                hideInMenu: true,
              },
              {
                path: 'transport/transportModify',
                name: '修改运单',
                authority: [TRANSPORT_MODIFY],
                component: './business-center/transport/sub-page/transport-modify',
                hideInMenu: true,
              },
              {
                path: 'supplementOrder',
                name: '补单',
                icon: 'audit',
                authority: [TRANSPORT_SUPPLEMENT_ORDER],
                component: './supplement-order',
              },
              {
                path: 'supplementOrder/bdRecord',
                name: '补单记录',
                hideInMenu: true,
                component: './supplement-order/sub-page/record-list',
              },
              {
                path: 'supplementOrder/bdRecord/addPicture',
                name: '批量补图片',
                hideInMenu: true,
                component: './supplement-order/sub-page/batch-add-picture',
              },
              {
                path: 'supplementOrder/bdRecord/detail',
                name: '运单详情',
                authority: [TRANSPORT_SUPPLEMENT_ORDER],
                component: './business-center/transport/sub-page/transport-detail',
                hideInMenu: true,
              },
            ],
          },
          {
            path : 'exportAndImportRecord',
            name : '导出记录',
            organizationType: [2,3,4,5,6,7],
            icon : 'profile',
            component : './business-center/project-manage/export-and-import-record'
          },
          {
            path: 'billDelivery',
            name: '_交票清单',
            authority: [DELIVERY_LIST],
            skipLevel: true,
            organizationType: [3, 5, 4],
            component: '../components/cache-wrap/cache-wrap',
            routes: [
              {
                path : 'billDeliveryHandover',
                name : '交票清单',
                organizationType: [4],
                icon : 'file-protect',
                authority: [DELIVERY_LIST],
                component : './business-center/bill-delivery-list/list.jsx',
              },
              {
                path : 'billDelivery',
                name : '交票清单',
                organizationType: [3, 5],
                authority: [DELIVERY_LIST],
                icon : 'file-protect',
                component : './business-center/bill-delivery-list/list.jsx',
              },
              {
                path: 'billDelivery/newBillDeliveryList',
                name: '创建交票清单',
                authority: [DELIVERY_LIST_NEW],
                component: './business-center/bill-delivery-list/add-list.jsx',
                hideInMenu: true,
              },
              {
                path: 'billDelivery/billDeliveryDetail',
                name: '交票清单-详情',
                otherOpen: true, // 是否需要重新打开一个页面
                component: './business-center/bill-delivery-list/details.jsx',
                hideInMenu: true,
              },
              {
                path: 'billDelivery/billDeliveryUpdate',
                name: '交票清单-修改',
                otherOpen: true,
                component: './business-center/bill-delivery-list/details.jsx',
                hideInMenu: true,
              },
              {
                path : 'print',
                name : '打印',
                otherOpen: true,
                component : './business-center/bill-delivery-list/print.jsx',
                authority: [DELIVERY_LIST_PRINT],
                hideInMenu: true
              }
            ],
          },
        ],
      },
      {
        path: 'basic-setting',
        name: '基础设置',
        authority: [BASIC_SETTING],
        icon: 'setting',
        routes: [
          {
            path: 'deliverySetting',
            name: '提货点管理',
            icon: 'environment',
            authority: [DELIVERY_SETTING],
            component: './basic-setting/delivery-setting',
          },
          {
            path: "receivingSetting",
            name: "卸货点管理",
            icon: "environment",
            authority: [RECEIVING_SETTING],
            component: './basic-setting/receiving-manage',
          },
          {
            path: 'receivingSetting/receivingLabelList',
            name: '卸货点标签列表',
            authority: [RECEIVING_SETTING],
            hideInMenu: true,
            component: './basic-setting/receiving-setting',
          },
          {
            path: 'goodsSetting',
            name: '常用货品管理',
            icon: 'database',
            authority: [GOODS_SETTING],
            component: './basic-setting/goods-setting',
          },
          {
            path: 'shipmentSetting',
            name: '承运方管理',
            icon: 'idcard',
            authority: [SHIPMENT_SETTING],
            component: './basic-setting/shipment-setting',
          },
          {
            path: 'shipmentSetting/detail',
            hideInMenu: true,
            name: '承运方详情',
            component: './basic-setting/shipment-setting/detail',
          },
          {
            path: 'goodsCategory',
            name: '货品类目',
            icon: 'hdd',
            authority: [CATEGORY_SETTING],
            component: './basic-setting/goods-category',
          },
          {
            path: 'cargoesSetting',
            name: '货权方管理',
            icon: 'idcard',
            authority: [CARGO_SETTING],
            component: './basic-setting/cargoes-setting',
          },
          {
            path: 'driverManagement',
            name: '司机管理',
            icon: 'idcard',
            authority: [DRIVER_SETTING],
            component: './basic-setting/driver-manage/index.jsx',
          },
          {
            path: 'driverManagement/addDriver',
            name: '司机管理-添加司机',
            authority: [DRIVER_SETTING_CREATE],
            hideInMenu: true,
            component: './basic-setting/driver-manage/add-driver',
          },
          {
            path: 'driverManagement/editDriver',
            name: '司机管理-修改司机',
            authority: [DRIVER_SETTING_CREATE],
            hideInMenu: true,
            component: './basic-setting/driver-manage/add-driver',
          },
          {
            path: '/basic-setting/driverManagement/detailDriver',
            name: '司机管理-司机详情',
            hideInMenu: true,
            authority: [DRIVER_SETTING_VISIT],
            component: './basic-setting/driver-manage/add-driver',
          },
          {
            path: 'carManagement',
            name: '车辆管理',
            authority: [CAR_SETTING],
            icon: 'car',
            component: './basic-setting/car-manage/car-list',
          },
          {
            path: 'carManagement/edit',
            name: '修改车辆',
            hideInMenu: true,
            authority: [CAR_SETTING_CREATE],
            exact: false,
            component: './basic-setting/car-manage/modify-car',
          },
          {
            path: 'carManagement/add',
            name: '添加车辆',
            authority: [CAR_SETTING_CREATE],
            hideInMenu: true,
            component: './basic-setting/car-manage/add-car',
          },
          {
            path: 'carManagement/detail',
            name: '车辆详情',
            authority: [CAR_SETTING_VISIT],
            hideInMenu: true,
            component: './basic-setting/car-manage/car-detail',
          },
          {
            path: 'payManagement',
            name: '支付设置',
            authority: [PAY_SETTING],
            component: './basic-setting/pay-setting',
          },
          {
            path: 'cargoManage',
            name: '托运方管理',
            authority: [CONSIGNMENT_SETTING],
            component: './basic-setting/consignment-setting',
            hideInMenu: false,
          },
          {
            path: 'customerManage',
            name: '客户管理',
            authority: [CUSTOMER_SETTING],
            component: './basic-setting/customer-manage',
            icon: 'idcard',
          },
          {
            path: "supplierManage",
            name: "供应商管理",
            authority: [SUPPLIER_MANAGE],
            organizationType: [1, 4],
            component: "./basic-setting/supplier-manage",
            icon: "idcard"
          },
          {
            path: "supplierManage/addSupplier",
            name: "添加供应商",
            organizationType: [1, 4],
            otherOpen: true,
            component: "./basic-setting/add-supplier",
            hideInMenu: true
          },
          {
            path: 'bankManage',
            name: '银行账户配置',
            authority: [BANK_SETTING],
            component: './basic-setting/bank-manage',
            icon: 'idcard',
          },
          {
            path: 'businessTypeSetting',
            name: '业务类型配置',
            authority: [BUSINESS_TYPE_SETTING],
            component: './basic-setting/business-type-setting',
            icon: 'idcard',
          },
          {
            path: 'logisticsTransaction',
            name: '物流交易方案配置',
            authority: [LOGISTICS_TYPE_SETTING],
            component: './basic-setting/logistics-transaction',
            icon: 'idcard',
          },
          {
            path: 'logisticsTransaction/add',
            name: '添加',
            component: './basic-setting/add-logistics-transaction',
            hideInMenu: true,
          },
          {
            path: 'logisticsTransaction/detail',
            name: '配置详情',
            component: './basic-setting/add-logistics-transaction',
            hideInMenu: true,
          },
          {
            path: "logisticsTransaction/modify",
            name: "修改配置",
            component: "./basic-setting/add-logistics-transaction",
            hideInMenu: true
          },
          {
            path: '/basic-setting',
            redirect: 'deliverySetting',
          },
        ],
      },
      {
        path: '/user-manage',
        name: '用户设置',
        authority: [USER],
        icon: 'contacts',
        routes: [
          {
            path: 'staff-manage',
            name: '用户管理',
            icon: 'tags',
            authority: [USER_SETTING],
            component: './user-setting/staff-manage/staff-list',
          },
          {
            path: 'message-center',
            name: '站内消息',
            icon: 'message',
            component: './user-setting/message-center/message-list',
          },
          {
            path: 'role-manage',
            name: '系统角色',
            icon: 'idcard',
            authority: [ROLE_SETTING],
            component: './user-setting/role-manage/role-list',
          },
          {
            path: 'role-manage/add',
            name: '添加角色',
            authority: [ROLE_SETTING_CREATE],
            component: './user-setting/role-manage/add-role',
            hideInMenu: true,
          },
          {
            path: 'role-manage/modify',
            name: '修改角色',
            otherOpen: true, // 是否需要重新打开一个页面
            authority: [ROLE_SETTING_MODIFY],
            component: './user-setting/role-manage/add-role',
            hideInMenu: true,
          },
          {
            path: 'group',
            name: '群组设置',
            icon: 'idcard',
            authority: [GROUP_SETTING],
            component: './user-setting/group/group-list',
          },
          {
            path: 'group/groupSetting',
            name: '管理群组',
            component: './user-setting/group/group-setting',
            hideInMenu: true,
          },
          {
            path: '/user-manage',
            redirect: 'staff-manage',
          },
        ],
      },
      {
        path: 'certification-center',
        name: '认证中心',
        icon: 'safety-certificate',
        authority: [AUTH_CENTER],
        routes: [
          //CARGO_JUDGE,CONSIGNMENT_JUDGE,SHIPMENT_JUDGE,DRIVER_JUDGE,CAR_JUDGE,CARGO_LIST_AUTH,CONSIGNMENT_LIST_AUTH,SHIPMENT_LIST_AUTH,DRIVER_LIST_AUTH,CAR_LIST_AUTH,
          // {path: 'cargo', name: '货权认证', icon: 'smile', component: './certification/certification.jsx'},
          {
            path: 'consignment',
            name: '托运认证',
            icon: 'safety-certificate',
            component: './certification/certification.jsx',
            authority: [CONSIGNMENT_AUTH],
          },
          {
            path: 'shipment',
            name: '承运认证',
            icon: 'safety-certificate',
            component: './certification/certification.jsx',
            authority: [SHIPMENT_AUTH],
          },
          {
            path: 'cargo',
            name: '货权认证',
            icon: 'safety-certificate',
            component: './certification/certification.jsx',
            authority: [CARGO_AUTH],
          },
          {
            path: 'driver',
            name: '司机认证',
            icon: 'safety-certificate',
            component: './certification/certification.jsx',
            authority: [DRIVER_AUTH],
          },
          {
            path: 'car',
            name: '车辆认证',
            icon: 'safety-certificate',
            component: './certification/certification.jsx',
            authority: [CAR_AUTH],
          },
          {
            path: 'car/detail',
            hideInMenu: true,
            name: '车辆详情',
            component: './certification/sub-page/car-certification/car-manage.jsx',
            authority: [CAR_LIST_AUTH],
          },
          {
            path: 'car/certificate',
            hideInMenu: true,
            name: '审核车辆',
            component: './certification/sub-page/car-certification/car-manage.jsx',
            authority: [CAR_JUDGE],
          },
          {
            path: 'driver/detail',
            hideInMenu: true,
            name: '司机详情',
            component: './certification/sub-page/driver-certification/driver-manage.jsx',
            authority: [DRIVER_LIST_AUTH],
          },
          {
            path: 'driver/modify',
            hideInMenu: true,
            name: '司机详情',
            component: './certification/sub-page/driver-certification/driver-manage.jsx',
            authority: [DRIVER_LIST_AUTH],
          },
          {
            path: 'driver/certificate',
            hideInMenu: true,
            name: '审核司机',
            component: './certification/sub-page/driver-certification/driver-manage.jsx',
            authority: [DRIVER_JUDGE],
          },
          {
            path: 'shipment/detail',
            hideInMenu: true,
            name: '承运方详情',
            component: './certification/sub-page/shipment-certification/shipment-manage.jsx',
            authority: [SHIPMENT_LIST_AUTH],
          },
          {
            path: 'shipment/certificate',
            hideInMenu: true,
            name: '审核承运方',
            component: './certification/sub-page/shipment-certification/shipment-manage.jsx',
            authority: [SHIPMENT_JUDGE],
          },
          {
            path: 'consignment/detail',
            hideInMenu: true,
            name: '托运方详情',
            component: './certification/sub-page/consignment-certification/consignment-manage.jsx',
            authority: [CONSIGNMENT_LIST_AUTH],
          },
          {
            path: 'consignment/certificate',
            hideInMenu: true,
            name: '审核托运方',
            component: './certification/sub-page/consignment-certification/consignment-manage.jsx',
            authority: [CONSIGNMENT_JUDGE],
          },
          {
            path: 'cargo/detail',
            hideInMenu: true,
            name: '货权方详情',
            component: './certification/sub-page/cargo-certification/cargo-manage.jsx',
            authority: [CARGO_LIST_AUTH],
          },
          {
            path: 'cargo/certificate',
            hideInMenu: true,
            name: '审核货权方',
            component: './certification/sub-page/cargo-certification/cargo-manage.jsx',
            authority: [CARGO_JUDGE],
          },
        ],
      },
      {
        path: '/bill-account',
        icon: 'account-book',
        name: '对账结算',
        // 左侧菜单展示权限
        authority: [
          CARGO_TO_CONSIGNMENT_ACCOUNT,
          CARGO_ACCOUNT,
          OUTBOUND_ACCOUNT,
          CONSIGNMENT_AUDIT_SHIPMENT_ACCOUNT_VISIT,
          CONSIGNMENT_TO_PLAT_ACCOUNT_VISIT
        ],
        routes: [
          /****************************************************************************************/
          /**************************************发起货权对账***************************************/
          /****************************************************************************************/
          {
            // 托运方对货权发起的货品对账
            path: 'cargoGoodsAccount',
            name: '_发起货权对账',
            icon: 'calculator',
            skipLevel: true,
            authority: [CARGO_ACCOUNT_VISIT],
            component: '../components/cache-wrap/cache-wrap',
            routes: [
              {
                // 托运方对货权发起的货品对账
                path: 'cargoGoodsAccountList',
                name: '发起货权对账',
                icon: 'calculator',
                authority: [CARGO_ACCOUNT_VISIT],
                routes: [
                  {
                    path: './',
                    component: './bill-account/goods-account/cargo-account',
                  },
                  {
                    // 托运方对货权发起的货品对账的对账单详情页面
                    path: 'goodsAccountBillDetail',
                    name: '发起货权对账-对账单详情',
                    otherOpen: true, // 是否需要重新打开一个页面
                    authority: [CARGO_ACCOUNT_VISIT],
                    component: './bill-account/goods-account/sub-page/goods-account-bill-detail',
                    hideInMenu: true,

                  },
                  {
                    // 托运方对货权发起的货品对账的对账单详情页面
                    path: 'transportDetail',
                    name: '发起货权对账-运单详情',
                    authority: [CARGO_ACCOUNT_VISIT],
                    component: './business-center/transport/sub-page/transport-detail',
                    hideInMenu: true,
                  },
                  {
                    // 托运方对货权发起的货品对账的创建对账单页面
                    path: 'createGoodsAccountBill',
                    name: '发起货权对账-创建对账单',
                    authority: [CARGO_ACCOUNT_CREATE],
                    component: './bill-account/goods-account/sub-page/create-goods-account-bill',
                    hideInMenu: true,
                  },
                  {
                    // 托运方对货权发起的货品对账的创建对账单页面
                    path: 'adjustGoodsAccountBillWrap',
                    name: '_调账',
                    authority: [CARGO_ACCOUNT_CREATE],
                    skipLevel: true,
                    hideInMenu: true,
                    component: '../components/cache-wrap/cache-wrap',
                    routes:[
                      {
                        // 托运方对货权发起的货品对账的创建对账单页面
                        path: 'adjustGoodsAccountBill',
                        name: '发起货权对账-调账',
                        authority: [CARGO_ACCOUNT_CREATE],
                        hideInMenu: true,
                        routes:[
                          {
                            path :'./',
                            component: './bill-account/goods-account/sub-page/adjust-goods-account-bill',
                          },
                          {
                            // 托运方对货权发起的货品对账的对账单详情页面
                            path: 'transportDetail',
                            name: '发起货权对账-调账-运单详情',
                            authority: [CARGO_ACCOUNT_VISIT],
                            component: './business-center/transport/sub-page/transport-detail',
                            hideInMenu: true,
                          },
                        ]
                      },
                      {
                        // 托运方对货权发起的货品对账的创建对账单页面
                        path: 'modifyAccountTransportsWrap',
                        name: '_运单修改',
                        authority: [CARGO_ACCOUNT_MODIFY],
                        component: '../components/cache-wrap/cache-wrap',
                        hideInMenu: true,
                        skipLevel: true,
                        routes:[
                          {
                            // 托运方对货权发起的货品对账的创建对账单页面
                            path: 'modifyAccountTransports',
                            name: '发起货权对账-运单修改',
                            authority: [CARGO_ACCOUNT_MODIFY],
                            component: './bill-account/goods-account/sub-page/modify-account-transports',
                            hideInMenu: true,
                          },
                        ]
                      },
                    ]
                  },
                ],
              },
            ],
          },


          /****************************************************************************************/
          /*************************************审核托运对账****************************************/
          /****************************************************************************************/
          {
            // 货权审核托运发起的货品对账
            path: 'consignmentGoodsAccount',
            name: '_审核托运对账',
            icon: 'check-circle',
            skipLevel: true,
            authority: [CARGO_TO_CONSIGNMENT_ACCOUNT_VISIT],
            component: '../components/cache-wrap/cache-wrap',
            routes:[
              {
                // 货权审核托运发起的货品对账
                path: 'consignmentGoodsAccountList',
                name: '审核托运对账',
                icon: 'check-circle',
                authority: [CARGO_TO_CONSIGNMENT_ACCOUNT_VISIT],
                routes:[
                  {
                    path : './',
                    component: './bill-account/goods-account/consign-account',
                  },
                  {
                    // 货权审核托运发起的货品对账的对账单详情页面
                    path: 'goodsAccountBillDetail',
                    name: '对账单详情',
                    authority: [CARGO_TO_CONSIGNMENT_ACCOUNT_VISIT],
                    component: './bill-account/goods-account/sub-page/goods-account-bill-detail',
                    hideInMenu: true,
                  },
                  {
                    // 货权审核托运发起的货品对账的【对账单详情页面】中的运单详情页面
                    path: 'transportDetail',
                    name: '运单详情',
                    authority: [CARGO_TO_CONSIGNMENT_ACCOUNT_VISIT],
                    component: './business-center/transport/sub-page/transport-detail',
                    hideInMenu: true,
                  },
                  {
                    // 货权审核托运发起的货品对账的对账单审核页面
                    path: 'auditedGoodsAccountBill',
                    name: '审核货品对账',
                    authority: [CARGO_TO_CONSIGNMENT_ACCOUNT_AUDITE],
                    component: './bill-account/goods-account/sub-page/audited-account-bill',
                    hideInMenu: true,
                  },
                ]
              },


            ]
          },

          // 托运对账页面
          {
            path: "consignment-transport-account-manage",
            name: "对账管理",
            icon: "calculator",
            authority: [CONSIGNMENT_AUDIT_SHIPMENT_ACCOUNT_VISIT, CONSIGNMENT_TO_PLAT_ACCOUNT_VISIT],
            organizationType: [4],
            routes: [
              {
                path: "./",
                authority: [CONSIGNMENT_AUDIT_SHIPMENT_ACCOUNT_VISIT, CONSIGNMENT_TO_PLAT_ACCOUNT_VISIT],
                component: "./bill-account/transport-account/consignment-transport-account-manage"
              },
              {
                path: "modifyTransportAccountBill",
                name: "对账管理-调账",
                hideInMenu: true,
                authority: [CONSIGNMENT_TO_PLAT_ACCOUNT_ADJUST_BILL],
                component: "./bill-account/transport-account/subPage/account-change"
              },
              {
                path: "addTransportAccountBill",
                name: "对账管理-添加运单",
                authority: [CONSIGNMENT_TO_PLAT_ACCOUNT_ADJUST_BILL],
                component: "./bill-account/transport-account/subPage/create-account",
                hideInMenu: true
              },
              {
                path: "createTransportAccountBill",
                name: "对账管理-创建对账单",
                authority: [CONSIGNMENT_TO_PLAT_ACCOUNT_CREATE],
                component: "./bill-account/transport-account/subPage/create-account",
                hideInMenu: true
              },
              {
                path: "transportAccountBillAudit",
                name: "审核",
                authority: [CONSIGNMENT_AUDIT_SHIPMENT_ACCOUNT_EXECUTE],
                hideInMenu: true,
                component: "./bill-account/transport-account/subPage/account-audit"
              },
              {
                path: "transportAccountBillDetail",
                name: "运输对账单详情",
                authority: [CONSIGNMENT_AUDIT_SHIPMENT_ACCOUNT_VISIT, CONSIGNMENT_TO_PLAT_ACCOUNT_VISIT],
                hideInMenu: true,
                component: "./bill-account/transport-account/subPage/account-detail"
              }
            ]
          },

          /****************************************************************************************/
          /***********************************出库对账单 **************************************/
          /****************************************************************************************/
          //Todo @Nicole
          {
            // 托运方对货权发起的货品对账
            path: 'deliveryStatement',
            name: '_出库对账单',
            icon: 'calculator',
            skipLevel: true,
            authority: [OUTBOUND_ACCOUNT],
            component: '../components/cache-wrap/cache-wrap',
            routes: [
              {
                // 出库对账单
                path: 'consignmentDeliveryStatementList',
                name: '出库对账单',
                icon: 'calculator',
                authority: [CONSIGNMENT_OUTBOUND_ACCOUNT_VISIT],
                organizationType: [4],
                routes: [
                  {
                    path: './',
                    component: './delivery-statement/consignment-delivery-statement',
                  },
                  {
                    // 对账单列表
                    path: 'consignmentDeliverStatementList',
                    name: '对账单列表',
                    authority: [CONSIGNMENT_OUTBOUND_ACCOUNT_VISIT],
                    organizationType: [4],
                    component: './delivery-statement/sub-page/consignment-deliver-statement-list',
                    hideInMenu: true,
                  },
                  {
                    // 对账单详情
                    path: 'consignmentDeliverStatementDetail',
                    name: '对账单详情',
                    authority: [CONSIGNMENT_OUTBOUND_ACCOUNT_VISIT],
                    organizationType: [4],
                    component: './delivery-statement/sub-page/consignment-deliver-statement-detail',
                    hideInMenu: true,
                  },
                  {
                    // 明细列表
                    path: 'consignmentDeliverStatementDetailedList',
                    name: '明细列表',
                    authority: [CONSIGNMENT_OUTBOUND_ACCOUNT_VISIT],
                    organizationType: [4],
                    component: './delivery-statement/sub-page/consignment-deliver-statement-detailed-list',
                    hideInMenu: true,
                  },
                  {
                    // 新建对账单
                    path: 'consignmentCreateAccountStatement',
                    name: '新建对账单',
                    authority: [OUTBOUND_ACCOUNT_CREATE],
                    organizationType: [4],
                    component: './delivery-statement/sub-page/consignment-create-account-statement',
                    hideInMenu: true,
                  },
                ],
              }
            ],
          },

          {
            path: '/bill-account',
            redirect: 'accountList',
          },
        ],
      },
      {
        path: '/statistics-report',
        name: '统计报表',
        authority: [STATISTCS_REPORT],
        icon: 'snippets',
        routes: [
          {
            path: 'sendStatistics',
            name: '发货统计',
            authority: [STATISTCS_REPORT_VISIT],
            icon: 'diff',
            component: './statistical-report/statistics/statistics-report',
          },
          {
            path: 'transportDataAnalysis',
            name: '数据分析',
            authority: [DATA_ANALYSIS],
            icon: 'pie-chart',
            component: './statistical-report/statistics/transport-data-analysis',
          },
          {
            path: 'businessBoard',
            name: '运营看板',
            icon: 'pie-chart',
            authority: [BUSINESS_BOARD],
            component: './statistical-report/statistics/business-board',
          },
        ],
      },
      {
        path: '/detailDriver',
        name: '司机详情',
        hideInMenu: true,
        component: './basic-setting/driver-manage/add-driver',
      },
      {
        path: '/detailCar',
        name: '车辆详情',
        hideInMenu: true,
        component: './basic-setting/car-manage/car-detail',
      },
      {
        path: '/funds-management',
        name: '资金管理',
        authority: [FUNDS],
        organizationType: [1, 3, 4],
        icon: 'contacts',
        routes: [
          // 承运页面
          {
            path: 'funds',
            name: '资金管理',
            authority: [FUNDS_MANAGE],
            organizationType: [1, 3, 4],
            icon: 'pay-circle',
            component: './fund-manage/funds-management/funds',
          },
          {
            path: 'funds/fund-record',
            name: '收支记录',
            authority: [FUNDS_MANAGE_FUND_RECORD],
            organizationType: [1, 3, 4],
            icon: 'pay-circle',
            hideInMenu: true,
            component: './fund-manage/funds-management/fund-record',
          },

          {
            path: 'CustomerTransfer',
            name: '客户转账',
            authority: [FUNDS_CUSTOMER],
            organizationType: [1, 3, 4],
            icon: 'pay-circle',
            component: './fund-manage/funds-management/customer',
          },
          {
            path: 'FundAccount',
            name: '资金账户',
            authority: [FUNDS_INSIDETRANSFER],
            organizationType: [1, 3, 4],
            icon: 'pay-circle',
            component: './fund-manage/funds-management/fund-account',
          },
          {
            path: 'UnrecordedFunds',
            name: '未入账资金',
            authority: UNRECORDED_FUNDS,
            icon: 'pay-circle',
            component: './fund-manage/funds-management/unrecorded-funds'
          },
          {
            path: 'BusinessDealings',
            name: '业务往来',
            authority: [FUNDS_BUSINESS_DEALINGS],
            organizationType: [1, 3, 4],
            icon: 'pay-circle',
            component: './fund-manage/funds-management/business-dealings',
          },
          {
            path: 'BankFlowing',
            name: '流水查询',
            authority: [BANK_FLOWING],
            organizationType: [1, 3, 4],
            icon: 'pay-circle',
            component: './bank-flowings/bank-flowings',
          },
        ],
      },
      {
        path: 'logistics-management',
        organizationType: [4],
        authority: [INVOICE_MANAGE, ACCOUNT],
        name: '物流管理',
        icon: 'audit',
        routes: [
          {
            path: 'freightContract',
            name: '查看物流合同',
            icon: 'audit',
            authority: [TRANSPORT_CONTRACT],
            component: './contract/check-freight-contract',
          },
          {
            path: 'consignmentJudgeTransportAccountList/transportAccountBillJudge',
            name: '审核',
            component: "./bill-account/transport-account/subPage/account-audit",
            hideInMenu: true,
          },
          {
            // 托运审核承运的运输对账的【对账单详情页面】中的运单详情
            path: 'consignmentJudgeTransportAccountList/transportAccountBillDetail/transportDetail',
            name: '运单详情',
            component: './business-center/transport/sub-page/transport-detail',
            hideInMenu: true,
          },

          /****************************************************************************************/
          /***********************************托运-支付物流费用**************************************/
          /****************************************************************************************/

          {
            // 托运付款单页面
            path: 'paymentBillWrap',
            name: '_支付物流费用',
            icon: 'pay-circle',
            authority: [PAY_BILL],
            component: '../components/cache-wrap/cache-wrap',
            skipLevel: true,
            routes: [
              {
                // 托运付款单页面
                path: 'paymentBill',
                name: '支付物流费用',
                icon: 'pay-circle',
                authority: [PAY_BILL],
                routes: [
                  {
                    path: './',
                    component: './logistics-manage/payment-bill/payment-bill',
                  },
                  {
                    // 托运付款单页面
                    path: 'transport',
                    name: '支付物流费用-运单列表',
                    authority: [PAY_BILL_VISIT],
                    component: './logistics-manage/net-transport/net-transportList',
                    hideInMenu: true,
                  },
                  {
                    // 托运付款单详情
                    path: 'detail',
                    name: '支付物流费用-付款单详情',
                    authority: [PAY_BILL_VISIT],
                    component: './logistics-manage/payment-bill/detail',
                    hideInMenu: true,
                  },
                  {
                    // 托运付款凭证
                    path: 'proofDetail',
                    name: '支付物流费用-付款凭证',
                    authority: [PAY_BILL_VISIT],
                    hideInMenu: true,
                    routes: [
                      {
                        path: './',
                        component: './logistics-manage/payment-bill/proof-detail',
                      },
                      {
                        path: 'transportDetail',
                        name: '支付物流费用-付款凭证-运单详情',
                        authority: [PAY_BILL_VISIT],
                        component: './business-center/transport/sub-page/transport-detail',
                        hideInMenu: true,
                      },
                    ],
                  },
                  {
                    // 托运新建付款单页面
                    path: 'create',
                    name: '支付物流费用-新建付款单',
                    authority: [PAY_BILL_CREATE],
                    hideInMenu: true,
                    routes: [
                      {
                        path: './',
                        component: './logistics-manage/payment-bill/create',
                      },
                      {
                        // 托运审核承运的运输对账的对账单详情页面
                        path: 'transportAccountBillDetail',
                        name: '支付物流费用-新建付款单-对账单详情',
                        hideInMenu: true,
                        routes: [
                          {
                            path: './',
                            component: './account/sub-page/transport-account-bill-detail',
                          },
                          {
                            path: 'transportDetail',
                            name: '支付物流费用-新建付款单-对账单详情-运单详情',
                            authority: [PAY_BILL_VISIT],
                            component: './business-center/transport/sub-page/transport-detail',
                            hideInMenu: true,
                          },
                        ],
                      },
                    ],
                  },
                ],
              },
            ],
          },
          /****************************************************************************************/
          /***********************************托运-发起物流开票**************************************/
          /****************************************************************************************/
          {
            path: 'invoicingWrap',
            name: '_发起物流开票',
            icon: 'audit',
            authority: [INVOICE_CREATE],
            component: '../components/cache-wrap/cache-wrap',
            skipLevel: true,
            routes: [
              {
                path: 'invoicing',
                name: '发起物流开票',
                icon: 'audit',
                authority: [INVOICE_CREATE],
                routes: [
                  {
                    path: './',
                    component: './logistics-manage/invoicing-manage/invoicing/invoicing',
                  },
                  {
                    path: 'historyWrap',
                    name: '_开票历史',
                    authority: [INVOICE_CREATE],
                    component: '../components/cache-wrap/cache-wrap',
                    skipLevel: true,
                    hideInMenu: true,
                    routes: [
                      {
                        path: 'history',
                        name: '发起物流开票-开票历史',
                        authority: [INVOICE_CREATE],
                        hideInMenu: true,
                        routes: [
                          {
                            path: './',
                            component: './logistics-manage/invoicing-manage/invoicing/history-container',
                          },
                          {
                            path: 'modify',
                            name: '发起物流开票-开票历史-修改',
                            authority: [INVOICE_MODIFY],
                            hideInMenu: true,
                            component: './logistics-manage/invoicing-manage/invoicing/modify',
                          },
                        ],
                      },

                    ],
                  },

                ],
              },

            ],
          },


          {
            path: '/invoicing-manage',
            redirect: 'invoicing',
          },
        ],
      },
      {
        name: "招投标管理",
        path: "tenderAndEmploy",
        authority: [TENDER_BIDDER_MANAGE],
        icon: "audit",
        routes: [
          {
            name: "招标管理",
            path: "tenderManage",
            authority: [TENDER_MANAGE],
            icon: "audit",
            component: "./TenderAndEmploy/TenderManage.jsx"
          },
          {
            name: "招标平台",
            path: "employPlatform",
            authority: [TENDER_PLATFORM],
            icon: "audit",
            component: "./TenderAndEmploy/EmployPlatform.jsx"
          }
        ]
      },
      {
        component: '../components/exception/404',
      },
    ],
  },
]
