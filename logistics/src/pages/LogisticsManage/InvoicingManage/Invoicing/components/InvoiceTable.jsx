import React, { Component } from 'react';
import { Button, Modal, Popover, Icon } from 'antd';
import { SchemaForm, Item } from '@gem-mine/antd-schema-form';
import DebounceFormButton from '../../../../../components/DebounceFormButton';
import { digitUppercase } from '../../../../../utils/utils';

export default class InvoiceTable extends Component{

  formatData = (arr) => {
    const str = arr.slice(0, 3).join('、');
    return arr.length > 3 ? `${str}等` : str;
  }

  rejectFormSchema = {
    verifyReason: {
      label: '拒绝理由',
      component: 'input.textArea',
      rules: {
        required: [true, '请填写拒绝理由'],
        max: 100,
        validator: ({ value }) => {
          if (!value.toString().trim()) {
            return '拒绝理由不能为空';
          }
        },
      },
      placeholder: '请填写拒绝理由(最多100个字)',
    },
  }

  render () {
    const { detail, verifyVisible, rejectVisible, verifyFormHandleCancel, handleVisibleChange, egisInvoice, handleVisibleHide, rejectThisInvoice } = this.props;
    const {
      priceExcludingTax,
      tax,
      logisticsBankAccountEntity: plat,
      logisticsUserInvoiceEntity: user,
      invoiceEntity: info,
      transportRouteList,
      goodsNameList,
      carType,
      carNo,
    } = detail;
    const dom = (
      <>
        <p style={{ marginBottom: '10px' }}>
          <Icon style={{ color: 'red', marginRight: '5px' }} type='close-circle' theme='filled' />请填写拒绝理由
        </p>
        <SchemaForm className='invoicingList_reject_form' layout='vertical' schema={this.rejectFormSchema}>
          <Item field='verifyReason' />
          <div styleName='effect_button_box'>
            <DebounceFormButton size='small' label='确定' type='primary' onClick={rejectThisInvoice} />
            <Button size='small' onClick={handleVisibleHide}>取消</Button>
          </div>
        </SchemaForm>
      </>
    );
    return (
      <>
        <Modal
          visible={verifyVisible}
          destroyOnClose
          maskClosable={false}
          title='审核'
          width='780px'
          onCancel={verifyFormHandleCancel}
          footer={
            <div styleName='verify_button_box' style={{ border: 'none' }}>
              <Popover
                content={dom}
                trigger='click'
                visible={rejectVisible}
                onVisibleChange={handleVisibleChange}
              >
                <Button style={{ marginRight: '20px' }} onClick={handleVisibleChange}>拒绝</Button>
              </Popover>
              <Button type='primary' onClick={egisInvoice}>通过</Button>
            </div>
          }
        >
          <table border='1' cellSpacing='0' cellPadding='5px' width='100%'>
            <tbody>
              <tr>
                <td width='5px'>购买方</td>
                <td width='340px' styleName='infoCard'>
                  <p>
                    <span>名&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;称：</span>{user.invoiceTitle}
                  </p>
                  <p><span>纳税人识别号：</span>{user.invoiceNo}</p>
                  <p styleName='font-size12'>
                    <span styleName='font-size14'>地 址、电 话：</span>{user.mailingAddress}&nbsp;{user.recipientPhone}
                  </p>
                  <p styleName='font-size13'>
                    <span
                      styleName='font-size14'
                    >开户行及账号：
                    </span>{user.openingBank}&nbsp;{user.bankAccount}
                  </p>
                </td>
                <td width='5px'>密码区</td>
                <td styleName='passwordArea'><span>开票之后生成</span></td>
              </tr>
            </tbody>
          </table>
          <table
            border='1'
            cellSpacing='0'
            cellPadding='5px'
            style={{ borderTop: 'none', borderBottom: 'none' }}
            width='100%'
          >
            <tbody>
              <tr>
                <td width='232px'>
                  <p style={{ textAlign: 'center', marginBottom: 0 }}>货物或应税劳务、服务名称</p>
                  <p style={{ textAlign: 'center' }}>运输服务、运费</p>
                  <p style={{
                    textAlign: 'center',
                    marginTop: '40px',
                    marginBottom: 0,
                  }}
                  >合&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;计
                  </p>
                </td>
                <td>
                  <p style={{ textAlign: 'center', marginBottom: 0 }}>规格型号</p>
                  <p style={{ textAlign: 'center' }}>水泥</p>
                  <p style={{ textAlign: 'center', marginTop: '61px', marginBottom: 0 }} />
                </td>
                <td>
                  <p style={{ textAlign: 'center', marginBottom: 0 }}>单位</p>
                  <p style={{ textAlign: 'center' }}>&nbsp;</p>
                  <p style={{ textAlign: 'center', marginTop: '61px', marginBottom: 0 }} />
                </td>
                <td>
                  <p style={{ textAlign: 'center', marginBottom: 0 }}>数量</p>
                  <p style={{ textAlign: 'center' }}>&nbsp;</p>
                  <p style={{ textAlign: 'center', marginTop: '61px', marginBottom: 0 }} />
                </td>
                <td>
                  <p style={{ textAlign: 'center', marginBottom: 0 }}>单价</p>
                  <p style={{ textAlign: 'center' }}>&nbsp;</p>
                  <p style={{ textAlign: 'center', marginTop: '61px', marginBottom: 0 }} />
                </td>
                <td>
                  <p style={{ textAlign: 'center', marginBottom: 0 }}>金额</p>
                  <p style={{ textAlign: 'center' }}>{priceExcludingTax.toFixed(2)._toFixed(2)}</p>
                  <p style={{
                    textAlign: 'center',
                    marginTop: '40px',
                    marginBottom: 0,
                  }}
                  >￥{priceExcludingTax.toFixed(2)._toFixed(2)}
                  </p>
                </td>
                <td>
                  <p style={{ textAlign: 'center', marginBottom: 0 }}>税率</p>
                  <p style={{ textAlign: 'center' }}>{`${info.invoiceTax * 100}%`}</p>
                  <p style={{ textAlign: 'center', marginTop: '61px', marginBottom: 0 }} />
                </td>
                <td>
                  <p style={{ textAlign: 'center', marginBottom: 0 }}>税额</p>
                  <p style={{ textAlign: 'center' }}>{tax.toFixed(2)._toFixed(2)}</p>
                  <p style={{ textAlign: 'center', marginTop: '40px', marginBottom: 0 }}>￥{tax.toFixed(2)._toFixed(2)}</p>
                </td>
              </tr>
            </tbody>
          </table>
          <table border='1' cellSpacing='0' cellPadding='5px' style={{ borderBottom: 'none' }} width='100%'>
            <tbody>
              <tr>
                <td width='232px'>
                  <p style={{ textAlign: 'center', marginBottom: 0 }}>价税合计(大写)</p>
                </td>
                <td>
                  <span>{digitUppercase(Number(info.shouldInvoiceAmount.toFixed(2))._toFixed(2))}</span>
                  <span styleName='totalMoney'>(小写)￥{info.shouldInvoiceAmount.toFixed(2)._toFixed(2)}</span>
                </td>
              </tr>
            </tbody>
          </table>
          <table border='1' cellSpacing='0' cellPadding='5px' width='100%'>
            <tbody>
              <tr>
                <td width='5px'>销售方</td>
                <td width='341px' styleName='infoCard'>
                  <p>
                    <span>名&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;称：</span>{plat.invoiceTitle}
                  </p>
                  <p><span>纳税人识别号：</span>{plat.invoiceNo || '--'}</p>
                  <p styleName='font-size12'>
                    <span styleName='font-size14'>地 址、电 话：</span>平潭综合实验区北厝镇金井二路台湾创业园31号楼三层C6区&nbsp;18650383900
                  </p>
                  <p styleName='font-size13'>
                    <span
                      styleName='font-size14'
                    >
                      开户行及账号：
                    </span>
                    {plat.bankName}&nbsp;{plat.bankAccount}
                  </p>
                </td>
                <td width='5px'>备注</td>
                <td width='341px' styleName='infoCard p_margin3'>
                  <p><span>运输公司：</span>{user.invoiceTitle}</p>
                  <p><span>运输路线：</span>{this.formatData(transportRouteList)}</p>
                  <p><span>货物名称：</span>{this.formatData(goodsNameList)}</p>
                  <p><span>车辆型号：</span>{carType && this.formatData(carType) || '--'}</p>
                  <p>
                    <span>车 牌 号：</span>
                    {this.formatData(carNo)}
                  </p>
                </td>
              </tr>
            </tbody>
          </table>
        </Modal>
      </>
    );
  }
}
