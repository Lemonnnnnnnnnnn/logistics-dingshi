import React, { useState, useCallback, useMemo, useEffect } from 'react';
import { connect } from 'dva';
import { Button, message , Modal } from 'antd';
import moment from 'moment';
import { delTangibleBill, signTangibleBill, auditOrSubmitTangibleBill, exportExcel } from '../../../services/billDeliveryService';
import Table from '../../../components/table/table';
import { getUserInfo } from '../../../services/user';
import { ORDER_STATUS, statusOptions, renderStatus } from '../../../constants/billDelivery';
import Authorized from "../../../utils/Authorized";
import {  routerToExportPage, getLocal, isEmpty } from '../../../utils/utils';
import auth from '../../../constants/authCodes';
import BillListSteps from './components/billList-steps';
import TransferModal from './components/transfer-modal';
import NewListModal from './components/new-list-modal';
import ConfirmModal from '../../../components/common/confirm-modal';
import PhotoSignModal from './components/photo-sign-modal';
import styles from './index.less';
import ExportPdf from "@/components/Export/ExportPdf";
import { exportTransportsPdf } from "@/services/apiService";

const {
  DELIVERY_LIST_NEW, // 创建
  DELIVERY_LIST_UPDATE, // 修改
  DELIVERY_LIST_EXAMINE, // 审核
  DELIVERY_LIST_SUBMIT, // 提交审核
  DELIVERY_LIST_TRANSFER, // 转交
  DELIVERY_LIST_PHOTO, // 拍照代签
  DELIVERY_LIST_DELE, // 删除
  DELIVERY_LIST_SIGN, // 签收
  DELIVERY_LIST_PRINT, // 打印
  DELIVERY_LIST_IMPORT // 导出
} = auth;

const initData = {
  pageObj: { current: 1, pageSize: 10 },
  searchObj: { projectId: undefined, transportNo: undefined, carNo: undefined, tangibleBillStatuses: undefined, tangibleBillNo: undefined }
};

const List = ({ loading, getProjectList, projectList, history, getTangibleBills, tangibleBills, tabs, activeKey }) => {
  const currentTab = tabs.find(item => item.id === activeKey);
  // 获取本地是否有初始化数据
  const localData = getLocal(currentTab.id);

  // 如果有就去本地的如果没有就用自己定义的
  const [pageObj, setPageObj] = useState(localData && !isEmpty(localData.pageObj) ? localData.pageObj : initData.pageObj);
  const [searchObj, setSearchObj] = useState(localData && !isEmpty(localData.searchObj) ? localData.searchObj : initData.searchObj);

  const [visible, setVisible] = useState(false);
  const [selectedRow, setSelectedRow] = useState([]);
  const [signObj, setSignObj] = useState({ signVisible: false, tangibleBillId: '', tangibleBillNo: ''  });
  const [transferObj, setTransferObj] = useState({ transferVisible: false, tangibleBillId: '', projectId: ''  });
  const [showExportPdfModal, setShowExportPdfModal] = useState(false);
  const { organizationType } = getUserInfo();
  const isLoading = loading.effects['billDeliveryStore/getTangibleBills'];

  useEffect(() => {
    getProjectList('');
  }, []);

  useEffect(() => {
    getData();
    return () => {
      // 页面销毁的时候自己 先移除原有的 再存储最新的
      localStorage.removeItem(currentTab.id);
      if (getLocal('local_commonStore_tabs').tabs.length > 1) {
        localStorage.setItem(currentTab.id, JSON.stringify({ searchObj, pageObj }));
      }
    };
  }, [pageObj, searchObj]);

  const onChange = (pagination) => {
    const { current, pageSize } = pagination;
    setPageObj({ current, pageSize });
  };
  const getData =  useCallback((params = {}) => {
    getTangibleBills({
      ...searchObj,
      ...params,
      limit: params.limit || pageObj.pageSize,
      offset: params.current ? pageObj.pageSize * ( params.current - 1 ) : pageObj.pageSize * ( pageObj.current - 1 ),
    });
  }, [pageObj, searchObj]);

  const addList = useCallback(() => {
    setVisible(true);
  }, [addList]);

  const onSelectRow = useCallback((selected) => {
    setSelectedRow(selected);
  }, [selectedRow]);

  const searchList = useMemo(() => ([{
    label: '选择项目',
    key: 'projectId',
    type: 'select',
    value: searchObj.projectId,
    showSearch: true,
    options: projectList,
  }, {
    label: '运单号',
    key: 'transportNo',
    value: searchObj.transportNo,
    type: 'input',
  }, {
    label: '车牌号',
    key: 'carNo',
    value: searchObj.carNo,
    type: 'input',
  }, {
    label: '状态',
    key: 'tangibleBillStatuses',
    value: searchObj.tangibleBillStatuses,
    type: 'select',
    options: organizationType === 5 ? statusOptions : statusOptions.filter(item => item.key === 1 || item.key === 2 || item.key === null),
  }, {
    label: '交票单号',
    key: 'tangibleBillNo',
    value: searchObj.tangibleBillNo,
    type: 'input',
  }]), [projectList, searchObj]);

  const onPrint = useCallback((val) => {
    if (selectedRow.length !== 1) {
      message.destroy();
      return message.info('请选择一行数据再执行此操作!');
    }
    setSearchObj({ ...val });
    goToPrint();
  }, [selectedRow]);

  const onExport = useCallback(
    (val) => {
      if (selectedRow.length !== 1) {
        message.destroy();
        return message.info('请选择一行数据再执行此操作!');
      }
      goToExcel();
      setSearchObj({ ...val });
    }, [selectedRow]);

  const onOpenExportPdfModal = useCallback(val =>{
    setShowExportPdfModal(true);
    setSearchObj({ ...val });
  }, [selectedRow]);

  const onExportPdf = useCallback((formdata)=>{
    const { billTypeOptions, fileScale } = formdata;
    if (!selectedRow.length){
      return Modal.error({
        title : '请选择交票清单'
      });
    }
    const tangibleBillIdList = selectedRow.map(item=>item.tangibleBillId).join(',');
    const params = { isAll : fileScale === 1, billPictureList : billTypeOptions, tangibleBillIdList };

    routerToExportPage(exportTransportsPdf, params);

  });


  const onSearch = useCallback((val) => {
    setSearchObj({ ...val });
    setPageObj({ current: 1, pageSize: 10 });
  }, []);

  const buttonList = useMemo(() => {
    let btnList = [{
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
        label : '导出子单据PDF',
        key : 'exportPDF',
        onClick : onOpenExportPdfModal,
      }
    ];
    if (organizationType === 5) {
      btnList = btnList.concat([{
        label: '打印',
        key: 'print',
        authority: [DELIVERY_LIST_PRINT],
        btnType: "primary",
        onClick: onPrint,
      }, {
        label: '导出Excel',
        authority: [DELIVERY_LIST_IMPORT],
        key: 'export',
        btnType: "primary",
        onClick: onExport,
      }]);
    } else if (organizationType === 4) {
      btnList.push({
        label: '导出Excel',
        authority: [DELIVERY_LIST_IMPORT],
        key: 'export',
        btnType: "primary",
        onClick: onExport,
      });
    }
    return btnList;
  }, [selectedRow]);

  const onDelete = useCallback((tangibleBillId, data, res) => () => {
    delTangibleBill(tangibleBillId).then(() => {
      message.destroy();
      getData({ current: data.current, ...res });
      message.success('删除成功');
    });
  }, []);

  const onSignFor= useCallback((tangibleBillId, data, res) => () => {
    signTangibleBill(tangibleBillId).then(() => {
      message.destroy();
      message.success('签收成功！');
      getData({ current: data.current, ...res });
    });
  }, []);

  const onReviewd = (tangibleBillId, tangibleBillNo, tangibleBillStatus) => (_,  __, data, res) => {
    if (tangibleBillStatus === ORDER_STATUS.REVIEWD) {
      return history.push(`billDelivery/billDeliveryDetail?pageKey=${tangibleBillNo}&tangibleBillId=${tangibleBillId}&type=reviewd`, { organizationType });
    }
    auditOrSubmitTangibleBill(tangibleBillId, {
      auditType: 1,             // 类型：1提交审核 2审核 3拒绝 | must
      auditContent: "", // 审核内容
    }).then(() => {
      getData({ current: data.current, ...res });
      message.success('审核成功！');
    });
  };
  const onTransfer = (tangibleBillId, projectId) => () => {
    setTransferObj({ ...transferObj, transferVisible: true, projectId, tangibleBillId });
  };

  const goToPrint = () =>{
    const { tangibleBillId, tangibleBillNo } = selectedRow[0];
    history.push(`./print?pageKey=${tangibleBillNo}`, { tangibleBillId });
  };

  const goToExcel = () =>{
    const { tangibleBillId } = selectedRow[0];
    const params = { tangibleBillId };
    routerToExportPage(exportExcel, params);
  };

  const schema  = useMemo(() => ({
    // variable: true,
    minWidth: 2200,
    columns: [{
      title: '状态',
      dataIndex: 'tangibleBillStatus',
      width: 60,
      render: (text) => (<span>{renderStatus(text)}</span>)
    }, {
      title: '交票单号',
      dataIndex: 'tangibleBillNo',
      width: 100,
    }, {
      title: '项目名称',
      // width: 175,
      dataIndex: 'projectName'
    }, {
      title: '签收人',
      dataIndex: 'signerUserName',
      render: (text) =>  text || '-',
    }, {
      title: '签收时间',
      dataIndex: 'signTime',
      width: 175,
      render: (text) =>  text ? moment(text).format('YYYY-MM-DD HH:mm:ss') : '-',
    }, {
      title: '运单数',
      dataIndex: 'transportNum'
    }, {
      title: '创建人',
      dataIndex: 'createUserName'
    }, {
      title: '创建时间',
      width: 175,
      dataIndex: 'createTime',
      render: (text) =>  moment(text).format('YYYY-MM-DD HH:mm:ss'),
    }],
    operations: record => {
      const { tangibleBillStatus, tangibleBillId, tangibleBillNo, projectId } = record;
      let operationList = [{
        title: '详情',
        onClick: () => history.push(`billDelivery/billDeliveryDetail?pageKey=${tangibleBillNo}&tangibleBillId=${tangibleBillId}&type=details`, { organizationType }),
      }, tangibleBillStatus !== ORDER_STATUS.SIGNED_IN && {
        title: '修改',
        auth: [DELIVERY_LIST_UPDATE],
        onClick: () => history.push(`billDelivery/billDeliveryUpdate?pageKey=${tangibleBillNo}&tangibleBillId=${tangibleBillId}&type=update`, { organizationType }),
      }];
      if (organizationType === 5) {
        if ([ORDER_STATUS.NEW_CREATE, ORDER_STATUS.REFUSE, ORDER_STATUS.REVIEWD].includes(tangibleBillStatus)) {
          operationList = operationList.concat([ {
            title: tangibleBillStatus === ORDER_STATUS.REVIEWD ? '审核' : '提交审核',
            auth : tangibleBillStatus === ORDER_STATUS.REVIEWD ? [DELIVERY_LIST_EXAMINE] : [DELIVERY_LIST_SUBMIT],
            onClick: onReviewd(tangibleBillId, tangibleBillNo, tangibleBillStatus),
          }, {
            title: '删除',
            auth: [DELIVERY_LIST_DELE],
            onClick: (_,  __, data, res) => ConfirmModal('亲，确认要删除该交接单？删除后不可恢复！', onDelete(tangibleBillId, data, res))()
          }]);
        } else if (tangibleBillStatus === ORDER_STATUS.REVIEWED) {
          operationList.push({
            title: '转交',
            auth: [DELIVERY_LIST_TRANSFER],
            onClick: onTransfer(tangibleBillId, projectId),
          });
        } else if (tangibleBillStatus === ORDER_STATUS.ON_WAY) {
          operationList.push({
            title: '拍照代签',
            auth: [DELIVERY_LIST_PHOTO],
            onClick: () => setSignObj({ tangibleBillId, tangibleBillNo, signVisible: true }),
          });
        }
      } else if ((organizationType === 4 || organizationType === 3) && tangibleBillStatus === ORDER_STATUS.ON_WAY ) {
        operationList.push({
          title: '签收',
          auth: [DELIVERY_LIST_SIGN],
          onClick: (_,  __, data, res) => ConfirmModal('亲，确认这些实体单据已经收到？此操作不可逆！', onSignFor(tangibleBillId, data, res))(),
        });
      }
      return operationList;
    },
  }), []);
  return (
    <div className={styles.billBeliveryList}>
      { organizationType === 5 ? (<BillListSteps />) : null }
      <div className={styles.billBeliveryTable} style={organizationType === 5  ? {} : { marginTop: 0 }}>
        { organizationType === 5 ? (<Authorized authority={[DELIVERY_LIST_NEW]}><Button type="primary" icon="plus" onClick={addList}>新建交票清单</Button></Authorized>) : null }
        <Table
          rowKey="tangibleBillId"
          searchList={searchList}
          buttonList={buttonList}
          pagination={pageObj}
          onChange={onChange}
          schema={schema}
          loading={isLoading}
          multipleSelect
          searchObj={searchObj}
          onSelectRow={onSelectRow}
          dataSource={tangibleBills}
        />
      </div>
      {visible && (
        <NewListModal
          projectList={projectList}
          visible={visible}
          setVisible={setVisible}
          history={history}
        />)}
      {transferObj.transferVisible ? (
        <TransferModal
          getData={getData}
          transferObj={transferObj}
          setTransferObj={setTransferObj}
        /> ) : <></>}
      {signObj.signVisible ? (
        <PhotoSignModal
          signObj={signObj}
          getData={getData}
          setSignObj={setSignObj}
        /> ) : <></>}

      <Modal title='导出PDF' footer={null} width={648} visible={showExportPdfModal} onCancel={()=>setShowExportPdfModal(false)}>
        <ExportPdf
          onCancel={()=>setShowExportPdfModal(false)}
          func={onExportPdf}
        />
      </Modal>

    </div>
  );
};
const mapDispatchToProps = (dispatch) => ({
  getProjectList: (queryText) => dispatch({ type: 'billDeliveryStore/getProjectList', payload: { queryText }  }),
  getTangibleBills: (params) => dispatch({ type: 'billDeliveryStore/getTangibleBills', payload: params }),
});

export default connect(({ billDeliveryStore, commonStore, loading }) => ({
  loading,
  ...billDeliveryStore,
  ...commonStore,
}), mapDispatchToProps)(List);
