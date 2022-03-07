import React from 'react';
import router from 'umi/router';
import { Icon, Modal } from 'antd';
import { Item, FORM_MODE } from '@gem-mine/antd-schema-form';
import { connect } from 'dva';
import DebounceFormButton from '../../../../components/debounce-form-button';
import Table from '../../../../components/table/table';
import { _AUDIT_STATUS_OPTIONS, CAR_AUDIT_STATUS, AUDIT_STATUS, PERFECT_STATUS, CAR_STATUS_CONFIG } from '../../../../constants/car';
import { DICTIONARY_TYPE } from '../../../../services/dictionaryService';
import { getCertificationStatus, driverCarApply, editCar } from '../../../../services/carService';
import SearchForm from '../../../../components/table/search-form2';
import carModel from '../../../../models/cars';
import TableContainer from '../../../../components/table/table-container';
import { translatePageType, pick, find } from '../../../../utils/utils';
import '@gem-mine/antd-schema-form/lib/fields';

const { actions } = carModel;

function mapStateToProps (state) {
  return {
    dictionaries: state.dictionaries.items,
    cars: pick(state.cars, ['items', 'count'])
  };
}
@connect(mapStateToProps, actions)
@TableContainer()
export default class CarCertification extends React.Component {

  tableSchema = {
    columns: [
      {
        title: '状态',
        dataIndex: 'auditStatus',
        render: (value, record) => {
          const { auditStatus, perfectStatus } = record;
          const status = getCertificationStatus({ auditStatus, perfectStatus });
          const { color, text } = find(_AUDIT_STATUS_OPTIONS, { value:status });
          return <span style={{ color }}>● {text}</span>;
        }
      },
      {
        title: '车牌号',
        dataIndex: 'carNo'
      },
      {
        title: '车辆类型',
        dataIndex: 'carType',
        render: (type)=> {
          const cars = this.props.dictionaries.filter(item => item.dictionaryType === DICTIONARY_TYPE.CAR_TYPE);
          const carType = cars.find(({ dictionaryCode }) => dictionaryCode === type);
          if (carType) return carType.dictionaryName;
          return '';
        }
      },
      {
        title: '载重（吨）',
        dataIndex: 'carLoad'
      },
      {
        title: '轴数',
        dataIndex: 'axlesNum'
      },
      {
        title: '是否车头',
        dataIndex: 'isHeadstock',
        render: value => value ? '是' : '否'
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
      const enable = {
        title: '启用',
        onClick: this.toggleCarAvailable
      };
      const ban = {
        title: '禁用',
        onClick: this.toggleCarAvailable
      };
      const certificate = {
        title: '审核',
        onClick: ({ carId }) => {
          router.push(`car/certificate?carId=${carId}`);
        }
      };
      const detail = {
        title: '详情',
        onClick: ({ carId }) => {
          router.push(`car/detail?carId=${carId}`);
        }
      };
      // const deleteCard = {
      //   title: '删除',
      //   onClick: (record, index) => {
      //     // TODO 删除
      //     confirm({
      //       title: '删除提示',
      //       content: `你确定要删除车辆【${record.carNo}】吗？`,
      //       okText: '确定',
      //       cancelText: '取消',
      //       onOk: () => {
      //         this.handleDetele(record)
      //           .then(() => this.getCar())
      //       },
      //       onCancel: () => { }
      //     })
      //   },
      // }
      const { auditStatus, perfectStatus, isAvailable } = record;
      const status = getCertificationStatus({ auditStatus, perfectStatus });

      const operations={
        [CAR_AUDIT_STATUS.FAIL]:[isAvailable ? ban : enable ],
        [CAR_AUDIT_STATUS.SUCCESS]:[isAvailable ? ban : enable ],
        [CAR_AUDIT_STATUS.UNAUDITED]:[certificate],
        [CAR_AUDIT_STATUS.PART_SUCCESS]:[]
      }[status];

      return [detail, ...operations];
    }
  }

  constructor (props) {
    super(props);

    this.state = {
      current: 1,
      pageSize:10,
      visible:false,
      disableList:[]
    };
  }

  componentDidMount () {
    this.getCar();
  }

  getCar = (params = { limit: 10, offset: 0 }) => {
    this.props.getCars({ ...params, selectType: 1 });
  }

  toggleCarAvailable = car => this.props.patchCars({
    carId: car.carId,
    isAvailable: !car.isAvailable
  })

  onChange = (pagination, filters) => {
    const { offset, limit, current } = translatePageType(pagination);
    const auditStatus = filters.auditStatus ? filters.auditStatus[0] : undefined;
    const newFilter = this.props.setFilter({ offset, limit, auditStatus });

    this.getCar(newFilter);
    this.setState({ current, pageSize:limit });
  }

  searchSchema = {
    carNo:{
      label: '搜索',
      placeholder: '请输入车牌号',
      component: 'input'
    },
    status: {
      label: '状态',
      placeholder: '请选择车辆状态',
      component: 'select',
      options:[{
        label:'认证失败',
        value: 0,
        key:0
      }, {
        label:'已认证',
        value: 1,
        key:1
      }, {
        label:'待审核',
        value: 2,
        key:2
      }, {
        label:'部分认证',
        value: 3,
        key:3
      }]
    }
  }

  searchTable = () => {
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
      <SearchForm layout="inline" {...layout} schema={this.searchSchema} mode={FORM_MODE.SEARCH}>
        <Item field='status' />
        <Item field='carNo' />
        <DebounceFormButton label="查询" type="primary" onClick={this.handleSearchBtnClick} />
        <DebounceFormButton label="重置" style={{ marginLeft:'10px' }} onClick={this.handleResetBtnClick} />
      </SearchForm>
    );
  }

  handleSearchBtnClick = (value) => {
    const { pageSize } = this.state;
    const params = { ...value, limit: pageSize, offset: 0 };
    const { status } = value;
    const carStatus = CAR_STATUS_CONFIG[status];
    const newFilter = this.props.setFilter({ ...params, ...carStatus });
    this.getCar(newFilter);
    this.setState({ current: 1 });
  }

  handleResetBtnClick=()=>{
    const newFilter = this.props.resetFilter({});
    this.setState({
      current: 1,
      pageSize: 10
    });
    this.getCar(newFilter);
  }

  showDisable = () => {
    driverCarApply()
      .then((res) => {
        this.setState({
          disableList:res || [],
          visible:true
        });
      });
  }

  closeModal = () => {
    this.setState({ visible: false });
  }

  renderApplyList = () => {
    const { disableList } = this.state;
    const list = disableList.map(item => (
      <li key={item.driverCarApplyId}>
        <span>{item.carNo}</span>
        <a style={{ float:"right", marginRight:'30px' }} onClick={() => this.agree(item.carId)}>同意</a>
      </li>
    ));
    return (
      <ul>
        {list}
      </ul>
    );
  }

  agree = carId => {
    editCar(carId, { isAvailable:true })
      .then(() => driverCarApply())
      .then((res) => {
        this.setState({
          disableList:res || [],
        });
      });
  }

  render () {
    const { items = [], count = 0 } = this.props.cars;
    const { current, visible, pageSize } = this.state;

    return (
      <>
        <div style={{ backgroundColor:'rgba(245, 154, 35, 0.3)', color:'#F59A23', height:'40px', lineHeight:'40px', textAlign:'center' }}>
          司机请求启用车辆
          <span style={{ marginLeft:'10px', textDecoration:'underline' }} onClick={this.showDisable}>查看》</span>
        </div>
        <Table
          rowKey="carId"
          pagination={{ current, pageSize }}
          dataSource={{ items, count }}
          schema={this.tableSchema}
          onChange={this.onChange}
          renderCommonOperate={this.searchTable}
        />
        <Modal
          title='申请列表'
          footer={null}
          width={500}
          maskClosable={false}
          destroyOnClose
          visible={visible}
          onCancel={this.closeModal}
        >
          {this.renderApplyList()}
        </Modal>
      </>
    );
  }
}
