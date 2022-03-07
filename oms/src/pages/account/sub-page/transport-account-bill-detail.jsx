import React from 'react';
import router from 'umi/router';
import { Button } from 'antd';
import { SchemaForm, Item, FORM_MODE, FormCard } from '@gem-mine/antd-schema-form';
import DebounceFormButton from '@/components/debounce-form-button';
import { connect } from 'dva';
import { TRANSPORT_ACCOUNT_LIST_STATUS, CONSIGNMENT_TYPE } from '@/constants/project/project';
import { getUserInfo } from '@/services/user';
import accountModel from '@/models/transportAccount';
import {  sendAccountTransportExcelPost } from "@/services/apiService";
import { routerToExportPage } from '@/utils/utils';
import CreateAccountBill from './component/transport-account-bill';
import '@gem-mine/antd-schema-form/lib/fields';

const { actions: { detailTransportAccount } } = accountModel;

function mapStateToProps (state) {
  const transportAccount = state.transportAccount.entity;
  transportAccount.responsiblerName = transportAccount.responsibleItems && transportAccount.responsibleItems.map(item => item.responsibleName).join('、');
  return {
    transportAccount
  };
}

@connect(mapStateToProps, { detailTransportAccount })
export default class GoodsAccountBillDetail extends React.Component {

  state = {
    ready: false
  }

  organizationType=getUserInfo().organizationType

  organizationId=getUserInfo().organizationId

  constructor (props) {
    super(props);
    const { location:{ query: { accountOrgType } } } = props;
    this.schema = {
      projectName: {
        label: '项目名称',
        component: 'input',
      },
      responsiblerName: {
        label: '项目负责人',
        component: 'input',
      },
      consignmentType: {
        label: '交易模式',
        component: 'radio',
        options: [{
          key: CONSIGNMENT_TYPE.DIRECT_DELIVERY,
          label: '直发',
          value: CONSIGNMENT_TYPE.DIRECT_DELIVERY
        }, {
          key: CONSIGNMENT_TYPE.AGENCY_DELIVERY,
          label: '代发',
          value: CONSIGNMENT_TYPE.AGENCY_DELIVERY
        }]
      },
      payerOrganizationName: {
        component: 'input'
      },
      accountStatus: {
        label: '账单状态',
        component: 'radio',
        options: [{
          label: '待审核',
          key: TRANSPORT_ACCOUNT_LIST_STATUS.UNAUDITED,
          value: TRANSPORT_ACCOUNT_LIST_STATUS.UNAUDITED
        }, {
          label: '已通过',
          key: TRANSPORT_ACCOUNT_LIST_STATUS.AUDITED,
          value: TRANSPORT_ACCOUNT_LIST_STATUS.AUDITED
        }, {
          label: '已拒绝',
          key: TRANSPORT_ACCOUNT_LIST_STATUS.REFUSE,
          value: TRANSPORT_ACCOUNT_LIST_STATUS.REFUSE
        }, {
          label: '作废',
          key: TRANSPORT_ACCOUNT_LIST_STATUS.CANCEL,
          value: TRANSPORT_ACCOUNT_LIST_STATUS.CANCEL
        }, {
          label: '待提交',
          key: TRANSPORT_ACCOUNT_LIST_STATUS.NOT_HANDLE,
          value: TRANSPORT_ACCOUNT_LIST_STATUS.NOT_HANDLE
        }]
      },
      loadingNetWeight: {
        label: '装车总量',
        component: 'input'
      },
      unloadNetWeight: {
        label: '卸货总量',
        component: 'input'
      },
      accountTransportNo: {
        label: '对账单号',
        component: 'input'
      },
      remark: {
        label: '备注',
        component: 'input.textArea'
      },
      accountDetailItems:{
        component: CreateAccountBill,
        props:{
          accountOrgType
        },
        readOnly: true
      }
    };
  }

  componentDidMount () {
    if ('accountTransportId' in this.props.location.query) {
      this.props.detailTransportAccount({ accountTransportId: this.props.location.query.accountTransportId })
        .then(() => {
          this.setState({
            ready: true
          });
        });
    }
  }


  handleExportBillDetailBtnClick = () => {
    const { accountTransportId } = this.props.transportAccount;
    const params = { accountTransportId, organizationType : this.organizationType, organizationId :this.organizationId, fileName : '账单明细' };
    routerToExportPage(sendAccountTransportExcelPost, params);
  }

  handleBackBtnClick = () => {
    router.goBack();
  }

  render () {
    const { ready } = this.state;
    const entity = { ...this.props.transportAccount };
    const transportAccountBillLayOut = {
      labelCol: {
        xs: { span: 24 },
      },
      wrapperCol: {
        xs: { span: 24 },
      }
    };
    return (
      <>
        {ready &&
          <SchemaForm layout="vertical" mode={FORM_MODE.DETAIL} data={entity} schema={this.schema}>
            <FormCard colCount={3} title="账单信息">
              <Item {...transportAccountBillLayOut} field='projectName' />
              <Item {...transportAccountBillLayOut} field='responsiblerName' />
              <div>
                <Item {...transportAccountBillLayOut} field='consignmentType' />
                <Item {...transportAccountBillLayOut} field='payerOrganizationName' />
              </div>
              <Item {...transportAccountBillLayOut} field='accountStatus' />
              <Item {...transportAccountBillLayOut} field='loadingNetWeight' />
              <Item {...transportAccountBillLayOut} field='unloadNetWeight' />
              <Item {...transportAccountBillLayOut} field='accountTransportNo' />
              <Item {...transportAccountBillLayOut} field='remark' />
            </FormCard>
            <FormCard title="运单信息" colCount={1}>
              <Item {...transportAccountBillLayOut} field='accountDetailItems' mode={FORM_MODE.DETAIL} />
            </FormCard>
            <div style={{ paddingRight:'20px', textAlign:'right' }}>
              <Button className="mr-10" onClick={this.handleBackBtnClick}>返回</Button>
              <DebounceFormButton label="导出运单明细" type="primary" onClick={this.handleExportBillDetailBtnClick} />
            </div>
          </SchemaForm>}
      </>
    );
  }
}
