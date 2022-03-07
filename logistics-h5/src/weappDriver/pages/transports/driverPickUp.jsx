import React, { Component } from 'react';
import { Card, Icon, Toast, Modal } from 'antd-mobile';
import { connect } from 'dva';
import moment from 'moment';
import { SchemaForm, Item, FormButton, FORM_MODE, Observer } from '@gem-mine/mobile-schema-form'
import DebounceFormButton from '@/components/DebounceFormButton';
import '@gem-mine/mobile-schema-form/src/fields';
import router from 'umi/router';
import driverPickUpHeader from '@/assets/driverPickUpHeader.png';
import { useOcrGeneral, postTransportProcess, getJsSDKConfig, modifyTransportReject } from '@/services/apiService';
import { getOssImg, businessNameToTempName, browser } from '@/utils/utils';
import formError from '@/assets/formError.png';
import pageBack from '@/assets/pageBack.png';
import save from '@/assets/save.png';
import UpLoadImage from '@/weappDriver/components/uploadImg/addComponent/ButtonUpload';
import transporModel from '@/models/transports';
import FieldInput from './component/FieldInput';
import TipsBox from './component/TipsBox';
import style from './driverPickup.less';

const { actions: { detailTransports } } = transporModel;

let needOcr = true;

const buttonText = (
  <div style={{ fontSize: '17px' }}>
    <img src={save} alt='' />
    <div style={{
      color: 'white',
      marginLeft: '11px',
      display: 'inline-block',
      fontWeight: '600px',
      lineHeight: '59px',
    }}
    >保存
    </div>
  </div>
);

const errorWord = (
  <>
    <div>您还有未填写的项目</div>
    <div>请返回补充完成后再次保存</div>
  </>
);

@connect(null, { detailTransports })
class driverPickup extends Component {

  rejectInfo = {};

  autoBillNumber = false;

  billPictureType = '';

  state = {
    errorVisible: false,
    ready: false,
    ocrData: {},
    schema: {},
  };

  errorButton = [
    {
      text: '确定',
      onPress: () => this.closeErrorModal(),
      style: { color: 'rgba(251,164,79,1)', fontSize: '18px', lineHeight: '50px' },
    },
  ];

  constructor (props) {
    super(props);
    const { location: { query: { repick } } } = this.props;
    needOcr = !repick;
  }

  componentDidMount () {
    const {
      location: { query: { transportId, transpotCorrelationId: transportCorrelationId }, state = {} },
      detailTransports,
    } = this.props;
    const { rejectInfo } = state;
    if (rejectInfo) this.rejectInfo = rejectInfo;
    if (browser.versions.android) {
      getJsSDKConfig({ url: encodeURIComponent(window.location.href.split('#')[0]) })
        .then(({ timestamp, nonceStr, signature }) => {
          wx.config({
            debug: false, // 开启调试模式,调用的所有api的返回值会在客户端alert出来，若要查看传入的参数，可以在pc端打开，参数信息会通过log打出，仅在pc端时才会打印。
            appId: 'wx5b020341411ebf08', // 必填，公众号的唯一标识
            timestamp, // 必填，生成签名的时间戳
            nonceStr, // 必填，生成签名的随机串
            signature, // 必填，签名
            jsApiList: ['getLocation'], // 必填，需要使用的JS接口列表
          });
        });
    }

    detailTransports({ transportId })
      .then(data => {
        const { billNumberType, billPictureType } = data.logisticsBusinessTypeEntity || {};
        const billNumberTypeArray = (billNumberType || '').split(',');
        this.autoBillNumber = billNumberTypeArray.some(item => `${item}` === '1');
        this.billNumber = this.autoBillNumber ? this.randomBillNumber() : '';
        this.billPictureType = billPictureType || '';
        const schema = {
          billDentryid: {
            component: this.billPictureType.indexOf('1') !== -1 ? 'hide' : UpLoadImage,
            imageStyle: {
              width: '256px',
              height: 'auto',
              margin: '10px 0',
            },
            rules: {
              required: [this.billPictureType.indexOf('1') === -1, '请上传提货单'],
            },
          },
          billNumber: {
            label: '交货单号',
            rules: {
              required: [true, '请输入交货单号'],
            },
            placeholder: '请输入',
            component: FieldInput,
            // fieldInputType:'money',
            observer: Observer({
              watch: 'billDentryid',
              action: async (billDentryid, { formData, form }) => {
                const { location: { query: { transportId } } } = this.props;
                let number = formData.billNumber;
                if (billDentryid?.[0] && needOcr && !this.autoBillNumber) {
                  Toast.loading('图片单号识别中', 100);
                  let _ocrData = {};
                  try {
                    _ocrData = await useOcrGeneral({
                      transportId,
                      image: getOssImg(businessNameToTempName(billDentryid[0])),
                      ocrType: 0,
                    });
                    needOcr = false;
                    if (`${_ocrData.baiDuAiImage.conclusionType}` !== '1' && `${_ocrData.baiDuAiImage.conclusionType}` !== '4') {
                      Toast.fail('您上传的提货单清晰度过低请重新拍照上传', 2);
                      needOcr = true;
                      form.setFields({ billDentryid: { value: [] } });
                      return { value: number };
                    }
                    this.setState({
                      ocrData: _ocrData,
                    });
                  } catch (error) {
                    console.log(error);
                  }
                  number = _ocrData.billNo || formData.billNumber;
                  Toast.hide();
                }
                return { value: this.autoBillNumber ? this.billNumber : number, editable: !this.autoBillNumber };
              },
            }),
            prefixCls: 'billNumber',
          },
        };
        const deliveryNum = {
          label: '净重',
          rules: {
            required: [true, '请输入'],
            pattern: /^\d+(\.\d+)?$/,
          },
          placeholder: '请输入',
          component: FieldInput,
          // fieldInputType:'money',
          extra: (data.deliveryItems || []).find(item => +transportCorrelationId === item.transportCorrelationId)?.goodsUnitCN || '吨',
          prefixCls: 'billNumber',
          value: Observer({
            watch: '*ocrData',
            action: async (ocrData, { formData }) => {
              let { deliveryNum } = formData;
              if (ocrData.receivingWeight) {
                deliveryNum = ocrData.receivingWeight;
              }
              return deliveryNum;
            },
          }),
        };
        this.setState({
          ready: true,
          schema: { ...schema, deliveryNum },
        });
      });
  }

  randomBillNumber = () => {
    const head = 'TH';
    const timeString = moment().format('MMDDHHmmss');
    const randomString = Math.random().toString().substr(2, 4);
    return `${head}${timeString}${randomString}`;
  };

  closeErrorModal = () => {
    this.setState({
      errorVisible: false,
    });
  };

  formatRepick = (data) => {
    modifyTransportReject(data)
      .then(() => {
        Toast.success('提交成功', 1);
        setTimeout(() => {
          router.goBack();
        }, 1000);
      });
  };

  formatData = (value) => {
    const {
      location: {
        query: { transpotCorrelationId: transportCorrelationId, transportId, repick },
        state = {},
      },
    } = this.props;
    const { rejectInfo = {} } = state;
    if (repick) {
      const repickData = {
        transportId,
        items: [{
          ...rejectInfo,
          transportCorrelationId,
          pointType: 2, ...value,
          billDentryid: (value.billDentryid).join(','),
        }],
      };
      return this.formatRepick(repickData);
    }
    // 如果提货单是自动生成的，图片传空,否则传图片
    const submitData = {
      ...value,
      transportCorrelationId,
      transportId,
      billDentryid: '',
      pointType: 2,
    };
    if (this.billPictureType.indexOf('1') === -1) {
      Object.defineProperty(submitData, 'billDentryid', { value: (value.billDentryid).join(',') });
    }
    this.getLocation(submitData);
  };

  getLocation = submitData => {
    Toast.loading('正在获取当前定位', 100);
    wx.getLocation({
      type: 'gcj02',
      isHighAccuracy: true,
      success: res => {
        const { longitude, latitude } = res;
        postTransportProcess({ ...submitData, longitude, latitude })
          .then(() => {
            Toast.success('提交成功', 1);
            setTimeout(() => {
              router.goBack();
            }, 1000);
          });
      },
      fail: res => {
        // 获取不到定位就将经纬度先设为0.0传给后端
        postTransportProcess({ ...submitData, longitude: 0.0, latitude: 0.0 })
          .then(() => {
            Toast.success('提交成功', 1);
            setTimeout(() => {
              router.goBack();
            }, 1000);
          });
        // Toast.fail('获取定位信息失败，请开启定位', 1);
      },
    });
  };

  getLocationError = () => {
    Toast.fail('获取当前定位失败，请检查网络与定位服务', 2);
  };

  formOnError = () => {
    this.setState({
      errorVisible: true,
    });
  };

  goback = () => {
    router.goBack();
  };

  render () {
    const { errorVisible, ready, schema, ocrData } = this.state;
    return (
      <>
        <div style={{ marginTop: '5px' }} onClick={this.goback}>
          <img src={pageBack} style={{ marginLeft: '18px' }} alt='' />
        </div>
        {ready &&
        <SchemaForm schema={schema} data={this.rejectInfo} mode={FORM_MODE.ADD} trigger={{ ocrData }}>
          <Card style={{ overflow: 'hidden', paddingBottom: '25px', width: '315px', margin: '9px auto 0 auto' }}>
            <Card.Body prefixCls='driverPickCard'>
              <div className={style.leftTop}>
                <Icon
                  type='check'
                  style={{
                    position: 'absolute',
                    width: '25px',
                    height: '18px',
                    color: 'white',
                    left: '-20px',
                    top: '-18px',
                  }}
                  color='white'
                />
              </div>
              <div style={{ position: 'relative', left: '33px', width: '256px', top: '26px', display: 'inline-block' }}>
                <img src={driverPickUpHeader} alt='' />
                <div style={{ marginLeft: '39px', display: 'inline-block', verticalAlign: 'top' }}>
                  <div style={{
                    fontSize: '14px',
                    lineHeight: '20px',
                    color: 'rgba(52,67,86,0.5)',
                    fontFamily: 'PingFangSC-Regular,PingFang SC',
                    fontWeight: 600,
                  }}
                  >提货
                  </div>
                  <div style={{
                    marginTop: '4px',
                    fontSize: '23px',
                    lineHeight: '27px',
                    color: 'rgba(14,27,66,1)',
                    fontFamily: 'PingFangSC-Regular,PingFang SC',
                    fontWeight: 600,
                  }}
                  >请上传提货单
                  </div>
                </div>
                <div style={{
                  margin: '15px auto 20px auto ',
                  fontFamily: 'PingFangSC-Regular,PingFang SC',
                  color: 'rgba(52,67,86,0.7)',
                  fontSize: '19px',
                  width: '256px',
                  height: '56px',
                  lineHeight: '28px',
                  fontWeight: 600,
                }}
                >
                  {this.billPictureType.indexOf('1') === -1 ? '请拍照或上传图片，可识别货物相关信息' : '请根据提示信息完善提货所需信息'}
                </div>
                <Item field='billDentryid' />
                <Item field='billNumber' />
                {this.billNumber &&
                <div style={{ fontSize: '14px', color: 'rgb(245,64,64)' }}>
                  *该单号为自动生成，不可修改
                </div>
                }
                <Item field='deliveryNum' />
              </div>
            </Card.Body>
          </Card>

          <DebounceFormButton
            label={buttonText}
            onError={this.formOnError}
            debounce
            onClick={this.formatData}
            style={{
              width: '315px',
              position: 'relative',
              height: '59px',
              background: 'rgba(251,164,79,1)',
              borderRadius: '8px',
              margin: '23px auto 23px auto',
            }}
          />
        </SchemaForm>
        }
        <Modal
          popup
          // maskClosable={false}
          onClose={this.closeErrorModal}
          footer={this.errorButton}
          className='modalBox'
          style={{ bottom: '34px', margin: '0 10px', width: 'calc(100% - 20px)' }}
          visible={errorVisible}
          animationType='slide-up'
        >
          <TipsBox icon={formError} word={errorWord} />
        </Modal>
      </>
      // <UpLoadImage mode="add" isOcr={false} ocrParams={ocrParams} ocrCallBack={this.ocrCallBack} />
    );
  }
}

export default driverPickup;
