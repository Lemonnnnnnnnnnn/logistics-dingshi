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
       * ?????????????????????????????????????????????????????????????????????????????????????????????form??????????????????????????????????????????????????????????????????
       */
      form.resetFields();
      form.setFieldsValue(localData.formData );
      setProjectTransferCreateReqList(localData.projectTransferCreateReqList);
      setSelectRowKeys(localData.selectRowKeys);
    }
  }, [location]);
  useEffect(() => () => {
    // ??????????????????????????? ?????????????????? ??????????????????
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
        return message.error('???????????????????????????');
      }
      if (isTransfer && !projectTransferCreateReqList.length) {
        return message.error('??????????????????????????????');
      }
      if (isTransfer && !selectRowKeys.length || selectRowKeys[0] === 'temp') {
        return message.error('?????????????????????????????????');
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
          message.success('????????????');
        });
      } else {
        postAudit(projectId, { dispatchUserId: values.dispatchUserId.join(','), projectTransferCreateReqList: arr, auditStatus: 1, projectAutomaticCreateReqList }).then(res => {
          deleteTab(commonStore, { id: currentTab.id });
          history.push('/buiness-center/project/projectManagement');
          message.success('??????????????????????????????');
        });
      }
    });
  }, [projectTransferCreateReqList, selectRowKeys, isTransfer]);
  const setValue = useCallback((val) => {
    setProjectTransferCreateReqList(val);
  }, [projectTransferCreateReqList]);
  const accountInitiateTypeOption = () => {
    let data = [{ value: 5, title: '????????????????????????????????????????????????' }, { value: 4, title: '????????????????????????????????????????????????' }];
    if (bool) {
      if (contractType === '2') {
        data = [{ value: 2, title: '??????????????????????????????' }];
      } else {
        data = [{ value: 1, title: '?????????????????????????????????' }];
      }
    } else if (!isTransfer) {
      data = [{ value: 5, title: '??????????????????????????????????????????' }, { value: 3, title: '??????????????????????????????' }];
    }
    return data;
  };
  return (
    <div className={styles.acceptance}>
      <Form>
        <Form.Item label="????????????">
          {form.getFieldDecorator(`isTransfer`, {
            initialValue: 0,
            rules: [{
              required: true,
              message: "????????????????????????"
            }],
          })(
            <Radio.Group disabled={pageType}>
              <Radio value={1}>???</Radio>
              <Radio value={0}>???</Radio>
            </Radio.Group>
          )}
        </Form.Item>
        <div className={styles.addListItem}><span>??????????????????</span></div>
        <Row>
          <Col span={8} style={{ paddingRight: '15px' }}>
            <Form.Item label="????????????">
              {form.getFieldDecorator(`contractType`, {
                rules: [{
                  required: true,
                  message: "????????????????????????"
                }],
              })(
                bool ? (
                  <Select placeholder='?????????????????????' disabled={pageType}>
                    <Select.Option key='0'>
                      ????????????
                    </Select.Option>
                    <Select.Option key='1'>
                      ????????????
                    </Select.Option>
                    <Select.Option key='2'>
                      ??????????????????
                    </Select.Option>
                  </Select>
                ) : (
                  <Select placeholder='?????????????????????' disabled={pageType}>
                    <Select.Option key='2'>
                      ??????????????????
                    </Select.Option>
                  </Select>
                ))}
            </Form.Item>
          </Col>
          <Col span={8}>
            <Form.Item label="????????????">
              {form.getFieldDecorator(`contractId`, {
                rules: [{
                  required: true,
                  message: "????????????????????????"
                }],
              })(
                <Select placeholder='?????????????????????' disabled={pageType}>
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
        <div className={styles.addListItem}><span>????????????</span></div>
        <Row>
          <Col span={8} style={{ paddingRight: '15px' }}>
            <Form.Item label="????????????">
              {form.getFieldDecorator(`dispatchUserId`, {
                rules: [{
                  required: true,
                  message: "????????????????????????"
                }],
              })(
                <Select mode='multiple' placeholder='?????????????????????' style={{ width: '90%' }} disabled={pageType === 'look'}>
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
        <Form.Item label='????????????'>
          {
            form.getFieldDecorator('projectAutomaticCreateReqList', {
            })(<CarTable pageType={pageType} projectId={projectId} />)
          }
        </Form.Item>

        <div className={styles.addListItem}><span>????????????</span></div>
        <Row>
          <Col span={8} style={{ paddingRight: '15px' }}>
            <Form.Item label="????????????">
              {form.getFieldDecorator(`shipmentBillMode`, {
                rules: [{
                  required: true,
                  message: "????????????????????????"
                }],
              })(
                <Select placeholder='?????????????????????' style={{ width: '90%' }} disabled={pageType}>
                  {
                    [
                      {
                        key: 0,
                        title: '?????????????????????',
                        value: 0,
                        label: '?????????????????????'
                      }, {
                        key: 1,
                        title: '??????????????????????????????????????????????????????????????????',
                        value: 1,
                        label: '??????????????????????????????????????????????????????????????????'
                      }, {
                        key: 2,
                        title: '??????????????????????????????',
                        value: 2,
                        label: '??????????????????????????????'
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
              <div className={styles.addListItem}><span>??????????????????</span></div>
              <LogisticsInfo projectTransferCreateReqList={projectTransferCreateReqList} setValue={setValue} setSelectRowKeys={setSelectRowKeys} selectRowKeys={selectRowKeys} bool={bool} readOnly={pageType === 'look'} />
            </>
          ) : null
        }
        <div className={styles.addListItem}><span>????????????</span></div>
        <Row>
          <Col span={8} style={{ paddingRight: '15px' }}>
            <Form.Item label="????????????????????????">
              {form.getFieldDecorator(`accountInitiateType`, {
                initialValue: accountInitiateTypeOption().length === 1 ? accountInitiateTypeOption()[0].value : undefined,
                rules: [{
                  required: true,
                  message: "??????????????????????????????"
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
            <Form.Item label="???????????????????????????">
              {form.getFieldDecorator(`isReceiverAudit`, {
                rules: [{
                  required: true,
                  message: "???????????????????????????????????????"
                }],
              })(
                <Radio.Group disabled={pageType}>
                  <Radio value={1}>???</Radio>
                  <Radio value={0}>???</Radio>
                </Radio.Group>
              )}
            </Form.Item>
          </Col>
          {!bool && isTransfer ? (
            <Col span={8}>
              <Form.Item label="???????????????????????????">
                {form.getFieldDecorator(`isShipmentAudit`, {
                  rules: [{
                    required: true,
                    message: "???????????????????????????????????????"
                  }],
                })(
                  <Radio.Group disabled={pageType}>
                    <Radio value={1}>???</Radio>
                    <Radio value={0}>???</Radio>
                  </Radio.Group>
                )}
              </Form.Item>
            </Col>
          ) : null}
        </Row>

        <div className={styles.addListItem}><span>????????????</span></div>
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
              ??????
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
          ??????
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
