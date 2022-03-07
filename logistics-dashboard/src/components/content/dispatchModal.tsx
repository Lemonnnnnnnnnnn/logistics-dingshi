import React from 'react';
import { Modal, Select, InputNumber, Button, message } from 'antd';
import dayjs from 'dayjs';
import { uniqBy, cloneDeep, forEach } from 'lodash';
import { carRecentDriver, postTransport } from '@/service/apiService';
import style from './dispatchModal.less';
import { Consumer } from '@/modules/dashboard/context';
import { CarItem, PrebookItem } from '@/modules/dashboard/withDashboard';
import { isEmpty, recursion } from '@/tools/tools';
import { CloseOutlined } from '@ant-design/icons';

const { Option } = Select;

interface RowItem {
  id: number;
  carId?: number;
  carNo?: string;
  driverId?: number;
  driverName?: string;
  phone?: string;
  goodsId?: number;
  goodsUnit?: number;
  deliveryId?: number;
  deliveryName?: string;
  deliveryAddress?: string;
  receivingId?: number;
  receivingName?: string;
  receivingAddress?: string;
  price?: number;
  weight?: number;
}

interface IState {
  current: PrebookItem;
  dispatchList: RowItem[];
  recentDriver: obj<any>;
}

interface IProps {
  shipCar: ListItem<obj<any>>;
  shipDriver: ListItem<obj<any>>;
  platCar: ListItem<obj<any>>;
  platDriver: ListItem<obj<any>>;
}

interface IContext {
  dispatchBillModal: boolean; // 展示派单窗口;
  prebookOption: PrebookItem[]; // 预约单选项
  toggleDispatchModal: (type?: 'car' | 'prebooking') => void; // 切换派车弹窗
  defaultType: 'car' | 'prebooking'; // 派单默认选中类型
  selectedPrebook: PrebookItem; // 点击派单的预约单
  dispatchCar: CarItem; // 派单车辆
}

class Index extends React.Component<IProps & IContext, IState> {
  constructor(props: IProps & IContext) {
    super(props);
    this.state = {
      current:
        props.defaultType === 'prebooking'
          ? props.selectedPrebook
          : ({} as PrebookItem),
      dispatchList: [
        {
          id: Math.random(),
          carId:
            props.defaultType === 'car' ? props.dispatchCar?.carId : undefined,
          carNo:
            props.defaultType === 'car' ? props.dispatchCar?.carNo : undefined,
        },
      ],
      recentDriver: null,
    };
  }

  componentDidMount() {
    const { defaultType, dispatchCar } = this.props;
    if (defaultType === 'car') {
      this.getRecentDriver({ carId: dispatchCar.carId });
    }
  }

  getRecentDriver = async (params) => {
    carRecentDriver(params).then((recentDriver) => {
      this.setState({
        recentDriver,
      });
    });
  };

  handleCancel = () => {
    this.setState({
      dispatchList: [{ id: Math.random() }],
      current: {} as PrebookItem,
    });
    this.props.toggleDispatchModal();
  };

  handleOk = () => {
    const { dispatchList, current } = this.state;
    if (isEmpty(current)) return message.error('请选择预约单');
    const hasNetContract = (current.contractItems || []).some(
      ({ contractState, isAvailable, contractType }) =>
        contractType === 2 && contractState === 2 && isAvailable,
    );
    const transportType = hasNetContract ? 2 : 1;
    const { prebookingId, acceptanceTime, receivingItems } = current;
    let check = true;
    const deliveryItems = dispatchList.map((item) => {
      // 空值校验
      if (
        !item.carId ||
        !item.driverId ||
        !item.goodsId ||
        !item.weight ||
        !item.price
      ) {
        check = false;
      }
      return {
        carId: item.carId,
        correlationObjectId: item.deliveryId,
        goodsId: item.goodsId,
        goodsNum: item.weight,
        goodsUnit: item.goodsUnit,
        receivingUnit: item.goodsUnit,
        freightPrice: item.price,
      };
    });

    if (!check) return message.error('请填写完整调度信息');
    // 渣土不做判断
    if (!isEmpty(receivingItems)) {
      const receivingArr = uniqBy(dispatchList, 'receivingId');
      if (+receivingArr?.length > 1) {
        return message.error('所有货品必须卸往同一卸货点');
      }
    }

    const items = dispatchList.reduce((r, n, i) => {
      if (
        !r.some(
          (item) => item.carId === n.carId && item.driverId === n.driverId,
        )
      ) {
        r.push(n);
      }
      return r;
    }, []);

    const reqList = items.map((item, i) => {
      return () =>
        postTransport({
          prebookingId,
          expectTime: dayjs(acceptanceTime).format(),
          deliveryItems: deliveryItems
            .filter((delivery) => delivery.carId === item.carId)
            .map((m) => ({
              correlationObjectId: m.correlationObjectId,
              goodsId: m.goodsId,
              goodsNum: m.goodsNum,
              goodsUnit: m.goodsUnit,
              receivingUnit: m.receivingUnit,
              freightPrice: m.freightPrice,
            })),
          receivingId: item.receivingId,
          carId: item.carId,
          driverUserId: item.driverId,
          transportType,
        });
    });

    const callback = () => {
      message.destroy();
      message.success('调度预约单成功');
      this.handleCancel();
    };

    recursion(reqList, callback);

    // items.forEach((item, i) => {
    //   postTransport({
    //     prebookingId,
    //     expectTime: dayjs(acceptanceTime).format(),
    //     deliveryItems: deliveryItems
    //       .filter((delivery) => delivery.carId === item.carId)
    //       .map((m) => ({
    //         correlationObjectId: m.correlationObjectId,
    //         goodsId: m.goodsId,
    //         goodsNum: m.goodsNum,
    //         goodsUnit: m.goodsUnit,
    //         receivingUnit: m.receivingUnit,
    //         freightPrice: m.freightPrice,
    //       })),
    //     receivingId: item.receivingId,
    //     carId: item.carId,
    //     driverUserId: item.driverId,
    //     transportType,
    //   }).then(() => {
    //     message.destroy();
    //     message.success('调度预约单成功');
    //     if (i === items.length - 1) {
    //       this.handleCancel();
    //     }
    //   });
    // });
  };

  prebookChange = (value: number) => {
    const current = this.props.prebookOption?.find(
      (item) => value === item.prebookingId,
    );
    this.setState({
      current,
    });
  };

  carChange = async (option, index) => {
    const { dispatchList } = this.state;
    const newList = cloneDeep(dispatchList);
    newList[index] = {
      ...newList[index],
      id: newList[index].id,
      carId: option.value,
      carNo: option.label,
      phone: '--',
      driverId: null,
      driverName: null,
    };
    this.setState({
      dispatchList: newList,
    });
  };

  driverChange = (option, index) => {
    const { dispatchList } = this.state;
    const newList = cloneDeep(dispatchList);
    newList[index].driverId = null;
    newList[index].driverName = null;
    newList[index].phone = '';
    const sameItem =
      newList.length > 1 &&
      newList.find(
        (item) => item.driverName && item.carId === newList[index].carId,
      );
    if (
      (sameItem && sameItem.driverId !== option.value) ||
      newList.some(
        (item) =>
          item.carId &&
          item.carId !== newList[index].carId &&
          item.driverId === option.value,
      )
    ) {
      newList[index].driverId = null;
      newList[index].driverName = null;
      newList[index].phone = '';
      message.destroy();
      message.error('车辆和司机只能一对一匹配！');
    } else if (
      newList[index].goodsId &&
      newList.some(
        (good) =>
          good.driverId === option.value &&
          good.goodsId === newList[index].goodsId,
      )
    ) {
      newList[index].driverId = null;
      newList[index].driverName = null;
      newList[index].phone = '';
      message.error('同一个司机，不能选择一个货品！');
    } else {
      newList[index].phone = option.driverphone;
      newList[index].driverName = option.label;
      newList[index].driverId = option.value;
    }
    this.setState({
      dispatchList: [...newList],
    });
  };

  changeWeight = (value, index) => {
    const { dispatchList } = this.state;
    const newList = cloneDeep(dispatchList);
    newList[index].weight = Number(value);
    this.setState({
      dispatchList: [...newList],
    });
  };

  changePrice = (value, index) => {
    const { dispatchList } = this.state;
    const newList = cloneDeep(dispatchList);
    newList[index].price = Number(value);
    this.setState({
      dispatchList: [...newList],
    });
  };

  goodsChange = (option, index) => {
    const {
      dispatchList,
      current: { receivingItems },
    } = this.state;
    const newList = cloneDeep(dispatchList);
    const sameItem =
      newList.length > 1 &&
      newList.find(
        (item) => item.goodsId && item.carId === newList[index].carId,
      );
    if (sameItem && option.value === sameItem.goodsId) {
      newList[index].goodsId = null;
      newList[index].deliveryId = null;
      newList[index].deliveryName = null;
      newList[index].deliveryAddress = null;
      newList[index].goodsUnit = null;
      newList[index].receivingName = null;
      newList[index].receivingId = null;
      newList[index].receivingAddress = null;
      message.destroy();
      message.error('同一个司机，不能选择一个货品！');
    } else {
      newList[index].goodsId = option.value;
      newList[index].deliveryId = option.deliveryid;
      newList[index].deliveryName = option.deliveryname;
      newList[index].deliveryAddress = option.deliveryaddress;
      newList[index].goodsUnit = option.goodsunit;
      const { name, prebookingObjectId, address } =
        receivingItems?.find((item) => item.goodsId === option.value) || {};
      newList[index].receivingName = name;
      newList[index].receivingId = prebookingObjectId;
      newList[index].receivingAddress = address;
    }
    this.setState({
      dispatchList: [...newList],
    });
  };

  deleteRow = (rowId) => {
    const { dispatchList } = this.state;
    if (dispatchList.length === 1) return message.error('已经是最后一行了');
    const newList = dispatchList.filter(({ id }) => id !== rowId);
    this.setState({
      dispatchList: newList,
    });
  };

  renderTableBody = () => {
    const { dispatchList, current, recentDriver } = this.state;
    const {
      shipCar,
      shipDriver,
      platCar,
      platDriver,
      defaultType,
    } = this.props;
    // 如果是网络货运合同且状态是已审核且是开启状态
    const hasNetContract = (current.contractItems || []).some(
      ({ contractState, isAvailable, contractType }) =>
        contractType !== 2 && contractState === 2 && isAvailable,
    );
    const platCarOptions = (platCar.items || []).map((car) => ({
      label: car.carNo,
      value: car.carId,
    }));
    const shipCarOptions = (shipCar.items || []).map((car) => ({
      label: car.carNo,
      value: car.carId,
    }));
    const arr = recentDriver ? [recentDriver] : [];
    // 非自营
    const platDriverOptions = (
      uniqBy([...arr, ...platDriver.items], 'userId') || []
    ).map((driver, index) => ({
      label: !index
        ? arr.length > 0
          ? `${driver.nickName}(${driver.isBusy ? '空闲' : '忙碌'})(近驾)`
          : `${driver.nickName}(${driver.isBusy ? '空闲' : '忙碌'})`
        : `${driver.nickName}(${driver.isBusy ? '空闲' : '忙碌'})`,
      value: driver.userId,
      driverphone: driver.phone,
    }));
    // 自营
    const shipDriverOptions = (
      uniqBy([...arr, ...shipDriver.items], 'userId') || []
    ).map((driver, index) => ({
      label: !index
        ? arr.length > 0
          ? `${driver.nickName}(${driver.isBusy ? '空闲' : '忙碌'})(近驾)`
          : `${driver.nickName}(${driver.isBusy ? '空闲' : '忙碌'})`
        : `${driver.nickName}(${driver.isBusy ? '空闲' : '忙碌'})`,
      value: driver.userId,
      driverphone: driver.phone,
    }));

    return dispatchList.map((row, index) => {
      return (
        <div style={{ position: 'relative' }} key={row.id}>
          <span style={{ width: '50px', textAlign: 'center', marginLeft: 0 }}>
            {index + 1}
          </span>
          <Select
            showSearch
            optionFilterProp="label"
            placeholder="请选择车辆"
            style={{ width: '120px' }}
            value={row.carNo}
            options={
              isEmpty(current)
                ? []
                : hasNetContract
                ? shipCarOptions
                : platCarOptions
            }
            onChange={(_, option) => this.carChange(option, index)}
          />
          <Select
            showSearch
            dropdownMatchSelectWidth={false}
            optionFilterProp="label"
            onClick={() => {
              const transportType = hasNetContract ? 2 : 1;
              this.getRecentDriver({
                carId: row.carId,
                isAll: transportType === 1 ? false : true,
              });
            }}
            style={{ width: '120px', marginLeft: '5px' }}
            placeholder="请选择司机"
            value={row.driverId}
            options={
              // 非自营查全部列表，自营查部分
              isEmpty(current)
                ? []
                : hasNetContract
                ? shipDriverOptions
                : platDriverOptions
            }
            onChange={(_, option) => this.driverChange(option, index)}
          />
          <span style={{ width: '100px' }}>{row.phone || '--'}</span>
          <Select
            showSearch
            optionFilterProp="label"
            placeholder="请选择货品"
            value={row.goodsId}
            style={{ width: '120px', marginLeft: '10px' }}
            options={current?.deliveryItems?.map((item) => ({
              value: item.goodsId,
              label: `${item.categoryName}-${item.goodsName}`,
              deliveryid: item.prebookingObjectId,
              deliveryname: item.name,
              deliveryaddress: item.address,
              goodsunit: item.goodsUnit,
            }))}
            onChange={(_, option) => this.goodsChange(option, index)}
          />
          <span style={{ width: '100px' }} title={row?.deliveryName || ''}>
            {row?.deliveryName || '--'}
          </span>
          <span style={{ width: '100px' }} title={row?.deliveryAddress || ''}>
            {row?.deliveryAddress || '--'}
          </span>
          <InputNumber
            style={{ width: '120px', marginLeft: '10px' }}
            precision={2}
            min={0}
            value={row.weight}
            placeholder="请输入重量"
            onChange={(value) => this.changeWeight(value, index)}
          />
          <InputNumber
            style={{ width: '120px', marginLeft: '10px' }}
            precision={2}
            min={0}
            value={row.price}
            placeholder="请输入运价"
            onChange={(value) => this.changePrice(value, index)}
          />
          <span style={{ width: '30px' }}>
            {index ? (
              <CloseOutlined
                // style={{ position: 'absolute', left: '5px' }}
                onClick={() => this.deleteRow(row.id)}
              />
            ) : null}
          </span>
        </div>
      );
    });
  };

  addRow = () => {
    const { dispatchList } = this.state;
    const newRow: RowItem = {
      id: Math.random(),
      carId: null,
      carNo: null,
      driverId: null,
      driverName: null,
      phone: '--',
      deliveryId: dispatchList[0] && dispatchList[0].deliveryId,
      goodsId: dispatchList[0] && dispatchList[0].goodsId,
      weight: dispatchList[0] && dispatchList[0].weight,
      price: dispatchList[0] && dispatchList[0].price,
      deliveryName: dispatchList[0] ? dispatchList[0].deliveryName : '',
      deliveryAddress: dispatchList[0] ? dispatchList[0].deliveryAddress : '',
      goodsUnit: dispatchList[0] ? dispatchList[0].goodsUnit : 0,
      receivingName: dispatchList[0] ? dispatchList[0].receivingName : '',
      receivingId: dispatchList[0] ? dispatchList[0].receivingId : 0,
      receivingAddress: dispatchList[0] ? dispatchList[0].receivingAddress : '',
    };
    this.setState({
      dispatchList: [...dispatchList, newRow],
    });
  };

  render() {
    const { dispatchBillModal, prebookOption: items, defaultType } = this.props;
    const {
      current,
      dispatchList: [tempRow],
    } = this.state;
    const prebookOption = (items || []).filter(
      ({ logisticsBusinessTypeEntity, contractItems }) => {
        const hasNetContract = (contractItems || []).some(
          ({ contractState, isAvailable, contractType }) =>
            contractType === 2 && contractState === 2 && isAvailable,
        );
        const hasSelfContract = (contractItems || []).some(
          ({ contractState, isAvailable, contractType }) =>
            contractType !== 2 && contractState === 2 && isAvailable,
        );
        return (
          !logisticsBusinessTypeEntity?.releaseHall &&
          (hasSelfContract || hasNetContract)
        );
      },
    );
    return (
      <>
        <Modal
          width="1090px"
          visible={dispatchBillModal}
          destroyOnClose
          centered
          cancelText="返回"
          okText="确定"
          onOk={this.handleOk}
          onCancel={this.handleCancel}
        >
          <div className={style.prebookingSel}>
            <span className={style.dispatch}>派单:</span>
            {defaultType === 'prebooking' ? (
              current?.prebookingNo || '--'
            ) : (
              <Select
                optionFilterProp="label"
                placeholder="请选择预约单"
                style={{ width: 200 }}
                onChange={this.prebookChange}
              >
                {prebookOption?.map((item) => (
                  <Option key={item.prebookingId} value={item.prebookingId}>
                    {item.prebookingNo}
                  </Option>
                ))}
              </Select>
            )}
          </div>
          <div className={style.itemContainer}>
            <div>
              <span>项目名称：{current && current.projectName}</span>
            </div>
            <div>
              <span>
                要求送达时间：
                {current &&
                  dayjs(current.acceptanceTime).format('YYYY-MM-DD HH:mm:ss')}
              </span>
            </div>
            <div>
              <span>备注：{(current && current.prebookingRemark) || '--'}</span>
            </div>
          </div>
          <div className={style.itemContainer}>
            <div>
              <p>
                货品名称：
                {current &&
                  current.deliveryItems &&
                  current.deliveryItems
                    .map((item) => `${item.categoryName}-${item.goodsName}`)
                    .join('、')}
              </p>
            </div>
          </div>
          <div className={style.table}>
            <div>
              <span style={{ width: '50px' }}>序号</span>
              <span style={{ width: '120px' }}>车牌号</span>
              <span style={{ width: '130px' }}>司机</span>
              <span style={{ width: '110px' }}>司机联系电话</span>
              <span style={{ width: '125px' }}>货品名称</span>
              <span style={{ width: '110px' }}>提货点</span>
              <span style={{ width: '110px' }}>提货地址</span>
              <span style={{ width: '130px' }}>分配重量</span>
              <span style={{ width: '130px' }}>运价</span>
              <span style={{ width: '30px' }}>操作</span>
            </div>
          </div>
          <div className={style.tableBody}>{this.renderTableBody()}</div>
          <Button className={style.antBtn} onClick={this.addRow}>
            + 添加
          </Button>
          <div className={style.receiveAdd}>
            <div>
              <span>卸货点</span>
              <span>卸货地址</span>
            </div>
          </div>
          <div className={style.receiveTable}>
            <div>
              <span className={style.receiveSelect}>
                {tempRow.receivingName || '--'}
              </span>
              <span>{tempRow.receivingAddress || '--'}</span>
            </div>
          </div>
          <div style={{ marginTop: '20px', color: '#1890ff' }}>
            （提示：同一个车辆若有多行，将生成同一张多提的运单）
          </div>
        </Modal>
      </>
    );
  }
}

export default class DispatchModal extends React.Component<IProps> {
  render() {
    return (
      <Consumer>
        {({
          dispatchBillModal,
          toggleDispatchModal,
          prebookOption,
          defaultType,
          selectedPrebook,
          dispatchCar,
        }) => (
          <Index
            {...this.props}
            dispatchBillModal={dispatchBillModal}
            defaultType={defaultType}
            toggleDispatchModal={toggleDispatchModal}
            prebookOption={prebookOption}
            selectedPrebook={selectedPrebook}
            dispatchCar={dispatchCar}
          />
        )}
      </Consumer>
    );
  }
}
