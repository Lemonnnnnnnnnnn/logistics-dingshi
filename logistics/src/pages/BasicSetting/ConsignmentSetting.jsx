import React, { Component } from 'react';
import { Button, Modal, Input, List, Card, Row, Col } from 'antd';
import { Item, FORM_MODE, FormButton } from '@gem-mine/antd-schema-form';
import DebounceFormButton from '@/components/DebounceFormButton';
import auth from '@/constants/authCodes';
import Authorized from '@/utils/Authorized';
import Table from '@/components/Table/Table';
import { IS_AVAILABLE } from '@/constants/project/project';
import { translatePageType } from '@/utils/utils';
// TODO  getAllConsignment并非真实的货权搜索全部托运列表的接口,暂时用作替代
import { getAllConsignment, postConsignmentRelationships, getOrganizations, deleteCustomerRelationships } from '@/services/apiService';
import SearchForm from '@/components/Table/SearchForm2';
import TableContainer from '@/components/Table/TableContainer';
import '@gem-mine/antd-schema-form/lib/fields';

const { CONSIGNMENT_SETTING_ADD, CONSIGNMENT_SETTING_DELETE } = auth;

@TableContainer({ selectType: 2, organizationType: 4 })
export default class ConsignmentSetting extends Component{
  state={
    visible:false,
    consignmentItems:[],
    consignmentList:[],
    nowPage:1,
    pageSize:10
  }

  tableSchema={
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
      auth:[CONSIGNMENT_SETTING_DELETE],
      confirmMessage: (record) => `确定删除${record.organizationName}吗？`,
      onClick: (record) => {
        this.deleteConsignment(record.consignmentRelationshipId);
      }
    }]
  }

  searchSchema={
    searchKey: {
      label: '搜索',
      placeholder: '请输入托运方名称',
      component: 'input'
    }
  }

  componentDidMount () {
    const { filter } = this.props;
    getOrganizations(filter)
      .then(consignmentList =>{
        this.setState({
          consignmentList
        });
      });
  }

  handleResetBtnClick=()=>{
    const newFilter = this.props.resetFilter({});
    this.setState({
      nowPage: 1,
      pageSize: 10
    });
    getOrganizations(newFilter)
      .then(consignmentList =>{
        this.setState({
          consignmentList
        });
      });
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
      <SearchForm {...formLayOut} mode={FORM_MODE.SEARCH} layout="inline" schema={this.searchSchema}>
        <Item field="searchKey" />
        <DebounceFormButton label="查询" type="primary" onClick={this.handleSearchBtnClick} />
        <DebounceFormButton label="重置" onClick={this.handleResetBtnClick} />
      </SearchForm>
    );
  }

  handleSearchBtnClick = value => {
    const newFilter = this.props.setFilter({ ...this.props.filter, vagueSelect: value.searchKey, offset:0 });
    // TODO 现缺少已添加的托运方列表接口
    getOrganizations({ ...newFilter })
      .then(consignmentList =>{
        this.setState({
          consignmentList,
          nowPage: 1
        });
      });
  }

  onChange = (pagination) => {
    const { offset, limit, current } = translatePageType(pagination);
    const newFilter = this.props.setFilter({ offset, limit });
    getOrganizations({ ...newFilter })
      .then(consignmentList =>{
        this.setState({
          consignmentList,
          nowPage:current,
          pageSize:limit
        });
      });
  }

  findAllConsignment = searchKey => {
    getAllConsignment({ searchKey, limit:1000, offset:0 })
      .then(data=> {
        const consignmentItems = data.items.map(item => ({
          consignmentId: item.organizationId,
          title: item.organizationName,
          contactName: item.contactName,
          contactPhone: item.contactPhone,
          organizationAddress: item.organizationAddress,
          isUsed: item.isUsed
        }));
        this.setState({
          consignmentItems
        });
      });
  }

  addConsignment = (relationshipOrgId) => {
    postConsignmentRelationships({ relationshipOrgType:4, relationshipOrgId })
      .then(() => {
        const index = this.state.consignmentItems.findIndex(item => item.organizationId === relationshipOrgId);
        this.state.consignmentItems[index].isUsed = true;
        this.setState({
          consignmentItems: this.state.shipmentItems
        });
        return getOrganizations({ ...this.props.filter });
      })
      .then(()=>{

      });
  }

  deleteConsignment = (consignmentRelationshipId) => {
    deleteCustomerRelationships({ consignmentRelationshipId })
      .then(() => getOrganizations({ ...this.props.filter }))
      .then(consignmentList=>{
        this.setState({
          consignmentList
        });
      });
  }

  renderItem = item => (
    <List.Item>
      <Card
        title={item.title}
        extra={item.isUsed
          ? <a href='#' style={{ color: 'gray' }}>已添加</a>
          : <a href='#' onClick={() => this.addConsignment(item.consignmentId)}>添加</a>}
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

  showModal = () => {
    this.setState({
      visible: true
    });
  }

  closeModal = () => {
    this.setState({
      visible: false
    });
  }

  render (){
    const { consignmentList, nowPage, pageSize } = this.state;
    return (
      <>
        <Authorized authority={[CONSIGNMENT_SETTING_ADD]}>
          <Button onClick={this.showModal} type="primary">+ 添加托运方</Button>
        </Authorized>
        <Modal
          title="添加托运方"
          visible={this.state.visible}
          destroyOnClose
          centered
          maskClosable={false}
          onCancel={this.closeModal}
          footer={null}
          className="modal-box"
        >
          <Input.Search
            placeholder="请输入托运方名称"
            enterButton="搜索"
            size="large"
            onSearch={this.findAllConsignment}
            style={{ width: '80%', marginLeft: '10%' }}
          />
          <List
            grid={{ gutter: 25, column: 2 }}
            dataSource={this.state.consignmentItems}
            renderItem={this.renderItem}
            className="mt-20"
          />
        </Modal>
        <Table
          schema={this.tableSchema}
          rowKey="organizationId"
          renderCommonOperate={this.searchTableList}
          pagination={{ current: nowPage, pageSize }}
          onChange={this.onChange}
          dataSource={consignmentList}
        />
      </>
    );
  }
}
