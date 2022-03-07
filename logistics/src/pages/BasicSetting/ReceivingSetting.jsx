import React, { Component } from 'react';
import { Button, Modal, notification } from "antd";
import { connect } from 'dva';
import { SchemaForm, Item, FORM_MODE, Observer } from '@gem-mine/antd-schema-form';
import DebounceFormButton from '../../components/DebounceFormButton';
import Table from '../../components/Table/Table';
import Authorized from '../../utils/Authorized';
import { getAllCustomer } from '../../services/apiService';
import { pick, translatePageType, getLocal } from '../../utils/utils';
import receivingLabelModel from '../../models/receivingLabel';
import SearchForm from '../../components/Table/SearchForm2';
import TableContainer from '../../components/Table/TableContainer';
import '@gem-mine/antd-schema-form/lib/fields';
import auth from '../../constants/authCodes';

const {
  RECEIVING_SETTING_MODIFY,
  RECEIVING_SETTING_DELETE,
  RECEIVING_SETTING_CREATE
} = auth;

const { actions: { getReceivingLabels, postReceivingLabels, patchReceivingLabels, detailReceivingLabels } } = receivingLabelModel;

function mapStateToProps (state) {
  return {
    receivingLabel: pick(state.receivingLabels, ['items', 'count']),
    labelInfo: state.receivingLabels.entity,
    commonStore: state.commonStore,
  };
}

@connect(mapStateToProps, { getReceivingLabels, postReceivingLabels, patchReceivingLabels, detailReceivingLabels })
@TableContainer({})
export default class ReceivingLabel extends Component{

  currentTab = this.props.commonStore.tabs.find(item => item.id === this.props.commonStore.activeKey);

  localData = getLocal(this.currentTab.id) || { formData: {} };

  form = null;

  state = {
    nowPage:1,
    pageSize:10,
    ready:false,
    labelModal:false,
    mode:FORM_MODE.ADD,
    options: [],
  }

  formLayout = {
    wrapperCol: { span: 18 },
    labelCol: { span: 6 }
  }

  schema = {
    variable: true,
    minWidth: 1500,
    columns: [
      {
        title: '标签名称',
        dataIndex: 'receivingLabel',
        fixed: 'left',
        width: '200px'
      }, {
        title: '卸货单位',
        dataIndex: 'customerOrgName',
      }, {
        title: '联系人',
        dataIndex: 'contactName',
      }, {
        title: '联系电话',
        dataIndex: 'contactPhone',
      }
    ],
    operations:[
      {
        title: '修改',
        onClick: (record) => {
          const { receivingLabelId } = record;
          this.props.detailReceivingLabels({ receivingLabelId })
            .then(()=>{
              this.setState({
                labelModal:true,
                mode:FORM_MODE.MODIFY
              });
            });
        },
        auth : RECEIVING_SETTING_MODIFY
      },
      {
        title: '删除',
        confirmMessage: () => `删除后项目下所有卸货点都会删除，确认删除吗？`,
        onClick: (record) => {
          const { receivingLabelId } = record;
          this.props.patchReceivingLabels({ receivingLabelId, isEffect:0 })
            .then(()=> this.props.getReceivingLabels(this.props.filter))
            .then(()=> {
              notification.success({
                message: '删除成功',
                description: `删除【项目】成功`,
              });
            });
        },
        auth : RECEIVING_SETTING_DELETE
      }
    ]
  }

  labelFormSchema = {
    receivingLabel: {
      label: '项目名称',
      component: 'input',
      placeholder: '请输入项目名称',
      rules:{
        required: [true, '请输入项目名称'],
        max: 30
      }
    },
    customerOrgId: {
      label: '卸货单位',
      component: 'select',
      style: { width: '100%' },
      rules: {
        required:[true, '请选择卸货单位']
      },
      placeholder: '请选择卸货单位',
      props:{
        showSearch: true,
        optionFilterProp: 'label'
      },
      options: async () => {
        return this.state.options.map(item=>({
          key: item.organizationId,
          value: item.organizationId,
          label: item.organizationName
        }));
      },
      disabled:Observer({
        watch: '*mode',
        action: (mode)=>(
          mode === FORM_MODE.MODIFY
        )
      })
    },
    contactName: {
      label: '联系人',
      component: 'input',
      placeholder: '请输入联系人',
      rules: {
        required: [true, '请输入联系人'],
        max: 30
      }
    },
    contactPhone: {
      label: '联系电话',
      component: 'input',
      placeholder: '请输入联系电话',
      rules: {
        required: [true, '请输入联系电话'],
        pattern: /^1\d{10}$/
      }
    }
  }

  async componentDidMount (){
    const { localData = { formData: {} } } = this;
    const params = {
      ...localData.formData,
      receivingLabel: localData.formData.searchKey || undefined,
      offset: localData.nowPage ? localData.pageSize * ( localData.nowPage - 1 ) : 0,
      limit: localData.pageSize ? localData.pageSize : 10,
    };
    const { items } = await getAllCustomer({ limit:500, offset:0, selectType:2 });
    this.setState({
      nowPage: localData.nowPage || 1,
      pageSize: localData.pageSize || 10,
      options: items,
    });
    this.props.setFilter({ ...params });
    const authLocal = JSON.parse(localStorage.getItem('ejd_authority'));
    this.createPermission = authLocal.find(item => item.permissionCode === RECEIVING_SETTING_CREATE);

    this.props.getReceivingLabels({ ...params })
      .then(()=>{
        this.setState({
          ready:true
        });
      });
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

  searchSchem = {
    receivingLabel: {
      label: '标签名称',
      placeholder: '请输入标签名称',
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
    customerOrgId: {
      label: '卸货单位',
      component: 'select',
      style: { width: '100%' },
      placeholder: '请选择卸货单位',
      props:{
        showSearch: true,
        optionFilterProp: 'label'
      },
      options: async () => {
        return this.state.options.map(item=>({
          key: item.organizationId,
          value: item.organizationId,
          label: item.organizationName
        }));
      },
      disabled:Observer({
        watch: '*mode',
        action: (mode)=>(
          mode === FORM_MODE.MODIFY
        )
      })
    },
    contactName: {
      label: '联系人',
      placeholder: '请输入联系人',
      component: 'input',
    },
    contactPhone: {
      label: '联系电话',
      placeholder: '请输入联系电话',
      component: 'input',
    }
  }

  searchTableList = () =>{
    const formLayOut = {
      labelCol:{
        xs: { span: 6 }
      },
      wrapperCol: {
        xs: { span: 18 }
      }
    };
    return (
      <SearchForm layout="inline" {...formLayOut} schema={this.searchSchem} mode={FORM_MODE.SEARCH}>
        <Item field="receivingLabel" />
        <Item field="customerOrgId" />
        <Item field="contactName" />
        <Item field="contactPhone" />
        <DebounceFormButton label="查询" type="primary" className="mr-10" onClick={this.handleSearchBtnClick} />
        <DebounceFormButton label="重置" type="reset" onClick={this.handleResetBtnClick} />
      </SearchForm>
    );
  }

  handleResetBtnClick = () => {
    const newFilter = this.props.resetFilter({});
    this.setState({
      nowPage: 1,
      pageSize: 10
    });
    this.props.getReceivingLabels({ ...newFilter });
  }

  handleSearchBtnClick = () => {
    this.setState({
      nowPage: 1
    });
    const newFilter = this.props.setFilter({ ...this.props.filter, offset: 0 });
    this.props.getReceivingLabels({ ...newFilter });
  }

  createPorject = () =>{
    this.setState({
      labelModal:true,
      mode:FORM_MODE.ADD
    });
  }

  onChange = (pagination) =>{
    const { offset, limit, current } = translatePageType(pagination);
    this.setState({
      nowPage: current,
      pageSize: limit
    });
    const newFilter = this.props.setFilter({ offset, limit });
    this.props.getReceivingLabels({ ...newFilter });
  }

  saveData = value => {
    const { mode, options } = this.state;
    const { labelInfo:{ receivingLabelId }, patchReceivingLabels, postReceivingLabels } = this.props;
    mode===FORM_MODE.MODIFY
      ? patchReceivingLabels({ ...value, receivingLabelId, customerOrgId: options.some(item => item.organizationId === value.customerOrgId) ? value.customerOrgId :  this.props.labelInfo.customerOrgId })
        .then(() => {
          notification.success({
            message: '修改成功',
            description: `修改【项目】成功`,
          });
          this.setState({
            labelModal: false,
          });
        })
      : postReceivingLabels({ ...value })
        .then(()=>this.props.getReceivingLabels(this.props.filter))
        .then(() => {
          notification.success({
            message: '创建成功',
            description: `创建【项目】成功`,
          });
          this.setState({
            labelModal: false,
          });
        });
  }

  render (){
    const { nowPage, pageSize, ready, labelModal, mode, options } = this.state;
    const { receivingLabel, labelInfo } = this.props;
    const detail = mode===FORM_MODE.MODIFY
      ?{ ...labelInfo, customerOrgId: options.some(item => item.organizationId === labelInfo.customerOrgId) ? labelInfo.customerOrgId : labelInfo.customerOrgName }
      :null;
    return (
      <>
        {
          this.createPermission &&
          <Authorized>
            <Button type='primary' onClick={this.createPorject}>+ 创建标签</Button>
          </Authorized>
        }
        <Modal
          centered
          destroyOnClose
          maskClosable={false}
          title={mode===FORM_MODE.MODIFY?"修改项目标签":'创建项目标签'}
          visible={labelModal}
          onCancel={()=>this.setState({
            labelModal:false
          })}
          footer={null}
        >
          <SchemaForm {...this.formLayout} layout="vertical" mode={mode} data={detail} schema={this.labelFormSchema}>
            <Item field="receivingLabel" />
            <Item field="customerOrgId" />
            <Item field="contactName" />
            <Item field="contactPhone" />
            <div style={{ textAlign:"right", padding:'5px 120px 0 0' }}>
              <Button label="取消" className="mr-10" onClick={()=>{ this.setState({ labelModal: false }); }}>取消</Button>
              <DebounceFormButton label="保存" type="primary" validate onClick={(formData)=>{ this.saveData(formData); }} />
            </div>
          </SchemaForm>
        </Modal>
        {ready&&
        <Table
          schema={this.schema}
          rowKey="receivingLabelId"
          renderCommonOperate={this.searchTableList}
          pagination={{ current: nowPage, pageSize }}
          onChange={this.onChange}
          dataSource={receivingLabel}
        />}
      </>
    );
  }
}
