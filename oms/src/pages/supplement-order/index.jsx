import React, { Component } from 'react';
import { Row, Col, message, Button, Modal, notification, Icon } from 'antd';
import router from 'umi/router';
import moment from 'moment';
import { SchemaForm, Item, Observer, FORM_MODE } from '@gem-mine/antd-schema-form';
import DebounceFormButton from '../../components/debounce-form-button';
import Table from '../../components/table/table';
import { GOOD_UNIT_CN } from '../../constants/project/project';
import { requestDebounce, reverse, translatePageType, camelCase, getOssFile, routerToExportPagePromise } from '../../utils/utils';
import {
  getProject,
  getProjectDetail,
  postSupplementTransport,
  updateSupDetailList,
  patchSupplementTransportAsync,
  getOSSToken,
  detailBusinessType,
} from '../../services/apiService';
import UploadBox from '../../components/upload-box/upload-box';
import UploadFile from '../../components/upload/upload-file';
import excelImg from '../../assets/excel.png';
import imagePicture from '../../assets/image.png';
import style from './styles.less';
import '@gem-mine/antd-schema-form/lib/fields';

const [getProjectDetailDebounce, clear] = requestDebounce(getProjectDetail);

const formLayout = {
  labelCol: {
    xxl: 7,
    xl: 9,
  },
  wrapperCol: {
    xxl: 17,
    xl: 15,
  },
};

class SupplementOrder extends Component {

  constructor(props) {
    super(props);
    clear();
    this.schema = {
      projectId: {
        label: '项目名称',
        component: 'select',
        showSearch: true,
        optionFilterProp: 'label',
        style: {
          width: '200px',
        },
        placeholder: '请选择项目名称',
        rules: {
          required: [true, '请选择项目名称'],
        },
        options: async () => {
          const { items: data } = await getProject({
            isPassShipments: true,
            isAvailable: true,
            limit: 1000,
            offset: 0,
          });
          const items = data || [];
          const _items = items.filter(item => item.isCustomerAudit === 0);
          const result = _items.map(item => ({
            key: item.projectId,
            value: item.projectId,
            label: item.projectName,
          }));
          return result;
        },
      },
      receivingId: {
        label: '卸货点',
        component: 'select',
        showSearch: true,
        optionFilterProp: 'label',
        rules: {
          required: [true, '请选择卸货点'],
        },
        placeholder: '请选择卸货点',
        options: Observer({
          watch: 'projectId',
          action: async (projectId, { form }) => {
            let receiving;
            if (!projectId) {
              receiving = [];
            } else {
              const {
                configurationStatus,
                receivingItems,
                logisticsTradingSchemeEntity,
                logisticsBusinessTypeEntity,
                consignmentId,
                consignmentName,
                projectName,
                businessTypeId,
              } = await getProjectDetailDebounce(projectId);// await request(`/v1/projects/${formData.projectId}`)
              this.receivingItems = receivingItems;
              this.projectName = projectName;
              this.consignmentName = consignmentName;
              this._logisticsBusinessTypeEntity = logisticsBusinessTypeEntity;

              /*
              * billPictureType : 单据类型 1.自动生成提货单据,2.自动生成过磅单据,3.自动生成签收单据(多个逗号隔开)
              * billNumberType  : 单号类型 1.自动生成提货单号,2.自动生成过磅单号,3.自动生成签收单号(多个逗号隔开)
              * transportBill   : 单据信息： 1.提货单 2.过磅单 3.签收单 4.到站图片
              * */
              let { transportBill } = this._logisticsBusinessTypeEntity;
              let { billPictureType, billNumberType } = await detailBusinessType(businessTypeId);
              transportBill ? transportBill = transportBill.split(',') : transportBill = [];
              billPictureType ? billPictureType = billPictureType.split(',') : billPictureType = [];
              billNumberType ? billNumberType = billNumberType.split(',') : billNumberType = [];
              // 如果单据是自动生成的，补单明细中不能修改相应图片，所以这里要存一份billPictureType
              this.billPictureType = billPictureType;

              receiving = receivingItems;

              form.setFieldsValue({
                tradingSchemeName: configurationStatus === 3 ? logisticsTradingSchemeEntity?.tradingSchemeName || '无' : '无需配置',
                businessTypeName: logisticsBusinessTypeEntity?.businessTypeName || '无',
                consignmentId,
                consignmentName,
                receivingId: undefined,
                billMsg: { transportBill, billPictureType, billNumberType },
              });
            }
            return receiving.map(item => ({
              key: item.receivingId,
              value: item.receivingId,
              label: item.receivingName,
            }));
          },
        }),
      },
      consignmentId: {
        component: 'hide',
      },
      tradingSchemeName: {
        label: '交易方案',
        component: 'input.text',
      },
      businessTypeName: {
        label: '业务类型',
        component: 'input.text',
      },
      consignmentName: {
        label: '托运方',
        component: 'input.text',
      },
      // 单据信息
      billMsg: {
        label: '单据信息',
        component: ({ formData: { billMsg } }) => {
          if (billMsg) {
            const { transportBill, billPictureType, billNumberType } = billMsg;
            return (
              <div>
                {transportBill.find(item => item === '4') && <div>到站图片</div>}
                {transportBill.find(item => item === '1') &&
                <div>
                  <span>提货单</span>
                  {billPictureType.find(item => item === '1') && <span style={{ color: 'red' }}> 自动生成单据</span>}
                  {billNumberType.find(item => item === '1') && <span style={{ color: 'red' }}> 自动生成单号</span>}
                </div>}
                {transportBill.find(item => item === '2') &&
                <div>
                  <span>过磅单</span>
                  {billPictureType.find(item => item === '2') && <span style={{ color: 'red' }}> 自动生成单据</span>}
                  {billNumberType.find(item => item === '2') && <span style={{ color: 'red' }}> 自动生成单号</span>}
                </div>}
                {transportBill.find(item => item === '3') &&
                <div>
                  <span>签收单</span>
                  {billPictureType.find(item => item === '3') && <span style={{ color: 'red' }}> 自动生成单据</span>}
                  {billNumberType.find(item => item === '3') && <span style={{ color: 'red' }}> 自动生成单号</span>}
                </div>}
              </div>
            );
          }
          return <div>--</div>;
        },
      },
      contactName: {
        label: '卸货点联系人',
        component: 'input.text',
        value: Observer({
          watch: 'receivingId',
          action: (receivingId) => {
            const { contactName } = (this.receivingItems || []).find(item => item.receivingId === receivingId) || {};
            return contactName;
          },
        }),
      },
      contactPhone: {
        label: '卸货点联系电话',
        component: 'input.text',
        value: Observer({
          watch: 'receivingId',
          action: (receivingId) => {
            const { contactPhone } = (this.receivingItems || []).find(item => item.receivingId === receivingId) || {};
            return contactPhone;
          },
        }),
      },
      uploadPicture: {
        label: '上传图片',
        component: 'select',
        defaultValue: 1,
        options: [
          {
            key: 0,
            value: 0,
            label: '不上传',
          },
          {
            key: 1,
            value: 1,
            label: '上传',
          },
        ],
      },
    };
    this.allowClickSupplementBtn = true;

    this.state = {
      excelList: [],
      imageList: [],
      pageSize: 10,
      showRefresh: 0,
      nowPage: 1,
      dataSource: {
        items: [],
        count: 0,
      },
    };
  }

  upLoadOnchange = (dentryid, supplementDetailId, type) => {
    if (!dentryid || !dentryid?.length) return;
    const supplementDetailReqs = [{
      supplementDetailId,
      [type]: dentryid[0],
    }];
    updateSupDetailList({ supplementDetailReqs })
      .then(() => {
        const { dataSource: { items, count } } = this.state;
        const _items = items.map(item => {
          if (item.supplementDetailId === supplementDetailId) {
            return {
              ...item,
              [type]: dentryid[0],
            };
          }
          return item;
        });
        this.setState({
          dataSource: {
            items: _items,
            count,
          },
        });
      });
  };

  formatImageToTransport = (transports = []) => {
    const { imageList } = this.state;
    const imageKeyList = reverse(imageList.map(item => item._name));
    const { transportBill = '' } = this.logisticsBusinessTypeEntity || {};
    const _transports = transports.map(item => {
      const { deliveryNumber, weighNumber, receivingNumber } = item;
      const needPictures = transportBill.split(',');
      let deliveryDentryid;
      let weighDentryid;
      let receivingDentryid;
      let arriveDentryid;
      if (deliveryNumber) {
        // 列表内 _KEY_后的时间戳
        const key1 = imageKeyList.find(_item => _item.indexOf(deliveryNumber) > -1);
        const indexDelivery1 = (key1 || '').substring((key1 || '').lastIndexOf('_') + 1).split('.')[0] || 0;
        // item内 _KEY_后的时间戳
        const indexDelivery2 = (item.deliveryDentryid || '').substring((item.deliveryDentryid || '').lastIndexOf('_') + 1).split('.')[0] || 0;
        deliveryDentryid = indexDelivery1 < indexDelivery2 ? item.deliveryDentryid : key1;
      }
      if (weighNumber) {
        // 列表内 _KEY_后的时间戳
        const key2 = imageKeyList.find(_item => _item.indexOf(weighNumber) > -1);
        const indexWeigh1 = (key2 || '').substring((key2 || '').lastIndexOf('_') + 1).split('.')[0] || 0;
        // item内 _KEY_后的时间戳
        const indexWeigh2 = (item.weighDentryid || '').substring((item.weighDentryid || '').lastIndexOf('_') + 1).split('.')[0] || 0;
        weighDentryid = indexWeigh1 < indexWeigh2 ? item.weighDentryid : key2;
      }
      if (receivingNumber) {
        // 列表内 _KEY_后的时间戳
        const key3 = imageKeyList.find(_item => _item.indexOf(receivingNumber) > -1);
        const indexReceiving1 = (key3 || '').substring((key3 || '').lastIndexOf('_') + 1).split('.')[0] || 0;
        // item内 _KEY_后的时间戳
        const indexReceiving2 = (item.receivingDentryid || '').substring((item.receivingDentryid || '').lastIndexOf('_') + 1).split('.')[0] || 0;
        receivingDentryid = indexReceiving1 < indexReceiving2 ? item.receivingDentryid : key3;
        // 到站图片
        const arriveStr = receivingNumber.replace('QS', 'DZ');
        const key4 = imageKeyList.find(_item => _item.indexOf(arriveStr) > -1);
        const indexArrive1 = (key4 || '').substring((key4 || '').lastIndexOf('_') + 1).split('.')[0] || 0;
        const indexArrive2 = (item.arriveDentryid || '').substring((item.arriveDentryid || '').lastIndexOf('_') + 1).split('.')[0] || 0;
        arriveDentryid = indexArrive1 < indexArrive2 ? item.arriveDentryid : key4;
      }
      return {
        ...item,
        deliveryDentryid: needPictures.indexOf('1') > -1 ? deliveryDentryid : undefined,
        weighDentryid: needPictures.indexOf('2') > -1 ? weighDentryid : undefined,
        receivingDentryid: needPictures.indexOf('3') > -1 ? receivingDentryid : undefined,
        arriveDentryid: needPictures.indexOf('4') > -1 ? arriveDentryid : undefined,
      };
    });
    return _transports;
  };

  handleSaveBtnClick = value => {
    const { excelList, imageList, excelAddress } = this.state;
    const { projectId, receivingId, consignmentId, uploadPicture } = value;
    if (!excelList?.length) return message.error('请上传补单excel文件');
    Modal.confirm({
      title: '是否读取Excel？',
      content: '读取Excel将覆盖上次操作',
      okText: '确认',
      cancelText: '取消',
      onOk: () => {
        const excelDentryidList = excelList.map(item => item._name);
        this.logisticsBusinessTypeEntity = this._logisticsBusinessTypeEntity || {};
        const { receivingType, transportBill = '' } = this.logisticsBusinessTypeEntity;
        const imageField = uploadPicture ? [{
          title: '到站图片',
          dataIndex: 'arriveDentryid',
          width: 100,
          render: (text, record) => {
            const needPictures = transportBill.split(',');
            const check = needPictures.indexOf('4') > -1;
            if (!check) return '';
            return (
              <UploadFile
                renderMode='wordImg'
                saveIntoBusiness
                onChange={(dentryid) => this.upLoadOnchange(dentryid, record.supplementDetailId, 'arriveDentryid')}
                value={text}
                labelUpload='上传到站图片'
              />
            );
          },
          fixed: 'right',
        },
        {
          title: '提货图片',
          dataIndex: 'deliveryDentryid',
          width: 100,
          render: (text, record) => {
            const needPictures = transportBill.split(',');
            const check = needPictures.indexOf('1') > -1;
            if (!check) return '';

            return (this.billPictureType.find(item => item === '1') ?
              <Icon style={{ fontSize: '20px', color: 'rgb(31, 220, 74)' }} type='check-circle' theme='filled' /> :
              <UploadFile
                renderMode='wordImg'
                saveIntoBusiness
                onChange={(dentryid) => this.upLoadOnchange(dentryid, record.supplementDetailId, 'deliveryDentryid')}
                value={text}
                labelUpload='上传提货图片'
              />
            );
          },
          fixed: 'right',
        },
        {
          title: '过磅图片',
          dataIndex: 'weighDentryid',
          width: 100,
          render: (text, record) => {
            const needPictures = transportBill.split(',');
            const check = needPictures.indexOf('2') > -1;
            if (!check) return '';
            return (this.billPictureType.find(item => item === '2') ?
              <Icon style={{ fontSize: '20px', color: 'rgb(31, 220, 74)' }} type='check-circle' theme='filled' /> :
              <UploadFile
                renderMode='wordImg'
                saveIntoBusiness
                onChange={(dentryid) => this.upLoadOnchange(dentryid, record.supplementDetailId, 'weighDentryid')}
                value={text}
                labelUpload='上传过磅图片'
              />
            );
          },
          fixed: 'right',
        },
        {
          title: '签收图片',
          dataIndex: 'receivingDentryid',
          width: 100,
          render: (text, record) => {
            const needPictures = transportBill.split(',');
            const check = needPictures.indexOf('3') > -1;
            if (!check) return '';
            return (this.billPictureType.find(item => item === '3') ?
              <Icon style={{ fontSize: '20px', color: 'rgb(31, 220, 74)' }} type='check-circle' theme='filled' /> :
              <UploadFile
                renderMode='wordImg'
                saveIntoBusiness
                onChange={(dentryid) => this.upLoadOnchange(dentryid, record.supplementDetailId, 'receivingDentryid')}
                value={text}
                labelUpload='上传签收图片'
              />
            );
          },
          fixed: 'right',
        }] : [];
        this.tableSchema = {
          variable: true,
          minWidth: 4000,
          columns: [
            {
              title: '状态',
              dataIndex: 'supplementDetailStatus',
              width: 100,
              render: text => {
                const icon = {
                  0: '补单失败',
                  1: '补单成功',
                  2: <Icon
                    style={{ fontSize: '20px', color: 'rgb(31, 220, 74)' }}
                    type='check-circle'
                    theme='filled'
                  />,
                  3: <Icon style={{ fontSize: '20px', color: 'rgb(216, 30, 6)' }} type='close-circle' theme='filled' />,
                }[text];
                return icon;
              },
            },
            {
              title: '失败原因',
              dataIndex: 'supplementCorrelationEntities',
              width: 250,
              render: (text) => {
                if (!text) return '--';
                const list = text.map(item =>
                  <li
                    style={{ width: '250px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}
                    title={item.exceptionsDescription}
                  >{item.exceptionsDescription}
                  </li>);
                return (
                  <ul style={{ padding: 0, margin: 0 }}>
                    {list}
                  </ul>
                );
              },
            },
            {
              title: '项目',
              dataIndex: 'projectName',
              width: 200,
            },
            {
              title: '托运方',
              dataIndex: 'consignmentId',
              render: () => this.consignmentName || '',
            },
            {
              title: '承运方',
              dataIndex: 'shipmentName',
              render: (text, record) => {
                const { supplementCorrelationEntities } = record;
                let check = true;
                (supplementCorrelationEntities || []).forEach(item => {
                  const fieldName = camelCase(item.exceptionsField);
                  if (fieldName === 'shipmentName') {
                    check = false;
                  }
                });
                return <div style={{ color: check ? 'rgba(0,0,0,0.65)' : 'red' }}>{text}</div>;
              },
            },
            {
              title: '预约单号',
              dataIndex: 'prebookingNo',
            },
            {
              title: '司机',
              dataIndex: 'driverUserName',
              render: (text, record) => {
                const { supplementCorrelationEntities } = record;
                let check = true;
                (supplementCorrelationEntities || []).forEach(item => {
                  const fieldName = camelCase(item.exceptionsField);
                  if (fieldName === 'driverUserName') {
                    check = false;
                  }
                });
                return <div style={{ color: check ? 'rgba(0,0,0,0.65)' : 'red' }}>{text}</div>;
              },
            },
            {
              title: '司机联系电话',
              dataIndex: 'driverPhone',
              render: (text, record) => {
                const { supplementCorrelationEntities } = record;
                let check = true;
                (supplementCorrelationEntities || []).forEach(item => {
                  const fieldName = camelCase(item.exceptionsField);
                  if (fieldName === 'driverPhone') {
                    check = false;
                  }
                });
                return <div style={{ color: check ? 'rgba(0,0,0,0.65)' : 'red' }}>{text}</div>;
              },
            },
            {
              title: '车牌号',
              dataIndex: 'carNo',
              render: (text, record) => {
                const { supplementCorrelationEntities } = record;
                let check = true;
                (supplementCorrelationEntities || []).forEach(item => {
                  const fieldName = camelCase(item.exceptionsField);
                  if (fieldName === 'carNo') {
                    check = false;
                  }
                });
                return <div style={{ color: check ? 'rgba(0,0,0,0.65)' : 'red' }}>{text}</div>;
              },
            },
            {
              title: '提货点名称',
              dataIndex: 'deliveryName',
              render: (text, record) => {
                const { supplementCorrelationEntities } = record;
                let check = true;
                (supplementCorrelationEntities || []).forEach(item => {
                  const fieldName = camelCase(item.exceptionsField);
                  if (fieldName === 'deliveryName') {
                    check = false;
                  }
                });
                return <div style={{ color: check ? 'rgba(0,0,0,0.65)' : 'red' }}>{text || '--'}</div>;
              },
            },
            {
              title: '卸货点名称',
              dataIndex: 'receivingName',
              render: (text, record) => {
                const { supplementCorrelationEntities } = record;
                let check = true;
                (supplementCorrelationEntities || []).forEach(item => {
                  const fieldName = camelCase(item.exceptionsField);
                  if (fieldName === 'receivingName') {
                    check = false;
                  }
                });
                return <div style={{ color: check ? 'rgba(0,0,0,0.65)' : 'red' }}>{text || '--'}</div>;
              },
            },
            {
              title: '货品名称',
              dataIndex: 'goodsName',
              render: (text, record) => {
                const { supplementCorrelationEntities } = record;
                let check = true;
                (supplementCorrelationEntities || []).forEach(item => {
                  const fieldName = camelCase(item.exceptionsField);
                  if (fieldName === 'goodsName') {
                    check = false;
                  }
                });
                return <div
                  style={{ color: check ? 'rgba(0,0,0,0.65)' : 'red' }}
                >{`${record.categoryName}-${text}`}
                </div>;
              },
            },
            {
              title: '预约数量',
              dataIndex: 'goodsNum',
              render: text => text || '--',
            },
            {
              title: '提货数量',
              dataIndex: 'deliveryNum',
              render: text => text || '--',
            },
            {
              title: '卸货数量',
              dataIndex: 'receivingNum',
              render: text => text || '--',
            },
            {
              title: '数量单位',
              dataIndex: 'goodsUnit',
              render: text => GOOD_UNIT_CN[text] || '--',
            },
            {
              title: '发布时间',
              dataIndex: 'releaseTime',
              render: (text, record) => {
                const { supplementCorrelationEntities } = record;
                let check = true;
                (supplementCorrelationEntities || []).forEach(item => {
                  const fieldName = camelCase(item.exceptionsField);
                  if (fieldName === 'releaseTime') {
                    check = false;
                  }
                });
                return <div
                  style={{ color: check ? 'rgba(0,0,0,0.65)' : 'red' }}
                >{text ? moment(text).format('YYYY/MM/DD HH:mm:ss') : '--'}
                </div>;
              },
            },
            {
              title: '接单时间',
              dataIndex: 'receiptTime',
              render: (text, record) => {
                const { supplementCorrelationEntities } = record;
                let check = true;
                (supplementCorrelationEntities || []).forEach(item => {
                  const fieldName = camelCase(item.exceptionsField);
                  if (fieldName === 'receiptTime') {
                    check = false;
                  }
                });
                return <div
                  style={{ color: check ? 'rgba(0,0,0,0.65)' : 'red' }}
                >{text ? moment(text).format('YYYY/MM/DD HH:mm:ss') : '--'}
                </div>;
              },
            },
            {
              title: '执行任务时间',
              dataIndex: 'executeTime',
              render: (text, record) => {
                const { supplementCorrelationEntities } = record;
                let check = true;
                (supplementCorrelationEntities || []).forEach(item => {
                  const fieldName = camelCase(item.exceptionsField);
                  if (fieldName === 'executeTime') {
                    check = false;
                  }
                });
                return <div
                  style={{ color: check ? 'rgba(0,0,0,0.65)' : 'red' }}
                >{text ? moment(text).format('YYYY/MM/DD HH:mm:ss') : '--'}
                </div>;
              },
            },
            {
              title: '提货时间',
              dataIndex: 'deliveryTime',
              render: (text, record) => {
                const { supplementCorrelationEntities } = record;
                let check = true;
                (supplementCorrelationEntities || []).forEach(item => {
                  const fieldName = camelCase(item.exceptionsField);
                  if (fieldName === 'deliveryTime') {
                    check = false;
                  }
                });
                return <div
                  style={{ color: check ? 'rgba(0,0,0,0.65)' : 'red' }}
                >{text ? moment(text).format('YYYY/MM/DD HH:mm:ss') : '--'}
                </div>;
              },
            },
            {
              title: '到站时间',
              dataIndex: 'arriveTime',
              render: (text, record) => {
                const { supplementCorrelationEntities } = record;
                let check = true;
                (supplementCorrelationEntities || []).forEach(item => {
                  const fieldName = camelCase(item.exceptionsField);
                  if (fieldName === 'arriveTime') {
                    check = false;
                  }
                });
                return <div
                  style={{ color: check ? 'rgba(0,0,0,0.65)' : 'red' }}
                >{text ? moment(text).format('YYYY/MM/DD HH:mm:ss') : '--'}
                </div>;
              },
            },
            {
              title: '签收时间',
              dataIndex: 'receivingTime',
              render: (text, record) => {
                const { supplementCorrelationEntities } = record;
                let check = true;
                (supplementCorrelationEntities || []).forEach(item => {
                  const fieldName = camelCase(item.exceptionsField);
                  if (fieldName === 'receivingTime') {
                    check = false;
                  }
                });
                return <div
                  style={{ color: check ? 'rgba(0,0,0,0.65)' : 'red' }}
                >{text ? moment(text).format('YYYY/MM/DD HH:mm:ss') : '--'}
                </div>;
              },
            },
            {
              title: '提货单号',
              dataIndex: 'deliveryNumber',
              render: text => text || '--',
            },
            {
              title: '过磅单号',
              dataIndex: 'weighNumber',
              render: text => text || '--',
            },
            {
              title: '签收单号',
              dataIndex: 'receivingNumber',
              render: (text, record) => {
                const { supplementCorrelationEntities } = record;
                let check = true;
                (supplementCorrelationEntities || []).forEach(item => {
                  const fieldName = camelCase(item.exceptionsField);
                  if (fieldName === 'receivingNumber') {
                    check = false;
                  }
                });
                return <div style={{ color: check ? 'rgba(0,0,0,0.65)' : 'red' }}>{text || '--'}</div>;
              },
            },
            {
              title : '收货人',
              dataIndex : 'consignee',
              render : text => text || '--'
            },
            ...imageField,
          ],
          operations: [{
            title: '删除',
            confirmMessage: () => `确定删除吗？`,
            onClick: (record) => {
              const { supplementDetailId } = record;
              const supplementDetailReqs = [{ supplementDetailId, isEffect: 0 }];
              updateSupDetailList({ supplementDetailReqs })
                .then(() => {
                  const { dataSource: { items, count } } = this.state;
                  const _items = items.filter(item => item.supplementDetailId !== supplementDetailId);
                  this.setState({
                    dataSource: {
                      items: _items,
                      count: count - 1,
                    },
                  });
                });
            },
          }],
        };
        postSupplementTransport({
          excelDentryidList,
          projectId,
          receivingId: receivingType === 3 ? undefined : receivingId,
          consignmentId,
          uploadPicture,
        })
          .then(data => {
            const { supplementDetailEntities, supplementId } = data;
            let items = supplementDetailEntities;
            if (uploadPicture) {
              items = this.formatImageToTransport(supplementDetailEntities);
              this.modifyImage(items);
            }
            // 保存一份当前的excelAddress ， 提交补单上传的excel地址以最后一次读取excel为准
            this.setState({
              supplementId,
              showRefresh: uploadPicture,
              dataSource: {
                items,
                count: supplementDetailEntities?.length || 0,
              },
              excelAddressLast : excelAddress
            });
          });
      },
      onCancel() {
        console.log('Cancel');
      },
    });
  };

  onChange = (pagination) => {
    const { limit, current } = translatePageType(pagination);
    this.setState({
      nowPage: current,
      pageSize: limit,
    });
  };


  onExcelChange = ({ fileList }) => {
    const _fileList = fileList.map(item => item.originFileObj || item);
    this.setState({
      excelList: _fileList,
    });
  };

  onChangeAfterUploadToOss = (fileList) =>{
    this.setState({ excelAddress : fileList.map(item=>item._name).join(',') });
  }

  onImageChange = ({ fileList }) => {
    const _fileList = fileList.map(item => item.originFileObj || item);
    this.setState({
      imageList: _fileList,
    });
  };

  refreshTransport = () => {
    const { dataSource: { items } } = this.state;
    const transports = this.formatImageToTransport(items);
    this.setState({
      dataSource: {
        items: transports,
        count: transports?.length || 0,
      },
    });
  };

  modifyImage = items => {
    const supplementDetailReqs = items.map(item => ({
      supplementDetailId: item.supplementDetailId,
      arriveDentryid: item.arriveDentryid,
      deliveryDentryid: item.deliveryDentryid,
      weighDentryid: item.weighDentryid,
      receivingDentryid: item.receivingDentryid,
    }));
    return updateSupDetailList({ supplementDetailReqs });
  };

  handleSupplementTransport = () => {
    const { supplementId, showRefresh } = this.state;
    if (!supplementId) return message.error('请先读取excel');
    if (showRefresh) {
      const checkInfo = this.checkAllPicture();
      if (checkInfo.length) {
        const billConfig = {
          deliveryDentryid: '提货',
          weighDentryid: '过磅',
          receivingDentryid: '签收',
          arriveDentryid: '到站',
        };
        return message.error(`第${checkInfo[0].index + 1}条记录缺少${billConfig[checkInfo[0].errfields[0]]}图片`);
      }
    }

    this.setState({
      visible: true,
    });
  };

  submitData = (value) => {
    const { supplementId, showRefresh, dataSource : { items }, excelAddressLast : excelAddress } = this.state;

    for (let i = 0 ; i < items.length ; i ++){
      if (items[i].supplementDetailStatus === 3){
        return message.error(`第${i + 1}条记录校验失败，无法提交补单`);
      }
    }

    this.refreshTransport(value);
    if (this.allowClickSupplementBtn) {
      this.allowClickSupplementBtn = false;
      const params = { supplementId, uploadPicture: showRefresh, excelAddress };
      const routerParams = JSON.stringify({ activeKey : 1 });

      routerToExportPagePromise(patchSupplementTransportAsync, params, routerParams)
        .then(() => {
          notification.success({
            message: '补单成功',
            description: '提交补单成功',
          });
        })
        .catch(() => {
          this.allowClickSupplementBtn = true;
        });
    } else {
      notification.error({
        message: '请勿重复点击',
      });
    }

  };

  checkAllPicture = () => {
    const transportBill = this.logisticsBusinessTypeEntity?.transportBill || '';

    // this.billPictureType.find(item => item === '1')  无需提货
    // this.billPictureType.find(item => item === '2')  无需过磅
    // this.billPictureType.find(item => item === '3')  无需签收
    const { dataSource: { items } } = this.state;
    const billConfig = {
      1: 'deliveryDentryid',
      2: 'weighDentryid',
      3: 'receivingDentryid',
      4: 'arriveDentryid',
    };
    return items.reduce((errerArr, current, index) => {
      let needPictures = transportBill.split(',');
      needPictures = needPictures.filter(item => !(this.billPictureType.find(i => i === item)));
      const filedList = needPictures.map(item => billConfig[item]);

      let check = true;
      const errfields = [];
      filedList.forEach(field => {
        if (!current[field]) {
          check = false;
          errfields.push(field);
        }
      });
      if (check) return errerArr;
      return [...errerArr, { index, errfields }];
    }, []);
  };

  cancelModal = () => {
    this.setState({ visible: false });
  };

  toRecord = () => {
    router.push('./supplementOrder/bdRecord');
  };

  downLoadTemp = () => {
    getOSSToken()
      .then(accessInfo => {
        getOssFile(accessInfo, 'business/supplement/补单导入模板.xlsx');
      });
  };

  render() {
    const { dataSource, nowPage, pageSize, visible, supplementId, showRefresh } = this.state;
    return (
      <SchemaForm
        schema={this.schema}
        mode={FORM_MODE.ADD}
        {...formLayout}
        hideRequiredMark
      >
        <Row style={{ textAlign: 'right' }}>
          <Button onClick={this.downLoadTemp} style={{ marginRight: '15px' }}>下载补单模板</Button>
          <Button onClick={this.toRecord}>补单记录</Button>
        </Row>
        <Row>
          <span style={{ fontSize: '18px', fontWeight: 'bold' }}>补单</span>
          <span style={{ color: 'red', fontSize: '14px' }}>*请选择需要补单的项目信息，上传补单清单和单据图片</span>
        </Row>
        <Row style={{ minHeight: '150px' }}>
          <Col span={8}>
            <Item field='projectId' />
            <Item field='tradingSchemeName' />
            <Item field='businessTypeName' />
            <Item field='consignmentId' />
            <Item field='consignmentName' />
            <Item field='billMsg' />
          </Col>
          <Col span={8}>
            <Item field='receivingId' />
            <Item field='contactName' />
            <Item field='contactPhone' />
          </Col>
          <Col span={8}>
            <Item field='uploadPicture' />
          </Col>
        </Row>
        <Row>
          <Col span={12}>
            <UploadBox accept='.xls,.xlsx' onChange={this.onExcelChange} onChangeAfterUploadToOss={this.onChangeAfterUploadToOss} className={style.box_body}>
              <div style={{ width: '30%' }}>
                <img src={excelImg} alt='' height={60} />
                <div>点击或拖入文件</div>
              </div>
              <div style={{ width: '70%', textAlign: 'left', display: 'flex', alignItems: 'center' }}>
                <span style={{ lineHeight: '25px' }}>说明：补单时请按照表格要求填写相关信息</span>
              </div>
            </UploadBox>
          </Col>
          <Col span={12}>
            <UploadBox accept='image/*' onChange={this.onImageChange} className={style.box_body}>
              <div style={{ width: '30%' }}>
                <img src={imagePicture} alt='' height={60} />
                <div>点击或拖入文件</div>
              </div>
              <div style={{ width: '70%', textAlign: 'left', display: 'flex', flexDirection: 'column' }}>
                <p style={{ lineHeight: '25px' }}>说明：拖拽或批量选择单据图片上传</p>
                <p style={{ lineHeight: '25px' }}>单据图片的命名格式为：</p>
                <p style={{ lineHeight: '25px' }}>到站单：DZ+签收单号，如DZ2009261</p>
                <p style={{ lineHeight: '25px' }}>提货单：TH+提货单号，如TH0821604622</p>
                <p style={{ lineHeight: '25px' }}>过磅单：GB+过磅单号，如GB003825</p>
                <p style={{ lineHeight: '25px' }}>签收单：QS+签收单号，如QS2009261</p>
              </div>
            </UploadBox>
          </Col>
        </Row>
        <Row>
          {showRefresh ?
            <Button
              style={{ float: 'right', marginTop: '15px', marginLeft: '10px' }}
              onClick={this.refreshTransport}
            >更新图片
            </Button> : null}
          <DebounceFormButton
            style={{ float: 'right', marginTop: '15px' }}
            label='读取excel'
            onClick={this.handleSaveBtnClick}
            type='primary'
          />
        </Row>
        {supplementId &&
        <React.Fragment key={supplementId}>
          <Table
            rowKey='supplementDetailId'
            dataSource={dataSource}
            pagination={{ current: nowPage, pageSize }}
            schema={this.tableSchema}
            onChange={this.onChange}
          />
          <Modal
            visible={visible}
            maskClosable={false}
            title='提交补单'
            destroyOnClose
            onCancel={this.cancelModal}
            footer={null}
          >
            <div style={{ fontWeight: 'bold', fontSize: '18px' }}>补单项目</div>
            <div style={{ margin: '10px 0' }}>
              <span>{this.projectName}</span>
              <span style={{ float: 'right' }}>共{dataSource.items.length}条</span>
            </div>
            <hr />
            <div
              style={{ margin: '10px 0' }}
            >补单成功：{dataSource.items.filter(item => item.supplementDetailStatus === 2).length}条
            </div>
            <div
              style={{ margin: '10px 0' }}
            >校验失败：{dataSource.items.filter(item => item.supplementDetailStatus === 3).length}条
            </div>
            <div style={{ textAlign: 'right' }}>
              <Button style={{ marginRight: '15px' }} onClick={this.cancelModal}>取消</Button>
              <DebounceFormButton label='确定' type='primary' onClick={this.submitData} />
            </div>
          </Modal>
          <Row>
            <DebounceFormButton
              style={{ float: 'right', marginTop: '15px' }}
              label='提交补单'
              type='primary'
              onClick={this.handleSupplementTransport}
            />
          </Row>
        </React.Fragment>
        }
      </SchemaForm>
    );
  }
}

export default SupplementOrder;
