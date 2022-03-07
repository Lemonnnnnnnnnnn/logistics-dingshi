import React, { Component } from 'react';
import router from 'umi/router';
import { Button, notification, Select } from 'antd';
import moment from 'moment';
import { connect } from 'dva';
import { SchemaForm, Item, FormCard } from '@gem-mine/antd-schema-form';
import DebounceFormButton from '../../../components/debounce-form-button';
import '@gem-mine/antd-schema-form/lib/fields';
import FORM_MODE from '../../logistics-manage/invoicing-manage/invoicing/components/invoicing-list';
import { translatePageType, getLocal, omit, pick, isEmpty  } from '../../../utils/utils';
import Table from '../../../components/table/table';
import accountModel from '../../../models/outboundAccountDetail';
import { FilterContextCustom } from '../../../components/table/filter-context';
import { getTransportStatus } from '../../../services/project';
import { getDeliveryStatementCheckAndBindStatus, getDeliveryStatementCheckStatus } from '../../../services/deliverStatement';

const { actions: { getOutboundAccountDetail } } = accountModel;

const { Option } = Select;

function mapStateToProps(state) {
  return {
    outboundAccountDetail: pick(state.outboundAccountDetail, ['items', 'count']),
    commonStore: state.commonStore
  };
}

@connect(mapStateToProps, { getOutboundAccountDetail })
@FilterContextCustom // filter 信息
export default class ConsignmentCreateAccountStatementTwo extends Component {
  currentTab = this.props.commonStore.tabs.find(item => item.id === this.props.commonStore.activeKey);

  localData = this.currentTab && getLocal(this.currentTab.id) || { formData: {} };

  state = {
    ready: true,
    nowPage: 1,
    pageSize: 10,
    offset:0,
    checkStatusList:[]
  }

  constructor(props) {
    super(props);
    this.schema = {
      projectName: {
        label: '项目名称',
        component: 'input.text',
      },
      outboundStartAndEndTime: {
        label: '核对期间',
        component: 'input.text',
      },
      supplierOrganizationName: {
        label: '厂商名称',
        component: 'input.text',
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
            if (text){
              const config = getDeliveryStatementCheckAndBindStatus(`carNoMatch_${record.carNoMatch}`);
              return (
                <span style={{ color: config.color }}>{ text }</span>
              );
            }
            return <span>{text}</span>;
          }
        },
        {
          title: '厂商出库单号',
          dataIndex: 'supplierOutboundNo',
          render: (text, record) => {
            if (text){
              const config = getDeliveryStatementCheckAndBindStatus(`deliveryNoMatch_${record.deliveryNoMatch}`);
              return (
                <span style={{ color: config.color }}>{ text }</span>
              );
            }
            return <span>{text}</span>;
          }
        },
        {
          title: '厂商出库时间',
          dataIndex: 'supplierOutboundTime',
          render: (time, record) =>{
            if (time==null){
              return "";
            }
            const formatTime=moment(time).format('YYYY-MM-DD HH:mm:ss');
            if (time){
              const config = getDeliveryStatementCheckAndBindStatus(`timeMatch_${record.timeMatch}`);
              return (
                <span style={{ color: config.color }}>{ formatTime }</span>
              );
            }
            return <span>{formatTime}</span>;
          },
        },
        {
          title: '厂商出库量',
          dataIndex: 'supplierOutboundNum',
          render: (text, record) => {
            if (text){
              const config = getDeliveryStatementCheckAndBindStatus(`numMatch_${record.numMatch}`);
              return (
                <span style={{ color: config.color }}>{ text }</span>
              );
            }
            return <span>{text}</span>;
          }
        },
        {
          title: '运单号',
          dataIndex: 'transportNo',
        },
        {
          title : '货品名称',
          dataIndex: 'categoryName',
          render: (text, record) =><span>{text}-{record.goodsName}</span>
        },
        {
          title: '运单状态',
          dataIndex: 'transportImmediateStatus',
          render: (text, record) => {
            if (!record.transportNo) return '未匹配到运单';
            record.transportImmediateStatus =record.transportStatus;
            const statusArr = getTransportStatus(record);
            return (
              <>
                {statusArr.map((item) =>
                  <span key={item.key} style={{ color: item.color }}>
                    {item.word}
                  </span>
                )}
              </>
            );
          },
        },
        {
          title: '车牌号',
          dataIndex: 'carNo',
          render: (text, record) => {
            if (text){
              const config = getDeliveryStatementCheckAndBindStatus(`carNoMatch_${record.carNoMatch}`);
              return (
                <span style={{ color: config.color }}>{ text }</span>
              );
            }
            return <span>{text}</span>;
          }
        },
        {
          title: '提货单号',
          dataIndex: 'deliveryNo',
          render: (text, record) => {
            if (text){
              const config = getDeliveryStatementCheckAndBindStatus(`deliveryNoMatch_${record.deliveryNoMatch}`);
              return (
                <span style={{ color: config.color }}>{ text }</span>
              );
            }
            return <span>{text}</span>;
          }
        },
        {
          title: '提货时间',
          dataIndex: 'deliveryTime',
          render: (time, record) =>{
            if (time==null){
              return "";
            }
            const formatTime=moment(time).format('YYYY-MM-DD HH:mm:ss');
            if (time){
              const config = getDeliveryStatementCheckAndBindStatus(`timeMatch_${record.timeMatch}`);
              return (
                <span style={{ color: config.color }}>{ formatTime }</span>
              );
            }
            return <span>{formatTime}</span>;
          },
        },
        {
          title: '实提量',
          dataIndex: 'deliveryNum',
          render: (text, record) => {
            if (text){
              const config = getDeliveryStatementCheckAndBindStatus(`numMatch_${record.numMatch}`);
              return (
                <span style={{ color: config.color }}>{ text }</span>
              );
            }
            return <span>{text}</span>;
          }
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
          fixed:'right',
          render: (val) =>{
            const config = getDeliveryStatementCheckStatus(val);
            return (
              <span style={{ color: config.color }}>{config.word}</span>
            );
          }
        },
      ],
    };

  }

  componentWillUnmount() {
    const { accountOutboundId, accountOutboundResp } = this.props;
    const { offset = 0, limit = 10, checkStatusList } = this.state;
    if (getLocal('local_commonStore_tabs').tabs.length > 1) {
      localStorage.setItem(this.currentTab.id, JSON.stringify({
        formData: { ...this.localData.formData, accountOutboundId, checkStatusList, limit, offset },
        accountOutboundResp,
        tab: 2,
      }));
    }
  }

  componentDidMount() {
    if (!isEmpty(this.localData.formData) && this.localData.formData.accountOutboundId) {
      const { accountOutboundId, offset = 0, limit = 10, checkStatusList } = this.localData.formData;
      if (accountOutboundId && accountOutboundId !== 0) {
        const newFilter = { offset, limit, accountOutboundId, checkStatusList };
        this.props.getOutboundAccountDetail(newFilter).then(() => {
          this.setState({
            nowPage: offset / limit + 1,
            pageSize: limit,
            ready: true,
          });
        });
      } else {
        notification.error({ message: '错误信息', description: '未找到出库对账单ID' });
        router.goBack();
      }
    } else {
      const { accountOutboundId } = this.props;
      if (accountOutboundId && accountOutboundId !== 0) {
        const { offset = 0, limit = 10, checkStatusList } = this.state;
        const newFilter = { offset, limit, accountOutboundId, checkStatusList };
        this.props.getOutboundAccountDetail(newFilter).then(() => {
          this.setState({
            nowPage: offset / limit + 1,
            pageSize: limit,
            ready: true,
          });
        });
      } else {
        notification.error({ message: '错误信息', description: '未找到出库对账单ID' });
        router.goBack();
      }
    }
  }


  handleChange = (value) => {
    this.setState({
      nowPage: 1,
      checkStatusList:(value ===""?"":[value])
    });
    const { accountOutboundId } = this.props;
    const { offset = 0, pageSize=10 } = this.state;
    const newFilter = { offset, limit:pageSize, accountOutboundId, checkStatusList:(value === '' ? '' : [value]) };
    // 发请求
    this.props.getOutboundAccountDetail(omit(newFilter, 'createTime'));
  }


  /**
   * 保存出库对账单
   */
  handleSaveBtnClick = () => {
    this.props.getData({
      btnStatus: "save",
    });
  }

  handleBackBtnClick = () => {
    router.replace('/bill-account/deliveryStatement/consignmentDeliveryStatementList');
    window.g_app._store.dispatch({
      type: 'commonStore/deleteTab',
      payload: { id: this.currentTab.id }
    });
  }

  /**
   * 分页
   * @param pagination
   */
  onChange = (pagination) => {
    const { offset, limit, current } = translatePageType(pagination);
    const { accountOutboundId } = this.props;
    const { checkStatusList } = this.state;
    this.setState({
      nowPage: current,
      pageSize: limit,
      offset
    });
    this.props.getOutboundAccountDetail({ offset, limit, accountOutboundId, checkStatusList });
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
    const extra = (
      <div style={{ float: "right" }}>
        <DebounceFormButton className="mr-10" label="保存" type="primary" onClick={this.handleSaveBtnClick} />
        <Button onClick={this.handleBackBtnClick}>取消</Button>
      </div>
    );
    const data = Object.assign(accountOutboundResp, this.localData.accountOutboundResp  || {});

    return (
      <>
        {ready &&
        <SchemaForm layout="vertical" mode={FORM_MODE.DETAIL} data={data} schema={this.schema}>
          <FormCard colCount={3} title="账单信息" extra={extra}>
            <Item {...transportLayOut} field='projectName' />
            <Item {...transportLayOut} field='outboundStartAndEndTime' />
            <Item {...transportLayOut} field='supplierOrganizationName' />
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

        </SchemaForm>
        }
      </>
    );
  }
}
