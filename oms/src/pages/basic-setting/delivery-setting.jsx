import React, { Component } from 'react';
import { Button, Row, Modal, notification } from "antd";
import { connect } from 'dva';
import { SchemaForm, Item, FORM_MODE, Observer } from '@gem-mine/antd-schema-form';
import DebounceFormButton from '../../components/debounce-form-button';
import Table from '../../components/table/table';
import { pick, translatePageType, debounce, getLocal } from '../../utils/utils';
import deliveryModel from '../../models/createProject';
import organizationsModel from '../../models/organizations';
import { IS_AVAILABLE } from '../../constants/project/project';
import SearchForm from '../../components/table/search-form2';
import TableContainer from '../../components/table/table-container';
import MapInput from './component/map-input';
import '@gem-mine/antd-schema-form/lib/fields';
import styles from './delivery-setting.less';
import auth from '../../constants/authCodes';
import AddressSite from './component/address-site';

const {
  DELIVERY_SETTING_MODIFY,
  DELIVERY_SETTING_DISABLE,
  DELIVERY_SETTING_ENABLE,
  DELIVERY_SETTING_DELETE,
  DELIVERY_SETTING_CREATE
} = auth;

const { actions: { getDeliveries, patchDeliveries, postDeliveries, detailDeliveries } } = deliveryModel;
const { actions: { getOrganizations } } = organizationsModel;

function mapStateToProps(state) {
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
    variable: true,
    minWidth: 1700,
    columns: [
      {
        title: '?????????',
        dataIndex: 'deliveryName',
        fixed: 'left',
        width: '200px'
      }, {
        title: '?????????',
        dataIndex: 'supplierOrgName',
      }, {
        title: '?????????',
        dataIndex: 'contactName',
      }, {
        title: '????????????',
        dataIndex: 'contactPhone',
      }, {
        title: '????????????????????????',
        dataIndex: 'deliveryAddress',
      }, {
        title: '?????????',
        dataIndex: 'receivingLatitude',
        render: (text, record) => `${record.deliveryLatitude}, ${record.deliveryLongitude}`,
        width: '200px'
      }, {
        title: '????????????',
        dataIndex: 'isOpenFence',
        render: (text, record) => record.isOpenFence ? '??????' : '??????',
        width: '200px'
      }, {
        title: '????????????',
        dataIndex: 'radius',
        width: '200px',
        render: (text) => `${text}???`
      }, {
        title: '??????',
        dataIndex: 'isAvailable',
        filters: [{
          text: '??????',
          value: false,
        }, {
          text: '??????',
          value: true,
        }],
        render: (text, record) => record.isAvailable ? '??????' : '??????',
        filterMultiple: false,
      }
    ],
    operations: (record) => {
      const operations = {
        [IS_AVAILABLE.ENABLE]: [
          {
            title: '??????',
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
            auth: DELIVERY_SETTING_MODIFY

          }, {
            title: '??????',
            confirmMessage: (record) => `????????????${record.deliveryName}??????`,
            onClick: this.disableDelivery,
            auth: DELIVERY_SETTING_DISABLE
          }, {
            title: '??????',
            confirmMessage: (record) => (`????????????${record.deliveryName}??????`),
            onClick: (record) => {
              this.props.patchDeliveries({ deliveryId: record.deliveryId, isEffect: 0 })
                .then(() => {
                  if (this.props.deliveries.items.length === 1 && this.props.filter.offset !== 0) {
                    const newFilter = this.props.setFilter({ ...this.props.filter, offset: this.props.filter.offset - this.props.filter.limit });
                    this.setState({
                      nowPage: this.state.nowPage - 1
                    });
                    this.props.getDeliveries({ ...newFilter });
                  } else {
                    this.props.getDeliveries({ ...this.props.filter });
                  }
                });
            },
            auth: DELIVERY_SETTING_DELETE
          }
        ],
        [IS_AVAILABLE.DISABLE]: [
          {
            title: '??????',
            onClick: (record) => {
              this.props.detailDeliveries({ deliveryId: record.deliveryId })
                .then(() => {
                  this.setState({
                    mode: FORM_MODE.MODIFY,
                    visible: true
                  });
                });
            },
            auth: DELIVERY_SETTING_MODIFY
          }, {
            title: '??????',
            confirmMessage: (record) => `????????????${record.deliveryName}??????`,
            onClick: this.enableDelivery,
            auth: DELIVERY_SETTING_ENABLE
          }, {
            title: '??????',
            confirmMessage: (record) => (`????????????${record.deliveryName}??????`),
            onClick: (record) => {
              this.props.patchDeliveries({ deliveryId: record.deliveryId, isEffect: 0 })
                .then(() => {
                  if (this.props.deliveries.items.length === 1 && this.props.filter.offset !== 0) {
                    const newFilter = this.props.setFilter({ ...this.props.filter, offset: this.props.filter.offset - this.props.filter.limit });
                    this.setState({
                      nowPage: this.state.nowPage - 1
                    });
                    this.props.getDeliveries({ ...newFilter });
                  } else {
                    this.props.getDeliveries({ ...this.props.filter });
                  }
                });
            },
            auth: DELIVERY_SETTING_DELETE
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

  constructor(props) {
    super(props);
    const formSchema = {
      deliveryName: {
        label: '?????????',
        component: Observer({
          watch: ['*mode', '*isUsed'],
          action: ([mode, isUsed]) => mode === FORM_MODE.MODIFY && isUsed ? 'input.text' : 'input'
        }),
        rules: {
          required: [true, '??????????????????'],
          max: 30
        },
        placeholder: '????????????????????????',
      },
      supplierOrgId: {
        label: '?????????',
        component: 'select',
        style: { width: '100%' },
        rules: {
          required: [true, '??????????????????']
        },
        props: {
          showSearch: true,
          optionFilterProp: 'label'
        },
        placeholder: '??????????????????',
        options: Observer({
          watch: '*deliveryLable',
          action: (deliveryLable) => deliveryLable.map(item => ({
            key: item.organizationId,
            value: item.organizationId,
            label: item.organizationName
          }))
        })
      },
      contactName: {
        label: '?????????',
        component: 'input',
        rules: {
          required: [true, '????????????????????????'],
          max: 30
        },
        observer: Observer({
          watch: 'supplierOrgId',
          action: (supplierOrgId) => {
            const { mode } = this.state;
            const { deliveryLable } = this.props;
            if (mode === FORM_MODE.ADD && deliveryLable && supplierOrgId) {
              return { value: deliveryLable.find(item => item.organizationId === supplierOrgId).contactName };
            }
          }
        }),
        placeholder: '??????????????????'
      },
      contactPhone: {
        label: '????????????',
        component: 'input',
        rules: {
          required: true,
          pattern: /^1\d{10}$/
        },
        placeholder: '?????????????????????',
        observer: Observer({
          watch: 'supplierOrgId',
          action: (supplierOrgId) => {
            const { mode } = this.state;
            const { deliveryLable } = this.props;
            if (mode === FORM_MODE.ADD && deliveryLable && supplierOrgId) {
              return { value: deliveryLable.find(item => item.organizationId === supplierOrgId).contactPhone };
            }
          }
        }),
      },
      deliveryAddressObject: {
        label: '????????????',
        component: MapInput,
        observer: Observer({
          watch: 'supplierOrgId',
          action: (supplierOrgId) => {
            const { mode } = this.state;
            const { deliveryLable } = this.props;
            if (mode === FORM_MODE.ADD && deliveryLable && supplierOrgId) {
              return { value: deliveryLable.find(item => item.organizationId === supplierOrgId).organizationAddress };
            }
          }
        }),
        rules: {
          required: true
        }
      },
      deliveryAddress: {
        label: '????????????????????????',
        placeholder: '?????????????????????????????????',
        component: 'input',
        value: Observer({
          watch: 'deliveryAddressObject',
          action: (value, d) => {
            if (value && value.deliveryAddress) {
              return value.deliveryAddress;
            }
            return d.value;
          }
        }),
        rules: {
          required: true
        }
      },
      deliveryAddressSite: {
        label: '???????????????',
        rules: {
          required: true
        },
        component: AddressSite,
        value: Observer({
          watch: 'deliveryAddressObject',
          action: (value, d) => {
            if (value && value.deliveryLatitude && value.deliveryLongitude) {
              return {
                latitude: value.deliveryLatitude,
                longitude: value.deliveryLongitude,
              };
            }
            return d.value;
          }
        }),
      },
      // isAvailable: {
      //   label: '??????',
      //   component: 'radio',
      //   visible: Observer({
      //     watch: '*mode',
      //     action: (mode) => mode !== FORM_MODE.ADD
      //   }),
      //   options: [{
      //     label: '??????',
      //     value: IS_AVAILABLE.ENABLE
      //   }, {
      //     label: '??????',
      //     value: IS_AVAILABLE.DISABLE
      //   }],
      //   rules: {
      //     required: true
      //   }
      // },
      isOpenFence: {
        label: '??????????????????',
        component: 'radio',
        options: [
          { label: '??????', value: true },
          { label: '??????', value: false }
        ],
        defaultValue: false
      },
      radius: {
        label: '????????????',
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
          addonAfter: '???'
        },
        defaultValue: 1000,
        rules: {
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
            return {};
          }
        }),
        label: '??????????????????',
        component: 'input.textArea',
        placeholder: '???????????????',
        rules: {
          max: 150
        }
      }
    };
    this.state = {
      visible: false,
      formSchema,
      mode: FORM_MODE.ADD,
      pageSize: 10
    };
  }

  componentDidMount() {
    const { localData = { formData: {} } } = this;
    const params = {
      ...localData.formData,
      deliveryName: localData.formData.searchKey || undefined,
      offset: localData.nowPage ? localData.pageSize * (localData.nowPage - 1) : 0,
      limit: localData.pageSize ? localData.pageSize : 10,
    };
    this.setState({
      nowPage: localData.nowPage || 1,
      pageSize: localData.pageSize || 10,
    });
    const authLocal = JSON.parse(localStorage.getItem('authority'));
    this.props.setFilter({ ...params });
    this.createPermission = authLocal.find(item => item.permissionCode === DELIVERY_SETTING_CREATE);
    this.props.getDeliveries({ ...params });
    this.props.getOrganizations({ organizationType: 6, selectType: 1, auditStatus: 1, isAvailable: 1, offset: 0, limit: 1000 });
  }

  componentWillUnmount() {
    // ??????????????????????????? ?????????????????? ??????????????????
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
      label: '?????????',
      placeholder: '????????????????????????',
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
    supplierOrgName: {
      label: '?????????',
      placeholder: '??????????????????',
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
      labelCol: {
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
        <DebounceFormButton label="??????" type="primary" className="mr-10" onClick={this.handleSearchBtnClick} />
        <DebounceFormButton label="??????" type="reset" onClick={this.handleResetBtnClick} />
      </SearchForm>
    );
  }

  handleSearchBtnClick = () => {
    this.setState({
      nowPage: 1
    });
    const newFilter = this.props.setFilter({ ...this.props.filter, deliveryName: this.props.filter.searchKey, offset: 0 });
    this.props.getDeliveries({ ...newFilter });
  }

  onChange = (pagination, filters) => {
    const { offset, limit, current } = translatePageType(pagination);
    const { isAvailable } = filters;
    this.setState({
      nowPage: current,
      pageSize: limit
    });
    const newFilter = this.props.setFilter({ offset, limit, isAvailable });
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
    const submitValue = {
      ...formData,
      ...formData.deliveryAddressObject,
      deliveryAddress: formData.deliveryAddress,
      areaCode: formData.deliveryAddressObject.deliveryAdCode,
      deliveryLongitude: formData.deliveryAddressSite.longitude,
      deliveryLatitude: formData.deliveryAddressSite.latitude,
    };
    delete submitValue.deliveryAddressObject;
    this.props.postDeliveries({ ...submitValue })
      .then(() => {
        const newFilter = this.props.setFilter({ ...this.props.filter, offset: 0 });
        this.props.getDeliveries({ ...newFilter });
        notification.success({
          message: '????????????',
          description: `?????????????????????`,
        });
        this.handleCancel();
      });
  }

  patchData = (formData) => {
    const submitValue = {
      ...formData,
      ...formData.deliveryAddressObject,
      deliveryAddress: formData.deliveryAddress,
      areaCode: formData.deliveryAddressObject.deliveryAdCode,
      deliveryLongitude: formData.deliveryAddressSite.longitude,
      deliveryLatitude: formData.deliveryAddressSite.latitude,
    };
    delete submitValue.deliveryAddressObject;
    this.props.patchDeliveries({ ...submitValue, deliveryId: this.props.entity.deliveryId })
      .then(() => {
        notification.success({
          message: '????????????',
          description: `?????????????????????`,
        });
        this.handleCancel();
      });
  }

  render() {
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
            <Button onClick={this.showModal} type='primary'>+ ???????????????</Button>
          </Row>
        )}
        <Modal
          centered
          destroyOnClose
          title={mode === FORM_MODE.ADD ? "???????????????" : "???????????????"}
          maskClosable={false}
          visible={this.state.visible}
          onCancel={this.handleCancel}
          footer={null}
          width={600}
        >
          <SchemaForm className={styles.modifyDeliveryModal} layout="vertical" {...this.formLayout} mode={mode} data={detail} schema={formSchema} trigger={{ deliveryLable, isUsed }}>
            <Item field="deliveryName" />
            <Item field="supplierOrgId" />
            <Item field="contactName" />
            <Item field="contactPhone" />
            <Item field="deliveryAddressObject" />
            <Item field="deliveryAddress" />
            <Item field="deliveryAddressSite" />
            {/* <Item field="isAvailable" /> */}
            <Item field="remarks" />

            <Item field="isOpenFence" />
            <Item field="radius" />
            <Row type='flex' justify='center' className='mt-1'>
              <Button className="mr-10" onClick={this.handleCancel}>??????</Button>
              {mode === FORM_MODE.ADD ? <DebounceFormButton onClick={this.postData} type="primary" label="??????" /> : null}
              {mode === FORM_MODE.MODIFY ? <DebounceFormButton onClick={this.patchData} type="primary" label="??????" /> : null}
            </Row>
          </SchemaForm>
        </Modal>
        <Table
          schema={this.tableSchema}
          rowKey="deliveryId"
          renderCommonOperate={this.searchTableList}
          pagination={{ current: nowPage, pageSize }}
          onChange={this.onChange}
          dataSource={deliveries}
        />
      </>
    );
  }
}

export default DeliverySetting;
