import React, { Component } from 'react';
import { Button, Tabs } from 'antd';
import Link from 'umi/link';
import Authorized from '../../utils/Authorized';
import auth from '../../constants/authCodes';
import ConsignmentDeliverStatementList from './sub-page/consignment-deliver-statement-list';
import ConsignmentDeliverStatementDetailedList
  from './sub-page/consignment-deliver-statement-detailed-list';
import { FilterContextCustom } from '../../components/table/filter-context';
import { getUserInfo } from '../../services/user';

const {
  OUTBOUND_ACCOUNT_CREATE,
  OUTBOUND_ACCOUNT_EXCEL,
  CONSIGNMENT_OUTBOUND_ACCOUNT_VISIT
} = auth;


const { TabPane } = Tabs;

@FilterContextCustom
export default class ConsignmentDeliveryStatement extends Component {
  organizationType = getUserInfo().organizationType

  organizationId = getUserInfo().organizationId

  state = {
    tabKey: 1,
  }

  tabChooseCallback = (key) => {
    const keyVal = parseInt(key);
    this.props.setFilter({ offset: 0, limit: 10 });
    this.setState({
      tabKey:keyVal
    });
  }


  render() {
    const { tabKey } = this.state;
    const authConfig = {
      detailAuth:[CONSIGNMENT_OUTBOUND_ACCOUNT_VISIT],
      excelAuth:[OUTBOUND_ACCOUNT_EXCEL]
    };

    return (
      <>
        {
          this.organizationType === 4 ?
            <Authorized authority={[OUTBOUND_ACCOUNT_CREATE]}>
              <Button type="primary">
                <Link to="consignmentDeliveryStatementList/consignmentCreateAccountStatement">+ 新建对账单</Link>
              </Button>
            </Authorized>
            :
            null
        }
        <Tabs defaultActiveKey='1' onChange={this.tabChooseCallback}>
          <TabPane tab="对账单列表" key="1">
            {tabKey === 1 && <ConsignmentDeliverStatementList {...authConfig} />}
          </TabPane>
          <TabPane tab="明细列表" key="2">
            {tabKey === 2 && <ConsignmentDeliverStatementDetailedList {...authConfig} />}
          </TabPane>
        </Tabs>
      </>
    );
  }
}
