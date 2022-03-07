import React from 'react';
import { notification, Modal, Button, Popover } from 'antd';
import { SchemaForm, Item, FormButton, FORM_MODE } from '@gem-mine/antd-schema-form';
import CSSModules from 'react-css-modules';
import router from 'umi/router';
import DebounceFormButton from '@/components/DebounceFormButton';
import '@gem-mine/antd-schema-form/lib/fields';
import BindStore from '@/utils/BindStore';
import Table from '@/components/Table/Table';
import TableContainer from '@/components/Table/TableContainer';
import { translatePageType } from '@/utils/utils';
import { patchTradingScheme } from '@/services/apiService';
import SearchForm from '@/components/Table/SearchForm2';

@BindStore('tradingSchemes', {
  mapStateToProps: state => {
    const { entity, items, count } = state;
    entity.roleItems || (entity.roleItems = []);
    return {
      entity,
      items,
      count
    };
  }
})
@TableContainer()
export default class LogisticsTransaction extends React.Component{
  state = {
    pageSize: 10,
    nowPage: 1,
  }

  tableSchema = {
    variable: true,
    minWidth : 1500,
    columns: [
      {
        title: '状态',
        dataIndex: 'isAvailable',
        width: 100,
        render: isAvailable => {
          const { color, text } = isAvailable ? { color: 'green', text: '启用' } : { color: 'gray', text: '禁用' };
          return <span style={{ color }}>● {text}</span>;
        }
      },
      {
        title: '交易方案名称',
        dataIndex: 'tradingSchemeName',
        width: 300,
        render: (text, record) => {
          const { tradingSchemeName } = record;
          if (!tradingSchemeName) return '--';
          return (
            <Popover content={tradingSchemeName} placement="topLeft">
              <span style={{ width: '300px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', display: 'inline-block' }}>
                {tradingSchemeName}
              </span>
            </Popover>
          );
        }
      },
      {
        title: '交易方案代码',
        dataIndex: 'tradingSchemeCode',
      },
      {
        title: '交易方案描述',
        dataIndex: 'tradingSchemeDescription',
        width: 300,
        render: (text, record) => {
          const { tradingSchemeDescription } = record;
          if (!tradingSchemeDescription) return '--';
          return (
            <Popover content={tradingSchemeDescription} placement="topLeft">
              <span style={{ width: '300px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', display: 'inline-block' }}>
                {tradingSchemeDescription}
              </span>
            </Popover>
          );
        }
      },
      {
        title : '使用项目',
        dataIndex: 'projectName',
        render:text=>
          (
            <Popover content={text} placement="topLeft">
              <span style={{ width: '300px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', display: 'inline-block' }}>
                {text || '-'}
              </span>
            </Popover>)
      },

    ],
    operations: (record) => {
      const detail = {
        title: '详情',
        // auth:[USER_SETTING_MODIFY],
        onClick: this.openModifyStaffModal
      };
      const modify = {
        title : '修改',
        onClick: this.onModifyScheme
      };
      const enable = {
        title: '启用',
        // auth:[USER_SETTING_ENABLE],
        confirmMessage: () => `确定启用该配置方案吗？`,
        onClick: this.enableScheme
      };
      const disable = {
        title: '禁用',
        confirmMessage: () => `确定禁用该配置方案吗？`,
        // auth:[USER_SETTING_FORBID],
        onClick: this.disableScheme
      };


      // todo 根据状态显示【启用】|【禁用】
      return [detail, record.isAvailable ? disable : enable, modify];
    }
  }

  openModifyStaffModal = (record) => {
    router.push(`logisticsTransaction/detail?tradingSchemeId=${record.tradingSchemeId}`);
  }

  onModifyScheme = (record) => {
    router.push(`logisticsTransaction/modify?tradingSchemeId=${record.tradingSchemeId}`);
  }

  enableScheme = ({ tradingSchemeId }) => this.enableOrDisableScheme(tradingSchemeId, true)

  disableScheme = ({ tradingSchemeId }) => this.enableOrDisableScheme(tradingSchemeId, false)


  enableOrDisableScheme = (tradingSchemeId, isAvailable) => {
    patchTradingScheme(tradingSchemeId, { isAvailable })
      .then(() => {
        notification.success({ message: '操作成功', description: isAvailable ? '启用成功' : '禁用成功' });
        this.refresh();
      });
  }

  searchSchema = {
    tradingSchemeName: {
      label: '搜索',
      placeholder: '请输入交易方案',
      component: 'input'
    },
    projectName: {
      label: '项目名称',
      placeholder: '请输入项目名称',
      component: 'input'
    },
    isAvailable: {
      label: '状态',
      placeholder: '请选择状态',
      component: 'select',
      options : [
        {
          label : '启用',
          value : true,
          key : 1,
        },
        {
          label : '禁用',
          value : false,
          key : 2
        }
      ]
    },
    serviceChargeArr: {
      label: '费率填写项',
      placeholder: '请选择费率填写项',
      component: 'select',
      options : [
        {
          label :'货主发单手续费大于0',
          key : 1,
          value : 1
        },
        {
          label :'承运发单手续费大于0',
          key : 2,
          value : 2
        },
        {
          label :'司机发单手续费大于0',
          key : 3,
          value : 3
        },
      ]
    },
  }

  searchTable = ({ pageSize }) => {
    const layout = {
      labelCol: {
        xs: { span: 24 },
        sm: { span: 8 },
        xl: { span: 6 }
      },
      wrapperCol: {
        xs: { span: 24 },
        sm: { span: 16 },
        xl: { span: 18 }
      }
    };
    return (
      <SearchForm layout="inline" {...layout} schema={this.searchSchema} mode={FORM_MODE.SEARCH}>
        <Item field='tradingSchemeName' />
        <Item field='projectName' />
        <Item field='isAvailable' />
        <Item field='serviceChargeArr' />
        <DebounceFormButton label="查询" type="primary" onClick={(value) => this.handleSearchBtnClick(value, pageSize)} />
        <Button style={{ marginLeft : '1rem' }} onClick={this.handleResetBtnClick}>重置</Button>
      </SearchForm>
    );
  }

  handleResetBtnClick = () => {
    const newFilter = this.props.resetFilter({});
    this.setState({
      nowPage: 1,
      pageSize: 10
    });
    this.props.getTradingSchemes({ ...newFilter });
  }

  handleSearchBtnClick = (value, pageSize) => {
    const newFilter = this.props.setFilter({ ...value, limit: pageSize, offset: 0 });
    this.props.getTradingSchemes({ ...newFilter });
  }

  refresh = () => {
    const { getTradingSchemes, filter, setFilter } = this.props;
    const { offset = 0, limit = 10 } = filter;
    const newFilter = setFilter({ offset, limit });
    getTradingSchemes(newFilter);
  }

  onChangeList = pagination => {
    const { offset, limit, current } = translatePageType(pagination);
    this.setState({
      nowPage:current,
      pageSize:limit
    });
    const newFilter=this.props.setFilter({ offset, limit });
    this.props.getTradingSchemes({ ...newFilter });
  }

  componentDidMount () {
    this.refresh();
  }

  openAddStaffModal = () => {
    router.push('logisticsTransaction/add');
  }

  render () {
    const { items, count } = this.props;
    const { nowPage, pageSize } = this.state;
    return (
      <>
        <Button type='primary' onClick={this.openAddStaffModal}>+ 创建交易方案</Button>
        <Table
          rowKey="tradingSchemeId"
          dataSource={{ items, count }}
          schema={this.tableSchema}
          onChange={this.onChangeList}
          pagination={{ current: nowPage, pageSize }}
          renderCommonOperate={this.searchTable}
        />
      </>
    );
  }
}
