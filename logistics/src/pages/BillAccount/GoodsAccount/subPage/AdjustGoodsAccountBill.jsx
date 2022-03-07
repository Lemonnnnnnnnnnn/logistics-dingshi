import React from "react";
import { Button, Icon, Input, message, Modal, notification, Spin, Table as AntTable } from "antd";
import CSSModules from "react-css-modules";
import { connect } from 'dva';
import { FORM_MODE, Item, Observer } from "@gem-mine/antd-schema-form";
import moment from "moment";
import router from "umi/router";
import DebounceFormButton from "@/components/DebounceFormButton";
import SearchForm from "@/components/Table/SearchForm2";
import SelectAllPageTable from "@/components/SelectAllPageTable/SelectAllPageTable";
import { FilterContextCustom } from "@/components/Table/FilterContext";
import {
  detailGoodsAccount,
  getTransportList,
  getTransportsSelectIdType,
  patchGoodsAccount,
  postGoodsPrice
} from "@/services/apiService";
import { classifyGoodsWeight, formatMoney, omit, remove, translatePageType, getLocal } from "@/utils/utils";
import styles from "./AdjustGoodsAccountBill.less";
import "@gem-mine/antd-schema-form/lib/fields";

function mapStateToProps (state) {
  return {
    commonStore: state.commonStore,
  };
}
const mapDispatchToProps = (dispatch) => ({
  deleteTab: (store, payload) => dispatch({ type: 'commonStore/deleteTab', store, payload }),
});
@connect(mapStateToProps, mapDispatchToProps)
@FilterContextCustom
@CSSModules(styles, { allowMultiple: true })
export default class Index extends React.Component {
  state = {
    nowPage: 1,
    pageSize: 10,
    ready: false,
    totalPrice: 0,
    price: '',
    toggle: false,
    currentTab: this.props.commonStore.tabs.find(item => item.id === this.props.commonStore.activeKey),
    localData: getLocal(this.props.commonStore.tabs.find(item => item.id === this.props.commonStore.activeKey).id) || { formData: {} },

  }

  time = this.localData && this.localData.formData && this.localData.formData.receivingTime && this.localData.formData.receivingTime.map(item => moment(item));

  form = null;

  keywords = {}

  tableRef = React.createRef()

  modalColumns = [
    {
      title: '货品',
      dataIndex: 'name',
    },
    {
      title: '单数',
      dataIndex: 'orderNum',
    },
    {
      title: '总数量',
      dataIndex: 'totalNum',
    },
    {
      title: '总金额',
      dataIndex: 'totalPrice',
    },
  ]

  adjustColumns = [
    {
      title: '货品名称',
      dataIndex: 'goodsName',
      width: '252px',
      render: (_, record) => (
        <div
          title={`${record?.categoryName || ''}${record?.goodsName || ''}`}
          style={{
            width: '220px',
            display: 'inline-block',
            whiteSpace: 'nowrap',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
          }}
        >
          {`${record?.categoryName || ''}${record?.goodsName || ''}`}
        </div>
      ),
    },
    {
      title: '规格',
      dataIndex: 'specificationType',
      width: '100px',
      render: text => {
        if (!text) return '--';
        return (
          <div
            title={text || '--'}
            style={{
              width: '65px',
              display: 'inline-block',
              whiteSpace: 'nowrap',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
            }}
          >
            {text || '--'}
          </div>);
      },
    },
    {
      title: '材质',
      width: '100px',
      dataIndex: 'materialQuality',
      render: text => {
        if (!text) return '--';
        return (
          <div
            title={text || '--'}
            style={{
              width: '65px',
              display: 'inline-block',
              whiteSpace: 'nowrap',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
            }}
          >{text || '--'}
          </div>);
      },
    },
    {
      title: '包装',
      width: '70px',
      dataIndex: 'packagingMethod',
      render: (text) => {
        if (!text) return '--';
        return (
          <div
            title={text.toString() === '1' ? '袋装' : '散装'}
            style={{
              width: '30px',
              display: 'inline-block',
              whiteSpace: 'nowrap',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
            }}
          >{text.toString() === '1' ? '袋装' : '散装'}
          </div>);
      },
    },
    {
      title: '总量',
      dataIndex: 'num',
      width: '100px',
      render: (text, record) => {
        if (!text) return '--';
        return (
          <div
            title={`${record.num.toFixed(2)}${record?.unitCN || '吨'}`}
            style={{
              width: '70px',
              display: 'inline-block',
              whiteSpace: 'nowrap',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
            }}
          >{`${record.num.toFixed(2)}${record?.unitCN || '吨'}`}
          </div>);
      },
    },
    {
      title: '单价',
      dataIndex: 'unitPrice',
      render: (text, record) => {
        if (!text || text === 0) return <Input
          onChange={(e) => this.onChangeUnitPrice(e, record)}
          value={undefined}
          placeholder='请输入单价'
          suffix='元'
        />;
        return <Input onChange={(e) => this.onChangeUnitPrice(e, record)} value={text} placeholder='请输入单价' suffix='元' />;
      },
    },
  ]

  allowClickBatchAccountChangeBtn = true

  // 修改当前页面详细数据的数组
  onModifyCurrentPageAndDelivery = () => {
    const { transportTotal, data, data: { items: transportItems } } = this.state;
    let selectOnePageChecked = true;

    transportItems && transportItems.forEach((item, key) => {
      const matchItem = transportTotal.find(_item=>_item.transportId === item.transportId);
      if (matchItem) item.selected = matchItem.selected;
      // 联动全选按钮展示状态
      if (!transportItems[key].selected) selectOnePageChecked = false;
    });

    if (!transportItems || !transportItems.length) selectOnePageChecked = false;
    this.setState({ data, selectOnePageChecked });
    this.checkedTransports = transportTotal.filter(item => item.selected);
  }

  getMiniTransportList = (newParams) =>{
    /*
    * 选择所有页思路：
    * 将选择的数组（全部，简易）和本页展示的数组（一页，完整）区分开来，
    * 每当修改选中时，先更改选择的数组，后更改本页展示的数组
    * 修改后需要筛选出选择的运单 并赋值给 this.checkedTransports ，以匹配原先的逻辑
    * */
    const { initFilter } = this.state;

    const params = newParams || initFilter;

    this.setState({ miniTransportReady : false });
    getTransportsSelectIdType({ ...params, limit: 100000, backListToGoodsAccount : true }).then(({ items }) => {
      const transportTotal = items.map(item => ({ ...item, selected: false }));
      this.checkedTransports = transportTotal.filter(item => item.selected);

      this.setState({ transportTotal, miniTransportReady : true });
    });
  }

  // 选择一行
  onSelectRow = (selectedRow, selected, currentRow) => {
    const { transportTotal } = this.state;

    // 1. 修改总数组
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

  // 选择单页
  onSelectOnePage = (selected) => {
    const { transportTotal, nowPage, pageSize } = this.state;

    if (selected) {
      for (let i = (nowPage - 1) * pageSize; i < nowPage * pageSize && i < transportTotal.length; i++) {
        transportTotal[i].selected = true;
      }
    } else {
      for (let i = (nowPage - 1) * pageSize; i < nowPage * pageSize && i < transportTotal.length; i++) {
        transportTotal[i].selected = false;
      }
    }

    this.setState({ transportTotal }, () => {
      this.onModifyCurrentPageAndDelivery();
    });
  };

  // 选择全部页
  onSelectTotal = (selected) => {
    if (selected){
      const { transportTotal: _transportTotal } = this.state;
      // 1. 修改总数组
      const transportTotal = _transportTotal.map(item => ({ ...item, selected: true }));
      this.setState({ transportTotal }, () => {
        this.onModifyCurrentPageAndDelivery();
      });
    } else {
      const { transportTotal: _transportTotal } = this.state;
      // 1. 修改总数组
      const transportTotal = _transportTotal.map(item => ({ ...item, selected: false }));
      this.setState({ transportTotal }, () => {
        this.onModifyCurrentPageAndDelivery();
      });
    }

  };

  // 选择按钮渲染
  getCheckboxProps = (record) => ({
    // defaultChecked : record.selected,
    checked: record.selected
  });

  componentDidMount() {
    const { time } = this;
    const { localData } = this.state;
    const { location: { query: { accountGoodsId } } } = this.props;
    this.tableSchema = {
      variable: true,
      minWidth: 3000,
      columns: [
        {
          title: '运单号',
          dataIndex: 'transportNo',
          fixed: 'left',
          width: '200px',
        },
        {
          title: '合同名称',
          dataIndex: 'projectName',
        },
        {
          title: '签收单号',
          dataIndex: 'receivingNo',
          render: (text, record) => {
            if (text) return text;
            if (record.billNumber) return record.billNumber;
            return '--';
          },
        },
        {
          title: '签收时间',
          dataIndex: 'receivingTime',
          render: (text, record) => {
            const time = text || record.signTime;
            return time ? moment(time).format('YYYY-MM-DD HH:mm:ss') : '--';
          },
        },
        {
          title: '提货点',
          dataIndex: 'deliveryItems',
          render: (text) => {
            const list = text.map((item, index) => {
              if (index.length === index + 1) return <li
                title={`${item.deliveryName}`}
                className='test-ellipsis'
                key={index}
              >{item.deliveryName}
              </li>;
              return <li
                styleName='border-bottom'
                title={`${item.deliveryName}`}
                className='test-ellipsis'
                key={index}
              >{item.deliveryName}
              </li>;
            });
            return <ul style={{ padding: 0, margin: 0 }}>{list}</ul>;
          },
        },
        {
          title: '货品名称',
          dataIndex: 'goodsName',
          render: (text, record) => {
            const list = record.deliveryItems.map((item, index) => <li
              title={`${item.categoryName}${item.goodsName}`}
              className='test-ellipsis'
              key={index}
            >{`${item.categoryName}${item.goodsName}`}
            </li>);

            return <ul style={{ padding: 0, margin: 0 }}>{list}</ul>;
          },
        },
        {
          title: '规格型号',
          dataIndex: 'specificationType',
          render: (text, record) => {
            const list = record.deliveryItems.map((item, index) => {
              const word = item.specificationType === null ? '--' : item.specificationType;
              return <li title={`${word}`} className='test-ellipsis' key={index}>{`${word}`}</li>;
            });

            return <ul style={{ padding: 0, margin: 0 }}>{list}</ul>;
          },
        },
        {
          title: '材质',
          dataIndex: 'materialQuality',
          render: (text, record) => {
            const list = record.deliveryItems.map((item, index) => {
              const word = item.materialQuality === null ? '--' : item.materialQuality;
              return <li title={`${word}`} className='test-ellipsis' key={index}>{`${word}`}</li>;
            });

            return <ul style={{ padding: 0, margin: 0 }}>{list}</ul>;
          },
        },
        {
          title: '包装',
          dataIndex: 'packagingMethod',
          render: (text, record) => {
            const list = record.deliveryItems.map((item, index) => {
              let word = '--';
              if (item.packagingMethod === 1) {
                word = '袋装';
              } else if (item.packagingMethod === 2) {
                word = '散装';
              }
              return <li title={`${word}`} className='test-ellipsis' key={index}>{`${word}`}</li>;
            });

            return <ul style={{ padding: 0, margin: 0 }}>{list}</ul>;
          },
        },
        {
          title: '实提量',
          dataIndex: 'deliveryNum',
          render: (text, record) => {
            const list = record.deliveryItems.map((item, index) => {
              const word = item.deliveryNum === null ? '--' : `${item.deliveryNum}${item.deliveryUnitCN}`;
              return <li title={`${word}`} className='test-ellipsis' key={index}>{`${word}`}</li>;
            });

            return <ul style={{ padding: 0, margin: 0 }}>{list}</ul>;
          },
        },
        {
          title: '实收量',
          dataIndex: 'receivingNum',
          render: (text, record) => {
            const list = record.deliveryItems.map((item, index) => {
              const word = item.receivingNum === null ? '--' : `${item.receivingNum}${item.receivingUnitCN}`;
              return <li title={`${word}`} className='test-ellipsis' key={index}>{`${word}`}</li>;
            });

            return <ul style={{ padding: 0, margin: 0 }}>{list}</ul>;
          },
        },
        {
          title: '单价',
          dataIndex: 'freightCost',
          render: (text, record) => {
            const list = record.deliveryItems.map((item, index) => {
              const word = item?.accountModifyPriceEntities?.[0]?.freightCost?.toFixed(2)._toFixed(2) || '';
              return <li
                title={`${word ? `${word}元` : '--'}`}
                className='test-ellipsis'
                key={index}
              >{`${word ? `${word}元` : '--'}`}
              </li>;
            });
            return <ul style={{ padding: 0, margin: 0 }}>{list}</ul>;
          },
        },
        {
          title: '卸货点',
          dataIndex: 'receivingName',
        },
        {
          title: '合计',
          dataIndex: 'totalFreight',
          render: (text, record) => `${record.accountGoodsPriceEntities?.[0]?.totalPrice?.toFixed(2)._toFixed(2) || 0} 元`,
        },
        {
          title: '司机',
          dataIndex: 'driverUserName',
        },
        {
          title: '车牌号',
          dataIndex: 'plateNumber',
          render: (text, record) => {
            if (text) return text;
            if (record.carNo) return record.carNo;
            return 'bug';
          },
        },
      ],
      operations: () => {
        const detail = {
          title: '详情',
          onClick: (record) => {
            const { route: { path } } = this.props;
            router.push(`${path}transportDetail?transportId=${record.transportId}`);
          },
        };
        const adjust = {
          title: '调账',
          onClick: (record) => {
            this.changeId = [record];
            this.isMass = 0;
            const goodsData = this.calcGoodsData();
            this.setState({
              adjustModal: true,
              goodsData,
            });
          },
        };
        const deleteTransport = {
          title: '移除',
          confirmMessage: () => `你是否确认将该运单从对账单中移除？`,
          onClick: (record) => {
            this.deleteTransports([record.transportId]);
          },
        };

        return [detail, adjust, deleteTransport];
      },
    };
    this.searchSchema = {
      receivingTime: {
        label: '签收日期',
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
          watch: '*currentTab',
          action: (itemValue, { form }) => {
            if (this.form !== form) {
              this.form = form;
            }
            return { };
          }
        }),
      },
      transportNo: {
        label: '运单号',
        component: 'input',
        placeholder: '请输入运单号',
      },
      receivingNo: {
        label: '签收单号',
        component: 'input',
        placeholder: '请输入签收单号',
      },
      goodsName: {
        label: '货品名称',
        placeholder: '请输入货品名称',
        component: 'input',
      },
      deliveryName: {
        label: '提货点',
        placeholder: '请输入提货点',
        component: 'input',
      },
      receivingName: {
        label: '卸货点',
        placeholder: '请输入卸货点',
        component: 'input',
      },
      packagingMethod: {
        label: '包装',
        placeholder: '请选择包装方式',
        component: 'select',
        options: [{
          label: '袋装',
          key: 1,
          value: 1,
        }, {
          label: '散装',
          key: 2,
          value: 2,
        }],
      },
      materialQuality: {
        label: '材质',
        placeholder: '请输入材质',
        component: 'input',
      },
      specificationType: {
        label: '规格型号',
        placeholder: '请输入规格型号',
        component: 'input',
      },
      driverUserName: {
        label: '司机',
        placeholder: '请输入司机',
        component: 'input',
      },
      plateNumber: {
        label: '车牌号',
        placeholder: '请输入车牌号',
        component: 'input',
      },
    };
    this.apiField = {
      isSelectGoodsAccount: true,
      accountGoodsId,
      isPermissonSelectAll: true,
    };
    const newFilter = this.props.setFilter({
      ...this.apiField,
      ...localData.formData,
      receivingStartTime: time && time.length ? time[0].startOf('day').format('YYYY/MM/DD HH:mm:ss') : undefined,
      receivingEndTime: time && time.length ? time[1].endOf('day').format('YYYY/MM/DD HH:mm:ss') : undefined,
      offset: localData.nowPage ? localData.pageSize * ( localData.nowPage - 1 ) : 0,
      limit: localData.pageSize ? localData.pageSize : 10,
    });
    // 获取简易选择列表
    this.getMiniTransportList(newFilter);

    Promise.all([detailGoodsAccount(accountGoodsId), getTransportList(newFilter) ])
      .then(res => {
        this.leftover = res[0].accountDetailItems?.map(item => item.transportId) || [];
        this.detail = res[0];
        this.setState({
          ready: true,
          data: res[1],
          totalPrice: res[0].totalFreight,
          nowPage: localData.nowPage ? localData.nowPage : 1,
          pageSize: localData.pageSize ? localData.pageSize : 10,
          initFilter : newFilter
        });
      });
  }

  handleSearchBtnClick = (formData) => {
    const { location: { query: { accountGoodsId } } } = this.props;
    const { pageSize, currentTab } = this.state;
    const receivingStartTime = formData && formData.receivingTime && formData.receivingTime.length ? moment(formData.receivingTime?.[0]).startOf('day').format('YYYY/MM/DD HH:mm:ss') : undefined;
    const receivingEndTime = formData && formData.receivingTime && formData.receivingTime.length ? moment(formData.receivingTime?.[1]).endOf('day').format('YYYY/MM/DD HH:mm:ss') : undefined;
    this.keywords = omit(receivingStartTime && receivingEndTime ? {
      ...this.props.filter,
      offset: 0, ...this.apiField,
      receivingStartTime,
      receivingEndTime,
      limit: pageSize,
    } : { ...this.props.filter, offset: 0, ...this.apiField, limit: pageSize }, ['receivingTime']);
    getTransportList({ ...this.keywords, accountGoodsId }).then(data => {
      const formData = this.form ? this.form.getFieldsValue() : null;
      // 页面销毁的时候自己 先移除原有的 再存储最新的
      localStorage.removeItem(currentTab.id);
      if (getLocal('local_commonStore_tabsObj').tabs.length > 1) {
        localStorage.setItem(currentTab.id, JSON.stringify({
          formData,
          nowPage: 1,
          pageSize: 10,
        }));
      }
      this.setState({
        nowPage: 1,
        data,
      }, ()=>{
        this.getMiniTransportList({ ...this.keywords, accountGoodsId });
      });
    });
  }

  handleResetBtnClick = () => {
    const { location: { query: { accountGoodsId } } } = this.props;
    this.tableRef.current.resetSelectedRows();
    this.checkedTransports = [];
    this.keywords = {};
    this.props.resetFilter();
    // 重置简易选择数组
    this.getMiniTransportList();

    getTransportList({
      limit: 10,
      offset: 0,
      ...this.apiField,
      accountGoodsId,
    }).then(({ items, count }) => {
      localStorage.setItem(this.state.currentTab.id, JSON.stringify({ formData: {} }));
      this.setState({
        nowPage: 1,
        pageSize: 10,
        data : {
          items: items.map(item=>({ ...item, selected : false })),
          count,
        },
        selectOnePageChecked : false
      });
    });
  }

  toModifyAccount = () => {
    const { accountGoodsId, projectName, projectId } = this.detail;
    router.push(`modifyAccountTransportsWrap/modifyAccountTransports?accountGoodsId=${accountGoodsId}&projectName=${projectName}&projectId=${projectId}`);
  }

  deletionByQuery = () => {
    const deleteArr = this.checkedTransports.map(item => item.transportId);
    this.deleteTransports(deleteArr);
  }

  deleteTransports = (deleteArr) => {
    if (deleteArr.length >= this.leftover.length) return message.error('至少保留一条运单');
    const copyLeftover = JSON.parse(JSON.stringify(this.leftover));
    const transportIdList = remove(copyLeftover, item => {
      const isExist = deleteArr.find(current => item === current);
      return !isExist;
    });
    patchGoodsAccount(this.props.location.query.accountGoodsId, { transportIdList }).then(res => {
      this.detail = res;
      this.leftover = transportIdList;
      this.refresh();
      this.setState({
        totalPrice: res.totalFreight,
        selectOnePageChecked : false
      });

      notification.success({
        message: '删除成功',
        description: '删除指定运单成功',
      });
    });
  }

  refresh = () => {
    const { location: { query: { accountGoodsId } } } = this.props;
    this.tableRef.current.resetSelectedRows();
    this.checkedTransports = [];
    this.setState({
      nowPage: 1,
      pageSize: 10,
    });
    const params = { ...this.apiField, ...this.keywords, offset: 0, limit: 10, accountGoodsId };
    this.getMiniTransportList(params);
    getTransportList(params).then(data => {
      this.setState({ data });
    });

  }

  submitAccount = () => {
    const { commonStore: { tabs, activeKey }, commonStore, deleteTab, location } = this.props;

    patchGoodsAccount(location.query.accountGoodsId, { accountStatus: 1 }).then(() => {
      notification.success({
        message: '提交成功',
        description: '对账单提交成功，请等待货权方审核',
      });
      // 清除当前缓存并关闭tab
      const dele = tabs.find(item => item.id === activeKey);
      deleteTab(commonStore, { id: dele.id });
      router.push('/bill-account/cargoGoodsAccount/cargoGoodsAccountList');
    });
  }

  onChange = (pagination) => {
    const { offset, limit, current } = translatePageType(pagination);
    const { location: { query: { accountGoodsId } } } = this.props;
    const { transportTotal } = this.state;
    let selectOnePageChecked = true;

    this.setState({
      nowPage: current,
      pageSize: limit,
    });

    const params = { ...this.apiField, ...this.keywords, offset, limit, accountGoodsId };

    getTransportList(params).then(({ items : transportItems, count }) => {
      transportItems && transportItems.forEach((item) => {
        const matchItem = transportTotal.find(_item=>_item.transportId === item.transportId);
        if (matchItem) item.selected = matchItem.selected;

        // 联动全选按钮展示状态
        if (!item.selected) selectOnePageChecked = false;
      });

      this.setState({
        data :{
          items :transportItems,
          count
        },
        selectOnePageChecked
      });
    });
  }

  changeToggle = () => {
    const { toggle } = this.state;
    this.setState({
      toggle: !toggle,
    });
  }

  searchList = () => {
    const { toggle, localData } = this.state;
    const layout = {
      labelCol: {
        xs: { span: 24 },
        sm: { span: 8 },
        xl: { span: 6 },
      },
      wrapperCol: {
        xs: { span: 24 },
        sm: { span: 16 },
        xl: { span: 18 },
      },
    };
    const {
      transportNo = undefined,
      receivingNo = undefined,
      goodsName = undefined,
      receivingName = undefined,
      packagingMethod = undefined,
      specificationType = undefined,
      materialQuality = undefined,
      driverUserName = undefined,
      plateNumber = undefined,
      deliveryName = undefined
    } = localData;
    const data = {
      transportNo,
      receivingNo,
      receivingTime: this.time,
      goodsName,
      receivingName,
      packagingMethod,
      specificationType,
      materialQuality,
      driverUserName,
      plateNumber,
      deliveryName,
    };
    return (
      <>
        <SearchForm
          className='goodsAccountSearchList'
          layout='inline'
          {...layout}
          data={data}
          mode={FORM_MODE.SEARCH}
          schema={this.searchSchema}
        >
          <div className={!toggle ? 'searchList' : 'searchList auto'}>
            <Item field='goodsName' />
            <Item field='transportNo' />
            <Item field='driverUserName' />
            <Item field='plateNumber' />
            <Item field='deliveryName' />
            <Item field='receivingName' />
            <Item field='packagingMethod' />
            <Item field='specificationType' />
            <Item field='materialQuality' />
            <Item field='receivingNo' />
            <Item field='receivingTime' />
            <div onClick={this.changeToggle} className='toggle'>
              {
                !toggle ?
                  <span>展开 <Icon type='down' /></span>
                  :
                  <span>缩起 <Icon type='up' /></span>
              }
            </div>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '10px' }}>
            <div>
              <DebounceFormButton debounce label='查询' type='primary' onClick={this.handleSearchBtnClick} />
              <DebounceFormButton label='重置' style={{ marginLeft: '10px' }} onClick={this.handleResetBtnClick} />
            </div>
            <div>
              <Button onClick={this.toModifyAccount} style={{ marginRight: '10px' }}>添加运单</Button>
              <Button onClick={this.deletionByQuery} style={{ marginRight: '10px' }}>移除运单</Button>
              <Button onClick={this.adjustByBatch} style={{ marginRight: '5px' }} type='primary'>批量调账</Button>
            </div>
          </div>
        </SearchForm>
      </>
    );
  }

  calcGoodsData = () => {
    const checkedTransports = this.isMass === 0 ? this.changeId : this.checkedTransports;
    const goodArr = checkedTransports?.reduce((initValue, current) => {
      const tempGoods = current.deliveryItems?.map(({
        categoryName,
        goodsName,
        materialQuality,
        packagingMethod,
        deliveryNum,
        specificationType,
        receivingNum,
        deliveryUnitCN,
        receivingUnitCN,
        goodsId,
        unitPrice = 0,
        chargeMode,
      }) => chargeMode === 2 ?
        {
          categoryName,
          goodsName,
          num: receivingNum,
          unitCN: receivingUnitCN,
          goodsId,
          materialQuality,
          packagingMethod,
          specificationType,
          unitPrice,
        }
        :
        {
          categoryName,
          goodsName,
          num: deliveryNum,
          unitCN: deliveryUnitCN,
          goodsId,
          materialQuality,
          specificationType,
          packagingMethod,
          unitPrice,
        }) || [];
      return [...initValue, ...tempGoods];
    }, []) || [];
    const goodsData = classifyGoodsWeight(goodArr, 'goodsId', ['goodsId', 'categoryName', 'goodsName', 'categoryName', 'specificationType', 'materialQuality', 'packagingMethod', 'unitCN', 'num', 'unitPrice'], (summary, current, index) => {
      summary.num += current.num;
      summary.unitPrice = undefined;
    });
    return goodsData;
  }

  adjustByBatch = () => {
    if (!this.checkedTransports || this.checkedTransports.length === 0) return message.error('请至少选择一条运单');
    this.isMass = 1;
    const goodsData = this.calcGoodsData();
    this.setState({
      adjustModal: true,
      goodsData,
      selectOnePageChecked : false
    });
  }

  onChangeUnitPrice = (e, record) => {
    const price = e.target.value;
    const { goodsId } = record;
    if (!/^\d+\.?\d{0,2}$/.test(price) && price) {
      // e.currentTarget.style.border='1px solid #f5222d'
      return message.error('请正确输入金额, 最高支持两位小数');
    }
    const { goodsData } = this.state;
    const index = goodsData.findIndex(item => item.goodsId === goodsId);
    goodsData[index].unitPrice = price;
    this.setState({
      goodsData,
    });
  }

  calcTotalPrice = () => {
    const { goodsData } = this.state;
    const flag = goodsData?.some(item => item.unitPrice === 0) || false;
    if (flag) return 0;
    return goodsData?.reduce((initValue, current) => initValue += Number(current.unitPrice) * current.num, 0).toFixed(2) || 0;
  }

  confirmAdjust = () => {
    const { goodsData } = this.state;
    let flag = goodsData?.some(item => !item.unitPrice || Number(item.unitPrice) === 0) || false;
    if (flag) return message.error('单价不能为空且必须大于0');
    flag = goodsData?.some(item => !/^\d+\.?\d{0,2}$/.test(item.unitPrice)) || false;
    if (flag) return message.error('请正确输入金额, 最高支持两位小数');
    const transportIdList = (this.isMass === 0 ? this.changeId : this.checkedTransports).map(item => item.transportId);
    const params = {
      accountGoodsId: this.props.location.query.accountGoodsId,
      transportIdList,
      accountModifyPriceSingleCreateReqs: goodsData?.map(({ goodsId, unitPrice }) => ({
        goodsId: Number(goodsId),
        unitPrice: Number(unitPrice),
      })) || [],
    };
    if (this.allowClickBatchAccountChangeBtn){
      this.allowClickBatchAccountChangeBtn = false;
      postGoodsPrice(params)
        .then(data => {
          this.allowClickBatchAccountChangeBtn = true;
          this.detail = data;
          this.setState({
            totalPrice: data.totalFreight,
          });
          notification.success({
            message: '调账成功',
            description: '对账单调价成功',
          });
          this.cancelModal();
          this.refresh();
        })
        .catch(()=>this.allowClickBatchAccountChangeBtn = true);
    } else {
      message.error('请勿重复点击！');
    }

  }

  showCommitModal = () => {
    this.setState({
      commitModal: true,
    });
  }

  cancelCommitModal = () => {
    this.setState({
      commitModal: false,
    });
  }

  cancelModal = () => {
    this.setState({
      adjustModal: false,
    });
  }

  calcGoods = () => {
    const goodArr = this.detail.accountDetailItems?.reduce((initValue, current) => {
      const tempGoods = current.accountCorrelationCnItems?.map(({
        categoryName,
        goodsName,
        deliveryNum,
        receivingNum,
        deliveryUnitCN,
        receivingUnitCN,
        goodsId,
        freightTotal = 0,
        chargeMode,
      }) => chargeMode === 2 ?
        {
          categoryName,
          goodsName,
          num: receivingNum,
          unitCN: receivingUnitCN,
          goodsId,
          orderNum: 1,
          totalPrice: freightTotal,
        }
        :
        {
          categoryName,
          goodsName,
          num: deliveryNum,
          unitCN: deliveryUnitCN,
          goodsId,
          orderNum: 1,
          totalPrice: freightTotal,
        }) || [];
      return [...initValue, ...tempGoods];
    }, []) || [];
    const totalGoodsArr = classifyGoodsWeight(goodArr, 'goodsId', ['goodsId', 'orderNum', 'goodsName', 'unitCN', 'num', 'totalPrice'], (summary, current) => {
      summary.num += current.num;
      summary.orderNum += current.orderNum;
      summary.totalPrice += current.totalPrice;
    });
    return totalGoodsArr?.reduce((initValue, { totalPrice, goodsName, num, unitCN, goodsId, orderNum }) => {
      initValue.push({
        name: goodsName,
        orderNum: orderNum.toFixed(0),
        totalNum: `${num.toFixed(2)._toFixed(2)}${unitCN}`,
        totalPrice: `${formatMoney(totalPrice.toFixed(2)._toFixed(2))} 元`,
      });
      return initValue;
    }, []) || [];
  }

  isExistZero = () => {
    const existZeroArr = [];
    this.detail.accountDetailItems?.forEach(current => {
      const index = current.accountCorrelationCnItems?.find(item => item.freightTotal === 0 || !item.freightTotal) || -1;
      if (index !== -1) existZeroArr.push(current.transportNo);
    });
    return existZeroArr.length > 0 ?
      (
        <>
          <p styleName='red'>*以下是对账单中金额为 0.00 的运单</p>
          <p>总单数：{existZeroArr.length}</p>
          <div styleName='zeroTrans'>
            <span>运单号：</span>
            <ul>
              {existZeroArr.map(item => <li key={item}>{item}</li>)}
            </ul>
          </div>
        </>
      )
      :
      false;
  }

  render() {
    const { nowPage, pageSize, ready, data, totalPrice, adjustModal, commitModal, goodsData, selectOnePageChecked, miniTransportReady } = this.state;
    return (
      ready && miniTransportReady
        ?
          <>
            <div styleName='container_top'>
              <div>
                <p>{this.detail.accountTransportNo}</p>
                <p>对账单号</p>
              </div>
              <div styleName='projectName'>
                <p>{this.detail.projectName}</p>
                <p>项目名称</p>
              </div>
              <div>
                <p>{this.detail.accountDetailItems.length}</p>
                <p>总单数</p>
              </div>
              <div>
                <p>￥{formatMoney(totalPrice.toFixed(2)._toFixed(2))}</p>
                <p>应付总金额</p>
              </div>
            </div>
            <Modal
              title='确认提交'
              width={800}
              maskClosable={false}
              destroyOnClose
              visible={commitModal}
              onOk={this.submitAccount}
              onCancel={this.cancelCommitModal}
            >
              {
                commitModal
            &&
            <>
              <div styleName='container_top_small'>
                <div>
                  <p>{this.detail.accountTransportNo}</p>
                  <p>对账单号</p>
                </div>
                <div styleName='projectName'>
                  <p>{this.detail.projectName}</p>
                  <p>项目名称</p>
                </div>
                <div>
                  <p>{this.detail.accountDetailItems.length}</p>
                  <p>总单数</p>
                </div>
                <div>
                  <p>￥{formatMoney(totalPrice.toFixed(2)._toFixed(2))}</p>
                  <p>应付总金额</p>
                </div>
              </div>
              <div styleName='submit_container'>
                <p styleName='payName'>付款方：<span>{this.detail.payerOrganizationName}</span></p>
                <AntTable key='goodsId' columns={this.modalColumns} pagination={false} dataSource={this.calcGoods()} />
                {this.isExistZero()}
              </div>
            </>
              }
            </Modal>
            <Modal
              title='批量调账'
              width={850}
              maskClosable={false}
              destroyOnClose
              visible={adjustModal}
              onOk={this.confirmAdjust}
              onCancel={this.cancelModal}
            >
              {
                adjustModal
            &&
            <div style={{ width: '100%' }}>
              <AntTable
                scroll={{ y: 450 }}
                key='goodsId'
                columns={this.adjustColumns}
                pagination={false}
                dataSource={goodsData}
              />
              <div styleName='tips_container'>
                <div>
                  已选择 <span>{this.isMass === 1 ? this.checkedTransports.length : this.changeId.length}</span> 单
                </div>
                <div>
                  总金额 <span>{this.calcTotalPrice()}</span> 元
                </div>
              </div>
            </div>
              }
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
              dataSource={data}
              schema={this.tableSchema}
              renderCommonOperate={this.searchList}
              pagination={{ current: nowPage, pageSize }}
              onChange={this.onChange}
            />
            <Button
              size='large'
              style={{ marginTop: '10px', float: 'right' }}
              onClick={this.showCommitModal}
              type='primary'
            >提交审核
            </Button>
            <Button
              size='large'
              style={{ marginTop: '10px', marginRight: '20px', float: 'right' }}
              onClick={() => router.goBack()}
            >返回
            </Button>
          </>
        :
        <Spin style={{ position : 'absolute', left : '50%', top : '50%', transform: 'translate(-50% , -50%)' }} size='large' />
    );
  }
}
