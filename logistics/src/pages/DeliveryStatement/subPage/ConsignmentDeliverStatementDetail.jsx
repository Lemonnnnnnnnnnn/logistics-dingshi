// 对账单详情
import React, { Component } from 'react';
import router from 'umi/router';
import { Button, notification, Select } from 'antd';
import { SchemaForm, Item, FormCard } from '@gem-mine/antd-schema-form';
import { connect } from 'dva';
import '@gem-mine/antd-schema-form/lib/fields';
import moment from 'moment';
import { omit, pick } from 'lodash';
import FORM_MODE from '@/pages/LogisticsManage/InvoicingManage/Invoicing/components/InvoicingList';
import { translatePageType } from '@/utils/utils';
import Table from '@/components/Table/Table';
import accountModel from '@/models/outboundAccount';
import { FilterContextCustom } from '@/components/Table/FilterContext';
import { getTransportStatus } from '@/services/project';
import { getDeliveryStatementCheckAndBindStatus, getDeliveryStatementCheckStatus } from '@/services/deliverStatement';
import { refreshAccountOutbound } from '@/services/apiService';
import outboundAccountDetailModel from '@/models/outboundAccountDetail';

const { actions: { detailOutboundAccount } } = accountModel;
const { actions: { getOutboundAccountDetail } } = outboundAccountDetailModel;


const { Option } = Select;

function mapStateToProps(state) {
  const { accountOutboundResp } = state.outboundAccount.entity;
  const outboundAccountDetail = pick(state.outboundAccountDetail, ['items', 'count']);
  return {
    accountOutboundResp,
    outboundAccountDetail,
  };
}

@connect(mapStateToProps, { detailOutboundAccount, getOutboundAccountDetail })
@FilterContextCustom // filter 信息
export default class ConsignmentDeliverStatementDetail extends Component {
  state = {
    ready: true,
    nowPage: 1,
    pageSize: 10,
    offset: 0,
    checkStatusList: '',
  }

  constructor(props) {
    super(props);
    this.schema = {
      projectName: {
        label: '项目名称',
        component: 'input.text',
      },
      supplierOrganizationName: {
        label: '厂商名称',
        component: 'input.text',
      },
      outboundStartAndEndTime: {
        label: '核对期间',
        component: 'input.text',
      },
      accountOutboundNo: {
        label: '对账单编号',
        component: 'input.text',
      },
      createUserName: {
        label: '创建人',
        component: 'input.text',
      },
      createTime: {
        label: '创建时间',
        component: 'input.text',
        render: (time) => moment(time).format('YYYY-MM-DD HH:mm:ss'),
      },
    };

    this.tableSchema = {
      variable: true,
      minWidth: 1800,
      columns: [
        {
          title: '项目名称',
          dataIndex: 'projectName',
        },
        {
          title : '厂商货品名称',
          dataIndex: 'supplierOutboundGoods'
        },
        {
          title: '厂商车牌号',
          dataIndex: 'supplierCarNo',
          render: (text, record) => {
            if (text) {
              const config = getDeliveryStatementCheckAndBindStatus(`carNoMatch_${record.carNoMatch}`);
              return (
                <span style={{ color: config.color }}>{text}</span>
              );
            }
            return <span>{text}</span>;
          },
        },
        {
          title: '厂商出库单号',
          dataIndex: 'supplierOutboundNo',
          render: (text, record) => {
            if (text) {
              const config = getDeliveryStatementCheckAndBindStatus(`deliveryNoMatch_${record.deliveryNoMatch}`);
              return (
                <span style={{ color: config.color }}>{text}</span>
              );
            }
            return <span>{text}</span>;
          },
        },
        {
          title: '厂商出库时间',
          dataIndex: 'supplierOutboundTime',
          render: (time, record) => {
            if (time == null) {
              return '';
            }
            const formatTime = moment(time).format('YYYY-MM-DD HH:mm:ss');
            if (time) {
              const config = getDeliveryStatementCheckAndBindStatus(`timeMatch_${record.timeMatch}`);
              return (
                <span style={{ color: config.color }}>{formatTime}</span>
              );
            }
            return <span>{formatTime}</span>;
          },
        },
        {
          title: '厂商出库量',
          dataIndex: 'supplierOutboundNum',
          render: (text, record) => {
            if (text) {
              const config = getDeliveryStatementCheckAndBindStatus(`numMatch_${record.numMatch}`);
              return (
                <span style={{ color: config.color }}>{text}</span>
              );
            }
            return <span>{text}</span>;
          },
        },
        {
          title: '运单号',
          dataIndex: 'transportNo',
          render : (text, record) => <a onClick={()=> router.push(`/buiness-center/transportList/transport/transportDetail?transportId=${record.transportId}`)}>{text}</a>
        },
        {
          title : '货品名称',
          dataIndex: 'categoryName',
          render: (text, record) =><span>{text}-{record.goodsName}</span>
        },
        {
          title: '运单状态',
          dataIndex: 'transportStatus',
          render: (text, record) => {
            if (!record.transportNo) return '未匹配到运单';
            record.transportImmediateStatus = record.transportStatus;
            const statusArr = getTransportStatus(record);
            return (
              <>
                {statusArr.map((item) =>
                  <span key={item.key} style={{ color: item.color }}>
                    {item.word}
                  </span>,
                )}
              </>
            );
          },
        },
        {
          title: '车牌号',
          dataIndex: 'carNo',
          render: (text, record) => {
            if (text) {
              const config = getDeliveryStatementCheckAndBindStatus(`carNoMatch_${record.carNoMatch}`);
              return (
                <span style={{ color: config.color }}>{text}</span>
              );
            }
            return <span>{text}</span>;
          },
        },
        {
          title: '提货单号',
          dataIndex: 'deliveryNo',
          render: (text, record) => {
            if (text) {
              const config = getDeliveryStatementCheckAndBindStatus(`deliveryNoMatch_${record.deliveryNoMatch}`);
              return (
                <span style={{ color: config.color }}>{text}</span>
              );
            }
            return <span>{text}</span>;
          },
        },
        {
          title: '提货时间',
          dataIndex: 'deliveryTime',
          render: (time, record) => {
            if (time == null) {
              return '';
            }
            const formatTime = moment(time).format('YYYY-MM-DD HH:mm:ss');
            if (time) {
              const config = getDeliveryStatementCheckAndBindStatus(`timeMatch_${record.timeMatch}`);
              return (
                <span style={{ color: config.color }}>{formatTime}</span>
              );
            }
            return <span>{formatTime}</span>;
          },
        },
        {
          title: '实提量',
          dataIndex: 'deliveryNum',
          render: (text, record) => {
            if (text) {
              const config = getDeliveryStatementCheckAndBindStatus(`numMatch_${record.numMatch}`);
              return (
                <span style={{ color: config.color }}>{text}</span>
              );
            }
            return <span>{text}</span>;
          },
        },
        {
          title: () => (
            <div>
              <Select defaultValue="" style={{ width: 120 }} onChange={this.handleChange}>
                <Option value="">核对情况</Option>
                <Option value="MATCHED">通过</Option>
                <Option value="PART_MATCH">部分正确</Option>
                <Option value="NO_MATCH">无法匹配</Option>
              </Select>
            </div>
          ),
          dataIndex: 'checkStatus',
          fixed: 'right',
          render: (val) => {
            const config = getDeliveryStatementCheckStatus(val);
            return (
              <span style={{ color: config.color }}>{config.word}</span>
            );
          },
        },
      ],
    };

  }


  componentDidMount() {
    if ('accountOutboundId' in this.props.location.query) {
      const { accountOutboundId } = this.props.location.query;
      this.props.detailOutboundAccount({ accountOutboundId });

      const { offset = 0, limit = 10, checkStatusList } = this.state;
      const newFilter = { accountOutboundId, checkStatusList, offset, limit };
      this.props.getOutboundAccountDetail(newFilter)
        .then(() => {
          this.setState({
            nowPage: offset / limit + 1,
            pageSize: limit,
            ready: true,
            accountOutboundId,
          });
        });
    } else {
      notification.error({ message: '错误信息', description: '未找到出库对账单ID' });
    }
  }

  handleChange = (value) => {
    this.setState({
      nowPage: 1,
      checkStatusList:(value === '' ? '' : [value])
    });
    const newFilter = {
      offset:this.state.offset,
      limit:this.state.pageSize,
      accountOutboundId: this.state.accountOutboundId,
      checkStatusList: (value === '' ? '' : [value]),
    };
    // 发请求
    this.props.getOutboundAccountDetail(omit(newFilter, 'createTime'));
  }


  handleBackBtnClick = () => {
    router.goBack();
  }

  /**
   * 分页
   * @param pagination
   */
  onChange = (pagination) => {
    const { offset, limit, current } = translatePageType(pagination);
    const { accountOutboundId, checkStatusList } = this.state;
    this.setState({
      nowPage: current,
      pageSize: limit,
      offset
    });
    const newFilter = { offset, limit, accountOutboundId, checkStatusList };
    this.props.getOutboundAccountDetail({ ...newFilter });
  }

  refresh =() =>{
    const { accountOutboundId } = this.props.location.query;
    refreshAccountOutbound({ accountOutboundId }).then(()=>{
      const { offset = 0, limit = 10, checkStatusList } = this.state;
      const newFilter = { accountOutboundId, checkStatusList, offset, limit };
      this.props.getOutboundAccountDetail(newFilter)
        .then(() => {
          this.setState({
            nowPage: offset / limit + 1,
            pageSize: limit,
            ready: true,
            accountOutboundId,
          });
        });
    });
  }

  render() {
    const { ready } = this.state;
    const transportLayOut = {
      labelCol: {
        xs: { span: 24 },
      },
      wrapperCol: {
        xs: { span: 24 },
      },
    };
    const { nowPage, pageSize } = this.state;
    const { accountOutboundResp, outboundAccountDetail } = this.props;
    return (
      <>
        {ready &&
        <SchemaForm layout="vertical" mode={FORM_MODE.DETAIL} data={accountOutboundResp} schema={this.schema}>
          <FormCard colCount={3} title="账单信息" extra={<Button style={{ float : 'right' }} type='primary' onClick={this.refresh}>刷新比对数据</Button>}>
            <Item {...transportLayOut} field='projectName' />
            <Item {...transportLayOut} field='supplierOrganizationName' />
            <Item {...transportLayOut} field='outboundStartAndEndTime' />
            <Item {...transportLayOut} field='accountOutboundNo' />
            <Item {...transportLayOut} field='createUserName' />
            <Item {...transportLayOut} field='createTime' />
          </FormCard>
          <FormCard title="单据信息" colCount={1}>
            <Table
              rowKey="outboundDetailId"
              pagination={{ current: nowPage, pageSize }}
              onChange={this.onChange}
              schema={this.tableSchema}
              dataSource={outboundAccountDetail}
            />
          </FormCard>
          <div style={{ textAlign: 'center' }}>
            <Button onClick={this.handleBackBtnClick}>返回</Button>
          </div>
        </SchemaForm>
        }
      </>
    );
  }
}
