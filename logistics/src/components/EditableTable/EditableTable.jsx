import React, { Component } from 'react';
import { Form, Button, message } from 'antd';
import Table from '../Table/Table';
import EditableCell, { Provider } from './EditableCell';
import { isFunction, isEqual } from '../../utils/utils';

const tempRowKey = 'temp';
const defaultRowKey = 'id';

function isDatasourceEqual (nextDataSource = [], prevDataSource = [], rowKey) {
  if (nextDataSource.length !== prevDataSource.length) {
    return false;
  }

  return nextDataSource.every((nextItem, index) => {
    const prevItem = prevDataSource[index];
    return prevItem[rowKey] === nextItem[rowKey];
  });
}

@Form.create()
export default class EditableTable extends Component {
  constructor (props) {
    super(props);
    const { rowKey = defaultRowKey, dataSource, readOnly, isAbleToDelete, customOperations } = props;
    this.schema = {
      columns: readOnly ? props.columns : [...props.columns],
      operations: readOnly
        ? undefined
        : (record, index) => {
          const id = record[rowKey || defaultRowKey];
          const isEditingRow = id === this.state.editingRowKey;

          const deleteOperate = { title: '删除', onClick: () => this.deleteRecord(id) };
          const addOperate = { title: '添加', onClick: this.saveAdd };
          let operations = [];
          let otherOperations = [];
          if (customOperations && isFunction(customOperations)){
            otherOperations = customOperations(record);
          }
          let enable = true;
          if (isFunction(isAbleToDelete)){
            enable = isAbleToDelete(record);
          }
          if (isEditingRow){
            operations = [addOperate, deleteOperate];
          } else if (enable){
            operations = [...otherOperations, deleteOperate];
          } else {
            operations = [...otherOperations];
          }
          return operations;
        }
    };

    this.state = {
      editing: false,
      editingRowKey: undefined,
      dataSource
    };
  }

  componentWillReceiveProps (nextProps) {
    const { dataSource: nextDataSource } = nextProps;
    if (!isEqual(nextDataSource, this.props.dataSource)) {
      this.setState({
        editing: false,
        editingRowKey: undefined,
        dataSource: nextDataSource
      });
    }
  }

  saveAdd = () => {
    const { form, onAdd, onChange } = this.props;
    form.validateFields((error, value) => {
      if (error) {
        const key = Object.keys(error).find(key => error[key].errors.length);
        return message.error(error[key].errors[0].message);
      }

      if (isFunction(onAdd)) {
        onAdd(value)
          .then(newRecord => {
            let nextDataSource = [...this.state.dataSource.slice(0, -1)];
            // 点击【添加】产生的temp数据总是在最后一条，因此直接替换最后一条数据即可
            if (newRecord){
              nextDataSource = [...this.state.dataSource.slice(0, -1), newRecord];
            }
            this.setState({ editing: false, editingRowKey: undefined, dataSource: nextDataSource }, () => {
              isFunction(onChange) && onChange(nextDataSource);
            });
          })
          .catch((err)=>{
            console.log(err);
          });

      }
    });
  }

  addRecord = () => {
    if (this.state.editing) return false;

    const { beforeAddRow } = this.props;
    const { dataSource = [] } = this.state;
    const { rowKey = defaultRowKey } = this.props;
    const nextDataSource = [...dataSource, { [rowKey]: tempRowKey }];

    if (beforeAddRow && isFunction(beforeAddRow)){
      const stop = beforeAddRow();
      // 必须是全等
      if (stop === true) return;
    }
    this.setState({
      dataSource: nextDataSource,
      editing: true,
      editingRowKey: tempRowKey
    });
  }

  deleteRecord = id => {
    const { rowKey = defaultRowKey, onChange, afterDeleteRow } = this.props;
    const { editingRowKey, dataSource, editing } = this.state;
    if (editing === true && editingRowKey !== id){
      return message.error('表格编辑状态下不可删除已有数据');
    }
    const nextDataSource = dataSource.filter(item => item[rowKey] !== id);
    const nextState = editingRowKey === id
      ? {
        editing: false,
        editingRender: undefined,
        dataSource: nextDataSource
      }
      : {
        dataSource: nextDataSource
      };
    if (afterDeleteRow && isFunction(afterDeleteRow)){
      afterDeleteRow();
    }
    isFunction(onChange) && onChange(nextDataSource);
    this.setState(nextState);
  }

  changeEditStatus = () => this.setState({ editing: !this.state.editing })

  render () {
    const { form, rowKey = defaultRowKey, readOnly, hide, addModal, minWidth, ...restProps } = this.props;
    const { editing, dataSource } = this.state;
    const components = {
      body: { cell: EditableCell }
    };
    this.schema.variable=true;
    this.schema.minWidth=minWidth||1700;
    this.schema.columns.forEach(col => {
      const isEditable = !!col.editingRender;
      isEditable && (col.onCell = (record, index) => {
        const { editing, editingRowKey } = this.state;
        const isEditing = editing && editingRowKey === record[rowKey];
        return {
          record,
          index,
          field: col.dataIndex || col.key,
          componentRender: col.editingRender,
          isEditing
        };
      });
    });
    const hideCls = hide ? 'displayNone' : '';
    return (
      <div className={hideCls}>
        <Provider value={form}>
          <Table schema={this.schema} rowKey={rowKey} {...restProps} dataSource={{ items: dataSource }} components={components} />
        </Provider>
        {
          readOnly || <Button disabled={editing} className="mt-20" onClick={addModal || this.addRecord} block type="dashed" icon="plus">添加</Button>
        }
      </div>
    );
  }
}
