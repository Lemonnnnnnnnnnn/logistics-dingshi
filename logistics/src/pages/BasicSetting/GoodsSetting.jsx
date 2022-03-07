import React, { Component } from 'react';
import { Button, Row, Modal, notification } from "antd";
import { connect } from 'dva';
import { SchemaForm, Item, FORM_MODE, Observer } from '@gem-mine/antd-schema-form';
import DebounceFormButton from '@/components/DebounceFormButton';
import Table from '@/components/Table/Table';
import { pick, translatePageType, MapTreeData, getLocal } from '@/utils/utils';
import goodsModel from '@/models/goods';
import categoryModel from '@/models/category';
import SearchForm from '@/components/Table/SearchForm2';
import TableContainer from '@/components/Table/TableContainer';
import GoodsInput from './component/GoodsInput';
import '@gem-mine/antd-schema-form/lib/fields';
import auth from '@/constants/authCodes';

const { GOODS_SETTING_MODIFY, GOODS_SETTING_DELETE, GOODS_SETTING_CREATE } = auth;

const { actions: { getGoods, postGoods, patchGoods, detailGoods } } = goodsModel;
const { actions: { getCategory } } = categoryModel;

function mapStateToProps (state) {
  return {
    goodsItem: pick(state.goods, ['items', 'count']),
    category: state.category.items,
    entity: state.goods.entity,
    commonStore: state.commonStore,
  };
}

@connect(mapStateToProps, { getGoods, getCategory, postGoods, patchGoods, detailGoods })
@TableContainer({})
class GoodsSetting extends Component {

  currentTab = this.props.commonStore.tabs.find(item => item.id === this.props.commonStore.activeKey);

  localData = getLocal(this.currentTab.id) || { formData: {} };

  form = null;

  tableSchema = {
    variable: true,
    minWidth: 1700,
    columns: [
      {
        title: '货品名称',
        dataIndex: 'goods',
        render: (text, record) => {
          let _text = `${record.categoryName}-${record.goodsName}`;
          if (record.specificationType) _text += `-${record.specificationType}`;
          if (record.materialQuality) _text += `-${record.materialQuality}`;
          return <div>{_text}</div>
          ;
        },
        fixed: 'left',
        width: '350px'
      }, {
        title: '货品类目',
        dataIndex: 'categoryName',
      }, {
        title: '品牌名称',
        dataIndex: 'goodsName',
      }, {
        title: '规格型号',
        dataIndex: 'specificationType',
        render: (text) => {
          if (text === null) {
            return '--';
          }
          return text;
        }
      }, {
        title: '材质',
        dataIndex: 'materialQuality',
        render: (text) => {
          if (text === null) {
            return '--';
          }
          return text;
        }
      }, {
        title: '包装方式',
        dataIndex: 'packagingMethod',
        render: (text) => {
          let word = '--';
          if (text === 1) {
            word = '袋装';
          } else if (text === 2) {
            word = '散装';
          }
          return word;
        }
      }
    ],
    operations: () => [
      {
        title: '修改',
        onClick: (record) => {
          this.entity = { ...record, categoryId: this.getCategoryIds(record.categoryId) };
          this.props.detailGoods({ goodsId: record.goodsId })
            .then(() => {
              this.setState({
                mode: FORM_MODE.MODIFY,
                visible: true
              });
            });
        },
        auth : GOODS_SETTING_MODIFY
      },
      {
        title: '删除',
        confirmMessage: (record) => `确定删除${record.categoryName}-${record.goodsName}吗？`,
        onClick: (record) => {
          this.props.patchGoods({ goodsId: record.goodsId, isEffect: 0 })
            .then(() => {
              if (this.props.goodsItem.items.length === 1 && this.props.filter.offset !== 0) {
                const newFilter = this.props.setFilter({ ...this.props.filter, offset: this.props.filter.offset - this.props.filter.limit });
                this.setState({
                  nowPage: this.state.nowPage - 1
                });
                this.props.getGoods({ ...newFilter });
              } else {
                this.props.getGoods({ ...this.props.filter });
              }
            });
        },
        auth : GOODS_SETTING_DELETE
      }
    ]
  }

  formLayout = {
    wrapperCol: { span: 18 },
    labelCol: { span: 6 }
  }

  constructor (props) {
    super(props);
    this.entity = {};
    const formSchema = {
      goods: {
        label: '货品名称',
        component: GoodsInput,
        category: () => this.props.category,

        visible: Observer({
          watch: '*mode',
          action: (mode) => (mode === FORM_MODE.MODIFY)
        })
      },
      categoryId: {
        label: '货品类目',
        component: 'cascader',
        placeholder: '请选择货品类目',
        rules: {
          required: [true, '请选择货品类目']
        },
        options: () => new MapTreeData(this.props.category, { privateKey: 'categoryId', labelKey: 'categoryName' }).getItemTree()
      },
      goodsName: {
        label: '货品品牌',
        component: 'input',
        placeholder: '请输入货品品牌',
        maxLength: 30,
        rules: {
          required: true,
          max: 30
        }
      },
      materialQuality: {
        label: '材质（选填）',
        component: 'input',
        placeholder: '请输入材质',
        maxLength: 30,
        rules: {
          max: 30
        }
      },
      specificationType: {
        label: '规格型号（选填）',
        component: 'input',
        maxLength: 30,
        placeholder: '请输入规格型号',
        rules: {
          max: 30
        }
      },
      packagingMethod: {
        label: '包装方式（选填）',
        component: 'select',
        placeholder: '请选择包装方式',
        options: [{
          label: '袋装',
          key: 1,
          value: 1
        }, {
          label: '散装',
          key: 2,
          value: 2
        }]
      }
    };
    this.state = {
      visible: false,
      formSchema,
      nowPage: 1,
      pageSize: 10
    };
  }

  componentDidMount () {
    const { localData = { formData: {} } } = this;
    const params = {
      ...localData.formData,
      goodsName: localData.formData.searchKey || undefined,
      offset: localData.nowPage ? localData.pageSize * ( localData.nowPage - 1 ) : 0,
      limit: localData.pageSize ? localData.pageSize : 10,
    };
    this.setState({
      nowPage: localData.nowPage || 1,
      pageSize: localData.pageSize || 10,
    });
    this.props.setFilter({ ...params });
    const authLocal = JSON.parse(localStorage.getItem('ejd_authority'));
    this.createPermission = authLocal.find(item => item.permissionCode === GOODS_SETTING_CREATE);

    this.props.getGoods({ ...params });
    this.props.getCategory();
  }

  componentWillUnmount() {
    // 页面销毁的时候自己 先移除原有的 再存储最新的
    const formData = this.form ? this.form.getFieldsValue() : null;
    localStorage.removeItem(this.currentTab.id);
    if (getLocal('local_commonStore_tabsObj').tabs.length > 1) {
      localStorage.setItem(this.currentTab.id, JSON.stringify({
        formData: { ...formData },
        pageSize: this.state.pageSize,
        nowPage: this.state.nowPage,
      }));
    }
  }

  getCategoryIds = leafId => {
    const { category } = this.props;
    const result = [leafId];
    let node = category.find(item => item.categoryId === leafId);

    // todo 需要说明,可能可以优化
    while (node && node.parentId) {
      result.unshift(node.parentId);
      node = category.find(item => item.categoryId === node.parentId);
    }

    return result;
  }

  onChange = (pagination) => {
    const { offset, limit, current } = translatePageType(pagination);
    this.setState({
      nowPage: current,
      pageSize: limit
    });
    const newFilter = this.props.setFilter({ offset, limit });
    this.props.getGoods({ ...newFilter });
  }

  searchSchema = {
    searchKey: {
      label: '搜索',
      placeholder: '请输入品牌名称',
      component: 'input',
      observer: Observer({
        watch: '*localData',
        action: (itemValue, { form }) => {
          if (this.form !== form) {
            this.form = form;
          }
          return { };
        }
      }),
    }
  }

  searchTableList = () => {
    const formLayOut = {
      labelCol:{
        xs: { span: 6 }
      },
      wrapperCol: {
        xs: { span: 18 }
      }
    };
    return (
      <SearchForm {...formLayOut} layout="inline" schema={this.searchSchema} mode={FORM_MODE.SEARCH}>
        <Item field="searchKey" />
        <DebounceFormButton label="查询" type="primary" onClick={this.handleSearchBtnClick} />
      </SearchForm>
    );
  }

  handleSearchBtnClick = () => {
    this.setState({
      nowPage: 1
    });
    const newFilter = this.props.setFilter({ ...this.props.filter, goodsName: this.props.filter.searchKey, offset: 0 });
    this.props.getGoods({ ...newFilter });
  }

  showModal = () => {
    this.setState({
      visible: true,
      mode: FORM_MODE.ADD
    });
  }

  handleCancel = () => {
    this.setState({
      visible: false,
    });
  }

  getEntity = () => {
    const { entity } = this.props;
    const { mode } = this.state;
    if (mode === FORM_MODE.MODIFY) {
      if (this.entity.goodsId !== entity.goodsId) {
        this.entity = { ...entity, categoryId: this.getCategoryIds(entity.categoryId) };
      }
      return this.entity;
    }
    return {};
  }

  postData = (formData) => {
    const newCategoryId = formData.categoryId[formData.categoryId.length - 1];
    this.props.postGoods({ ...formData, categoryId: newCategoryId })
      .then(() => {
        const newFilter = this.props.setFilter({ ...this.props.filter, offset: 0 });
        this.props.getGoods({ ...newFilter });
        notification.success({
          message: '添加成功',
          description: `添加常用货品成功`,
        });
        this.handleCancel();
      });
  }

  patchData = (formData) => {
    const newCategoryId = formData.categoryId[formData.categoryId.length - 1];

    this.props.patchGoods({ ...formData, goodsId: this.props.entity.goodsId, categoryId: newCategoryId })
      .then(data => {
        notification.success({
          message: '修改成功',
          description: `修改常用货品成功`,
        });
        this.handleCancel();
        this.setState({
          nowPage: 1
        });
        return data;
      });
  }

  render () {
    const { goodsItem } = this.props;
    const { mode, formSchema, nowPage, pageSize } = this.state;
    const entity = this.getEntity();
    return (
      <>
        {this.createPermission &&
        <Row>
          <Button onClick={this.showModal} type='primary'>+ 添加货品</Button>
        </Row>}
        <Modal
          title="添加货品"
          visible={this.state.visible}
          destroyOnClose
          onCancel={this.handleCancel}
          maskClosable={false}
          centered
          footer={null}
        >
          <SchemaForm {...this.formLayout} layout="vertical" schema={formSchema} data={entity} mode={mode}>
            <Item field="goods" />
            <Item field="categoryId" />
            <Item field="goodsName" />
            <Item field="specificationType" />
            <Item field="materialQuality" />
            <Item field="packagingMethod" />
            <div style={{ padding: '5px 120px 0 0', textAlign: 'right' }}>
              <Button className="mr-10" onClick={this.handleCancel}>取消</Button>
              {mode === FORM_MODE.ADD ? <DebounceFormButton label="保存" validate type="primary" onClick={this.postData} /> : null}
              {mode === FORM_MODE.MODIFY ? <DebounceFormButton label="修改" validate type="primary" onClick={this.patchData} /> : null}
            </div>
          </SchemaForm>
        </Modal>
        <Table schema={this.tableSchema} rowKey="goodsId" renderCommonOperate={this.searchTableList} pagination={{ current: nowPage, pageSize }} onChange={this.onChange} dataSource={goodsItem} />
      </>
    );
  }
}

export default GoodsSetting;
