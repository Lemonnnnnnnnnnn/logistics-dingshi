import React, { useState, useCallback, useMemo, useEffect } from 'react';
import { connect } from 'dva';
import { Modal } from 'antd';
import moment from 'moment';
import { exportRemitMonthsExcel } from '../../../../../services/withholdingManage';
import Table from '../../../../../components/Table/Table';
import { WITHHOLDING_MANAGE_MONTH_EXPORT, WITHHOLDING_MANAGE_PERSONNEL } from "../../../../../constants/authCodes";
import {  routerToExportPage, getLocal, isEmpty } from '../../../../../utils/utils';


const initData = {
  pageObj: { current: 1, pageSize: 10 },
  searchObj: { vagueSelect: undefined, createDate: undefined, remitDetailStatus: undefined, idcardNo: undefined }
};

const MonthlyTable = ({ loading, projectList, history, getRemitMonthsList, remitMonths, tabs, activeKey }) => {
  // 获取本地是否有初始化数据
  const currentTab = tabs.find(item => item.id === activeKey);
  const localData = currentTab && getLocal(currentTab.id) || { formData: {} };
  // 如果有就去本地的如果没有就用自己定义的
  const [pageObj, setPageObj] = useState(localData && !isEmpty(localData.pageObj) ? localData.pageObj : initData.pageObj);
  const [searchObj, setSearchObj] = useState(localData &&!isEmpty(localData.searchObj) ? { ...localData.searchObj, createDate: localData.searchObj.createDate && [moment(localData.searchObj.createDate[0]).startOf('month'), moment(localData.searchObj.createDate[1]).endOf('month')] } : initData.searchObj);
  const isLoading = loading.effects['withholdingManageStore/getRemitMonthsList'];

  useEffect(() => {
    getData();
    return () => {
      // 页面销毁的时候自己 先移除原有的 再存储最新的
      localStorage.removeItem(currentTab.id);
      if (getLocal('local_commonStore_tabsObj').tabs.length > 1) {
        localStorage.setItem(currentTab.id, JSON.stringify({ searchObj, pageObj }));
      }
    };
  }, [pageObj, searchObj]);

  const onChange = (pagination) => {
    const { current, pageSize } = pagination;
    setPageObj({ current, pageSize });
  };
  const getData =  useCallback((params = {}) => {
    const data = {
      limit: params.limit || pageObj.pageSize,
      offset: params.current ? pageObj.pageSize * ( params.current - 1 ) : pageObj.pageSize * ( pageObj.current - 1 ),
      ...searchObj,
      createDateStart: searchObj.createDate && moment(searchObj.createDate[0]).startOf('month').format('YYYY/MM/DD HH:mm:ss'),
      createDateEnd: searchObj.createDate && moment(searchObj.createDate[1]).endOf('month').format('YYYY/MM/DD HH:mm:ss'),
    };
    getRemitMonthsList(data);
  }, [pageObj, searchObj]);
  const searchList = useMemo(() => ([{
    label: '纳税人',
    key: 'vagueSelect',
    placeholder: "纳税人名称/手机号",
    value: searchObj.vagueSelect,
    type: 'input',
  }, {
    label: '代扣开始月度',
    key: 'createDate',
    placeholder: ['开始月', '结束月'],
    type: 'month',
    value: searchObj.createDate && [moment(searchObj.createDate[0]).startOf('month'), moment(searchObj.createDate[1]).endOf('month')],
    allowClear: true,
  }, {
    label: '状态',
    key: 'remitDetailStatus',
    placeholder: "请选择状态",
    type: 'select',
    value: searchObj.remitDetailStatus,
    showSearch: true,
    options: [
      { key: null, value: null, label: '全部' },
      { key: 0, value: 0, label: '待缴' },
      { key: 1, value: 1, label: '已缴' },
    ],
  }, {
    label: '身份证号',
    key: 'idcardNo',
    placeholder: "可输入后六位",
    value: searchObj.idcardNo,
    type: 'input',
  }]), [projectList, searchObj]);

  const onExport = useCallback(
    (val) => {
      const data = {
        ...val,
        createDateStart: val.createDate ? moment(val.createDate[0]).startOf('month').format('YYYY/MM/DD HH:mm:ss') : undefined,
        createDateEnd: val.createDate ? moment(val.createDate[1]).endOf('month').format('YYYY/MM/DD HH:mm:ss') : undefined,
      };
      routerToExportPage(exportRemitMonthsExcel, { ...data, fileName: '月度汇总' });
    }, []);

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
      label: '导出搜索结果',
      authority: [WITHHOLDING_MANAGE_MONTH_EXPORT],
      key: 'export',
      btnType: "primary",
      onClick: onExport,
    },
    {
      label: '代缴人员管理',
      authority: [WITHHOLDING_MANAGE_PERSONNEL],
      key: 'personnelManage',
      btnType: "primary",
      onClick: () => history.push('/invoicing-manage/withholdingManage/personnelManage'),
    }];
    return btnList;
  }, []);
  const schema  = useMemo(() => ({
    variable: true,
    minWidth: 1200,
    columns: [{
      title: '月度',
      dataIndex: 'monthDate',
      width: 60,
    }, {
      title: '纳税人',
      dataIndex: 'nickName',
      width: 100,
    }, {
      title: '联系方式',
      dataIndex: 'phone',
      render: (text) =>  text || '-',
    }, {
      title: '身份证号',
      dataIndex: 'idcardNo',
    }, {
      title: '本月累计收入',
      dataIndex: 'totalIncome'
    }, {
      title: '个人所得税',
      dataIndex: 'personalIncomeTax',
    }, {
      title: '印花税',
      // width: 175,
      dataIndex: 'stampTax',
    }, {
      title: '地方教育费附加',
      dataIndex: 'localEducationTax',
    }, {
      title: '教育费附加',
      dataIndex: 'educationTax',
    }, {
      title: '城建税',
      width: 175,
      dataIndex: 'cityTax',
    }, {
      title: '增值税',
      width: 175,
      dataIndex: 'valueAddedTax',
    }, {
      title: '税费合计',
      width: 175,
      dataIndex: 'totalTaxes',
      render: (text, row) =>  (
        <div
          style={{ color: '#1890FF', cursor: 'pointer' }}
          onClick={() => history.push('/invoicing-manage/withholdingManage/withholdingManage/details', { vagueSelect: row.phone })}
        >{text}
        </div>) || '-',
    }, {
      title: '状态',
      dataIndex: 'remitDetailStatus',
      render: (text) =>  text ? '已缴' : '待缴',
    }],
  }), [remitMonths]);
  const onExamine = useCallback(() => {
    Modal.confirm({
      title: '系统提示',
      icon: null,
      width: 1000,
      content: (
        <div>
          <img src="https://production-environmentn-web-hangzhou.oss-cn-hangzhou.aliyuncs.com/business/tax/tax.png" alt="" />
          <div>
            备注：1、销售额15万/月以下免征增值税；2、个体户个人所得税减半征收；3、目前增值税优惠政策税率为1%。
          </div>
        </div>
      ),
      okText: '',
      cancelText: '关闭',
      onOk: () => {

      }
    });
  }, []);
  const TabTitle = useMemo(() => <div style={{ color: '#1890FF', textAlign: 'right', marginBottom: '15px' }}><span onClick={onExamine}>查看纳税税率</span></div>, []);
  return (
    <div className="gps">
      <Table
        rowKey="id"
        searchList={searchList}
        buttonList={buttonList}
        pagination={pageObj}
        onChange={onChange}
        schema={schema}
        TabTitle={TabTitle}
        searchObj={searchObj}
        loading={isLoading}
        dataSource={remitMonths}
      />
    </div>
  );
};
const mapDispatchToProps = (dispatch) => ({
  getRemitMonthsList: (params) => dispatch({ type: 'withholdingManageStore/getRemitMonthsList', payload: params  }),
});
export default connect(({ withholdingManageStore, commonStore, loading }) => ({
  loading,
  ...withholdingManageStore,
  ...commonStore,
}), mapDispatchToProps)(MonthlyTable);
