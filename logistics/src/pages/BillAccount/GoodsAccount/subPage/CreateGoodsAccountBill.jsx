import React from 'react';
import { Button, Modal, message, notification, Spin } from 'antd';
import { connect } from 'dva';
import { SchemaForm, FORM_MODE, Item, Observer } from '@gem-mine/antd-schema-form';
import moment from 'moment';
import router from 'umi/router';
import DebounceFormButton from '@/components/DebounceFormButton';
import SearchForm from '@/components/Table/SearchForm2';
import TableContainer from '@/components/Table/TableContainer';
import { getTransportList, createGoodsAccount, getTransportsSelectIdType } from "@/services/apiService";
import { translatePageType, getOssImg, flattenDeep, omit, uniqBy, disableDateAfterToday, formatMoney, classifyGoodsWeight, getLocal } from '@/utils/utils';
import ImageDetail from '@/components/ImageDetail';
import { getUserInfo } from '@/services/user';
import transportModel from '@/models/transports';
import SelectAllPageTable from "@/components/SelectAllPageTable/SelectAllPageTable";
import { IS_EFFECTIVE_STATUS, ACCOUNT_STATUS, CONSIGNMENT_TYPE } from '@/constants/project/project';
import '@gem-mine/antd-schema-form/lib/fields';
import styles from './billInfo.less';

const { actions: { detailTransports } } = transportModel;

function mapStateToProps (state) {
  return {
    transportDetail: state.transports.entity,
    commonStore: state.commonStore,
  };
}
const mapDispatchToProps = (dispatch) => ({
  detailTransports,
  deleteTab: (store, payload) => dispatch({ type: 'commonStore/deleteTab', store, payload }),
});
@connect(mapStateToProps, mapDispatchToProps)
// @FilterContextCustom
@TableContainer()
export default class Index extends React.Component{
  state = {
    nowPage: 1,
    pageSize: 10,
    ready: false,
    createBillModal: false,
    selectedRow : [],
    transportTotal : [],
    selectOnePageChecked : false
  }

  currentTab = this.props.commonStore.tabs.find(item => item.id === this.props.commonStore.activeKey);

  localData = getLocal(this.currentTab.id) || { formData: {} };

  time = this.localData && this.localData.formData && this.localData.formData.receivingTime && this.localData.formData.receivingTime.map(item => moment(item, 'YYYY/MM/DD'));

  form = null;

  organizationName = getUserInfo().organizationName

  keywords = {};

  tableRef = React.createRef()

  createSchema = {
    paymentTime: {
      label: '????????????',
      component: 'rangePicker',
      disabledDate: disableDateAfterToday,
      rules: {
        required: [true, '?????????????????????']
      }
    },
    remark: {
      label: '??????',
      component: 'input.textArea',
      placeholder: '???????????????'
    },
    totalCost: {
      label: '?????????',
      component: 'input.text'
    }
  }

  // ???????????????????????????????????????
  onModifyCurrentPageAndDelivery = () => {
    const { transportTotal, transports, transports: { items: transportItems } } = this.state;
    let selectOnePageChecked = true;

    transportItems && transportItems.forEach((item, key) => {
      // ????????????????????????????????????????????????????????????selected
      const currentElement = transportTotal.find(_item => _item.transportId === item.transportId);
      if (currentElement) item.selected = currentElement.selected;

      // ??????????????????????????????
      if (!transportItems[key].selected) selectOnePageChecked = false;
    });

    if (!transportItems || !transportItems.length) selectOnePageChecked = false;
    this.setState({ transports, selectOnePageChecked });
  };

  // ????????????
  onSelectRow = (selectedRow, selected, currentRow) => {
    const { transportTotal } = this.state;

    // 1. ???????????????
    if (selected) {
      for (let i = 0; i < transportTotal.length; i++) {
        if (transportTotal[i].transportId === currentRow.transportId) {
          transportTotal[i].selected = true;
          break;
        }
      }
    } else {
      for (let i = 0; i < transportTotal.length; i++) {
        if (transportTotal[i].transportId === currentRow.transportId) {
          transportTotal[i].selected = false;
          break;
        }
      }
    }

    this.setState({ transportTotal }, () => {
      this.onModifyCurrentPageAndDelivery();
    });
  };

  // ????????????
  onSelectOnePage = (selected) => {
    const { transportTotal, transports, transports : { items } } = this.state;

    /*
    * ?????????
    * ?????????????????????????????????????????????????????????????????????????????????transportTotal
    * ???????????????
    *       1. ??????transportTotal?????? 2.??????transportTotal????????????transports??????
    * ????????? ????????????transportTotal ??? transports
    * */
    let selectOnePageChecked = true;

    if (selected) {
      items.forEach(item=>{
        const currentElement = transportTotal.find(_item=>_item.transportId === item.transportId);
        item.selected = true;
        currentElement.selected = true;
        // selectOnePageChecked = true
      });
    } else {
      items.forEach(item=>{
        const currentElement = transportTotal.find(_item=>_item.transportId === item.transportId);
        item.selected = false;
        currentElement.selected = false;
        selectOnePageChecked = false;
      });
    }
    this.setState({ transportTotal, transports, selectOnePageChecked });

  };

  // ???????????????
  onSelectTotal = (selected) => {
    if (selected){
      const { transportTotal: _transportTotal } = this.state;
      // 1. ???????????????
      const transportTotal = _transportTotal.map(item => ({ ...item, selected: true }));
      this.setState({ transportTotal }, () => {
        this.onModifyCurrentPageAndDelivery();
      });
    } else {
      const { transportTotal: _transportTotal } = this.state;
      // 1. ???????????????
      const transportTotal = _transportTotal.map(item => ({ ...item, selected: false }));
      this.setState({ transportTotal }, () => {
        this.onModifyCurrentPageAndDelivery();
      });
    }

  };

  // ??????????????????
  getCheckboxProps = (record) => ({
    checked: record.selected
  });

  getMiniTransportList = (newParams) =>{
    /*
    * ????????????????????????
    * ???????????????????????????????????????????????????????????????????????????????????????????????????
    * ????????????????????????????????????????????????????????????????????????????????????????????????????????????this.props.onChange????????????????????????????????????
    * */

    const params = newParams || { ...this.apiField, limit: 100000, offset: 0, backListToGoodsAccount : true };

    this.setState({ miniTransportReady : false });
    getTransportsSelectIdType(params).then(({ items }) => {
      const transportTotal = items.map(item => ({ ...item, selected: false }));
      this.setState({ transportTotal, miniTransportReady : true });
    });
  }

  getMiniTransportListKeepSelect = (newParams) =>{
    const { transportTotal : oldTransportTotal } = this.state;
    const params = newParams || { ...this.apiField, limit: 100000, offset: 0, backListToGoodsAccount : true };
    // ???????????????????????????????????????????????????????????????
    const selectRow = oldTransportTotal.filter(item=>item.selected);

    this.setState({ miniTransportReady : false });
    getTransportsSelectIdType(params).then(({ items }) => {
      let transportTotal = items.map(item => ({ ...item, selected: false }));
      // ??????
      transportTotal = selectRow.concat(transportTotal);
      // ????????????????????????????????????
      transportTotal = uniqBy(transportTotal, 'transportId');

      this.setState({ transportTotal, miniTransportReady : true }, ()=>this.onModifyCurrentPageAndDelivery());
    });
  }


  componentDidMount () {
    const { localData, time } = this;
    const { filter, location: { query: { choisedProject } } } = this.props;
    const { offset, limit } = filter;
    this.tableSchema = {
      variable: true,
      minWidth:3000,
      columns: [
        {
          title: '?????????',
          dataIndex: 'transportNo',
          fixed: 'left',
          width: '200px',
        },
        {
          title: '????????????',
          dataIndex: 'projectName',
        },
        {
          title: '????????????',
          dataIndex: 'receivingNo',
          render: (text, record) => {
            if (text) return text;
            if (record.billNumber) return record.billNumber;
            return '--';
          }
        },
        {
          title: '????????????',
          dataIndex: 'receivingTime',
          render: (text, record) => {
            const time = text||record.signTime;
            return time? moment(time).format('YYYY-MM-DD HH:mm:ss'): '--';
          },
        },
        {
          title: '?????????',
          dataIndex: 'deliveryItems',
          render: (text) => {
            const list = text.map((item, index) => <li title={`${item.deliveryName}`} className="test-ellipsis" key={index}>{item.deliveryName}</li>);
            return <ul style={{ padding: 0, margin: 0 }}>{list}</ul>;
          },
        },
        {
          title: '????????????',
          dataIndex: 'goodsName',
          render: (text, record) => {
            const list = record.deliveryItems.map((item, index) => <li title={`${item.categoryName}${item.goodsName}`} className="test-ellipsis" key={index}>{`${item.categoryName}${item.goodsName}`}</li>);

            return <ul style={{ padding: 0, margin: 0 }}>{list}</ul>;
          },
        },
        {
          title: '????????????',
          dataIndex: 'specificationType',
          render: (text, record) => {
            const list = record.deliveryItems.map((item, index) => {
              const word = item.specificationType === null ? '--' : item.specificationType;
              return <li title={`${word}`} className="test-ellipsis" key={index}>{`${word}`}</li>;
            });

            return <ul style={{ padding: 0, margin: 0 }}>{list}</ul>;
          },
        },
        {
          title: '??????',
          dataIndex: 'materialQuality',
          render: (text, record) => {
            const list = record.deliveryItems.map((item, index) => {
              const word = item.materialQuality === null ? '--' : item.materialQuality;
              return <li title={`${word}`} className="test-ellipsis" key={index}>{`${word}`}</li>;
            });

            return <ul style={{ padding: 0, margin: 0 }}>{list}</ul>;
          },
        },
        {
          title: '??????',
          dataIndex: 'packagingMethod',
          render: (text, record) => {
            const list = record.deliveryItems.map((item, index) => {
              let word = '--';
              if (item.packagingMethod === 1) {
                word = '??????';
              } else if (item.packagingMethod === 2) {
                word = '??????';
              }
              return <li title={`${word}`} className="test-ellipsis" key={index}>{`${word}`}</li>;
            });

            return <ul style={{ padding: 0, margin: 0 }}>{list}</ul>;
          },
        },
        {
          title: '?????????',
          dataIndex: 'deliveryNum',
          render: (text, record) => {
            const list = record.deliveryItems.map((item, index) => {
              const word = item.deliveryNum === null ? '--' : `${item.deliveryNum}${item.deliveryUnitCN}`;
              return <li title={`${word}`} className="test-ellipsis" key={index}>{`${word}`}</li>;
            });

            return <ul style={{ padding: 0, margin: 0 }}>{list}</ul>;
          },
        },
        {
          title: '?????????',
          dataIndex: 'receivingNum',
          render: (text, record) => {
            const list = record.deliveryItems.map((item, index) => {
              const word = item.receivingNum === null ? '--' : `${item.receivingNum}${item.receivingUnitCN}`;
              return <li title={`${word}`} className="test-ellipsis" key={index}>{`${word}`}</li>;
            });

            return <ul style={{ padding: 0, margin: 0 }}>{list}</ul>;
          },
        },
        {
          title: '?????????',
          dataIndex: 'weighNum',
          render: (text, record) => {
            const list = record.deliveryItems.map((item, index) => {
              const word = item.weighNum === null ? '--' : `${item.weighNum}${item.receivingUnitCN}`;
              return <li title={`${word}`} className="test-ellipsis" key={index}>{`${word}`}</li>;
            });

            return <ul style={{ padding: 0, margin: 0 }}>{list}</ul>;
          },
        },
        {
          title: '??????',
          dataIndex: 'freightCost',
          render: (text, record) => {
            const list = record.deliveryItems.map((item, index) => {
              const word = item?.accountModifyPriceEntities?.[0]?.freightCost?.toFixed(2)._toFixed(2) || '';
              return <li title={`${word? `${word}???`: '--'}`} className="test-ellipsis" key={index}>{`${word? `${word}???`: '--'}`}</li>;
            });
            return <ul style={{ padding: 0, margin: 0 }}>{list}</ul>;
          }
        },
        {
          title: '?????????',
          dataIndex: 'receivingName'
        },
        {
          title: '??????',
          dataIndex: 'totalFreight',
          render: (text, record) => `${record.accountGoodsPriceEntities?.[0]?.totalPrice?.toFixed(2)._toFixed(2) || 0} ???`,
        },
        {
          title: '??????',
          dataIndex: 'driverUserName'
        },
        {
          title: '?????????',
          dataIndex: 'plateNumber',
          render: (text, record) => {
            if (text) return text;
            if (record.carNo) return record.carNo;
            return 'bug';
          }
        },
        {
          title : '????????????',
          dataIndex: 'billRecycleStatus',
          render : (text)=>{
            const dist = {
              1 : '??????',
              2 : '??????',
              3 : '???????????????',
              4 : '???????????????',
              5 : '???????????????',
            };
            if (dist[text]) return dist[text];
            return '';
          }
        },
        {
          title: '????????????',
          dataIndex: 'outboundStatus',
          render: (text) => {
            const dist = {
              0 : '',
              1 : '????????????',
              2 : '?????????'
            };
            if (dist[text]) return dist[text];
            return '';
          }
        },
        {
          title: '??????',
          dataIndex: 'looking',
          render: (text, record) => (
            <>
              <a onClick={() => this.watchTransportDetail(record)} style={{ marginRight: '10px' }}>??????</a>
              <a onClick={() => this.watchReceivingSign(record)} style={{ marginRight: '10px' }}>??????</a>
              {
                record.receivingName? <a onClick={() => this.watchReceivingBills(record)} style={{ marginRight: '10px' }}>?????????</a>: false
              }
            </>
          ),
          width: '150px',
          fixed: 'right',
        }
      ],
    };
    this.searchSchema = {
      receivingTime:{
        label: '????????????',
        component: 'rangePicker',
        format:{
          input: (value) => {
            if (Array.isArray(value)) {
              return value.map(item => moment(item));
            }
            return value;
          },
          output: (value) => value
        },
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
      transportNo: {
        label: '?????????',
        component: 'input',
        placeholder: '??????????????????',
      },
      receivingNo :{
        label: '????????????',
        component: 'input',
        placeholder: '?????????????????????'
      },
      goodsName:{
        label: '????????????',
        placeholder: '?????????????????????',
        component: 'input'
      },
      deliveryName:{
        label: '?????????',
        placeholder: '??????????????????',
        component: 'input'
      },
      receivingName:{
        label: '?????????',
        placeholder: '??????????????????',
        component: 'input'
      },
      packagingMethod:{
        label: '??????',
        placeholder: '?????????????????????',
        component: 'select',
        options: [{
          label: '??????',
          key: 1,
          value: 1
        }, {
          label: '??????',
          key: 2,
          value: 2
        }]
      },
      materialQuality:{
        label: '??????',
        placeholder: '???????????????',
        component: 'input'
      },
      specificationType:{
        label: '????????????',
        placeholder: '?????????????????????',
        component: 'input'
      },
      driverUserName:{
        label: '??????',
        placeholder: '???????????????',
        component: 'input'
      },
      plateNumber:{
        label: '?????????',
        placeholder: '??????????????????',
        component: 'input'
      },
      outboundStatusList : {
        label : '??????????????????',
        placeholder: '???????????????????????????',
        component : 'select',
        options : [
          { label : '?????????',
            key : 0,
            value : 0
          },
          { label : '????????????',
            key : 1,
            value : 1
          },
          { label : '?????????',
            key : 2,
            value : 2
          },
        ]
      },
      billRecycleStatusList : {
        label : '?????????????????????',
        placeholder : '???????????????????????????',
        component : 'select',
        options :[
          {
            label : '??????',
            key : '1,2',
            value : '1,2'
          },
          {
            label : '???????????????',
            key : 3,
            value : 3
          },
          {
            label : '???????????????',
            key : 4,
            value : 4
          },
          {
            label : '???????????????',
            key : 5,
            value : 5
          }
        ]
      }
    };
    this.apiField = {
      accountGoodsStatus: ACCOUNT_STATUS.DISACCOUNT,
      // consignmentReceiptStatus: CONSIGNMENT_RECEIPT_STATUS.CONSIGNMENT_RECEIPT_AUDITED,
      iseffectiveStatus: IS_EFFECTIVE_STATUS.IS_EFFECTIVE_NORMAL,
      isSelectGoodsAccount:true,
      consignmentType: CONSIGNMENT_TYPE.AGENCY_DELIVERY,
      transportImmediateStatus: 4,
      isPermissonSelectAll: true,
      projectId : choisedProject
    };
    const newFilter = this.props.setFilter({
      ...this.apiField,
      ...localData.formData,
      receivingStartTime: time && time.length ? time[0].startOf('day').format('YYYY/MM/DD HH:mm:ss') : undefined,
      receivingEndTime: time && time.length ? time[1].endOf('day').format('YYYY/MM/DD HH:mm:ss') : undefined,
      offset: localData.nowPage ? localData.pageSize * ( localData.nowPage - 1 ) :0,
      limit: localData.pageSize ? localData.pageSize : limit, });

    getTransportList(omit(newFilter, ["receivingTime"])).then(transports => {
      this.setState({
        nowPage: localData.nowPage ? localData.nowPage : 1,
        pageSize: localData.pageSize ? localData.pageSize : limit,
        ready: true,
        transports,
      }, ()=>{
        this.getMiniTransportList();
      });
    });
  }

  handleSearchBtnClick = (formData) => {
    /*
    * ????????????????????????????????????????????????
    * */
    const { pageSize } = this.state;
    this.tableRef.current.resetSelectedRows();
    const receivingStartTime = formData &&formData.receivingTime && formData.receivingTime.length ? moment(formData.receivingTime?.[0]).startOf('day').format('YYYY/MM/DD HH:mm:ss') : undefined;
    const receivingEndTime = formData &&formData.receivingTime && formData.receivingTime.length ?  moment(formData.receivingTime?.[1]).endOf('day').format('YYYY/MM/DD HH:mm:ss') : undefined;
    this.keywords = omit(receivingStartTime && receivingEndTime?{ ...this.props.filter, limit: pageSize, offset: 0, ...this.apiField, receivingStartTime, receivingEndTime }: { ...this.props.filter, limit: pageSize, offset: 0, ...this.apiField }, ['receivingTime']);
    const params  ={
      ...this.keywords,
      ...this.apiField,
    };

    getTransportList(params).then(transports => {
      this.setState({
        nowPage: 1,
        transports
      }, ()=>{
        // ??????????????????????????? ?????????????????? ??????????????????
        localStorage.removeItem(this.currentTab.id);
        if (getLocal('local_commonStore_tabsObj').tabs.length > 1) {
          localStorage.setItem(this.currentTab.id, JSON.stringify({
            formData,
            nowPage: 1,
            pageSize: 10,
          }));
        }
        this.getMiniTransportListKeepSelect({ ...params, limit: 100000, offset: 0, backListToGoodsAccount : true });
      });
    });
  }

  componentWillUnmount() {
    // ??????????????????????????? ?????????????????? ??????????????????
    const formData = this.form ? this.form.getFieldsValue() : null;
    localStorage.removeItem(this.currentTab.id);
    if (getLocal('local_commonStore_tabsObj').tabs.length > 1) {
      localStorage.setItem(this.currentTab.id, JSON.stringify({
        formData: {
          ...formData,
          receivingTime: formData && formData.receivingTime && formData.receivingTime.map(item => moment(item)),
        },
        nowPage: this.state.nowPage,
        pageSize: this.state.pageSize,
      }));
    }
  }

  watchTransportDetail = record => {
    if (this.props.location.pathname.indexOf('cargo') !== -1) {
      router.push(`/bill-account/cargoGoodsAccount/cargoGoodsAccountList/transportDetail?transportId=${record.transportId}`);
    } else {
      router.push(`/bill-account/consignmentGoodsAccountList/transportDetail?transportId=${record.transportId}`);
    }
  }

  handleResetBtnClick = () => {

    this.tableRef.current.resetSelectedRows();
    // this.checkedTransports = []
    this.keywords = {};
    this.props.resetFilter();
    this.getMiniTransportList();

    getTransportList({
      limit: 10,
      offset: 0,
      ...this.apiField
    }).then(transports => {

      const { items: transportItems } = transports;
      transportItems && transportItems.forEach((item, key) => {
        transportItems[key].selected = false;
      });
      localStorage.setItem(this.currentTab.id, JSON.stringify({ formData: {} }));
      this.form.setFieldsValue(null);
      this.setState({
        nowPage: 1,
        pageSize: 10,
        transports,
        selectOnePageChecked : false
      });
    });
  }

  onChange = (pagination) => {
    const { offset, limit, current } = translatePageType(pagination);
    this.setState({
      nowPage:current,
      pageSize:limit
    });
    getTransportList({ ...this.apiField, ...this.keywords, offset, limit }).then(transports => {
      const { items: transportItems } = transports;
      const { transportTotal } = this.state;
      let selectOnePageChecked = true;

      transportItems.forEach((item) => {
        const selectStatusElement = transportTotal.find(_item=>_item.transportId === item.transportId);
        item.selected = selectStatusElement.selected;

        // ??????????????????????????????
        if (!item.selected) selectOnePageChecked = false;
      });

      this.setState({ transports, selectOnePageChecked });
    });
  }

  watchReceivingSign = async record => {
    if (this.props.transportDetail.transportId !== record.transportId) {
      await this.props.detailTransports({ transportId: record.transportId });
    }
    this.setState({
      ReceivingSignModal: true
    });
  }

  watchReceivingBills = async record => {
    const { accountDetailId } = record;
    if (!accountDetailId && this.props.transportDetail.transportId !== record.transportId) {
      await this.props.detailTransports({ transportId: record.transportId });
    }
    this.setState({
      receivingModal: true,
      accountDetailId
    });
  }

  renderImageDetail = imageType => {
    let imageData;
    if (imageType === 'signDentry') {
      const { transportDetail: { signDentryid } } = this.props;
      imageData = [getOssImg(signDentryid)];
    } else if (imageType === 'receiving') {
      const { accountDetailId } = this.state; // ?????????
      if (!accountDetailId){
        const { transportDetail: { signItems = [] } } = this.props;
        imageData = flattenDeep(signItems.map(item=>(item.billDentryid || '').split(','))).map(item=>getOssImg(item));
      } else {
        const { accountDetailItems=[] } = this.props.goodsAccount; // goodsAccount???undefined
        const accountDetailItem = accountDetailItems.find(item=>item.accountDetailId===accountDetailId);
        imageData = (accountDetailItem.billDentryid || '').split(',').map(billDentry=>getOssImg(billDentry));
      }
    }
    return (
      imageType === 'receiving'?
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ marginTop:20 }}>
            <ImageDetail width='320' imageData={imageData} />
          </div>
          <div style={{ width: '400px' }}>
            <p className={styles.infoItem}>
              <span>????????????:</span>
              <span>{this.props.transportDetail?.signItems?.map(item => item.billNumber || '').join(',')}</span>
            </p>
            <p className={styles.infoItem}>
              <span>????????????:</span>
              <span>{this.props.transportDetail?.signItems?.map(item => item.weighNumber || '').join(',')}</span>
            </p>
            <p className={styles.infoItem}>
              <span>????????????:</span>
              <span>
                {this.props.transportDetail?.deliveryItems?.map(item => <li key={item.goodsId}>{`${item.categoryName}-${item.goodsName} ${item.receivingNum}${item.receivingUnitCN} `}</li>)}
              </span>
            </p>
          </div>
        </div>
        :
        <ImageDetail width='320' imageData={imageData} />
    );
  }

  searchList = () => {
    const layout = {
      labelCol: {
        xs: { span: 24 },
        sm: { span: 12 },
        xl: { span: 10 }
      },
      wrapperCol: {
        xs: { span: 24 },
        sm: { span: 12 },
        xl: { span: 14 }
      }
    };

    return (
      <SearchForm layout="inline" {...layout} mode={FORM_MODE.SEARCH} schema={this.searchSchema}>
        <Item field="transportNo" />
        <Item field="receivingNo" />
        <Item field="receivingTime" />
        <Item field="goodsName" />
        <Item field="deliveryName" />
        <Item field="receivingName" />
        <Item field="packagingMethod" />
        <Item field="specificationType" />
        <Item field="materialQuality" />
        <Item field="driverUserName" />
        <Item field="plateNumber" />
        <Item field='outboundStatusList' />
        <Item field='billRecycleStatusList' />
        <div style={{ float : 'right' }}>
          <DebounceFormButton debounce label="??????" type="primary" onClick={this.handleSearchBtnClick} />
          <DebounceFormButton label="??????" style={{ marginLeft: '10px' }} onClick={this.handleResetBtnClick} />
        </div>
      </SearchForm>
    );
  }

  goodsSummary = () => {
    const { selectedRow } = this.state;

    const goodArr = selectedRow?.reduce((initValue, current) => {
      const tempGoods = current.chargeMode === 1?
        current.deliveryItems?.map(({ categoryName, goodsName, deliveryNum, goodsUnitCN, goodsId }) => ({ categoryName, goodsName, num: deliveryNum, goodsUnitCN, goodsId })) || []
        :
        current.deliveryItems?.map(({ categoryName, goodsName, receivingNum, goodsUnitCN, goodsId }) => ({ categoryName, goodsName, num: receivingNum, goodsUnitCN, goodsId })) || [];
      return [...initValue, ...tempGoods];
    }, []) || [];
    const totalGoodsArr = classifyGoodsWeight(goodArr, 'goodsId', ['goodsId', 'categoryName', 'goodsName', 'goodsUnitCN', 'num'], (summary, current) => summary.num += current.num);
    return totalGoodsArr?.reduce((initValue, { categoryName, goodsName, num, goodsUnitCN, goodsId }) => {
      initValue.push(<li key={goodsId}><p>{`${categoryName}-${goodsName} ${num.toFixed(2)} ${goodsUnitCN}`}</p></li>);
      return initValue;
    }, []) || [];
  }

  showCreateModal = () => {
    const { transportTotal } = this.state;
    const selectedRow = transportTotal.filter(item=>item.selected);
    if (!selectedRow.length) return message.error('???????????????????????????');

    this.setState({
      selectedRow,
      createBillModal: true
    });
  }

  saveDraft = ({ paymentTime, remark }, routerFunc) => {
    const { selectedRow } = this.state;
    this.handleCancelBtnClick();
    const paymentDaysStart = paymentTime?.[0]?.startOf('day');
    const paymentDaysEnd = paymentTime?.[1]?.endOf('day');
    const transportIdList = selectedRow.map(item => item.transportId);
    createGoodsAccount({ paymentDaysStart, paymentDaysEnd, remark, transportIdList }).then((data) => {
      notification.success({
        message: '????????????',
        description: '???????????????????????????'
      });
      routerFunc(data.accountGoodsId);
    });
  }

  handleSaveBtnClick = (formData) => {
    const routerTo = () => { router.push('/bill-account/cargoGoodsAccount/cargoGoodsAccountList'); };
    this.saveDraft(formData, routerTo);
  }

  toAdjustment = (formData) => {
    const { commonStore: { tabs, activeKey }, commonStore, deleteTab } = this.props;
    // ???????????????????????????tab
    const dele = tabs.find(item => item.id === activeKey);
    deleteTab(commonStore, { id: dele.id });
    const routerTo = (accountGoodsId) => { router.push(`adjustGoodsAccountBillWrap/adjustGoodsAccountBill?accountGoodsId=${accountGoodsId}`); };
    this.saveDraft(formData, routerTo);
  }

  handleCancelBtnClick = () => {
    this.setState({
      createBillModal: false
    });
  }

  render () {
    const { nowPage, pageSize, ready, transports, ReceivingSignModal, receivingModal, createBillModal, selectOnePageChecked, selectedRow, miniTransportReady } = this.state;
    const createBillLayout = {
      labelCol: {
        xs: { span: 4 },
      },
      wrapperCol: {
        xs: { span: 20 },
      }
    };
    return (
      ready && miniTransportReady
        ?
          <>
            <Modal
              title='???????????????'
              footer={null}
              width={600}
              maskClosable={false}
              destroyOnClose
              visible={createBillModal}
              onCancel={this.handleCancelBtnClick}
            >
              <SchemaForm mode={FORM_MODE.ADD} schema={this.createSchema}>
                <Item {...createBillLayout} field='paymentTime' />
                <div style={{ height:'20px' }} />
                <Item {...createBillLayout} field='remark' />
                <div style={{ display:'flex', justifyContent:'space-around', height:'50px', lineHeight:'50px' }}>
                  <div>?????????<span style={{ fontWeight:'bold' }}> {selectedRow?.length || 0} </span>???</div>
                  <div>?????????<span style={{ fontWeight:'bold' }}> {formatMoney((selectedRow?.reduce((total, current) => total += (current.accountGoodsPriceEntities?.[0]?.totalPrice || 0), 0) || 0).toFixed(2)._toFixed(2))} ???</span></div>
                </div>
                <div style={{ paddingLeft: '90px' }}>
                  <div style={{ width: '75px', float: 'left' }}>???????????????</div>
                  <div style={{ width: '75%', fontWeight:'bold', float: 'left' }}>
                    <ul style={{ padding: '0px', margin: '0' }}>
                      {this.goodsSummary()}
                    </ul>
                  </div>
                  <div style={{ clear: 'both' }} />
                </div>
                <div style={{ paddingLeft: '90px', height:'50px', lineHeight:'50px' }}>
                  <div>????????????<span style={{ fontWeight:'bold' }}>{selectedRow?.[0]?.deliveryItems?.[0]?.cargoesName || ''}</span></div>
                  <div />
                </div>
                <div style={{ paddingRight: '20px', textAlign: 'right', marginTop:'10px' }}>
                  <Button className="mr-10" onClick={this.handleCancelBtnClick}>??????</Button>
                  <DebounceFormButton label="????????????" className="mr-10" onClick={this.handleSaveBtnClick} />
                  <DebounceFormButton label="??????" type="primary" onClick={this.toAdjustment} />
                </div>
              </SchemaForm>
            </Modal>

            <Modal
              title='??????'
              footer={null}
              width={648}
              destroyOnClose
              maskClosable={false}
              visible={ReceivingSignModal}
              onCancel={() => this.setState({ ReceivingSignModal: false })}
            >
              {ReceivingSignModal&&this.renderImageDetail('signDentry')}
            </Modal>
            <Modal
              title='?????????'
              footer={null}
              width={700}
              maskClosable={false}
              destroyOnClose
              visible={receivingModal}
              onCancel={() => this.setState({ receivingModal: false })}
            >
              {receivingModal&&this.renderImageDetail('receiving')}
            </Modal>
            <SelectAllPageTable
              rowKey='transportId'
              multipleSelect
              selectOnePageChecked={selectOnePageChecked}
              onSelectRow={this.onSelectRow}
              onSelectOnePage={this.onSelectOnePage}
              onSelectTotal={this.onSelectTotal}
              getCheckboxProps={this.getCheckboxProps}
              ref={this.tableRef}
              dataSource={transports}
              schema={this.tableSchema}
              renderCommonOperate={this.searchList}
              pagination={{ current :nowPage, pageSize }}
              onChange={this.onChange}
            />
            <Button size='large' style={{ marginTop: '10px', float: 'right' }} onClick={this.showCreateModal} type='primary'>???????????????</Button>
          </>
        :
        <Spin style={{ position : 'absolute', left : '50%', top : '50%', transform: 'translate(-50% , -50%)' }} size='large' />

    );
  }
}
