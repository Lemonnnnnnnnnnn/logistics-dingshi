import React, { Component } from 'react';
import { Row, Button, Tag, Icon, message, Input, Col } from 'antd';
import router from 'umi/router';
import { SchemaForm, Item, FormButton } from '@gem-mine/antd-schema-form';
import { connect } from 'dva';
import CSSModules from 'react-css-modules';
import { JSEncrypt } from 'jsencrypt';
import GetSmsCode from '../../../registered/get-sms-code';
import { digitUppercase, formatMoney, lodashDebounce } from '../../../../utils/utils';
import model from '../../../../models/orders';
import { getUserInfo } from '../../../../services/user';
import { getPublicKey, payOrder, getShipmentVirtualAccount, getTaxationByOrderIdList, getTransports, getTaxationByOrderDetailIdList, getTransportsPost, saveChoiceTransport } from '../../../../services/apiService';
import userModel from '../../../../models/userInvoice';
import OrderInfoTable from './OrderInfoTable';
import PayInfoTable from './pay-info-table';
import SelectOrderModal from './select-order-modal';
import styles from './pay-form.less';

const { actions: { detailUserInvoice } } = userModel;

const { actions: { getOrders } } = model;

function mapStateToProps (state) {
  return {
    payOrders: state.orders.payOrders,
    orders: state.orders.items,
    info: state.userInvoice.entity
  };
}

@connect(mapStateToProps, { getOrders, detailUserInvoice })
@CSSModules(styles, { allowMultiple: true })
class PayForm extends Component {
  formSchema = {
    phone: {
      label: '授权手机号',
      component: 'input',
      disabled: true
    },
    smsCode: {
      component: GetSmsCode,
      needCheckCode: false,
      smsType: 'PAY_ORDER',
      rules: {
        required: [true, '请输入短信验证码']
      },
      placeholder: '请输入短信验证码'
    },
  }

  constructor (props){
    super(props);
    this.payOrderDebounce = lodashDebounce(this._payOrder, 1000);
    this.state = {
      step: 0,
      value: 0, // 输入框的金额
      price: Number(props.totalPrice - props.payedPrice).toFixed(2), // 本次支付的金额
      transports: [], // 用于记录部分支付的运单
      orderTransportListResps : [],
      type: false,  // 是否允许输入本次支付金额 true为禁用
      nowMoney: this.props.virtualAccountBalance,
      errorTips: '', // 验证码输入错误！还剩1次机会，输错3次将被锁定30分钟
      disabled: false,
      selectOrderVisible: false,
    };
  }

  _payOrder = (params) => {
    this.setState({
      disabled: true
    });
    getShipmentVirtualAccount({ virtualAccountType: 1 }).then(moneyInfo => {
      this.props.changemoney(moneyInfo.virtualAccountBalance || 0);
      if (!moneyInfo.virtualAccountBalance) {
        this.setState({
          disabled: false
        });
        return message.error('余额不足,请先充值！');
      }
      if (Number(moneyInfo.virtualAccountBalance).toFixed(2) < Number(this.state.price).toFixed(2) ) {
        this.setState({
          disabled: false
        });
        return message.error('余额不足,请先充值！');
      }
      getPublicKey().then(data => {
        const RSA = new JSEncrypt();
        RSA.setPublicKey(data.publicKeyString);
        const { orderList } = this.props;
        const orderIdList = orderList.map(item => RSA.encrypt(item.orderId.toString()));
        const orderDetailIdList = this.state.transports.map( item=> {
          const data = orderList[0].orderDetailItems.find(k => k.transportId === item);
          return RSA.encrypt(data.orderDetailId.toString());
        });
        const newParams = {
          ...params,
          partlyPay: orderList.length === 1,
          orderIdList,
          key: data.key,
          payChannel: 1,
          orderDetailIdList,
        };
        payOrder(newParams)
          .then(() => {
            const { nowMoney, price } = this.state;
            this.setState({
              step: 1,
              nowMoney: Number(nowMoney - price).toFixed(2),
              disabled: false
            }, () => {
              this.props.changemoney(this.state.nowMoney);
              this.props.refresh();
            });
          })
          .catch((error) => {
            this.setState({
              errorTips: error.tips,
              disabled: false
            });
          });
      });
    });
  }

  payOrder = (params) => {
    this.payOrderDebounce(params);
  }

  componentDidMount () {
    const { payOrders, totalPrice, orderList, payedPrice } = this.props;
    const idList = orderList.map(item => item.orderId);
    this.payFreight = totalPrice;
    getTaxationByOrderIdList({ idList : idList.join(',') }).then((dataList)=>{
      let totalTaxes = 0;
      if (dataList.length){
        dataList.forEach(item=>{
          totalTaxes+= Number(item.totalTaxes);
        });
      }
      this.setState({ totalTaxes });
    });

    const params = {
      orderIdList: payOrders,
      offset:0,
      limit: 1000
    };
    getOrders(params);
    this.props.detailUserInvoice()
      .then(data => {
        this.setState({
          formData: {
            phone: data.paymentAuthorizationPhone
          }
        });
      });

    // this.setState({ value: totalPrice });
    getTransports({
      // payFreight: Number(totalPrice - payedPrice)._toFixed(2),
      orderIdList: idList,
      limit: 10000,
      offset: 0,
      isChoicePreTransport : orderList.length === 1
    }).then(res => {
      const sum = res.orderTransportListResps.reduce((r, n) => r+=n.receivables, 0);
      this.setState({
        // value: Number(totalPrice - payedPrice)._toFixed(2),
        value : sum._toFixed(2),
        price: sum._toFixed(2),
        transports: orderList.length === 1 ? res.orderTransportListResps.map(item => item.transportId) : [],
        orderTransportListResps : res.orderTransportListResps
      });
    });

    // if (orderList.length === 1 && !orderList[0].orderInternalStatus ) {
    //   // this.setState({ value: totalPrice });
    //   getTransports({
    //     // payFreight: Number(totalPrice - payedPrice)._toFixed(2),
    //     orderId: idList,
    //     limit: 10000,
    //     offset: 0,
    //     isChoicePreTransport:true
    //   }).then(res => {
    //     const sum = res.orderTransportListResps.reduce((r, n) => r+=n.receivables, 0);
    //     this.setState({
    //       // value: Number(totalPrice - payedPrice)._toFixed(2),
    //       value : sum._toFixed(2),
    //       price: sum._toFixed(2),
    //       transports: res.orderTransportListResps.map(item => item.transportId),
    //       orderTransportListResps : res.orderTransportListResps
    //     });
    //   });
    // }
  }

  setTransports = (transports) => {
    const { orderList } = this.props;
    const idList = orderList.map(item=>item.orderId);
    getTransportsPost({
      transportIdList: transports.length ? transports : undefined,
      orderIdList: idList,
      limit: 10000,
      offset: 0,
    }).then(res => {
      const sum = res.orderTransportListResps.reduce((r, n) => r+=n.receivables, 0);
      const ids = res.orderTransportListResps.map(item => item.orderDetailId);

      saveChoiceTransport({ transportIdList : transports, orderId: idList.join(',') });

      getTaxationByOrderDetailIdList({ idList: ids }).then((response) => {
        let totalTaxes = 0;
        if (response.length){
          response.forEach(item=>{
            totalTaxes+= Number(item.totalTaxes);
          });
        }
        this.setState({ totalTaxes });
      });
      this.setState({
        value: Number(sum)._toFixed(2),
        price: sum,
        transports: res.orderTransportListResps.map(item => item.transportId),
        orderTransportListResps : res.orderTransportListResps
      });
    });
    this.setState({
      transports,
      type: true,
    });
  }

  onChangeValue = (e) => {
    this.setState({ value: e.target.value.replace(/,/g, '') });
  }

  toFunds = () => {
    router.push('/funds-management/funds');
  }

  onBlur = () => {
    const idList = this.props.orderList.map(item => item.orderId);

    getTransports({
      payFreight: this.state.value,
      orderIdList: idList,
      limit: 10000,
      offset: 0,
    }).then(res => {
      const sum = res.orderTransportListResps.reduce((r, n) => r += n.receivables, 0);
      const ids = res.orderTransportListResps.map(item => item.orderDetailId);
      getTaxationByOrderDetailIdList({ idList: ids }).then((response) => {
        let totalTaxes = 0;
        if (response.length){
          response.forEach(item=>{
            totalTaxes+= Number(item.totalTaxes);
          });
        }
        this.setState({ totalTaxes });
      });
      this.setState({
        price: sum,
        transports: res.orderTransportListResps.map(item => item.transportId),
        orderTransportListResps : res.orderTransportListResps
      });
    });
  }

  removeSelected = () =>{
    this.setState({
      type : false,
      value : 0,
      orderTransportListResps : [],
      transports : [],
    }, ()=>{
      this.onBlur();
    });
  }

  renderZeroStep = () => {
    const { totalPrice, totalFreight, totalServiceCharge, totalDamageCompensation, totalTransportsNum, count, orderList, payedPrice } = this.props;

    const { nowMoney, errorTips, disabled, formData, totalTaxes, value, transports, orderTransportListResps, price, type } = this.state;

    const str = transports.length ? (
      <p styleName="red">
        <Icon type="exclamation-circle" style={{ marginRight: '5px' }} />
        支付{formatMoney(Number(price)._toFixed(2))}元，手动选择分配到{transports.length}张运单
        <span
          style={{ color: '#005EB5', cursor: 'pointer', marginLeft: '10px' }}
          onClick={() =>  this.handleVisible(true)}
        >
          修改选择需支付的运单
        </span>
      </p>
    ) : (
      <p styleName="red">
        <Icon type="exclamation-circle" style={{ marginRight: '5px' }} />
        支付{formatMoney(Number(price)._toFixed(2))}元，能够分配到前面{transports.length}张运单
        <span
          style={{ color: '#005EB5', cursor: 'pointer', marginLeft: '10px' }}
          onClick={() =>  this.handleVisible(true)}
        >
          手动选择需支付的运单
        </span>
      </p>
    );
    return (
      <div styleName='paid_form'>
        <Tag color="blue" styleName='tag_tips'><Icon styleName='info_icon_color' type='info-circle' theme='filled' />您共选择了{totalTransportsNum}个运单。</Tag>
        <Row styleName='price'>
          <OrderInfoTable orderList={orderList} />
        </Row>
        <Row styleName='price'>
          <Col span={8}>
            <span styleName="label_span">运输费用：</span><span>￥{formatMoney(Number(totalFreight)._toFixed(2))}</span>
          </Col>
          <Col span={8}>
            <span styleName="label_span">货损赔付：</span><span>￥{formatMoney(Number(totalDamageCompensation)._toFixed(2))}</span>
          </Col>
          <Col span={8}>
            <span styleName='label_span'>服务费：</span><span>￥{formatMoney(Number(totalServiceCharge)._toFixed(2))}</span>
          </Col>
        </Row>
        <Row styleName='price'>
          <span styleName="label_span">总计：</span><span styleName='format_price'>￥{formatMoney(Number(totalPrice)._toFixed(2))}</span><span styleName='upperMoney'>（{digitUppercase(Number(totalPrice)._toFixed(2))}）</span>
        </Row>
        <Row styleName='price'>
          <span styleName="label_span">已付：</span><span styleName='format_price'>￥{formatMoney(Number(payedPrice)._toFixed(2))}</span><span styleName='upperMoney'>（{digitUppercase(Number(payedPrice)._toFixed(2))}）</span>
        </Row>
        <Row styleName='price'>
          <div style={{ color: '#1E62BD' }}>
            <span styleName="label_span" style={{ color: '#000000a6' }}>应付：</span>
            <span>￥{formatMoney(Number(totalPrice - payedPrice)._toFixed(2))}</span>
            <span styleName='upperMoney'>（{digitUppercase(Number(totalPrice - payedPrice)._toFixed(2))}）</span>

          </div>
        </Row>
        {
          count === 1 && !orderList[0].orderInternalStatus ? (
            <Row styleName='price'>
              <span styleName="label_span has_input">
                <span>本次支付：</span>
                <Input value={value} onChange={this.onChangeValue} onBlur={this.onBlur} disabled={type} />
                <span styleName='upperMoney'>（{digitUppercase(Number(value)._toFixed(2))}）</span>
                {totalTaxes ? <span>,其中代扣税费：{totalTaxes._toFixed(2)}元</span> : null}
                <span style={{ marginLeft: '20px', color: '#1e62bd', cursor: 'pointer' }} onClick={this.removeSelected}>清除所选</span>
              </span>
              { // 如果可以支付所有运单就不展示
                // value.toString() === Number(price)._toFixed(2) && Number(totalPrice - payedPrice)._toFixed(2) === Number(price)._toFixed(2) ? null : str
                Number(value) >= Number(totalPrice - payedPrice) ? null : str
              }
              <p styleName='tip_info'>（提示：本次可根据资金情况支付部分金额，剩余金额可延后支付！）</p>
            </Row>
          ) : (
            <Row styleName='price'>
              <span styleName="label_span">本次支付：</span><span styleName='format_price'>￥{formatMoney(Number(totalPrice - payedPrice)._toFixed(2))}</span><span styleName='upperMoney'>（{digitUppercase(Number(totalPrice - payedPrice)._toFixed(2))}）</span>
              {totalTaxes ? <span>,其中代扣税费：{totalTaxes._toFixed(2)}元</span> : null}
            </Row>
          )
        }
        <Row styleName='price'>
          <PayInfoTable orderList={orderList} orderTransportListResps={orderTransportListResps} />
        </Row>
        <div styleName='line' />
        <div styleName='line' />
        {
          Number(nowMoney).toFixed(2) < Number(price)._toFixed(2)?
            <div styleName="pay_box">
              <h4 styleName="pay_method">支付方式</h4>
              <span>使用余额（余额￥{formatMoney(Number(nowMoney)._toFixed(2))}）</span>
              <span styleName="red">你的余额不足，请先充值！<a onClick={this.toFunds}>点击此处充值</a></span>
            </div>
            :
            null
        }
        <SchemaForm schema={this.formSchema} className='payment_create_order_phoneCode_form' data={formData}>
          <div styleName="margin_bot">
            <span styleName="messages">请输入短信验证码</span><Item field='phone' />
            <div styleName="smsCode">
              <Item field="smsCode" />
            </div>
          </div>
          <p styleName='red mr0'>{errorTips}</p>
          { count === 1 && !orderList[0].orderInternalStatus && parseFloat(value.toString()) !== parseFloat(Number(price)._toFixed(2)) && Number(nowMoney).toFixed(2) > Number(value)._toFixed(2) &&
          <p style={{ color: 'red', textAlign: 'center' }}>请修改部分支付金额，最好与提示金额一致！</p>
          }
          {
            count === 1 && !orderList[0].orderInternalStatus ?
              (
                <div styleName="button_box">
                  <FormButton
                    size='large'
                    label="确认支付"
                    type="primary"
                    disabled={Number(nowMoney).toFixed(2) < Number(value)._toFixed(2) || disabled || parseFloat(value.toString()) !== parseFloat(Number(price)._toFixed(2))}
                    onClick={this.payOrder}
                  />
                </div>
              ) : (
                <div styleName="button_box">
                  <FormButton
                    size='large'
                    label="确认支付"
                    type="primary"
                    disabled={Number(nowMoney).toFixed(2) < Number(price)._toFixed(2) || disabled}
                    onClick={this.payOrder}
                  />
                </div>
              )
          }

        </SchemaForm>
      </div>
    );
  }

  renderFirstStep = () => {
    const { backAndRefresh } = this.props;
    const { nowMoney, price } = this.state;
    return (
      <div styleName='paid_box'>
        <Icon type="check-circle" styleName="check_icon" theme="filled" />
        <p styleName='success_tip'>操作成功</p>
        <p styleName='success_tip2'>预计工作日两小时内到账，若长时间未到账请联系平台管理员</p>
        <div styleName='money_box'>
          <div styleName='money_div'>
            <p>
              <span>付款账户：</span><span>{getUserInfo().organizationName}</span>
            </p>
            <p>
              <span>付款金额：</span><span styleName='money'>{formatMoney(Number(price)._toFixed(2))}</span><span styleName='big_money'>（{digitUppercase(Number(price)._toFixed(2))}）</span>
            </p>
            <p>
              <span>账户余额：</span><span styleName='money'>{formatMoney(Number(nowMoney)._toFixed(2))}</span><span styleName='big_money'>（{digitUppercase(Number(nowMoney)._toFixed(2))}）</span>
            </p>
          </div>
        </div>
        <div styleName="form_center_box">
          <Button onClick={backAndRefresh} size='large'>返 回</Button>
        </div>
      </div>
    );
  }

  handleVisible = (bool) => {
    this.setState({
      selectOrderVisible: bool
    });
  }

  render () {
    const { step, selectOrderVisible, transports } = this.state;
    return (
      <>
        {
          step === 0? this.renderZeroStep(): this.renderFirstStep()
        }
        {
          selectOrderVisible && <SelectOrderModal
            selectOrderVisible={selectOrderVisible}
            handleVisible={this.handleVisible}
            transports={transports}
            setTransports={this.setTransports}
            orderId={[this.props.orderList[0].orderId]}
          />
        }
      </>
    );
  }
}

export default PayForm;
