import React from 'react';
import { mapKeys, groupBy, uniqBy, isEqual } from 'lodash';
import { Consumer } from '@/modules/dashboard/context';
import style from './Header.less';
import { getStatusToNum, isEmpty } from '@/tools/tools';
import {
  carParamsInit,
  carTypeDist,
  carStatusDist,
  carFilterDist,
  notShowCar,
} from '@/constants/car';
import {
  CarItem,
  CarList,
  CarParams,
  GlobalParams,
  MapCarParams,
} from '@/modules/dashboard/withDashboard';
import {
  Table,
  Checkbox,
  Input,
  message,
  Popover,
  Badge,
  Select,
  Row,
  Col,
} from 'antd';
import { BellOutlined, FullscreenOutlined } from '@ant-design/icons';
import tipsIcon from '@/assets/img/tips.png';
import fenbutu from '@/assets/img/fenbutu.png';
import bottom from '@/assets/img/bottom.png';
import { ColumnsType } from 'antd/lib/table';
import { checkBoxOption } from '@/constants/header';
import MessageContent from './messageContent';
import { getMessage, readMessage } from '@/service/apiService';
import { getUserInfo } from '@/service/user';

const { Search } = Input;

export interface IProps {
  onMapCarParamsChange: (params: MapCarParams) => void;
  addListener?: (params) => void;
  moveMap: (params) => void;
  setPosition: (params) => void;
}

interface IContext {
  carlist: CarList;
  renderCarList: any[];
  toggleFullscreen: () => void;
  fullscreen: boolean;
  // formatDate: () => void;
  globalParams: GlobalParams;
  carLoading: boolean;
  setCarParams: (params: CarParams) => void;
  listBigScreenCarImmediateStatusResps: obj[]; // 列表车辆过滤后 车辆状态统计
  listBigScreenTransportStatusResps: obj[]; // 列表车辆过滤后 运单状态统计
  toggleDispatchModal: (type: 'car' | 'prebooking') => void;
  dispatchCarDetail: (params: CarItem) => void;
  mapCarParams: MapCarParams; // 地图车辆查询
  renderMapCarList: CarItem[]; // 地图车辆渲染数据
}

interface IState {
  show: boolean; //列表开关
  messageLoading: boolean; // 消息加载状态
  messageList: ListItem<obj<any>>; // 消息列表
  centerSelect: string;
  deliveryItemsSelect: number;
  receivingItemsSelect: number;
  chosenCarIndex: number;
  lastSearchResult: string;
  searchKeyword: string;
  preCustomAddress: string;
}

class Header extends React.Component<IProps & IContext, IState> {
  state: IState = {
    show: false,
    messageLoading: true,
    messageList: { items: [], count: 0 },
    centerSelect: '',
    deliveryItemsSelect: undefined,
    receivingItemsSelect: undefined,
    chosenCarIndex: 0,
    lastSearchResult: undefined,
    searchKeyword: undefined,
    preCustomAddress: '',
  };

  _scroll: any;

  organizationId = getUserInfo().organizationId;

  container = React.createRef<HTMLDivElement>();

  list = React.createRef<HTMLDivElement>();

  static getDerivedStateFromProps(nextProps, prevState) {
    const {
      mapCarParams: { customAddress },
    } = nextProps;
    //该方法内禁止访问this
    if (customAddress.label !== prevState.preCustomAddress) {
      //通过对比nextProps和prevState，返回一个用于更新状态的对象
      return {
        searchKeyword: customAddress.label,
        preCustomAddress: customAddress.label,
      };
    }
    //不需要更新状态，返回null
    return null;
  }

  componentDidMount() {
    getMessage({ limit: 100000, offset: 0, messageStatusList: '6,13' }).then(
      (messageList: ListItem<obj<any>>) => {
        this.setState({
          messageList,
        });
      },
    );
  }

  toggleCarList = () => {
    this.setState({
      show: !this.state.show,
    });
  };

  dispatchCar = (carItem: CarItem): void => {
    this.props.dispatchCarDetail(carItem);
    this.props.toggleDispatchModal('car');
  };

  throttle = (func, delay) => {
    let prev = Date.now();
    return function () {
      const context = this;
      const args = arguments;
      const now = Date.now();
      if (now - prev >= delay) {
        func.apply(context, args);
        prev = Date.now();
      }
    };
  };

  toggleMessageStatus = (messageId) => {
    readMessage({ messageId, isRead: 1 }).then((res) => {
      const { messageList } = this.state;
      const index = messageList.items.findIndex(
        (item) => item.messageId === messageId,
      );
      messageList.items[index].isRead = 1;
      this.setState({
        messageList,
      });
    });
  };

  toFullscreen = () => {
    const de = document.documentElement as any;
    this.props.toggleFullscreen();
    if (de.requestFullscreen) {
      de.requestFullscreen();
    } else if (de.mozRequestFullScreen) {
      de.mozRequestFullScreen();
    } else if (de.webkitRequestFullScreen) {
      de.webkitRequestFullScreen();
    }
  };

  onSearch = (keyword) => {
    const { renderMapCarList } = this.props;
    const chosenCar = renderMapCarList.filter(
      (car) => car.circle && car.longitude && car.latitude,
    );

    const { chosenCarIndex, lastSearchResult } = this.state;
    if (keyword === lastSearchResult) {
      if (!chosenCar.length) return;

      if (chosenCarIndex < chosenCar.length) {
        this.props.moveMap({
          longitude: chosenCar[chosenCarIndex].longitude,
          latitude: chosenCar[chosenCarIndex].latitude,
        });
        this.setState({ chosenCarIndex: chosenCarIndex + 1 });
      } else {
        this.props.moveMap({
          longitude: chosenCar[0].longitude,
          latitude: chosenCar[0].latitude,
        });
        this.setState({ chosenCarIndex: 1 });
      }
    } else {
      this.props.onMapCarParamsChange({ keyword });
      this.setState({ lastSearchResult: keyword });
    }
  };

  onKeyup = (e) => {
    if (e.keyCode === 13) {
      this.onSearch(e.target.value);
    }
  };

  tableChangeHandler = (...rest) => {
    let tempObj = {};
    mapKeys(rest[1], (value, key) => {
      tempObj[key] = isEmpty(value) ? null : value[0];
    });
    this.props.setCarParams(tempObj);
  };

  onCenterSelectChange = (value) => {
    const {
      carlist: { deliveryItems, receivingItems },
    } = this.props;

    if (value === 'hasDeliveryCircle') {
      if (!deliveryItems.length) return message.warn('数据还未加载完');
      this.props.onMapCarParamsChange({
        deliveryList: [deliveryItems[0]],
        receivingList: [],
        hasCenter: true,
        customAddress: carParamsInit.customAddress,
      });
      // 移动地图
      this.props.moveMap({
        longitude: deliveryItems[0].deliveryLongitude,
        latitude: deliveryItems[0].deliveryLatitude,
      });
      // 清除自定义地址红标
      this.props.setPosition({});
    }

    if (value === 'hasReceivingCircle') {
      if (!receivingItems.length) return message.warn('数据还未加载完');
      this.props.onMapCarParamsChange({
        receivingList: [receivingItems[0]],
        deliveryList: [],
        customAddress: carParamsInit.customAddress,
        hasCenter: true,
      });
      // 移动地图
      this.props.moveMap({
        longitude: receivingItems[0].receivingLongitude,
        latitude: receivingItems[0].receivingLatitude,
      });
      // 清除自定义地址红标
      this.props.setPosition({});
    }

    this.setState({ centerSelect: value });
  };

  onDeliverySiteSelectChange = (value) => {
    const {
      carlist: { deliveryItems: _deliveryItems },
    } = this.props;
    const deliveryItems = _deliveryItems.filter(
      (item) => item.deliveryId === value,
    );
    this.setState({ deliveryItemsSelect: deliveryItems[0]?.deliveryId });

    this.props.onMapCarParamsChange({
      deliveryList: deliveryItems,
      customAddress: carParamsInit.customAddress,
      receivingList: [],
      hasCenter: true,
    });

    // 移动地图
    this.props.moveMap({
      longitude: deliveryItems[0].deliveryLongitude,
      latitude: deliveryItems[0].deliveryLatitude,
    });
  };

  onReceivingSiteSelectChange = (value) => {
    const {
      carlist: { receivingItems: _receivingItems },
    } = this.props;
    const receivingItems = _receivingItems.filter(
      (item) => item.receivingId === value,
    );
    this.setState({ receivingItemsSelect: receivingItems[0]?.receivingId });

    this.props.onMapCarParamsChange({
      receivingList: receivingItems,
      deliveryList: [],
      customAddress: carParamsInit.customAddress,
      hasCenter: true,
    });

    // 移动地图
    this.props.moveMap({
      longitude: receivingItems[0].receivingLongitude,
      latitude: receivingItems[0].receivingLatitude,
    });
  };

  onCheckBoxChange = (value) => {
    const isSelfCar = value.some((v) => v === 'isSelfCar');
    this.props.onMapCarParamsChange({
      isSelfCar,
    });
  };

  messageVisibleChange = (visible) => {
    if (visible) {
      getMessage({ limit: 100000, offset: 0, messageStatusList: '6,13' }).then(
        (messageList: ListItem<obj<any>>) => {
          this.setState({
            messageList,
          });
        },
      );
    }
  };

  inputChange = (e) => {
    this.setState({ searchKeyword: e.target.value });
  };

  render() {
    const {
      show,
      messageLoading,
      messageList,
      centerSelect,
      deliveryItemsSelect,
      receivingItemsSelect,
      searchKeyword,
    } = this.state;
    const {
      carLoading,
      renderCarList,
      carlist,
      fullscreen,
      listBigScreenTransportStatusResps: bigScreenTransportStatusResps,
      listBigScreenCarImmediateStatusResps: bigScreenCarImmediateStatusResps,
      mapCarParams: { distance, keyword, hasCenter, customAddress, ...rest },
      globalParams: { projectId },
    } = this.props;
    const { bigScreenListResps = [], deliveryItems, receivingItems } = carlist!;
    const groupArr = Reflect.ownKeys(
      groupBy(bigScreenListResps, (item) => item.carGroupName),
    ) as string[];

    let centerSelectOption;
    if (projectId) {
      centerSelectOption = [
        { label: '以提货点为中心', value: 'hasDeliveryCircle' },
        { label: '为卸货点为中心', value: 'hasReceivingCircle' },
        { label: '以自定义地址为中心', value: 'hasCustomSiteCircle' },
      ];
    } else {
      centerSelectOption = [
        { label: '以自定义地址为中心', value: 'hasCustomSiteCircle' },
      ];
    }

    const columns: ColumnsType<CarItem> = [
      {
        title: '车牌号',
        dataIndex: 'carNo',
        width: 120,
        ellipsis: true,
      },
      {
        dataIndex: 'carGroupName',
        title: '车组',
        width: 90,
        ellipsis: true,
        filterMultiple: false,
        filters: groupArr.map((item) => {
          if (item !== 'null')
            return {
              text: item,
              value: item,
            };
          return {
            text: '无',
            value: '无',
          };
        }),
        render: (text) => text || '无',
      },
      {
        dataIndex: 'transportNo',
        title: '当前运单',
        width: 200,
        ellipsis: true,
        render: (text, record) => {
          const { transportImmediateStatus } = record;
          if (notShowCar.includes(transportImmediateStatus)) return '';
          return text;
        },
      },
      {
        dataIndex: 'projectName',
        title: '项目名称',
        width: 200,
        ellipsis: true,
        render: (text, record) => {
          const { transportImmediateStatus } = record;
          if (notShowCar.includes(transportImmediateStatus)) return '';
          return text;
        },
      },
      {
        dataIndex: 'driverUserName',
        title: '驾驶员',
        width: 140,
        ellipsis: true,
        render: (_, record) => {
          const { transportImmediateStatus } = record;
          if (notShowCar.includes(transportImmediateStatus)) return '';
          return `${record.driverUserName || ''}${
            record.driverPhone?.substr(-4) || ''
          }`;
        },
      },
      {
        dataIndex: 'carImmediateStatus',
        width: 120,
        ellipsis: true,
        title: '车辆状态',
        filters: [
          { text: '离线', value: 0 },
          { text: '行驶中', value: 1 },
          { text: '停车', value: 2 },
        ],
        filterMultiple: false,
        render: (text, record) => {
          switch (Number(text)) {
            case 0:
              return <span>离线</span>;
            case 1:
              return <span style={{ color: '#03D58B' }}>行驶中</span>;
            case 2:
              return (
                <span style={{ color: '#F0484D' }}>
                  停车{Math.round(record.parkingTime / 60)}分
                </span>
              );
          }
        },
      },
      {
        dataIndex: 'transportImmediateStatus',
        title: '运单状态',
        ellipsis: true,
        width: 120,
        filterMultiple: false,
        filters: carFilterDist,
        render: (text, record) => {
          const { transportImmediateStatus } = record;
          if (notShowCar.includes(transportImmediateStatus)) return '';
          return carStatusDist[text];
        },
      },
      {
        title: '操作',
        key: 'operation',
        ellipsis: true,
        fixed: 'right',
        width: 80,
        render: (index, car) =>
          !car.organizationId || car.organizationId === this.organizationId ? (
            <a onClick={() => this.dispatchCar(car)}>派单</a>
          ) : null,
      },
    ];

    return (
      <div className={style.container}>
        <Row justify="space-around" align="middle" className={style.header}>
          <Col span={11}>
            <Row align="middle">
              <img className={style.fenbutu} src={fenbutu} alt="" />
              <span className={style.titleChart}>车辆分布图</span>

              <Select
                placeholder="请选择车辆展示方式"
                onChange={this.onCenterSelectChange}
                value={centerSelect}
                className={style.centerSelect}
              >
                {centerSelectOption.map((item) => (
                  <Select.Option value={item.value}>{item.label}</Select.Option>
                ))}
              </Select>
              {centerSelect === 'hasDeliveryCircle' && deliveryItems.length && (
                <Select
                  className={style.centerSelect}
                  placeholder="请选择提货点"
                  onChange={this.onDeliverySiteSelectChange}
                  defaultValue={deliveryItems[0]?.deliveryId}
                  value={hasCenter ? deliveryItemsSelect : ''}
                  style={{ marginLeft: '1rem', marginRight: '1rem' }}
                >
                  {deliveryItems.map((item) => (
                    <Select.Option value={item.deliveryId}>
                      {item.deliveryName}
                    </Select.Option>
                  ))}
                </Select>
              )}
              {centerSelect === 'hasReceivingCircle' && receivingItems.length && (
                <Select
                  className={style.centerSelect}
                  placeholder="请选择卸货点"
                  onChange={this.onReceivingSiteSelectChange}
                  defaultValue={receivingItems[0]?.receivingId}
                  value={hasCenter ? receivingItemsSelect : ''}
                  style={{ marginLeft: '1rem', marginRight: '1rem' }}
                >
                  {receivingItems.map((item) => (
                    <Select.Option value={item.receivingId}>
                      {item.receivingName}
                    </Select.Option>
                  ))}
                </Select>
              )}
              {
                <Input
                  style={{
                    marginLeft: '1rem',
                    marginRight: '1rem',
                    width: 180,
                    position:
                      centerSelect === 'hasCustomSiteCircle'
                        ? 'initial'
                        : 'absolute',
                    top: centerSelect === 'hasCustomSiteCircle' ? '' : '-999px',
                  }}
                  id="searchinput"
                  value={searchKeyword}
                  onChange={this.inputChange}
                  placeholder="请输入需要搜索的地址"
                  onClick={this.props.addListener}
                />
              }

              <Checkbox.Group
                options={checkBoxOption}
                defaultValue={[]}
                value={Object.keys(rest).filter((key) => rest[key])}
                onChange={this.onCheckBoxChange}
                style={{ marginLeft: '1rem' }}
              />
            </Row>
          </Col>
          <Row align="middle">
            <span className={style.searchCar}>搜索车辆</span>
            <Search
              className="car_search"
              placeholder="请输入车牌号 / 运单号搜索"
              onSearch={this.onSearch}
              onKeyUp={this.onKeyup}
            />
          </Row>
          {/*<div className={style.floatRight}>*/}
          <div>
            <span className={style.text} onClick={this.toggleCarList}>
              <img
                className={
                  show
                    ? [style.bottom_icon, style.active_icon].join(' ')
                    : style.bottom_icon
                }
                src={bottom}
              />
              {show ? '收起' : '展开'}
            </span>
            <span
              className={style.text}
              style={{ marginLeft: '1rem' }}
              onClick={this.toFullscreen}
            >
              <FullscreenOutlined />
              全屏
            </span>
          </div>
          <Popover
            overlayClassName={style.messagePopover}
            content={
              <MessageContent
                messageList={messageList}
                toggleMessageStatus={this.toggleMessageStatus}
                loading={messageLoading}
              />
            }
            trigger="click"
            placement="bottom"
            onVisibleChange={this.messageVisibleChange}
          >
            <Badge dot={messageList?.items?.some((item) => item.isRead === 0)}>
              <BellOutlined
                style={{
                  color: 'white',
                  fontSize: '20px',
                  cursor: 'pointer',
                }}
              />
            </Badge>
          </Popover>
          <Row align="middle">
            <span className={style.timeDes}>当前时间</span>
            <Clock />
          </Row>
          {/*</div>*/}
        </Row>

        <div
          ref={this.container}
          // onScrollCapture={() => this._scroll()}
          className={
            show ? `${style.carContainer} ${style.active}` : style.carContainer
          }
        >
          {!fullscreen && (
            <div className="car_table" ref={this.list}>
              <Table
                columns={columns}
                dataSource={renderCarList}
                pagination={false}
                loading={carLoading}
                onChange={this.tableChangeHandler}
                scroll={{
                  scrollToFirstRowOnChange: true,
                  y: (this.container?.current?.clientHeight || 500) - 150,
                }}
              />
              {bigScreenListResps && bigScreenTransportStatusResps ? (
                <div className={style.bottom}>
                  <p>
                    <span style={{ color: '#B6D7FF' }}>
                      共{uniqBy(renderCarList, 'carNo').length}辆车，离线
                      {getStatusToNum(
                        bigScreenCarImmediateStatusResps,
                        'carImmediateStatus',
                        0,
                        'carNum',
                      )}
                      辆，
                    </span>
                    <span style={{ color: '#03D58B' }}>
                      行驶中
                      {getStatusToNum(
                        bigScreenCarImmediateStatusResps,
                        'carImmediateStatus',
                        1,
                        'carNum',
                      )}
                      辆
                    </span>
                    <span style={{ color: '#B6D7FF' }}>，</span>
                    <span style={{ color: '#F0484D' }}>
                      停车
                      {getStatusToNum(
                        bigScreenCarImmediateStatusResps,
                        'carImmediateStatus',
                        2,
                        'carNum',
                      )}
                      辆
                    </span>
                    <span style={{ color: '#B6D7FF' }}>，</span>
                  </p>
                  <p>
                    <span style={{ color: '#B6D7FF' }}>
                      共
                      {bigScreenTransportStatusResps.reduce(
                        (total, current) => total + current.transportNum,
                        0,
                      )}
                      个运单，
                    </span>
                    <span style={{ color: '#03D58B' }}>
                      运输中
                      {getStatusToNum(
                        bigScreenTransportStatusResps,
                        'transportScreenStatus',
                        0,
                        'transportNum',
                      )}
                      单
                    </span>
                    <span style={{ color: '#B6D7FF' }}>，</span>
                    <span style={{ color: '#FF6600' }}>
                      待审核
                      {getStatusToNum(
                        bigScreenTransportStatusResps,
                        'transportScreenStatus',
                        2,
                        'transportNum',
                      )}
                      单
                    </span>
                    <span style={{ color: '#B6D7FF' }}>，</span>
                    <span style={{ color: '#F0484D' }}>
                      超时
                      {getStatusToNum(
                        bigScreenTransportStatusResps,
                        'transportScreenStatus',
                        1,
                        'transportNum',
                      )}
                      单
                    </span>
                    <span style={{ color: '#B6D7FF' }}>，</span>
                    <span style={{ color: '#F0484D' }}>
                      异常
                      {getStatusToNum(
                        bigScreenTransportStatusResps,
                        'transportScreenStatus',
                        3,
                        'transportNum',
                      )}
                      单
                    </span>
                  </p>
                </div>
              ) : null}
            </div>
          )}
        </div>
      </div>
    );
  }
}

export default class Index extends React.Component<IProps> {
  render() {
    return (
      <Consumer>
        {({
          carlist,
          toggleFullscreen,
          fullscreen,
          carLoading,
          renderCarList,
          setCarParams,
          listBigScreenCarImmediateStatusResps,
          listBigScreenTransportStatusResps,
          toggleDispatchModal,
          globalParams,
          dispatchCarDetail,
          mapCarParams,
          renderMapCarList,
        }) => (
          <Header
            {...this.props}
            carlist={carlist}
            renderCarList={renderCarList}
            toggleFullscreen={toggleFullscreen}
            fullscreen={fullscreen}
            carLoading={carLoading}
            setCarParams={setCarParams}
            globalParams={globalParams}
            listBigScreenTransportStatusResps={
              listBigScreenTransportStatusResps
            }
            listBigScreenCarImmediateStatusResps={
              listBigScreenCarImmediateStatusResps
            }
            toggleDispatchModal={toggleDispatchModal}
            dispatchCarDetail={dispatchCarDetail}
            mapCarParams={mapCarParams}
            renderMapCarList={renderMapCarList}
          />
        )}
      </Consumer>
    );
  }
}

class Clock extends React.Component {
  state = {
    dateString: '',
    timer: '',
  };

  componentDidMount() {
    this.setState({
      timer: setInterval(() => {
        this.formatDate();
      }, 1000),
    });
  }

  formatDate = () => {
    const date = new Date();
    const y = date.getFullYear();
    let m: String | Number = date.getMonth() + 1;
    m = m < 10 ? '0' + m : m;
    let d: String | Number = date.getDate();
    d = d < 10 ? '0' + d : d;
    let h: String | Number = date.getHours();
    h = h < 10 ? '0' + h : h;
    let minute: String | Number = date.getMinutes();
    minute = minute < 10 ? '0' + minute : minute;
    let second: String | Number = date.getSeconds();
    second = second < 10 ? '0' + second : second;
    const dateString =
      y + '-' + m + '-' + d + ' ' + h + ':' + minute + ':' + second;
    this.setState({
      dateString: dateString,
    });
  };

  componentWillUnmount() {
    this.setState({
      timer: null,
    });
  }

  render() {
    const { dateString } = this.state;
    return <span className={style.time}>{dateString}</span>;
  }
}
