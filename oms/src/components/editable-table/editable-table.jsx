import React, { Component } from 'react';
import { Form, Button, message } from 'antd';
import Table from '../table/table';
import EditableCell, { Provider } from './editable-cell';
import { isFunction, isEqual, cloneDeep, assign } from '../../utils/utils';

const tempRowKey = 'temp';
const defaultRowKey = 'id';


@Form.create()
export default class EditableTable extends Component {
  constructor(props) {
    super(props);
    const { rowKey = defaultRowKey, dataSource, readOnly, modifyable, isAbleToDelete, customOperations } = props;
    this.schema = {
      columns: readOnly ? props.columns : [...props.columns],
      operations: readOnly
        ? undefined
        : (record, _) => {
          const id = record[rowKey || defaultRowKey];
          const isEditingRow = id === this.state.editingRowKey;
          const deleteOperate = { title: '删除', onClick: () => this.deleteRecord(id) };
          const addOperate = { title: '添加', onClick: this.saveAdd };

          //   const { modifyableCol } = props;

          const editOperate = { title: '修改', onClick: () => this.edit(id, record) };
          const confirmOperate = { title: '确认', onClick: () => this.confirm(id) };
          const cancelOperate = { title: '取消', onClick: this.cancel };

          let operations = [];
          // 添加自定义的操作按钮
          let otherOperations = [];
          if (customOperations && isFunction(customOperations)) {
            otherOperations = customOperations(record);
          }
          // 判断是否可删除
          let enable = true;
          if (isFunction(isAbleToDelete)) {
            enable = isAbleToDelete(record);
          }

          // 是否可以修改

          if (isEditingRow) { // 是否为当前编辑行
            if (this.state.adding) {
              operations = [addOperate, deleteOperate];
            } else if (this.state.modifying) {
              operations = [...otherOperations, cancelOperate, confirmOperate];
            }
          } else if (modifyable) {
            operations = [...otherOperations, deleteOperate, editOperate];
          } else if (enable) { // 是否可删除
            operations = [...otherOperations, deleteOperate];
          } else {
            operations = [...otherOperations];
          }

          return operations;
        }
    };

    // modifying = false;

    this.state = {
      adding: false,
      modifying: false,
      editingRowKey: undefined,
      dataSource
    };
  }

  componentWillReceiveProps(nextProps) {
    const { dataSource: nextDataSource } = nextProps;
    if (!isEqual(nextDataSource, this.props.dataSource)) {
      this.setState({
        adding: false,
        editingRowKey: undefined,
        dataSource: nextDataSource
      });
    }
  }

    confirm = (id) => {
      const { form, onModify, onChange, rowKey } = this.props;
      form.validateFields((error, value) => {
        if (error) {
          const key = Object.keys(error).find(key => error[key].errors.length);
          return message.error(error[key].errors[0].message);
        }

        if (isFunction(onModify)) {
          onModify(value)
            .then(newRecord => {
              const { dataSource } = this.state;

              const nextDataSource = cloneDeep(dataSource);
              const editItem = nextDataSource.find(item=>item[rowKey] === id);
              assign(editItem, newRecord);

              this.setState({ modifying: false, editingRowKey: undefined, dataSource: nextDataSource }, () => {
                isFunction(onChange) && onChange(nextDataSource);
              });
            });
        }
        this.setState({ modifying: false, editingRowKey: undefined });
      });
    }

    cancel = () => {
      this.setState({ modifying: false, editingRowKey: undefined });
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
              if (newRecord) {
                nextDataSource = [...this.state.dataSource.slice(0, -1), newRecord];
              }
              this.setState({ adding: false, editingRowKey: undefined, dataSource: nextDataSource }, () => {
                isFunction(onChange) && onChange(nextDataSource);
              });
            });
        }
      });
    }

    edit = (id) => {
      const { beforeModify } = this.props;
      if (beforeModify && isFunction(beforeModify)) {
        const stop = beforeModify();
        // 必须是全等
        if (stop === true) return;
      }
      this.setState({ modifying: true, editingRowKey: id });
    }

    addRecord = () => {
      if (this.state.adding) return false;

      const { beforeAddRow } = this.props;
      const { dataSource = [] } = this.state;
      const { rowKey = defaultRowKey } = this.props;
      const nextDataSource = [...dataSource, { [rowKey]: tempRowKey }];

      if (beforeAddRow && isFunction(beforeAddRow)) {
        const stop = beforeAddRow();
        // 必须是全等
        if (stop === true) return;
      }

      this.setState({
        dataSource: nextDataSource,
        adding: true,
        editingRowKey: tempRowKey
      });
    }

    deleteRecord = id => {
      const { rowKey = defaultRowKey, onChange, afterDeleteRow } = this.props;
      const { editingRowKey, dataSource, adding } = this.state;
      if (adding === true && editingRowKey !== id) {
        return message.error('表格编辑状态下不可删除已有数据');
      }
      const nextDataSource = dataSource.filter(item => item[rowKey] !== id);
      const nextState = editingRowKey === id
        ? {
          adding: false,
          editingRender: undefined,
          dataSource: nextDataSource
        }
        : {
          dataSource: nextDataSource
        };
      if (afterDeleteRow && isFunction(afterDeleteRow)) {
        afterDeleteRow();
      }
      isFunction(onChange) && onChange(nextDataSource);
      this.setState(nextState);
    }

    changeEditStatus = () => this.setState({ adding: !this.state.adding })

    render() {
      const { form, rowKey = defaultRowKey, readOnly, hide, addModal, minWidth, ...restProps } = this.props;

      const { adding, dataSource } = this.state;
      const components = {
        body: { cell: EditableCell }
      };
      this.schema.variable = true;
      this.schema.minWidth = minWidth || 1700;
      this.schema.columns.forEach(col => {
        const isEditable = !!col.editingRender; // 如果某列没有editingRender，表示不可编辑
        isEditable && (col.onCell = (record, index) => { // 如果可编辑，找到编辑行，并改变状态
          const {  editingRowKey } = this.state;
          const isEditing= editingRowKey === record[rowKey];

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
            readOnly || <Button disabled={adding} className="mt-20" onClick={addModal || this.addRecord} block type="dashed" icon="plus">添加</Button>
          }
        </div>
      );
    }
}
