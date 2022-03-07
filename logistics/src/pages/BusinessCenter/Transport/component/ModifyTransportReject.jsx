import React, { Component } from 'react';
import { message, notification, Row } from 'antd';
import { Item, FormButton, SchemaForm, FORM_MODE, Observer } from '@gem-mine/antd-schema-form';
import DebounceFormButton from '@/components/DebounceFormButton';
import { connect } from 'dva';
import '@gem-mine/antd-schema-form/lib/fields';
import { getOssImg, isFunction } from '@/utils/utils';
import { modifyTransportReject } from '@/services/apiService';
import ImageDetail from '@/components/ImageDetail';
import UploadFile from '@/components/Upload/UploadFile';
import DeliveryList from './DeliveryList';

let _getValuesfunc;

const layout = {
  labelCol: {
    xs: { span: 24 },
    sm: { span: 7 },
    xl: { span: 5 },
  },
  wrapperCol: {
    xs: { span: 24 },
    sm: { span: 16 },
    xl: { span: 18 },
  },
};
const deliveryListLayout = {
  labelCol: {
    xs: { span: 24 },
  },
  wrapperCol: {
    xs: { span: 24 },
  },
};
const uploadPicStyle = {
  display: 'inline-block',
};

function _mapStateToProps(state) {
  return {
    transportReject: state.transports.transportReject || [],
  };
}

@connect(_mapStateToProps, {})

export default class ModifyTransportReject extends Component {

  state = {
    modifyData: [],
    rejectIndex: 0,
    ready: false,
  }

  deliverySchema = {
    goodsString: {
      label: '货品名称',
      component: 'input.text',
    },
    verifyReason: {
      label: '拒绝理由',
      component: 'input.textArea.text',
      rules: {
        max: 100,
      },
    },
    deliveryNum: {
      label: '装车重量',
      component: 'input',
      rules: {
        validator: ({ value }) => {
          const reg = /^\d+(\.\d+)?$/;
          if (+value === 0) {
            return '装车重量不能为0';
          }
          if (reg.test(value)) {
            return;
          }
          return '请输入装车重量';
        },
      },
    },
    billDentryid: {
      label: '单据图片(可选)',
      value: Observer({
        watch: ['picture1', 'picture2', 'picture3'],
        action: ([picture1 = [], picture2 = [], picture3 = []]) => {
          const { rejectIndex, deliveryPoints, receivingPoints, weighPoints } = this.state;
          const rejectArray = [...deliveryPoints, ...weighPoints, ...receivingPoints];
          if (picture1[0] || picture2[0] || picture3[0]) {
            const pictureGroup = [...picture1, ...picture2, ...picture3];
            return pictureGroup.join(',');
          }
          return rejectArray[rejectIndex].billDentryid;
        },
      }),
    },
    picture1: {
      component: UploadFile,
    },
    picture2: {
      component: UploadFile,
    },
    picture3: {
      component: UploadFile,
    },
  }

  receivingSchema = {
    billNumber: {
      label: '签收单号',
      component: 'input',
      rules: {
        required: true,
      },
    },
    verifyReason: {
      label: '拒绝理由',
      component: 'input.textArea.text',
      rules: {
        max: 100,
      },
    },
    deliveryList: {
      component: DeliveryList,
      getValues: (getValuesfunc) => {
        _getValuesfunc = getValuesfunc;
      },
    },
    picture1: {
      component: UploadFile,
    },
    picture2: {
      component: UploadFile,
    },
    picture3: {
      component: UploadFile,
    },
    billDentryid: {
      label: '单据图片(可选)',
      value: Observer({
        watch: ['picture1', 'picture2', 'picture3'],
        action: ([picture1 = [], picture2 = [], picture3 = []]) => {
          const { rejectIndex, deliveryPoints, receivingPoints, weighPoints } = this.state;
          const rejectArray = [...deliveryPoints, ...weighPoints, ...receivingPoints];
          if (picture1[0] || picture2[0] || picture3[0]) {
            const pictureGroup = [...picture1, ...picture2, ...picture3];
            return pictureGroup.join(',');
          }
          return rejectArray[rejectIndex].billDentryid;
        },
      }),
    },
  }

  weighSchema = {
    weighDentryid: {
      label: '单据图片(可选)',
      value: Observer({
        watch: ['picture1', 'picture2', 'picture3'],
        action: ([picture1 = [], picture2 = [], picture3 = []]) => {
          const { rejectIndex, deliveryPoints, receivingPoints, weighPoints } = this.state;
          const rejectArray = [...deliveryPoints, ...weighPoints, ...receivingPoints];
          if (picture1[0] || picture2[0] || picture3[0]) {
            const pictureGroup = [...picture1, ...picture2, ...picture3];
            return pictureGroup.join(',');
          }
          return rejectArray[rejectIndex].weighDentryid;
        },
      }),
    },
    weighNumber : {
      label: '过磅单号',
      component: 'input',
      rules: {
        required: true,
      },
    },
    weighVerifyReason: {
      label: '拒绝理由',
      component: 'input.textArea.text',
      rules: {
        max: 100,
      },
    },
    picture1: {
      component: UploadFile,
    },
    picture2: {
      component: UploadFile,
    },
    picture3: {
      component: UploadFile,
    },
  }

  handleNextBtnClick = (entity, form) => {
    const { rejectIndex, modifyData } = this.state;
    const nextRejectIndex = rejectIndex + 1;

    const { getFieldsValue, validateFields } = form;
    let check = false;
    validateFields(error => {
      if (error) {
        check = true;
      }
    });
    if (check) return;
    const { pointType, processPointId, transportCorrelationId, goodsName, categoryName } = entity;
    const value = getFieldsValue();

    modifyData[rejectIndex] = {
      ...value,
      deliveryNum: +value.deliveryNum,
      pointType,
      processPointId,
      transportCorrelationId,
      goodsName,
      categoryName,
    };
    this.setState({
      rejectIndex: nextRejectIndex,
      modifyData,
    });
  }

  handleBeforeBtnClick = (entity, form) => {
    const { modifyData, rejectIndex, receivingLength } = this.state;
    const { getFieldsValue, validateFields } = form;
    let check = false;
    validateFields(error => {
      if (error) {
        check = true;
      }
    });
    if (check) return;
    const { pointType, processPointId, transportCorrelationId, goodsName, categoryName, deliveryList: _deliveryList } = entity;
    const value = getFieldsValue();

    let deliveryList;
    // 如果有签收单并且在签收单页面，缓存deliveryList填写的信息
    if (isFunction(_getValuesfunc) && rejectIndex === modifyData.length - 1 && receivingLength) {
      const deliveryListForm = _getValuesfunc();
      deliveryList = deliveryListForm.map((item, key)=>({
        ..._deliveryList[key], ...item
      }));
    }

    modifyData[rejectIndex] = {
      ...value,
      deliveryNum: +value.deliveryNum,
      pointType,
      processPointId,
      transportCorrelationId,
      goodsName,
      categoryName,
      deliveryList
    };

    const lastRejectIndex = rejectIndex - 1;
    if (lastRejectIndex === -1) return;

    this.setState({
      rejectIndex: lastRejectIndex,
      modifyData
    });
  }

  handleSaveBtnClick = (formData, entity) => {
    const { modifyData, rejectIndex, weighLength, receivingLength } = this.state;
    if (rejectIndex !== modifyData.length - 1) return message.error('回单修改还未完成');
    // 合并最后一个表单
    const _modifyData = JSON.parse(JSON.stringify(modifyData));
    _modifyData[rejectIndex] = { ..._modifyData[rejectIndex], ...formData };

    const params = [];
    const { pointType, processPointId } = entity;
    let deliveryList;
    if (isFunction(_getValuesfunc)) {
      deliveryList = _getValuesfunc();
    }

    /*
    * 如果有提货有过磅，截取最后两个对象，合并成一个对象添加进参数列表，然后遍历提货单信息
    * 如果有提货或者过磅中的一个，截取一个对象，添加进参数列表，然后遍历提货单信息
    * 如果两个都没有，直接遍历提货单信息
    * */
    if (receivingLength && weighLength){
      const spliceArr = _modifyData.splice(-2, 2);

      const receivingForm = {
        deliveryList,
        pointType,
        processPointId,
        billDentryid : spliceArr[1].billDentryid,
        billNumber: spliceArr[1].billNumber,
        weighDentryid: spliceArr[0].weighDentryid,
        weighNumber : spliceArr[0].weighNumber
      };
      params.push(receivingForm);
    } else if (receivingLength){
      const spliceArr = _modifyData.splice(-1);

      const receivingForm = {
        deliveryList,
        pointType,
        processPointId,
        billDentryid : spliceArr[0].billDentryid,
        billNumber: spliceArr[0].billNumber,
      };

      params.push(receivingForm);
    } else if (weighLength){
      const spliceArr = _modifyData.splice(-1);

      const receivingForm = {
        deliveryList,
        pointType,
        processPointId,
        weighDentryid : spliceArr[0].weighDentryid,
        weighNumber: spliceArr[0].weighNumber,
      };
      params.push(receivingForm);
    }

    _modifyData.forEach((item)=>{
      const deliveryForm = {
        processPointId : item.processPointId,
        transportCorrelationId : item.transportCorrelationId,
        billDentryid : item.billDentryid,
        pointType : 2,
        deliveryNum : item.deliveryNum
      };
      params.push(deliveryForm);
    });

    modifyTransportReject({ transportId: this.props.transportId, items: params })
      .then(() => {
        notification.success({
          message: `修改成功`,
          description: `运单回单修改成功`,
        });
        this.props.closeModal();
      });
  }

  constructor(props) {
    super(props);
    _getValuesfunc = undefined;
  }

  componentDidMount() {
    const { transportReject } = this.props;
    const deliveryPoints = transportReject.filter(item => item.pointType === 2);
    const weighPoints = transportReject.filter(item => item.pointType === 4 && (item.additionalTypeAll && item.additionalTypeAll.indexOf('2') !== -1));
    const receivingPoints = transportReject.filter(item => item.pointType === 4 && (item.additionalTypeAll && item.additionalTypeAll.indexOf('1') !== -1));
    const data = [...deliveryPoints, ...weighPoints, ...receivingPoints];
    this.setState({
      ready: true,
      modifyData: data,
      deliveryPoints,
      weighPoints,
      receivingPoints,
      weighLength : weighPoints.length,
      receivingLength : receivingPoints.length
    });
  }

  renderForm = () => {
    const { modifyData, rejectIndex, deliveryPoints, weighPoints, receivingPoints, } = this.state;

    const data = [...deliveryPoints, ...weighPoints, ...receivingPoints];
    const imageData =  data[rejectIndex] && data[rejectIndex].billDentryid.split(',').map(item => getOssImg(item));

    const entity = modifyData.length === 0
      ? undefined
      : {
        picture1: [],
        picture2: [],
        picture3: [],
        ...modifyData[rejectIndex],
        goodsString: `${modifyData[rejectIndex].categoryName}-${modifyData[rejectIndex].goodsName}`,
      };

    const deliveryForm =
      <SchemaForm mode={FORM_MODE.MODIFY} data={entity} schema={this.deliverySchema}>
        <div style={{ fontSize: '16px' }}>{`提货单${rejectIndex + 1}/${deliveryPoints.length}`}</div>
        <ImageDetail imageData={imageData} />
        <Item {...layout} field='goodsString' />
        <Item {...layout} field='verifyReason' />
        <Item {...layout} field='deliveryNum' />
        <Item style={uploadPicStyle} labelCol={{ xs: { span: 24 } }} field='billDentryid' />
        <Item style={uploadPicStyle} field='picture1' />
        <Item style={uploadPicStyle} field='picture2' />
        <Item style={uploadPicStyle} field='picture3' />
        <Row justify='end' type='flex'>
          {
            rejectIndex !== 0 &&
            <FormButton
              label='上一步'
              className='mr-10'
              onClick={(formData, form) => {
                this.handleBeforeBtnClick(entity, form);
              }}
            />
          }
          {
            rejectIndex !== data.length - 1 ?
              <FormButton
                label='下一步'
                className='mr-10'
                type='primary'
                onClick={(formData, form) => {
                  this.handleNextBtnClick(entity, form);
                }}
              /> :
              <DebounceFormButton
                type='primary'
                label='保存'
                onClick={(formData) => {
                  this.handleSaveBtnClick(formData, entity);
                }}
              />
          }

        </Row>
      </SchemaForm>;

    const weighForm =
      <SchemaForm mode={FORM_MODE.MODIFY} data={entity} schema={this.weighSchema}>
        <div style={{ fontSize: '16px' }}>过磅单</div>
        <ImageDetail imageData={data[rejectIndex] && data[rejectIndex].weighDentryid && data[rejectIndex].weighDentryid.split(',').map(item => getOssImg(item))} />
        <Item {...layout} field='weighNumber' />
        <Item {...layout} field='weighVerifyReason' />
        <Item style={uploadPicStyle} labelCol={{ xs: { span: 24 } }} field='weighDentryid' />
        <Item style={uploadPicStyle} field='picture1' />
        <Item style={uploadPicStyle} field='picture2' />
        <Item style={uploadPicStyle} field='picture3' />
        <Row justify='end' type='flex'>
          {
            rejectIndex !== 0 &&
            <FormButton
              label='上一步'
              className='mr-10'
              onClick={(formData, form) => {
                this.handleBeforeBtnClick(entity, form);
              }}
            />
          }
          {
            rejectIndex !== data.length - 1 ?
              <FormButton
                label='下一步'
                type='primary'
                className='mr-10'
                onClick={(formData, form) => {
                  this.handleNextBtnClick(entity, form);
                }}
              /> :
              <DebounceFormButton
                type='primary'
                label='保存'
                onClick={(formData) => {
                  this.handleSaveBtnClick(formData, entity);
                }}
              />
          }

        </Row>
      </SchemaForm>;

    const receivingForm =
      <SchemaForm mode={FORM_MODE.MODIFY} data={entity} schema={this.receivingSchema}>
        <div style={{ fontSize: '16px' }}>签收单</div>
        <ImageDetail imageData={imageData} />
        <Item {...layout} field='billNumber' />
        <Item {...layout} field='verifyReason' />
        <div style={{ textAlign: 'center' }}>
          <Item {...deliveryListLayout} field='deliveryList' />
        </div>
        <Item style={uploadPicStyle} labelCol={{ xs: { span: 24 } }} field='billDentryid' />
        <Item style={uploadPicStyle} field='picture1' />
        <Item style={uploadPicStyle} field='picture2' />
        <Item style={uploadPicStyle} field='picture3' />
        <Row justify='end' type='flex'>
          {
            rejectIndex !== 0 &&
            <FormButton
              label='上一步'
              className='mr-10'
              onClick={(formData, form) => {
                this.handleBeforeBtnClick(entity, form);
              }}
            />
          }
          {
            rejectIndex !== data.length - 1 ?
              <FormButton
                label='下一步'
                type='primary'
                className='mr-10'
                onClick={(formData, form) => {
                  this.handleNextBtnClick(entity, form);
                }}
              /> :
              <DebounceFormButton
                type='primary'
                label='保存'
                onClick={(formData) => {
                  this.handleSaveBtnClick(formData, entity);
                }}
              />
          }

        </Row>
      </SchemaForm>;

    let content;
    if (rejectIndex < deliveryPoints.length) {
      content = deliveryForm;
    }
    // 如果数组总长比提货单多两个，则为一过磅，一签收，如果多一个，则根据过磅数组和签收数组的有无来判断
    if (data.length === deliveryPoints.length + 2){
      if (rejectIndex === data.length - 2){
        content = weighForm;
      }
      if (rejectIndex === data.length - 1){
        content =receivingForm;
      }
    }

    if (data.length === deliveryPoints.length + 1 && rejectIndex === data.length - 1){
      if (weighPoints.length){
        content = weighForm;
      }
      if (receivingPoints.length){
        content = receivingForm;
      }
    }

    return content;
  }

  render() {
    const { ready } = this.state;

    return (ready &&
      <>
        {this.renderForm()}
      </>
    );
  }
}
