import React, { useState, useCallback, useMemo, useEffect } from 'react';
import { connect } from 'dva';
import { Modal } from 'antd';
import moment from 'moment';
import { exportRemitDetailsExcel } from '../../../../../../services/withholdingManage';
import Table from '../../../../../../components/table/table';
import {  routerToExportPage, getLocal, isEmpty, omit } from '../../../../../../utils/utils';
// import ConfirmModal from '../../../components/Common/ConfirmModal';
// import styles from './List.less';


const initData = {
  pageObj: { current: 1, pageSize: 10 },
  searchObj: { vagueSelect: undefined, orderNo: undefined, remit: undefined, remitDetailStatus: undefined, idcardNo: undefined }
};

const ScheduleTable = ({ loading, projectList, history, getRemitDetailsList, remitDetails, tabs, activeKey }) => {
  // 获取本地是否有初始化数据
  const currentTab = tabs.find(item => item.id === activeKey);
  const localData = currentTab && getLocal(currentTab.id) || { formData: {} };
  // 如果有就去本地的如果没有就用自己定义的
  const [pageObj, setPageObj] = useState(localData && !isEmpty(localData.pageObj) ? localData.pageObj : initData.pageObj);
  const [searchObj, setSearchObj] = useState(localData && !isEmpty(localData.searchObj) ? localData.searchObj : initData.searchObj);
  const [selectedRow, setSelectedRow] = useState([]);
  const isLoading = loading.effects['withholdingManageStore/getRemitDetailsList'];

  useEffect(() => {
    getData();
    return () => {
      // 页面销毁的时候自己 先移除原有的 再存储最新的
      localStorage.removeItem(currentTab.id);
      if (getLocal('local_commonStore_tabs')?.tabs.length > 1) {
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
      remitTimeStart: searchObj && searchObj.remit && searchObj.remit.length && moment(searchObj.remit[0]).startOf('day').format('YYYY/MM/DD HH:mm:ss'),
      remitTimeEnd: searchObj && searchObj.remit && searchObj.remit.length && moment(searchObj.remit[0]).endOf('day').format('YYYY/MM/DD HH:mm:ss'),
    };
    getRemitDetailsList(omit(data, ['remit']));
  }, [pageObj, searchObj]);
  const searchList = useMemo(() => ([{
    label: '司机',
    key: 'vagueSelect',
    placeholder: "纳税人名称/手机号",
    value: searchObj.vagueSelect,
    type: 'input',
  }, {
    label: '支付单号',
    key: 'orderNo',
    placeholder: "请输入支付单号",
    value: searchObj.orderNo,
    type: 'input',
  }, {
    label: '代扣日期',
    key: 'remit',
    type: 'time',
    value: searchObj.newTime && searchObj.newTime.map(item => moment(item)),
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
    label: '司机身份证号',
    key: 'idcardNo',
    placeholder: "可输入后六位",
    value: searchObj.idcardNo,
    type: 'input',
  }]), [projectList, searchObj]);

  const onExport = useCallback(
    (val) => {
      routerToExportPage(exportRemitDetailsExcel, { ...val, fileName: '代扣代缴明细' });
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
      // authority: [DELIVERY_LIST_IMPORT],
      key: 'export',
      btnType: "primary",
      onClick: onExport,
    },
    {
      label: '代缴人员管理',
      // authority: [DELIVERY_LIST_IMPORT],
      key: 'personnelManage',
      btnType: "primary",
      onClick: () => history.push('/invoicing-manage/withholdingManage/personnelManage'),
    }];
    return btnList;
  }, []);
  const schema  = useMemo(() => ({
    variable: true,
    minWidth: 2200,
    columns: [{
      title: '支付单号',
      dataIndex: 'orderNo',
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
      title: '收入',
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
      title: '教费育附加',
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
    }, {
      title: '状态',
      dataIndex: 'remitDetailStatus',
      render: (text) =>  text ? '已缴' : '待缴',
    }, {
      title: '代扣时间',
      width: 175,
      dataIndex: 'remitTime',
      render: (text) =>   text ? moment(text).format('YYYY-MM-DD HH:mm:ss') : '-',
    }],
  }), [remitDetails]);
  const onSelectRow = useCallback((selected) => {
    setSelectedRow(selected);
  }, [selectedRow]);
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
        rowKey="remitDetailId"
        searchList={searchList}
        buttonList={buttonList}
        pagination={pageObj}
        onChange={onChange}
        schema={schema}
        searchObj={searchObj}
        loading={isLoading}
        dataSource={remitDetails}
        multipleSelect
        onSelectRow={onSelectRow}
        TabTitle={TabTitle}
      />
    </div>
  );
};
const mapDispatchToProps = (dispatch) => ({
  getRemitDetailsList: (params) => dispatch({ type: 'withholdingManageStore/getRemitDetailsList', payload: params  }),
});
export default connect(({ withholdingManageStore, commonStore, loading }) => ({
  loading,
  ...withholdingManageStore,
  ...commonStore,
}), mapDispatchToProps)(ScheduleTable);
