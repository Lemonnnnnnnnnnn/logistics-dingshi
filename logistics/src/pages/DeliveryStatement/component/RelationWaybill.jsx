// 明细列表
import React, { Component } from 'react';
import moment from 'moment';
import auth from '@/constants/authCodes';
import { omit, pick } from 'lodash';
import { connect } from 'dva';
import Table from '@/components/Table/Table';
import { translatePageType } from '@/utils/utils';
import SearchForm from '@/components/Table/SearchForm2';
import { FORM_MODE, Item } from '@gem-mine/antd-schema-form';
import DebounceFormButton from '@/components/DebounceFormButton';
import { getTransportStatus } from '@/services/project';
import outboundAccountTransportListModel from '@/models/outboundAccountTransportList';
import { Button, message, Modal, notification } from 'antd';
import { pathAccountOutboundMatchByOutboundDetailId } from '@/services/apiService';
import { FilterContextCustom } from '@/components/Table/FilterContext';

const {} = auth;


const { actions: { getOutboundAccountTransportList } } = outboundAccountTransportListModel;

function mapStateToProps(state) {
  return {
    outboundAccountTransportList: pick(state.outboundAccountTransportList, ['items', 'count']),
  };
}

@connect(mapStateToProps, { getOutboundAccountTransportList })
@FilterContextCustom
export default class RelationWaybill extends Component {
  constructor(props) {
    super(props);

    const tableSchema = {
      variable: true,
      minWidth: 1600,
      columns: [
        {
          title: '项目名称',
          dataIndex: 'projectName',
        },
        {
          title: '运单号',
          dataIndex: 'transportNo',
        },
        {
          title: '运单状态',
          dataIndex: 'transportImmediateStatus',
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
          title: '提货单号',
          dataIndex: 'deliveryNo',
        },
        {
          title: '车牌号',
          dataIndex: 'carNo',
        },

        {
          title: '提货时间',
          dataIndex: 'deliveryTime',
          render: (time) => {
            if (time == null) {
              return '';
            }
            const formatTime = moment(time).format('YYYY-MM-DD HH:mm:ss');
            return <span>{formatTime}</span>;
          },
        },
        {
          title: '提货量',
          dataIndex: 'deliveryNum',
        },
        {
          title: '货品名称',
          dataIndex: 'goodsName',
          render: (text, record) => <span>{record.categoryName}-{text}</span>,
        },
        {
          title: '司机',
          dataIndex: 'driverUserName',
        },
      ],

    };


    const searchSchema = {
      rwb_carNo: {
        label: '车牌号',
        placeholder: '请输入车牌号',
        component: 'input',
      },
      rwb_deliveryNo: {
        label: '提货单号',
        placeholder: '请输入提货单号',
        component: 'input',
      },
      rwb_transportNo: {
        label: '运单号',
        placeholder: '请输入运单号',
        component: 'input',
      },
      rwb_deliveryTime: {
        label: '提货日期',
        component: 'rangePicker',
      },
    };

    this.state = {
      tableSchema,
      searchSchema,
      nowPage: 1,
      pageSize: 10,
    };
  }


  componentDidMount() {
    const { outboundDetailId, supplierOrganizationId } = this.props.dataSource;
    const offset = 0;
    const limit = 10;
    this.props.getOutboundAccountTransportList({ offset, limit, outboundDetailId, supplierOrganizationId }).then(() => {
      this.setState({
        nowPage: offset / limit + 1,
        pageSize: limit,
      });
    });
  }

  /**
   * 分页
   * @param pagination
   */
  onChange = (pagination) => {
    const { offset, limit, current } = translatePageType(pagination);
    const { outboundDetailId, supplierOrganizationId } = this.props.dataSource;
    const { rwb_carNo = null, rwb_deliveryNo = null, rwb_transportNo = null, rwb_deliveryStartTime = null, rwb_deliveryEndTime = null } = this.props.filter;

    this.setState({
      nowPage: current,
      pageSize: limit,
    });

    const newFilter = {
      offset, limit,
      carNo: rwb_carNo,
      deliveryNo: rwb_deliveryNo,
      transportNo: rwb_transportNo,
      deliveryStartTime: rwb_deliveryStartTime,
      deliveryEndTime: rwb_deliveryEndTime,
      outboundDetailId,
      supplierOrganizationId,
    };

    if (rwb_deliveryStartTime === null) {
      delete newFilter.deliveryStartTime;
    }

    if (rwb_deliveryEndTime === null) {
      delete newFilter.deliveryEndTime;
    }

    this.props.getOutboundAccountTransportList({ ...newFilter });
  }


  searchTableList = () => {
    const layout = {
      labelCol: {
        xs: { span: 24 },
        sm: { span: 8 },
        xl: { span: 6 },
      },
      wrapperCol: {
        xs: { span: 24 },
        sm: { span: 16 },
        xl: { span: 18 },
      },
    };
    return (
      <>
        <SearchForm layout="inline" {...layout} mode={FORM_MODE.SEARCH} schema={this.state.searchSchema}>
          <Item field="rwb_carNo" />
          <Item field="rwb_deliveryNo" />
          <Item field="rwb_transportNo" />
          <Item field="rwb_deliveryTime" />
          <div style={{ display: 'inline-block' }}>
            <DebounceFormButton label="查询" className="mr-10" type="primary" onClick={this.handleSearchBtnClick} />
            <DebounceFormButton label="重置" className="mr-10" onClick={this.handleResetBtnClick} />
          </div>
        </SearchForm>
      </>
    );
  }


  handleSearchBtnClick = (value) => {
    this.setState({
      nowPage: 1,
    });
    const deliveryStartTime = value.rwb_deliveryTime?.[0]?.set({
      hour: 0,
      minute: 0,
      second: 0,
      millisecond: 0,
    }).format('YYYY/MM/DD HH:mm:ss');
    const deliveryEndTime = value.rwb_deliveryTime?.[1]?.set({
      hour: 23,
      minute: 59,
      second: 59,
      millisecond: 999,
    }).format('YYYY/MM/DD HH:mm:ss');
    const { outboundDetailId, supplierOrganizationId } = this.props.dataSource;
    const { rwb_carNo = null, rwb_deliveryNo = null, rwb_transportNo = null } = value;

    const newFilter = this.props.setFilter({
      ...this.props.filter,
      rwb_deliveryStartTime: deliveryStartTime,
      rwb_deliveryEndTime: deliveryEndTime,
      offset: 0,
    });
    // 发请求
    this.props.getOutboundAccountTransportList(omit({
      ...newFilter,
      carNo: rwb_carNo,
      deliveryNo: rwb_deliveryNo,
      transportNo: rwb_transportNo,
      deliveryStartTime,
      deliveryEndTime,
      outboundDetailId,
      supplierOrganizationId,
    }, 'createTime'));
  }

  handleResetBtnClick = () => {
    const { outboundDetailId, supplierOrganizationId } = this.props.dataSource;
    const newFilter = this.props.resetFilter({ offset: 0 });
    this.setState({
      nowPage: 1,
      pageSize: 10,
    });
    this.props.getOutboundAccountTransportList({ ...newFilter, outboundDetailId, supplierOrganizationId });
  }


  handleCancel = (isReload) => {
    this.props.callback({
      isReload: isReload === 1 ? 1 : 2,
    });
  }

  patchData = () => {
    const { selectedRow = [] } = this.state;
    const { mode } = this.props;
    if (selectedRow.length !== 1) {
      return message.error('请选择一张运单执行此操作！');
    }
    const { transportCorrelationId } = selectedRow[0];
    const { outboundDetailId } = this.props.dataSource;
    const params = { outboundDetailId, transportCorrelationId };
    pathAccountOutboundMatchByOutboundDetailId(params).then(() => {
      notification.success({
        message: mode === FORM_MODE.ADD ? '关联成功' : '重新关联成功',
        description: mode === FORM_MODE.ADD ? '关联成功' : '重新关联成功',
      });
    }).then(() => {
      this.handleCancel(1);
    });
  }

  onSelectRow = (selectedRow) => {
    this.setState({
      selectedRow,
    });
  }

  render() {
    const { nowPage, pageSize } = this.state;
    const { outboundAccountTransportList, visible, mode } = this.props;

    return (
      <>
        <Modal
          centered
          destroyOnClose
          title='关联运单'
          width='1200px'
          maskClosable={false}
          visible={visible}
          onCancel={this.handleCancel}
          footer={null}
        >
          <Table
            rowKey="transportCorrelationId"
            multipleSelect
            onSelectRow={this.onSelectRow}
            renderCommonOperate={this.searchTableList}
            pagination={{ current: nowPage, pageSize }}
            onChange={this.onChange}
            schema={this.state.tableSchema}
            dataSource={outboundAccountTransportList}
          />

          <div style={{ textAlign: 'right', paddingRight: '120px' }}>
            <Button
              className="mr-10"
              onClick={this.patchData}
              type="primary"
            >{mode === FORM_MODE.ADD ? '关联' : '重新关联'}
            </Button>
            <Button onClick={this.handleCancel}>取消</Button>
          </div>
        </Modal>
      </>
    );
  }

}


