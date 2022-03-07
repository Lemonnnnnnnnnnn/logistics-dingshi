import React, { Component } from 'react';
import { Table, Pagination, Popconfirm, Checkbox, Row, Select } from 'antd';
import CSSModules from 'react-css-modules';
import { isArray, isFunction, xorBy, uniqBy } from '@/utils/utils';
import Authorized from '@/utils/Authorized';
import NormalizeSchema from '@/components/Table/normalize';
import styles from './SelectAllPageTable.less';

const pageSizeOptions = ['10', '20', '30', '50'];

const filterFunc = item => true;

@CSSModules(styles)
export default class SelectAllPageTable extends Component {
  state = {
    current: 1,
    pageSize: 10,
    selectedRows: [],
    schema: null,
    selectType : 2
  }

  constructor (props) {
    super(props);
    this.saveRef = ref => { this.refDom = ref; };
    this.normalizeSchema = new NormalizeSchema(props.schema);
    this.state.schema = props.schema;
    this.formatSchema(props.schema);
  }

  componentDidMount () {
    if (!this.normalizeSchema.ifVariable()) return;
    this.resize();
    window.addEventListener('resize', this.resize);
  }

  componentWillUnmount () {
    if (!this.normalizeSchema.ifVariable()) return;
    window.removeEventListener('resize', this.resize);
  }

  static getDerivedStateFromProps (props, state) {
    if (props.selectKey && props.selectKey.length !== 0 && state.selectedRows.length === 0) {
      state.selectedRows = props.selectKey;
    }
    return state;
  }

  formatSchema = (schema) => {
    if (!schema) return;
    const columns = schema.columns.filter(item=>!(item.visible===false));
    this.columns = [...columns];
    this.props.showIndex && this.columns.unshift({ title: '序号', dataIndex: 'index', render: (value, record, index) => index + 1 });
    // const hasFixedCol = schema.columns.some(col => col.fixed)
    const operations = this.getOperations(schema.operations, this.normalizeSchema.ifScroll());
    operations && this.columns.push(operations);


    // debugger
    this.pageConfig = {
      onChange: this.onChangePagination,
      onShowSizeChange: this.onChangePagination,
      pageSizeOptions,
      showSizeChanger: true,
      showQuickJumper: true,
      style: { marginTop: '10px' },
      showTotal: this.showTotal
    };
  }

  resize = () => {
    const { clientWidth } = this.refDom;
    const { clientHeight } = this.refDom.getElementsByClassName("ant-table-tbody")[0];
    const newSchema = this.normalizeSchema.format(clientWidth, clientHeight);
    this.formatSchema(newSchema);
    this.setState({
      schema: newSchema
    });
  }

  renderOperations = (operations, record, index) => operations.map(({ title, renderTitle, onClick, auth, confirmMessage }, operationIndex, items) => {
    const isLast = operationIndex === items.length - 1;
    const cls = isLast ? styles['operation-item'] : `mr-10 ${styles['operation-item']}`;
    const state = { ...this.state };
    let word = title;
    let message;
    if (renderTitle && isFunction(renderTitle)) {
      word = renderTitle(record);
    }

    if (confirmMessage) {
      message = isFunction(confirmMessage) ? confirmMessage(record) : confirmMessage;
    }

    return (
      <Authorized key={operationIndex} authority={auth}>
        {
          confirmMessage
            ? <Popconfirm title={message} onConfirm={() => onClick(record, index, state)}><a className={cls}>{word}</a></Popconfirm>
            : <a className={cls} onClick={() => onClick(record, index, state)}>{word}</a>
        }
      </Authorized>
    );
  })

  getOperations = (operations, fixed = false) => {
    if (isArray(operations)) {
      return {
        title: '操作',
        dataIndex: 'operate',
        fixed: fixed ? 'right' : false,
        width: operations.length * 50 + 40,
        render: (id, record, index) => this.renderOperations(operations, record, index)
      };
    } if (isFunction(operations)) {
      return {
        title: '操作',
        dataIndex: 'operate',
        fixed: fixed ? 'right' : false,
        width: '50px',
        render: (id, record, index) => {
          const _operations = operations(record, index);
          return this.renderOperations(_operations, record, index);
        }
      };
    }

    return null;
  }


  onSelectRow = (record, selected) => {
    const { onSelectRow, rowKey } = this.props;
    const { selectedRows: _selectedRows } = this.state;
    let row = [];
    if (selected) { // 当勾选时
      this.setState({ selectedRows: [..._selectedRows, record] });
    } else { // 当取消勾选时
      row = xorBy(_selectedRows, [record], rowKey);
      this.setState({ selectedRows: row });
    }

    if (onSelectRow && isFunction(onSelectRow)) {
      if (selected) { // 当勾选时
        onSelectRow([..._selectedRows, record], selected, record);
      } else { // 当取消勾选时
        // TODO 可以用filter代替
        onSelectRow(row, selected, record);
      }
    }
  }


  // onSelectAll = (selected, selectedRows) => {
  //   const { onSelectAll, rowKey, dataSource: { items:_items }, filterItems=filterFunc } = this.props
  //   const items = _items.filter(filterItems)
  //   const { selectedRows: _selectedRows } = this.state
  //   let row = []
  //   if (selected) { // 当勾选时
  //     row = uniqBy([..._selectedRows, ...selectedRows], rowKey)
  //     this.setState({ selectedRows: row })
  //   } else { // 当取消勾选时
  //     // xorBy的作用，对象数组同键值的项会被去除， 类似对象数组的减法 例：参数1：[{x:1}, {x:2}] 参数2：[{x:2}]  参数3：x => [x:1]
  //     row = xorBy(_selectedRows, items, rowKey)
  //     this.setState({ selectedRows: row })
  //   }
  //
  //   if (onSelectAll && isFunction(onSelectAll)) {
  //     onSelectAll(selected)
  //   }
  // }

  onSelectOnePage = ({ target : { checked } }) =>{
    const { selectType } = this.state;
    // 数据异步更新，这里取不到最新的数据，把全选按钮的状态放在外层管理
    if (selectType === 1){
      const { onSelectTotal } = this.props;
      if (onSelectTotal && isFunction(onSelectTotal)) {
        onSelectTotal(checked);
      }
    } else if (selectType === 2){
      const { onSelectOnePage } = this.props;
      if (onSelectOnePage && isFunction(onSelectOnePage)) {
        onSelectOnePage(checked);
      }
    }

  }

  showTotal = (total, range) => {
    const { pageSize } = this.state;
    const _showTotal = (total, [start], pageSize) => {
      const maxPage = Math.ceil(total / pageSize);
      const current = Math.ceil(start / pageSize);
      return <span className="mr-20">{`共 ${total} 条记录 第 ${current} / ${maxPage} 页`}</span>;
    };

    return _showTotal(total, range, pageSize);
  }

  isChangePage = ({ current, pageSize }) => {
    const { current: oldPageNum, pageSize: oldPageSize } = this.state;
    const result = oldPageNum !== current || oldPageSize !== pageSize;
    this.setState({ current, pageSize });

    return result;
  }

  onChangePagination = (page, pageSize) => {
    const { current, pageSize: currentPageSize } = this.state;
    const nextState = { current, pageSize: currentPageSize };

    page && (nextState.current = page);
    pageSize && (nextState.pageSize = pageSize);
    this.setState(nextState);
  }

  onChange = (...args) => {
    const { onChange } = this.props;

    // this.setState({ selectedRows: [] })
    typeof onChange === 'function' && onChange(...args);
  }

  onChangeSelectType = (selectType) =>{
    this.setState({ selectType });
  }

  resetSelectedRows = (row = []) => {
    this.setState({
      selectedRows: row
    });
  }

  render () {
    const { renderCommonOperate, dataSource: { items = [], count }, rowKey = 'id', multipleSelect, selectKey = [], pagination, getCheckboxProps, selectOnePageChecked, ...lastProps } = this.props;
    const { pageSize, current, selectedRows } = this.state;
    const _selectedRows = [...selectKey, ...selectedRows];
    const rowSelection = multipleSelect
      ? {
        getCheckboxProps,
        selectedRowKeys: _selectedRows.map(row => row[rowKey]),
        onSelect: this.onSelectRow,
        // onSelectAll: this.onSelectAll,
        hideDefaultSelections : true,
        columnTitle: (
          <div className={styles.columnTitle}>
            <Checkbox style={{ float : 'left', marginRight : '5px' }} checked={selectOnePageChecked} onChange={this.onSelectOnePage} />
            <Select onChange={this.onChangeSelectType} defaultValue={2}>
              <Select.Option value={1}>所有页</Select.Option>
              <Select.Option value={2}>当前页</Select.Option>
            </Select>
          </div>
        ),
      }
      : null;
    this.pageConfig.total = count;
    this.pageConfig.current = this.state.current;
    const _pagination = 'pagination' in this.props
      ?
      pagination
        ?
        { ...this.pageConfig, ...pagination }
        :
        pagination
      : this.pageConfig;

    const scroll = this.normalizeSchema.getScroll();
    const _props = {
      rowKey,
      tableLayout:'auto',
      ...lastProps,
      rowSelection,
      onChange: this.onChange,
      columns: this.columns,
      dataSource: items,
      pagination: _pagination,
      ...scroll
    };
    return (
      <div ref={this.saveRef}>
        <div styleName="table-operatorBar">{typeof renderCommonOperate === 'function' && renderCommonOperate({ current, pageSize, selectedRows })}</div>
        <Table {..._props} />
      </div>
    );
  }
}
