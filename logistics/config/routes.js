import auth, { TENDER_BIDDER_MANAGE, TENDER_MANAGE, TENDER_PLATFORM } from "../src/constants/authCodes";

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

  TRACK_RECORD_SHEET,
  TRACK_RECORD_SHEET_BROWSE

} = auth;

export default [
  {
    path: "/user",
    component: "../layouts/UserLayout",
    routes: [
      // { path: "login", component: "./Login/Login" },
      { path: "role", component: "./Login/Role" },
      { path: "login", component: "./Login/NewLogin" },
      { path: "platLogin", component: "./Login/PlatLogin" },
      { path: "register", component: "./Registered/index.jsx" },
      { path: "authentication", component: "./Authentication/Authentication" },
      { path: "modifyPassword", component: "./Login/ModifyPassword" }
    ]
  },
  {
    path: "/agreement",
    component: "./BusinessCenter/ProjectManagement/subPage/agreement"
  },
  {
    path: "/userAgreement",
    component: "./BusinessCenter/ProjectManagement/subPage/userAgreement"
  },
  {
    path: "/contract",
    component: "./Contract/driverContract"
  },
  {
    path: "/",
    component: "../layouts/BasicLayout",
    routes: [
      { path: "/index", name: "首页", icon: "bank", component: "./Index/Index" },
      { path: "/", redirect: "/index" },
      // { path: '/demo', name: '滑动验证',hideInMenu:true, icon: 'home', component: './Demo/FormBugDemo' },
      {
        path: "buiness-center",
        name: "业务中心",
        icon: "profile",
        authority: [BUINESS],
        routes: [
          {
            path: "project",
            name: "_项目管理",
            authority: [PROJECT],
            skipLevel: true,
            component: "../components/CacheWrap/CacheWrap",
            routes: [
              {
                path: "projectManagement",
                name: "项目管理",
                icon: "project",
                authority: [PROJECT],
                component: "./BusinessCenter/ProjectManagement/ProjectList"
              },
              {
                path: "acceptance",
                name: "接受合同",
                // icon: 'project',
                // authority: [PROJECT],
                hideInMenu: true,
                otherOpen: true,
                component: "./BusinessCenter/ProjectManagement/Acceptance"
              },
              {
                path: "projectManagement/modifyProject",
                name: "配置项目",
                component: "./BusinessCenter/ProjectManagement/subPage/modifyProject",
                // authority: [PROJECT_CREATE],
                hideInMenu: true
              },
              {
                path: "projectManagement/createProject",
                name: "创建合同",
                component: "./BusinessCenter/ProjectManagement/subPage/createProject",
                authority: [PROJECT_CREATE],
                hideInMenu: true
              },
              {
                path: "projectManagement/edit",
                name: "修改合同",
                otherOpen: true, // 是否需要重新打开一个页面
                component: "./BusinessCenter/ProjectManagement/subPage/createProject",
                authority: [PROJECT_CREATE],
                hideInMenu: true
              },
              {
                path: "projectManagement/setting",
                name: "交易配置",
                otherOpen: true, // 是否需要重新打开一个页面
                component: "./BasicSetting/AddLogisticsTransaction",
                // authority: [PROJECT_VISIT],
                hideInMenu: true
              },
              {
                path: "projectManagement/projectDetail",
                name: "合同详情",
                component: "./BusinessCenter/ProjectManagement/subPage/projectDetail",
                authority: [PROJECT_VISIT],
                hideInMenu: true
              }
            ]
          },
          {
            path: "goodsPlansList",
            name: "_要货计划单",
            authority: [GOODSPLAN],
            skipLevel: true,
            component: "../components/CacheWrap/CacheWrap",
            routes: [
              {
                path: "goodsPlans",
                name: "要货计划单",
                authority: [GOODSPLAN],
                icon: "book",
                component: "./BusinessCenter/GoodsPlans/GoodsPlansList"
              },
              {
                path: "goodsPlans/goodsplansdetail",
                name: "要货计划单详情",
                authority: [GOODSPLAN_VISIT],
                component: "./BusinessCenter/GoodsPlans/GoodsPlansDetail",
                hideInMenu: true
              }
            ]
          },
          {
            path: "preBookingList",
            name: "_预约单",
            authority: [PREBOOKING, DISPATCH],
            skipLevel: true,
            component: "../components/CacheWrap/CacheWrap",
            routes: [
              {
                path: "preBooking",
                name: "预约单",
                icon: "calendar",
                authority: [PREBOOKING, DISPATCH],
                component: "./BusinessCenter/PreBooking/PreBookingList"
              },
              {
                path: "preBooking/createPreBooking",
                name: "创建预约单",
                authority: [PREBOOKING_CREATE],
                component: "./BusinessCenter/PreBooking/subPage/CreatePreBooking",
                hideInMenu: true
              },
              {
                path: "preBooking/detail",
                name: "预约单-详情",
                authority: [PREBOOKING_VISIT],
                component: "./BusinessCenter/PreBooking/subPage/CreatePreBooking",
                hideInMenu: true
              },
              {
                path: "preBooking/dispatch",
                name: "详情",
                authority: [DISPATCH_VISTI],
                // otherOpen: true, // 是否需要重新打开一个页面
                component: "./BusinessCenter/PreBooking/subPage/Dispatch",
                hideInMenu: true
              }
            ]
          },
          {
            path: "transportList",
            name: "_运单",
            authority: [TRANSPORT],
            skipLevel: true,
            component: "../components/CacheWrap/CacheWrap",
            routes: [
              {
                path: "transport",
                name: "运单",
                icon: "container",
                authority: [TRANSPORT],
                component: "./BusinessCenter/Transport/TransportList"
              },
              {
                path: "transport/transportDetail",
                name: "运单详情",
                authority: [TRANSPORT_VISIT],
                component: "./BusinessCenter/Transport/subPage/TransportDetail",
                hideInMenu: true
              },
              {
                path: "transport/transportModify",
                name: "修改运单",
                authority: [TRANSPORT_MODIFY],
                component: "./BusinessCenter/Transport/subPage/TransportModify",
                hideInMenu: true
              },
              {
                path: "supplementOrder",
                name: "补单",
                icon: "audit",
                authority: [TRANSPORT_SUPPLEMENT_ORDER],
                component: "./SupplementOrder"
              },
              {
                path: "supplementOrder/bdRecord",
                name: "补单记录",
                hideInMenu: true,
                component: "./SupplementOrder/subPage/RecordList"
              },
              {
                path: "supplementOrder/bdRecord/addPicture",
                name: "批量补图片",
                hideInMenu: true,
                component: "./SupplementOrder/subPage/BatchAddPicture"
              },
              {
                path: "supplementOrder/bdRecord/detail",
                name: "运单详情",
                authority: [TRANSPORT_SUPPLEMENT_ORDER],
                component: "./BusinessCenter/Transport/subPage/TransportDetail",
                hideInMenu: true
              }
            ]
          },
          {
            path: "exportAndImportRecordPlat",
            name: "导入\\导出记录",
            organizationType: [1],
            icon: "profile",
            component: "./BusinessCenter/ProjectManagement/ExportAndImportRecord"
          },
          {
            path: "trackRecordSheet",
            name: "轨迹记录单",
            authority: [TRACK_RECORD_SHEET],
            organizationType: [1, 5],
            icon: "profile",
            component: "./BusinessCenter/TrackRecordSheet/List"
          },
          {
            path: 'trackRecordSheet/detail',
            name: '轨迹记录单-详情',
            authority: [TRACK_RECORD_SHEET_BROWSE],
            organizationType: [5],
            otherOpen: true, // 是否需要重新打开一个页面
            hideInMenu: true,
            component: './BusinessCenter/TrackRecordSheet/detail.jsx'
          },
          {
            path: "exportAndImportRecord",
            name: "导出记录",
            organizationType: [2, 3, 4, 5, 6, 7],
            icon: "profile",
            component: "./BusinessCenter/ProjectManagement/ExportAndImportRecord"
          },
          {
            path: "billDelivery",
            name: "_交票清单",
            authority: [DELIVERY_LIST],
            skipLevel: true,
            organizationType: [3, 5, 4],
            component: "../components/CacheWrap/CacheWrap",
            routes: [
              {
                path: "billDelivery",
                name: "交票清单",
                organizationType: [3, 5],
                authority: [DELIVERY_LIST],
                icon: "file-protect",
                component: "./BusinessCenter/BillDeliveryList/List.jsx"
              },
              {
                path: "billDeliveryHandover",
                name: "交票清单",
                organizationType: [4],
                icon: "file-protect",
                authority: [DELIVERY_LIST],
                component: "./BusinessCenter/BillDeliveryList/List.jsx"
              },
              {
                path: "billDelivery/newBillDeliveryList",
                name: "创建交票清单",
                authority: [DELIVERY_LIST_NEW],
                component: "./BusinessCenter/BillDeliveryList/AddList.jsx",
                hideInMenu: true
              },
              {
                path: "billDelivery/billDeliveryDetail",
                name: "交票清单-详情",
                otherOpen: true, // 是否需要重新打开一个页面
                component: "./BusinessCenter/BillDeliveryList/Details.jsx",
                hideInMenu: true
              },
              {
                path: "billDelivery/billDeliveryUpdate",
                name: "交票清单-修改",
                otherOpen: true,
                component: "./BusinessCenter/BillDeliveryList/Details.jsx",
                hideInMenu: true
              },
              {
                path: "print",
                name: "打印",
                otherOpen: true,
                component: "./BusinessCenter/BillDeliveryList/Print.jsx",
                authority: [DELIVERY_LIST_PRINT],
                hideInMenu: true
              }
            ]
          },
          {
            path: "feedback",
            name: "意见反馈",
            icon: "mail",
            organizationType: [1],
            component: "./BusinessCenter/Feedback/List.jsx"
          },
          {
            path: "feedback/detail",
            name: "意见反馈-详情",
            // authority: [DELIVERY_LIST],
            organizationType: [1],
            otherOpen: true, // 是否需要重新打开一个页面
            hideInMenu: true,
            component: "./BusinessCenter/Feedback/Detail.jsx"
          },
          {
            path: "feedback/reply",
            name: "意见反馈-回复",
            // authority: [DELIVERY_LIST],
            organizationType: [1],
            otherOpen: true, // 是否需要重新打开一个页面
            hideInMenu: true,
            component: "./BusinessCenter/Feedback/Detail.jsx"
          },
        ]
      },
      {
        path: "net-transport",
        name: "网络货运",
        icon: "safety-certificate",
        organizationType: [5],
        authority: [
          TRANSPORT_CONTRACT,
          FUNDS_MANAGE,
          PAY_BILL,
          INVOICE_CREATE,
          SHIPMENT_TO_PLAT_ACCOUNT_VISIT,
          PLAT_TO_SHIPMENT_ACCOUNT_VISIT
        ],
        routes: [
          {
            path: "freightContract",
            name: "运输合同",
            icon: "audit",
            authority: [TRANSPORT_CONTRACT],
            component: "./Contract/FreightContract"
          },
          {
            // 承运付款单页面
            path: "paymentBillWrap",
            name: "_付款单",
            icon: "pay-circle",
            organizationType: [5],
            authority: [PAY_BILL],
            component: "../components/CacheWrap/CacheWrap",
            skipLevel: true,
            routes: [
              {
                // 承运付款单页面
                path: "paymentBill",
                name: "付款单",
                icon: "pay-circle",
                organizationType: [5],
                authority: [PAY_BILL],
                routes: [
                  {
                    path: "./",
                    component: "./LogisticsManage/PaymentBill/PaymentBill"
                  },
                  {
                    // 承运付款单页面
                    path: "transport",
                    name: "付款单-运单列表",
                    authority: [PAY_BILL_VISIT],
                    organizationType: [5],
                    component: "./NetTransport/NetTransportList",
                    hideInMenu: true
                  },
                  {
                    path: "transport/transportDetail",
                    name: "付款单-运单详情",
                    organizationType: [5],
                    authority: [PAY_BILL_VISIT],
                    component: "./BusinessCenter/Transport/subPage/TransportDetail",
                    hideInMenu: true
                  },
                  {
                    // 承运付款单页面
                    path: "detail",
                    name: "付款单详情",
                    organizationType: [5],
                    authority: [PAY_BILL_VISIT],
                    component: "./LogisticsManage/PaymentBill/Detail",
                    hideInMenu: true
                  },
                  {
                    // 承运付款单页面
                    path: "proofDetail",
                    name: "付款凭证",
                    organizationType: [5],
                    authority: [PAY_BILL_VISIT],
                    hideInMenu: true,
                    routes: [
                      {
                        path: "./",
                        name: "付款凭证",
                        component: "./LogisticsManage/PaymentBill/ProofDetail"
                      },
                      {
                        path: "transportDetail",
                        name: "付款凭证-运单详情",
                        organizationType: [5],
                        authority: [PAY_BILL_VISIT],
                        component: "./BusinessCenter/Transport/subPage/TransportDetail",
                        hideInMenu: true
                      }
                    ]
                  },
                  {
                    // 承运新建付款单页面
                    path: "create",
                    name: "新建付款单",
                    organizationType: [5],
                    authority: [PAY_BILL_CREATE],
                    component: "./LogisticsManage/PaymentBill/Create",
                    hideInMenu: true
                  }
                ]
              }
            ]
          },
          // 承运平台开票页面
          {
            path: "invoicingWrap",
            name: "_平台开票",
            icon: "audit",
            organizationType: [5],
            authority: [INVOICE_CREATE],
            component: "../components/CacheWrap/CacheWrap",
            skipLevel: true,
            routes: [
              {
                path: "invoicing",
                name: "平台开票",
                icon: "audit",
                organizationType: [5],
                authority: [INVOICE_CREATE],
                routes: [
                  {
                    path: "./",
                    component: "./LogisticsManage/InvoicingManage/Invoicing/Invoicing"
                  },
                  {
                    path: "historyWrap",
                    name: "_开票历史",
                    organizationType: [5],
                    authority: [INVOICE_CREATE],
                    component: "../components/CacheWrap/CacheWrap",
                    hideInMenu: true,
                    skipLevel: true,
                    routes: [
                      {
                        path: "history",
                        name: "平台开票-开票历史",
                        organizationType: [5],
                        authority: [INVOICE_CREATE],
                        component: "./LogisticsManage/InvoicingManage/Invoicing/HistoryContainer",
                        hideInMenu: true
                      },
                      {
                        path: "history/modify",
                        name: "平台开票-开票历史-修改",
                        otherOpen: true, // 是否需要重新打开一个页面
                        organizationType: [5],
                        authority: [INVOICE_MODIFY],
                        hideInMenu: true,
                        component: "./LogisticsManage/InvoicingManage/Invoicing/Modify"
                      }
                    ]
                  }

                ]
              }
            ]
          },


          // 资金管理
          {
            path: "funds",
            name: "资金管理",
            organizationType: [5],
            authority: [FUNDS_MANAGE],
            icon: "pay-circle",
            component: "./FundManage/FundsManagement/Funds"
          },
          {
            path: "funds/fund-record",
            name: "资金管理-收支记录",
            organizationType: [5],
            authority: [FUNDS_MANAGE_FUND_RECORD],
            icon: "pay-circle",
            hideInMenu: true,
            component: "./FundManage/FundsManagement/FundRecord"
          },

          // 承运对账页面
          {
            path: "shipmentTransportAccountManage",
            name: "对账管理",
            icon: "calculator",
            authority: [SHIPMENT_TO_CONSIGNMENT_ACCOUNT_VISIT, SHIPMENT_TO_PLAT_ACCOUNT_VISIT, SHIPMENT_AUDIT_NEXT_SHIPMENT_ACCOUNT_VISIT],
            organizationType: [5],
            routes: [
              {
                path: "./",
                authority: [SHIPMENT_TO_CONSIGNMENT_ACCOUNT_VISIT, SHIPMENT_TO_PLAT_ACCOUNT_VISIT, SHIPMENT_AUDIT_NEXT_SHIPMENT_ACCOUNT_VISIT],
                component: "./BillAccount/TransportAccount/ShipmentTransportAccountManage"
              },
              {
                path: "modifyTransportAccountBill",
                name: "对账管理-调账",
                authority: [SHIPMENT_TO_CONSIGNMENT_ACCOUNT_ADJUST_BILL, SHIPMENT_TO_PLAT_ACCOUNT_ADJUST_BILL],
                hideInMenu: true,
                component: "./BillAccount/TransportAccount/subPage/AccountChange"
              },
              {
                path: "createTransportAccountBill",
                name: "对账管理-创建对账单",
                authority: [SHIPMENT_TO_CONSIGNMENT_ACCOUNT_CREATE, SHIPMENT_TO_PLAT_ACCOUNT_CREATE],
                component: "./BillAccount/TransportAccount/subPage/CreateAccount",
                hideInMenu: true
              },
              {
                path: "addTransportAccountBill",
                name: "对账管理-添加运单",
                authority: [SHIPMENT_TO_CONSIGNMENT_ACCOUNT_ADJUST_BILL, SHIPMENT_TO_PLAT_ACCOUNT_ADJUST_BILL],
                component: "./BillAccount/TransportAccount/subPage/CreateAccount",
                hideInMenu: true
              },
              {
                path: "transportAccountBillAudit",
                name: "审核",
                authority: [SHIPMENT_AUDIT_NEXT_SHIPMENT_ACCOUNT_EXECUTE],
                hideInMenu: true,
                component: "./BillAccount/TransportAccount/subPage/AccountAudit"
              },
              {
                path: "transportAccountBillDetail",
                name: "运输对账单详情",
                authority: [SHIPMENT_TO_CONSIGNMENT_ACCOUNT_VISIT, SHIPMENT_TO_PLAT_ACCOUNT_VISIT, SHIPMENT_AUDIT_NEXT_SHIPMENT_ACCOUNT_VISIT],
                hideInMenu: true,
                component: "./BillAccount/TransportAccount/subPage/AccountDetail"
              }
            ]
          }
        ]
      },
      {
        path: "basic-setting",
        name: "基础设置",
        authority: [BASIC_SETTING],
        icon: "setting",
        routes: [
          {
            path: "taxRateConfig",
            name: "税率配置表",
            icon: "setting",
            organizationType: [1],
            authority: [TAX_RATE_CONFIG_LISt],
            component: "./BasicSetting/TaxRateConfig"
          },
          {
            path: "deliverySetting",
            name: "提货点管理",
            icon: "environment",
            authority: [DELIVERY_SETTING],
            component: "./BasicSetting/DeliverySetting"
          },
          {
            path: "receivingSetting",
            name: "卸货点管理",
            icon: "environment",
            authority: [RECEIVING_SETTING],
            component: "./BasicSetting/ReceivingManage"
          },
          {
            path: "receivingSetting/receivingLabelList",
            name: "卸货点标签列表",
            authority: [RECEIVING_SETTING],
            hideInMenu: true,
            component: "./BasicSetting/ReceivingSetting"
          },
          {
            path: "goodsSetting",
            name: "常用货品管理",
            icon: "database",
            authority: [GOODS_SETTING],
            component: "./BasicSetting/GoodsSetting"
          },
          {
            path: "shipmentSetting",
            name: "承运方管理",
            icon: "idcard",
            authority: [SHIPMENT_SETTING],
            component: "./BasicSetting/ShipmentSetting"
          },
          {
            path: "goodsCategory",
            name: "货品类目",
            icon: "hdd",
            authority: [CATEGORY_SETTING],
            component: "./BasicSetting/GoodsCategory"
          },
          {
            path: "cargoesSetting",
            name: "货权方管理",
            icon: "idcard",
            authority: [CARGO_SETTING],
            component: "./BasicSetting/CargoesSetting"
          },
          {
            path: "driverManagement",
            name: "司机管理",
            icon: "idcard",
            authority: [DRIVER_SETTING],
            component: "./BasicSetting/DriverManagement/index.jsx"
          },
          {
            path: "driverManagement/addDriver",
            name: "司机管理-添加司机",
            authority: [DRIVER_SETTING_CREATE],
            hideInMenu: true,
            component: "./BasicSetting/DriverManagement/AddDriver"
          },
          {
            path: "driverManagement/editDriver",
            name: "司机管理-修改司机",
            authority: [DRIVER_SETTING_CREATE],
            hideInMenu: true,
            component: "./BasicSetting/DriverManagement/AddDriver"
          },
          {
            path: "/basic-setting/driverManagement/detailDriver",
            name: "司机管理-司机详情",
            hideInMenu: true,
            authority: [DRIVER_SETTING_VISIT],
            component: "./BasicSetting/DriverManagement/AddDriver"
          },
          {
            path: "carManagement",
            name: "车辆管理",
            authority: [CAR_SETTING],
            icon: "car",
            component: "./BasicSetting/CarManagement/CarList"
          },
          {
            path: "carManagement/edit",
            name: "修改车辆",
            hideInMenu: true,
            otherOpen: true,
            // authority: [CAR_SETTING_CREATE],
            exact: false,
            component: "./BasicSetting/CarManagement/ModifyCar"
          },
          {
            path: "carManagement/add",
            name: "添加车辆",
            authority: [CAR_SETTING_CREATE],
            hideInMenu: true,
            component: "./BasicSetting/CarManagement/AddCar"
          },
          {
            path: "carManagement/detail",
            name: "车辆详情",
            authority: [CAR_SETTING_VISIT],
            hideInMenu: true,
            otherOpen: true,
            component: "./BasicSetting/CarManagement/CarDetail"
          },
          {
            path: "payManagement",
            name: "支付设置",
            authority: [PAY_SETTING],
            component: "./BasicSetting/PaySetting"
          },
          {
            path: "cargoManage",
            name: "托运方管理",
            authority: [CONSIGNMENT_SETTING],
            component: "./BasicSetting/ConsignmentSetting",
            hideInMenu: false
          },
          {
            path: "customerManage",
            name: "客户管理",
            authority: [CUSTOMER_SETTING],
            component: "./BasicSetting/CustomerManage",
            icon: "idcard"
          },
          {
            path: "supplierManage",
            name: "供应商管理",
            authority: [SUPPLIER_MANAGE],
            organizationType: [1, 4],
            component: "./BasicSetting/SupplierManage",
            icon: "idcard"
          },
          {
            path: "supplierManage/addSupplier",
            name: "添加供应商",
            organizationType: [1, 4],
            otherOpen: true,
            component: "./BasicSetting/AddSupplier",
            hideInMenu: true
          },
          {
            path: "bankManage",
            name: "银行账户配置",
            authority: [BANK_SETTING],
            component: "./BasicSetting/BankManage",
            icon: "idcard"
          },
          // {
          //   path: "businessTypeSetting",
          //   name: "业务模版配置",
          //   authority: [BUSINESS_TYPE_SETTING],
          //   component: "./BasicSetting/BusinessTemplate/List",
          //   icon: "idcard"
          // },
          {
            path: "businessTypeSetting/add",
            name: "添加业务模版",
            authority: [BUSINESS_TYPE_SETTING],
            hideInMenu: true,
            component: "./BasicSetting/BusinessTemplate/BusinessTypeSetting",
            icon: "idcard"
          },
          {
            path: "businessTypeSetting/update",
            name: "修改业务模版",
            authority: [BUSINESS_TYPE_SETTING],
            hideInMenu: true,
            component: "./BasicSetting/BusinessTemplate/BusinessTypeSetting",
            icon: "idcard"
          },
          {
            path: "businessTypeSetting",
            name: "业务模版配置",
            authority: [BUSINESS_TYPE_SETTING],
            // hideInMenu: true,
            component: "./BasicSetting/BusinessTemplate/BusinessTypeSetting",
            icon: "idcard"
          },
          {
            path: "logisticsTransaction",
            name: "物流交易方案配置",
            authority: [LOGISTICS_TYPE_SETTING],
            component: "./BasicSetting/LogisticsTransaction",
            icon: "idcard"
          },
          {
            path: "logisticsTransaction/add",
            name: "添加",
            component: "./BasicSetting/AddLogisticsTransaction",
            hideInMenu: true
          },
          {
            path: "logisticsTransaction/detail",
            name: "配置详情",
            component: "./BasicSetting/AddLogisticsTransaction",
            hideInMenu: true
          },
          {
            path: "logisticsTransaction/modify",
            name: "修改配置",
            component: "./BasicSetting/AddLogisticsTransaction",
            hideInMenu: true
          },
          {
            path: "/basic-setting",
            redirect: "deliverySetting"
          }
        ]
      },
      {
        path: "/user-manage",
        name: "用户设置",
        authority: [USER],
        icon: "contacts",
        routes: [
          {
            path: "staff-manage",
            name: "用户管理",
            icon: "tags",
            authority: [USER_SETTING],
            component: "./UserSetting/StaffManage/StaffList"
          },
          {
            path: "message-center",
            name: "站内消息",
            icon: "message",
            // authority: [USER_SETTING],
            component: "./UserSetting/MessageCenter/MessageList"
          },
          {
            path: "role-manage",
            name: "系统角色",
            icon: "idcard",
            authority: [ROLE_SETTING],
            component: "./UserSetting/RoleManage/RoleList"
          },
          {
            path: "role-manage/add",
            name: "添加角色",
            authority: [ROLE_SETTING_CREATE],
            component: "./UserSetting/RoleManage/AddRole",
            hideInMenu: true
          },
          {
            path: "role-manage/modify",
            name: "修改角色",
            otherOpen: true, // 是否需要重新打开一个页面
            authority: [ROLE_SETTING_MODIFY],
            component: "./UserSetting/RoleManage/AddRole",
            hideInMenu: true
          },
          {
            path: "group",
            name: "群组设置",
            icon: "idcard",
            authority: [GROUP_SETTING],
            component: "./UserSetting/Group/GroupList"
          },
          {
            path: "loginAccountManage",
            name: "登录账户管理",
            icon: "team",
            authority: [GROUP_SETTING],
            component: "./UserSetting/LoginAccountManage/List"
          },
          {
            path: "group/groupSetting",
            name: "管理群组",
            component: "./UserSetting/Group/GroupSetting",
            hideInMenu: true
          },
          {
            path: "/user-manage",
            redirect: "staff-manage"
          }
        ]
      },
      {
        path: "certification-center",
        name: "认证中心",
        icon: "safety-certificate",
        authority: [AUTH_CENTER],
        routes: [
          //CARGO_JUDGE,CONSIGNMENT_JUDGE,SHIPMENT_JUDGE,DRIVER_JUDGE,CAR_JUDGE,CARGO_LIST_AUTH,CONSIGNMENT_LIST_AUTH,SHIPMENT_LIST_AUTH,DRIVER_LIST_AUTH,CAR_LIST_AUTH,
          // {path: 'cargo', name: '货权认证', icon: 'smile', component: './certification/Certification.jsx'},
          {
            path: "consignment",
            name: "托运认证",
            icon: "safety-certificate",
            component: "./certification/subPage/ConsignmentCertification/ConsignmentCertification.jsx",
            authority: [CONSIGNMENT_LIST_AUTH]
          },
          {
            path: "shipment",
            name: "承运认证",
            icon: "safety-certificate",
            component: "./certification/subPage/ShipmentCertification/ShipmentCertification.jsx",
            authority: [SHIPMENT_LIST_AUTH]
          },
          {
            path: "cargo",
            name: "货权认证",
            icon: "safety-certificate",
            component: "./certification/subPage/CargoCertification/CargoCertification.jsx",
            authority: [CARGO_LIST_AUTH]
          },
          {
            path: "driver",
            name: "司机认证",
            icon: "safety-certificate",
            authority: [DRIVER_LIST_AUTH],
            routes: [
              {
                path: "./",
                component: "./certification/subPage/DriverCertification/DriverCertification.jsx"
              },
              {
                path: "edit",
                name: "司机管理-修改司机",
                authority: [DRIVER_LIST_AUTH],
                hideInMenu: true,
                component: "./certification/subPage/DriverCertification/DriverEdit.jsx"
              },
              {
                path: "detail",
                hideInMenu: true,
                name: "司机详情",
                component: "./certification/subPage/DriverCertification/DriverManage.jsx",
                authority: [DRIVER_LIST_AUTH]
              },
              {
                path: "certificate",
                hideInMenu: true,
                name: "审核司机",
                component: "./certification/subPage/DriverCertification/DriverManage.jsx",
                authority: [DRIVER_JUDGE]
              },
              {
                path: "modifyBankCard",
                hideInMenu: true,
                name: "司机修改",
                component: "./certification/subPage/DriverCertification/DriverManage.jsx",
                authority: [DRIVER_LIST_AUTH]
              }
            ]
          },

          {
            path: "car",
            name: "车辆认证",
            icon: "safety-certificate",
            component: "./certification/subPage/CarCertification/CarCertification.jsx",
            authority: [CAR_LIST_AUTH]
          },
          {
            path: "car/detail",
            hideInMenu: true,
            name: "车辆详情",
            component: "./certification/subPage/CarCertification/CarManage.jsx",
            authority: [CAR_LIST_AUTH]
          },
          {
            path: "car/certificate",
            hideInMenu: true,
            name: "审核车辆",
            component: "./certification/subPage/CarCertification/CarManage.jsx",
            authority: [CAR_JUDGE]
          },
          {
            path: "car/edit",
            name: "修改车辆",
            hideInMenu: true,
            // authority: [CAR_SETTING_CREATE],
            exact: false,
            component: "./BasicSetting/CarManagement/ModifyCar"
          },
          {
            path: "shipment/detail",
            hideInMenu: true,
            name: "承运方详情",
            component: "./certification/subPage/ShipmentCertification/ShipmentManage.jsx",
            authority: [SHIPMENT_LIST_AUTH]
          },
          {
            path: "shipment/certificate",
            hideInMenu: true,
            name: "审核承运方",
            component: "./certification/subPage/ShipmentCertification/ShipmentManage.jsx",
            authority: [SHIPMENT_JUDGE]
          },
          {
            path: "consignment/detail",
            hideInMenu: true,
            name: "托运方详情",
            component: "./certification/subPage/ConsignmentCertification/ConsignmentManage.jsx",
            authority: [CONSIGNMENT_LIST_AUTH]
          },
          {
            path: "consignment/certificate",
            hideInMenu: true,
            name: "审核托运方",
            component: "./certification/subPage/ConsignmentCertification/ConsignmentManage.jsx",
            authority: [CONSIGNMENT_JUDGE]
          },
          {
            path: "cargo/detail",
            hideInMenu: true,
            name: "货权方详情",
            component: "./certification/subPage/CargoCertification/CargoManage.jsx",
            authority: [CARGO_LIST_AUTH]
          },
          {
            path: "cargo/certificate",
            hideInMenu: true,
            name: "审核货权方",
            component: "./certification/subPage/CargoCertification/CargoManage.jsx",
            authority: [CARGO_JUDGE]
          }
        ]
      },
      {
        path: "/bill-account",
        icon: "account-book",
        name: "对账结算",
        // 左侧菜单展示权限
        authority: [
          CARGO_TO_CONSIGNMENT_ACCOUNT,
          CARGO_ACCOUNT,
          SHIPMENT_TO_PLAT_ACCOUNT,
          SHIPMENT_TO_CONSIGNMENT_ACCOUNT,
          PLAT_TO_SHIPMENT_ACCOUNT,
          CONSIGNMENT_TO_SHIPMENT_ACCOUNT,
          OUTBOUND_ACCOUNT
        ],
        routes: [
          /****************************************************************************************/
          /**************************************货权对账管理***************************************/
          /****************************************************************************************/
          {
            // 托运方对货权发起的货品对账
            path: "cargoGoodsAccount",
            name: "_货权对账管理",
            icon: "calculator",
            skipLevel: true,
            authority: [CARGO_ACCOUNT_VISIT],
            component: "../components/CacheWrap/CacheWrap",
            routes: [
              {
                // 托运方对货权发起的货品对账
                path: "cargoGoodsAccountList",
                name: "货权对账管理",
                icon: "calculator",
                authority: [CARGO_ACCOUNT_VISIT],
                routes: [
                  {
                    path: "./",
                    component: "./BillAccount/GoodsAccount/CargoAccount"
                  },
                  {
                    // 托运方对货权发起的货品对账的对账单详情页面
                    path: "goodsAccountBillDetail",
                    name: "货权对账管理-对账单详情",
                    otherOpen: true, // 是否需要重新打开一个页面
                    authority: [CARGO_ACCOUNT_VISIT],
                    component: "./BillAccount/GoodsAccount/subPage/GoodsAccountBillDetail",
                    hideInMenu: true

                  },
                  {
                    // 托运方对货权发起的货品对账的对账单详情页面
                    path: "transportDetail",
                    name: "货权对账管理-运单详情",
                    authority: [CARGO_ACCOUNT_VISIT],
                    component: "./BusinessCenter/Transport/subPage/TransportDetail",
                    hideInMenu: true
                  },
                  {
                    // 托运方对货权发起的货品对账的创建对账单页面
                    path: "createGoodsAccountBill",
                    name: "货权对账管理-创建对账单",
                    authority: [CARGO_ACCOUNT_CREATE],
                    component: "./BillAccount/GoodsAccount/subPage/CreateGoodsAccountBill",
                    hideInMenu: true
                  },
                  {
                    // 托运方对货权发起的货品对账的创建对账单页面
                    path: "adjustGoodsAccountBillWrap",
                    name: "_调账",
                    authority: [CARGO_ACCOUNT_CREATE],
                    skipLevel: true,
                    hideInMenu: true,
                    component: "../components/CacheWrap/CacheWrap",
                    routes: [
                      {
                        // 托运方对货权发起的货品对账的创建对账单页面
                        path: "adjustGoodsAccountBill",
                        name: "货权对账管理-调账",
                        authority: [CARGO_ACCOUNT_CREATE],
                        hideInMenu: true,
                        routes: [
                          {
                            path: "./",
                            component: "./BillAccount/GoodsAccount/subPage/AdjustGoodsAccountBill"
                          },
                          {
                            // 托运方对货权发起的货品对账的对账单详情页面
                            path: "transportDetail",
                            name: "货权对账管理-调账-运单详情",
                            authority: [CARGO_ACCOUNT_VISIT],
                            component: "./BusinessCenter/Transport/subPage/TransportDetail",
                            hideInMenu: true
                          }
                        ]
                      },
                      {
                        // 托运方对货权发起的货品对账的创建对账单页面
                        path: "modifyAccountTransportsWrap",
                        name: "_运单修改",
                        authority: [CARGO_ACCOUNT_MODIFY],
                        component: "../components/CacheWrap/CacheWrap",
                        hideInMenu: true,
                        skipLevel: true,
                        routes: [
                          {
                            // 托运方对货权发起的货品对账的创建对账单页面
                            path: "modifyAccountTransports",
                            name: "货权对账管理-运单修改",
                            authority: [CARGO_ACCOUNT_MODIFY],
                            component: "./BillAccount/GoodsAccount/subPage/ModifyAccountTransports",
                            hideInMenu: true
                          }
                        ]
                      }
                    ]
                  }
                ]
              }
            ]
          },


          /****************************************************************************************/
          /*************************************审核货权对账****************************************/
          /****************************************************************************************/
          {
            // 货权审核托运发起的货品对账
            path: "consignmentGoodsAccount",
            name: "_审核托运对账",
            icon: "check-circle",
            skipLevel: true,
            authority: [CARGO_TO_CONSIGNMENT_ACCOUNT_VISIT],
            component: "../components/CacheWrap/CacheWrap",
            routes: [
              {
                // 货权审核托运发起的货品对账
                path: "consignmentGoodsAccountList",
                name: "审核托运对账",
                icon: "check-circle",
                authority: [CARGO_TO_CONSIGNMENT_ACCOUNT_VISIT],
                routes: [
                  {
                    path: "./",
                    component: "./BillAccount/GoodsAccount/ConsignAccount"
                  },
                  {
                    // 货权审核托运发起的货品对账的对账单详情页面
                    path: "goodsAccountBillDetail",
                    name: "对账单详情",
                    authority: [CARGO_TO_CONSIGNMENT_ACCOUNT_VISIT],
                    component: "./BillAccount/GoodsAccount/subPage/GoodsAccountBillDetail",
                    hideInMenu: true
                  },
                  {
                    // 货权审核托运发起的货品对账的【对账单详情页面】中的运单详情页面
                    path: "transportDetail",
                    name: "运单详情",
                    authority: [CARGO_TO_CONSIGNMENT_ACCOUNT_VISIT],
                    component: "./BusinessCenter/Transport/subPage/TransportDetail",
                    hideInMenu: true
                  },
                  {
                    // 货权审核托运发起的货品对账的对账单审核页面
                    path: "auditedGoodsAccountBill",
                    name: "审核货品对账",
                    authority: [CARGO_TO_CONSIGNMENT_ACCOUNT_AUDITE],
                    component: "./BillAccount/GoodsAccount/subPage/AuditedAccountBill",
                    hideInMenu: true
                  }
                ]
              }


            ]
          },

          //以下运输对账

          // 平台方对账页面
          {
            path: "platTransportAccountManage",
            name: "对账管理",
            icon: "calculator",
            organizationType: [1],
            authority: [PLAT_AUDIT_CONSIGNMENT_ACCOUNT_VISIT, PLAT_AUDIT_SHIPMENT_ACCOUNT_VISIT],
            routes: [
              {
                path: "./",
                authority: [PLAT_AUDIT_CONSIGNMENT_ACCOUNT_VISIT, PLAT_AUDIT_SHIPMENT_ACCOUNT_VISIT],
                component: "./BillAccount/TransportAccount/PlatTransportAccountManage"
              },
              {
                path: "transportAccountBillAudit",
                name: "审核",
                authority: [PLAT_AUDIT_CONSIGNMENT_ACCOUNT_EXECUTE, PLAT_AUDIT_SHIPMENT_ACCOUNT_EXECUTE],
                hideInMenu: true,
                component: "./BillAccount/TransportAccount/subPage/AccountAudit"
              },
              {
                // 平台对托运发起的运输对账的对账单详情页面
                path: "transportAccountBillDetail",
                name: "运输对账单详情",
                authority: [PLAT_AUDIT_CONSIGNMENT_ACCOUNT_VISIT, PLAT_AUDIT_SHIPMENT_ACCOUNT_VISIT],
                hideInMenu: true,
                component: "./BillAccount/TransportAccount/subPage/AccountDetail"
              }
            ]
          },

          // 托运对账页面
          {
            path: "consignmentTransportAccountManage",
            name: "对账管理",
            icon: "calculator",
            authority: [CONSIGNMENT_AUDIT_SHIPMENT_ACCOUNT_VISIT, CONSIGNMENT_TO_PLAT_ACCOUNT_VISIT],
            organizationType: [4],
            routes: [
              {
                path: "./",
                authority: [CONSIGNMENT_AUDIT_SHIPMENT_ACCOUNT_VISIT, CONSIGNMENT_TO_PLAT_ACCOUNT_VISIT],
                component: "./BillAccount/TransportAccount/ConsignmentTransportAccountManage"
              },
              {
                path: "modifyTransportAccountBill",
                name: "对账管理-调账",
                hideInMenu: true,
                authority: [CONSIGNMENT_TO_PLAT_ACCOUNT_ADJUST_BILL],
                component: "./BillAccount/TransportAccount/subPage/AccountChange"
              },
              {
                path: "addTransportAccountBill",
                name: "对账管理-添加运单",
                authority: [CONSIGNMENT_TO_PLAT_ACCOUNT_ADJUST_BILL],
                component: "./BillAccount/TransportAccount/subPage/CreateAccount",
                hideInMenu: true
              },
              {
                path: "createTransportAccountBill",
                name: "对账管理-创建对账单",
                authority: [CONSIGNMENT_TO_PLAT_ACCOUNT_CREATE],
                component: "./BillAccount/TransportAccount/subPage/CreateAccount",
                hideInMenu: true
              },
              {
                path: "transportAccountBillAudit",
                name: "审核",
                authority: [CONSIGNMENT_AUDIT_SHIPMENT_ACCOUNT_EXECUTE],
                hideInMenu: true,
                component: "./BillAccount/TransportAccount/subPage/AccountAudit"
              },
              {
                path: "transportAccountBillDetail",
                name: "运输对账单详情",
                authority: [CONSIGNMENT_AUDIT_SHIPMENT_ACCOUNT_VISIT, CONSIGNMENT_TO_PLAT_ACCOUNT_VISIT],
                hideInMenu: true,
                component: "./BillAccount/TransportAccount/subPage/AccountDetail"
              }
            ]
          },

          // 承运向托运发起对账
          {
            path: "shipmentToConsignmentTransportAccount",
            name: "客户对账管理",
            icon: "calculator",
            organizationType: [5],
            authority: [SHIPMENT_TO_CONSIGNMENT_ACCOUNT_VISIT],
            routes: [
              {
                path: "./",
                component: "./BillAccount/TransportAccount/ShipmentToConsignmentTransportAccountList"
              },
              {
                path: "modifyTransportAccountBill",
                name: "客户对账管理-调账",
                hideInMenu: true,
                authority: [SHIPMENT_TO_CONSIGNMENT_ACCOUNT_ADJUST_BILL],
                component: "./BillAccount/TransportAccount/subPage/AccountChange"
              },
              {
                path: "addTransportAccountBill",
                name: "客户对账管理-添加运单",
                authority: [SHIPMENT_TO_CONSIGNMENT_ACCOUNT_ADJUST_BILL],
                component: "./BillAccount/TransportAccount/subPage/CreateAccount",
                hideInMenu: true
              },
              {
                path: "createTransportAccountBill",
                name: "客户对账管理-创建对账单",
                authority: [SHIPMENT_TO_CONSIGNMENT_ACCOUNT_CREATE],
                component: "./BillAccount/TransportAccount/subPage/CreateAccount",
                hideInMenu: true
              },
              {
                path: "transportAccountBillDetail",
                name: "客户对账管理-运输对账单详情",
                authority: [SHIPMENT_TO_CONSIGNMENT_ACCOUNT_VISIT],
                hideInMenu: true,
                component: "./BillAccount/TransportAccount/subPage/AccountDetail"
              }
            ]
          },


          /****************************************************************************************/
          /***********************************出库对账管理 **************************************/
          /****************************************************************************************/
          {
            // 托运方对货权发起的货品对账
            path: "deliveryStatement",
            name: "_出库对账管理",
            icon: "calculator",
            skipLevel: true,
            authority: [OUTBOUND_ACCOUNT],
            component: "../components/CacheWrap/CacheWrap",
            routes: [
              {
                // 出库对账管理
                path: "consignmentDeliveryStatementList",
                name: "出库对账管理",
                icon: "calculator",
                authority: [CONSIGNMENT_OUTBOUND_ACCOUNT_VISIT],
                organizationType: [4],
                routes: [
                  {
                    path: "./",
                    component: "./DeliveryStatement/ConsignmentDeliveryStatement"
                  },
                  {
                    // 对账单列表
                    path: "consignmentDeliverStatementList",
                    name: "对账单列表",
                    authority: [CONSIGNMENT_OUTBOUND_ACCOUNT_VISIT],
                    organizationType: [4],
                    component: "./DeliveryStatement/subPage/ConsignmentDeliverStatementList",
                    hideInMenu: true
                  },
                  {
                    // 对账单详情
                    path: "consignmentDeliverStatementDetail",
                    name: "对账单详情",
                    authority: [CONSIGNMENT_OUTBOUND_ACCOUNT_VISIT],
                    organizationType: [4],
                    component: "./DeliveryStatement/subPage/ConsignmentDeliverStatementDetail",
                    hideInMenu: true
                  },
                  {
                    // 明细列表
                    path: "consignmentDeliverStatementDetailedList",
                    name: "明细列表",
                    authority: [CONSIGNMENT_OUTBOUND_ACCOUNT_VISIT],
                    organizationType: [4],
                    component: "./DeliveryStatement/subPage/ConsignmentDeliverStatementDetailedList",
                    hideInMenu: true
                  },
                  {
                    // 新建对账单
                    path: "consignmentCreateAccountStatement",
                    name: "新建对账单",
                    authority: [OUTBOUND_ACCOUNT_CREATE],
                    organizationType: [4],
                    component: "./DeliveryStatement/subPage/ConsignmentCreateAccountStatement",
                    hideInMenu: true
                  }
                ]
              },
              {
                // 出库对账管理
                path: "shipmentDeliveryStatementList",
                name: "出库对账管理",
                icon: "calculator",
                authority: [SHIPMENT_OUTBOUND_ACCOUNT_VISIT],
                organizationType: [5],
                routes: [
                  {
                    path: "./",
                    component: "./DeliveryStatement/ShipmentDeliveryStatement"
                  },
                  {
                    // 对账单列表
                    path: "shipmentDeliverStatementList",
                    name: "对账单列表",
                    authority: [SHIPMENT_OUTBOUND_ACCOUNT_VISIT],
                    organizationType: [5],
                    component: "./DeliveryStatement/subPage/ShipmentDeliverStatementList",
                    hideInMenu: true
                  }
                ]
              }
            ]
          },

          {
            path: "/bill-account",
            redirect: "accountList"
          },
          {
            // 平台
            path: "paymentBillWrap",
            name: "_收款单",
            icon: "pay-circle",
            skipLevel: true,
            organizationType: [1],
            authority: [PAY_BILL],
            component: "../components/CacheWrap/CacheWrap",
            routes: [
              {
                path: "paymentBill",
                name: "收款单",
                icon: "pay-circle",
                organizationType: [1],
                authority: [PAY_BILL],
                routes: [
                  {
                    path: "./",
                    component: "./LogisticsManage/PaymentBill/PaymentBill"
                  },
                  {
                    // 平台收款单页面
                    path: "detail",
                    name: "收款单详情",
                    organizationType: [1],
                    authority: [PAY_BILL_VISIT],
                    hideInMenu: true,
                    routes: [
                      {
                        path: "./",
                        component: "./LogisticsManage/PaymentBill/Detail"
                      },
                      // 平台收款单详情中的运单列表
                      {
                        path: "transportDetail",
                        name: "运单详情",
                        organizationType: [1],
                        authority: [PAY_BILL_VISIT],
                        component: "./BusinessCenter/Transport/subPage/TransportDetail",
                        hideInMenu: true
                      }
                    ]
                  },
                  {
                    // 查看支付凭证
                    path: "transport",
                    name: "运单列表",
                    authority: [PAY_BILL_VISIT],
                    organizationType: [5],
                    component: "./NetTransport/NetTransportList",
                    hideInMenu: true
                  }
                ]
              }
            ]
          },
          {
            // 承运付款单页面
            path: "transport",
            name: "运单列表",
            authority: [PAY_BILL_VISIT],
            organizationType: [1],
            component: "./NetTransport/NetTransportList",
            hideInMenu: true
          },

          {
            path: "paymentBill/transport/transportDetail",
            name: "运单详情",
            organizationType: [1],
            authority: [PAY_BILL_VISIT],
            component: "./BusinessCenter/Transport/subPage/TransportDetail",
            hideInMenu: true
          },


          {
            // 承运新建付款单页面
            path: "paymentBill/create",
            name: "新建付款单",
            organizationType: [1],
            authority: [PAY_BILL_CREATE],
            component: "./LogisticsManage/PaymentBill/Create",
            hideInMenu: true
          }


        ]
      },
      {
        path: "invoicing-manage",
        name: "开票管理",
        authority: [INVOICE_MANAGE],
        organizationType: [1],
        icon: "audit",
        routes: [
          {
            path: "invoicing",
            name: "物流开票",
            icon: "audit",
            authority: [INVOICE_CREATE],
            component: "./LogisticsManage/InvoicingManage/Invoicing/Invoicing"
          },
          {
            path: "invoicing/history/modify",
            name: "修改",
            authority: [INVOICE_MODIFY],
            hideInMenu: true,
            component: "./LogisticsManage/InvoicingManage/Invoicing/Modify"
          },
          {
            path: "invoicing2Wrap",
            name: "_审核开票",
            skipLevel: true,
            authority: [SHIPMENT_INVOICE, CONSIGNMENT_INVOICE],
            icon: "audit",
            component: "../components/CacheWrap/CacheWrap",
            routes: [
              {
                path: "invoicing2",
                name: "审核开票",
                authority: [SHIPMENT_INVOICE, CONSIGNMENT_INVOICE],
                icon: "audit",
                component: "./LogisticsManage/InvoicingManage/Invoicing/PlatformInvoicing"
              }
            ]
          },
          {
            path: "invoicing/history",
            name: "开票管理-开票历史",
            authority: [INVOICE_CREATE],
            component: "./LogisticsManage/InvoicingManage/Invoicing/HistoryContainer",
            hideInMenu: true
          },
          {
            path: "/invoicing-manage",
            redirect: "invoicing"
          },
          {
            path: "withholdingManage",
            name: "_代扣代缴管理",
            skipLevel: true,
            authority: [WITHHOLDING_MANAGE_LIST, WITHHOLDING_MANAGE_MONTH],
            organizationType: [1],
            routes: [
              {
                path: "withholdingManage",
                name: "代扣代缴管理",
                organizationType: [1],
                authority: [WITHHOLDING_MANAGE_LIST, WITHHOLDING_MANAGE_MONTH],
                icon: "read",
                component: "./LogisticsManage/InvoicingManage/WithholdingManage/List.jsx"
              },
              {
                path: "withholdingManage/details",
                name: "代扣代缴-明细表",
                organizationType: [1],
                hideInMenu: true,
                authority: [WITHHOLDING_MANAGE_LIST],
                component: "./LogisticsManage/InvoicingManage/WithholdingManage/List.jsx"
              },

              {
                path: "personnelManage",
                name: "代扣代缴人员管理",
                hideInMenu: true,
                authority: [WITHHOLDING_MANAGE_PERSONNEL],
                component: "./LogisticsManage/InvoicingManage/WithholdingManage/PersonnelManage.jsx"
              }
            ]
          }

        ]
      },
      {
        path: "contract-manage",
        name: "合同管理",
        authority: [CONTRACT_MANAGE],
        organizationType: [1],
        icon: "audit",
        routes: [
          {
            path: "freightContract",
            name: "运输合同",
            icon: "audit",
            authority: [TRANSPORT_CONTRACT],
            component: "./Contract/FreightContract"
          }
        ]
      },
      {
        path: "/statistics-report",
        name: "统计报表",
        authority: [STATISTCS_REPORT],
        icon: "snippets",
        routes: [
          {
            path: "sendStatistics",
            name: "发货统计",
            authority: [STATISTCS_REPORT_VISIT],
            icon: "diff",
            component: "./StatisticalReport/Statistics/StatisticsReport"
          },
          {
            path: "transportDataAnalysis",
            name: "数据分析",
            authority: [DATA_ANALYSIS],
            icon: "pie-chart",
            component: "./StatisticalReport/Statistics/TransportDataAnalysis"
          },
          {
            path: "businessBoard",
            name: "运营看板",
            icon: "pie-chart",
            authority: [BUSINESS_BOARD],
            component: "./StatisticalReport/Statistics/BusinessBoard"
          }
        ]
      },
      {
        path: "/detailDriver",
        name: "司机详情",
        hideInMenu: true,
        component: "./BasicSetting/DriverManagement/AddDriver"
      },
      {
        path: "/detailCar",
        name: "车辆详情",
        hideInMenu: true,
        component: "./BasicSetting/CarManagement/CarDetail"
      },
      {
        path: "/funds-management",
        name: "资金管理",
        authority: [FUNDS],
        organizationType: [1, 3, 4],
        icon: "contacts",
        routes: [
          // 承运页面
          {
            path: "funds",
            name: "资金管理",
            authority: [FUNDS_MANAGE],
            organizationType: [1, 3, 4],
            icon: "pay-circle",
            component: "./FundManage/FundsManagement/Funds"
          },
          {
            path: "funds/fund-record",
            name: "收支记录",
            authority: [FUNDS_MANAGE_FUND_RECORD],
            organizationType: [1, 3, 4],
            icon: "pay-circle",
            hideInMenu: true,
            component: "./FundManage/FundsManagement/FundRecord"
          },
          // 平台页面
          {
            path: "CheckAccountWrap",
            name: "_对账查询",
            skipLevel: true,
            authority: [ACCOUNT_SEARCH],
            organizationType: [1],
            icon: "pay-circle",
            component: "../components/CacheWrap/CacheWrap",
            routes: [
              {
                path: "CheckAccount",
                name: "对账查询",
                authority: [ACCOUNT_SEARCH],
                organizationType: [1],
                icon: "pay-circle",
                component: "./FundManage/FundsManagement/CheckAccount"
              },
              {
                path: "CheckAccount/detail",
                name: "对账详情",
                authority: [ACCOUNT_SEARCH],
                organizationType: [1],
                icon: "pay-circle",
                hideInMenu: true,
                component: "./FundManage/FundsManagement/CheckAccountDetail"
              }
            ]
          },

          {
            path: "CustomerTransfer",
            name: "客户转账",
            authority: [FUNDS_CUSTOMER],
            organizationType: [1, 3, 4],
            icon: "pay-circle",
            component: "./FundManage/FundsManagement/Customer"
          },
          {
            path: "FundAccount",
            name: "资金账户",
            authority: [FUNDS_INSIDETRANSFER],
            organizationType: [1, 3, 4],
            icon: "pay-circle",
            component: "./FundManage/FundsManagement/FundAccount"
          },
          {
            path: "UnrecordedFunds",
            name: "未入账资金",
            authority: UNRECORDED_FUNDS,
            icon: "pay-circle",
            component: "./FundManage/FundsManagement/UnrecordedFunds"
          },
          {
            path: "BusinessDealings",
            name: "业务往来",
            authority: [FUNDS_BUSINESS_DEALINGS],
            organizationType: [1, 3, 4],
            icon: "pay-circle",
            component: "./FundManage/FundsManagement/BusinessDealings"
          },
          // {
          //   path: 'ProvisionFlow',
          //   name: '备付金资金流水明细',
          //   authority: [FUNDS_PROVISION_FLOW],
          //   organizationType:[1, 3, 4],
          //   icon: 'pay-circle',
          //   component: './FundsManagement/ProvisionFlow'
          // },
          {
            path: "BankFlowing",
            name: "流水查询",
            authority: [BANK_FLOWING],
            organizationType: [1, 3, 4],
            icon: "pay-circle",
            component: "./BankFlowings/BankFlowings"
          },
          {
            path: "RefoundList",
            name: "平台退款",
            authority: [PLAT_REFUND],
            organizationType: [1],
            icon: "pay-circle",
            component: "./FundManage/FundsManagement/RefundList"
          },
          {
            path: "customerBalance",
            name: "余额查询",
            organizationType: [1],
            authority: [CUSTOMER_BALANCE],
            icon: "pay-circle",
            component: "./CustomerBalance"
          },
          {
            path: "customerBalance/detail",
            name: "详情",
            organizationType: [1],
            icon: "pay-circle",
            hideInMenu: true,
            component: "./CustomerBalance/Detail"
          },
          {
            path: "customerBalance/fundRecord",
            name: "历史余额",
            organizationType: [1],
            icon: "pay-circle",
            hideInMenu: true,
            component: "./CustomerBalance/FundRecord"
          }
        ]
      },
      {
        path: "deviceManage",
        name: "设备管理",
        authority: [DEVICE_MANAGE],
        organizationType: [1, 5],
        icon: "laptop",
        routes: [
          // 承运页面
          {
            path: "GPSManage",
            name: "GPS设备管理",
            authority: [GPS_DEVICE_MANAGE],
            organizationType: [1, 5],
            icon: "environment",
            component: "./DeviceManage/GPSManage/List"
          }, {
            path: "GPSManage/detail",
            hideInMenu: true,
            organizationType: [1, 5],
            name: "GPS设备管理-详情",
            otherOpen: true, // 是否需要重新打开一个页面
            // authority: [TRANSPORT_CONTRACT],
            component: "./DeviceManage/GPSManage/Detail"
          }, {
            path: "GPSManage/edit",
            hideInMenu: true,
            organizationType: [1, 5],
            name: "GPS设备管理-编辑设备",
            otherOpen: true, // 是否需要重新打开一个页面
            // authority: [TRANSPORT_CONTRACT],
            component: "./DeviceManage/GPSManage/Edit"
          }, {
            path: "leaseManage",
            organizationType: [1],
            name: "设备租赁管理",
            icon: "audit",
            authority: [DEVICE_RENT_MANAGE],
            component: "./DeviceManage/LeaseManage/List"
          }, {
            path: "leaseManage/detail",
            hideInMenu: true,
            organizationType: [1, 5],
            name: "设备租赁管理-详情",
            otherOpen: true, // 是否需要重新打开一个页面
            // authority: [TRANSPORT_CONTRACT],
            component: "./DeviceManage/LeaseManage/Detail"
          }, {
            path: "accountManage",
            organizationType: [1, 5],
            name: "GPS账号管理",
            icon: "interaction",
            authority: [GPS_ACCOUNT_MANAGE],
            component: "./DeviceManage/AccountMange/List"
          }, {
            path: "accountManage/add",
            organizationType: [1, 5],
            name: "GPS账号管理-添加账号",
            hideInMenu: true,
            icon: "interaction",
            // authority: [TRANSPORT_CONTRACT],
            component: "./DeviceManage/AccountMange/Edit"
          }, {
            path: "accountManage/update",
            organizationType: [1, 5],
            name: "GPS账号管理-修改",
            otherOpen: true, // 是否需要重新打开一个页面
            hideInMenu: true,
            icon: "interaction",
            // authority: [TRANSPORT_CONTRACT],
            component: "./DeviceManage/AccountMange/Edit"
          }
        ]
      },
      {
        path: "logistics-management",
        organizationType: [4],
        authority: [INVOICE_MANAGE, ACCOUNT],
        name: "物流管理",
        icon: "audit",
        routes: [
          {
            path: "freightContract",
            name: "查看物流合同",
            icon: "audit",
            authority: [TRANSPORT_CONTRACT],
            component: "./Contract/CheckFreightContract"
          },
          {
            path: "consignmentJudgeTransportAccountList/transportAccountBillJudge",
            name: "审核",
            component: "./BillAccount/TransportAccount/subPage/AccountAudit",
            hideInMenu: true
          },
          {
            // 托运审核承运的运输对账的【对账单详情页面】中的运单详情
            path: "consignmentJudgeTransportAccountList/transportAccountBillDetail/transportDetail",
            name: "运单详情",
            component: "./BusinessCenter/Transport/subPage/TransportDetail",
            hideInMenu: true
          },

          /****************************************************************************************/
          /***********************************托运-支付物流费用**************************************/
          /****************************************************************************************/

          {
            // 托运付款单页面
            path: "paymentBillWrap",
            name: "_支付物流费用",
            icon: "pay-circle",
            authority: [PAY_BILL],
            component: "../components/CacheWrap/CacheWrap",
            skipLevel: true,
            routes: [
              {
                // 托运付款单页面
                path: "paymentBill",
                name: "支付物流费用",
                icon: "pay-circle",
                authority: [PAY_BILL],
                routes: [
                  {
                    path: "./",
                    component: "./LogisticsManage/PaymentBill/PaymentBill"
                  },
                  {
                    // 托运付款单页面
                    path: "transport",
                    name: "支付物流费用-运单列表",
                    authority: [PAY_BILL_VISIT],
                    component: "./NetTransport/NetTransportList",
                    hideInMenu: true
                  },
                  {
                    // 托运付款单详情
                    path: "detail",
                    name: "支付物流费用-付款单详情",
                    authority: [PAY_BILL_VISIT],
                    component: "./LogisticsManage/PaymentBill/Detail",
                    hideInMenu: true
                  },
                  {
                    // 托运付款凭证
                    path: "proofDetail",
                    name: "支付物流费用-付款凭证",
                    authority: [PAY_BILL_VISIT],
                    hideInMenu: true,
                    routes: [
                      {
                        path: "./",
                        component: "./LogisticsManage/PaymentBill/ProofDetail"
                      },
                      {
                        path: "transportDetail",
                        name: "支付物流费用-付款凭证-运单详情",
                        authority: [PAY_BILL_VISIT],
                        component: "./BusinessCenter/Transport/subPage/TransportDetail",
                        hideInMenu: true
                      }
                    ]
                  },
                  {
                    // 托运新建付款单页面
                    path: "create",
                    name: "支付物流费用-新建付款单",
                    authority: [PAY_BILL_CREATE],
                    hideInMenu: true,
                    routes: [
                      {
                        path: "./",
                        component: "./LogisticsManage/PaymentBill/Create"
                      },
                      {
                        // 托运审核承运的运输对账的对账单详情页面
                        path: "transportAccountBillDetail",
                        name: "支付物流费用-新建付款单-对账单详情",
                        hideInMenu: true,
                        routes: [
                          {
                            path: "./",
                            component: "./Account/subPage/TransportAccountBillDetail"
                          },
                          {
                            path: "transportDetail",
                            name: "支付物流费用-新建付款单-对账单详情-运单详情",
                            authority: [PAY_BILL_VISIT],
                            component: "./BusinessCenter/Transport/subPage/TransportDetail",
                            hideInMenu: true
                          }
                        ]
                      }
                    ]
                  }
                ]
              }
            ]
          },
          /****************************************************************************************/
          /***********************************托运-发起物流开票**************************************/
          /****************************************************************************************/
          {
            path: "invoicingWrap",
            name: "_发起物流开票",
            icon: "audit",
            authority: [INVOICE_CREATE],
            component: "../components/CacheWrap/CacheWrap",
            skipLevel: true,
            routes: [
              {
                path: "invoicing",
                name: "发起物流开票",
                icon: "audit",
                authority: [INVOICE_CREATE],
                routes: [
                  {
                    path: "./",
                    component: "./LogisticsManage/InvoicingManage/Invoicing/Invoicing"
                  },
                  {
                    path: "paymentBill",
                    skipLevel: true,
                    routes: [
                      {
                        // 收款单详情
                        path: "detail",
                        name: "发起物流开票-收款单详情",
                        organizationType: [1],
                        authority: [PAY_BILL_VISIT],
                        hideInMenu: true,
                        routes: [
                          {
                            path: "./",
                            component: "./LogisticsManage/PaymentBill/Detail"
                          },
                          // 收款单详情中的运单列表
                          {
                            path: "transportDetail",
                            name: "发起物流开票-收款单详情-运单详情",
                            organizationType: [1],
                            authority: [PAY_BILL_VISIT],
                            component: "./BusinessCenter/Transport/subPage/TransportDetail",
                            hideInMenu: true
                          }
                        ]
                      }
                    ]
                  },
                  {
                    path: "historyWrap",
                    name: "_开票历史",
                    authority: [INVOICE_CREATE],
                    component: "../components/CacheWrap/CacheWrap",
                    skipLevel: true,
                    hideInMenu: true,
                    routes: [
                      {
                        path: "history",
                        name: "发起物流开票-开票历史",
                        authority: [INVOICE_CREATE],
                        hideInMenu: true,
                        routes: [
                          {
                            path: "./",
                            component: "./LogisticsManage/InvoicingManage/Invoicing/HistoryContainer"
                          },
                          {
                            path: "modify",
                            name: "发起物流开票-开票历史-修改",
                            authority: [INVOICE_MODIFY],
                            hideInMenu: true,
                            component: "./LogisticsManage/InvoicingManage/Invoicing/Modify"
                          }
                        ]
                      }

                    ]
                  }

                ]
              }

            ]
          },


          {
            path: "/invoicing-manage",
            redirect: "invoicing"
          }
        ]
      },
      {
        path: "logistics-mystical888",
        name: "数据管理",
        organizationType: [1],
        hideInMenu: true,
        icon: "audit",
        routes: [
          {
            path: "addDriver",
            name: "数据管理-添加司机",
            icon: "audit",
            component: "./EnjoyAdding/AddDriver"
          },
          {
            path: "addCar",
            name: "数据管理-添加车辆",
            icon: "audit",
            component: "./EnjoyAdding/AddCar"
          }
        ]
      },
      {
        name: "调度大屏",
        path: "bigScreen",
        organizationType: [5],
        authority: [BIG_SCREEN],
        icon: "audit",
        component: "./BigScreen/BigScreen.jsx"
      },

      {
        name: "招投标管理",
        path: "tenderAndEmploy",
        organizationType: [1, 5],
        authority: [TENDER_BIDDER_MANAGE],
        icon: "audit",
        routes: [
          {
            name: "投标管理",
            path: "tenderBidderManage",
            organizationType: [5],
            authority: [TENDER_MANAGE],
            icon: "audit",
            component: "./TenderAndEmploy/TenderManage.jsx"
          },
          {
            name: "招标管理",
            path: "tenderManage",
            organizationType: [1],
            authority: [TENDER_MANAGE],
            icon: "audit",
            component: "./TenderAndEmploy/TenderManage.jsx"
          },
          {
            name: "招标平台",
            path: "employPlatform",
            authority: [TENDER_PLATFORM],
            organizationType: [1, 5],
            icon: "audit",
            component: "./TenderAndEmploy/EmployPlatform.jsx"
          }
        ]
      },
      {
        component: "../components/Exception/404"
      }
    ]
  }
];
