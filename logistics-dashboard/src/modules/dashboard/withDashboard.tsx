import React, { Component } from 'react';
import { IRouteComponentProps } from 'umi';
import { message } from 'antd';
import { uniqBy } from 'lodash';
import { Provider } from './context';
import {
  getPrebookList,
  findBigScreenCarList,
  getProject,
  getDictionaries,
} from '@/service/apiService';
import { DateManager } from '@/pages/layout';
import { isEmpty, getDistance } from '@/tools/tools';
import { carWeighDist, carTypeDist, carParamsInit } from '@/constants/car';

export interface CarItem {
  organizationId: number;
  carId: number;
  carNo: string;
  carImmediateStatus: 0 | 1 | 2; // 车辆即时状态（0.离线，1.行驶中，2.停车)
  parkingTime: number; // 停车时长
  parkTimeDescribe: string; // 停车时长文字
  carLoad: string; // 载重
  carType: string; // 车辆类型
  axlesNum: number; // 轴数
  carLength: number; // 车长
  auditStatus: 0 | 1 | 2; // 审核状态(0.认证失败;1.已认证;2.待认证;)
  perfectStatus: 0 | 1 | 2 | 3; //完善状态 0.完善认证失败,1.完善认证成功,2.未填写3.已填写
  carGroupName: string; // 车组名称
  gpsTime: string; // GPS时间
  longitude: number; // 经度
  latitude: number; // 纬度
  direction: number; // 方向
  speed: number; // 车速
  driverUserName: string; // 司机名称
  driverPhone: string; // 司机电话
  transportImmediateStatus: number; //运单即时状态
  isSelfCar: boolean; // 是否自己车辆
  transportNo?: string; // 运单号
  circle?: boolean; // 是否被关键词选中
}

export interface PrebookItem {
  prebookingId: number;
  prebookingNo: string;
  deliveryItems: DeliveryItem[];
  receivingItems: ReceivingItem[];
  projectName: string;
  prebookingObjectId: number;
  acceptanceTime: string;
  prebookingRemark: string;
  contractItems: obj<any>[];
  logisticsBusinessTypeEntity: obj<any>; //业务配置
}

export interface ProjectItem {
  projectId: number;
  projectName: string;
  preWaitDispatch: number; // 预约单待确定数量
  preDispatching: number; // 预约单待调度数量
}

export interface PrebookParams {
  order?: 'asc' | 'desc'; // 排序
  limit?: 10;
  offset?: number;
  prebookingStatus?: string;
}

interface DeliveryItem {
  deliveryId: number;
  prebookingCorrelationId?: number;
  prebookingObjectId: number;
  name: string;
  firstCategoryName: string;
  goodsName: string;
  goodsId: number;
  categoryName: string; // 类目名称
  address: string;
  goodsUnit: number; // 单位编码
}

interface ReceivingItem {
  receivingId: number;
  prebookingCorrelationId?: number;
  prebookingObjectId: number;
  address: string;
  name: string;
  goodsId: number;
}

export type DistanceMark = 5 | 10 | 20 | 50;

export interface CarParams {
  selectType?: Number; // 查询类型
  limit?: 50;
  carBelong?: 1 | 2;
  vagueSelect?: string;
  carImmediateStatus?: Number; // 车辆状态
  keyword?: string; // 搜索关键词
  transportImmediateStatus?: number; // 运单即时状态
  carGroupName?: string; // 车组名称
  hasDeliveryCircle?: boolean; // 是否以提货点为中心
  hasReceivingCircle?: boolean; // 是否以卸货点点为中心
  isSelfCar?: boolean; // 是否只显示我的车辆
  distance?: number; // 中心点距离,
}

export interface GlobalParams {
  projectId?: number;
}

export interface CarList {
  bigScreenListResps: CarItem[]; // 车辆数据
  bigScreenCarImmediateStatusResps: obj<any>[]; // 车辆大屏即时状态统计列表
  bigScreenCarStatusResps: obj<any>[]; //车辆大屏状态列表
  bigScreenTransportStatusResps: obj<any>[]; //运单大屏即时状态列表
  deliveryItems: obj<any>[]; // 提货点数据
  receivingItems: obj<any>[]; // 卸货点数据
}

interface CarTypeItems {
  type: number;
  label: string;
}

interface CustomAddressItems {
  longitude: number;
  latitude: number;
  label: string;
}

export interface MapCarParams {
  deliveryList?: obj<any>[]; // 提货点列表
  receivingList?: obj<any>[]; // 卸货点列表
  hasCenter?: boolean; // 是否展示所有车辆  选完提卸货点、自定义地点后设为true，计算distance参数
  isSelfCar?: boolean; // 是否只显示我的车辆
  distance?: number; // 中心点距离
  keyword?: string; // 搜索关键词
  carType?: CarTypeItems; // 车辆类型
  customAddress?: CustomAddressItems; // 自定义地址
}

interface IState {
  carlist: CarList; // 车辆列表
  carDetail: CarItem; // 车辆详情
  projectList: ListItem<ProjectItem>; // 项目列表(左上角下拉框)
  prebookList: ListItem<PrebookItem>; // 预约单列表
  prebookOption: PrebookItem[]; // 预约单选项
  globalParams: GlobalParams; // 全局查询参数
  carParams: CarParams; // 车辆查询参数
  mapCarParams: MapCarParams; // 地图车辆查询
  prebookParams: PrebookParams; // 预约单查询参数
  // dispatchVisable: boolean; // 派车弹窗状态
  // prebookVisable: boolean; // 预约单弹窗状态
  fullscreen: boolean; // 全屏
  projectLoding: boolean; // 项目加载状态
  carLoading: boolean; // 车辆加载状态
  renderCarList: CarItem[]; // 车辆列表渲染数据
  renderMapCarList: CarItem[]; // 地图车辆渲染数据
  mapCarList: CarItem[]; // 全局车辆列表，以运单状态权重最高为标准
  selectedProject: ProjectItem; //选中项目
  selectedPrebook: PrebookItem; // 选中预约单
  listBigScreenCarImmediateStatusResps: obj[]; // 列表车辆过滤后 车辆状态统计
  listBigScreenTransportStatusResps: obj[]; // 列表车辆过滤后 运单状态统计
  dispatchBillModal: boolean; // 展示派单窗口;
  bigScreenCarStatusResps: any[]; // 地图车辆统计
  dispatchCar: CarItem; // 派单车辆
  carDistionary: any[]; // 车辆型号字典
  defaultType?: 'car' | 'prebooking'; // 派单默认选中类型
  infoWindowVisible: boolean; // 信息窗体显隐
  mapConfig: obj<any>; // 地图移动经纬度
  position: obj<any>; // 地图经纬度marker
}

interface IDashBoardProps extends IRouteComponentProps {}

export function withStatistics(
  WrappedComponent: React.ComponentType<DateManager>,
) {
  return class extends React.Component<IDashBoardProps, IState> {
    timer = null;

    readonly state: IState = {
      dispatchBillModal: false,
      carlist: {
        bigScreenListResps: [],
        bigScreenCarImmediateStatusResps: [],
        bigScreenCarStatusResps: [],
        bigScreenTransportStatusResps: [],
        deliveryItems: [],
        receivingItems: [],
      },
      listBigScreenCarImmediateStatusResps: [
        { carImmediateStatus: 0, carNum: 0 },
        { carImmediateStatus: 1, carNum: 0 },
        { carImmediateStatus: 2, carNum: 0 },
      ],
      listBigScreenTransportStatusResps: [
        { transportScreenStatus: 0, transportNum: 0 },
        { transportScreenStatus: 1, transportNum: 0 },
        { transportScreenStatus: 2, transportNum: 0 },
        { transportScreenStatus: 3, transportNum: 0 },
      ],
      bigScreenCarStatusResps: [
        { carScreenStatus: 0, carNum: 0 },
        { carScreenStatus: 1, carNum: 0 },
        { carScreenStatus: 2, carNum: 0 },
        { carScreenStatus: 3, carNum: 0 },
        { carScreenStatus: 4, carNum: 0 },
      ],
      renderCarList: [],
      renderMapCarList: [],
      mapCarList: [],
      carLoading: false,
      carDetail: null,
      projectList: { count: 0, items: [] },
      prebookList: { count: 0, items: [] },
      prebookOption: [],
      globalParams: {},
      carParams: {},
      mapCarParams: carParamsInit,
      prebookParams: {
        order: 'desc',
        limit: 10,
        offset: 0,
        prebookingStatus: '0',
      },
      selectedPrebook: null,
      selectedProject: null,
      fullscreen: false,
      projectLoding: true,
      dispatchCar: null,
      carDistionary: [],
      infoWindowVisible: false,
      mapConfig: {},
      position: {},
    };

    componentDidMount() {
      if (localStorage.getItem('token_storage')) {
        getProject({ limit: 10000, offset: 0, isNeedPreBooking: true }).then(
          (projectList) => {
            this.setState({
              projectList,
              projectLoding: false,
            });
          },
        );

        this.getCarList();

        getDictionaries({}).then(({ items }) => {
          this.setState({
            carDistionary: items,
          });
        });
      }
    }

    // 修改中心点经纬度
    setCenterLocation = ({ mapConfig, addressName }) => {
      this.moveMap(mapConfig.center);
      this.setPosition(mapConfig.center);

      const customAddress = {
        longitude: mapConfig.center.longitude,
        latitude: mapConfig.center.latitude,
        label: addressName,
      };

      this.getCustomCarList({ customAddress });
    };

    // 切换派单窗口
    toggleDispatchModal = (defaultType: 'car' | 'prebooking') => {
      this.setState({
        dispatchBillModal: !this.state.dispatchBillModal,
        defaultType,
      });
    };

    // 全屏
    toggleFullscreen = () => {
      const { fullscreen } = this.state;
      this.setState({
        fullscreen: !fullscreen,
      });
    };

    // 重置全屏
    resetFullscreen = () => {
      this.setState(
        {
          fullscreen: false,
        },
        () => {},
      );
    };

    // 预约单参数变化
    onPrebookParamsChange = (
      params: PrebookParams,
      pageReset: boolean = false,
    ) => {
      if (isEmpty(params)) return;
      const resetParams = pageReset ? { offset: 0 } : {};
      const { prebookParams } = this.state;
      const newPrebookParams = {
        ...prebookParams,
        ...params,
        ...resetParams,
      };
      this.setState(
        {
          prebookParams: newPrebookParams,
        },
        () => {
          const { prebookParams, globalParams } = this.state;
          if (!globalParams.projectId) {
            message.error('请先选择项目');
            return;
          }
          getPrebookList({ ...prebookParams, ...globalParams }).then(
            (prebookList) => {
              this.setState({
                prebookList,
              });
            },
          );
        },
      );
    };

    // 设置正在派单的车辆信息
    dispatchCarDetail = (car: CarItem) => {
      this.setState({
        dispatchCar: car,
      });
    };

    setDefault = () => {
      const defaultState = {
        dispatchBillModal: false,
        carlist: {
          bigScreenListResps: [],
          bigScreenCarImmediateStatusResps: [],
          bigScreenCarStatusResps: [],
          bigScreenTransportStatusResps: [],
          deliveryItems: [],
          receivingItems: [],
        },
        listBigScreenCarImmediateStatusResps: [
          { carImmediateStatus: 0, carNum: 0 },
          { carImmediateStatus: 1, carNum: 0 },
          { carImmediateStatus: 2, carNum: 0 },
        ],
        listBigScreenTransportStatusResps: [
          { transportScreenStatus: 0, transportNum: 0 },
          { transportScreenStatus: 1, transportNum: 0 },
          { transportScreenStatus: 2, transportNum: 0 },
          { transportScreenStatus: 3, transportNum: 0 },
        ],
        bigScreenCarStatusResps: [
          { carScreenStatus: 0, carNum: 0 },
          { carScreenStatus: 1, carNum: 0 },
          { carScreenStatus: 2, carNum: 0 },
          { carScreenStatus: 3, carNum: 0 },
          { carScreenStatus: 4, carNum: 0 },
        ],
        renderCarList: [],
        renderMapCarList: [],
        prebookList: { count: 0, items: [] },
        prebookParams: {
          order: 'desc',
          limit: 10,
          offset: 0,
          prebookingStatus: '0',
        } as PrebookParams,
        selectedProject: null,
        selectedPrebook: null,
        carDetail: null,
        dispatchCar: null,
      };
      this.setState(defaultState);
    };

    onSelectPrebook = (prebook: PrebookItem) => {
      this.setState({
        selectedPrebook: prebook,
      });
    };

    cleanSelectedPrebook = () => {
      this.setState({
        selectedPrebook: null,
      });
    };

    cleanSelectedProject = () => {
      // this.onGlobalParamsChange({ projectId: null });
      this.setState(
        {
          selectedPrebook: null,
          prebookList: { items: [], count: 0 },
          prebookOption: [],
          globalParams: { projectId: null },
        },
        () => {
          this.setInfoWindow(false);
          this.getCarList();
        },
      );
      this.setDefault();
    };

    cleanSelectedCarParams = (paramsName) => {
      const { mapCarParams } = this.state;
      if (paramsName === 'customAddress') {
        // 取消自定义地址后需要重新发送请求，并重置显示中心按钮
        this.setState(
          {
            mapCarParams: {
              ...mapCarParams,
              hasCenter: false,
              customAddress: carParamsInit.customAddress,
            },
            mapConfig: {},
            position: {},
          },
          () => {
            this.getCarList();
          },
        );
      } else if (
        paramsName === 'deliveryList' ||
        paramsName === 'receivingList'
      ) {
        // 取消提卸货点筛选后，并重置显示中心按钮
        this.setState(
          { mapCarParams: { ...mapCarParams, hasCenter: false } },
          () => {
            this.onMapCarParamsChange({
              [paramsName]: carParamsInit[paramsName],
            });
          },
        );
      } else {
        this.onMapCarParamsChange({ [paramsName]: carParamsInit[paramsName] });
      }
    };

    // 发送请求并更新车辆数据
    getCarList = (params?: object) => {
      const request = () => {
        if (params) {
          return findBigScreenCarList(params);
        } else {
          return findBigScreenCarList();
        }
      };

      this.setState({ carLoading: true });
      request().then((carlist) => {
        // 更新提卸货点，刷新车辆数据
        this.setState(
          {
            carlist,
            carLoading: false,
          },
          () => {
            this.filterCarList();
            const mapCarList = this.filterMapCarList();
            this.setCarPolling(mapCarList);
          },
        );
      });
    };

    // 根据经纬度获取车辆列表
    getCustomCarList = (params) => {
      const {
        mapCarParams,
        globalParams: { projectId },
      } = this.state;
      this.setState({
        mapCarParams: {
          ...mapCarParams,
          ...params,
          hasCenter: true,
          deliveryList: [],
          receivingList: [],
        },
      });

      const latitudeLongitudesJSON = JSON.stringify([params]);
      const newParams = { latitudeLongitudesJSON, projectId };
      if (!projectId) delete newParams.projectId;

      this.getCarList(newParams);
    };

    // 设置车辆前端筛选条件
    setCarParams = (params: CarParams) => {
      this.setState(
        (pre) => ({
          carParams: {
            ...pre.carParams,
            ...params,
          },
        }),
        () => {
          this.filterCarList();
        },
      );
    };

    /*
     * 按筛选条件过滤
     * 更新 车辆列表 渲染数据
     * */
    filterCarList() {
      const {
        carlist,
        carParams,
        mapCarParams: { keyword },
      } = this.state;
      const { bigScreenListResps = [] } = carlist;
      const {
        carGroupName,
        carImmediateStatus,
        transportImmediateStatus,
        // keyword,
      } = carParams;
      let tempArr = bigScreenListResps;
      const listBigScreenCarImmediateStatusResps = [
        { carImmediateStatus: 0, carNum: 0 },
        { carImmediateStatus: 1, carNum: 0 },
        { carImmediateStatus: 2, carNum: 0 },
      ];
      const listBigScreenTransportStatusResps = [
        { transportScreenStatus: 0, transportNum: 0 },
        { transportScreenStatus: 1, transportNum: 0 },
        { transportScreenStatus: 2, transportNum: 0 },
        { transportScreenStatus: 3, transportNum: 0 },
      ];
      // 搜索
      if (keyword && keyword.trim()) {
        tempArr = tempArr.filter(
          (item) =>
            item?.carNo?.indexOf(keyword.trim()) >= -0 ||
            item?.transportNo?.indexOf(keyword.trim()) >= 0,
        );
      }
      // 筛选车组
      if (carGroupName) {
        tempArr = tempArr.filter((item) => {
          if (carGroupName !== '无') return item.carGroupName === carGroupName;
          return !item.carGroupName;
        });
      }

      if (!isEmpty(carImmediateStatus)) {
        tempArr = tempArr.filter(
          (item) => item.carImmediateStatus === carImmediateStatus,
        );
      }
      // 运单状态筛选
      if (!isEmpty(transportImmediateStatus)) {
        tempArr = tempArr.filter(
          (item) => item.transportImmediateStatus === transportImmediateStatus,
        );
      }
      // 根据当前地图筛选信息筛选
      tempArr = this.filterMaptoListCarList(tempArr);

      // 统计
      uniqBy(tempArr, 'carNo').forEach((item) => {
        // 车辆
        if (item.carImmediateStatus === 0)
          listBigScreenCarImmediateStatusResps[0].carNum += 1;
        if (item.carImmediateStatus === 1)
          listBigScreenCarImmediateStatusResps[1].carNum += 1;
        if (item.carImmediateStatus === 2)
          listBigScreenCarImmediateStatusResps[2].carNum += 1;
      });

      tempArr.forEach((item) => {
        // 运单统计
        /*
         * 0 ： 运输中
         * 1 ： 超时
         * 2 ： 待审核
         * 3 ： 异常
         * */
        if (carTypeDist[1].includes(item.transportImmediateStatus))
          listBigScreenTransportStatusResps[0].transportNum += 1;
        if (carTypeDist[6].includes(item.transportImmediateStatus))
          listBigScreenTransportStatusResps[1].transportNum += 1;
        if (carTypeDist[5].includes(item.transportImmediateStatus))
          listBigScreenTransportStatusResps[2].transportNum += 1;
        if (carTypeDist[4].includes(item.transportImmediateStatus))
          listBigScreenTransportStatusResps[3].transportNum += 1;
      });

      this.setState({
        renderCarList: tempArr,
        listBigScreenCarImmediateStatusResps,
        listBigScreenTransportStatusResps,
      });
    }

    /*
     * 地图条件筛选列表车辆
     * 仅用于配合filterCarList方法
     * 从filterMapCarList独立出来的原因有：
     * 1. 关键词搜索要单独处理
     * 2. 初始待筛选数组不同
     * 3. 不修改左下角数据
     * */
    filterMaptoListCarList = (tempArr): CarItem[] => {
      const { mapCarParams } = this.state;
      const {
        distance,
        isSelfCar,
        deliveryList,
        receivingList,
        customAddress: { longitude, latitude },
        hasCenter,
        carType,
      } = mapCarParams;

      let deliveryCarIdList: number[] = [];
      let receivingCarIdList: number[] = [];

      if (hasCenter) {
        if (deliveryList.length || receivingList.length) {
          deliveryList.forEach((delivery) => {
            delivery.carIdDistanceList.forEach((distanceObj) => {
              if (distanceObj.distance > distance * 1000) return;
              deliveryCarIdList.push(...distanceObj.carIdList);
            });
          });

          receivingList.forEach((receiving) => {
            receiving.carIdDistanceList.forEach((distanceObj) => {
              if (distanceObj.distance > distance * 1000) return;
              receivingCarIdList.push(...distanceObj.carIdList);
            });
          });
          const carIdList = deliveryCarIdList.concat(receivingCarIdList);
          tempArr = tempArr.filter((car) => carIdList.includes(car.carId));
        } else {
          // 距离筛选
          tempArr = tempArr.filter((car) => {
            const params = {
              latOne: latitude,
              latTwo: car.latitude,
              lngOne: longitude,
              lngTwo: car.longitude,
            };
            const km = getDistance(params);
            return km <= distance * 1000;
          });
        }
      }

      // 根据车辆类型筛选
      tempArr = tempArr.filter((item) =>
        carTypeDist[carType.type].includes(item.transportImmediateStatus),
      );

      // 根据自选车辆筛选
      if (isSelfCar) {
        tempArr = tempArr.filter((car) => car.isSelfCar);
      }

      return tempArr;
    };

    // 统计地图左下角车辆
    calculateMapCar = () => {
      const { renderMapCarList } = this.state;
      const bigScreenCarStatusResps = [
        { carScreenStatus: 0, carNum: 0 },
        { carScreenStatus: 1, carNum: 0 },
        { carScreenStatus: 2, carNum: 0 },
        { carScreenStatus: 3, carNum: 0 },
        { carScreenStatus: 4, carNum: 0 },
      ];
      renderMapCarList.forEach((item) => {
        if (carTypeDist[1].includes(item.transportImmediateStatus)) {
          bigScreenCarStatusResps[0].carNum += 1;
        } else if (carTypeDist[2].includes(item.transportImmediateStatus)) {
          bigScreenCarStatusResps[1].carNum += 1;
        } else if (carTypeDist[3].includes(item.transportImmediateStatus)) {
          bigScreenCarStatusResps[2].carNum += 1;
        } else if (carTypeDist[4].includes(item.transportImmediateStatus)) {
          bigScreenCarStatusResps[3].carNum += 1;
        }
        if (item.carImmediateStatus === 0) {
          bigScreenCarStatusResps[4].carNum += 1;
        }
      });
      this.setState({
        bigScreenCarStatusResps,
      });
    };

    // 选择项目后需要更新的数据
    updateData = () => {
      const { prebookParams, globalParams, carParams } = this.state;
      this.setState({
        carLoading: true,
        selectedPrebook: null,
      });
      getPrebookList({ ...prebookParams, ...globalParams }).then(
        (prebookList) => {
          this.setState({
            prebookList,
          });
        },
      );
      getPrebookList({
        ...globalParams,
        prebookingStatusArr: '0,1',
        limit: 10000,
        offset: 0,
      }).then(({ items }) => {
        this.setState({
          prebookOption: items,
        });
      });
      // 获取当前项目车辆、提卸货点数据
      this.getCarList(globalParams);
    };

    // 全局参数变化
    onGlobalParamsChange = (params: GlobalParams) => {
      if (isEmpty(params)) return;
      // 增加个选中当前项目实体预留
      if (params.projectId) {
        const selectedProject = this.state.projectList.items.find(
          (item) => item.projectId === params.projectId,
        );
        this.setState({
          selectedProject,
        });
      }
      const { globalParams } = this.state;
      const newGlobalParams = {
        ...globalParams,
        ...params,
      };
      this.setState(
        {
          globalParams: newGlobalParams,
        },
        () => {
          this.setInfoWindow(false);
          this.updateData();
        },
      );
    };

    // 筛选车辆
    onMapCarParamsChange = (params: MapCarParams, updateLeftData?: boolean) => {
      if (isEmpty(params)) return;
      const { mapCarParams } = this.state;
      const newCarParams = {
        ...mapCarParams,
        ...params,
      };
      this.setState(
        {
          mapCarParams: newCarParams,
        },
        () => {
          this.filterCarList();
          const mapCarList = this.filterMapCarList(updateLeftData);
          this.setCarPolling(mapCarList);
        },
      );
    };

    // 移动地图
    moveMap = ({ longitude, latitude }) => {
      this.setState({
        mapConfig: {
          zoom: 15,
          center: {
            longitude,
            latitude,
          },
        },
      });
    };
    // 建立红标
    setPosition = (position) => {
      this.setState({
        position,
      });
    };

    // 筛选地图展示车辆
    filterMapCarList = (updateLeftData = true): CarItem[] => {
      const { carlist, mapCarParams, mapCarList: _mapCarList } = this.state;
      const {
        distance,
        isSelfCar,
        keyword,
        deliveryList,
        receivingList,
        customAddress: { longitude, latitude },
        hasCenter,
        carType,
      } = mapCarParams;
      const { bigScreenListResps = [] } = carlist;

      /*
       * 一辆车可以有多条运单，遍历该车的所有运单，筛选出优先级最高的状态在地图上进行展示
       * 车辆类型展示规则： 异常>运输中>卸货中>空车
       * 车辆样式颜色按全局状态来展示
       * */
      let mapCarList = [];

      if (!_mapCarList.length) {
        let currentCar = bigScreenListResps[0]; // 状态权重最高的车辆
        for (let i = 1; i < bigScreenListResps.length; i++) {
          /*
           * 如果这一辆车和上一辆不是同一辆车
           * 1. 把权重最高的车辆放入待筛选列表中
           * 2. 把当前车辆设为权重最高的车辆
           * */
          if (bigScreenListResps[i].carId !== currentCar.carId) {
            mapCarList.push(currentCar);
            currentCar = bigScreenListResps[i];
          } else {
            // 如果这一辆车和上一辆是同一辆车，则比对权重
            if (
              carWeighDist[bigScreenListResps[i]?.transportImmediateStatus] >
              carWeighDist[currentCar?.transportImmediateStatus]
            ) {
              currentCar = bigScreenListResps[i];
            }
            // 如果是最后一辆车，把权重最高的车辆放入待筛选列表中
            if (i === bigScreenListResps.length - 1) {
              mapCarList.push(currentCar);
            }
          }
        }
        this.setState({ mapCarList });
      } else {
        // mapCarList = _mapCarList
        mapCarList = uniqBy(bigScreenListResps, 'carNo');
        mapCarList.forEach((car) => {
          const currentCar = _mapCarList.find(
            (_car) => _car.carId === car.carId,
          );
          car.transportImmediateStatus = currentCar?.transportImmediateStatus;
        });
      }

      let deliveryCarIdList: number[] = [];
      let receivingCarIdList: number[] = [];

      /*
       * 如果有中心：
       * 1. 提货点，卸货点为空，根据 经纬度+distance计算距离
       * 2. 提货点或卸货点不为空： 根据列表和distance计算距离
       * */
      if (hasCenter) {
        if (deliveryList.length || receivingList.length) {
          if (deliveryList.length) {
            deliveryList.forEach((delivery) => {
              delivery.carIdDistanceList.forEach((distanceObj) => {
                if (distanceObj.distance > distance * 1000) return;
                deliveryCarIdList.push(...distanceObj.carIdList);
              });
            });
          }

          if (receivingList.length) {
            receivingList.forEach((receiving) => {
              receiving.carIdDistanceList.forEach((distanceObj) => {
                if (distanceObj.distance > distance * 1000) return;
                receivingCarIdList.push(...distanceObj.carIdList);
              });
            });
          }

          const carIdList = deliveryCarIdList.concat(receivingCarIdList);
          mapCarList = mapCarList.filter((car) =>
            carIdList.includes(car.carId),
          );
        } else {
          // 距离筛选
          mapCarList = mapCarList.filter((car) => {
            const params = {
              latOne: latitude,
              latTwo: car.latitude,
              lngOne: longitude,
              lngTwo: car.longitude,
            };
            const km = getDistance(params);
            return km <= distance * 1000;
          });
        }
      }

      // 根据自有车辆筛选
      if (isSelfCar) {
        mapCarList = mapCarList.filter((car) => car.isSelfCar);
      }

      // 根据车牌号、运单号搜索
      if (keyword && keyword.trim()) {
        mapCarList.forEach((car) => {
          if (
            car?.carNo?.indexOf(keyword.trim()) >= -0 ||
            car?.transportNo?.indexOf(keyword.trim()) >= 0
          ) {
            car.circle = true;
          } else {
            car.circle = false;
          }
        });
      } else {
        mapCarList.forEach((car) => {
          car.circle = false;
        });
      }

      // 根据车辆类型筛选
      const renderMapCarList = mapCarList.filter((item) =>
        carTypeDist[carType.type].includes(item?.transportImmediateStatus),
      );

      this.setState({ renderMapCarList }, () => {
        // 修改左下角数据
        if (updateLeftData) this.calculateMapCar();
      });
      return mapCarList;
    };

    /*
     * socket更新 车辆列表 渲染数据
     * */
    updateMapRenderCarList = (newValue) => {
      const { renderMapCarList: defaultList } = this.state;
      const temp = defaultList.map((defaultCarItem) =>
        Object.assign(
          {},
          defaultCarItem,
          newValue.find((newItem) => newItem.carId === defaultCarItem.carId),
        ),
      );
      this.setState({
        renderCarList: temp,
      });
    };

    // 设置车辆轮询
    setCarPolling = (carList) => {
      const carListStr = carList.map((car) => car.carNo).join(',');
      if (this.timer) {
        clearInterval(this.timer);
      }
      this.timer = setInterval(() => {
        window.ejdSocket.sendMessage({
          type: 1,
          content: JSON.stringify(carListStr),
        });
      }, 600000);
    };

    setInfoWindow = (visible) => {
      this.setState({
        infoWindowVisible: visible,
      });
    };

    render() {
      const {
        prebookList,
        prebookOption,
        prebookParams,
        globalParams,
        carlist,
        fullscreen,
        projectList,
        renderCarList,
        renderMapCarList,
        projectLoding,
        carLoading,
        // deliveryList,
        // receivingList,
        selectedProject,
        mapCarParams,
        listBigScreenCarImmediateStatusResps,
        listBigScreenTransportStatusResps,
        selectedPrebook,
        dispatchBillModal,
        bigScreenCarStatusResps,
        dispatchCar,
        defaultType,
        carDistionary,
        infoWindowVisible,
        mapConfig,
        position,
      } = this.state;
      const {
        toggleFullscreen,
        resetFullscreen,
        onGlobalParamsChange,
        onPrebookParamsChange,
        // onCarParamsChange,
        onMapCarParamsChange,
        setCarParams,
        onSelectPrebook,
        cleanSelectedPrebook,
        cleanSelectedProject,
        toggleDispatchModal,
        dispatchCarDetail,
        updateMapRenderCarList,
        setInfoWindow,
        getCustomCarList,
        setCenterLocation,
        cleanSelectedCarParams,
        moveMap,
        setPosition,
      } = this;
      return (
        <Provider
          value={{
            carlist,
            renderCarList,
            renderMapCarList,
            toggleFullscreen,
            fullscreen,
            carLoading,
            setCarParams,
            selectedProject,
            selectedPrebook,
            listBigScreenCarImmediateStatusResps,
            listBigScreenTransportStatusResps,
            globalParams,
            cleanSelectedPrebook,
            cleanSelectedProject,
            dispatchBillModal,
            toggleDispatchModal,
            prebookList,
            prebookOption,
            dispatchCarDetail,
            bigScreenCarStatusResps,
            dispatchCar,
            carDistionary,
            defaultType,
            mapCarParams,
            infoWindowVisible,
            setInfoWindow,
          }}
        >
          <WrappedComponent
            onPrebookParamsChange={onPrebookParamsChange}
            onGlobalParamsChange={onGlobalParamsChange}
            // onCarParamsChange={onCarParamsChange}
            prebookList={prebookList}
            projectList={projectList}
            projectLoding={projectLoding}
            prebookParams={prebookParams}
            fullscreen={fullscreen}
            resetFullscreen={resetFullscreen}
            onSelectPrebook={onSelectPrebook}
            updateMapRenderCarList={updateMapRenderCarList}
            onMapCarParamsChange={onMapCarParamsChange}
            // updateMapCarList={updateMapCarList}
            getCustomCarList={getCustomCarList}
            setCenterLocation={setCenterLocation}
            mapConfig={mapConfig}
            position={position}
            mapCarParams={mapCarParams}
            cleanSelectedCarParams={cleanSelectedCarParams}
            moveMap={moveMap}
            setPosition={setPosition}
          />
        </Provider>
      );
    }
  };
}
