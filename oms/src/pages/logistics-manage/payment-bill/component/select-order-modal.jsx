import React, { useEffect, useState, useCallback, useMemo } from 'react';
import { Modal, Form, Button, Input, Row, Icon, Col, message , Select } from 'antd';
import { connect } from 'dva';
import {  getTransportsPost, getOrdersTransportsDriver } from "@/services/apiService";
import { xor, isEmpty, uniq } from '../../../../utils/utils';
import Table from '../../../../components/table/table';
import styles from './pay-form.less';

const initPageObj = { current: 1, pageSize: 10 };

const  SelectOrderModal = ({
                             handleVisible,
                             selectOrderVisible,
                             form,
                             transports,
                             orderId,
                             allIds,
                             setTransports,
                           } ) => {
  // const [] = leftData.filter(item => +item.key % 3 > 1).map(item => item.key); // 默认右边数据
  const [pageObj, setPageObj] = useState(initPageObj);
  const [pageRightObj, setPageRightObj] = useState({ current: 1, pageSize: 10 });
  const [targetKeys, setTargetKeys] = useState(transports || []);
  const [searchObj, setSearchObj] = useState({});
  const [rightSearchObj, setRightSearchObj] = useState({});
  const [rightDriverInfo, setRightDriverInfo] = useState([]);
  const [selectedRow, setSelectedRow] = useState([]);
  const [selectedRightRow, setSelectedRightRow] = useState([]);
  const [leftData, setLeftData] = useState({ items: [], count:0 });
  const [rightData, setRightData] = useState({ items: [], count:0 });
  const [totalPrice, setTotalPrice] = useState([]);
  const [totalRightPrice, setTotalRightPrice] = useState([]);
  const [driverList, setDriverList] = useState([]);

  useEffect(()=>{
    getOrdersTransportsDriver({ orderIdList :  orderId }).then(data=> setDriverList(data));
  }, []);

  useEffect(() => {
    getData();
  }, [pageObj, searchObj, targetKeys]);

  useEffect(() => {
    if (targetKeys.length) {
      getRightData();
    }
  }, [pageRightObj, rightSearchObj, targetKeys]);

  const onOk = () => {
    if (!targetKeys.length) {
      message.info('请至少选择一张运单！');
    }
    handleVisible(false);
    setTransports(targetKeys);
  };

  const getData =  useCallback((params = {}) => {
    getTransportsPost({
      ...searchObj,
      ...params,
      orderIdList : orderId,
      isNeedDriverCount: true,
      notSelectTransportIdList: targetKeys.length ? targetKeys : undefined,
      limit: params.limit || pageObj.pageSize,
      offset: params.current ? pageObj.pageSize * ( params.current - 1 ) : pageObj.pageSize * ( pageObj.current - 1 ),
    }).then(res => {
      const newData = res.orderTransportListResps;
      setLeftData({ items: newData, count:  res.transportCount });
      setTotalPrice(Number(res.orderTransportDriverResps.reduce((r, n) => r += n.receivables, 0)).toFixed(2));
    });
  }, [pageObj, searchObj, targetKeys]);

  const getRightData =  useCallback((params = {}) => {
    getTransportsPost({
      ...rightSearchObj,
      ...params,
      orderIdList : orderId,
      isNeedDriverCount: true,
      transportIdList: targetKeys.length ? targetKeys : undefined,
      limit: pageRightObj.pageSize,
      offset: pageRightObj.pageSize * ( pageRightObj.current - 1 ),
    }).then(res => {
      const newData = res.orderTransportListResps;
      setRightData({ items: newData, count:  res.transportCount });
      setRightDriverInfo(res.orderTransportDriverResps);
      setTotalRightPrice(Number(res.orderTransportDriverResps.reduce((r, n) => r += n.receivables, 0)).toFixed(2));
    });
  }, [pageRightObj, rightSearchObj, targetKeys]);

  const onChangePage = useCallback((pagination) => {
    const { current, pageSize } = pagination;
    setPageObj({ current, pageSize });
  }, [pageObj]);

  const onChangeRightPage = useCallback((pagination) => {
    const { current, pageSize } = pagination;
    setPageRightObj({ current, pageSize });
  }, [pageRightObj]);

  const onSearch = useCallback((type) => () => {
    setPageObj(initPageObj);
    form.validateFields((err, values) => {
      if (type === 'left') {
        setSearchObj({
          ...values,
          driverUserIdList : values.driverUserIdList?.length ? values.driverUserIdList : undefined
        });
      } else if (type === 'right') {
        if (targetKeys.length) {
          setRightSearchObj({
            ...values,
            driverUserIdList : values.driverUserIdList?.length ? values.driverUserIdList : undefined
          });
        }
      } else {
        setSearchObj({});
        if (!isEmpty(searchObj)) {
          setSearchObj({});
        }
        if (!isEmpty(rightSearchObj)) {
          setRightSearchObj({});
        }
        form.setFieldsValue({ transportNo: undefined, driverUserIdList: undefined, carNo: undefined, accountTransportNo: undefined, receivables : undefined });
      }
    });
  }, [searchObj, rightSearchObj, targetKeys]);

  const onSelectRow = useCallback((selected) => {
    setSelectedRow(selected);
  }, [selectedRow, targetKeys]);

  const onSelectRightRow = useCallback((selected) => {
    setSelectedRightRow(selected);
  }, [selectedRightRow, targetKeys]);

  const schema  = useMemo(() => ({
    columns: [{
      dataIndex: 'accountTransportNo',
      title: '账单号',
    },
      {
        dataIndex: 'transportNo',
        title: '运单号',
      },
      {
        dataIndex: 'driverUserName',
        title: '司机',
      },
      {
        dataIndex: 'carNo',
        title: '车牌号',
      },
      {
        dataIndex: 'receivables',
        title: '应付账款',
      }],
  }), []);
  const onRightChange = useCallback(() => {
    setTargetKeys(uniq([ ...targetKeys, ...selectedRow]));
    setSelectedRow([]);
  }, [selectedRow, targetKeys]);

  const onLeftChange = useCallback(() => {
    if (![...xor(targetKeys, selectedRightRow)].length) {
      setRightData({ items: [], count: 0 });
    }
    setTargetKeys(uniq([...xor(targetKeys, selectedRightRow)]));
    setSelectedRightRow([]);
  }, [selectedRightRow, targetKeys, rightData]);

  const onRightAll = useCallback(() => {
    getTransportsPost({
      ...searchObj,
      notSelectTransportIdList: targetKeys.length ? targetKeys : undefined,
      orderIdList : orderId,
      limit: 10000,
      offset: 0,
    }).then(res => {
      setLeftData({ items: [ ...res.orderTransportListResps ], count:  res.transportCount });
      setTargetKeys(uniq([...targetKeys, ...res.orderTransportListResps.map(item => item.transportId)]));
      setSelectedRow([]);
    });
  }, [selectedRightRow, searchObj, targetKeys, leftData]);

  const onLeftAll = useCallback(() => {
    getTransportsPost({
      ...rightSearchObj,
      transportIdList: targetKeys.length ? targetKeys : undefined,
      orderIdList : orderId,
      limit: 10000,
      offset: 0,
    }).then(res => {
      if (!xor(targetKeys, res.orderTransportListResps.map(item => item.transportId)).length) {
        setRightData({ items: [], count:0 });
      }
      setTargetKeys(uniq(xor(targetKeys, res.orderTransportListResps.map(item => item.transportId))));
      setSelectedRightRow([]);
    });
  }, [selectedRightRow, rightSearchObj, targetKeys, rightData]);
  return (
    <Modal
      title="支付—选择要支付的运单"
      centered
      visible={selectOrderVisible}
      onOk={onOk}
      onCancel={() => handleVisible(false)}
      width={1100}
      okText="确定"
      bodyStyle={{ minHeight: '750px'  }}
    >
      <div>
        <Form>
          <Row>
            <Col span={6} style={{ paddingRight: '15px' }}>
              <Form.Item label="运单号">
                {form.getFieldDecorator(`transportNo`)(<Input placeholder="请输入运单号"  />)}
              </Form.Item>
            </Col>
            <Col span={6} style={{ paddingRight: '15px' }}>
              <Form.Item label="账单号">
                {form.getFieldDecorator(`accountTransportNo`)(<Input placeholder="请输入账单号"  />)}
              </Form.Item>
            </Col>
            <Col span={6}>
              <Form.Item label="车牌号" style={{ paddingRight: '15px' }}>
                {form.getFieldDecorator(`carNo`,)( <Input placeholder="请输入车牌号"  /> )}
              </Form.Item>
            </Col>
            <Col span={6}>
              <Form.Item label="司机">
                {form.getFieldDecorator('driverUserIdList')(
                  <Select mode='multiple' placeholder='请选择司机' style={{ width : '15rem' }}>
                    {
                      driverList.map(item=><Select.Option value={item.driverUserId}>{item.driverUserName}{item.driverUserPhone.slice(-4)}</Select.Option>)
                    }
                  </Select>
                )}
              </Form.Item>
            </Col>
          </Row>
          <Row>
            <Col span={6} style={{ paddingRight: '15px' }}>
              <Form.Item label="金额">
                {form.getFieldDecorator(`receivables`)(<Input placeholder="请输入金额"  />)}
              </Form.Item>
            </Col>
          </Row>
          <Form.Item>
            <div style={{ textAlign:  'right' }}>
              <Button type="primary" style={{ marginRight: '15px' }} onClick={onSearch('left')}>搜索待选运单</Button>
              <Button type="primary" style={{ marginRight: '15px' }} onClick={onSearch('right')} disabled={!targetKeys.length}>搜索已选运单</Button>
              {/* <Button type="primary" style={{ marginRight: '15px' }} onClick={onSearch('right')} disabled={!targetKeys.length}>司机+金额匹配运单</Button> */}
              <Button onClick={onSearch('reset')}>重置</Button>
            </div>
          </Form.Item>
        </Form>
        <div className={styles.tableTransfer}>
          <div className={styles.tableTransferTable}>
            <p>待选运单  共计{leftData.count}条   需付费用金额总计 {totalPrice}元</p>
            <div className={styles.driverInfo} />
            <Table
              rowKey="transportId"
              pagination={pageObj}
              onChange={onChangePage}
              schema={schema}
              multipleSelect={{
                selectedRowKeys: selectedRow,
                onChange: onSelectRow
              }}
              // onSelectRow={onSelectRow}
              dataSource={leftData}
            />
          </div>
          <div className={styles.tableTransferBtn}>
            <Button type="primary" disabled={!leftData.items.length} onClick={onRightAll}>
              <Icon type="double-right" />
            </Button>
            <Button type="primary" disabled={!selectedRow.length} onClick={onRightChange}>
              <Icon type="right" />
            </Button>
            <Button type="primary" disabled={!selectedRightRow.length} onClick={onLeftChange}>
              <Icon type="left" />
            </Button>
            <Button type="primary" disabled={!rightData.items.length} onClick={onLeftAll}>
              <Icon type="double-left" />
            </Button>
          </div>
          <div className={styles.tableTransferTable}>
            <p>已选运单  共计{rightData.count}条   需付费用金额总计 {totalRightPrice}元</p>
            <div className={styles.driverInfo}>
              <p>
                {
                  rightDriverInfo.map(item => (
                    <span key={item.driverUserName}>其中{item.driverUserName} 小计{item.receivables};</span>
                  ))
                }
              </p>
            </div>
            <Table
              rowKey="transportId"
              pagination={pageRightObj}
              onChange={onChangeRightPage}
              schema={schema}
              multipleSelect={{ selectedRowKeys: selectedRightRow, onChange: onSelectRightRow }}
              // onSelectRow={onSelectRightRow}
              dataSource={rightData}
            />
          </div>
        </div>
      </div>
    </Modal>
  );
};

export default connect(({ basicSettingStore, dictionaries, loading }) => ({
  loading,
  dictionaries,
  ...basicSettingStore,
}))(Form.create()(SelectOrderModal));;

