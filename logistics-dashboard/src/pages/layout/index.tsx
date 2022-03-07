import React from 'react';
import { login } from '@/service/apiService';
import { setUserInfo } from '@/service/user';
import style from './index.less';
import Prebooking, { IPrebookProps } from '@/components/prebooking/Prebooking';
import Header, { IProps as IHeaderProps } from '@/components/header/Header';
import Map, { IMapProps } from '@/components/content/Map';
import { withStatistics } from '@/modules/dashboard/withDashboard';
import EjdSocket, { IEjdSocketProps } from '@/modules/socket';
import { CaretLeftOutlined, CaretRightOutlined } from '@ant-design/icons';
import { message } from 'antd';

export interface LoginParams {
  userName: number;
  password: string;
  scope: 'SHIPMENT' | 'PLATFORM' | 'CONSIGNMENT' | 'DRIVER' | 'CARGO';
}

interface IState {
  prebookListVisable: boolean;
  showPage: boolean;
  mapConfig: obj<any>;
  position: obj<any>;
}

interface SystemProps {
  fullscreen: boolean;
  resetFullscreen: () => void;
  getCustomCarList: (params) => void;
  setCenterLocation: (params) => void;
}

export type DateManager = SystemProps &
  IPrebookProps &
  IMapProps &
  IHeaderProps &
  IEjdSocketProps;

const userLogin = () => {
  const loginParams: LoginParams = {
    userName: 14785236921,
    password: 'd83e74e3dcb3717c8906cbc9583fdffa',
    scope: 'SHIPMENT',
  };
  login(loginParams).then((data) => {
    setUserInfo(data);
  });
};

// userLogin();

class IndexPage extends React.Component<DateManager, IState> {
  readonly state: IState = {
    prebookListVisable: true,
    showPage: false,
    mapConfig: {},
    position: {},
  };

  private autoCompleteDom: any;
  private hasAddedListener: boolean;
  private geocoder: any;

  /*
   * 【注】
   * mapEvents 和 addListener如果放在withDashboard中编写会
   * 发生地图组件Map在组件未初始化时被调用的错误
   * */
  mapEvents = {
    created: (map) => {
      const self = this;

      // self.map = map;
      //  扩展插件 自动补全信息
      // @ts-ignore
      window.AMap.plugin('AMap.Autocomplete', () => {
        // @ts-ignore
        this.autoCompleteDom = new window.AMap.Autocomplete({
          input: 'searchinput',
        });
      });

      // 扩展插件 地理编码和逆地理编码
      // @ts-ignore
      window.AMap.plugin(['AMap.Geocoder'], () => {
        self.geocoder = null;
        // @ts-ignore
        self.geocoder = new window.AMap.Geocoder({
          radius: 1000, // 以已知坐标为中心点，radius为半径，返回范围内兴趣点和道路信息
          extensions: 'all', // 返回地址描述以及附近兴趣点和道路信息，默认"base"
        });
      });

      setTimeout(() => {
        map && map.setFitView();
      }, 500);
    },
  };

  addListener = () => {
    if (!this.hasAddedListener) {
      // 绑定监听搜索选择信息事件
      // @ts-ignore
      window.AMap.event.addListener(this.autoCompleteDom, 'select', (e) => {
        if (e.poi.location) {
          // 如果存在当前地理位置的坐标
          const {
            poi: {
              location: { lng: longitude, lat: latitude },
              district,
              name: addressName,
            },
          } = e;
          const mapConfig = {
            zoom: 15,
            center: {
              longitude,
              latitude,
            },
          };
          const params = {
            mapConfig,
            addressName,
          };
          this.props.setCenterLocation(params);
        } else {
          // 不存在进行地址位置解析然后获取对应的坐标点
          this.geocoder.getLocation(e.poi.name, (status, result) => {
            if (status === 'complete' && result.info === 'OK') {
              // 解析数据返回成功
              const message = result && result.geocodes && result.geocodes[0];
              if (message) {
                const center = {
                  longitude: message.location.lng,
                  latitude: message.location.lat,
                };
                const mapConfig = {
                  zoom: 15,
                  center,
                };
                this.props.setCenterLocation({
                  mapConfig,
                  addressName: message.formattedAddress,
                });
              } else {
                message.error('获取当前位置解析失败');
              }
            } else {
              message.error('获取当前位置解析失败');
            }
          });
        }
      });
      this.hasAddedListener = true;
    }
  };

  togglePrebookList = () => {
    this.setState((pre) => ({ prebookListVisable: !pre.prebookListVisable }));
  };

  componentDidMount() {
    if (!localStorage.getItem('token_storage')) {
      window.location.replace(`${window.envConfig.sourceUrl}/user/login`);
    } else {
      document.addEventListener('fullscreenchange', (e) => {
        if (!document.fullscreenElement) {
          this.props.resetFullscreen();
        }
      });
      this.setState({
        showPage: true,
      });
    }
  }

  render() {
    const {
      prebookList,
      prebookParams,
      onPrebookParamsChange,
      onGlobalParamsChange,
      fullscreen,
      projectList,
      projectLoding,
      onSelectPrebook,
      onMapCarParamsChange,
      updateMapRenderCarList,
      cleanSelectedCarParams,
      mapConfig,
      position,
      mapCarParams,
      moveMap,
      setPosition,
    } = this.props;
    const { prebookListVisable, showPage } = this.state;
    return (
      showPage && (
        <div className={style.layout}>
          <div
            style={prebookListVisable ? {} : { display: 'none' }}
            className={
              fullscreen
                ? `${style.preBooking} ${style.fullPreBooking}`
                : style.preBooking
            }
          >
            {prebookListVisable && !fullscreen && (
              <CaretLeftOutlined
                onClick={this.togglePrebookList}
                style={{
                  color: 'white',
                  zIndex: 1000,
                  position: 'absolute',
                  right: '-35px',
                  top: '80px',
                  background: 'rgba(39,39,39, 0.5)',
                  fontSize: '25px',
                }}
              />
            )}
            <Prebooking
              onGlobalParamsChange={onGlobalParamsChange}
              onPrebookParamsChange={onPrebookParamsChange}
              onSelectPrebook={onSelectPrebook}
              prebookParams={prebookParams}
              prebookList={prebookList}
              projectList={projectList}
              projectLoding={projectLoding}
            />
          </div>
          <div
            className={
              fullscreen
                ? [style.fullRight, style.right].join(' ')
                : style.right
            }
          >
            <div
              className={
                fullscreen
                  ? [style.header, style.fullHeader].join(' ')
                  : style.header
              }
            >
              <Header
                onMapCarParamsChange={onMapCarParamsChange}
                addListener={this.addListener}
                moveMap={moveMap}
                setPosition={setPosition}
              />
            </div>
            <div className={style.content}>
              {!prebookListVisable && !fullscreen && (
                <CaretRightOutlined
                  onClick={this.togglePrebookList}
                  style={{
                    color: 'white',
                    zIndex: 1000,
                    position: 'absolute',
                    top: 0,
                    background: 'rgba(39,39,39, 0.5)',
                    fontSize: '25px',
                  }}
                />
              )}
              <Map
                cleanSelectedCarParams={cleanSelectedCarParams}
                onMapCarParamsChange={onMapCarParamsChange}
                mapEvents={this.mapEvents}
                mapConfig={mapConfig}
                position={position}
                mapCarParams={mapCarParams}
              />
            </div>
          </div>
          <EjdSocket updateMapRenderCarList={updateMapRenderCarList} />
        </div>
      )
    );
  }
}

export default withStatistics(IndexPage);
