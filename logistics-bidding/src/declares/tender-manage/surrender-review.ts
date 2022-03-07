export interface IRefundEarnestMoneyReqs {
  tenderBidderPackageId: number; // 投标包件表ID
  refundApplyRemark: string; // 保证金缴纳时间
  earnestMoney: number; // 投标保证金
  applyOrganizationName: string; // 申请商家
  packageSequence: number; // 包件顺位
  contactName: string; // 联系人
  contactPhone: string; // 联系电话
  tenderPackageTitles: string[];
  earnestMoneyApplyTime: string;
}

export interface IEvaluationReqs {
  tenderId: number;
  tenderTitle: string;
  tenderNo: string;
  priceConfirmTime: string | null;
  shipmentListDetailResps: IShipmentListDetailResps[];
}
export interface IShipmentListDetailResps {
  tenderId: number;
  tenderTitle: string;
  tenderNo: string;
  shipmentListDetailResps: IShipmentListDetailResps[];
}
export interface IShipmentListDetailResps {
  tenderPackageId: number;
  tenderPackageTitle: string;
  orgDataResps: Array<{
    organizationId: number;
    organizationName: string;
    tenderBidderPackageStatus: number;
    bidderSequence: number | null
  }>;
}

export interface IEvaluationParams {
  tenderEvaluationResult: string; //评标说明
  isShowPrice: number; //是否展示价格:0.不展示,1.展示
  evaluationOperate: number; //评标操作 1.保存草稿 2.保存并公示
  tenderPackageEvaluationReqs?: [
    {
      //包件评价信息
      tenderPackageId: number; //招标包件id
      isAbortive: number; //是否流标 0.没流标,1.流标
      organizationEvaluationReqs: [
        {
          //投标机构评价列表
          organizationId: number; //投标机构id
          isWinBid: number; //是否中标 0.未中标 1.已中标
          bidderSequence: number; //投标顺位
        }
      ];
    }
  ];
}
export interface IConfirmPriceParams {
  priceConfirmTime: string; //价格确认截止时间
  confirmPriceDetailReqs: IConfirmPriceDetailReqs[];
}
export interface IConfirmPriceDetailReqs {
  tenderPackageId: number; //招标包件表ID
  tenderBidderId: number; //投标者表id
  tenderBidderPackageId: number; //投标包件表ID
  packageCorrelationId: number; //包件关联id
  organizationId: number; //机构id
  taxContain: number; // 含税运费（元/吨）
  taxNotContain: number; // 不含税运费（元/吨）
}
