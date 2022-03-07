import React, { useState, useEffect, useCallback } from 'react';
import { Button, Row, Col, Form, Select, Radio, message } from 'antd';
import { connect } from 'dva';
import { getAllUser, getContract, postAudit, getProjectCorrelations } from '../../../services/apiService';
import { getLocal, isEmpty } from '../../../utils/utils';
import LogisticsInfo from './subPage/components/LogisticsInfo';
import AcceptanceEvent from './subPage/components/AcceptanceEvent';
import CarTable from './subPage/components/CarTable';
import styles from './Acceptance.less';


const Acceptance = ({ history, deleteTab, commonStore, tabs, activeKey, form, location }) => {
  const currentTab = tabs.find(item => item.id === activeKey);
  const localData = currentTab && getLocal(currentTab.id) || { formData: {} };
  const [options, setOptions] = useState([]);
  const [selectRowKeys, setSelectRowKeys] = useState([]);
  const [contractTypeOptions, setContractTypeOptions] = useState([]);
  const [projectTransferCreateReqList, setProjectTransferCreateReqList] = useState([]);
  const [eventList, setEventList] = useState([]);
  const isTransfer = !!form.getFieldValue('isTransfer');
  const contractType = form.getFieldValue('contractType');
  const projectId = location.query.pageKey;
  const bool = location.state && !!location.state.shipmentType;
  const { projectCorrelationId } = location.state;
  const { pageType, back } = location.state;

  useEffect(() => {
    getAllUser({ accountType: 3, isAvailable: true, limit: 1000, offset: 0 }).then(res => {
      setOptions(res.items);

    });
    if (pageType) {
      getProjectCorrelations(projectCorrelationId).then(res => {
        const { isTransfer, accountInitiateType, shipmentBillMode, isReceiverAudit, isShipmentAudit, contractType, contractId, dispatchUserId, projectAutomaticCreateReqList } = res;
        form.setFieldsValue({
          isTransfer,
          shipmentBillMode,
          isReceiverAudit,
          projectAutomaticCreateReqList,
          accountInitiateType,
          contractType: contractType !== null ? contractType.toString() : undefined,
          contractId: contractId !== null ? contractId.toString() : undefined,
          dispatchUserId: dispatchUserId && dispatchUserId.split(',')
        });

        setEventList(res.projectTransferEventEntities);
        setTimeout(() => {
          form.setFieldsValue({ isShipmentAudit });
        }, 1000);
        setProjectTransferCreateReqList(res.projectTransferEntities.map((item) => ({
          shipmentOrganizationName: item.shipmentOrganizationName,
          shipmentOrganizationId: item.shipmentOrganizationId,
          modifyPrice: item.shipmentFeeType === 1 ? item.modifyPriceRatio || 0 : item.modifyPrice,
          shipmentFeeType: item.shipmentFeeType,
          transferType: item.transferType,
          isAvailable: item.isAvailable,
        })));
        let num = 1;
        res.projectTransferEntities.forEach((item, index) => {
          if (item.isAvailable === 1) {
            num = index + 1;
          }
        });
        setSelectRowKeys([num]);
      });
    }
    if (localData && !isEmpty(localData.formData)) {
      /**
       * 接受合同、修改配置、查看配置都调用的这个组件，因此调用了同一份form表单，在标签切换时需要先进行表单清空再赋值。
       */
      form.resetFields();
      form.setFieldsValue(localData.formData );
      setProjectTransferCreateReqList(localData.projectTransferCreateReqList);
      setSelectRowKeys(localData.selectRowKeys);
    }
  }, [location]);
  useEffect(() => () => {
    // 页面销毁的时候自己 先移除原有的 再存储最新的
    localStorage.removeItem(currentTab.id);
    if (getLocal('local_commonStore_tabsObj').tabs.length > 1) {
      localStorage.setItem(currentTab.id, JSON.stringify({ formData: form.getFieldsValue(), projectTransferCreateReqList, selectRowKeys }));
    }
  }, [projectTransferCreateReqList, selectRowKeys]);
  useEffect(() => {
    if (contractType) {
      getContract({ limit: 1000, offset: 0, contractType, contractState: 2, isAvailable: true, simpleSelect: true }).then(res => {
        setContractTypeOptions(res.items);
      });
    }
    if (!pageType) {
      form.setFieldsValue({ accountInitiateType: accountInitiateTypeOption()[0].value });
    }
  }, [contractType]);
  useEffect(() => {
    if (!pageType) {
      form.setFieldsValue({ accountInitiateType: accountInitiateTypeOption()[0].value });
    }
  }, [isTransfer]);

  const onSave = useCallback(() => {
    form.validateFields((err, values) => {
      if (err) {
        return message.error('请把信息填写完整！');
      }
      if (isTransfer && !projectTransferCreateReqList.length) {
        return message.error('请添加物流分包配置！');
      }
      if (isTransfer && !selectRowKeys.length || selectRowKeys[0] === 'temp') {
        return message.error('请选择默认下级承运方！');
      }

      const projectAutomaticCreateReqList = values.projectAutomaticCreateReqList.map(car => ({
        carId: car.carId,
        carNo: car.carNo,
        driverUserId: car.driverUserId,
        driverUserName: car.driverUserName,
        driverPhone: car.driverPhone,
        device: car.device,
        providerName : car.providerName,
        projectAutomaticCorrelationCreateReqList: [
          {
            goodsId: car.goodsId,
            goodsName: car.goodsName,
            goodsNum: car.goodsNum
          }
        ],
      }));

      const arr = projectTransferCreateReqList.map((item, index) => {
        const { shipmentOrganizationId, transferType } = item;
        if (!bool) {
          return {
            shipmentOrganizationId: Number(shipmentOrganizationId),
            [Number(item.shipmentFeeType) === 1 ? 'modifyPriceRatio' : 'modifyPrice']: Number(item.modifyPrice),
            shipmentFeeType: Number(item.shipmentFeeType),
            transferType: Number(transferType),
            isAvailable: Number(index === selectRowKeys[0] - 1),
          };
        }
        return {
          shipmentOrganizationId: Number(shipmentOrganizationId),
          transferType: Number(transferType),
          isAvailable: Number(index === selectRowKeys[0] - 1),
        };
      });
      if (!pageType) {
        postAudit(projectId, { ...values, dispatchUserId: values.dispatchUserId.join(','), projectTransferCreateReqList: arr, contractType: Number(values.contractType), auditStatus: 1, projectAutomaticCreateReqList }).then(res => {
          deleteTab(commonStore, { id: currentTab.id });
          history.push('/buiness-center/project/projectManagement');
          message.success('配置成功');
        });
      } else {
        postAudit(projectId, { dispatchUserId: values.dispatchUserId.join(','), projectTransferCreateReqList: arr, auditStatus: 1, projectAutomaticCreateReqList }).then(res => {
          deleteTab(commonStore, { id: currentTab.id });
          history.push('/buiness-center/project/projectManagement');
          message.success('更新转单配置成功成功');
        });
      }
    });
  }, [projectTransferCreateReqList, selectRowKeys, isTransfer]);
  const setValue = useCallback((val) => {
    setProjectTransferCreateReqList(val);
  }, [projectTransferCreateReqList]);
  const accountInitiateTypeOption = () => {
    let data = [{ value: 5, title: '本级承运方代平台向托运方发起对账' }, { value: 4, title: '下级承运方代平台向托运方发起对账' }];
    if (bool) {
      if (contractType === '2') {
        data = [{ value: 2, title: '承运方向平台发起对账' }];
      } else {
        data = [{ value: 1, title: '承运方向托运方发起对账' }];
      }
    } else if (!isTransfer) {
      data = [{ value: 5, title: '承运方代平台向托运方发起对账' }, { value: 3, title: '托运方向平台发起对账' }];
    }
    return data;
  };
  return (
    <div className={styles.acceptance}>
      <Form>
        <Form.Item label="是否转单">
          {form.getFieldDecorator(`isTransfer`, {
            initialValue: 0,
            rules: [{
              required: true,
              message: "请选择是否转单！"
            }],
          })(
            <Radio.Group disabled={pageType}>
              <Radio value={1}>是</Radio>
              <Radio value={0}>否</Radio>
            </Radio.Group>
          )}
        </Form.Item>
        <div className={styles.addListItem}><span>关联运输合同</span></div>
        <Row>
          <Col span={8} style={{ paddingRight: '15px' }}>
            <Form.Item label="合同类型">
              {form.getFieldDecorator(`contractType`, {
                rules: [{
                  required: true,
                  message: "请选择合同类型！"
                }],
              })(
                bool ? (
                  <Select placeholder='请选择合同类型' disabled={pageType}>
                    <Select.Option key='0'>
                      承运合同
                    </Select.Option>
                    <Select.Option key='1'>
                      调度合同
                    </Select.Option>
                    <Select.Option key='2'>
                      网络货运合同
                    </Select.Option>
                  </Select>
                ) : (
                  <Select placeholder='请选择合同类型' disabled={pageType}>
                    <Select.Option key='2'>
                      网络货运合同
                    </Select.Option>
                  </Select>
                ))}
            </Form.Item>
          </Col>
          <Col span={8}>
            <Form.Item label="合同名称">
              {form.getFieldDecorator(`contractId`, {
                rules: [{
                  required: true,
                  message: "请选择合同名称！"
                }],
              })(
                <Select placeholder='请选择合同名称' disabled={pageType}>
                  {
                    contractTypeOptions.map(item => (
                      <Select.Option key={`${item.contractId}`}>
                        {item.contractName}
                      </Select.Option>
                    ))
                  }
                </Select>
              )}
            </Form.Item>
          </Col>
        </Row>
        <div className={styles.addListItem}><span>指派调度</span></div>
        <Row>
          <Col span={8} style={{ paddingRight: '15px' }}>
            <Form.Item label="调度人员">
              {form.getFieldDecorator(`dispatchUserId`, {
                rules: [{
                  required: true,
                  message: "请选择调度人员！"
                }],
              })(
                <Select mode='multiple' placeholder='请选择调度人员' style={{ width: '90%' }} disabled={pageType === 'look'}>
                  {
                    options.map(item => (
                      <Select.Option key={item.userId.toString()}>{item.nickName}</Select.Option>
                    ))
                  }
                </Select>

              )}
            </Form.Item>
          </Col>
        </Row>
        <Form.Item label='指定车辆'>
          {
            form.getFieldDecorator('projectAutomaticCreateReqList', {
            })(<CarTable pageType={pageType} projectId={projectId} />)
          }
        </Form.Item>

        <div className={styles.addListItem}><span>开票配置</span></div>
        <Row>
          <Col span={8} style={{ paddingRight: '15px' }}>
            <Form.Item label="开票方式">
              {form.getFieldDecorator(`shipmentBillMode`, {
                rules: [{
                  required: true,
                  message: "请选择开票方式！"
                }],
              })(
                <Select placeholder='请选择开票方式' style={{ width: '90%' }} disabled={pageType}>
                  {
                    [
                      {
                        key: 0,
                        title: '平台向货主开票',
                        value: 0,
                        label: '平台向货主开票'
                      }, {
                        key: 1,
                        title: '承运方提供进项发票给平台，再由平台向货主开票',
                        value: 1,
                        label: '承运方提供进项发票给平台，再由平台向货主开票'
                      }, {
                        key: 2,
                        title: '承运方提供发票给货主',
                        value: 2,
                        label: '承运方提供发票给货主'
                      }]
                      .map(item => (
                        <Select.Option key={item.key} value={item.key}>{item.label}</Select.Option>
                      ))
                  }
                </Select>

              )}
            </Form.Item>
          </Col>
        </Row>
        {
          isTransfer ? (
            <>
              <div className={styles.addListItem}><span>物流分包配置</span></div>
              <LogisticsInfo projectTransferCreateReqList={projectTransferCreateReqList} setValue={setValue} setSelectRowKeys={setSelectRowKeys} selectRowKeys={selectRowKeys} bool={bool} readOnly={pageType === 'look'} />
            </>
          ) : null
        }
        <div className={styles.addListItem}><span>对账配置</span></div>
        <Row>
          <Col span={8} style={{ paddingRight: '15px' }}>
            <Form.Item label="单选对账发起方式">
              {form.getFieldDecorator(`accountInitiateType`, {
                initialValue: accountInitiateTypeOption().length === 1 ? accountInitiateTypeOption()[0].value : undefined,
                rules: [{
                  required: true,
                  message: "请选择对账发起方式！"
                }],
              })(
                <Radio.Group disabled={pageType}>
                  {
                    accountInitiateTypeOption().map(item => (
                      <Radio key={item.value} value={item.value}>{item.title}</Radio>
                    ))
                  }
                </Radio.Group>
              )}
            </Form.Item>
          </Col>
          <Col span={8}>
            <Form.Item label="对账接收方是否审核">
              {form.getFieldDecorator(`isReceiverAudit`, {
                rules: [{
                  required: true,
                  message: "请选择对账接收方是否审核！"
                }],
              })(
                <Radio.Group disabled={pageType}>
                  <Radio value={1}>是</Radio>
                  <Radio value={0}>否</Radio>
                </Radio.Group>
              )}
            </Form.Item>
          </Col>
          {!bool && isTransfer ? (
            <Col span={8}>
              <Form.Item label="本级承运方是否审核">
                {form.getFieldDecorator(`isShipmentAudit`, {
                  rules: [{
                    required: true,
                    message: "请选择本级承运方是否审核！"
                  }],
                })(
                  <Radio.Group disabled={pageType}>
                    <Radio value={1}>是</Radio>
                    <Radio value={0}>否</Radio>
                  </Radio.Group>
                )}
              </Form.Item>
            </Col>
          ) : null}
        </Row>

        <div className={styles.addListItem}><span>配置事件</span></div>
        <AcceptanceEvent eventList={eventList} />
      </Form>
      <div style={{ textAlign: 'center' }}>
        {
          pageType === 'look' ? null : (
            <Button
              type="primary"
              onClick={onSave}
              style={{ marginRight: '15px' }}
            >
              保存
            </Button>
          )
        }
        <Button
          onClick={() => {
            if (back) {
              history.push(`/buiness-center/project/projectManagement/projectDetail?projectId=${back}`);
            } else {
              history.push('/buiness-center/project/projectManagement');
            }
            deleteTab(commonStore, { id: currentTab.id });
          }}
        >
          返回
        </Button>

      </div>
    </div>
  );
};

const mapDispatchToProps = (dispatch) => ({
  deleteTab: (store, payload) => dispatch({ type: 'commonStore/deleteTab', store, payload }),
});
export default connect(({ commonStore }) => ({
  ...commonStore,
}), mapDispatchToProps)(Form.create()(Acceptance));
