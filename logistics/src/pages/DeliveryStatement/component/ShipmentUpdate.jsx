import React, { Component } from 'react';
import { Button, Modal, notification } from 'antd';
import { FORM_MODE, Item, Observer, SchemaForm } from '@gem-mine/antd-schema-form';
import moment from 'moment';
import CssModule from 'react-css-modules';
import DebounceFormButton from '@/components/DebounceFormButton';
import {
  getAccountOutboundDeliveryInformationByOutboundDetailId,
  getCarByShipment,
  getProjectDetail, pathAccountOutboundDeliveryByOutboundDetailId,
} from '@/services/apiService';
import UploadFile from '@/components/Upload/UploadFile';
import { disableDateAfterToday } from "@/utils/utils";
import styles from '../deliveryStatement.less';

@CssModule(styles, { allowMultiple: true })
export default class ShipmentUpdate extends Component {

  formLayout = {
    wrapperCol: { span: 18 },
    labelCol: { span: 6 },
  }

  constructor(props) {
    super(props);
    const formSchema = {
      carId: {
        label: '车牌号',
        component: 'select',
        showSearch: true,
        rules: {
          required: true,
        },
        filterOption: (input, option) => option.props.children.toLowerCase().indexOf(input.toLowerCase()) >= 0,
        options: async () => this.state.carList,
      },
      deliveryName: {
        label: '提货点',
        placeholder: '请输入提货点',
        component: 'input.text',
      },
      deliveryAddress: {
        label: '提货地址',
        placeholder: '请输入提货地址',
        component: 'input.text',
      },
      deliveryTime: {
        label: '提货时间',
        placeholder: '请选择提货时间',
        showTime: true,
        component: 'datePicker',
        disabledDate: disableDateAfterToday,
        format: {
          input: (value) => value ? moment(value) : '',
        },
      },
      goodsId: {
        label: '货品名称',
        placeholder: '请选择货品名称',
        component: 'select',
        options: async () => this.state.goodsList,
      },
      deliveryNumber: {
        label: '提货单号',
        placeholder: '请输入提货单号',
        component: 'input',
        rules: {
          required: [true, '请输入提货单号'],
          validator: ({ value }) => {
            if (!value.toString().trim()) {
              return '提货单号不能为空';
            }
          }
        },
      },
      deliveryNum: {
        label: '提货数量',
        placeholder: '请输入提货数量',
        component: 'input',
        props: {
          addonAfter: '吨',
        },
        rules: {
          required: [true, '请输入提货数量'],
          validator: ({ value }) => {
            if (!value.toString().trim()) {
              return '提货数量不能为空';
            }
          }
        },
      },
      deliveryDentryid: {
        label: '单据图片',
        value: Observer({
          watch: ['picture1', 'picture2', 'picture3'],
          action: ([picture1 = [], picture2 = [], picture3 = []]) => {
            if (picture1[0] || picture2[0] || picture3[0]) {
              const pictureGroup = [...picture1, ...picture2, ...picture3];
              return pictureGroup.join(",");
            }
            return null;
          },
        }),
      },
      picture1: {
        component: UploadFile,
        value: () => {
          const { waybillDetail } = this.state;
          const { deliveryDentryid = '' } = waybillDetail;
          return deliveryDentryid && deliveryDentryid.split(',')[0] ? [deliveryDentryid.split(',')[0]] : [];
        },
      },
      picture2: {
        component: UploadFile,
        value: () => {
          const { waybillDetail } = this.state;
          const { deliveryDentryid = '' } = waybillDetail;
          return deliveryDentryid && deliveryDentryid.split(',')[1] ? [deliveryDentryid.split(',')[1]] : [];
        },
      },
      picture3: {
        component: UploadFile,
        value: () => {
          const { waybillDetail } = this.state;
          const { deliveryDentryid = '' } = waybillDetail;
          return deliveryDentryid && deliveryDentryid.split(',')[2] ? [deliveryDentryid.split(',')[2]] : [];
        },
      },
      updateReason: {
        label: '更改原因',
        placeholder: '请输入更改原因',
        component: 'input',
        rules: {
          required: [true, '请输入更改原因'],
          validator: ({ value }) => {
            if (!value.toString().trim()) {
              return '更改原因不能为空';
            }
          }
        },
      },
    };
    this.state = {
      ready: false,
      formSchema,
      mode: FORM_MODE.Modify,
    };
  }

  async componentDidMount() {
    const { outboundDetailId, transportType, projectId } = this.props.dataSource;

    let params = {
      limit: 1000,
      offset: 0,
    };
    // "transportType":2, // 运单类型(1.自营运单，2.网络货运运单)
    // "transportType":2 网络货运: isAll: true,   carBelong:2,
    // "transportType":1 自营：isAll: false

    if (transportType === 1) {
      params = Object.assign(params, {
        isAll: false,
      });
    } else {
      params = Object.assign(params, {
        isAll: true,
        // carBelong: 2,
      });
    }

    const { items: data } = await getCarByShipment(params);
    const carItems = data || [];
    const carResult = carItems
      .map(item => ({
        key: item.carId,
        value: item.carId,
        label: `${item.carNo}`,
      }));

    const { goodsItems } = await getProjectDetail(projectId);
    const _goodsItems = goodsItems || [];
    const goodsResult = _goodsItems
      .map(item => ({
        key: item.goodsId,
        value: item.goodsId,
        label: `${item.goodsName}`,
      }));

    this.setState({ goodsList : [...goodsResult], carList : [...carResult] }, ()=>{
      getAccountOutboundDeliveryInformationByOutboundDetailId({ outboundDetailId })
        .then(waybillDetail => {
          const waybillDetailRest = Object.assign(waybillDetail, { updateReason: '厂商核对修改', });
          this.setState({ waybillDetail: waybillDetailRest, });
        })
        .then(() => {
          this.setState({
            mode: FORM_MODE.Modify,
            ready: true,
          });
        });
    });


  }


  handleCancel = (isReload) => {
    this.props.callback({
      isReload: isReload === 1 ? 1 : 2,
    });
  }

  patchData = (val) => {
    const { outboundDetailId } = this.props.dataSource;
    const { transportCorrelationId, carId, goodsId, deliveryDentryid = null, deliveryTime } = this.state.waybillDetail;

    if (val.carId === null && carId !== null) {
      notification.error({
        message: '失败',
        description: '亲,车牌号数据不能为空！',
      });
      return;
    }


    if (val.deliveryTime === null && deliveryTime !== null) {
      notification.error({
        message: '失败',
        description: '亲,提货时间数据不能为空！',
      });
      return;
    }

    if (val.goodsId === null && goodsId !== null) {
      notification.error({
        message: '失败',
        description: '亲,货品名称数据不能为空！',
      });
      return;
    }


    if ((val.deliveryDentryid === null) && deliveryDentryid !== null ) {
      notification.error({
        message: '失败',
        description: '亲,单据图片数据不能为空！',
      });
      return;
    }

    // const imgNewArr=[]
    // if (val.deliveryDentryid !== null){
    //   const imgOldArr=val.deliveryDentryid.split(',')
    //   imgOldArr.forEach(item=>{
    //     if (item!==""){
    //       imgNewArr.push(item)
    //     }
    //   })
    //   val.deliveryDentryid=imgNewArr.join(',')
    // }

    const params = {
      outboundDetailId,
      transportCorrelationId,
      carId: val.carId,
      deliveryNumber: val.deliveryNumber,
      deliveryNum: val.deliveryNum,
      deliveryDentryid: val.deliveryDentryid,
      goodsId: val.goodsId,
      updateReason: val.updateReason,
      deliveryTime: moment(val.deliveryTime).format('YYYY/MM/DD HH:mm:ss'),
    };
    pathAccountOutboundDeliveryByOutboundDetailId(params).then(() => {
      notification.success({
        message: '修改成功',
        description: '修改成功',
      });
    }).then(() => {
      this.handleCancel(1);
    });
  }

  render() {
    const { deliveryLable, visible } = this.props;
    const { mode, formSchema, isUsed, waybillDetail, ready } = this.state;
    return (
      <>
        <Modal
          centered
          destroyOnClose
          title='修改运单'
          maskClosable={false}
          visible={visible}
          bodyStyle={{ minHeight : '570px' }}
          onCancel={this.handleCancel}
          footer={null}
        >  {ready &&
        <SchemaForm
          layout="vertical"
          data={waybillDetail}
          {...this.formLayout}
          mode={mode}
          schema={formSchema}
          trigger={{ deliveryLable, isUsed }}
        >
          <Item field="carId" />
          <Item field="deliveryName" />
          <Item field="deliveryAddress" />
          <Item field="deliveryTime" />
          <Item field="goodsId" />
          <Item field="deliveryNumber" />
          <Item field="deliveryNum" />
          <Item field="deliveryDentryid" />
          <div>
            <Item field="picture1" styleName='float-left' />
            <Item field="picture2" styleName='float-left' />
            <Item field="picture3" styleName='float-left' />
            <div styleName="clear-both" />
          </div>
          <Item field="updateReason" />
          <div style={{ textAlign: 'right' }}>
            <Button className="mr-10" onClick={this.handleCancel}>取消</Button>
            <DebounceFormButton onClick={this.patchData} type="primary" label="保存" />
          </div>
        </SchemaForm>
          }
        </Modal>
      </>
    );
  }
}
