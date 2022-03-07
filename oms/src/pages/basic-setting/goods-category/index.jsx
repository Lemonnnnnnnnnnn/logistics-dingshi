import React, { Component } from 'react';
import { FORM_MODE, SchemaForm, Item } from '@gem-mine/antd-schema-form';
import { Button, Modal, notification } from 'antd';
import { connect } from 'dva';
import DebounceFormButton from '../../../components/debounce-form-button';
import auth from '../../../constants/authCodes';
import Authorized from '../../../utils/Authorized';
import Table from '../../../components/table/table';
import categoryModel from '../../../models/category';
import { MapTreeData, isEqual, isEmpty } from '../../../utils/utils';
import '@gem-mine/antd-schema-form/lib/fields';

const {
  CATEGORY_SETTING_CREATE,
  CATEGORY_SETTING_MODIFY,
  CATEGORY_SETTING_DELETE
} = auth;

const { confirm } = Modal;
const { actions: { getCategory, postCategory, patchCategory, clearEntity, setDetail } } = categoryModel;
function mapStateToProps (state) {
  return {
    goodscategoytItems: state.category.items,
    category: state.category.entity
  };
}

@connect(mapStateToProps, { getCategory, postCategory, patchCategory, clearEntity, setDetail })
export default class GoodCategory extends Component {
  tableSchema = {
    columns: [
      {
        title: '类目名称',
        dataIndex: 'categoryName'
      }
    ],
    operations: record => {
      const { level } = record;
      const operations = [
        {
          title: '重命名',
          auth:[CATEGORY_SETTING_MODIFY],
          onClick: record => {
            this.props.setDetail(record);
            this.setState({
              mode: FORM_MODE.MODIFY,
              visible: true,
              parentId: record.parentId,
              entity: record
            });
          },
        },
        {
          title: '删除',
          auth:[CATEGORY_SETTING_DELETE],
          onClick: record => {
            // TODO 删除
            confirm({
              title: '删除提示',
              content: `是否删除当前货品-${record.categoryName}`,
              okText: '确定',
              cancelText: '取消',
              onOk: () => {
                this.handleDetele(record);
              },
              onCancel: () => { }
            });
          },
        },
        {
          title: '添加子类',
          auth:[CATEGORY_SETTING_CREATE],
          onClick: record => {
            // TODO 添加分类
            this.props.clearEntity();
            this.setState({
              visible: true,
              mode: FORM_MODE.ADD,
              parentId: record.categoryId
            });
          },
        },
      ];
      if (level === 'third') {
        operations.pop();
      }
      return operations;
    }
  }

  constructor (props) {
    super(props);

    const formSchema = {
      categoryName: {
        label: '名称',
        component: 'input',
        maxLength:12,
        rules: {
          required: [true, '请输入货品类目名称'],
          validator : ({ value })=>{
            if (value.indexOf('-') !== -1 || value.indexOf(',') !== -1){
              return '名称中不能包含 ", -"等特殊字符 ';
            }
          }
        },
        placeholder: '请输入名称'
      }
    };

    this.state = {
      formSchema,
      visible: false,
      mode: FORM_MODE.ADD,
      expandedRowKeys: [],
      dataSource: {
        items: [],
        count: 0
      },
      parentId: 0, // 当前的父节点ID 最高层为0
      entity: {} // 详情数据
    };
  }

  componentDidMount () {
    this.props.getCategory();
    if (!isEmpty(this.props.goodscategoytItems)) {
      this.fetchData(this.props.goodscategoytItems, true);
    }
  }

  componentWillReceiveProps (nextProps) {
    if (!isEqual(this.props.goodscategoytItems, nextProps.goodscategoytItems) && !isEmpty(nextProps.goodscategoytItems)) {
      this.fetchData(nextProps.goodscategoytItems);
    }
  }

  // 组装数据
  fetchData = (data, firstRender = false) => {
    const dataSource = this.getTableData(data);
    const { expandedRowKeys } = this.state;
    dataSource.items.forEach(item => {
      if (firstRender) {
        expandedRowKeys.push(item.categoryId);
      }
      item.children && item.children.forEach(itm => {
        itm.children && itm.children.forEach(v => {
          v.level = 'third';
        });
      });
    });
    this.setState({
      dataSource,
      expandedRowKeys
    });
  }

  // 表格顶部操作按钮
  operateTable = () => {
    const btnStyle = { marginRight: 15 };
    return (
      <div>
        <Authorized authority={[CATEGORY_SETTING_CREATE]}>
          <Button style={btnStyle} type='primary' onClick={this.handleAdd}>+ 添加一级分类</Button>
        </Authorized>
        <Button style={btnStyle} onClick={this.handleExpandAll}>全部展开</Button>
        <Button onClick={this.handleCloseAll}>全部收起</Button>
      </div>
    );
  }

  // 全部展开
  handleExpandAll = () => {
    const { goodscategoytItems } = this.props;
    const expandedRowKeys = (goodscategoytItems && goodscategoytItems.map(v => v.categoryId)) || [];
    this.setState({ expandedRowKeys });
  }

  // 全部收起
  handleCloseAll = () => {
    this.setState({ expandedRowKeys: [] });
  }

  // 添加弹窗
  handleAdd = () => {
    this.props.clearEntity();
    this.setState({
      visible: true,
      parentId: 0,
      mode: FORM_MODE.ADD
    });
  }

  // 关闭弹窗
  handleCancel = () => {
    this.setState({
      visible: false
    });
  }

  // 表格展开
  handleExpand = (expanded, record) => {
    const { expandedRowKeys } = this.state;
    if (expanded) {
      expandedRowKeys.push(record.categoryId);
    } else {
      const index = expandedRowKeys.indexOf(record.categoryId);
      expandedRowKeys.splice(index, 1);
    }
    this.setState({
      expandedRowKeys
    });
  }

  // 删除类目
  handleDetele = record => {
    this.props.patchCategory({
      categoryId: record.categoryId,
      isEffect: 0
    }).then(result => {
      if (result) {
        notification.success({
          message: '删除成功！',
          description: `删除${record.categoryName}货品类目成功!`
        });
        this.props.getCategory();
      }
    });
  }

  getTableData = data => {
    const { itemTree } = new MapTreeData(data, { privateKey: 'categoryId' });
    return {
      items: itemTree && itemTree.children || [],
      count: itemTree && itemTree.children.length || 0
    };
  }

  handleSvaeBtnClick = value => {
    const { mode, parentId, entity } = this.state;
    const data = {
      ...value
    };
    if (mode === FORM_MODE.ADD) {
      data.parentId = parentId;
      this.props.postCategory(data).then(result => {
        if (result) {
          notification.success({
            message: '添加成功',
            description: `添加${value.categoryName}货品类目成功！`
          });
          this.setState({
            visible: false
          });
          this.props.getCategory();
        }
      });
    } else if (mode === FORM_MODE.MODIFY) {
      data.categoryId = entity.categoryId;
      this.props.patchCategory(data).then(result => {
        if (result) {
          notification.success({
            message: '修改成功',
            description: `修改${result.categoryName}货品类目成功！`
          });
          this.setState({
            visible: false
          });
          this.props.getCategory();
        }
      });
    }
  }

  render () {
    const { visible, formSchema, mode, expandedRowKeys, dataSource } = this.state;
    const { category } = this.props;
    const modalTitle = mode === FORM_MODE.ADD ? '添加子类类目' : '修改类目';

    return (
      <>
        <Table
          rowKey="categoryId"
          pagination={false}
          dataSource={dataSource}
          schema={this.tableSchema}
          onExpand={this.handleExpand}
          expandedRowKeys={expandedRowKeys}
          renderCommonOperate={this.operateTable}
        />
        <Modal
          title={modalTitle}
          footer={null}
          visible={visible}
          onCancel={this.handleCancel}
        >
          <SchemaForm
            layout='horizontal'
            mode={mode}
            data={category}
            schema={formSchema}
          >
            <Item field="categoryName" />
            <div style={{ paddingRight:'20px', textAlign: 'right' }}>
              <Button className="mr-10" onClick={this.handleCancel}>取消</Button>
              <DebounceFormButton label="保存" type="primary" onClick={this.handleSvaeBtnClick} />
            </div>
          </SchemaForm>
        </Modal>
      </>
    );
  }
}
