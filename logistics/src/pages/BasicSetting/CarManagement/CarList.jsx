import React, { Component } from 'react';
import { Button, Modal, Icon } from "antd";
import router from 'umi/router';
import { connect } from 'dva';
import { Item, FORM_MODE, Observer } from '@gem-mine/antd-schema-form';
import DebounceFormButton from '@/components/DebounceFormButton';
import Table from '@/components/Table/Table';
import { find, translatePageType, pick, getLocal } from '@/utils/utils';
import { AUDIT_STATUS_OPTIONS, CAR_AUDIT_STATUS, AUDIT_STATUS, PERFECT_STATUS } from '@/constants/car';
import { DICTIONARY_TYPE } from '@/services/dictionaryService';
import SearchForm from '@/components/Table/SearchForm2';
import { getUserInfo } from '@/services/user';
import carModel from '@/models/cars';
import { getAuditStatus } from '@/services/carService';
import { deleteShipmentCar, getCarGroups } from '@/services/apiService';
import TableContainer from '@/components/Table/TableContainer';
import EditCarGroup from './component/EditCarGroup';
import ChangeCarGroup from './component/ChangeCarGroup';
import SelfCarSwitch from "./component/SelfCarSwitch";
import '@gem-mine/antd-schema-form/lib/fields';

const { actions } = carModel;
const { confirm } = Modal;

@connect(state => ({
  dictionaries: state.dictionaries.items,
  commonStore: state.commonStore,
  cars: pick(state.cars, ['items', 'count'])
}), actions)
@TableContainer({ selectType: 2 })
export default class CarList extends Component {
  currentTab = this.props.commonStore.tabs.find(item => item.id === this.props.commonStore.activeKey);

  localData = getLocal(this.currentTab.id) || { formData: {} };

  form = null;

  state = {
    nowPage: 1,
    pageSize: 10,
    carGroupModal: false,
    changeGroupModal: false,
    searchSchema: {
      carNo: {
        label: '搜索',
        placeholder: '请输入车牌号',
        component: 'input',
      },
      carType: {
        label: '车辆类型',
        placeholder: '请输入车辆类型',
        component: 'input'
      },
      carBelong: {
        label: '车辆所属',
        placeholder: '请选择车辆所属',
        component: 'select',
        options: [
          {
            label: '自有',
            key: 1,
            value: 1,
          },
          {
            label: '外部',
            key: 2,
            value: 2,
          },
        ]
      },
      carGroupId: {
        label: '车组',
        placeholder: '请选择车组',
        component: "select",
        options: []
      }
    }
  }

  organizationId = getUserInfo().organizationId

  tableSchema = {
    variable: true,
    minWidth: 1200,
    columns: [
      {
        title: '状态',
        dataIndex: 'auditStatus',
        // filters: AUDIT_STATUS_OPTIONS,
        filterMultiple: false, // 是否多选 默认多选
        render: (_text, record) => {
          const { auditStatus, perfectStatus } = record;
          const status = getAuditStatus({ auditStatus, perfectStatus });
          const { color, text } = find(AUDIT_STATUS_OPTIONS, { value: status });
          return <span style={{ color }}>● {text}</span>;
        },
        fixed: 'left'
      },
      {
        title: '车牌号',
        dataIndex: 'carNo',
        fixed: 'left'
      },
      {
        title: '车组',
        dataIndex: 'carGroupName',
        render: (text) => text || '--'
      },
      {
        title: '车辆类型',
        dataIndex: 'carType',
        render: (type) => {
          const cars = this.props.dictionaries.filter(item => item.dictionaryType === DICTIONARY_TYPE.CAR_TYPE);
          const carType = cars.find(({ dictionaryCode }) => dictionaryCode === type);
          if (carType) return carType.dictionaryName;
          return '';
        }
      },
      {
        title: '载重（kg）',
        dataIndex: 'carLoad'
      },
      {
        title: '轴数',
        dataIndex: 'axlesNum'
      },
      {
        title: '是否车头',
        dataIndex: 'isHeadstock',
        render: value => {
          if (value === null) return '';
          return value ? '是' : '否';
        }
      },
      {
        title: '是否自有车辆',
        dataIndex: 'organizationId',
        render : (value, record) => (
          <SelfCarSwitch
            organizationName={record.organizationName}
            organizationId={this.organizationId}
            rowOrganizationId={value}
            carId={record.carId}
            refresh={() => {
              this.getCar();
              this.getNewGroup();
            }}
          />
        )
      },
      {
        title: '基础认证',
        dataIndex: 'auditStatus',
        key: 'userId',
        render: (text) => {
          switch (text) {
            case AUDIT_STATUS.SUCCESS:
              return (
                <div style={{ paddingLeft: '15px' }}>
                  <Icon style={{ fontSize: '20px', color: 'rgb(31, 220, 74)' }} type="check-circle" theme="filled" />
                </div>
              );
            default: return (
              <div style={{ paddingLeft: '15px' }}>
                <Icon style={{ fontSize: '20px', color: 'rgb(216, 30, 6)' }} type="close-circle" theme="filled" />
              </div>
            );
          }
        }
      },
      {
        title: '完善信息',
        dataIndex: 'perfectStatus',
        render: (text) => {
          switch (text) {
            case PERFECT_STATUS.SUCCESS:
              return (
                <div style={{ paddingLeft: '15px' }}>
                  <Icon style={{ fontSize: '20px', color: 'rgb(31, 220, 74)' }} type="check-circle" theme="filled" />
                </div>
              );
            case PERFECT_STATUS.FAILED:
              return (
                <div style={{ paddingLeft: '15px' }}>
                  <Icon style={{ fontSize: '20px', color: 'rgb(216, 30, 6)' }} type="close-circle" theme="filled" />
                </div>
              );
            case PERFECT_STATUS.filled:
              return (
                <div style={{ paddingLeft: '15px' }}>
                  <Icon style={{ fontSize: '20px' }} type="check-circle" theme="filled" />
                </div>
              );
            default: return (
              <div style={{ paddingLeft: '15px' }}>
                <Icon style={{ fontSize: '20px' }} type="close-circle" theme="filled" />
              </div>
            );
          }
        }
      }
    ],
    operations: (record) => {
      const { auditStatus, perfectStatus } = record;
      const modify = {
        title: '编辑',
        onClick: ({ carId }) => {
          router.push(`carManagement/edit?pageKey=${carId}&carId=${carId}`);
        }
      };

      const deleteCar = {
        title: '删除',
        onClick: (record) => {
          // TODO 删除
          confirm({
            title: '删除提示',
            content: `你确定要删除车辆【${record.carNo}】吗？`,
            okText: '确定',
            cancelText: '取消',
            onOk: () => {
              this.handleDetele(record)
                .then(() => this.getCar(this.props.filter));
            },
            onCancel: () => { }
          });
        },
      };

      const detail = {
        title: '详情',
        onClick: ({ carId }) => {
          router.push(`carManagement/detail?pageKey=${carId}&carId=${carId}`);
        }
      };

      const changeGroup = {
        title: '变更车组',
        onClick: ({ carId, carGroupId }) => {
          this.setState({
            changeGroupModal: true,
            editCarId: carId,
            editCarGroupId: carGroupId
          });
        }
      };

      const status = getAuditStatus({ auditStatus, perfectStatus });

      const operations = {
        [CAR_AUDIT_STATUS.FAIL]: [detail, modify, deleteCar, changeGroup],
        [CAR_AUDIT_STATUS.SUCCESS]: [detail, deleteCar, changeGroup],
        [CAR_AUDIT_STATUS.UNAUDITED]: [detail, modify, deleteCar, changeGroup],
        [CAR_AUDIT_STATUS.PART_SUCCESS]: [detail, modify, deleteCar, changeGroup],
        [CAR_AUDIT_STATUS.EXPIRE]: [detail, deleteCar, changeGroup],
      }[status];

      return operations;
    }
  }

  componentDidMount () {
    const { localData = { formData: {} } } = this;
    const params = {
      ...localData.formData,
      offset: localData.nowPage ? localData.pageSize * ( localData.nowPage - 1 ) : 0,
      limit: localData.pageSize ? localData.pageSize : 10,
    };
    this.setState({
      nowPage: localData.nowPage || 1,
      pageSize: localData.pageSize || 10,
    });
    this.props.setFilter({ ...params });
    this.getCar({ ...params });
    this.getNewGroup();
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

  getNewGroup = () => {
    const params = { isAvailable: true, offset: 0, limit: 1000, isOrderByTime: true };
    getCarGroups(params).then(({ items }) => {
      const searchSchema = {
        carNo: {
          label: '搜索',
          placeholder: '请输入车牌号',
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
        carType: {
          label: '车辆类型',
          placeholder: '请输入车辆类型',
          component: 'input'
        },
        carBelong: {
          label: '车辆所属',
          placeholder: '请选择车辆所属',
          component: 'select',
          options: [
            {
              label: '自有',
              key: 1,
              value: 1,
            },
            {
              label: '外部',
              key: 2,
              value: 2,
            },
          ]
        },
        carGroupId: {
          label: '车组',
          placeholder: '请选择车组',
          component: "select",
          options: items.map(item => ({
            label: item.carGroupName,
            key: item.carGroupId,
            value: item.carGroupId,
          }))
        }
      };
      this.setState({
        searchSchema
      });
    });
  }

  addCars = () => {
    this.props.clearEntity();
    router.push('/basic-setting/carManagement/add');
  }

  editCars = (carId) => {
    router.push(`/basic-setting/carManagement/edit/${carId}`);
  }

  getCar = (params = {}) => {
    this.props.getCars({ ...this.props.filter, ...params, isOrderByTime: true });
  }

  handleDetele = ({ orgCarId }) => deleteShipmentCar({ orgCarId })
    .then(() => this.props.getCars({ ...this.props.filter }))

  searchTable = () => {
    const { searchSchema } = this.state;
    const layout = {
      labelCol: {
        xs: { span: 24 },
        sm: { span: 8 },
        xl: { span: 6 }
      },
      wrapperCol: {
        xs: { span: 24 },
        sm: { span: 16 },
        xl: { span: 18 }
      }
    };
    return (
      <>
        <Button type='primary' onClick={this.addCars}>+ 添加车辆</Button>
        <Button type='primary' style={{ marginLeft: '20px' }} onClick={this.toggleGroupModal}>编辑车组</Button>
        <SearchForm layout="inline" {...layout} schema={searchSchema} mode={FORM_MODE.SEARCH}>
          <Item field='carNo' />
          <Item field='carType' />
          <Item field='carBelong' />
          <Item field='carGroupId' />
          <DebounceFormButton label="查询" type="primary" onClick={this.handleSearchBtnClick} />
        </SearchForm>
      </>
    );
  }

  toggleGroupModal = () => {
    const { carGroupModal } = this.state;
    if (carGroupModal) this.getCar();
    this.setState({
      carGroupModal: !carGroupModal
    });
  }

  toggleChangeGroupModal = () => {
    const { changeGroupModal } = this.state;
    this.setState({
      changeGroupModal: !changeGroupModal
    });
  }

  handleSearchBtnClick = (value) => {
    this.setState({
      nowPage: 1
    });
    const newFilter = this.props.setFilter({ ...this.props.filter, carNo: value.carNo, carType: value.carType, carBelong: value.carBelong, offset: 0 });
    this.getCar({ ...newFilter });
  }

  onChange = (pagination, filters) => {
    const { offset, limit, current } = translatePageType(pagination);
    const { auditStatus } = filters;
    this.setState({
      nowPage: current,
      pageSize: limit
    });
    const newFilter = this.props.setFilter({ offset, limit, auditStatus });
    this.getCar({ ...newFilter });
  }

  render () {
    const { nowPage, pageSize, carGroupModal, changeGroupModal, editCarId, editCarGroupId } = this.state;
    const { items = [], count = 0 } = this.props.cars;
    return (
      <>
        <Table
          rowKey="carId"
          dataSource={{ items, count }}
          onChange={this.onChange}
          pagination={{ current: nowPage, pageSize }}
          schema={this.tableSchema}
          renderCommonOperate={this.searchTable}
        />
        <Modal
          destroyOnClose
          maskClosable={false}
          visible={carGroupModal}
          title='编辑车组'
          width='1050px'
          onCancel={() => {
            this.toggleGroupModal();
            this.getNewGroup();
            this.getCar();
          }}
          footer={null}
        >
          <EditCarGroup />
          {/* <EditCarGroup needCarGroupId closeModal={this.toggleGroupModal} getCarGroupId={this.hhh} /> */}
        </Modal>
        <Modal
          destroyOnClose
          maskClosable={false}
          visible={changeGroupModal}
          title='变更车组'
          width='700px'
          onCancel={this.toggleChangeGroupModal}
          footer={null}
        >
          <ChangeCarGroup
            carId={editCarId}
            carGroupId={editCarGroupId}
            closeModal={this.toggleChangeGroupModal}
            refresh={() => {
              this.getCar();
              this.getNewGroup();
            }}
          />
        </Modal>
      </>
    );
  }
}

