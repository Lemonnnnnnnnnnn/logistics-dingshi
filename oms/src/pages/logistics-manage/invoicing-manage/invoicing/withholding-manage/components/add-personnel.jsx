import React, { useState, useCallback, useMemo, useEffect } from 'react';
import { Modal, message } from 'antd';
import { connect } from 'dva';
import { postRemitUsers } from '../../../../../../services/withholdingManage';
import Table from '../../../../../../components/table/table';
import styles from './modal.less';

const  AddPersonnel = ({
  loading,
  getUserAddList,
  addVisible,
  setAddVisible,
  usersAdd,
  getList,
} ) => {
  const [selectedRow, setSelectedRow] = useState();
  const [pageObj, setPageObj] = useState({ current: 1, pageSize: 10 });
  const [searchObj, setSearchObj] = useState({ time: [], receivingNo: undefined, carNo: undefined, transportNo: undefined, });
  const isLoading = loading.effects['withholdingManageStore/getUserAddList'];
  useEffect(() => {
    getData();
  }, [pageObj, searchObj, onSearch]);

  const getData =  useCallback(() => {
    getUserAddList({
      limit: pageObj.pageSize,
      offset: (pageObj.current - 1) * pageObj.pageSize,
      ...searchObj
    });
  }, [pageObj, searchObj]);

  const onChange = (val) => {
    const { current, pageSize } = val;
    setPageObj({ current, pageSize });
  };

  const onOk = () => {
    if (!(selectedRow && selectedRow.length)) {
      return message.info('请至少选择一条数据！');
    }
    postRemitUsers({ userIdList: selectedRow.map(item => item.userId) }).then(() => {
      message.success('操作成功!');
      setAddVisible(false);
      getList();
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
        title: '纳税人',
        width: 170,
        dataIndex: 'nickName',
        render: (text) =>  text || '-',
      },
      {
        title: '联系方式',
        dataIndex: 'phone',
        render: (text) =>  text || '-',
      },
      {
        title: '身份证号',
        width: 175,
        dataIndex: 'idcardNo',
      },
      {
        title: '关联承运商',
        dataIndex: 'shipNameGroup',
        render: (text) =>  text || '-',
      },
    ],
  }), []);

  const searchList = useMemo(() => ([
    {
      label: '司机',
      placeholder: "纳税人名称/手机号",
      key: 'carNo',
      type: 'input',
    },
    {
      label: '关联承运商',
      placeholder: "请输入关联承运商",
      key: 'shipNameGroup',
      type: 'input',
    },
  ]), []);
  const onSearch = useCallback((val) => {
    setSearchObj({ ...val });
    setPageObj({ current: 1, pageSize: 10 });
  }, [searchObj]);

  const buttonList = useMemo(() =>  [
    {
      label: '查询',
      btnType: "primary",
      key: 'search',
      type: "search",
      onClick: onSearch,
    },
    {
      label: '重置',
      key: 'reset',
      type: "search",
      onClick: onSearch,
    },
  ], []);
  return (
    <Modal
      title="添加代扣司机"
      centered
      visible={addVisible}
      onOk={onOk}
      wrapClassName={styles.minWidth}
      onCancel={() => setAddVisible(false)}
      width={1000}
      okText="添加"
    >
      <Table
        rowKey="userId"
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
        dataSource={usersAdd}
      />
      <div style={{ color: '#005FB7', marginTop: '10px' }}>提示：添加的司机，只计算代扣添加后的运单业务，之前的运单不会计算代扣，所以请于每月1号添加司机！</div>
    </Modal>
  );
};

const mapDispatchToProps = (dispatch) => ({
  getUserAddList: (payload) => dispatch({ type: 'withholdingManageStore/getUserAddList', payload }),
});

export default connect(({ withholdingManageStore, loading }) => ({
  loading,
  ...withholdingManageStore,
}), mapDispatchToProps)(AddPersonnel);;
