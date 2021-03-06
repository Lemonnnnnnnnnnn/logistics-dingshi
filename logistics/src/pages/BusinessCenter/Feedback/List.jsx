import React, { useState, useCallback, useMemo, useEffect } from 'react';
import { connect } from 'dva';
import moment from 'moment';
import { exportExcel } from '../../../services/feedbackService';
import Table from '../../../components/Table/Table';
import { FEEDBACK_PORT, renderAskStatus, renderPort, FEEDBACK_ASK_TYPE } from '../../../constants/feedback';
import {  routerToExportPage, getLocal, isEmpty } from '../../../utils/utils';
import styles from './List.less';

const initData = {
  pageObj: { current: 1, pageSize: 10 },
  searchObj: { createTime: undefined, feedbackPort: undefined, feedbackContent: undefined, feedbackType: undefined, isEnclosure: undefined, feedbackStatus: undefined }
};

const List = ({ loading, projectList, history, getFeedbackList, feedback, tabs, activeKey }) => {
  const currentTab = tabs.find(item => item.id === activeKey);
  const localData = getLocal(currentTab.id);
  const [pageObj, setPageObj] = useState(localData && !isEmpty(localData.pageObj) ? localData.pageObj : initData.pageObj);
  const [searchObj, setSearchObj] = useState(localData && !isEmpty(localData.searchObj) ? localData.searchObj : initData.searchObj);
  const isLoading = loading.effects['feedbackStore/getFeedbackList'];

  useEffect(() => {
    getData();
    return () => {
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
    getFeedbackList({
      ...searchObj,
      ...params,
      limit: params.limit || pageObj.pageSize,
      offset: params.current ? pageObj.pageSize * ( params.current - 1 ) : pageObj.pageSize * ( pageObj.current - 1 ),
      createTimeStart: searchObj.createTime && searchObj.createTime.length ? moment(searchObj.createTime[0]).startOf('day').format('YYYY/MM/DD HH:mm:ss') : undefined,
      createTimeEnd: searchObj.createTime && searchObj.createTime.length ? moment(searchObj.createTime[1]).endOf('day').format('YYYY/MM/DD HH:mm:ss') : undefined,
    });
  }, [pageObj, searchObj]);

  const searchList = useMemo(() => ([{
    label: '????????????',
    key: 'createTime',
    type: 'time',
    value: searchObj.createTime && searchObj.createTime.map(item => moment(item)),
  }, {
    label: '????????????',
    key: 'feedbackPort',
    placeholder: '?????????????????????',
    type: 'select',
    value: searchObj.feedbackPort,
    showSearch: true,
    options: [
      { key: null, value: null, label: '??????' },
      {
        label: '??????APP',
        key: FEEDBACK_PORT.DRIVER_APP,
        value: FEEDBACK_PORT.DRIVER_APP
      }, {
        label: '??????APP',
        key: FEEDBACK_PORT.CARRY_APP,
        value: FEEDBACK_PORT.CARRY_APP
      }, {
        label: '??????APP',
        key: FEEDBACK_PORT.CONSIGNMENT_APP,
        value: FEEDBACK_PORT.CONSIGNMENT_APP
      }, {
        label: '???????????????',
        key: FEEDBACK_PORT.DRIVER_LET,
        value: FEEDBACK_PORT.DRIVER_LET
      }, {
        label: '???????????????',
        key: FEEDBACK_PORT.CARRY_LET,
        value: FEEDBACK_PORT.CARRY_LET
      }, {
        label: '???????????????',
        key: FEEDBACK_PORT.CONSIGNMENT_LET,
        value: FEEDBACK_PORT.CONSIGNMENT_LET
      }, {
        label: '???????????????',
        key: FEEDBACK_PORT.CUSTOMER_LET,
        value: FEEDBACK_PORT.CUSTOMER_LET
      }],
  }, {
    label: '????????????',
    key: 'feedbackContent',
    placeholder: '?????????????????????',
    value: searchObj.feedbackContent,
    type: 'input',
  }, {
    label: '????????????',
    placeholder: '?????????????????????',
    key: 'feedbackType',
    value: searchObj.feedbackType,
    type: 'select',
    options: [
      { key: null, value: null, label: '??????' },
      {
        label: '????????????',
        key: FEEDBACK_ASK_TYPE.ABNORMAL,
        value: FEEDBACK_ASK_TYPE.ABNORMAL
      }, {
        label: '????????????',
        key: FEEDBACK_ASK_TYPE.PROPOSAL,
        value: FEEDBACK_ASK_TYPE.PROPOSAL
      }, {
        label: '????????????',
        key: FEEDBACK_ASK_TYPE.OTHER,
        value: FEEDBACK_ASK_TYPE.OTHER
      }],
  }, {
    label: '???????????????',
    key: 'isEnclosure',
    placeholder: '?????????',
    type: 'select',
    value: searchObj.isEnclosure,
    showSearch: true,
    options: [
      { key: null, value: null, label: '??????' },
      {
        label: '???',
        key: 1,
        value: 1
      }, {
        label: '??????',
        key:0,
        value:0
      }],
  }, {
    label: '??????',
    key: 'feedbackStatus',
    placeholder: '???????????????',
    type: 'select',
    value: searchObj.feedbackStatus,
    showSearch: true,
    options: [
      { key: null, value: null, label: '??????' },
      {
        label: '?????????',
        key: 1,
        value: 1
      }, {
        label: '?????????',
        key: 2,
        value: 2
      }],
  }]), [projectList, searchObj]);


  const onExport = useCallback(
    (val) => {
      const data = {
        ...val,
        createTimeStart: val.createTime ? moment(val.createTime[0]).startOf('day').format('YYYY/MM/DD HH:mm:ss') : undefined,
        createTimeEnd: val.createTime ? moment(val.createTime[1]).endOf('day').format('YYYY/MM/DD HH:mm:ss') : undefined,
      };
      routerToExportPage(exportExcel, { ...data, fileName: '????????????'  });
    }, []);
  const onSearch = useCallback((val) => {
    setSearchObj({ ...val });
    setPageObj({ current: 1, pageSize: 10 });
  }, []);
  const buttonList = useMemo(() => [{
    label: '??????',
    btnType: "primary",
    key: 'search',
    type: "search",
    onClick: onSearch,
  }, {
    label: '??????',
    key: 'reset',
    onClick: onSearch,
    params : searchList.map(item => item.key)
  }, {
    label: '??????Excel',
    key: 'export',
    btnType: "primary",
    onClick: onExport,
  }], []);

  const schema  = useMemo(() => ({
    variable: true,
    minWidth: 1800,
    columns: [{
      title: '??????',
      dataIndex: 'feedbackNumber',
      width: 150,
    }, {
      title: '????????????',
      dataIndex: 'feedbackType',
      render: (text) => (<span>{renderAskStatus(text)}</span>)
    }, {
      title: '????????????',
      width: 300,
      whiteSpace: 'normal',
      dataIndex: 'feedbackContent'
    }, {
      title: '???????????????',
      dataIndex: 'isEnclosure',
      render: (text) => (<span>{text ? '???' : '??????'}</span>)
    }, {
      title: '????????????',
      dataIndex: 'createTime',
      width: 175,
      render: (text) =>  text ? moment(text).format('YYYY-MM-DD HH:mm:ss') : '-',
    }, {
      title: '????????????',
      dataIndex: 'feedbackPort',
      render: (text) => (<span>{renderPort(text)}</span>)
    }, {
      title: '???????????????',
      dataIndex: 'feedbackName'
    }, {
      title: '??????',
      dataIndex: 'feedbackStatus',
      render: (text) => (<span>{text === 1 ? '?????????' : '?????????'}</span>)
    }],
    operations: record => {
      const { feedbackId, feedbackStatus } = record;
      const operationList = [{
        title: '??????',
        onClick: () => history.push(`feedback/detail?pageKey=${feedbackId}`),
      }, feedbackStatus === 1 && {
        title: '??????',
        onClick: () => history.push(`feedback/reply?pageKey=${feedbackId}`),
      }];
      return operationList;
    },
  }), []);
  return (
    <div className={styles.feedbackTable}>
      <Table
        rowKey="feedbackId"
        searchList={searchList}
        buttonList={buttonList}
        pagination={pageObj}
        onChange={onChange}
        schema={schema}
        loading={isLoading}
        searchObj={searchObj}
        dataSource={feedback}
      />
    </div>
  );
};
const mapDispatchToProps = (dispatch) => ({
  getFeedbackList: (params) => dispatch({ type: 'feedbackStore/getFeedbackList', payload: params }),
});

export default connect(({ feedbackStore, commonStore, loading }) => ({
  loading,
  ...feedbackStore,
  ...commonStore,
}), mapDispatchToProps)(List);
