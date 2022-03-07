import React from 'react';
import { Slider, Button, message, Spin } from 'antd';
import dayjs from 'dayjs';
import { debounce, isEqual } from 'lodash';
import { Rnd } from 'react-rnd';
import { CloseOutlined } from '@ant-design/icons';
import { SliderMarks } from 'antd/lib/slider';
import style from './Map.less';
import { InfoWindow, Map, Marker } from 'react-amap';
import { Consumer } from '@/modules/dashboard/context';
import loadingCar from '@/assets/loadingCar.png';
import load from '@/assets/load.png';
import zhong from '@/assets/zhong.png';
import zhong1 from '@/assets/zhong1.png';
import canAcceptCar from '@/assets/canAcceptCar.png';
import can from '@/assets/can.png';
import ke from '@/assets/ke.png';
import ke1 from '@/assets/ke1.png';
import errorCar from '@/assets/errorCar.png';
import _error from '@/assets/error.png';
import yi from '@/assets/yi.png';
import yi1 from '@/assets/yi1.png';
import emptyCar from '@/assets/emptyCar.png';
import empty from '@/assets/empty.png';
import kong from '@/assets/kong.png';
import kong1 from '@/assets/kong1.png';
import receivingIcon from '@/assets/map_icon_unload.png';
import deliveryIcon from '@/assets/map_icon_delivery.png';
import customCenter from '@/assets/map_icon_custom_center.png';
import gpsOffline from '@/assets/gps.svg';
import DispatchModal from './dispatchModal';
import { getUserInfo } from '@/service/user';
import {
  CarItem,
  CarParams,
  MapCarParams,
  PrebookItem,
  ProjectItem,
} from '@/modules/dashboard/withDashboard';
import { mark2distance } from '@/service/map';
import { carParamsInit, carTypeDist } from '@/constants/car';
import {
  getLocation,
  getShipmentCars,
  getShipmentDrivers,
  getPlatformAllCars,
  getPlatformAllDrivers,
} from '@/service/apiService';
import { isEmpty } from '@/tools/tools';

export interface IMapProps {
  onMapCarParamsChange: (
    params: MapCarParams,
    updateLeftData?: boolean,
  ) => void;
  cleanSelectedCarParams: (params) => void;
  mapCarParams: MapCarParams; // 地图车辆查询
  mapEvents?: obj<any>;
  mapConfig: obj<any>;
  position: any;
}

interface IContext {
  renderMapCarList: CarItem[]; // 地图车辆渲染数据
  selectedProject?: ProjectItem; //选中项目
  selectedPrebook?: PrebookItem; // 选中预约单
  cleanSelectedPrebook: () => void; // 清除选中预约单
  cleanSelectedProject: () => void; // 清除选中项目
  toggleDispatchModal: (type: 'car' | 'prebooking') => void; // 切换派车弹窗
  bigScreenCarStatusResps: any[]; // 地图左下角车辆统计
  mapCarParams: MapCarParams; // 地图车辆查询
  dispatchCarDetail: (car: CarItem) => void; // 正在派单车辆信息
  carDistionary: any[]; // 车辆型号字段
  dispatchCar: obj; // 派单车辆
  dispatchBillModal: boolean; // 展示派单窗口;
  infoWindowVisible: boolean; // 信息窗体显隐
  setInfoWindow: (visible: boolean) => void; // 设置信息窗体显隐
  setCarParams: (params: CarParams) => void;
  carLoading: boolean;
}

interface IState {
  show: boolean;
  windowLng?: number; // 信息窗体位置
  windowLat?: number; // 信息窗体位置
  circleDistance: number; // 中心点距离
  gpsAddress: string; // 车辆gps地址
  shipCar: ListItem<obj<any>>;
  shipDriver: ListItem<obj<any>>;
  platCar: ListItem<obj<any>>;
  platDriver: ListItem<obj<any>>;
  isMove: boolean;
  position: obj<any>;
}

class EjdMap extends React.Component<IMapProps & IContext, IState> {
  center = {
    longitude: 104.07,
    latitude: 30.67,
  };
  distanceMark: SliderMarks = {
    5: <div className={style.markColor}>5KM</div>,
    10: <div className={style.markColor}>10KM</div>,
    15: <div className={style.markColor}>20KM</div>,
    20: <div className={style.markColor}>50KM</div>,
  };

  organizationId = getUserInfo().organizationId;

  state: IState = {
    show: false,
    windowLng: 104.07,
    windowLat: 30.67,
    circleDistance: 5,
    gpsAddress: '',
    shipCar: { items: [], count: 0 },
    shipDriver: { items: [], count: 0 },
    platCar: { items: [], count: 0 },
    platDriver: { items: [], count: 0 },
    isMove: true,
    position: { x: 100, y: 100 },
  };

  componentDidMount() {
    Promise.all([
      getShipmentCars({ limit: 100000, offset: 0 }),
      getShipmentDrivers({ limit: 100000, offset: 0 }),
    ]).then(([shipCar, shipDriver]) => {
      this.setState({
        shipCar,
        shipDriver,
      });
    });
    Promise.all([
      getPlatformAllCars({ limit: 100000, offset: 0 }),
      getPlatformAllDrivers({ limit: 100000, offset: 0 }),
    ]).then(([platCar, platDriver]) => {
      this.setState({
        platCar,
        platDriver,
      });
    });
  }

  toggleCarList = () => {
    this.setState({
      show: !this.state.show,
    });
  };

  _ondistanceChange = (value) => {
    const { onMapCarParamsChange, setCarParams } = this.props;
    const distance = mark2distance(value);
    onMapCarParamsChange({ distance: distance });
    // setCarParams({ distance: distance });
  };

  ondistanceSlide = (value) => {
    const distance = mark2distance(value);
    this.setState({
      circleDistance: distance,
    });
  };

  ondistanceChange = debounce(this._ondistanceChange, 2000, { maxWait: 10000 });

  markEvents = {
    click: (e) => {
      console.log(e.target);
      const car = e.target.De.extData;
      if (!car.carId) return;
      this.props.dispatchCarDetail(car);
      const { lat, lng } = e.target.De.position;
      getLocation({
        longitude: lng,
        latitude: lat,
      }).then((res) => {
        this.setState(
          {
            windowLng: lng,
            windowLat: lat,
            gpsAddress: res.address,
          },
          () => {
            this.props.setInfoWindow(true);
          },
        );
      });
    },
  };

  dispatchBill = () => {
    const {
      selectedPrebook: { contractItems },
    } = this.props;
    const hasNetContract = (contractItems || []).some(
      ({ contractState, isAvailable, contractType }) =>
        contractType === 2 && contractState === 2 && isAvailable,
    );
    const hasSelfContract = (contractItems || []).some(
      ({ contractState, isAvailable, contractType }) =>
        contractType !== 2 && contractState === 2 && isAvailable,
    );
    if (hasNetContract || hasSelfContract) {
      this.props.toggleDispatchModal('prebooking');
    } else {
      message.error('请先关联运输合同');
    }
  };

  renderDeliveryMarkers = () => {
    const {
      mapCarParams: { deliveryList },
    } = this.props;
    return deliveryList
      .filter(
        (delivery) =>
          delivery.deliveryLongitude &&
          delivery.deliveryLatitude &&
          delivery.deliveryLatitude < 90 &&
          delivery.deliveryLatitude > -90 &&
          delivery.deliveryLongitude < 180 &&
          delivery.deliveryLongitude > -180,
      )
      .map((delivery) => {
        return (
          <Marker
            extData={delivery}
            position={{
              latitude: delivery.deliveryLatitude,
              longitude: delivery.deliveryLongitude,
            }}
            render={() => (
              <img className={style.iconStyle} src={deliveryIcon} />
            )}
            offset={[-20, -40]}
          />
        );
      });
  };

  renderReceivingMarkers = () => {
    const {
      mapCarParams: { receivingList },
    } = this.props;
    return receivingList
      .filter(
        (receiving) =>
          receiving.receivingLongitude &&
          receiving.receivingLatitude &&
          receiving.receivingLatitude < 90 &&
          receiving.receivingLatitude > -90 &&
          receiving.receivingLongitude < 180 &&
          receiving.receivingLongitude > -180,
      )
      .map((receiving) => {
        return (
          <Marker
            extData={receiving}
            position={{
              latitude: receiving.receivingLatitude,
              longitude: receiving.receivingLongitude,
            }}
            render={() => (
              <img className={style.iconStyle} src={receivingIcon} />
            )}
            offset={[-20, -40]}
          />
        );
      });
  };

  renderMapCarMarkers = () => {
    const { renderMapCarList, dispatchCar } = this.props;
    const carlist = renderMapCarList.map((item) => {
      let yichang = false;
      if (item.carImmediateStatus === 0) {
        yichang = true;
      }
      if (carTypeDist[1].includes(item.transportImmediateStatus)) {
        return { ...item, iconType: 1, yichang };
      } else if (carTypeDist[2].includes(item.transportImmediateStatus)) {
        return { ...item, iconType: 2, yichang };
      } else if (carTypeDist[3].includes(item.transportImmediateStatus)) {
        return { ...item, iconType: 3, yichang };
      } else if (carTypeDist[4].includes(item.transportImmediateStatus)) {
        return { ...item, iconType: 4, yichang };
      }
    });
    const config = {
      1: load,
      2: can,
      3: empty,
      4: _error,
    };
    const lightConfig = {
      1: zhong,
      2: ke,
      3: kong,
      4: yi,
    };

    const yichangConfig = {
      1: zhong1,
      2: ke1,
      3: kong1,
      4: yi1,
    };
    return carlist
      .filter(
        (car) =>
          car?.longitude &&
          car?.latitude &&
          car?.latitude < 90 &&
          car?.latitude > -90 &&
          car?.longitude < 180 &&
          car?.longitude > -180,
      )
      .map((car) => {
        const isLight = car.carId === dispatchCar?.carId;
        return (
          <Marker
            extData={car}
            key={car.carId}
            events={this.markEvents}
            position={{
              latitude: car?.latitude,
              longitude: car?.longitude,
            }}
            angle={car.direction}
            render={() => (
              <>
                <div
                  style={{
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'center',
                    border: car.circle ? '2px solid red' : 'none',
                    borderRadius: '50%',
                  }}
                >
                  <img
                    className={`${style.iconStyle} ${style.trans}`}
                    src={
                      isLight
                        ? lightConfig[car.iconType || 1]
                        : car.yichang
                        ? yichangConfig[car.iconType || 1]
                        : config[car.iconType || 1]
                    }
                  />
                </div>
                <div
                  style={{
                    background: 'rgb(254,254,203)',
                    fontSize: '12px',
                    color: 'rgb(138,107,82)',
                    border: '1px solid rgb(179,172,166)',
                    whiteSpace: 'nowrap',
                    transform: `rotate(${360 - car.direction}deg)`,
                  }}
                >
                  {car.carNo}
                </div>
              </>
            )}
            offset={[-20, -20]}
          />
        );
      });
  };

  closeWindow = () => {
    this.props.setInfoWindow(false);
  };

  // 左上角搜索条件
  renderSearchTags = () => {
    const { mapCarParams } = this.props;

    const {
      carType,
      customAddress,
      deliveryList,
      receivingList,
    } = mapCarParams;
    const renderObject = {
      carType,
      customAddress,
    };
    const commonRender = () =>
      Object.keys(renderObject).map(
        (key) =>
          !isEqual(renderObject[key], carParamsInit[key]) && (
            <div>
              {renderObject[key].label}
              <CloseOutlined
                onClick={() => this.props.cleanSelectedCarParams(key)}
              />
            </div>
          ),
      );

    const deliverySiteRender = () =>
      deliveryList.length &&
      !isEqual(carParamsInit.deliveryList, deliveryList) ? (
        <div>
          {deliveryList[0].deliveryName}
          <CloseOutlined
            onClick={() => this.props.cleanSelectedCarParams('deliveryList')}
          />
        </div>
      ) : null;

    const receivingSiteRender = () =>
      receivingList.length &&
      !isEqual(carParamsInit.receivingList, receivingList) ? (
        <div>
          {receivingList[0].receivingName}
          <CloseOutlined
            onClick={() => this.props.cleanSelectedCarParams('receivingList')}
          />
        </div>
      ) : null;

    return (
      <>
        {commonRender()}
        {deliverySiteRender()}
        {receivingSiteRender()}
      </>
    );
  };

  calculateDirection = (num: Number) => {
    if (num === 0) return '北';
    if (num > 0 && num < 90) return '东北';
    if (num === 90) return '东';
    if (num > 90 && num < 180) return '东南';
    if (num === 180) return '南';
    if (num > 180 && num < 270) return '西南';
    if (num === 270) return '西';
    if (num > 270 && num < 360) return '西北';
  };

  render() {
    const {
      selectedProject,
      selectedPrebook,
      cleanSelectedPrebook,
      cleanSelectedProject,
      bigScreenCarStatusResps,
      dispatchCar,
      dispatchBillModal,
      infoWindowVisible,
      carLoading,
      mapConfig,
      position,
      mapCarParams: { hasCenter },
    } = this.props;

    const {
      windowLng,
      windowLat,
      circleDistance,
      gpsAddress,
      shipCar,
      shipDriver,
      platCar,
      platDriver,
    } = this.state;
    return (
      <div className={style.container}>
        {carLoading && (
          <div style={{ height: '100%', width: '100%', background: '#fff' }}>
            <Spin
              size="large"
              style={{
                position: 'absolute',
                top: '50%',
                left: '50%',
                zIndex: 999,
                margin: '0 auto',
              }}
            />
          </div>
        )}
        {dispatchBillModal && (
          <DispatchModal
            shipCar={shipCar}
            shipDriver={shipDriver}
            platCar={platCar}
            platDriver={platDriver}
          />
        )}
        <div className={style.searchBox}>
          当前搜索条件:
          {selectedProject && (
            <div>
              {selectedProject.projectName}
              <CloseOutlined onClick={cleanSelectedProject} />
            </div>
          )}
          {this.renderSearchTags()}
        </div>
        {selectedPrebook && (
          <div className={style.prebookBox}>
            正在处理预约单:
            <div>
              {selectedPrebook.prebookingNo}
              <CloseOutlined onClick={cleanSelectedPrebook} />
            </div>
            {!selectedPrebook?.logisticsBusinessTypeEntity?.releaseHall && (
              <Button
                onClick={() => this.dispatchBill()}
                size="small"
                style={{
                  marginLeft: '5px',
                  color: 'white',
                  background: 'rgba(12, 111, 182, 1)',
                  borderRadius: '5px',
                  fontSize: '13px',
                  width: '67px',
                  height: '25px',
                  lineHeight: '25px',
                }}
              >
                派单
              </Button>
            )}
          </div>
        )}
        <Map
          amapkey={window.envConfig.mpaWebJsKey}
          center={this.center}
          {...mapConfig}
          events={this.props.mapEvents}
        >
          {this.renderDeliveryMarkers()}
          {this.renderReceivingMarkers()}
          {this.renderMapCarMarkers()}
          <Marker
            visible={!isEmpty(position)}
            position={position}
            icon={customCenter}
          />
          <InfoWindow
            position={{
              longitude: windowLng,
              latitude: windowLat,
            }}
            offset={[0, -40]}
            visible={infoWindowVisible}
            isCustom
          >
            {dispatchCar ? (
              <div className={style.containerInfo}>
                <div className={style.title}>
                  <div>
                    <span>车牌 &nbsp;{dispatchCar.carNo}</span>
                    {dispatchCar.organizationId &&
                      dispatchCar.organizationId !== this.organizationId && (
                        <span className="color-gray">
                          {' '}
                          (该车辆为其他承运商管理，请与调度人员联系)
                        </span>
                      )}
                  </div>
                  <CloseOutlined onClick={this.closeWindow} />
                </div>
                <div className={style.content}>
                  <div className={style.left}>
                    <p>
                      {!dispatchCar.organizationId ||
                      dispatchCar.organizationId === this.organizationId
                        ? '驾驶员:'
                        : '调度人员:'}{' '}
                      {!dispatchCar.organizationId ||
                      dispatchCar.organizationId === this.organizationId ? (
                        <span>
                          {dispatchCar?.bigScreenTransportResp
                            ?.driverUserName || '--'}
                          {dispatchCar?.bigScreenTransportResp
                            ?.isRecentDriver === 1
                            ? '(近驾)'
                            : ''}
                        </span>
                      ) : (
                        <span>
                          {dispatchCar?.organizationMainNickName || '--'}
                        </span>
                      )}
                    </p>
                    <p>
                      <span>联系电话: </span>
                      {!dispatchCar.organizationId ||
                      dispatchCar.organizationId === this.organizationId ? (
                        <span>
                          {dispatchCar?.bigScreenTransportResp?.driverPhone}
                        </span>
                      ) : (
                        <span>{dispatchCar.organizationMainPhone}</span>
                      )}
                    </p>
                    <p>速度: {dispatchCar.speed || 0}km/h</p>
                    <p>
                      方向:{' '}
                      {dispatchCar.direction
                        ? this.calculateDirection(Number(dispatchCar.direction))
                        : '--'}
                    </p>
                    <p>
                      GPS时间:{' '}
                      {dispatchCar.gpsTime
                        ? dayjs(dispatchCar.gpsTime).format(
                            'YYYY-MM-DD HH:mm:ss',
                          )
                        : '--'}
                    </p>
                    <p>地址：{gpsAddress || ''}</p>
                  </div>
                  <div className={style.line} />
                  <div className={style.right}>
                    <p>
                      车辆类型:{' '}
                      {this.props.carDistionary.find(
                        (item) => item.dictionaryCode === dispatchCar.carType,
                      )?.dictionaryName || '--'}
                    </p>
                    <p>载重: {dispatchCar.carLoad}吨</p>
                    <p>车长: {dispatchCar.carLength}米</p>
                    <p>轴数: {dispatchCar.axlesNum}</p>
                    <p>车辆分组: {dispatchCar.carGroupName || '无'}</p>
                    {/*{!dispatchCar?.isSelfCar && (*/}
                    <p>车辆注册:{dispatchCar.organizationName || '无'}</p>
                    {/*)}*/}
                  </div>
                </div>
                {(!dispatchCar.organizationId ||
                  dispatchCar.organizationId === this.organizationId) && (
                  <div className={style.btn}>
                    <Button
                      type="primary"
                      onClick={() => this.props.toggleDispatchModal('car')}
                    >
                      派单
                    </Button>
                  </div>
                )}
              </div>
            ) : (
              false
            )}
          </InfoWindow>
          <div className={style.left_bottom}>
            <div
              style={{ color: '#FF6600', cursor: 'pointer' }}
              title="运输中"
              onClick={() =>
                this.props.onMapCarParamsChange(
                  {
                    carType: { type: 1, label: '运输中' },
                  },
                  false,
                )
              }
            >
              <img src={loadingCar} alt="" />
              运输中
              {bigScreenCarStatusResps[0].carNum}
            </div>
            <div
              style={{ color: '#1296DB', cursor: 'pointer' }}
              title="卸货中"
              onClick={() =>
                this.props.onMapCarParamsChange(
                  {
                    carType: { type: 2, label: '卸货中' },
                  },
                  false,
                )
              }
            >
              <img src={canAcceptCar} alt="" />
              卸货中
              {bigScreenCarStatusResps[1].carNum}
            </div>
            <div
              style={{ color: '#2AA515', cursor: 'pointer' }}
              title="空车"
              onClick={() =>
                this.props.onMapCarParamsChange(
                  {
                    carType: { type: 3, label: '空车' },
                  },
                  false,
                )
              }
            >
              <img src={emptyCar} alt="" />
              空车
              {bigScreenCarStatusResps[2].carNum}
            </div>
            <div
              style={{ color: '#D81E06', cursor: 'pointer' }}
              title="异常"
              onClick={() =>
                this.props.onMapCarParamsChange(
                  {
                    carType: { type: 4, label: '异常' },
                  },
                  false,
                )
              }
            >
              <img src={errorCar} alt="" />
              异常
              {bigScreenCarStatusResps[3].carNum}
            </div>
            <div
              style={{ color: '#8A8A8A', cursor: 'pointer' }}
              title="GPS离线"
            >
              <img src={gpsOffline} style={{ width: '30px' }} alt="" />
              GPS离线
              {bigScreenCarStatusResps[4].carNum}
            </div>
          </div>
        </Map>
        {/* 位置筛选框 */}
        <Rnd
          default={{
            x: this.state.position.x,
            y: this.state.position.y,
            width: 334,
            height: 100,
          }}
          maxHeight={100}
          maxWidth={334}
          dragAxis={this.state.isMove ? 'both' : 'none'}
          onDragStart={(e) => {
            if (e.target.className.indexOf('sliderTitle') < 0) {
              this.setState({ isMove: false });
            } else {
              this.setState({ isMove: true });
            }
          }}
          onDragStop={(_, data) => {
            this.setState({ position: { x: data.lastX, y: data.lastY } });
          }}
          bounds="parent"
        >
          <div
            className={style.distanceSlider}
            style={{ visibility: hasCenter ? 'visible' : 'hidden' }}
          >
            <div className={style.sliderTitle}>
              显示中心附近{circleDistance}KM的车辆
            </div>
            <div className={style.sliderBox}>
              <Slider
                onAfterChange={this.ondistanceChange}
                onChange={this.ondistanceSlide}
                tooltipVisible={false}
                className={style.sliderInput}
                marks={this.distanceMark}
                step={null}
                max={20}
                min={5}
              />
            </div>
          </div>
        </Rnd>
      </div>
    );
  }
}

export default class Index extends React.Component<IMapProps> {
  render() {
    return (
      <Consumer>
        {({
          renderMapCarList,
          selectedProject,
          selectedPrebook,
          cleanSelectedPrebook,
          cleanSelectedProject,
          toggleDispatchModal,
          bigScreenCarStatusResps,
          dispatchCarDetail,
          dispatchCar,
          carDistionary,
          mapCarParams,
          dispatchBillModal,
          infoWindowVisible,
          setInfoWindow,
          setCarParams,
          carLoading,
        }) => (
          <EjdMap
            {...this.props}
            renderMapCarList={renderMapCarList}
            selectedPrebook={selectedPrebook}
            selectedProject={selectedProject}
            cleanSelectedPrebook={cleanSelectedPrebook}
            cleanSelectedProject={cleanSelectedProject}
            toggleDispatchModal={toggleDispatchModal}
            bigScreenCarStatusResps={bigScreenCarStatusResps}
            dispatchCarDetail={dispatchCarDetail}
            dispatchCar={dispatchCar}
            carDistionary={carDistionary}
            mapCarParams={mapCarParams}
            dispatchBillModal={dispatchBillModal}
            infoWindowVisible={infoWindowVisible}
            setInfoWindow={setInfoWindow}
            setCarParams={setCarParams}
            carLoading={carLoading}
          />
        )}
      </Consumer>
    );
  }
}
