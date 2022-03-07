import React, { Component } from 'react';
import { Button, Row, Modal, notification } from "antd";
import { connect } from 'dva';
import { SchemaForm, Item, FORM_MODE, Observer } from '@gem-mine/antd-schema-form';
import DebounceFormButton from '../../components/DebounceFormButton';
import Table from '../../components/Table/Table';
import { pick, translatePageType, debounce, getLocal } from '../../utils/utils';
import deliveryModel from '../../models/createProject';
import organizationsModel from '../../models/organizations';
import { IS_AVAILABLE } from '../../constants/project/project';
import SearchForm from '../../components/Table/SearchForm2';
import TableContainer from '../../components/Table/TableContainer';
import MapInput from './component/MapInput';
import '@gem-mine/antd-schema-form/lib/fields';
import auth from '../../constants/authCodes';

const {
  DELIVERY_SETTING_MODIFY,
  DELIVERY_SETTING_DISABLE,
  DELIVERY_SETTING_ENABLE,
  DELIVERY_SETTING_DELETE,
  DELIVERY_SETTING_CREATE
} = auth;

const { actions: { getDeliveries, patchDeliveries, postDeliveries, detailDeliveries } } = deliveryModel;
const { actions: { getOrganizations } } = organizationsModel;

function mapStateToProps (state) {
  return {
    deliveries: pick(state.deliveries, ['items', 'count']),
    deliveryLable: state.organizations.items,
    entity: state.deliveries.entity,
    commonStore: state.commonStore,
  };
}

@connect(mapStateToProps, { getDeliveries, patchDeliveries, postDeliveries, detailDeliveries, getOrganizations })
@TableContainer()
class DeliverySetting extends Component {
  currentTab = this.props.commonStore.tabs.find(item => item.id === this.props.commonStore.activeKey);

  localData = getLocal(this.currentTab.id) || { formData: {} };

  form = null;

  form2 = null;

  disableDelivery = debounce(({ deliveryId }) => {
    this.props.patchDeliveries({ deliveryId, isAvailable: IS_AVAILABLE.DISABLE });
  }, 2000)

  enableDelivery = debounce(({ deliveryId }) => {
    this.props.patchDeliveries({ deliveryId, isAvailable: IS_AVAILABLE.ENABLE });
  }, 2000)

  tableSchema = {
    variable:true,
    minWidth:1700,
    columns: [
      {
        title: '提货点',
        dataIndex: 'deliveryName',
        fixed:'left',
        width:'200px'
      }, {
        title: '供应商',
        dataIndex: 'supplierOrgName',
      }, {
        title: '联系人',
        dataIndex: 'contactName',
      }, {
        title: '联系电话',
        dataIndex: 'contactPhone',
      }, {
        title: '提货地址详细描述',
        dataIndex: 'deliveryAddress',
      }, {
        title: '围栏开关',
        dataIndex: 'isOpenFence',
        render: (text, record) => record.isOpenFence ? '启用' : '禁用',
        width: '200px'
      }, {
        title: '围栏半径',
        dataIndex: 'radius',
        width: '200px',
        render:(text) => `${text}米`
      }, {
        title: '状态',
        dataIndex: 'isAvailable',
        filters: [{
          text: '禁用',
          value: false,
        }, {
          text: '启用',
          value: true,
        }],
        render: (text, record) => record.isAvailable ? '启用' : '禁用',
        filterMultiple:false,
      }
    ],
    operations: (record) => {
      const operations = {
        [IS_AVAILABLE.ENABLE]: [
          {
            title: '修改',
            onClick: (record) => {
              this.props.detailDeliveries({ deliveryId: record.deliveryId })
                .then(data => {
                  this.setState({
                    mode: FORM_MODE.MODIFY,
                    visible: true,
                    isUsed: !!data.isUsed
                  });
                });
            },
            auth : DELIVERY_SETTING_MODIFY

          }, {
            title: '禁用',
            confirmMessage: (record) => `确定禁用${record.deliveryName}吗？`,
            onClick: this.disableDelivery,
            auth : DELIVERY_SETTING_DISABLE
          }, {
            title: '删除',
            confirmMessage: (record) => (`确定删除${record.deliveryName}吗？`),
            onClick: (record) => {
              this.props.patchDeliveries({ deliveryId: record.deliveryId, isEffect: 0 })
                .then(() => {
                  if (this.props.deliveries.items.length===1&&this.props.filter.offset!==0){
                    const newFilter = this.props.setFilter({ ...this.props.filter, offset:this.props.filter.offset-this.props.filter.limit });
                    this.setState({
                      nowPage: this.state.nowPage - 1
                    });
                    this.props.getDeliveries({ ...newFilter });
                  } else {
                    this.props.getDeliveries({ ...this.props.filter });
                  }
                });
            },
            auth : DELIVERY_SETTING_DELETE
          }
        ],
        [IS_AVAILABLE.DISABLE]: [
          {
            title: '修改',
            onClick: (record) => {
              this.props.detailDeliveries({ deliveryId: record.deliveryId })
                .then(() => {
                  this.setState({
                    mode: FORM_MODE.MODIFY,
                    visible: true
                  });
                });
            },
            auth : DELIVERY_SETTING_MODIFY
          }, {
            title: '启用',
            confirmMessage: (record) => `确定启用${record.deliveryName}吗？`,
            onClick: this.enableDelivery,
            auth : DELIVERY_SETTING_ENABLE
          }, {
            title: '删除',
            confirmMessage: (record) => (`确定删除${record.deliveryName}吗？`),
            onClick: (record) => {
              this.props.patchDeliveries({ deliveryId: record.deliveryId, isEffect: 0 })
                .then(() => {
                  if (this.props.deliveries.items.length===1&&this.props.filter.offset!==0){
                    const newFilter = this.props.setFilter({ ...this.props.filter, offset:this.props.filter.offset-this.props.filter.limit });
                    this.setState({
                      nowPage: this.state.nowPage-1
                    });
                    this.props.getDeliveries({ ...newFilter });
                  } else {
                    this.props.getDeliveries({ ...this.props.filter });
                  }
                });
            },
            auth : DELIVERY_SETTING_DELETE
          }
        ],
      };
      return operations[record.isAvailable];
    }
  }

  formLayout = {
    wrapperCol: { span: 18 },
    labelCol: { span: 6 }
  }

  constructor (props) {
    super(props);
    const formSchema = {
      deliveryName: {
        label: '提货点',
        component: Observer({
          watch: ['*mode', '*isUsed'],
          action:([mode, isUsed])=>mode === FORM_MODE.MODIFY && isUsed ? 'input.text' : 'input'
        }),
        rules:{
          required: [true, '请输入提货点'],
          max: 30
        },
        placeholder: '请输入提货点名称',
      },
      supplierOrgId: {
        label: '供应商',
        component: 'select',
        style: { width: '100%' },
        rules: {
          required:[true, '请输入供应商']
        },
        props:{
          showSearch: true,
          optionFilterProp: 'label'
        },
        placeholder: '请选择供应商',
        options: Observer({
          watch: '*deliveryLable',
          action: (deliveryLable)=>deliveryLable.map(item => ({
            key: item.organizationId,
            value: item.organizationId,
            label: item.organizationName
          }))
        })
      },
      contactName: {
        label: '联系人',
        component: 'input',
        rules:{
          required: [true, '请输入联系人姓名'],
          max: 30
        },
        observer: Observer({
          watch : 'supplierOrgId',
          action : (supplierOrgId )=> {
            const { mode } = this.state;
            const { deliveryLable } = this.props;
            if (mode === FORM_MODE.ADD && deliveryLable && supplierOrgId){
              return { value : deliveryLable.find(item => item.organizationId === supplierOrgId).contactName };
            }
          }
        }),
        placeholder: '请输入联系人'
      },
      contactPhone: {
        label: '联系电话',
        component: 'input',
        rules: {
          required: true,
          pattern: /^1\d{10}$/
        },
        placeholder: '请输入联系电话',
        observer : Observer({
          watch : 'supplierOrgId',
          action : (supplierOrgId )=> {
            const { mode } = this.state;
            const { deliveryLable } = this.props;
            if (mode === FORM_MODE.ADD && deliveryLable && supplierOrgId){
              return { value : deliveryLable.find(item => item.organizationId === supplierOrgId).contactPhone };
            }
          }
        }),
      },
      deliveryAddressObject: {
        label: '提货地址',
        component: MapInput,
        observer : Observer({
          watch : 'supplierOrgId',
          action : (supplierOrgId )=> {
            const { mode } = this.state;
            const { deliveryLable } = this.props;
            if (mode === FORM_MODE.ADD && deliveryLable && supplierOrgId){
              return { value: deliveryLable.find(item => item.organizationId === supplierOrgId).organizationAddress };
            }
          }
        }),
        rules: {
          required: true
        }
      },
      deliveryAddress: {
        label: '提货地址详细描述',
        placeholder: '请输入提货地址详细描述',
        component: 'input',
        value: Observer({
          watch : 'deliveryAddressObject',
          action : (value, d)=> {
            if (value && value.deliveryAddress) {
              return value.deliveryAddress;
            }
            return d.value;
          }
        }),
        rules:{
          required: true
        }
      },
      isAvailable: {
        label: '状态',
        component: 'radio',
        visible: Observer({
          watch: '*mode',
          action: (mode) => mode !== FORM_MODE.ADD
        }),
        options: [{
          label: '启用',
          value: IS_AVAILABLE.ENABLE
        }, {
          label: '禁用',
          value: IS_AVAILABLE.DISABLE
        }],
        rules: {
          required: true
        }
      },
      isOpenFence:{
        label: '开启电子围栏',
        component: 'radio',
        options: [
          { label: '开启', value: true },
          { label: '关闭', value: false }
        ],
        defaultValue: false
      },
      radius:{
        label: '围栏半径',
        component: 'input',
        type:'number',
        visible:Observer({
          watch: 'isOpenFence',
          action: (isOpenFence)=> isOpenFence
        }),
        disabled:Observer({
          watch: '*mode',
          action: (mode)=> mode === FORM_MODE.MODIFY
        }),
        format:{
          input:(value)=>value,
          output:(value)=> parseInt(value, 10)
        },
        props:{
          step:100,
          min:100,
          max:1000,
          addonAfter:'米'
        },
        defaultValue:1000,
        rules:{
          required: true,
        }
      },
      remarks: {
        observer: Observer({
          watch: '*localData',
          action: (itemValue, { form }) => {
            if (this.form2 !== form) {
              this.form2 = form;
            }
            return { };
          }
        }),
        label: '备注（可选）',
        component: 'input.textArea',
        placeholder: '请输入备注',
        rules: {
          max: 150
        }
      }
    };
    this.state = {
      visible: false,
      formSchema,
      mode: FORM_MODE.ADD,
      pageSize:10
    };
  }

  componentDidMount () {
    const { localData = { formData: {} } } = this;
    const params = {
      ...localData.formData,
      deliveryName: localData.formData.searchKey || undefined,
      offset: localData.nowPage ? localData.pageSize * ( localData.nowPage - 1 ) : 0,
      limit: localData.pageSize ? localData.pageSize : 10,
    };
    this.setState({
      nowPage: localData.nowPage || 1,
      pageSize: localData.pageSize || 10,
    });
    const authLocal = JSON.parse(localStorage.getItem('ejd_authority'));
    this.props.setFilter({ ...params });
    this.createPermission = authLocal.find(item => item.permissionCode === DELIVERY_SETTING_CREATE);
    this.props.getDeliveries({ ...params });
    this.props.getOrganizations({ organizationType: 6, selectType: 1, auditStatus:1, isAvailable:1, offset: 0, limit: 1000 });
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

  searchSchema = {
    searchKey: {
      label: '提货点',
      placeholder: '请输入提货点名称',
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
    },
    supplierOrgName: {
      label: '供应商',
      placeholder: '请输入供应商',
      component: 'input',
    },
  }

  handleResetBtnClick = () => {
    const newFilter = this.props.resetFilter({});
    this.setState({
      nowPage: 1,
      pageSize: 10
    });
    this.props.getDeliveries({ ...newFilter });
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
      <SearchForm layout="inline" {...formLayOut} schema={this.searchSchema} mode={FORM_MODE.SEARCH}>
        <Item field="searchKey" />
        <Item field="supplierOrgName" />
        <DebounceFormButton label="查询" type="primary" className="mr-10" onClick={this.handleSearchBtnClick} />
        <DebounceFormButton label="重置" type="reset" onClick={this.handleResetBtnClick} />
      </SearchForm>
    );
  }

  handleSearchBtnClick = () => {
    this.setState({
      nowPage:1
    });
    const newFilter = this.props.setFilter({ ...this.props.filter, deliveryName:this.props.filter.searchKey, offset: 0 });
    this.props.getDeliveries({ ...newFilter });
  }

  onChange = (pagination, filters) => {
    const { offset, limit, current } = translatePageType(pagination);
    const { isAvailable } = filters;
    this.setState({
      nowPage:current,
      pageSize:limit
    });
    const newFilter=this.props.setFilter({ offset, limit, isAvailable });
    this.props.getDeliveries({ ...newFilter });
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

  postData = (formData) => {
    const submitValue = { ...formData, ...formData.deliveryAddressObject, deliveryAddress: formData.deliveryAddress,  areaCode: formData.deliveryAddressObject.deliveryAdCode };
    delete submitValue.deliveryAddressObject;
    this.props.postDeliveries({ ...submitValue })
      .then(() => {
        const newFilter = this.props.setFilter({ ...this.props.filter, offset:0 });
        this.props.getDeliveries({ ...newFilter });
        notification.success({
          message: '添加成功',
          description: `添加提货点成功`,
        });
        this.handleCancel();
      });
  }

  patchData = (formData) => {
    const submitValue = { ...formData, ...formData.deliveryAddressObject, deliveryAddress: formData.deliveryAddress, areaCode: formData.deliveryAddressObject.deliveryAdCode };
    delete submitValue.deliveryAddressObject;
    this.props.patchDeliveries({ ...submitValue, deliveryId: this.props.entity.deliveryId })
      .then(() => {
        notification.success({
          message: '修改成功',
          description: `修改提货点成功`,
        });
        this.handleCancel();
      });
  }

  render () {
    const { deliveries, entity, deliveryLable } = this.props;
    const { mode, formSchema, nowPage, pageSize, isUsed } = this.state;
    const detail = mode === FORM_MODE.ADD
      ? { isAvailable: true } :
      entity;
    entity.deliveryId && (entity.deliveryAddressObject = { ...pick(entity, ['deliveryLongitude', 'deliveryLatitude', 'deliveryAddress']), deliveryDistrict: entity.provinceCityCounty || '' });
    return (
      <>
        {this.createPermission && (
          <Row>
            <Button onClick={this.showModal} type='primary'>+ 添加提货点</Button>
          </Row>
        )}
        <Modal
          centered
          destroyOnClose
          title={mode===FORM_MODE.ADD?"添加提货点":"修改提货点"}
          maskClosable={false}
          visible={this.state.visible}
          onCancel={this.handleCancel}
          footer={null}
          width={600}
        >
          <SchemaForm layout="vertical" {...this.formLayout} mode={mode} data={detail} schema={formSchema} trigger={{ deliveryLable, isUsed }}>
            <Item field="deliveryName" />
            <Item field="supplierOrgId" />
            <Item field="contactName" />
            <Item field="contactPhone" />
            <Item field="deliveryAddressObject" />
            <Item field="deliveryAddress" />
            <Item field="isAvailable" />
            <Item field="remarks" />
            <Item field="isOpenFence" />
            <Item field="radius" />
            <div style={{ textAlign: 'right', paddingRight: '120px' }}>
              <Button className="mr-10" onClick={this.handleCancel}>取消</Button>
              { mode === FORM_MODE.ADD ? <DebounceFormButton onClick={this.postData} type="primary" label="保存" /> : null }
              { mode === FORM_MODE.MODIFY ? <DebounceFormButton onClick={this.patchData} type="primary" label="保存" /> : null }
            </div>
          </SchemaForm>
        </Modal>
        <Table
          schema={this.tableSchema}
          rowKey="deliveryId"
          renderCommonOperate={this.searchTableList}
          pagination={{ current:nowPage, pageSize }}
          onChange={this.onChange}
          dataSource={deliveries}
        />
      </>
    );
  }
}

export default DeliverySetting;
