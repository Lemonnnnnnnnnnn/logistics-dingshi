import React, { Component } from 'react';
import { Button, notification } from 'antd';
import { Item, FORM_MODE } from '@gem-mine/antd-schema-form';
import { connect } from 'dva';
import router from 'umi/router';
import moment from 'moment';
import DebounceFormButton from '../../../components/debounce-form-button';
import models from '../../../models/group';
import Table from '../../../components/table/table';
import { translatePageType, pick } from '../../../utils/utils';
import TableContainer from '../../../components/table/table-container';
import SearchForm from '../../../components/table/search-form2';
import '@gem-mine/antd-schema-form/lib/fields';

const { actions } = models;

function mapStateToProps (state) {
  return {
    groupList: pick(state.groups, ['items', 'count'])
  };
}

@connect(mapStateToProps, actions)
@TableContainer()
class GroupList extends Component {

  tableSchema = {
    variable:true,
    minWidth:1700,
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
        title: '群组名称',
        dataIndex: 'groupName',
        width: 200,
        render:text => <div title={text} style={{ width: '200px', whiteSpace:'nowrap', overflow:'hidden', textOverflow:'ellipsis' }}>{text}</div>
      },
      {
        title: '成员',
        width:500,
        dataIndex: 'logisticsGroupDetailEntities',
        render: member => {
          const word = (member || []).map(item => item.groupMemberName).join(',');
          return <div title={word} style={{ width: '450px', whiteSpace:'nowrap', overflow:'hidden', textOverflow:'ellipsis' }}>{word}</div>;
        }
      },
      {
        title: '创建时间',
        width: 200,
        dataIndex: 'createTime',
        render: time => moment(time).format('YYYY.MM.DD HH:mm')
      },
      {
        title: '备注',
        dataIndex: 'remarks',
        render:text => <div title={text} style={{ width: '550px', whiteSpace:'nowrap', overflow:'hidden', textOverflow:'ellipsis' }}>{text}</div>
      },
    ],
    operations: (record) => {
      const { isAvailable } = record;
      const modify = {
        title: '修改',
        onClick: this.modifyGroup
      };
      const toggle = {
        title: isAvailable?'禁用':'启用',
        onClick: this.toggleGroup
      };
      return [modify, toggle];
    }
  }

  searchSchema = {
    searchKey: {
      label: '搜索',
      placeholder: '请输入群组名称或成员姓名',
      component: 'input'
    }
  }

  constructor (props) {
    super(props);

    this.state = {
      current: 1,
      pageSize: 10
    };
  }

  componentDidMount () {
    this.props.getGroups({
      limit: 10,
      offset: 0
    });
  }

  modifyGroup = (record) => {
    router.push(`group/groupSetting?mode=modify&groupId=${record.groupId}`);
  }

  addGroup = () => {
    router.push('group/groupSetting?mode=add');
  }

  toggleGroup = ({ groupId, isAvailable }) => {
    const { patchGroups, getGroups, filter } = this.props;

    patchGroups({
      groupId,
      isAvailable: isAvailable? 0 : 1
    })
      .then(()=> getGroups(filter))
      .then(()=> {
        notification.success({
          message: isAvailable?'禁用成功':'启用成功',
          description: isAvailable?'禁用群组成功':'启用群组成功',
        });
      });
  }

  onChange = (pagination) => {
    const { offset, limit, current } = translatePageType(pagination);
    this.setState({
      current,
      pageSize: limit
    });
    const newFilter = this.props.setFilter({ offset, limit });
    this.props.getGroups(newFilter);
  }

  searchTable = () => {
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
        <Item field='searchKey' />
        <DebounceFormButton type="primary" onClick={this.handleSearchBtnClick} />
        <Button style={{ marginLeft:'10px' }} onClick={this.handleResetBtnClick}>重置</Button>
      </SearchForm>
    );
  }

  handleSearchBtnClick = () => {
    this.setState({
      current:1
    });
    const { setFilter, filter, filter:{ searchKey }, getGroups } = this.props;
    const newFilter = setFilter({ ...filter, groupName:searchKey, offset:0 });
    getGroups({ ...newFilter });
  }

  handleResetBtnClick = () => {
    const newFilter=this.props.resetFilter({});
    this.setState({
      current:1,
      pageSize:10
    });
    this.props.getGroups({ ...newFilter });
  }

  render () {
    const { groupList } = this.props;
    const { current, pageSize } = this.state;
    return (
      <>
        <Button type='primary' onClick={this.addGroup}>+ 添加群组</Button>
        <Table
          rowKey="groupId"
          dataSource={groupList}
          schema={this.tableSchema}
          onChange={this.onChange}
          pagination={{ current, pageSize }}
          renderCommonOperate={this.searchTable}
        />
      </>
    );
  }
}

export default GroupList;
