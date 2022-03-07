import React, { Component } from 'react';
import { Button, Row, Modal, notification, Popover } from "antd";
import { SchemaForm, Item, FORM_MODE, Observer } from '@gem-mine/antd-schema-form';
import { connect } from 'dva';
import DebounceFormButton from '@/components/DebounceFormButton';
import { IS_AVAILABLE } from '@/constants/project/project';
import Table from '@/components/Table/Table';
import { pick, translatePageType, getLocal } from '@/utils/utils';
import customerModel from '@/models/organizations';
import { deleteCustomerRelationships, addOrganization, postConsignmentRelationships } from '@/services/apiService';
import TableContainer from '@/components/Table/TableContainer';
import SearchForm from '@/components/Table/SearchForm2';
import { CUSTOMER } from '@/constants/organization/organizationType';
import '@gem-mine/antd-schema-form/lib/fields';
import auth from '@/constants/authCodes';

const { CUSTOMER_SETTING_DELETE, CUSTOMER_SETTING_ADD } = auth;

const { actions: { getOrganizations } } = customerModel;
function mapStateToProps (state) {
  return {
    commonStore: state.commonStore,
    customer: pick(state.organizations, ['items', 'count'])
  };
}
@connect(mapStateToProps, { getOrganizations })
@TableContainer({ selectType: 2, organizationType: 7 })
export default class CustomerManage extends Component {
  currentTab = this.props.commonStore.tabs.find(item => item.id === this.props.commonStore.activeKey);

  localData = getLocal(this.currentTab.id) || { formData: {} };

  form = null;

  state = {
    visible: false,
    customerItems: [],
    nowPage: 1,
    pageSize: 10,
  }

  searchSchema = {
    searchKey: {
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

  createForm = {
    organizationName: {
      label: '公司名称',
      component: 'input',
      rules: {
        required: [true, '请输入公司名称']
      },
      placeholder: '请输入公司名称'
    },
    contactName: {
      label: '企业联系人',
      component: 'input',
      rules: {
        required: [true, '请输入姓名']
      },
      placeholder: '请输入姓名'
    },
    contactPhone: {
      label: '联系电话',
      component: 'input',
      rules: {
        required: [true, '请输入电话号码']
      },
      placeholder: '请输入电话号码'
    },
    organizationAddress: {
      label: '公司地址',
      component: 'input',
      rules:{
        required: [true, '请输入公司地址']
      },
      placeholder: '请输入公司地址'
    }
  }

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
      onClick: (record) => {
        deleteCustomerRelationships({ consignmentRelationshipId: record.consignmentRelationshipId })
          .then(() => {
            if (this.props.customer.items.length === 1 && this.props.filter.offset !== 0) {
              const newFilter = this.props.setFilter({ ...this.props.filter, offset: this.props.filter.offset - this.props.filter.limit });
              this.setState({
                nowPage: this.state.nowPage - 1
              });
              this.props.getOrganizations({ ...newFilter });
            } else {
              this.props.getOrganizations({ ...this.props.filter });
            }
          });
      },
      auth : CUSTOMER_SETTING_DELETE
    }]
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
    const authLocal = JSON.parse(localStorage.getItem('ejd_authority'));
    this.createPermission = authLocal.find(item => item.permissionCode === CUSTOMER_SETTING_ADD);
    this.props.getOrganizations({ ...params, selectType: 2, organizationType: 7 });
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

  handleSearchBtnClick = (value) => {
    this.setState({
      nowPage:1
    });
    const { searchKey } = value;
    const newFilter = this.props.setFilter({ ...this.props.filter, vagueSelect: searchKey, offset: 0 });
    this.props.getOrganizations({ ...newFilter });
  }

  searchTableList = () => {
    const formLayOut = {
      labelCol: {
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

  getOrganizations = (params) => {
    this.props.getOrganizations({ selectType: 2, organizationType: 7, limit: 10, offset: 0 });
  }


  showModal = () => this.setState({ visible: true })

  handleCancel = () => {
    this.setState({
      visible: false,
      customerItems: []
    });
  }


  onChange = (pagination) => {
    const { offset, limit, current } = translatePageType(pagination);
    this.setState({
      nowPage: current,
      pageSize: limit
    });
    const newFilter = this.props.setFilter({ offset, limit });
    this.props.getOrganizations({ ...newFilter });
  }

  addCustomer = (customer) => {
    customer.organizationType = 7;
    addOrganization(customer)
      .then(({ isExistOrg, organizationId }) => {
        if ( isExistOrg ){
          Modal.confirm({
            title: '提示',
            content: '此客户信息已存在与系统中,是否确认添加?',
            okText: '确认',
            cancelText: '取消',
            onOk: ()=>{
              postConsignmentRelationships({ relationshipOrgType: CUSTOMER, relationshipOrgId: organizationId })
                .then(()=>{
                  notification.success({
                    message: '添加成功',
                    description: `添加客户成功`,
                  });
                  this.setState({ nowPage: 1, visible: false });
                  return this.props.getOrganizations({ selectType: 2, organizationType: 7, limit: 10, offset: 0 });
                });
            }
          });

        } else {
          const newFilter = this.props.setFilter({ ...this.props.filter, offset: 0 });
          this.setState({ nowPage: 1, visible: false });
          notification.success({
            message: '添加成功',
            description: `添加客户成功`,
          });
          return this.props.getOrganizations({ ...newFilter });
        }
      });
    // .then(() => {
    //   const index = this.state.customerItems.findIndex(item => item.customerId === customerId)
    //   this.state.customerItems[index].isUsed = true
    //   this.setState({
    //     customerItems: this.state.customerItems
    //   })
    // })
  }

  renderCreateModal = () => {
    const { visible } = this.state;
    return (
      <Modal
        title="添加客户"
        visible={visible}
        onCancel={this.handleCancel}
        centered
        footer={null}
        maskClosable={false}
        destroyOnClose
        className="modal-box"
      >
        <SchemaForm
          data={{}}
          schema={this.createForm}
          layout="vertical"
        >
          <Popover content="请填写营业执照上完整的单位名称" trigger="focus">
            <div><Item field="organizationName" /></div>
          </Popover>
          <Item field="contactName" />
          <Item field="contactPhone" />
          <Item field="organizationAddress" />
          <div style={{ paddingRight: "20px", textAlign: "right" }}>
            <DebounceFormButton label="保存" type="primary" onClick={this.addCustomer} />
          </div>
        </SchemaForm>
      </Modal>
    );
  }

  render () {
    const { customer } = this.props;

    return (
      <>
        {this.createPermission && <Row><Button onClick={this.showModal} type='primary'>+ 添加客户</Button></Row>}
        {this.renderCreateModal()}
        <Table schema={this.tableSchema} rowKey="organizationId" renderCommonOperate={this.searchTableList} pagination={{ current: this.state.nowPage, pageSize: this.state.pageSize }} onChange={this.onChange} dataSource={customer} />
      </>
    );
  }
}
