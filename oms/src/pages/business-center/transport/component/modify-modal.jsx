import React, { Component } from 'react';
import { notification, Tabs, Row, Button, Modal, Col } from 'antd';
import moment from 'moment';
import { FORM_MODE, Item, Observer, SchemaForm } from '@gem-mine/antd-schema-form';
import DebounceFormButton from '../../../../components/debounce-form-button';
import '@gem-mine/antd-schema-form/lib/fields';
import { GOOD_UNIT_CN } from '../../../../constants/project/project';
import { getProjectDetail, setTransportMsgApi, getTransport, getCarByShipment } from '../../../../services/apiService';
import UploadFile from '../../../../components/upload/upload-file';
import auth from '../../../../constants/authCodes';

const {
  TRANSPORT_MODIFY_BILL,
  TRANSPORT_MODIFY_NUMBER,
  TRANSPORT_MODIFY_UNLOAD_POINT,
} = auth;

const uploadPicStyle = {
  display: 'inline-block',
};

const organizationTypeDist = {
  '1': '平台方',
  '4': '托运方',
  '5': '承运方',
};

export default class ModifyModal extends Component {
  state = {
    receivingItems: [],
    ready: false,
  };

  schemaDelivery = {}

  schemaReceiving = {}

  schemaWeigh = {}

  async componentDidMount() {
    const {
      data: {
        projectId,
        contactName,
        contactPhone,
        receivingAddress,
        receivingId,
        transportId,
        receivingTime,
      },
      updateType = '',
    } = this.props;
    // 权限
    const authLocal = JSON.parse(localStorage.getItem('authority'));
    this.modifyBillPermission = authLocal.find(item => item.permissionCode === TRANSPORT_MODIFY_BILL);  // 修改单据、签收单号
    this.modifyNumberPermission = authLocal.find(item => item.permissionCode === TRANSPORT_MODIFY_NUMBER);  // 修改数量
    this.modifyUnloadPointPermission = authLocal.find(item => item.permissionCode === TRANSPORT_MODIFY_UNLOAD_POINT);  // 修改卸货点
    const { items } = await getCarByShipment({
      isAll: true,
      limit: 1000,
      offset: 0,
    });
    const cars = [...items];
    const { goodsItems, receivingItems } = await getProjectDetail(projectId);
    const goodsItemOptions = goodsItems ? goodsItems.map(item => ({
      key: item.goodsId,
      value: item.goodsId,
      label: `${item.categoryName}-${item.goodsName}`,
    })) : [];
    // 运单详情
    getTransport(transportId)
      .then(({ signItems, deliveryItems, deliveryTime =  null, carId, logisticsBusinessTypeEntity: logs }) => {
        // 是否为自动配置的提货单号
        this.isAutoConfigDeliveryBillNumber = !!(logs && logs.billNumberType && logs.billNumberType.split(',').find(item => item === '1'));
        // 是否为自动配置的提货单据图片
        this.isAutoConfigDeliveryBillPicture = !!(logs && logs.billPictureType && logs.billPictureType.split(',').find(item => item === '1'));
        // 是否为自动配置的过磅单号
        this.isAutoConfigWeighBillNumber = !!(logs && logs.billNumberType && logs.billNumberType.split(',').find(item => item === '2'));
        // 是否为自动配置的过磅单据图片
        this.isAutoConfigWeighBillPicture = !!(logs && logs.billPictureType && logs.billPictureType.split(',').find(item => item === '2'));
        // 是否为自动配置的签收单号
        this.isAutoConfigReceivingBillNumber = !!(logs && logs.billNumberType && logs.billNumberType.split(',').find(item => item === '3'));
        // 是否为自动配置的签收单据图片
        this.isAutoConfigReceivingBillPicture = !!(logs && logs.billPictureType && logs.billPictureType.split(',').find(item => item === '3'));

        // 签收
        this.schemaReceiving = deliveryItems.reduce((deliveryObject, current) => {
          const schemaReceiving = {
            [`${current.goodsId}_goodsName`]: {
              label: '货品名称',
              component: 'input',
              disabled: true,
              defaultValue: `${current.categoryName}-${current.goodsName}`,
            },
            [`${current.goodsId}_receivingNum`]: {
              label: '签收数量',
              component: 'input',
              defaultValue: current.receivingNum,
              addonAfter: current.receivingUnitCN,
              disabled: !this.modifyNumberPermission,
              rules: {
                required: [true, '请输入签收数量'],
                pattern: /^\d+(\.\d+)?$/
              },
            },
            receivingTime: {
              label: '签收时间',
              component: 'datePicker',
              showTime: true,
              rules: {
                required: [true, '请选择签收时间'],
              },
              defaultValue: receivingTime ? moment(receivingTime) : '',
            },

          };
          const renderer = () => (
            <div key={current.goodsId}>
              <Item field={`${current.goodsId}_goodsName`} />
              <Item field={`${current.goodsId}_receivingNum`} />
              {/* <Item field='receivingTime' /> */}
              {/* <Item field={`${current.goodsId}_receivingTime`} /> */}
              {/* {updateType ? <Item field={`${current.goodsId}_receivingNum`} /> : <></>} */}
              {/* {updateType ? <Item field={`${current.goodsId}_receivingTime`} /> : <></>} */}
            </div>
          );
          return {
            schemaReceiving: { ...deliveryObject.schemaReceiving, ...schemaReceiving },
            rendererReceiving: [...deliveryObject.rendererReceiving, renderer],
          };
        }, { schemaReceiving: {}, rendererReceiving: [] });

        // 签收加载单据图片
        const receivingImgArray = signItems[0].billDentryid ? signItems[0].billDentryid.split(',') : [[], [], []]; // 图片数组
        const entityReceiving = {
          picture1: receivingImgArray[0] && receivingImgArray[0].length ? [receivingImgArray[0]] : [],
          picture2: receivingImgArray[1] && receivingImgArray[1].length ? [receivingImgArray[1]] : [],
          picture3: receivingImgArray[2] && receivingImgArray[2].length ? [receivingImgArray[2]] : [],
        };
        Object.defineProperties(this.schemaReceiving, { entityReceiving: { value: entityReceiving, writable: true } });

        const schema = {
          billNumber: {
            label: '签收单号',
            component: 'input',
            rules: {
              required: [true, '请输入签收单号'],
            },
            disabled: this.isAutoConfigReceivingBillNumber || !this.modifyBillPermission,  // 如果是自动配置的或者没有修改权限，disabled等于true
            defaultValue: signItems[0].billNumber,
          },
          billDentryid: {
            label: '单据图片',
            value: Observer({
              watch: ['picture1', 'picture2', 'picture3'],
              action: ([picture1 = [], picture2 = [], picture3 = []]) => {
                const pictureGroup = [...picture1, ...picture2, ...picture3];
                return pictureGroup.join(',');
              },
            }),
          },
          picture1: {
            component: UploadFile,
            readOnly: this.isAutoConfigReceivingBillPicture || !this.modifyBillPermission,
          },
          picture2: {
            component: UploadFile,
            readOnly: this.isAutoConfigReceivingBillPicture || !this.modifyBillPermission,
          },
          picture3: {
            component: UploadFile,
            readOnly: this.isAutoConfigReceivingBillPicture || !this.modifyBillPermission,
          },
          updateReason: {
            label: '更改原因',
            component: !this.modifyBillPermission && !this.modifyNumberPermission ? 'hide' : 'input.textArea',
            rules: {
              required: [true, '请输入更改原因'],
              max: [200, '更改原因不得超过200个字符'],
            },
            defaultValue: updateType && '与实体单对照修改',
            placeholder: '请输入更改原因',
          },
        };

        this.schemaReceiving.schemaReceiving = { ...this.schemaReceiving.schemaReceiving, ...schema };

        // 过磅
        const WeighImgArray = signItems[0].weighDentryid ? signItems[0].weighDentryid.split(',') : [[], [], []]; // 图片数组

        const entityWeigh = {

          picture1: WeighImgArray[0] && WeighImgArray[0].length ? [WeighImgArray[0]] : [],
          picture2: WeighImgArray[1] && WeighImgArray[1].length ? [WeighImgArray[1]] : [],
          picture3: WeighImgArray[2] && WeighImgArray[2].length ? [WeighImgArray[2]] : [],
        };
        const newObj =  deliveryItems.length ? deliveryItems.reduce((r, item,  i) => (
          {
            ...r,
            [`transportWeighUpdateDetailReqs[${i}].goodsId`]: {
              label: '货品名称',
              component: 'select',
              options: goodsItems ? goodsItems
                .map(item => ({
                  key: item.goodsId,
                  value: item.goodsId,
                  label: `${item.categoryName}-${item.goodsName}`,
                })): [],
              disabled: true,
              defaultValue: item.goodsId,
            },
            [`transportWeighUpdateDetailReqs[${i}].weighNum`]: {
              label: '过磅数量',
              component: 'input',
              rules: {
                required: [true, '请输入过磅数量'],
                pattern: /^\d+(\.\d+)?$/
              },
              disabled: !this.modifyNumberPermission,
              defaultValue: item.weighNum,
              addonAfter: GOOD_UNIT_CN[item.weighUnit],
            },
          }
        ), {}) : {};
        const schemaWeigh = {
          weighNumber: {
            label: '过磅单号',
            component: 'input',
            rules: {
              required: [true, '请输入过磅单号'],
            },
            disabled: this.isAutoConfigWeighBillNumber || !this.modifyBillPermission,  // 如果是自动配置的或者没有修改权限，disabled等于true
            defaultValue: signItems[0].weighNumber,
          },
          ...newObj,
          weighDentryid: {
            label: '单据图片',
            value: Observer({
              watch: ['picture1', 'picture2', 'picture3'],
              action: ([picture1 = [], picture2 = [], picture3 = []]) => {
                const pictureGroup = [...picture1, ...picture2, ...picture3];
                return pictureGroup.join(',');
              },
            }),
          },
          picture1: {
            component: UploadFile,
            readOnly: this.isAutoConfigWeighBillPicture || !this.modifyBillPermission,
          },
          picture2: {
            component: UploadFile,
            readOnly: this.isAutoConfigWeighBillPicture || !this.modifyBillPermission,
          },
          picture3: {
            component: UploadFile,
            readOnly: this.isAutoConfigWeighBillPicture || !this.modifyBillPermission,
          },
          updateReason: {
            label: '更改原因',
            component: !this.modifyBillPermission && !this.modifyNumberPermission ? 'hide' : 'input.textArea',
            rules: {
              required: [true, '请输入更改原因'],
              max: [200, '更改原因不得超过200个字符'],
            },
            placeholder: '请输入更改原因',
            defaultValue: updateType && '与实体单对照修改',
          },
        };
        const renderer = () => deliveryItems.map((item, i) => (
          <div key={item.goodsId}>
            <Item field={`transportWeighUpdateDetailReqs[${i}].goodsId`} />
            <Item field={`transportWeighUpdateDetailReqs[${i}].weighNum`} />
          </div>
        ));

        this.schemaWeigh = {
          schemaWeigh,
          entityWeigh,
          renderer,
        };
        // 提货
        this.schemaDelivery = deliveryItems.reduce((deliveryObject, current) => {
          // 单据图片数组
          const deliveryImgArray = current.billDentryid ? current.billDentryid.split(',') : [[], [], []];
          const entityDelivery = {
            [`${current.transportCorrelationId}_picture1`]: deliveryImgArray[0] && deliveryImgArray[0].length ? [deliveryImgArray[0]] : [],
            [`${current.transportCorrelationId}_picture2`]: deliveryImgArray[1] && deliveryImgArray[1].length ? [deliveryImgArray[1]] : [],
            [`${current.transportCorrelationId}_picture3`]: deliveryImgArray[2] && deliveryImgArray[2].length ? [deliveryImgArray[2]] : [],
          };
          const schemaDelivery = {
            // [`${current.transportCorrelationId}_carId`]: {
            //   label: '车辆',
            //   component: 'select',
            //   options: cars ? cars
            //     .map(item => ({
            //       key: item.carId,
            //       value: item.carId,
            //       label: `${item.carNo}`,
            //     })) : [],
            //   defaultValue: carId,
            // },
            [`${current.transportCorrelationId}_deliveryName`]: {
              label: '提货点',
              component: 'input',
              disabled: true,
              defaultValue: current.deliveryName,
            },
            [`${current.transportCorrelationId}_deliveryAddress`]: {
              label: '提货地址',
              component: 'input',
              disabled: true,
              defaultValue: current.deliveryAddress,
            },
            [`${current.transportCorrelationId}_deliveryTime`]: {
              label: '提货时间',
              showTime: true,
              component: 'datePicker',
              rules: {
                required: [true, '请选择提货时间'],
              },
              defaultValue: current.processPointCreateTime ? moment(current.processPointCreateTime) : '',
            },
            [`${current.transportCorrelationId}_goodsName`]: {
              label: '货品名称',
              // disabled: !updateType,
              component: 'select',
              options: goodsItemOptions,
              defaultValue: current.goodsId,
            },
            [`${current.transportCorrelationId}_goodsId`]: {
              component: 'hide',
              defaultValue: current.goodsId,
            },
            [`${current.transportCorrelationId}_deliveryNumber`]: {
              label: '提货单号',
              component: 'input',
              defaultValue: current.billNumber,
              disabled: this.isAutoConfigDeliveryBillNumber || !this.modifyBillPermission,
              rules: {
                required: [true, '请输入提货单号'],
              },
            },
            [`${current.transportCorrelationId}_deliveryNum`]: {
              label: '提货数量',
              component: 'input',
              disabled: !this.modifyNumberPermission,
              defaultValue: current.deliveryNum,
              rules: {
                required: [true, '请输入提货数量'],
                pattern: /^\d+(\.\d+)?$/
              },
              addonAfter: GOOD_UNIT_CN[current.goodsUnit],
            },
            [`${current.transportCorrelationId}_deliveryDentryid`]: {
              label: '单据图片',
              value: Observer({
                watch: [`${current.transportCorrelationId}_picture1`, `${current.transportCorrelationId}_picture2`, `${current.transportCorrelationId}_picture3`],
                action: ([picture1 = [], picture2 = [], picture3 = []]) => {
                  const pictureGroup = [...picture1, ...picture2, ...picture3];
                  return pictureGroup.join(',');
                },
              }),
            },
            [`${current.transportCorrelationId}_picture1`]: {
              component: UploadFile,
              readOnly: this.isAutoConfigDeliveryBillPicture || !this.modifyBillPermission,
            },
            [`${current.transportCorrelationId}_picture2`]: {
              component: UploadFile,
              readOnly: this.isAutoConfigDeliveryBillPicture || !this.modifyBillPermission,
            },
            [`${current.transportCorrelationId}_picture3`]: {
              component: UploadFile,
              readOnly: this.isAutoConfigDeliveryBillPicture || !this.modifyBillPermission,
            },
            updateReason: {
              label: '更改原因',
              component: (!this.modifyBillPermission && !this.modifyNumberPermission) ? 'hide' : 'input.textArea',
              rules: {
                required: [true, '请输入更改原因'],
                max: [200, '更改原因不得超过200个字符'],
              },
              placeholder: '请输入更改原因',
              defaultValue: updateType && '与实体单对照修改',
            },
          };

          const renderer = () => (
            <div key={current.goodsId}>
              {/* {updateType ? <Item field={`${current.transportCorrelationId}_carId`} /> : <></>} */}
              {/* <Item field={`${current.transportCorrelationId}_carId`} /> */}
              <Item field={`${current.transportCorrelationId}_deliveryName`} />
              <Item field={`${current.transportCorrelationId}_deliveryAddress`} />
              {/* {updateType ? <Item field={`${current.transportCorrelationId}_deliveryTime`} /> : <></>} */}
              <Item field={`${current.transportCorrelationId}_deliveryTime`} />
              <Item field={`${current.transportCorrelationId}_goodsName`} />
              <Item field={`${current.transportCorrelationId}_goodsId`} />
              <Item field={`${current.transportCorrelationId}_deliveryNumber`} />
              <Item field={`${current.transportCorrelationId}_deliveryNum`} />
              <Item field={`${current.transportCorrelationId}_deliveryDentryid`} />
              <Row justify='center' type='flex' align='middle'>
                <Col>
                  <Item style={uploadPicStyle} field={`${current.transportCorrelationId}_picture1`} />
                </Col>
                <Col>
                  <Item style={uploadPicStyle} field={`${current.transportCorrelationId}_picture2`} />
                </Col>
                <Col>
                  <Item style={uploadPicStyle} field={`${current.transportCorrelationId}_picture3`} />
                </Col>
              </Row>
            </div>
          );
          return {
            schemaDelivery: { ...deliveryObject.schemaDelivery, ...schemaDelivery },
            rendererDelivery: [...deliveryObject.rendererDelivery, renderer],
            entityDelivery: { ...deliveryObject.entityDelivery, ...entityDelivery  },
          };
        }, { schemaDelivery: {}, rendererDelivery: [], entityDelivery: {} });

        // 多提情况下也只选择一辆车
        this.schemaDelivery.schemaDelivery = {
          ...this.schemaDelivery.schemaDelivery,
          carId: {
            label: '车辆',
            component: 'select',
            options: cars ? cars
              .map(item => ({
                key: item.carId,
                value: item.carId,
                label: `${item.carNo}`,
              })) : [],
            defaultValue: carId,
          } };
        // return getProjectDetail(projectId);
      })
      .then(() => {
        const receivingSites = receivingItems.map(item => ({
          label: item.receivingName,
          value: item.receivingId,
          key: item.receivingId,
        }));
        this.schemaUnloading = {
          receivingId: {
            label: '卸货点',
            component: 'select',
            disabled: !this.modifyUnloadPointPermission,
            options: receivingSites,
            defaultValue: receivingId,
          },
          receivingAddress: {
            label: '卸货地址',
            component: 'input',
            disabled: true,
            defaultValue: receivingAddress,
            value: Observer({
              watch: 'receivingId',
              action: (receivingId) => this.handleChangeMsg(receivingId, 'receivingAddress'),
            }),
          },
          contactName: {
            label: '联系人',
            component: 'input',
            disabled: true,
            defaultValue: contactName,
            value: Observer({
              watch: 'receivingId',
              action: (receivingId) => this.handleChangeMsg(receivingId, 'contactName'),
            }),
          },
          contactPhone: {
            label: '联系电话',
            component: 'input',
            disabled: true,
            defaultValue: contactPhone,
            value: Observer({
              watch: 'receivingId',
              action: (receivingId) => this.handleChangeMsg(receivingId, 'contactPhone'),
            }),
          },
          updateReason: {
            label: '更改原因',
            component: !this.modifyUnloadPointPermission ? 'hide' : 'input.textArea',
            rules: {
              required: [true, '请输入更改原因'],
              max: [200, '更改原因不得超过200个字符'],
            },
            placeholder: '请输入更改原因',
            defaultValue: updateType && '与实体单对照修改',
          },
        };
        this.setState({
          receivingItems,
        });
      })
      .then(() => this.setState({ ready: true }));
  }

  // 提货按钮
  handleConfirmDeliveryBtnClick = formdata => {
    const { updateReason, carId, ...others } = formdata;
    const { data: { transportId } } = this.props;
    const { entityDelivery } = this.schemaDelivery;
    // entityReceiving 表示图片的初始状态，如果全空则为[{id1_picture1 : []},{id1_picture2 : []},{id2_picture1} ... ]，如果有任一属性中的数组不为空，则必填
    const imgRequired = !!(Object.entries(entityDelivery).find(item => item[1].length)); // 对象转数组，数组第一位为key，第二位为值，用find遍历查找是否存在不为空的值

    // Object.entries : 将剩余的对象转化为数组，数组的每一位结构为[键 ， 值]
    // 用reduce循环处理数组，得到[{id : xx , 数量 : xx} , {id : yy , 数量 : yy} ... ]的结构

    const deliverys = Object.entries(others).reduce((dataObject, [key, value]) => {
      const [transportCorrelationId, field] = key.split('_');

      // 校验图片是否为空
      if (field === 'deliveryDentryid' && !value && imgRequired) {
        notification.warning({ message: '请确保每个提货点至少上传一张图片' });
        return;
      }
      // 数量保留三位小数
      if (field === 'deliveryNum') return {
        ...dataObject,
        [transportCorrelationId]: { ...dataObject[transportCorrelationId], [field]: parseFloat(value).toFixed(3) },
      };

      if (field === 'deliveryNumber' || field === 'deliveryDentryid') return {
        ...dataObject,
        [transportCorrelationId]: { ...dataObject[transportCorrelationId], [field]: value },
      };
      if (field === 'deliveryTime') return {
        ...dataObject,
        [transportCorrelationId]: { ...dataObject[transportCorrelationId], deliveryTime: value && value.format('YYYY/MM/DD HH:mm:ss') },
      };
      if (field === 'goodsName') return {
        ...dataObject,
        [transportCorrelationId]: { ...dataObject[transportCorrelationId], goodsId: value },
      };

      return { ...dataObject };
    }, {});
    const params = Object.entries(deliverys).reduce((dataObject, [key, value]) => [...dataObject, { transportCorrelationId: key, carId, ...value }], []);

    setTransportMsgApi(transportId, {
      transportDeliveryUpdateReqs: params,
      updateReason,
    }).then((res) => {
      const { accountTransportInfoResps, accountGoodsInfoResps } = res;
      if ((accountTransportInfoResps && accountTransportInfoResps.length) || (accountGoodsInfoResps && accountGoodsInfoResps.length)) {

        // 生成对账单渲染数据
        const generateErrorMsg = () => {
          const renderer = [];
          accountTransportInfoResps?.forEach(value => {
            renderer.push(() =>
              <div key={value.accountTransportNo}>
                <div>该运单已被{organizationTypeDist[value.organizationType]}纳入对账单，不能进行修改</div>
                <div>对账单号：{value.accountTransportNo}</div>
              </div>);
          });

          accountGoodsInfoResps?.forEach(value => {
            renderer.push(() =>
              <div key={value.accountTransportNo}>
                <div>该运单已被{organizationTypeDist[value.organizationType]}纳入对账单，不能进行修改</div>
                <div>对账单号：{value.accountTransportNo}</div>
              </div>);
          });

          return (
            <>
              {renderer.map(fuc => fuc())}
            </>
          );
        };

        Modal.info({
          title: '修改运单',
          content: generateErrorMsg(),
        });
      } else {
        notification.success({
          message: '修改成功！',
        });
      }
      this.props.onCloseModal();
      this.props.refrash(res, 1);
    });
  };


  // 签收按钮
  handleConfirmReceivingBtnClick = formdata => {
    const { billNumber, updateReason, billDentryid, receivingTime, ...others } = formdata;
    const { data: { transportId } } = this.props;
    // entityReceiving 表示图片的初始状态，如果全空则为[{picture1 : []},{picture2 : []},{picture3 : []}]，如果有任一数组不为空，则必填
    const { entityReceiving } = this.schemaReceiving;
    // 判断图片是否应该必填
    const imgRequired = !!(Object.entries(entityReceiving).find(item => item[1].length));
    if (!billDentryid && imgRequired) {
      notification.warning({
        message: '请确保至少上传一张图片',
      });
      return;
    }

    // 生成货品数组
    // Object.entries : 将剩余的对象转化为数组，数组的每一位结构为[键 ， 值]
    // 用reduce循环处理数组，得到[{id : xx , 数量 : xx} , {id : yy , 数量 : yy} ... ]的结构
    const goods = Object.entries(others).reduce((dataObject, [key, value]) => {
      // 从key值中取出货品ID和当前货品的词条（签收数量）
      const [goodsId, field] = key.split('_');
      // 需要对应的变量为 goodsID 和 field为 receivingNum 的 value
      if (field === 'receivingNum') return [...dataObject, { goodsId, receivingNum: parseFloat(value).toFixed(3) }];
      // if (field === 'receivingTime') return [...dataObject, { goodsId, receivingTime: value && value.format('YYYY/MM/DD HH:mm:ss') }];
      return dataObject;
    }, []);


    const params = {
      transportReceivingUpdateReq: {
        receivingNumber: billNumber,
        transportReceivingUpdateDetailReqs: goods,
        receivingDentryid: billDentryid,
        receivingTime : receivingTime.format('YYYY/MM/DD HH:mm:ss')
      },
      updateReason,
    };

    setTransportMsgApi(transportId, params).then((res) => {
      const { accountTransportInfoResps, accountGoodsInfoResps } = res;
      if ((accountTransportInfoResps && accountTransportInfoResps.length) || (accountGoodsInfoResps && accountGoodsInfoResps.length)) {

        // 生成对账单渲染数据
        const generateErrorMsg = () => {
          const renderer = [];
          accountTransportInfoResps?.forEach(value => {
            renderer.push(() =>
              <div key={value.accountTransportNo}>
                <div>该运单已被{value.organizationName}纳入对账单，不能进行修改</div>
                <div>对账单号：{value.accountTransportNo}</div>
              </div>);
          });

          accountGoodsInfoResps?.forEach(value => {
            renderer.push(() =>
              <div key={value.accountTransportNo}>
                <div>该运单已被{value.organizationName}纳入对账单，不能进行修改</div>
                <div>对账单号：{value.accountTransportNo}</div>
              </div>);
          });

          return (
            <>
              {renderer.map(fuc => fuc())}
            </>
          );
        };

        Modal.info({
          title: '运单修改',
          content: generateErrorMsg(),
        });
      } else {
        notification.open({
          message: '修改成功！',
        });
      }
      this.props.onCloseModal();
      this.props.refrash(res, 2);
    });
  };

  // 过磅按钮
  handleConfirmWeighBtnClick = formdata => {
    const { weighNumber, updateReason, weighDentryid, transportWeighUpdateDetailReqs } = formdata;
    const { data: { transportId } } = this.props;
    // entityReceiving 表示图片的初始状态，如果全空则为[{picture1 : []},{picture2 : []},{picture3 : []}]，如果有任一数组不为空，则必填
    const { entityReceiving } = this.schemaReceiving;
    // 判断图片是否应该必填
    const imgRequired = !!(Object.entries(entityReceiving).find(item => item[1].length));
    if (!weighDentryid && imgRequired) {
      notification.warning({
        message: '请确保至少上传一张图片',
      });
      return;
    }


    const params = {
      transportWeighUpdateReq: {
        weighDentryid,
        weighNumber,
        transportWeighUpdateDetailReqs,
      },
      updateReason,
    };

    setTransportMsgApi(transportId, params).then((res) => {
      const { accountTransportInfoResps, accountGoodsInfoResps } = res;
      if ((accountTransportInfoResps && accountTransportInfoResps.length) || (accountGoodsInfoResps && accountGoodsInfoResps.length)) {

        // 生成对账单渲染数据
        const generateErrorMsg = () => {
          const renderer = [];
          accountTransportInfoResps?.forEach(value => {
            renderer.push(() =>
              <div key={value.accountTransportNo}>
                <div>该运单已被{value.organizationName}纳入对账单，不能进行修改</div>
                <div>对账单号：{value.accountTransportNo}</div>
              </div>);
          });

          accountGoodsInfoResps?.forEach(value => {
            renderer.push(() =>
              <div key={value.accountTransportNo}>
                <div>该运单已被{value.organizationName}纳入对账单，不能进行修改</div>
                <div>对账单号：{value.accountTransportNo}</div>
              </div>);
          });

          return (
            <>
              {renderer.map(fuc => fuc())}
            </>
          );
        };

        Modal.info({
          title: '运单修改',
          content: generateErrorMsg(),
        });
      } else {
        notification.open({
          message: '修改成功！',
        });
      }
      this.props.onCloseModal();
      this.props.refrash(res, 4);
    });
  };

  // 卸货按钮
  handleConfirmUnloadingBtnClick = formData => {
    const { data: { transportId } } = this.props;
    const params = {
      transportReceivingPointReq: {
        receivingId: formData.receivingId,
      },
      updateReason: formData.updateReason,
    };
    setTransportMsgApi(transportId, params).then((res) => {
      notification.open({
        message: '修改成功！',
      });
      this.props.onCloseModal();
      this.props.refrash(res, 3);
    });
  };

  // 根据卸货点的切换动态渲染该卸货点的其他信息：卸货人，联系方式...
  handleChangeMsg = (receivingId, fieldName) => {
    const { receivingItems } = this.state;
    const findedItem = receivingItems.find(item => item.receivingId === receivingId) || {};
    return findedItem[fieldName];
  };

  render() {
    const { TabPane } = Tabs;
    const { ready } = this.state;
    const { schemaReceiving, rendererReceiving, entityReceiving } = this.schemaReceiving;
    const { schemaWeigh, entityWeigh, renderer } = this.schemaWeigh;
    const { schemaDelivery, rendererDelivery, entityDelivery } = this.schemaDelivery;
    // const { updateType  = '' } = this.props;
    return (
      <Tabs>
        <TabPane tab='提货信息' key='1'>
          {ready &&
          <SchemaForm data={entityDelivery} mode={FORM_MODE.MODIFY} schema={schemaDelivery}>
            <Item field='carId' />
            {rendererDelivery.map(func => func())}
            <Item field='updateReason' />
            {(this.modifyBillPermission || this.modifyNumberPermission) &&
            <Row justify='end' type='flex'>
              <Button style={{ marginRight: '10px' }} onClick={this.props.onCloseModal}>取消</Button>
              <DebounceFormButton label='确定' type='primary' debounce onClick={this.handleConfirmDeliveryBtnClick} />
            </Row>}
          </SchemaForm>}
        </TabPane>

        <TabPane tab='过磅信息' key='4'>
          {ready &&
          <SchemaForm mode={FORM_MODE.MODIFY} data={entityWeigh} schema={schemaWeigh}>
            {/* {rendererReceiving.map(func => func())} */}
            <Item field='weighNumber' />
            {/* {updateType ? renderer() : <> </>} */}
            {renderer()}
            <Item field='weighDentryid' />
            <Row justify='center' type='flex' align='middle'>
              <Col>
                <Item style={uploadPicStyle} field='picture1' />
              </Col>
              <Col>
                <Item style={uploadPicStyle} field='picture2' />
              </Col>
              <Col>
                <Item style={uploadPicStyle} field='picture3' />
              </Col>
            </Row>
            <Item field='updateReason' />
            {(this.modifyBillPermission || this.modifyNumberPermission) &&
            <Row justify='end' type='flex'>
              <Button style={{ marginRight: '10px' }} onClick={this.props.onCloseModal}>取消</Button>
              <DebounceFormButton label='确定' type='primary' debounce onClick={this.handleConfirmWeighBtnClick} />
            </Row>}
          </SchemaForm>}
        </TabPane>

        <TabPane tab='签收信息' key='2'>
          {ready &&
          <SchemaForm mode={FORM_MODE.MODIFY} data={entityReceiving} schema={schemaReceiving}>
            {rendererReceiving.map(func => func())}
            <Item field='receivingTime' />
            <Item field='billNumber' />
            <Item field='billDentryid' />
            {/* {updateType ? <Item field='receivingTime' /> : <></>} */}
            <Row justify='center' type='flex' align='middle'>
              <Col>
                <Item style={uploadPicStyle} field='picture1' />
              </Col>
              <Col>
                <Item style={uploadPicStyle} field='picture2' />
              </Col>
              <Col>
                <Item style={uploadPicStyle} field='picture3' />
              </Col>
            </Row>
            <Item field='updateReason' />
            {(this.modifyBillPermission || this.modifyNumberPermission) &&
            <Row justify='end' type='flex'>
              <Button style={{ marginRight: '10px' }} onClick={this.props.onCloseModal}>取消</Button>
              <DebounceFormButton label='确定' type='primary' debounce onClick={this.handleConfirmReceivingBtnClick} />
            </Row>}
          </SchemaForm>}
        </TabPane>

        <TabPane tab='卸货信息' key='3'>
          {ready &&
          <SchemaForm mode={FORM_MODE.MODIFY} schema={this.schemaUnloading}>
            <Item field='receivingId' style={{ marginTop: '5px' }} />
            <Item field='receivingAddress' style={{ marginTop: '5px' }} />
            <Item field='contactName' style={{ marginTop: '5px' }} />
            <Item field='contactPhone' style={{ marginTop: '5px' }} />
            <Item field='updateReason' style={{ marginTop: '10px' }} />
            {this.modifyUnloadPointPermission &&
            <Row justify='end' type='flex'>
              <Button style={{ marginRight: '10px' }} onClick={this.props.onCloseModal}>取消</Button>
              <DebounceFormButton label='确定' type='primary' debounce onClick={this.handleConfirmUnloadingBtnClick} />
            </Row>}
          </SchemaForm>}
        </TabPane>

      </Tabs>
    );
  }

}
