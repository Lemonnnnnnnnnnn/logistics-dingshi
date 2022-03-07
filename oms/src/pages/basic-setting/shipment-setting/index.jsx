import React, { Component } from 'react';
import { Button, Row, Modal, notification, Select } from 'antd';
import { Item, FORM_MODE, Observer } from '@gem-mine/antd-schema-form';
import { connect } from 'dva';
import DebounceFormButton from '@/components/debounce-form-button';
import { IS_AVAILABLE } from '@/constants/project/project';
import Table from '@/components/table/table';
import { pick, translatePageType, getLocal } from '@/utils/utils';
import shipmentModel from '@/models/organizations';
import consignmentRelationshipsModel from '@/models/consignmentRelationships';
import { getAllShipment } from '@/services/apiService';
import router from 'umi/router';
import SearchForm from '@/components/table/search-form2';
import TableContainer from '@/components/table/table-container';
import '@gem-mine/antd-schema-form/lib/fields';
import auth from '@/constants/authCodes';

const { SHIPMENT_SETTING_DELETE, SHIPMENT_SETTING_ADD } = auth;

const { actions: { getOrganizations } } = shipmentModel;
const { actions: { postConsignmentRelationships, deleteConsignmentRelationships } } = consignmentRelationshipsModel;

function mapStateToProps(state) {
  return {
    shipment: pick(state.organizations, ['items', 'count']),
    commonStore: state.commonStore,
  };
}

@connect(mapStateToProps, { getOrganizations, postConsignmentRelationships, deleteConsignmentRelationships })
@TableContainer({ selectType: 2, organizationType: 5 })
class shipmentSetting extends Component {

  currentTab = this.props.commonStore.tabs.find(item => item.id === this.props.commonStore.activeKey);

  localData = getLocal(this.currentTab.id) || { formData: {} };

  form = null;

  tableSchema = {
    variable: true,
    minWidth: 1500,
    columns: [
      {
        title: '企业名称',
        dataIndex: 'organizationName',
        width: '350px',
        fixed: 'left',
      }, {
        title: '状态',
        dataIndex: 'isAvailable',
        render: (text) => {
          if (text === IS_AVAILABLE.ENABLE) {
            return (<span style={{ color: 'darkgreen' }}>可用</span>);
          }
          if (text === IS_AVAILABLE.DISABLE) {
            return (<span style={{ color: 'red' }}>不可用</span>);
          }
        },
      }, {
        title: '联系人',
        dataIndex: 'contactName',
      }, {
        title: '联系电话',
        dataIndex: 'contactPhone',
      }, {
        title: '详细地址',
        dataIndex: 'organizationAddress',
      },
    ],
    operations: [
      {
        title: '删除',
        confirmMessage: (record) => `确定删除${record.organizationName}吗？`,
        onClick: (record, index) => {
          this.props.deleteConsignmentRelationships({ consignmentRelationshipId: record.consignmentRelationshipId })
            .then(() => this.props.getOrganizations({ ...this.props.filter }));
        },
        auth: SHIPMENT_SETTING_DELETE,
      },
      {
        title : '详情',
        onClick: ({ organizationId }) => {
          router.push(`shipmentSetting/detail?organizationId=${organizationId}`);
        }
      }
    ],
  };

  constructor(props) {
    super(props);

    this.state = {
      visible: false,
      shipmentItems: [],
      nowPage: 1,
      pageSize: 10,
    };
  }

  componentDidMount() {
    const { localData = { formData: {} } } = this;
    const params = {
      ...localData.formData,
      vagueSelect: localData.formData.searchKey || undefined,
      offset: localData.nowPage ? localData.pageSize * (localData.nowPage - 1) : 0,
      limit: localData.pageSize ? localData.pageSize : 10,
    };
    this.setState({
      nowPage: localData.nowPage || 1,
      pageSize: localData.pageSize || 10,
    });
    this.props.setFilter({ ...params });
    const authLocal = JSON.parse(localStorage.getItem('authority'));
    this.createPermission = authLocal.find(item => item.permissionCode === SHIPMENT_SETTING_ADD);
    this.props.getOrganizations({ ...params, selectType: 2, organizationType: 5 });
    this.findAllShipment();
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
          return {};
        },
      }),
    },
  };

  searchTableList = () => {
    const formLayOut = {
      labelCol: {
        xs: { span: 6 },
      },
      wrapperCol: {
        xs: { span: 18 },
      },
    };
    return (
      <SearchForm {...formLayOut} mode={FORM_MODE.SEARCH} layout='inline' schema={this.searchSchema}>
        <Item field='searchKey' />
        <DebounceFormButton label='查询' type='primary' onClick={this.handleSearchBtnClick} />
      </SearchForm>
    );
  };

  handleSearchBtnClick = (value) => {
    this.setState({
      nowPage: 1,
    });
    const newFilter = this.props.setFilter({ ...this.props.filter, vagueSelect: value.searchKey, offset: 0 });
    this.props.getOrganizations({ ...newFilter });
  };

  showModal = () => {
    this.setState({
      visible: true,
    });
  };

  handleCancel = () => {
    this.setState({
      visible: false,
      // shipmentItems: [],
    });
  };

  onChange = (pagination) => {
    const { offset, limit, current } = translatePageType(pagination);
    this.setState({
      nowPage: current,
      pageSize: limit,
    });
    const newFilter = this.props.setFilter({ offset, limit });
    this.props.getOrganizations({ ...newFilter });
  };


  addShipment = shipmentId => {
    this.props.postConsignmentRelationships({ relationshipOrgType: 5, relationshipOrgId: shipmentId })
      .then(() => {
        const newFilter = this.props.setFilter({ ...this.props.filter, offset: 0 });
        this.setState({
          nowPage: 1,
        });
        notification.success({
          message: '添加成功',
          description: `添加承运方成功`,
        });
        return this.props.getOrganizations({ ...newFilter });
      });
    // .then(() => {
    //   const index = this.state.shipmentItems.findIndex(item => item.shipmentId === shipmentId);
    //   this.state.shipmentItems[index].isUsed = true;
    //   this.setState({
    //     shipmentItems: this.state.shipmentItems
    //   });
    // });
  };

  findAllShipment = () => {
    getAllShipment({ limit: 1000, offset: 0 })
      .then(data => {
        const shipmentItems = data.items.map(item => ({
          shipmentId: item.organizationId,
          title: item.organizationName,

        }));
        this.setState({
          shipmentItems,
        });
      });
  };


  render() {
    const { shipment } = this.props;
    const { shipmentItems } = this.state;
    return (
      <>
        {this.createPermission && <Row>
          <Button onClick={this.showModal} type='primary'>+ 添加承运方</Button>
        </Row>}
        <Modal
          title='添加承运方'
          destroyOnClose
          visible={this.state.visible}
          onCancel={this.handleCancel}
          centered
          maskClosable={false}
          footer={null}
          className='modal-box'
        >
          <Row type='flex' justify='center' align='middle' style={{ height: '5rem' }}>
            <Select
              placeholder='请输入承运方名称'
              optionFilterProp='children'
              showSearch
              style={{ width: 200 }}
              onChange={this.addShipment}
            >
              {
                shipmentItems.map(item => <Select.Option key={item.shipmentId}
                                                         value={item.shipmentId}>{item.title}</Select.Option>)
              }
            </Select>
          </Row>

        </Modal>
        <Table schema={this.tableSchema} rowKey='organizationId' renderCommonOperate={this.searchTableList}
               pagination={{ current: this.state.nowPage, pageSize: this.state.pageSize }} onChange={this.onChange}
               dataSource={shipment} />
      </>
    );
  }
}

export default shipmentSetting;
