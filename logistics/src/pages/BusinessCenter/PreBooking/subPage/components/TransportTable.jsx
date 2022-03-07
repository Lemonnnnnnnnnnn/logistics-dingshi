import React, { Component } from "react";
import { Modal, Button, Card } from "antd";
import { connect } from "dva";
import { SchemaForm, Item, FORM_MODE, Observer } from "@gem-mine/antd-schema-form";
import CSSModules from 'react-css-modules';
import DebounceFormButton from "@/components/DebounceFormButton";
import { getTransportStatus } from "@/services/project";
import prebookingService, { countRemainWeight, carRecentDriver } from "@/services/prebooking";
import EditableTable from "@/components/EditableTable/EditableTable";
import { pick, isEmpty, uniqBy, getGoodsName } from "@/utils/utils";
import shipmentCarModel from "@/models/shipmentCars";
import shipmentDriverModel from "@/models/shipmentDrivers";
import DeliveryGoodsInfo from "./components/DeliveryGoodsInfo";
import styles from './TransportTable.less';

const { actions: { getShipmentCars, getPlatformAllCars } } = shipmentCarModel;
const { actions: { getShipmentDrivers, getPlatformAllDrivers } } = shipmentDriverModel;
const { countTransportPlanWeight } = prebookingService;

function mapStateToProps(state) {
  return {
    cars: state.shipmentCars.items,
    allCars: state.shipmentCars.allCars || [],
    drivers: state.shipmentDrivers.items,
    allDrivers: state.shipmentDrivers.allDrivers || [],
    preBooking: state.preBooking.entity
  };
}

const formItemLayout = {
  wrapperCol: { span: 24 },
  labelCol: { span: 24 }
};

@CSSModules(styles, { allowMultiple: true })
// @connect(mapStateToProps, { getShipmentCars, getShipmentDrivers })
class TransportTable extends Component {

  dispatchConfig = JSON.parse(localStorage.getItem("dispatchConfig"));

  remainWeights = [];

  numError = false;

  constructor(props) {
    super(props);
    const formSchema = {
      carId: {
        label: "车牌号",
        component: "select",
        rules: {
          required: true
        },
        placeholder: "请选择车辆",
        options: () => {

          const { cars, allCars, transportType = 1 } = this.props;
          const options = transportType === 1 ? cars : allCars;

          return options.map((item) => ({
            key: item.carId,
            value: item.carId,
            label: `${item.carNo}${item.carLoad ? `(${item.carLoad}吨)` : ""}${item.isBusy ? "(空闲)" : "(忙碌)"}`
          }));
        },
        showSearch: true,
        filterOption: (input, option) => option.props.label.indexOf(input) >= 0
      },
      driverUserId: {
        label: "司机",
        component: "select",
        rules: {
          required: true
        },
        placeholder: "请选择司机",
        options: Observer({
          watch: 'carId',
          action: async (carId) => {
            let recentDriver = {};
            if (carId) {
              recentDriver = await carRecentDriver({ carId });
            }

            const { drivers, allDrivers, transportType = 1 } = this.props;
            const options = transportType === 1 ? drivers : allDrivers;
            return options.reduce((final, current) => {
              const isRecent = current.userId === recentDriver.userId;
              const attr = {
                key: current.userId,
                value: current.userId,
                label: `${current.nickName}${current.isBusy ? "(空闲)" : "(忙碌)"}${isRecent ? "(近驾)" : ""}`
              };
              if (isRecent) {
                final.unshift(attr);
              } else {
                final.push(attr);
              }
              return final;
            }, []);

          }
        }),

        showSearch: true,
        filterOption: (input, option) => option.props.label.indexOf(input) >= 0
      },
      driverUserPhone: {
        label: "联系电话",
        component: "input.text",
        observer: Observer({
          watch: "driverUserId",
          action: (driverUserId) => {
            const driver = this.props.allDrivers.find(item => item.userId === driverUserId);
            return driver && { value: driver.phone } || { value: "" };
          }
        })
      },
      deliveryItems: {
        component: DeliveryGoodsInfo,
        rules: {
          required: [true, "请添加提货信息"]
        },
        dispatchType: props.name.replace("Items", "")
      },
      receivingId: {
        label: "卸货点",
        component: "select.text",
        options: () => {
          const receiving = this.props.preBooking.receivingItems.reduce((receivingItems, current) => {
            const check = receivingItems.findIndex(item => item.receivingId === current.receivingId);
            if (check < 0) {
              const { projectCorrelationId, receivingName, receivingId } = current;
              return [...receivingItems, {
                key: projectCorrelationId,
                value: `${receivingId}`,
                label: receivingName,
                receivingId
              }];
            }
            return receivingItems;
          }, []);
          return receiving;
        },
        observer: Observer({
          watch: "deliveryItems",
          action: (deliveryItems, { form }) => {
            if (!deliveryItems) {
              return { value: "" };
            }
            const delivery = deliveryItems && deliveryItems[0] || { goodsId: undefined };
            const receiving = this.props.preBooking.receivingItems.find(item => item.goodsId === delivery.goodsId);
            if (!receiving) {
              form.setFieldValue("receivingAddress", "");
            } else {
              const receiving2 = this.props.preBooking.receivingItems.find(item => item.receivingId === (+receiving.receivingId));
              receiving2 && form.setFieldValue("receivingAddress", receiving2.receivingAddress);
            }

            return receiving && { value: `${receiving.receivingId}` } || { value: "" };
          }
        })
      },
      receivingAddress: {
        label: "卸货地址",
        component: "input.text",
        value: Observer({
          watch: "receivingId",
          action: (receivingId) => {
            const receiving = this.props.preBooking.receivingItems.find(item => item.receivingId === (+receivingId));
            return receiving && receiving.receivingAddress || "";
          }
        })
      }
    };
    this.state = {
      visible: false,
      formSchema,
      ready: false,
      isChange: true
    };
  }


  async componentDidMount() {
    const {
      getPlatformAllCars,
      getPlatformAllDrivers,
      getShipmentCars,
      getShipmentDrivers,
      transportType = 1
    } = this.props;
    if (transportType === 1) {
      await getShipmentCars({ isCount: false });
      await getShipmentDrivers({ isCount: false });
      this.setState({
        ready: true
      });
    } else {
      await getPlatformAllCars({ isCount: false });
      await getPlatformAllDrivers({ isCount: false });
      this.setState({
        ready: true
      });
    }
  }

  handleCancel = () => {
    this.setState({
      visible: false
    });
  };

  showModal = () => {
    this.setState({
      visible: true
    });
  };

  renderRestGoodsInfo = () => {
    this.numError = false;
    const numberStyle = {
      paddingLeft: 20,
      fontSize: "14px",
      lineHeight: "1.5em"
    };
    const { name } = this.props;
    const _name = name.replace("Items", "");
    const dispatchMessage = pick(this.dispatchConfig, _name)[_name];
    if (this.state.isChange) {
      const formData = this.props.form.getFieldsValue();
      const { deliveryItems = [] } = formData;
      const transportItems = formData[name] || [];
      // 计划重量
      const _deliveryItems = deliveryItems.reduce((all, current) => {
        const index = (dispatchMessage || []).findIndex(item => item.goodsId === current.goodsId);
        if (index > -1) return [...all, { ...current, receivingNum: dispatchMessage[index].goodsNum }];
        return all;
      }, []);
      // 派车重量
      const transportPlanWeight = countTransportPlanWeight(transportItems);
      // 剩余重量 items为新调度暂存运单的量
      const items = transportItems.filter(item => !item.dirty && (item.iseffectiveStatus === 1 || item.iseffectiveStatus === undefined));
      const _remainWeights = countRemainWeight(_deliveryItems, items);
      this.remainWeights = _remainWeights.map(remainItem => {
        const { loadingNum } = transportPlanWeight.find(item => item.goodsId === remainItem.goodsId) || {
          goodsId: remainItem.goodsId,
          loadingNum: 0
        };
        return { ...remainItem, loadingNum };
      });

      this.setState({
        isChange: false
      });
    }
    const planWeight = this.remainWeights.map(item => {
      if (item.remainingNum < 0) {
        this.numError = `${item.categoryName}${item.goodsName}`;
      }
      return (
        <li key={item.goodsId}>
          <span style={numberStyle}>
            {`${getGoodsName(item)}——派车重量:${item.loadingNum.toFixed(2)}${item.goodsUnitCN}/剩余重量：${item.remainingNum.toFixed(2)}${item.goodsUnitCN}`}
          </span>
        </li>);
    });
    return (
      <ul style={{ padding: 0, margin: 0 }}>
        {planWeight}
      </ul>
    );
  };

  isAbleToDelete = record => {
    let check = true;
    if (record.dirty) {
      check = false;
    }
    return check;
  };

  countAgain = () => {
    this.setState({
      isChange: true
    });
  };

  handleCancelBtnClick = () => {
    this.setState({
      visible: false
    });
  };

  checkCarMatchAndSave = (value, form) => {
    /*
     * 点击确认添加时新增规则：
     * 根据选择的车辆id找到对应的对象， 获取车辆可匹配类型 carCategoryEntityList 数组
     * 遍历预约单，如果预约单（deliveryItems）中有一个货品无法匹配当前选择车辆可承载类型，进行弹窗提示，列出所有不匹配的货品
     * 弹窗确认，发送请求
     * 弹窗取消，重新选择车辆
     * */
    const { transportType = 1 } = this.props;
    const { deliveryItems, carId } = value;
    const { cars, allCars } = this.props;
    const carArray = transportType === 1 ? cars : allCars;
    const currentCarCategory = carArray.find(item => item.carId === carId).carCategoryEntityList;
    let categoryList = [];
    if (currentCarCategory) categoryList = currentCarCategory.map(item => item.categoryId);

    const matchFailCategory = [];

    deliveryItems.forEach(item => {
      if (!categoryList.find(_item => _item === item.firstCategoryId)) {
        matchFailCategory.push(item.firstCategoryName);
      }
    });
    if (matchFailCategory.length) {
      Modal.confirm({
        title: "提示",
        content:
          (<div>
            <span>当前选择车辆可承接货品与该预约单货品</span>
            {
              matchFailCategory.map(item => <span style={{ color: "#369FFF", marginRight: '3px', marginLeft: '3px' }}>{item}</span>)
            }
            <span>不匹配，是否确认派单？</span>
          </div>),
        onText: "确认",
        cancelText: "取消",
        onOk: () => this.handleSaveBtnClick(value),
        onCancel: () => form.setFieldsValue({ carId: "" })
      });
    } else {
      this.handleSaveBtnClick(value);
    }

  };

  handleSaveBtnClick = (value) => {
    const { transportType = 1 } = this.props;
    const receiving = this.props.preBooking.receivingItems && this.props.preBooking.receivingItems.find(item => item.receivingId === (+value.receivingId));

    const data = this.props.value ? [...this.props.value, {
      ...value,
      transportId: Math.random(),
      receivingId: (+value.receivingId),
      receivingName: receiving.receivingName,
      transportType
    }] : [{
      ...value,
      transportId: Math.random(),
      receivingId: (+value.receivingId),
      receivingName: receiving.receivingName,
      transportType
    }];
    this.props.onChange(data);
    this.setState({
      visible: false,
      isChange: true
    });
  };

  render() {
    const preBookingTransportTableColumns = [
      {
        title: "状态",
        dataIndex: "transportStatus",
        width: "120px",
        fixed: "left",
        render: (text, record) => {
          if (!record.transportNo) return "未创建运单";
          const statusArr = getTransportStatus(record);
          return (
            <>
              {statusArr.map((item) =>
                <span key={item.key} style={{ color: item.color }}>
                  {item.word}
                </span>
              )}
            </>
          );
        }
      },
      {
        title: "运单号",
        dataIndex: "transportNo",
        width: "200px",
        fixed: "left",
        render: transportNo => transportNo || <span style={{ color: "gray" }}>保存后生成</span>
      },
      {
        title: "车牌号",
        dataIndex: "carId",
        width: "200px",
        render: (text, record) => {
          if (record.carNo) return record.carNo;
          const { allCars, cars } = this.props;
          const car = uniqBy([...allCars, ...cars], "carId").find(item => item.carId === text);
          return `${car.carNo}`;
        }
      },
      {
        title: "司机",
        dataIndex: "driverUserId",
        render: (text, record) => {
          if (record.driverUserName) return record.driverUserName;
          const driver = this.props.allDrivers.find(item => item.userId === text);
          // 截取调后四位的手机尾号
          return driver.nickName.slice(0, -4);
        }
      },
      {
        title: "联系电话",
        dataIndex: "driverUserPhone"
      },
      {
        title: "提货点",
        dataIndex: "deliveryId",
        render: (text, record) => {
          if (record.transportDeliveryItems) {
            const entity = record.transportDeliveryItems.map((item, index) => <li
              title={`${item.deliveryName}`}
              className="test-ellipsis"
              key={index}
            >{item.deliveryName}
            </li>);
            return <ul style={{ padding: 0, margin: 0 }}>{entity}</ul>;
          }

          const list = record.deliveryItems.map(item => <li
            title={`${item.deliveryName}`}
            className="test-ellipsis"
            key={item.projectCorrelationId}
          >{item.deliveryName}
          </li>);

          return <ul style={{ padding: 0, margin: 0 }}>{list}</ul>;
        }
      },
      {
        title: "提货地址",
        dataIndex: "deliveryAddress",
        render: (text, record) => {
          if (record.transportDeliveryItems) {
            const entity = record.transportDeliveryItems.map((item, index) => <li
              title={`${item.deliveryAddress}`}
              className="test-ellipsis"
              key={index}
            >{item.deliveryAddress}
            </li>);
            return <ul style={{ padding: 0, margin: 0 }}>{entity}</ul>;
          }
          const list = record.deliveryItems.map(item => <li
            title={`${item.deliveryAddress}`}
            className="test-ellipsis"
            key={item.projectCorrelationId}
          >{item.deliveryAddress}
          </li>);

          return <ul style={{ padding: 0, margin: 0 }}>{list}</ul>;
        }
      },
      {
        title: "货品名称",
        dataIndex: "goodsId",
        render: (text, record) => {
          if (record.transportDeliveryItems) {
            const entity = record.transportDeliveryItems.map((item, index) => (
              <li
                title={getGoodsName(item)}
                className="test-ellipsis"
                key={index}
              >{getGoodsName(item)}
              </li>));
            return <ul style={{ padding: 0, margin: 0 }}>{entity}</ul>;
          }
          const list = record.deliveryItems.map(item => (
            <li
              title={getGoodsName(item)}
              className="test-ellipsis"
              key={item.projectCorrelationId}
            >{getGoodsName(item)}
            </li>));

          return <ul style={{ padding: 0, margin: 0 }}>{list}</ul>;
        }
      },
      {
        title: "分配重量",
        dataIndex: "goodsNum",
        render: (text, record) => {
          if (record.transportDeliveryItems) {
            const entity = record.transportDeliveryItems.map((item, index) => <li
              title={`${item.loadingNum}`}
              className="test-ellipsis"
              key={index}
            >{`${item.loadingNum}`}
            </li>);
            return <ul style={{ width: "100px", padding: 0, margin: 0 }}>{entity}</ul>;
          }
          const list = record.deliveryItems.map(item => <li
            title={`${item.goodsNum}`}
            className="test-ellipsis"
            key={item.projectCorrelationId}
          >{`${item.goodsNum}`}
          </li>);

          return <ul style={{ width: "100px", padding: 0, margin: 0 }}>{list}</ul>;
        }
      },
      {
        title: "货品单位",
        dataIndex: "goodsUnit",
        render: (text, record) => {
          if (record.transportDeliveryItems) {
            const entity = record.transportDeliveryItems.map((item, index) => <li
              title={`${item.goodsUnitCN}`}
              className="test-ellipsis"
              key={index}
            >{`${item.goodsUnitCN}`}
            </li>);
            return <ul style={{ width: "100px", padding: 0, margin: 0 }}>{entity}</ul>;
          }
          const list = record.deliveryItems.map(item => <li
            title={`${item.goodsUnitCN}`}
            className="test-ellipsis"
            key={item.projectCorrelationId}
          >{`${item.goodsUnitCN}`}
          </li>);

          return <ul style={{ width: "100px", padding: 0, margin: 0 }}>{list}</ul>;
        }
      },
      {
        title: "运费单价",
        dataIndex: "freightPrice",
        render: (text, record) => {
          if (record.transportDeliveryItems) {
            const entity = record.transportDeliveryItems.map((item, index) => <li
              title={`${item.freightPrice === null ? 0 : item.freightPrice}元`}
              className="test-ellipsis"
              key={index}
            >{`${item.freightPrice === null ? 0 : item.freightPrice}元`}
            </li>);
            return <ul style={{ width: "100px", padding: 0, margin: 0 }}>{entity}</ul>;
          }
          const list = record.deliveryItems.map(item => <li
            title={`${item.freightPrice}`}
            className="test-ellipsis"
            key={item.projectCorrelationId}
          >{`${item.freightPrice}元`}
          </li>);

          return <ul style={{ width: "100px", padding: 0, margin: 0 }}>{list}</ul>;
        }
      },
      {
        title: "卸货点",
        dataIndex: "receivingId",
        render: (text, record) => record.receivingName
      },
      {
        title: "卸货地址",
        dataIndex: "receivingAddress",
        render: (text, record) => record.receivingAddress
      }
    ];
    const { name, mode } = this.props;
    const _name = name.replace("Items", "");
    const dispatchMessage = pick(this.dispatchConfig, _name)[_name];
    const readOnly = mode === FORM_MODE.DETAIL || isEmpty(dispatchMessage);
    const { formSchema, visible, ready } = this.state;
    return (
      ready ?
        <>
          <Modal
            title="添加运单"
            visible={visible}
            onCancel={this.handleCancel}
            centered
            destroyOnClose
            footer={null}
            className="modal-box-big"
          >
            <SchemaForm layout="horizontal" mode={FORM_MODE.ADD} {...formItemLayout} schema={formSchema}>
              <Item field="carId" />
              <Item field="driverUserId" />
              <Item field="driverUserPhone" />
              <Item field="deliveryItems" />
              <Item field="receivingId" />
              <Item field="receivingAddress" />
              <div style={{ paddingRight: "20px", textAlign: "right" }}>
                <Button className="mr-10" onClick={this.handleCancel}>取消</Button>
                <DebounceFormButton label="确定" type="primary" onClick={this.checkCarMatchAndSave} />
              </div>
            </SchemaForm>
          </Modal>
          {ready && this.renderRestGoodsInfo()}
          <EditableTable
            minWidth={3000}
            afterDeleteRow={this.countAgain}
            isAbleToDelete={this.isAbleToDelete}
            rowKey="transportId"
            addModal={this.showModal}
            readOnly={readOnly}
            onChange={this.props.onChange}
            columns={preBookingTransportTableColumns}
            pagination={false}
            dataSource={this.props.value}
          />
        </> :
        <Card bordered={false}>
          车辆、司机数据加载中...
        </Card>
    );
  }
}

// export default TransportTable

export default connect(mapStateToProps, {
  getShipmentCars,
  getShipmentDrivers,
  getPlatformAllCars,
  getPlatformAllDrivers
})(
  class RefHander extends Component {
    render() {
      const { _ref, ...rest } = this.props;
      return (
        <TransportTable ref={_ref} {...rest} />
      );
    }
  }
);
