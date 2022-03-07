import React, { Component } from 'react';
import { Button, Row, Col, Input, Modal, List, Card, notification } from "antd";
import { Item, FORM_MODE, Observer } from '@gem-mine/antd-schema-form';
import { connect } from 'dva';
import DebounceFormButton from '../../components/debounce-form-button';
import { IS_AVAILABLE } from '../../constants/project/project';
import Table from '../../components/table/table';
import { pick, translatePageType, getLocal } from '../../utils/utils';
import cargoesModel from '../../models/organizations';
import consignmentRelationshipsModel from '../../models/consignmentRelationships';
import { getAllCargoes } from '../../services/apiService';
import SearchForm from '../../components/table/search-form2';
import TableContainer from '../../components/table/table-container';
import '@gem-mine/antd-schema-form/lib/fields';
import auth from '../../constants/authCodes';

const { CARGO_SETTING_DELETE, CARGO_SETTING_ADD } = auth;

const { actions: { getOrganizations } } = cargoesModel;
const { actions: { postConsignmentRelationships, deleteConsignmentRelationships } } = consignmentRelationshipsModel;

function mapStateToProps (state) {
  return {
    cargoes: pick(state.organizations, ['items', 'count']),
    commonStore: state.commonStore,
  };
}

@connect(mapStateToProps, { getOrganizations, postConsignmentRelationships, deleteConsignmentRelationships })
@TableContainer({ selectType: 2, organizationType: 3 })
class cargoesSetting extends Component {

  currentTab = this.props.commonStore.tabs.find(item => item.id === this.props.commonStore.activeKey);

  localData = getLocal(this.currentTab.id) || { formData: {} };

  form = null;

  tableSchema = {
    variable: true,
    minWidth: 1700,
    columns: [
      {
        title: '企业名称',
        dataIndex: 'organizationName',
        width: '350px',
        fixed: 'left'
      }, {
        title: '状态',
        dataIndex: 'isAvailable',
        render: (text) => {
          if (text === IS_AVAILABLE.ENABLE) {
            return (<span style={{ color: 'darkgreen' }}>可用</span>);
          } if (text === IS_AVAILABLE.DISABLE) {
            return (<span style={{ color: 'red' }}>不可用</span>);
          }
        }
      }, {
        title: '联系人',
        dataIndex: 'contactName',
      }, {
        title: '联系电话',
        dataIndex: 'contactPhone',
      }, {
        title: '详细地址',
        dataIndex: 'organizationAddress',
      }
    ],
    operations: [{
      title: '删除',
      confirmMessage: (record) => `确定删除${record.organizationName}吗？`,
      onClick: (record, index) => {
        this.props.deleteConsignmentRelationships({ consignmentRelationshipId: record.consignmentRelationshipId })
          .then(() => {
            if (this.props.cargoes.items.length===1&&this.props.filter.offset!==0){
              const newFilter = this.props.setFilter({ ...this.props.filter, offset:this.props.filter.offset-this.props.filter.limit });
              this.setState({
                nowPage:this.state.nowPage-1
              });
              this.props.getOrganizations({ ...newFilter });
            } else {
              this.props.getOrganizations({ ...this.props.filter });
            }
          });
      },
      auth : CARGO_SETTING_DELETE
    }]
  }

  constructor (props) {
    super(props);
    this.state = {
      visible: false,
      cargoesItems: [],
      nowPage:1,
      pageSize:10
    };
  }

  componentDidMount () {
    const { localData = { formData: {} } } = this;
    const params = {
      ...localData.formData,
      vagueSelect: localData.formData.searchKey || undefined,
      offset: localData.nowPage ? localData.pageSize * ( localData.nowPage - 1 ) : 0,
      limit: localData.pageSize ? localData.pageSize : 10,
    };
    this.setState({
      nowPage: localData.nowPage || 1,
      pageSize: localData.pageSize || 10,
    });
    this.props.setFilter({ ...params });
    const authLocal = JSON.parse(localStorage.getItem('authority'));
    this.createPermission = authLocal.find(item => item.permissionCode === CARGO_SETTING_ADD);

    this.props.getOrganizations({ ...params, selectType: 2, organizationType: 3 });
  }

  componentWillUnmount() {
    // 页面销毁的时候自己 先移除原有的 再存储最新的
    const formData = this.form ? this.form.getFieldsValue() : null;
    localStorage.removeItem(this.currentTab.id);
    if (getLocal('local_commonStore_tabs').tabs.length > 1) {
      localStorage.setItem(this.currentTab.id, JSON.stringify({
        formData: { ...formData },
        pageSize: this.state.pageSize,
        nowPage: this.state.nowPage,
      }));
    }
  }

  searchSchema = {
    searchKey:{
      label: '搜索',
      placeholder: '请输入企业名称',
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
      <SearchForm mode={FORM_MODE.SEARCH} {...formLayOut} layout="inline" schema={this.searchSchema}>
        <Item field="searchKey" />
        <DebounceFormButton label="查询" type="primary" onClick={this.handleSearchBtnClick} />
      </SearchForm>
    );
  }

  handleSearchBtnClick = (value) => {
    this.setState({
      nowPage:1
    });
    const { searchKey } = value;
    const newFilter = this.props.setFilter({ ...this.props.filter, vagueSelect:searchKey, offset:0 });
    this.props.getOrganizations({ ...newFilter });
  }

  showModal = () => {
    this.setState({
      visible: true,
    });
  }

  handleCancel = () => {
    this.setState({
      visible: false,
      cargoesItems:[]
    });
  }

  onChange = (pagination) => {
    const { offset, limit, current } = translatePageType(pagination);
    this.setState({
      nowPage:current,
      pageSize:limit
    });
    const newFilter = this.props.setFilter({ offset, limit });
    this.props.getOrganizations({ ...newFilter });
  }

  findAllCargoes = searchKey => {
    getAllCargoes({ searchKey, limit:1000, offset:0 })
      .then(data => {
        const cargoesItems = data.items.map(item => ({
          cargoesId: item.organizationId,
          title: item.organizationName,
          contactName: item.contactName,
          contactPhone: item.contactPhone,
          organizationAddress: item.organizationAddress,
          isUsed: item.isUsed
        }));
        this.setState({
          cargoesItems
        });
      });
  }

  renderItem = item => (
    <List.Item>
      <Card
        title={item.title}
        extra={item.isUsed
          ? <a href='#' style={{ color: 'gray' }}>已添加</a>
          : <a href='#' onClick={() => this.addCargoes(item.cargoesId)}>添加</a>}
      >
        <Row>
          <Col span={8}>{item.contactName}</Col>
          <Col span={12}>{item.contactPhone}</Col>
        </Row>
        <Row>
          <Col>{item.organizationAddress}</Col>
        </Row>
      </Card>
    </List.Item>
  )

  addCargoes = cargoesId => {
    this.props.postConsignmentRelationships({ relationshipOrgType: 3, relationshipOrgId: cargoesId })
      .then(() => {
        const newFilter = this.props.setFilter({ ...this.props.filter, offset:0 });
        this.setState({
          nowPage:1
        });
        notification.success({
          message: '添加成功',
          description: `添加货权方成功`,
        });
        return this.props.getOrganizations({ ...newFilter });
      })
      .then(() => {
        const index = this.state.cargoesItems.findIndex(item => item.cargoesId === cargoesId);
        this.state.cargoesItems[index].isUsed = true;
        this.setState({
          cargoesItems: this.state.cargoesItems
        });
      });
  }

  render () {
    const { cargoes } = this.props;
    return (
      <>
        {this.createPermission &&
        <Row>
          <Button onClick={this.showModal} type='primary'>+ 添加货权方</Button>
        </Row>}
        <Modal
          title="添加货权方"
          visible={this.state.visible}
          onCancel={this.handleCancel}
          centered
          footer={null}
          maskClosable={false}
          destroyOnClose
          className="modal-box"
        >
          <Input.Search
            placeholder="请输入货权方名称"
            enterButton="搜索"
            size="large"
            onSearch={this.findAllCargoes}
            style={{ width: '80%', marginLeft: '10%' }}
          />
          <List
            grid={{ gutter: 25, column: 2 }}
            dataSource={this.state.cargoesItems}
            renderItem={this.renderItem}
            className="mt-20"
          />
        </Modal>
        <Table schema={this.tableSchema} rowKey="organizationId" renderCommonOperate={this.searchTableList} pagination={{ current:this.state.nowPage, pageSize:this.state.pageSize }} onChange={this.onChange} dataSource={cargoes} />
      </>
    );
  }
}

export default cargoesSetting;
