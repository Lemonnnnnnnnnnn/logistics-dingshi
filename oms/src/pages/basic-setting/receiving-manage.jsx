import React, { Component } from 'react';
import { Button, Modal, notification } from "antd";
import { connect } from 'dva';
import { SchemaForm, Item, FORM_MODE, Observer } from '@gem-mine/antd-schema-form';
import DebounceFormButton from '../../components/debounce-form-button';
import Table from '../../components/table/table';
import Authorized from '../../utils/Authorized';
import receivingModel from '../../models/receiving';
import receivingLabelModel from '../../models/receivingLabel';
import { pick, translatePageType, getLocal } from '../../utils/utils';
import SearchForm from '../../components/table/search-form2';
import TableContainer from '../../components/table/table-container';
import MapInput from './component/map-input';
import '@gem-mine/antd-schema-form/lib/fields';
import ConfirmModal from '../../components/common/confirm-modal';
import { getAllCustomer } from '../../services/apiService';
import UploadFile from '../../components/upload/upload-file';
import AddressSite from './component/address-site';

const { actions: { getReceiving, patchReceiving, postReceiving, detailReceiving } } = receivingModel;
const { actions: { getReceivingLabels } } = receivingLabelModel;

function mapStateToProps(state) {
  return {
    receivings: pick(state.receiving, ['items', 'count']),
    receivingLabel: pick(state.receivingLabels, ['items', 'count']),
    commonStore: state.commonStore,
    entity: state.receiving.entity
  };
}

@connect(mapStateToProps, { getReceiving, getReceivingLabels, patchReceiving, postReceiving, detailReceiving })
@TableContainer({})
export default class ReceivingSetting extends Component {
  currentTab = this.props.commonStore.tabs.find(item => item.id === this.props.commonStore.activeKey);

  localData = getLocal(this.currentTab.id) || { formData: {} };

  form = null;

  form2 = null;

  state = {
    nowPage: 1,
    pageSize: 10,
    visible: false,
    ready: false,
    options: []
  }

  tableSchema = {
    variable: true,
    minWidth: 1700,
    columns: [
      {
        title: '卸货点',
        dataIndex: 'receivingName',
        fixed: 'left',
        width: '200px'
      }, {
        title: '卸货单位',
        dataIndex: 'customerOrgName',
        width: '250px'
      }, {
        title: '卸货地址详细描述',
        dataIndex: 'receivingAddress',
        width: '400px'
      }, {
        title: '卸货联系人',
        dataIndex: 'contactName',
      }, {
        title: '卸货联系电话',
        dataIndex: 'contactPhone',
      }, {
        title: '坐标点',
        dataIndex: 'receivingLatitude',
        render: (text, record) => `${record.receivingLatitude}, ${record.receivingLongitude}`,
        width: '200px'
      }, {
        title: '围栏开关',
        dataIndex: 'isOpenFence',
        render: (text, record) => record.isOpenFence ? '启用' : '禁用',
        width: '200px'
      }, {
        title: '围栏半径',
        dataIndex: 'radius',
        width: '200px',
        render: (text, record) => record.isOpenFence ? `${text}米` : '-'
      }, {
        title: '状态',
        dataIndex: 'isAvailable',
        filters: [{
          text: '禁用',
          value: false
        }, {
          text: '启用',
          value: true
        }],
        render: (text, record) => record.isAvailable ? '启用' : '禁用',
        filterMultiple: false
      }
    ],
    operations: record => [
      {
        title: '修改',
        onClick: (record) => {
          this.props.detailReceiving({ receivingId: record.receivingId })
            .then(data => {
              this.setState({
                mode: FORM_MODE.MODIFY,
                visible: true,
                isUsed: !!data.isUsed
              });
            });
        },
      },
      {
        title: record.isAvailable ? '禁用' : '启用',
        onClick: (record) => {
          this.props.patchReceiving({ receivingId: record.receivingId, isAvailable: !record.isAvailable })
            .then(() => {
              notification.success({
                message: `${record.isAvailable ? '禁用' : '启用'}成功`,
                description: `${record.isAvailable ? '禁用' : '启用'}卸货点成功`,
              });
            });
        },
      },
      {
        title: '删除',
        onClick: (record) => {
          this.props.patchReceiving({ receivingId: record.receivingId, isEffect: 0 })
            .then(() => {
              this.props.getReceiving(this.props.filter);
              notification.success({
                message: `删除成功`,
                description: `删除卸货点成功`,
              });
            });
        },
      }
    ]
  }

  formSchema = {
    receivingName: {
      label: '卸货点名称',
      component: Observer({
        watch: ['*mode', '*isUsed'],
        action: ([mode, isUsed]) => mode === FORM_MODE.MODIFY && isUsed ? 'input.text' : 'input'
      }),
      placeholder: '请输入卸货点名称',
      maxLength: 30,
      rules: {
        required: [true, '请输入卸货点名称'],
        max: 30
      }
    },
    receivingLabelId: {
      label: '标签',
      placeholder: '请选择标签',
      component: 'select',
      options: Observer({
        watch: '*formMode',
        action: () => this.state.options,
      }),
      observer: Observer({
        watch: '*localData',
        action: (itemValue, { form }) => {
          if (this.form2 !== form) {
            this.form2 = form;
          }
          return {};
        }
      }),
      props: {
        showSearch: true,
        optionFilterProp: 'label'
      },
      value: Observer({
        watch: 'receivingLabelId',
        action: (value, d) => {
          if (value && d.changeValues) {
            ConfirmModal('是否自动填充该标签中的信息（卸货单位、卸货联系人、卸货联系电话）?', this.onOk(d))();
          }
          return value;
        }
      }),
    },
    customerOrgId: {
      label: '卸货单位',
      placeholder: '请选择卸货单位',
      rules: {
        required: [true, '请选择卸货单位'],
      },
      component: 'select',
      props: {
        showSearch: true,
        optionFilterProp: 'label'
      },
      options: async () => {
        const { items } = await getAllCustomer({ limit: 500, offset: 0, selectType: 1 });
        return items.map(item => ({
          key: item.organizationId,
          value: item.organizationId,
          label: item.organizationName
        }));
      },
    },
    contactName: {
      label: '卸货联系人',
      placeholder: '请输入卸货联系人',
      rules: {
        required: [true, '请输入卸货联系人'],
        max: 30
      },
      component: 'input'
    },
    contactPhone: {
      label: '卸货联系电话',
      placeholder: '请输入卸货联系电话',
      rules: {
        required: [true, '请输入卸货联系电话'],
        max: 30
      },
      component: 'input'
    },
    receivingAddressObject: {
      label: '卸货地址',
      component: MapInput,
      rules: {
        required: [true, '请输入卸货地址']
      }
    },
    receivingAddress: {
      label: '卸货地址详细描述',
      placeholder: '请输入卸货地址详细描述',
      component: 'input',
      value: Observer({
        watch: 'receivingAddressObject',
        action: (value, d) => {
          if (value && value.receivingAddress) {
            return value.receivingAddress;
          }
          return d.value;
        }
      }),
      rules: {
        required: true
      }
    },
    receivingAddressSite: {
      label: '卸货点坐标',
      rules: {
        required: true
      },
      component: AddressSite,
      value: Observer({
        watch: 'receivingAddressObject',
        action: (value, d) => {
          if (value && value.receivingLatitude && value.receivingLongitude) {
            return {
              latitude: value.receivingLatitude,
              longitude: value.receivingLongitude,
            };
          }
          return d.value;
        }
      }),
    },
    signDentryid: {
      label: '样签',
      component: UploadFile,
      props: {
        labelUpload: '样签'
      },
      rules: {
        required: true
      }
    },
    remarks: {
      label: '备注（可选）',
      component: 'input.textArea',
      placeholder: '请输入备注',
      maxLength: 150,
      rules: {
        max: 150
      }
    },
    isOpenFence: {
      label: '开启电子围栏',
      component: 'radio',
      options: [
        { label: '开启', value: true },
        { label: '关闭', value: false }
      ],
      defaultValue: false
    },
    radius: {
      label: '围栏半径',
      component: 'input',
      type: 'number',
      visible: Observer({
        watch: 'isOpenFence',
        action: (isOpenFence) => isOpenFence
      }),
      disabled: Observer({
        watch: '*mode',
        action: (mode) => mode === FORM_MODE.MODIFY
      }),
      format: {
        input: (value) => value,
        output: (value) => parseInt(value, 10)
      },
      props: {
        step: 100,
        min: 100,
        max: 1000,
        addonAfter: '米'
      },
      defaultValue: 1000,
      rules: {
        required: true,
      }
    },
  }

  componentDidMount() {
    const { setFilter, getReceiving } = this.props;
    const { localData = { formData: {} } } = this;
    const params = {
      ...localData.formData,
      receivingLabelId: localData.formData.receivingLabelId || undefined,
      offset: localData.nowPage ? localData.pageSize * (localData.nowPage - 1) : 0,
      limit: localData.pageSize ? localData.pageSize : 10,
    };
    this.setState({
      nowPage: localData.nowPage || 1,
      pageSize: localData.pageSize || 10,
    });
    setFilter({ ...params });
    this.props.getReceivingLabels({ offset: 0, limit: 10000 }).then(() => {
      const data = this.props.receivingLabel.items.map(item => ({
        ...item,
        label: item.receivingLabel,
        key: item.receivingLabelId,
        value: item.receivingLabelId
      }));
      getReceiving({ ...params })
        .then(() => {
          this.setState({
            ready: true
          });
        });
      this.setState({
        options: [
          {
            label: '全部',
            key: null,
            value: null
          },
          ...data
        ]
      });
    });
  }

  onOk = (data) => () => {
    const current = this.state.options.find(item => item.key === data.value);
    this.form2.setFieldsValue({ customerOrgId: current.customerOrgId, contactPhone: current.contactPhone, contactName: current.contactName });
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

  searchForm = {
    receivingName: {
      label: '卸货点',
      placeholder: '请输入卸货点名称',
      component: 'input'
    },
    customerOrgName: {
      label: '卸货单位',
      placeholder: '请输入卸货单位',
      component: 'input',
      observer: Observer({
        watch: '*localData',
        action: (itemValue, { form }) => {
          if (this.form !== form) {
            this.form = form;
          }
          return {};
        }
      }),
    },
    receivingLabelId: {
      label: '标签',
      placeholder: '请选择标签',
      component: 'select',
      options: Observer({
        watch: '*formMode',
        action: () => this.state.options,
      }),
    }
  }

  searchTableList = () => {
    const formLayout = {
      wrapperCol: { span: 18 },
      labelCol: { span: 6 }
    };
    return (
      <SearchForm layout="inline" {...formLayout} schema={this.searchForm} mode={FORM_MODE.SEARCH}>
        <Item field="receivingName" />
        <Item field="customerOrgName" />
        <Item field="receivingLabelId" />
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
    this.props.getReceiving({ ...newFilter });
  }

  handleSearchBtnClick = () => {
    this.setState({
      nowPage: 1
    });
    const newFilter = this.props.setFilter({ ...this.props.filter, offset: 0 });
    this.props.getReceiving({ ...newFilter });
  }

  onChange = (pagination, filters) => {
    const { offset, limit, current } = translatePageType(pagination);
    const { isAvailable } = filters;
    this.setState({
      nowPage: current,
      pageSize: limit
    });
    const newFilter = this.props.setFilter({ offset, limit, isAvailable });
    this.props.getReceiving({ ...newFilter });
  }

  createReceiving = () => {
    this.setState({
      visible: true,
      mode: FORM_MODE.ADD,
      isUsed: false
    });
  }

  handleCancel = () => {
    this.setState({ visible: false });
  }

  saveData = formData => {
    const submitValue = {
      ...formData,
      ...formData.receivingAddressObject,
      receivingAddress: formData.receivingAddress,
      areaCode: formData.receivingAddressObject.receivingAdCode,
      receivingLongitude: formData.receivingAddressSite.longitude,
      receivingLatitude: formData.receivingAddressSite.latitude,
    };
    delete submitValue.receivingAddressObject;
    const { mode } = this.state;
    const { postReceiving, patchReceiving, getReceiving, setFilter, filter } = this.props;
    mode === FORM_MODE.ADD
      ? postReceiving({ ...submitValue, signDentryid: formData.signDentryid.shift() })
        .then(() => {
          const newFilter = setFilter({ ...filter, offset: 0 });
          getReceiving({ ...newFilter })
            .then(() => {
              notification.success({
                message: '添加成功',
                description: `添加卸货点成功`,
              });
              this.handleCancel();
            });
        })
      : patchReceiving({ ...submitValue, signDentryid: formData.signDentryid.shift(), receivingId: this.props.entity.receivingId })
        .then(() => {
          notification.success({
            message: '修改成功',
            description: `修改卸货点成功`,
          });
          this.handleCancel();
        });
  }

  render() {
    const formLayout = {
      wrapperCol: { span: 18 },
      labelCol: { span: 6 }
    };
    const { receivings, entity, history } = this.props;
    const { mode, nowPage, pageSize, ready, visible, isUsed } = this.state;
    const detail = mode === FORM_MODE.ADD
      ? null
      : entity;
    entity.receivingId && (entity.receivingAddressObject = { ...pick(entity, ['receivingLongitude', 'receivingLatitude', 'receivingAddress']), receivingDistrict: entity.provinceCityCounty || '' });
    return (
      <>
        <Authorized>
          <Button type="primary" onClick={this.createReceiving} style={{ marginRight: '15px' }}>+ 创建卸货点</Button>
          <Button type="primary" onClick={() => history.push(`receivingSetting/receivingLabelList`)}>标签管理</Button>
        </Authorized>
        <Modal
          centered
          destroyOnClose
          maskClosable={false}
          title={mode === FORM_MODE.ADD ? "添加卸货点" : '修改卸货点'}
          visible={visible}
          onCancel={this.handleCancel}
          footer={null}
          width={550}
        >
          <SchemaForm {...formLayout} layout="vertical" mode={mode} data={detail} schema={this.formSchema} trigger={{ isUsed }}>
            <Item field="receivingName" />
            <Item field="receivingLabelId" />
            <Item field="customerOrgId" />
            <Item field="contactName" />
            <Item field="contactPhone" />
            <Item field="receivingAddressObject" />
            <Item field="receivingAddress" />
            <Item field="receivingAddressSite" />
            <Item field="signDentryid" />
            <Item field="remarks" />
            <Item field="isOpenFence" />
            <Item field="radius" />
            <div style={{ textAlign: "right", padding: '5px 120px 0 0' }}>
              <Button className="mr-10" onClick={this.handleCancel}>取消</Button>
              <DebounceFormButton label="保存" type="primary" validate onClick={this.saveData} />
            </div>
          </SchemaForm>
        </Modal>
        {ready &&
          <Table schema={this.tableSchema} rowKey="receivingId" renderCommonOperate={this.searchTableList} pagination={{ current: nowPage, pageSize }} onChange={this.onChange} dataSource={receivings} />}
      </>
    );
  }
}
