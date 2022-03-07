import React, { Component } from 'react';
import { Modal, Table as NatureTable, InputNumber, message, Button } from "antd";
import { connect } from 'dva';
import { Item, FormButton, FORM_MODE } from '@gem-mine/antd-schema-form';
import DebounceFormButton from '@/components/DebounceFormButton';
import router from 'umi/router';
import moment from 'moment';
import ImageDetail from '@/components/ImageDetail';
import Table from '@/components/Table/Table';
import { pick, translatePageType, getOssImg, uniqBy, isNumber, debounce, omit } from '@/utils/utils';
import { IS_EFFECTIVE_STATUS, CHARGE_MODE } from '@/constants/project/project';
import transportModel from '@/models/transports';
import { getUserInfo } from '@/services/user';
import SearchForm from '@/components/Table/SearchForm2';
import TableContainer from '@/components/Table/TableContainer';
import NumberInput from './NumberInput';
import '@gem-mine/antd-schema-form/lib/fields';

// let _value = []

let _offset = 0;

const { actions: { getTransports, detailTransports, modifyTransportCost, getSpecialTransport } } = transportModel;

function mapStateToProps (state) {
  return {
    transports: pick(state.transports, ['items', 'count']),
    transportDetail: state.transports.entity,
    transportAccount: state.transportAccount.entity
  };
}


@connect(mapStateToProps, { getTransports, detailTransports, modifyTransportCost, getSpecialTransport })
@TableContainer({ iseffectiveStatus: IS_EFFECTIVE_STATUS.IS_EFFECTIVE_NORMAL, isSelectAccount: true })
export default class TransportAccountBill extends Component {

  organizationType = getUserInfo().organizationType

  natureTableColumns = [
    {
      title: '运单号',
      dataIndex: 'transportNo',
      width: '200px'
    },
    {
      title: '运费总价',
      dataIndex: 'transportCost',
      render: (text, record) => (
        <InputNumber style={{ width:'100%' }} precision={2} placeholder='请输入金额' defaultValue={text} onChange={(value) => this.changeFreightCost(value, record, 'transportCost')} />
      ),
      width: '200px'
    },
    {
      title: '货损赔付',
      dataIndex: 'damageCompensation',
      render: (text, record) => (
        <InputNumber style={{ width:'100%' }} precision={2} placeholder='请输入金额' defaultValue={text} onChange={(value) => this.changeFreightCost(value, record, 'damageCompensation')} />
      ),
      width: '200px'
    }
  ]

  searchSchema = {
    projectName: {
      label: '项目名称',
      placeholder: '请输入项目名称',
      component: 'input'
    },
    receivingTime:{
      label: '签收日期',
      component: 'rangePicker'
    },
    transportNo: {
      label: '运单号',
      component: 'input',
      placeholder: '请输入运单号'
    },
    receivingNo :{
      label: '签收单号',
      component: 'input',
      placeholder: '请输入签收单号'
    },
    shipmentOrganizationName:{
      label: '承运方',
      component: 'input',
      placeholder: '请输入承运方'
    },
    goodsName:{
      label: '货品名称',
      placeholder: '请输入货品名称',
      component: 'input'
    },
    deliveryTime: {
      label: '提货时间',
      component: 'rangePicker'
    },
    deliveryName:{
      label: '提货点',
      placeholder: '请输入提货点',
      component: 'input'
    },
    receivingName:{
      label: '卸货点',
      placeholder: '请输入卸货点',
      component: 'input'
    },
    packagingMethod:{
      label: '包装',
      placeholder: '请选择包装方式',
      component: 'select',
      options: [{
        label: '袋装',
        key: 1,
        value: 1
      }, {
        label: '散装',
        key: 2,
        value: 2
      }]
    },
    materialQuality:{
      label: '材质',
      placeholder: '请输入材质',
      component: 'input'
    },
    specificationType:{
      label: '规格型号',
      placeholder: '请输入规格型号',
      component: 'input'
    },
    driverUserName:{
      label: '司机',
      placeholder: '请输入司机',
      component: 'input'
    },
    plateNumber:{
      label: '车牌号',
      placeholder: '请输入车牌号',
      component: 'input'
    },
    accountTransportNo:{
      label: '承运对账单',
      placeholder: '请输入承运对账单号',
      component: 'input'
    },
    transportCost:{
      label: '输入运费',
      placeholder: '0.00元',
      component: NumberInput
    }
  }

  constructor (props){
    super(props);
    // _value = []
    _offset = 0;
    this._accountChange = debounce(this.accountChange);
    const { accountOrgType, getSpecialTransport, getTransports } = props;
    this.getTransports = `${accountOrgType}` === '2'?getSpecialTransport:getTransports;
    const tableSchema = {
      variable: true,
      minWidth:2800,
      columns: [
        {
          title: '运单号',
          dataIndex: 'transportNo',
          fixed: 'left',
        },
        {
          title: '项目名称',
          dataIndex: 'projectName',
          render: (text, record) => <a onClick={()=> this.toProject(record.projectId)}>{text}</a>
        },
        {
          title: '运单类型',
          dataIndex: 'transportType',
          render: text => {
            // transportType: 运单类型(1.自营运单，2.网络货运运单)
            const config = ['自营运单', '网络货运运单'];
            return config[text-1];
          }
        },
        {
          title: '总运费（元）',
          dataIndex: 'transportCost',
          render: text => `${(text || 0)._toFixed(2)}元`
          // render: (text, record) => {
          //   const { transportPriceEntities, shipmentType } = record
          //   const transportConfig = (transportPriceEntities || []).find(item => `${item.transportPriceType}` === `${accountOrgType}` ) || {}
          //   const { transportCost, shipmentTransportCost } = transportConfig
          //   let total = transportCost
          //   if (!shipmentType && `${accountOrgType}` === '2') {
          //     total = (shipmentTransportCost || 0).toFixed(2)
          //   }
          //   return `${(total || 0)._toFixed(2)}元`
          // }
        },
        {
          title: '服务费（元）',
          dataIndex: 'serviceCharge',
          render: (text, record) => record.transportType === 1 ? '--' :`${(text || 0)._toFixed(2)}元`
        },
        {
          title: '货损赔付（元）',
          dataIndex: 'damageCompensation',
          render: text => `${(text || 0)._toFixed(2)}元`
        },
        {
          title: '应付账款（元）',
          dataIndex: 'receivables',
          render: (text, record) => {
            const { transportPriceEntities, shipmentType } = record;
            const transportConfig = (transportPriceEntities || []).find(item => `${item.transportPriceType}` === `${accountOrgType}` ) || {};
            const { serviceCharge, transportCost, damageCompensation, shipmentTransportCost } = transportConfig;
            let total = ((transportCost || 0) + (serviceCharge || 0) - (damageCompensation || 0)).toFixed(2);
            if (!shipmentType && `${accountOrgType}` === '2') {
              total = ((shipmentTransportCost || 0) + (serviceCharge || 0) - (damageCompensation || 0)).toFixed(2);
            }
            return `${total._toFixed(2)}元`;
          }
        },
        {
          title: '签收单号',
          dataIndex: 'receivingNo',
          render: (text, record) => {
            if (text) return text;
            if (record.billNumber) return record.billNumber;
            return '--';
          }
        },
        {
          title: '签收时间',
          dataIndex: 'receivingTime',
          render: (text, record) => {
            const time = text||record.signTime;
            return time? moment(time).format('YYYY-MM-DD HH:mm:ss') : '--';
          },
        },
        {
          title: '提货点',
          dataIndex: 'deliveryItems',
          render: (text) => {
            const list = text.map((item) => <li title={`${item.deliveryName}`} className="test-ellipsis" key={item.goodsId}>{item.deliveryName}</li>);
            return <ul style={{ padding: 0, margin: 0 }}>{list}</ul>;
          },
        },
        {
          title: '货品名称',
          dataIndex: 'goodsName',
          render: (text, record) => {
            const list = record.deliveryItems.map((item) => <li title={`${item.categoryName}${item.goodsName}`} className="test-ellipsis" key={item.goodsId}>{`${item.categoryName}${item.goodsName}`}</li>);
            return <ul style={{ padding: 0, margin: 0 }}>{list}</ul>;
          },
        },
        {
          title: '规格型号',
          dataIndex: 'specificationType',
          render: (text, record) => {
            const list = record.deliveryItems.map((item) => {
              const word = item.specificationType === null ? '--' : item.specificationType;
              return <li title={`${word}`} className="test-ellipsis" key={item.goodsId}>{`${word}`}</li>;
            });

            return <ul style={{ padding: 0, margin: 0 }}>{list}</ul>;
          },
        },
        {
          title: '材质',
          dataIndex: 'materialQuality',
          render: (text, record) => {
            const list = record.deliveryItems.map((item) => {
              const word = item.materialQuality === null ? '--' : item.materialQuality;
              return <li title={`${word}`} className="test-ellipsis" key={item.goodsId}>{`${word}`}</li>;
            });

            return <ul style={{ padding: 0, margin: 0 }}>{list}</ul>;
          },
        },
        {
          title: '包装',
          dataIndex: 'packagingMethod',
          render: (text, record) => {
            const list = record.deliveryItems.map((item) => {
              let word = '--';
              if (item.packagingMethod === 1) {
                word = '袋装';
              } else if (item.packagingMethod === 2) {
                word = '散装';
              }
              return <li title={`${word}`} className="test-ellipsis" key={item.goodsId}>{`${word}`}</li>;
            });

            return <ul style={{ padding: 0, margin: 0 }}>{list}</ul>;
          },
        },
        {
          title: '提货量',
          dataIndex: 'deliveryNum',
          render: (text, record) => {
            const list = record.deliveryItems.map((item) => {
              const word = item.deliveryNum === null ? '--' : `${item.deliveryNum}${item.deliveryUnitCN}`;
              return <li title={`${word}`} className="test-ellipsis" key={item.goodsId}>{`${word}`}</li>;
            });

            return <ul style={{ padding: 0, margin: 0 }}>{list}</ul>;
          },
        },
        {
          title: '卸货量',
          dataIndex: 'receivingNum',
          render: (text, record) => {
            const list = record.deliveryItems.map((item) => {
              const word = item.receivingNum === null ? '--' : `${item.receivingNum}${item.receivingUnitCN}`;
              return <li title={`${word}`} className="test-ellipsis" key={item.goodsId}>{`${word}`}</li>;
            });

            return <ul style={{ padding: 0, margin: 0 }}>{list}</ul>;
          },
        },
        {
          title: '磅差比',
          dataIndex: 'Pounddifference',
          render: (text, record) => {
            const list = record.deliveryItems.map((item) => {
              const Pounddifference = (item.deliveryNum - item.receivingNum) * 1000 / (item.deliveryNum);
              const word = Pounddifference.toFixed(1)._toFixed(1);
              return <li title={`${word}`} style={{ color: word >= 3 ? 'red' : 'inherit' }} className="test-ellipsis" key={item.goodsId}>{`${word}‰`}</li>;
            });

            return <ul style={{ padding: 0, margin: 0 }}>{list}</ul>;
          }
        },
        {
          title: '卸货点',
          dataIndex: 'receivingName',
        },
        {
          title: '司机',
          dataIndex: 'driverNameBank'
        },
        {
          title: '车牌号',
          dataIndex: 'plateNumber',
          render: (text, record) => {
            if (text) return text;
            if (record.carNo) return record.carNo;
            return 'bug';
          }
        },
        {
          title: '查看',
          dataIndex: 'looking',
          render: (text, record) => (
            <>
              {/* // 运输对账单的查看操作 */}
              <a onClick={() => this.watchTransportDetail(record)} style={{ marginRight: '10px' }}>详情</a>
              <a onClick={() => this.watchDeliveryBills(record)} style={{ marginRight: '10px' }}>提货单</a>
              <a onClick={() => this.watchReceivingBills(record)} style={{ marginRight: '10px' }}>签收单</a>
            </>
          ),
          fixed: 'right'
        }
      ],
      operations: (record) => {
        let operations = [];
        const { billAuth, accountOrgType } = this.props;
        operations = [
          {
            title: '调账',
            auth:record.shipmentType === 0 && `${accountOrgType}` === '2' ? ['hide'] : [...billAuth],
            onClick: (record) => {
              this.setState({
                _selectedGoods: record,
                accountModal: true
              });
            }
          }
        ];
        return operations;
      }
    };
    this.state = {
      selectedRow: [],
      nowPage: 1,
      pageSize: 10,
      ready:false,
      deliveryModal:false,
      receivingModal:false,
      tableSchema
    };
  }

  componentDidMount () {
    const { condition, mode, accountOrgType } = this.props;
    const { getTransports } = this;
    if ( mode === 'add' || mode === 'modify' ) {
      getTransports({
        limit: 10,
        offset: 0,
        iseffectiveStatus: IS_EFFECTIVE_STATUS.IS_EFFECTIVE_NORMAL,
        transportPriceType:accountOrgType,
        isSelectAccount: true,
        ...condition
      })
        .then(() => {
          this.setState({
            ready:true
          });
        });
    } else {
      this.setState({
        ready:true
      });
    }
  }

  static getDerivedStateFromProps (props, state){
    const { isModify, readOnly, value } = props;
    // 修改状态下，若有value值，则state.selectedRow = props.value
    if (props.value&&props.value.length!==0&&isModify===true){
      state.selectedRow = value;
    }
    if (readOnly){
      delete state.tableSchema.operations;
    }
    return state;
  }

  toProject = projectId => {
    router.push(`/buiness-center/project/projectManagement/projectDetail?projectId=${projectId}`);
  }

  countTotalPrice = (items, chargeMode) => {
    const num = {
      [CHARGE_MODE.DELIVERY]: 'deliveryNum',
      [CHARGE_MODE.RECEIVING]: 'receivingNum'
    }[chargeMode];

    return items.reduce((total, current) => {
      const freightCost = current.freightPrice === null ? 0 : current.freightPrice;
      return total + (freightCost * current[num]);
    }, 0);
  }

  changeFreightCost = (value, record, key) => {
    const reg = /^\d+\.?\d{0,2}$/;
    if (reg.test(value)){
      record[`_${key}`] = (+value);
    } else if (value<0){
      record[`_${key}`] = record[`${key}`] || 0;
      message.info('无效价格(最高支持两位小数)');
    } else {
      record[`_${key}`] = record[`${key}`] || 0;
    }
    const { _selectedGoods } = this.state;
    // 当输入框失焦时，记录下输入框的内容
    this.setState({
      _selectedGoods
    });
  }

  watchTransportDetail = record => {
    const { mode } = this.props;
    if (mode===FORM_MODE.DETAIL){
      router.push(`transportAccountBillDetail/transportDetail?transportId=${record.transportId}`);
    } else if (mode===FORM_MODE.ADD) {
      router.push(`createTransportAccountBill/transportDetail?transportId=${record.transportId}`);
    } else if (mode===FORM_MODE.MODIFY) {
      router.push(`modifyTransportAccountBill/transportDetail?transportId=${record.transportId}`);
    }
  }

  // 查看提货单
  watchDeliveryBills = async record => {
    if (this.props.transportDetail.transportId !== record.transportId) {
      await this.props.detailTransports({ transportId: record.transportId });
    }
    this.setState({
      deliveryModal: true
    });
  }

  watchReceivingBills = async record => {
    if (this.props.transportDetail.transportId !== record.transportId) {
      await this.props.detailTransports({ transportId: record.transportId });
    }
    this.setState({
      receivingModal: true
    });
  }

  onSelectRow = selectedRow => {
    const { onChange } = this.props;
    onChange(selectedRow);
    this.setState({
      selectedRow
    });
  }

  onChange = (pagination) => {
    pagination.pageSize -= _offset;
    const { offset, limit, current } = translatePageType(pagination);
    this.setState({
      nowPage: current,
      pageSize: limit
    });
    const newFilter = this.props.setFilter({ offset, limit, ...this.props.condition });
    this.getTransports({ ...newFilter });
  }

  isLegalValue = value => {
    let check = true;
    const reg = /^\d+\.?\d{0,2}$/;
    if (!reg.test(value)) {
      check = false;
    }
    if (value<0) {
      check = false;
    }
    return check;
  }

  accountChange = () => {
    const { _selectedGoods, selectedRow } = this.state;
    const { onChange, accountOrgType } = this.props;
    if (isNumber(_selectedGoods._transportCost) || isNumber(_selectedGoods._damageCompensation)) {
      _selectedGoods.transportCost = isNumber(_selectedGoods._transportCost)? _selectedGoods._transportCost : (_selectedGoods.transportCost || 0);
      _selectedGoods.damageCompensation = isNumber(_selectedGoods._damageCompensation)? _selectedGoods._damageCompensation : (_selectedGoods.damageCompensation || 0);
      const dataArray = [{ transportId:_selectedGoods.transportId, transportCost:_selectedGoods.transportCost, damageCompensation:_selectedGoods.damageCompensation, transportType:_selectedGoods.transportType }];
      // priceType 调账类型： 0批量 1单条
      this.props.modifyTransportCost({ dataArray, priceType:1, accountOrgType })
        .then((data)=> {
          delete _selectedGoods._transportCost;
          delete _selectedGoods._damageCompensation;
          this.setState({
            accountModal:false
          }, ()=>{
            selectedRow.forEach(item => {
              if (item.transportId === _selectedGoods.transportId) {
                const { serviceCharge } = data?.[0];
                item.transportCost = _selectedGoods.transportCost;
                item.damageCompensation = _selectedGoods.damageCompensation;
                item.serviceCharge = serviceCharge;
                _selectedGoods.serviceCharge = serviceCharge;
                _selectedGoods.transportPriceEntities = data;
              }
            });
            onChange(selectedRow);
          });
        });
    } else {
      this.setState({
        accountModal:false
      });
    }
  }

  searchTableList = () => {
    if (this.props.mode === FORM_MODE.DETAIL || this.props.searchFrom === false) {
      return null;
    }
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

    const handleSearchBtnClick = (formData) => {
      const defaultValue = this.props.isModify?this.props.transportAccount.accountDetailItems:[];
      this.setState({
        nowPage: 1,
        selectedRow:defaultValue
      });
      this.props.onChange(defaultValue);
      this.tableRef.resetSelectedRows(defaultValue);
      const receivingStartTime = formData.receivingTime?.[0]?.set({ hour: 0, minute: 0, second: 0, millisecond: 0 }).format('YYYY/MM/DD HH:mm:ss');
      const receivingEndTime = formData.receivingTime?.[1]?.set({ hour: 23, minute: 59, second: 59, millisecond: 999 }).format('YYYY/MM/DD HH:mm:ss');
      const deliveryStartTime = formData.deliveryTime?.[0]?.set({ hour: 0, minute: 0, second: 0, millisecond: 0 }).format('YYYY/MM/DD HH:mm:ss');
      const deliveryEndTime = formData.deliveryTime?.[1]?.set({ hour: 23, minute: 59, second: 59, millisecond: 999 }).format('YYYY/MM/DD HH:mm:ss');
      const { projectName, goodsName, deliveryName, receivingName, packagingMethod, specificationType, materialQuality, driverUserName, plateNumber } = formData;
      const newFilter = this.props.setFilter({ deliveryStartTime, deliveryEndTime, projectName, goodsName, deliveryName, receivingName, packagingMethod, specificationType, materialQuality, driverUserName, plateNumber, receivingStartTime, receivingEndTime, offset: 0, ...this.props.condition });
      this.getTransports(omit(newFilter, ['receivingTime', 'deliveryTime']));
    };

    const handleResetBtnClick = () => {
      const newFilter = this.props.resetFilter({ ...this.props.condition });
      this.setState({
        nowPage: 1,
        pageSize: 10
      });
      this.getTransports({ ...newFilter });
    };

    const handleBatchAccountBtnClick = () => {
      const { selectedRow = [] } = this.state;
      const _selectedRow = uniqBy(selectedRow, 'projectId');
      // if (_selectedRow.length > 1) {
      //   message.error('批量调账只允许在同一项目下进行')
      //   return
      // }
      if (_selectedRow.length === 0) {
        message.error('请至少勾选一条运单');
        return;
      }
      const { transportCost } = this.props.filter;
      if (!this.isLegalValue(+transportCost)) return message.error('非法运价(最高支持两位小数)');
      const { initialValue, onChange, accountOrgType } = this.props;
      const checkShipmentType = selectedRow.find(item => item.shipmentType === 0 && `${accountOrgType}` === '2');
      if (checkShipmentType) return message.error('存在不可调价的运单');
      // 更改修改模式的默认值
      const dataArray = selectedRow.map(item => ({ transportId:item.transportId, transportCost, transportType:item.transportType, damageCompensation:(item.damageCompensation || 0) }));
      // 更改选取行的数据
      // priceType 调账类型： 0批量 1单条
      this.props.modifyTransportCost({ dataArray, priceType:0, accountOrgType })
        .then((data)=> {
          initialValue.forEach(item => {
            const priceEntity = data.find(priceItem => item.transportId === priceItem.transportId);
            if (priceEntity) {
              item.transportCost = priceEntity.transportCost;
              item.serviceCharge = priceEntity.serviceCharge;
              item.transportPriceEntities = [priceEntity];
            }
          });
          selectedRow.forEach(item => {
            const priceEntity = data.find(priceItem => item.transportId === priceItem.transportId);
            if (priceEntity) {
              item.transportCost = priceEntity.transportCost;
              item.serviceCharge = priceEntity.serviceCharge;
              item.transportPriceEntities = [priceEntity];
            }
          });
          this.setState({
            selectedRow
          });
          onChange(selectedRow);
        });
    };

    return (
      <SearchForm layout="inline" {...layout} mode={FORM_MODE.SEARCH} schema={this.searchSchema}>
        <Item field="projectName" />
        <Item field="transportNo" />
        <Item field="receivingNo" />
        <Item field="shipmentOrganizationName" />
        <Item field="receivingTime" />
        <Item field="goodsName" />
        <Item field="deliveryTime" />
        <Item field="deliveryName" />
        <Item field="receivingName" />
        <Item field="packagingMethod" />
        <Item field="specificationType" />
        <Item field="materialQuality" />
        <Item field="driverUserName" />
        <Item field="plateNumber" />
        <Item field="accountTransportNo" />
        <div style={{ textAlign:'right' }}>
          <div style={{ display:'inline-block', float:'left' }}>
            <DebounceFormButton label="查询" className="mr-10" type="primary" onClick={handleSearchBtnClick} />
            <Button className="mr-10" onClick={handleResetBtnClick}>重置</Button>
          </div>
          <div style={{ display:'inline-block' }}>
            <Item field="transportCost" />
            <Button type="primary" onClick={handleBatchAccountBtnClick}>批量调账</Button>
          </div>
        </div>
      </SearchForm>
    );
  }

  renderImageDetail = imageType => {
    const { transportDetail: { loadingItems=[], signItems=[] } } = this.props;
    let imageData;
    if (imageType === 'delivery') {
      imageData = loadingItems.map(item=>item.billDentryid.split(',').map(billDentry=>getOssImg(billDentry))).flat();
    } else if (imageType === 'receiving') {
      imageData = signItems.map(item=>item.billDentryid.split(',').map(billDentry=>getOssImg(billDentry))).flat();
    }
    return (
      <ImageDetail imageData={imageData} />
    );
  }

  render () {
    const { transports, value } = this.props;
    const { nowPage, pageSize, deliveryModal, receivingModal, accountModal, _selectedGoods, tableSchema, ready } = this.state;
    const { isModify, initialValue=[] } = this.props;
    const readOnly = this.props.mode === FORM_MODE.DETAIL;
    let selectKey = [];
    let _transports = transports;
    // 只有承运或平台才有修改对账单业务
    if (this.organizationType===5||this.organizationType===1) {
      _offset = initialValue.length;
      if (isModify){
        selectKey = value;
        if (nowPage===1&&initialValue.length!==0){
          // _value = [...value]
          _transports = { items:[...initialValue, ...transports.items], count:transports.count };
          // 第二页开始条数恢复正常
        } else if (nowPage !==1){
          // _value=[]
          _offset = 0;
          _transports = { items:_transports.items, count:transports.count };
        }
      }
    }
    if (readOnly) {
      _transports = { items: this.props.value };
    }
    return (
      <>
        <Modal
          title='提货单'
          footer={null}
          width={648}
          maskClosable={false}
          visible={deliveryModal}
          destroyOnClose
          onCancel={() => this.setState({ deliveryModal: false })}
        >
          {deliveryModal&&this.renderImageDetail('delivery')}
        </Modal>
        <Modal
          title='签收单'
          footer={null}
          width={648}
          maskClosable={false}
          destroyOnClose
          visible={receivingModal}
          onCancel={() => this.setState({ receivingModal: false })}
        >
          {receivingModal&&this.renderImageDetail('receiving')}
        </Modal>
        <Modal
          title='调账'
          width={800}
          onOk={this._accountChange}
          maskClosable={false}
          visible={accountModal}
          destroyOnClose
          onCancel={() => {
            delete _selectedGoods._transportCost;
            delete _selectedGoods._damageCompensation;
            this.setState({ accountModal: false, _selectedGoods });
          }}
        >
          <NatureTable rowKey='transportId' pagination={false} columns={this.natureTableColumns} dataSource={[_selectedGoods]} />
        </Modal>
        <Table ref={c=> this.tableRef = c} rowKey="transportId" onSelectRow={this.onSelectRow} selectKey={selectKey} renderCommonOperate={this.searchTableList} multipleSelect={!readOnly} pagination={{ current: nowPage, pageSize:pageSize+_offset }} onChange={this.onChange} schema={tableSchema} dataSource={ready?_transports : { items:[], count:0 }} />
      </>
    );
  }
}
