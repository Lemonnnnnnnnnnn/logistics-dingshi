import { IGoodsItems } from ".";

export interface INoticeProjectItem {
  title: string;
  time?: number;
  address: string;
  company: string;
  status: number;
  id: number;
  startTime: number;
  endTime: number;
  goodsItems: IGoodsItems[];
}
