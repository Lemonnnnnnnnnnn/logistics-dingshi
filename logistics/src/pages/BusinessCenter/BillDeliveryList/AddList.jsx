import React, { useState, useMemo, useCallback, useEffect } from 'react';
import { connect } from 'dva';
import { Input, Button, Alert, Modal, Icon, message } from 'antd';
import { schema } from '@/constants/billDelivery';
import { uniqBy, trim } from '@/utils/utils';
import { putTangibleBills } from '@/services/billDeliveryService';
import Table from '../../../components/Table/Table';
import ModifyModal from '../Transport/component/ModifyModal';
import FilterOrderModal from './components/FilterOrderModal';
import ConfirmModal from '../../../components/Common/ConfirmModal';
import ExpandedRowRender from './components/ExpandedRowRender';
import styles from './AddList.less';

const { TextArea } = Input;


const Add = ({ history, loading, location, getByTransportNo, transportItems = [], errorMsg, saveByTransportNo, billDeliveryStore, commonStore, tabs, activeKey, deleteTab }) => {
  const [transportNos, setTransportNos] = useState('');
  const [updateObj, setUpdateObj] = useState({ updateVisible: false, tangibleBillId: '' });
  const [filterVisible, setFilterVisible] = useState(false);
  const projectId = location.state && location.state.projectId;
  const projectName = location.state && location.state.projectName;
  const isLoading = loading.effects['billDeliveryStore/getByTransportNo'];

  const onDelete = useCallback((transportNo, list) => () => {
    saveByTransportNo(billDeliveryStore, { items: list.items.filter(item => item.transportNo !== transportNo),  errorMsg, clear: true });
    message.destroy();
    message.success('移除成功');
  }, []);

  useEffect(() => () => saveByTransportNo(billDeliveryStore, { items: [], errorMsg: [], clear: true }), []);

  const schemaTable  = useMemo(() => ({
    ...schema,
    operations: (record, _, list) => [{
      title: '修改',
      onClick: () => {
        record.projectId = projectId;
        setUpdateObj({ updateVisible: true, record });
      },
    },
    {
      title: '移除',
      onClick: ConfirmModal('亲，确认要移除该交接单？移除后不可恢复！', onDelete(record.transportNo, list)),
    }],
  }), []);

  const handerChange = useCallback((e) => {
    setTransportNos(e.target.value);
  }, [transportNos]);

  const addOrder = useCallback(() => {
    if (!trim(transportNos)) {
      message.destroy();
      return message.info('请复制或者输入单号！');
    }
    if (uniqBy(trim(transportNos).split(/\s+/).join(',')).length > 99) {
      message.destroy();
      return message.info('一次性最多允许拷贝100条');
    }
    const data = transportItems && transportItems.length ?
      uniqBy(trim(transportNos).split(/\s+/)).filter(item => !(transportItems.map(k => k.transportNo).includes(item)))
      :
      uniqBy(trim(transportNos).split(/\s+/));

    if (!data.length) {
      return message.info('请勿输入已添加的运单号');
    }
    getByTransportNo({ projectId, transportNos: data.join(',') }) ;
  }, [transportNos, transportItems]);

  const onSave = () => {
    if (!(transportItems && transportItems.length)) {
      message.destroy();
      return message.info('请添加需要保存的数据！');
    }
    const m = Modal.confirm({
      title: (
        <div>
          <span style={{ fontWeight: '400' }}>该交票清单里共有{transportItems.length}张运单，请确认已收到这些实体单据，</span>
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
        putTangibleBills({ projectName, projectId, transportIdList: transportItems.map(item => item.transportId) }).then(() => {
          history.push('/buiness-center/billDelivery/billDelivery');
          message.success('保存成功！');
          const dele = tabs.find(item => item.id === activeKey);
          deleteTab(commonStore, { id: dele.id });
        }).finally(() => {
          m.destroy();
        });
      }
    });
  };
  const getData = useCallback(() => {
    getByTransportNo({ projectId, transportNos: transportItems.map(item => item.transportNo).join(',') });
  }, [transportItems]);
  const renderExpandIcon = useCallback(({ onExpand, record }) => (<div onClick={e => onExpand(record, e)} className={styles.lookImg}>查看图片</div>), [transportItems]);
  return (
    <div className={styles.addList}>
      <div className={styles.addListItem}><span>项目名称：</span>{projectName}</div>
      <div className={styles.addListItem}>
        <span>运单号：</span>
        <div className={styles.addListTextArea}>
          <TextArea value={transportNos} onChange={handerChange} rows={6} />
          <p>（注：可从EXCEL拷贝运单号至文本框，一个单号一行，或者用空格隔开）</p>
        </div>
        <Button type="primary" onClick={addOrder}>添加运单</Button>
        <Button onClick={() => setFilterVisible(true)}>筛选添加</Button>
      </div>
      {errorMsg && errorMsg.length ? (
        <Alert
          message="系统提示"
          description={(
            <div>
              {errorMsg.map(item => (<p key={item}>{item}</p>))}
            </div>
          )}
          type="warning"
          showIcon
          closable
        />) : null}
      <div className={styles.addListTable}>
        <Table
          rowKey="transportId"
          dataSource={{ items: transportItems }}
          schema={schemaTable}
          loading={isLoading}
          expandedRowRender={(row) => (
            <ExpandedRowRender
              receivingDentryid={row.receivingDentryid}
              weighDentryid={row.weighDentryid}
              deliveryDentryid={row.deliveryDentryid}
            />
          )}
          expandIcon={renderExpandIcon}
        />
      </div>
      <div className={styles.addListBtn}>
        <Button type="primary" onClick={onSave}>保存</Button>
        <Button onClick={() => history.push('/buiness-center/billDelivery/billDelivery')}>取消</Button>
      </div>
      {filterVisible &&
        <FilterOrderModal
          setFilterVisible={setFilterVisible}
          filterVisible={filterVisible}
          projectId={projectId}
          getByTransportNo={getByTransportNo}
        />}
      { updateObj.updateVisible && (
        <Modal
          visible={updateObj.updateVisible}
          title='修改'
          onCancel={() => setUpdateObj({ updateVisible: false, record: null })}
          width={900}
          footer={null}
        >
          <div style={{ color: 'grey' }}>说明：当多项信息同时修改时，请注意核查你的信息，提交后修改的信息将同步生效</div>
          <ModifyModal
            data={updateObj.record}
            onCloseModal={() => setUpdateObj({ updateVisible: false, record: null })}
            refrash={() => {
              saveByTransportNo(billDeliveryStore, { items: [], errorMsg: [], clear: true });
              getData();
            }}
            updateType="billDeliveryUpdate"
          />
        </Modal>
      )}
    </div>
  );
};

const mapDispatchToProps = (dispatch) => ({
  getByTransportNo: (payload) => dispatch({ type: 'billDeliveryStore/getByTransportNo', payload }),
  saveByTransportNo: (store, payload) => dispatch({ type: 'billDeliveryStore/saveByTransportNo', store,  payload }),
  deleteTab: (store, payload) => dispatch({ type: 'commonStore/deleteTab', store, payload }),
});

export default connect(({ billDeliveryStore, loading, commonStore }) => ({
  loading,
  ...billDeliveryStore,
  commonStore,
  ...commonStore,
}), mapDispatchToProps)(Add);
