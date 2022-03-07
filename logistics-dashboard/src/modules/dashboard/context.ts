import { createContext } from 'react';
import {
  CarItem,
  CarList,
  CarParams,
  GlobalParams,
  MapCarParams,
  PrebookItem,
  ProjectItem,
} from './withDashboard';

interface IContext {
  prebookList: ListItem<PrebookItem>;
  prebookOption: PrebookItem[]; // 预约单选项
  carlist: CarList;
  globalParams: GlobalParams;
  toggleFullscreen: () => void;
  fullscreen: boolean;
  carLoading: boolean;
  renderCarList: CarItem[]; // 车辆列表渲染数据
  renderMapCarList: CarItem[]; // 地图车辆渲染数据
  setCarParams: (params: CarParams) => void;
  selectedProject?: ProjectItem; //选中项目
  selectedPrebook?: PrebookItem; // 选中预约单/
  cleanSelectedPrebook: () => void; // 清除选中预约单
  cleanSelectedProject: () => void; // 清除选中项目
  listBigScreenCarImmediateStatusResps: obj[]; // 列表车辆过滤后 车辆状态统计
  listBigScreenTransportStatusResps: obj[]; // 列表车辆过滤后 运单状态统计
  dispatchBillModal: boolean;
  toggleDispatchModal: (type: 'car' | 'prebooking') => void; // 切换派车弹窗
  dispatchCarDetail: (car: CarItem) => void; // 正在派单车辆信息
  bigScreenCarStatusResps: any[]; // 地图左下角车辆统计
  mapCarParams: MapCarParams; // 地图车辆查询
  dispatchCar: CarItem; // 派单车辆
  carDistionary: any[]; // 车辆型号字典
  defaultType: 'car' | 'prebooking'; // 派单默认选中类型
  infoWindowVisible: boolean; // 信息窗体显隐
  setInfoWindow: (visible: boolean) => void; // 设置信息窗体显隐
}

// Provider,Consumer来源于同一个createContext()
const { Provider, Consumer } = createContext<IContext>(null);
export { Provider, Consumer };
