// 邀请商家返回列表
export interface ITenderInvitedList {
  inviteListDetailResps: ITenderInvitedItem[];
}

// 邀请商家返回列表
export interface ITenderInvitedItem {
  organizationId: number; //机构id
  organizationName: string; //商家名称
  inviteTime: string; //邀请时间
  tenderBidderTime: string; //投标时间
}

// 邀请商家
export interface IInviteBidderParams {
  tenderId: number;
  organizationIdList: number[];
}
