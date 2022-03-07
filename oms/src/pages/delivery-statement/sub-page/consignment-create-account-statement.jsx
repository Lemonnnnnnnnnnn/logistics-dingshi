// 新建对账单

import React, { Component } from 'react';
import { connect } from 'dva';
import { notification } from 'antd';
import router from 'umi/router';
import { getLocal, isEmpty } from '../../../utils/utils';
import ConsignmentCreateAccountStatementOne
  from './consignment-create-account-statement-one';
import ConsignmentCreateAccountStatementTwo
  from './consignment-create-account-statement-two';
import model from '../../../models/outboundAccount';
import { FilterContextCustom } from '../../../components/table/filter-context';


const { actions: { postOutboundAccount, patchOutboundAccount } } = model;

function mapStateToProps(state) {
  return {
    outboundAccount: state.outboundAccount.entity,
    commonStore: state.commonStore
  };
}

@connect(mapStateToProps, { postOutboundAccount, patchOutboundAccount })
@FilterContextCustom
export default class ConsignmentCreateAccountStatement extends Component {
  currentTab = this.props.commonStore.tabs.find(item => item.id === this.props.commonStore.activeKey);

  localData = this.currentTab && getLocal(this.currentTab.id) || { formData: {} };

  constructor(props) {
    super(props);
    this.state = {
      tab: 1,
      dataSources: {
        accountOutboundResp: '',
        accountOutboundDetailCommonRespList: [],
      },
      accountOutboundId: 1,
    };
  }

  componentDidMount() {
    if (this.localData.tab) {
      this.setState({ tab: this.localData.tab });
    }
    if (!isEmpty(this.localData.formData)) {
      this.setState({ accountOutboundId: this.localData.formData.accountOutboundId });
    }
  }

  /**
   * 新建对账单 step one callback
   * @param val
   */
  getOneCallbackData = async (val) => {
    // Todo 发送保存信息请求
    const result = await (this.props.postOutboundAccount({
      supplierOrganizationName: val.supplierOrganizationName,
      supplierOrganizationId: val.supplierOrganizationId,
      excelDentryid: val.excelDentryid,
    }));

    if (result) {
      /* notification.success({
        message: '添加成功',
        description: '添加成功',
      }) */
      this.setState({
        dataSources: result,
        accountOutboundId: result.accountOutboundResp.accountOutboundId,
      });
      localStorage.setItem(this.currentTab.id, JSON.stringify({
        formData: { ...this.localData.formData, accountOutboundId: result.accountOutboundResp.accountOutboundId },
        tab: val.tab,
      }));
      // 跳转步骤二
      this.setState({
        tab: val.tab,
      });
    }
  }

  /**
   * 新建对账单 step two callback
   * @param val
   */
  getTwoCallbackData = (val) => {
    // 出库对账单保存/取消
    this.props.patchOutboundAccount({
      accountOutboundId:this.state.accountOutboundId,
      isEffect: val.btnStatus === 'save' ? 1 : 0,
    }).then(()=>{
      const { filter } = this.props;
      delete(filter.accountOutboundId);
      delete(filter.checkStatusList);
      this.props.setFilter({ ...filter });
      notification.success({
        message: '保存成功',
        description: '保存成功',
      });

    }).then(()=>{
      router.replace('/bill-account/deliveryStatement/consignmentDeliveryStatementList');
      window.g_app._store.dispatch({
        type: 'commonStore/deleteTab',
        payload: { id: this.currentTab.id }
      });
    });
  }

  render() {
    if (this.state.tab === 1) {
      return (
        <ConsignmentCreateAccountStatementOne
          tab={this.state.tab}
          accountOutboundId={this.state.accountOutboundId}
          getData={this.getOneCallbackData}
        />
      );
    }
    return (
      <ConsignmentCreateAccountStatementTwo
        accountOutboundId={this.state.accountOutboundId}
        accountOutboundResp={this.state.dataSources.accountOutboundResp}
        accountOutboundDetailCommonRespList={this.state.dataSources.accountOutboundDetailCommonRespList}
        tab={this.state.tab}
        getData={this.getTwoCallbackData}
      />
    );

  }
}

