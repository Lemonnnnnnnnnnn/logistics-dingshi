import React, { useState, useMemo, useCallback, useEffect } from 'react';
import { connect } from 'dva';
import moment from 'moment';
import { Button, Modal, Icon, message, Form, Input, Alert } from 'antd';
import { SchemaForm, Item, FORM_MODE } from '@gem-mine/antd-schema-form';
import { isEmpty, cloneDeep, trim, getLocal } from '../../../utils/utils';
import { tangibleBillDetail, auditOrSubmitTangibleBill, updateTangibleBills } from '../../../services/billDeliveryService';
import { schema } from '../../../constants/billDelivery';
import TangibleEvents from './components/tangible-event';
import ModifyModal from '../transport/component/modify-modal';
import Table from '../../../components/table/table';
import ConfirmModal from '../../../components/common/confirm-modal';
import FilterOrderModal from './components/filter-order-modal';
import DetailINfo from './components/detail-INfo';
import ExpandedRowRender from './components/expanded-row-render';
import styles from './add-list.less';

const { TextArea } = Input;


const Details = ({ history, loading, location, form, getTransportList, transportList, saveTransportList, tabs, billDeliveryStore, deleteTab, commonStore, activeKey }) => {
  const [value, setValue] = useState('');
  const [pageObj, setPageObj] = useState({ current: 1, pageSize: 10 }); // 分页对象
  const [searchObj, setSearchObj] = useState({ time: [], receivingNo: undefined, plateNumber: undefined, transportNo: undefined, }); // 搜索对象
  const [filterVisible, setFilterVisible] = useState(false); // 是否显示筛选弹框
  const [updateObj, setUpdateObj] = useState({ updateVisible: false, record: null, projectId: null }); // 修改对象
  const [currentInfo, setCurrentInfo] = useState({}); // 当前详情信息
  // const deles = []; // 移除的运单集合
  const [deles, setDeles] = useState([]);
  const isLoading = loading.effects['billDeliveryStore/getTransportList'];
  const showType = location.query ? location.query.type : 'details';
  const tangibleBillId = location.query && location.query.tangibleBillId;
  const organizationType = location.state && location.state.organizationType;
  useEffect(() => {
    tangibleBillDetail(tangibleBillId).then((res) => {
      setCurrentInfo({ ...res });
    });
    getData();
    return () => {
      localStorage.removeItem('local_transportList');
      saveTransportList(billDeliveryStore, { items: [], count: 0, type: 3, errorMsg: [] });
    };
  }, [tangibleBillId]);
  useEffect(() => {
    searchData();
  }, [onSearch, searchObj]);

  useEffect(() => {
    searchData();
  }, [filterVisible]);

  const searchData = useCallback(() => {
    const oldList = getLocal('local_transportList') || null;
    let arr = cloneDeep( oldList || transportList.items);
    if (!isEmpty(searchObj) && searchObj.time && searchObj.time.length !== 0) {
      const [startDate, endDate] = searchObj.time;
      searchObj.receivingStartTime = startDate.startOf('day').valueOf();
      searchObj.receivingEndTime = endDate.endOf('day').valueOf();
    }
    Object.keys(searchObj).forEach((item) =>{
      if (item !== 'time' && item !== 'receivingEndTime') {
        if (searchObj[item]) {
          if (item === 'receivingStartTime' && searchObj.receivingEndTime) {
            arr = arr.filter(k => moment(k.receivingTime).valueOf() >  searchObj.receivingStartTime && moment(k.receivingTime).valueOf() < searchObj.receivingEndTime );
          } else if (item !== 'receivingStartTime') {
            arr = arr.filter(k => k[item] && k[item].includes(trim(searchObj[item])));
          }
        }
      }
    });
    saveTransportList(billDeliveryStore, { items: arr, count: arr.length, type: 3 });
  }, [onSearch, searchObj]);

  const getData =  useCallback(() => {
    getTransportList({
      limit: 10000,
      offset: 0,
      tangibleBillId,
    });
  }, [tangibleBillId]);

  const currentList = useMemo(() => {
    let newList = cloneDeep(transportList.items);
    if (deles.length) {
      newList = newList.filter(item => !deles.includes(item.transportId));
    }
    const list = newList.splice(pageObj.pageSize * ((pageObj.current || 1 )- 1), pageObj.pageSize);
    // 如果是最后一页
    if (!list.length && Math.ceil(transportList.items.length / pageObj.pageSize) === (pageObj.current - 1)) {
      setPageObj({ current: Math.ceil(transportList.items.length / pageObj.pageSize), pageSize: pageObj.pageSize });
    }
    return { items: list, count: transportList.items.length };
  }, [pageObj, transportList]);

  const onDelete = useCallback((transportNo, list, transportId) => () => {
    try {
      saveTransportList(billDeliveryStore, { deleObj: list.items.find(item => item.transportNo === transportNo), count: list.count - 1, type: 2 });
      message.destroy();
      setDeles([...deles, transportId]);
      message.success('移除成功');
    } catch (error) {
      console.log('json出错了');
    }
  }, []);

  const schemaTable = useMemo(() => {
    if (showType !== 'update') {
      return ({ ...schema });
    }

    return ({
      ...schema,
      operations: (record, _, list) => [{
        title: '修改',
        onClick: () => {
          setUpdateObj({ updateVisible: true, record, projectId: currentInfo.projectId });
        }
      },
      {
        title: '移除',
        onClick: ConfirmModal('亲，确认要移除该交接单？移除后不可恢复！', onDelete(record.transportNo, list, currentInfo.projectId)),
      }],
    });
  }, [transportList]);

  const onReviewd = useCallback((auditType) => () => {
    form.validateFields((_, values) => {
      auditOrSubmitTangibleBill(tangibleBillId, {
        auditType,             // 类型：1提交审核 2审核 3拒绝 | must
        auditContent: values.auditContent || '无', // 审核内容
      }).then(() => {
        // 清除当前缓存并关闭tab
        const dele = tabs.find(item => item.id === activeKey);
        deleteTab(commonStore, { id: dele.id });
        message.success('操作成功！');
        goBack();
      });
    });

  }, [value]);

  const onSave = () => {
    const oldList = localStorage.getItem('local_transportList') ? JSON.parse(localStorage.getItem('local_transportList')) : null;
    const m = Modal.confirm({
      title: (
        <div>
          <span style={{ fontWeight: '400' }}>该交票清单里共有{oldList && oldList.length}张运单，请确认已收到这些实体单据，</span>
          <span style={{ fontWeight: '700' }}>且系统里的签收单号、货品名称、实提量、实收量、 过磅数量、车牌号、签收时间、装车时间、卸货点都与实体单据一致</span>。
        </div>
      ),
      icon: (<Icon
        style={{ color: 'rgba(250,173,20,0.85)', marginRight: '15px' }}
        type='exclamation-circle'
        theme='filled'
      />),
      okText: '确认',
      cancelText: '取消',
      content: '若不一致，请核查原因或修改运单后再提交。',
      onOk() {
        // 清除当前缓存并关闭tab
        const dele = tabs.find(item => item.id === activeKey);
        deleteTab(commonStore, { id: dele.id });
        const oldList = localStorage.getItem('local_transportList') ? JSON.parse(localStorage.getItem('local_transportList')) : null;
        updateTangibleBills(tangibleBillId, { projectName: currentInfo.projectName, projectId: currentInfo.projectId, transportIdList: oldList.map(item => item.transportId) }).then(() => {
          goBack();
          message.success('保存成功！');
        }).finally(() => {
          m.destroy();
        });
      }
    });
  };
  const searchList = useMemo(() => ([
    {
      label: '车牌号',
      key: 'plateNumber',
      type: 'input',
      allowClear: true,
    },
    {
      label: '运单号',
      key: 'transportNo',
      type: 'input',
      allowClear: true,
    },
    {
      label: '签收单号',
      key: 'receivingNo',
      type: 'input',
      allowClear: true,
    },
    {
      label: '签收日期',
      key: 'time',
      type: 'time',
      allowClear: true,
    },
  ]), []);
  const onSearch = useCallback((val) => {
    setSearchObj({ ...val });
    setPageObj({ current: 1, pageSize: 10 });
  }, [searchObj]);
  const buttonList = useMemo(() => {
    let btnList = [
      {
        label: '查询',
        btnType: "primary",
        key: 'search',
        type: "search",
        onClick: onSearch,
      }];
    if (showType === 'update') {
      btnList = btnList.concat([{
        label: '添加运单',
        key: 'print',
        btnType: "primary",
        onClick: () => {
          if (transportList.count >= 300) {
            return ConfirmModal(`交票清单的运单最多可添加300条；当前不可添加`, () => {})();
          }
          setFilterVisible(true);
        },
      }]);
    }
    return btnList;
  }, []);
  const goBack = () => organizationType === 4 ? history.push('/buiness-center/billDelivery/billDeliveryHandover') : history.push('/buiness-center/billDelivery/billDelivery');
  const onChange = (val) => {
    const { current, pageSize } = val;
    setPageObj({ current, pageSize });
  };
  const renderExpandIcon = useCallback(({ onExpand, record }) => (<div onClick={e => onExpand(record, e)} className={styles.lookImg}>查看图片</div>), [currentList]);
  const refrash = (res, type) => {
    const { transportDeliveryUpdateRespList: transList = [], transportReceivingUpdateResp: receiving = null, transportReceivingPointResp = null, transportWeighUpdateResp = null } = res;
    const oldList = getLocal('local_transportList') || null;
    const data = oldList ? cloneDeep(oldList) : [];
    if (!(transList || receiving || transportReceivingPointResp || transportWeighUpdateResp)) return;
    switch (Number(type)) {
      case 1: // 提货 车辆 提货时间 货品名称 图片
        data.forEach(item => {
          if (item.transportNo === res.transportNo) {
            item.deliveryTime = transList &&  transList.some(i => i.deliveryTime) ? transList.map(item => moment(item.deliveryTime).format("YYYY-MM-DD HH:mm:ss")).join(',') : item.deliveryTime;
            item.carNo = transList && transList.some(i => i.carNo) ? transList.map(item => item.carNo).join(',') : item.carNo;
            item.goodsName = transList &&  transList.some(i => i.goodsName) ? transList.map(item => `${item.categoryName}-${item.goodsName}`).join(',') : item.goodsName;
            item.deliveryNum = transList &&  transList.some(i => i.deliveryNum) ? transList.map(item => item.deliveryNum).join(',') : item.deliveryNum;
            item.billNumber = transList &&  transList.some(i => i.deliveryNumber) ? transList.map(item => item.deliveryNumber).join(',') : item.billNumber;
            item.deliveryDentryid = transList && transList.some(i => i.deliveryDentryid) ? transList.reduce((r, n) => r.concat(n.deliveryDentryid.split(',')), []) : item.deliveryDentryid;
          }
        });
        break;
      case 2: // 签收 数量 时间 单号 图片
        data.forEach(item => {
          if (item.transportNo === res.transportNo) {
            item.receivingNo = receiving && receiving.receivingNumber ? receiving.receivingNumber : item.receivingNo;
            item.receivingTime = receiving && receiving.receivingTime ? moment(receiving.receivingTime).format("YYYY-MM-DD HH:mm:ss") : item.receivingTime;
            item.receivingDentryid = receiving && receiving.receivingDentryid ? receiving.receivingDentryid.split(',') : item.receivingDentryid;
            item.receivingNum = receiving && receiving.transportReceivingUpdateDetailReqs.some(i => i.receivingNum) ? receiving.transportReceivingUpdateDetailReqs.map(item => item.receivingNum).join(',') : item.receivingNum;
          }
        });
        break;
      case 3: // 卸货 卸货点
        data.forEach(item => {
          if (item.transportNo === res.transportNo) {
            item.receivingName = transportReceivingPointResp.receivingName ? transportReceivingPointResp.receivingName : item.receivingName;
          }
        });
        break;
      case 4: // 过磅 单号 数量 图片
        data.forEach(item => {
          if (item.transportNo === res.transportNo) {
            item.weighDentryid = transportWeighUpdateResp && transportWeighUpdateResp.weighDentryid ? transportWeighUpdateResp.weighDentryid.split(',') : item.weighDentryid;
            item.weighNumber = transportWeighUpdateResp && transportWeighUpdateResp.weighNumber ? transportWeighUpdateResp.weighNumber : item.weighNumber ;
            item.weighNum = transportWeighUpdateResp && transportWeighUpdateResp.transportWeighUpdateDetailReqs.some(i => i.weighNum) ? transportWeighUpdateResp.transportWeighUpdateDetailReqs.map(item => item.weighNum).join(',') : item.weighNum;
          }
        });
        break;
      default:
    }
    saveTransportList(billDeliveryStore, { items: data, type: 4 });
  };
  return (
    <div className={`${styles.detailsList} ${styles.addList}`}>
      <DetailINfo currentInfo={currentInfo} />
      <div className={styles.addListItem}><span>运单明细</span></div>
      <div className={styles.addListTable}>
        {transportList.errorMsg && transportList.errorMsg.length ? (
          <Alert
            message="系统提示"
            description={(
              <div>
                {transportList.errorMsg.map(item => (<p key={item}>{item}</p>))}
              </div>
            )}
            type="warning"
            showIcon
            closable
          />) : null}
        <Table
          rowKey="transportId"
          pagination={pageObj}
          onChange={onChange}
          schema={schemaTable}
          searchList={searchList}
          buttonList={buttonList}
          loading={isLoading}
          expandedRowRender={(row) => (
            <ExpandedRowRender
              deliveryDentryid={row.deliveryDentryid}
              receivingDentryid={row.receivingDentryid}
              weighDentryid={row.weighDentryid}
            />)}
          expandIcon={renderExpandIcon}
          dataSource={currentList}
        />
      </div>

      {/* 修改 */}
      {showType === 'update' && (
        <div className={styles.addListBtn}>
          <Button type="primary" onClick={onSave}>保存</Button>
          <Button onClick={goBack}>取消</Button>
        </div>
      )}

      {/* 详情 */}
      {showType === 'details' && (
        <>
          <div className={styles.addListItem}><span>操作日志</span></div>
          <div>
            <SchemaForm
              layout="vertical"
              schema={{
                eventItems: {
                  component: TangibleEvents,
                }
              }}
              mode={FORM_MODE.DETAIL}
              data={{ eventItems: currentInfo.tangEventRespList }}
            >
              <Item field="eventItems" />
            </SchemaForm>
          </div>
          <div className={styles.addListBtn}>
            <Button onClick={goBack}>取消</Button>
          </div>
        </>
      )}

      {/* 审核 */}
      {showType === 'reviewd' && (
        <>
          <Form>
            <Form.Item label='审核意见' style={{ width: 800, margin: '0 auto', display: 'flex' }}>
              {form.getFieldDecorator(`auditContent`)(<TextArea rows={6} style={{ width: 600, margin: '0 auto', display: 'flex' }} />)}
            </Form.Item>
          </Form>
          <div className={styles.addListBtn}>
            <Button type="primary" onClick={onReviewd(2)}>审核通过</Button>
            <Button className={styles.redBtn} onClick={onReviewd(3)}>审核拒绝</Button>
            <Button onClick={goBack}>取消</Button>
          </div>
        </>
      )}
      { filterVisible &&
      <FilterOrderModal
        value={value}
        setFilterVisible={setFilterVisible}
        filterVisible={filterVisible}
        setValue={setValue}
        projectId={currentInfo.projectId}
        pageType="detail"
        history={history}
        currentCount={transportList.count}
        projectName={currentInfo.projectName}
      /> }

      { updateObj.updateVisible && (
        <Modal
          visible={updateObj.updateVisible}
          title='修改'
          onCancel={() => setUpdateObj({ updateVisible: false, record: null, projectId: null })}
          width={900}
          footer={null}
        >
          <div style={{ color: 'grey' }}>说明：当多项信息同时修改时，请注意核查你的信息，提交后修改的信息将同步生效</div>
          <ModifyModal
            data={{ ...updateObj.record, projectId: currentInfo.projectId }}
            onCloseModal={() => setUpdateObj({ updateVisible: false, record: null, projectId: null  })}
            refrash={refrash}
            updateType="billDeliveryUpdate"
          />
        </Modal>
      )}
    </div>
  );
};
const mapDispatchToProps = (dispatch) => ({
  getTransportList: (data) => dispatch({ type: 'billDeliveryStore/getTransportList', payload: data }),
  saveTransportList: (store, payload) => dispatch({ type: 'billDeliveryStore/saveTransportList', store, payload }),
  deleteTab: (store, payload) => dispatch({ type: 'commonStore/deleteTab', store, payload }),
});

export default Form.create()(connect(({ billDeliveryStore, loading, commonStore }) => ({
  loading,
  ...billDeliveryStore,
  ...commonStore,
}), mapDispatchToProps)(Details));
