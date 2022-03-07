import React, { useState, useCallback, useMemo, useEffect } from 'react';
import { connect } from 'dva';
import moment from 'moment';
import Table from '../../components/Table/Table';
import { TAX_RATE_CONFIG_UPDATE, TAX_RATE_CONFIG_NEW } from "../../constants/authCodes";
import { translatePageType, getLocal, isEmpty } from '../../utils/utils';
import TaxRateConfigModal from './component/TaxRateConfigModal';


const initData = {
  pageObj: { current: 1, pageSize: 10 },
  searchObj: { taxType: undefined, isAvailable: undefined, }
};

const TaxRateConfig = ({ loading, projectList, dictionaries, getTaxRateList, taxRate, tabs, activeKey }) => {
  // 获取本地是否有初始化数据
  const currentTab = tabs && tabs.find(item => item.id === activeKey);
  const localData = currentTab && getLocal(currentTab.id) || { formData: {} };
  // 如果有就去本地的如果没有就用自己定义的
  const [pageObj, setPageObj] = useState(localData && !isEmpty(localData.pageObj) ? localData.pageObj : initData.pageObj);
  const [state, setState] = useState({ showModal: false, currentId: '', });
  const rateBusinessOptions = dictionaries.items.filter(item => item.dictionaryType === 'rate_business');
  const taxType = dictionaries.items.filter(item => item.dictionaryType === 'tax_type').map(item => ({ key: item.dictionaryCode, value: item.dictionaryCode, label: item.dictionaryName }));
  const [searchObj, setSearchObj] = useState(localData && !isEmpty(localData.searchObj) ? localData.searchObj : initData.searchObj);
  const isLoading = loading.effects['basicSettingStore/getTaxRateList'];

  useEffect(() => {
    getData();
    return () => {
      // 页面销毁的时候自己 先移除原有的 再存储最新的
      localStorage.removeItem(currentTab.id);
      if (getLocal('local_commonStore_tabsObj').tabs.length > 1) {
        localStorage.setItem(currentTab.id, JSON.stringify({ searchObj, pageObj }));
      }
    };
  }, [pageObj, searchObj, translatePageType, setPageObj]);

  const onChange = (pagination) => {
    const { current, pageSize } = pagination;
    setPageObj({ current, pageSize });
  };
  const getData =  useCallback((params = {}) => {
    const data = {
      limit: params.limit || pageObj.pageSize,
      offset: params.current ? pageObj.pageSize * ( params.current - 1 ) : pageObj.pageSize * ( pageObj.current - 1 ),
      ...searchObj,
    };
    getTaxRateList(data);
  }, [pageObj, searchObj, translatePageType, setPageObj]);
  const searchList = useMemo(() => ([{
    label: '税种',
    key: 'taxType',
    placeholder: '请选择税种',
    type: 'select',
    value: searchObj.taxType,
    showSearch: true,
    options: [
      { key: null, value: null, label: '全部' },
      ...taxType,
    ],
  }, {
    label: '状态',
    key: 'isAvailable',
    placeholder: '请选择状态',
    type: 'select',
    value: searchObj.refundStatus,
    showSearch: true,
    options: [
      { key: null, value: null, label: '全部' },
      { key: 0, value: 0, label: '禁用' },
      { key: 1, value: 1, label: '启用' },
    ],
  }]), [projectList, searchObj]);

  const onSearch = useCallback((val) => {
    setSearchObj({ ...val });
    setPageObj({ current: 1, pageSize: 10 });
  }, []);
  const buttonList = useMemo(() => {
    const btnList = [{
      label: '查询',
      btnType: "primary",
      key: 'search',
      type: "search",
      onClick: onSearch,
    }, {
      label: '重置',
      key: 'reset',
      onClick: onSearch,
      params : searchList.map(item => item.key)
    },
    {
      label: '添加',
      authority: [TAX_RATE_CONFIG_NEW],
      key: 'add',
      btnType: "primary",
      onClick: () => setState({ ...state, showModal: true }),
    }];
    return btnList;
  }, []);
  const schema  = useMemo(() => ({
    variable: true,
    minWidth: 1500,
    columns: [{
      title: '业务类型',
      dataIndex: 'rateBusiness',
      width: 60,
      render: (text) => text && rateBusinessOptions.find(item => item.dictionaryCode === text).dictionaryName,
    }, {
      title: '税种',
      dataIndex: 'taxType',
      width: 100,
      render: (text) => text && taxType.find(item => item.value === text).label,
    }, {
      title: '核定征收率（%）',
      dataIndex: 'appraiseLevyRate',
      render: (text) =>  `${text}%` || '-',
    }, {
      title: '税率（%）',
      dataIndex: 'taxRate',
      render: (text) =>  `${text}%` || '-',
    }, {
      title: '应纳税所得额',
      dataIndex: 'taxableIncome',
      render: (text, row) =>  `${row.taxableIncomeOperatorName}${text}元` || '-',
    }, {
      title: '速算扣除数（元/月）',
      dataIndex: 'quickCalculationDeduction',
      render: (text) =>  `${text}` || '-',
    }, {
      title: '优惠折扣',
      // width: 175,
      dataIndex: 'preferentialDiscount',
    }, {
      title: '有效期限',
      dataIndex: 'time',
      render: (text, row) =>   row.longTerm ?
      `${moment(row.startPeriodTime).format('YYYY-MM-DD HH:mm')} ~ 长期`
        :
       `${moment(row.startPeriodTime).format('YYYY-MM-DD HH:mm')} ~ ${moment(row.endPeriodTime).format('YYYY-MM-DD HH:mm')}`,
    }, {
      title: '创建人',
      dataIndex: 'createUserName',
    }, {
      title : '状态',
      dataIndex: 'isAvailable',
      render:(text)=> text ? '启用' :'禁用'
    }, {
      title: '创建时间',
      width: 175,
      dataIndex: 'createTime',
      render: (text) =>   text ? moment(text).format('YYYY-MM-DD HH:mm') : '-',
    }],
    operations: record => {
      const operationList = [{
        title: '修改',
        auth: [TAX_RATE_CONFIG_UPDATE],
        onClick: () => setState({ currentId: record.taxRateId, showModal: true }),
      }];
      return operationList;
    },
  }), [taxRate]);
  return (
    <div className="gps">
      <Table
        rowKey="taxRateId"
        searchList={searchList}
        buttonList={buttonList}
        pagination={pageObj}
        onChange={onChange}
        schema={schema}
        searchObj={searchObj}
        loading={isLoading}
        dataSource={taxRate}
      />
      {state.showModal &&
      (
        <TaxRateConfigModal setState={setState} state={state} getData={getData} />
      )}
    </div>
  );
};
const mapDispatchToProps = (dispatch) => ({
  getTaxRateList: (params) => dispatch({ type: 'basicSettingStore/getTaxRateList', payload: params  }),
});
export default connect(({ basicSettingStore, commonStore, dictionaries, loading }) => ({
  loading,
  ...basicSettingStore,
  ...commonStore,
  dictionaries,
}), mapDispatchToProps)(TaxRateConfig);
