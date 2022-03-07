import Loadable from "react-loadable";
import Loading from "../components/common/loading";

// 组件demo页面
const Demo = Loadable({
  loader: () => import("../page/demo"),
  loading: Loading
});

// 首页
const Home = Loadable({
  loader: () => import("../page/home"),
  loading: Loading
});

// 招标公告
const Notice = Loadable({
  loader: () => import("../page/notice"),
  loading: Loading
});

// 招标详情
const NoticeDetail = Loadable({
  loader: () => import("../page/notice/notice-detail"),
  loading: Loading
});

// 中标详情
const resultDetail = Loadable({
  loader: () => import("../page/result/result-detail"),
  loading: Loading
});

// 我要投标
const MyBid = Loadable({
  loader: () => import("../page/notice/my-bid"),
  loading: Loading
});

// 中标结果
const Result = Loadable({
  loader: () => import("../page/result"),
  loading: Loading
});

// 招标管理
const TenderManage = Loadable({
  loader: () => import("../page/tender-manage"),
  loading: Loading
});

// 投标管理
const BiddingManage = Loadable({
  loader: () => import("../page/bidding-manage"),
  loading: Loading
});

// 招标信息
const TenderInfo = Loadable({
  loader: () => import("../page/tender-manage/tender-info"),
  loading: Loading
});

// 邀请商家
const InviteDealer = Loadable({
  loader: () => import("../page/tender-manage/invite-dealer"),
  loading: Loading
});

// 退保审核
const SurrenderReview = Loadable({
  loader: () => import("../page/tender-manage/surrender-review"),
  loading: Loading
});

// 录入评标结果
const InputResult = Loadable({
  loader: () => import("../page/tender-manage/input-result"),
  loading: Loading
});

// 查看投标信息
const LookTenderInfo = Loadable({
  loader: () => import("../page/tender-manage/look-bidding-info"),
  loading: Loading
});

// 查看投标信息打印
const LookBiddingPrint = Loadable({
  loader: () =>
    import(
      "../page/tender-manage/look-bidding-info/components/look-bidding-print"
    ),
  loading: Loading
});

// 查看评标结果
const BidEvaluationResults = Loadable({
  loader: () => import("../page/tender-manage/bid-evaluation-results"),
  loading: Loading
});
// 查看评标结果打印
const ResultPrint = Loadable({
  loader: () =>
    import(
      "../page/tender-manage/bid-evaluation-results/components/result-print"
    ),
  loading: Loading
});

// 二次报价页面
const TwoOfferPrice = Loadable({
  loader: () => import("../page/bidding-manage/two-offer-price"),
  loading: Loading
});

// 查看投标信息
const LookBiddingInfo = Loadable({
  loader: () => import("../page/bidding-manage/look-bidding-info"),
  loading: Loading
});

const routes = [
  {
    path: "/home",
    isMenu: true,
    name: "首页",
    component: Home,
    routes: [
      // {
      //   path: "/demo",
      //   name: "demo",
      //   component: Demo
      // },
      {
        path: "/notice",
        name: "招标公告",
        isMenu: true,
        component: Notice,
        cache: true,
        routes: [
          {
            path: "/notice/noticeDetail",
            name: "项目招标",
            component: NoticeDetail,
            routes: [
              {
                path: "/notice/noticeDetail/myDid",
                name: "我要投标",
                component: MyBid
              }
            ]
          }
        ]
      },
      {
        path: "/result",
        isMenu: true,
        name: "中标结果",
        cache: true,
        component: Result,
        routes: [
          {
            path: "/result/resultDetail",
            name: "中标结果公示",
            component: resultDetail,
            routes: [
              {
                path: "/result/noticeDetail/myDid",
                name: "我要投标",
                component: MyBid
              }
            ]
          }
        ]
      },
      {
        path: "/tenderManage",
        // isMenu: true,
        name: "招标管理",
        authority: [1, 4],
        cache: true,
        component: TenderManage,
        routes: [
          {
            path: "/tenderManage/tenderInfo",
            name: "发布招标信息",
            authority: [1, 4],
            component: TenderInfo
            // routes: [
            //   {
            //     path: "/notice/noticeDetail/myDid",
            //     name: "我要投标",
            //     component: MyBid
            //   }
            // ]
          },
          {
            path: "/tenderManage/inviteDealer",
            name: "邀请商家",
            authority: [1, 4],
            component: InviteDealer
          },
          {
            path: "/tenderManage/surrenderReview",
            name: "退保审核",
            authority: [1, 4],
            component: SurrenderReview
          },
          {
            path: "/tenderManage/inputResult",
            name: "录入评标结果",
            authority: [1, 4],
            component: InputResult
          },
          {
            path: "/tenderManage/updateResult",
            name: "修改评标结果",
            authority: [1, 4],
            component: InputResult
          },
          {
            path: "/tenderManage/lookBiddingInfo",
            name: "查看投标信息",
            authority: [1, 4],
            component: LookTenderInfo,
            routes: [
              {
                path: "/tenderManage/lookBiddingInfo/lookBiddingPrint",
                name: "查看投标信息打印页面",
                authority: [1, 4],
                component: LookBiddingPrint
              }
            ]
          },
          {
            path: "/tenderManage/bidEvaluationResults",
            name: "查看评标结果",
            authority: [1, 4],
            component: BidEvaluationResults,
            routes: [
              {
                path: "/tenderManage/bidEvaluationResults/resultPrint",
                name: "查看投标结果打印页面",
                authority: [1, 4],
                component: ResultPrint
              }
            ]
          }
        ]
      },
      {
        path: "/biddingManage",
        // isMenu: true,
        authority: [5],
        name: "投标管理",
        cache: true,
        component: BiddingManage,
        routes: [
          {
            path: "/biddingManage/twoOfferPrice",
            name: "二次报价",
            authority: [5],
            component: TwoOfferPrice
          },
          {
            path: "/biddingManage/surePrice",
            name: "确认报价",
            authority: [5],
            component: TwoOfferPrice
          },
          {
            path: "/biddingManage/lookBiddingInfo",
            name: "查看投标信息",
            authority: [5],
            component: LookBiddingInfo
          },
          {
            path: "/biddingManage/updateBiddingInfo",
            name: "修改投标信息",
            authority: [5],
            component: MyBid
          }
        ]
      }
    ]
  }
];

export default routes;
