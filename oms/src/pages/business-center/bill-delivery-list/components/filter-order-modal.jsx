import React, { useState, useCallback, useMemo, useEffect } from 'react';
import { Modal, message } from 'antd';
import { connect } from 'dva';
import moment from 'moment';
import { isEmpty, getLocal } from '../../../../utils/utils';
import Table from '../../../../components/table/table';
import ConfirmModal from '../../../../components/common/confirm-modal';
import styles from './modal.less';

const  FilterOrderModal = ({
  filterVisible,
  setFilterVisible,
  screenOutTransport,
  transports,
  projectId,
  loading,
  getByTransportNo,
  getDetailByTransportNo,
  transportList,
  pageType = '',
  transportItems,
  currentCount = 0,
} ) => {
  const [selectedRow, setSelectedRow] = useState();
  const [pageObj, setPageObj] = useState({ current: 1, pageSize: 10 });
  const [searchObj, setSearchObj] = useState({ time: [], receivingNo: undefined, carNo: undefined, transportNo: undefined, });
  const isLoading = loading.effects['billDeliveryStore/screenOutTransport'];
  useEffect(() => {
    getData();
  }, [pageObj, searchObj, onSearch]);

  const getData =  useCallback(() => {
    const { time, receivingNo, carNo, transportNo } = searchObj && searchObj;
    let receivingStartTime;
    let receivingEndTime;
    if (!isEmpty(searchObj) && time.length !== 0) {
      const [startDate, endDate] = time;
      receivingStartTime = startDate.startOf('day').format('YYYY/MM/DD HH:mm:ss');
      receivingEndTime = endDate.endOf('day').format('YYYY/MM/DD HH:mm:ss');
    }
    const oldList = getLocal('local_transportList') || [];

    const existTransportId =  transportItems && transportItems.length ?
      transportItems.map(item => item.transportId).join(',') : oldList.map(item => item.transportId).join(',');
    screenOutTransport({
      limit: pageObj.pageSize,
      offset: (pageObj.current - 1) * pageObj.pageSize,
      projectId,
      receivingNo,
      transportNo,
      carNo,
      existTransportId,
      deleteTransportId: transportList.deles ? transportList.deles.join(',') : undefined,
      receivingStartTime,
      receivingEndTime
    });
  }, [pageObj, searchObj]);

  const onChange = (val) => {
    const { current, pageSize } = val;
    setPageObj({ current, pageSize });
  };

  const onOk = () => {
    if (!(selectedRow && selectedRow.length)) {
      return message.info('??????????????????????????????');
    }
    if (currentCount + selectedRow.length > 300) {
      return ConfirmModal(`????????????????????????????????????300??????????????????????????????${300 - currentCount}???`, () => {})();
    }

    if (pageType === 'detail') {
      setFilterVisible(false);
      return getDetailByTransportNo({ items: selectedRow });
    }
    getByTransportNo({ projectId, transportNos: selectedRow.map(item => item.transportNo).join(',') }).then(() => {
      message.success('????????????!');
      setFilterVisible(false);
    });
  };
  const onSelectRow = useCallback((selected) => {
    setSelectedRow([...selected]);
  }, [selectedRow]);

  const schema  = useMemo(() => ({
    variable: true,
    minWidth: 2200,
    columns: [
      {
        title: '?????????',
        width: 170,
        dataIndex: 'transportNo',
        render: (text) =>  text || '-',
      },
      {
        title: '?????????',
        dataIndex: 'carNo',
        render: (text) =>  text || '-',
      },
      {
        title: '????????????',
        width: 175,
        dataIndex: 'receivingTime',
        render: (text) =>  text ? moment(text).format('YYYY-MM-DD HH:mm:ss') : '-',
      },
      {
        title: '????????????',
        dataIndex: 'receivingNo',
        render: (text) =>  text || '-',
      },
      {
        title: '?????????',
        dataIndex: 'receivingNum',
        render: (text) =>  text || '-',
      },
      {
        title: '????????????',
        dataIndex: 'goodsName',
        render: (text) =>  text || '-',
      },
      {
        title: '??????',
        dataIndex: 'driverUserName',
        render: (text) =>  text || '-',
      }
    ],
  }), []);

  const searchList = useMemo(() => ([
    {
      label: '?????????',
      key: 'carNo',
      type: 'input',
      allowClear: true,
    },
    {
      label: '?????????',
      key: 'transportNo',
      type: 'input',
      allowClear: true,
    },
    {
      label: '????????????',
      key: 'receivingNo',
      type: 'input',
      allowClear: true,
    },
    {
      label: '????????????',
      key: 'time',
      type: 'time',
    },
  ]), []);
  const onSearch = useCallback((val) => {
    setSearchObj({ ...val });
    setPageObj({ current: 1, pageSize: 10 });
  }, [searchObj]);

  const buttonList = useMemo(() =>  [
    {
      label: '??????',
      btnType: "primary",
      key: 'search',
      type: "search",
      onClick: onSearch,
    },
  ], []);
  return (
    <Modal
      title="????????????"
      centered
      visible={filterVisible}
      onOk={onOk}
      wrapClassName={styles.minWidth}
      onCancel={() => setFilterVisible(false)}
      width={1000}
      okText="??????"
    >
      <Table
        rowKey="transportId"
        searchList={searchList}
        buttonList={buttonList}
        pagination={pageObj}
        onChange={onChange}
        schema={schema}
        searchObj={searchObj}
        loading={isLoading}
        multipleSelect
        defaultSelectedRowKeys={selectedRow}
        onSelectRow={onSelectRow}
        dataSource={transports}
      />
    </Modal>
  );
};

const mapDispatchToProps = (dispatch) => ({
  screenOutTransport: (payload) => dispatch({ type: 'billDeliveryStore/screenOutTransport', payload }),
  getDetailByTransportNo: (payload) => dispatch({ type: 'billDeliveryStore/getDetailByTransportNo', payload }),
  getByTransportNo: (payload) => dispatch({ type: 'billDeliveryStore/getByTransportNo', payload }),
});

export default connect(({ billDeliveryStore, loading }) => ({
  loading,
  ...billDeliveryStore,
}), mapDispatchToProps)(FilterOrderModal);;
