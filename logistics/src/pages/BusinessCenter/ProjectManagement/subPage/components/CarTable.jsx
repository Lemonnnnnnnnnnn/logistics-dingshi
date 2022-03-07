import React, { useState, useEffect } from 'react';
import { Select, Input, Button, Row, Icon, message, Modal } from 'antd';
import EditableTable from '@/components/EditableTable/EditableTable';
import UploadBox from '@/components/UploadBox/UploadBox';
import { getOSSToken, getProjectAutomaticReadExcel, getAllDriver, getProjectGoods, getServiceCars } from '@/services/apiService';
import { getOssFile, unionBy } from '@/utils/utils';
import styles from './CarTable.less';

const CarTable = ({
  pageType,
  value,
  onChange,
  projectId,
}) => {
  const readOnly = pageType === 'look';
  const [fileList, setFileList] = useState([]);
  const [dataList, setDataList] = useState([]);
  const [carList, setCarList] = useState([]);
  const [carMap, setCarMap] = useState(new Map());
  const [goodsList, setGoodsList] = useState([]);
  const [driverList, setDriverList] = useState([]);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    setDataList(value || []);
  }, [value]);

  useEffect(() => {
    const carParams = {
      limit: 100000,
      offset: 0,
      belongingToSystem: true,
    };
    const driverParams = {
      limit: 10000, offset: 0, selectType: 2, isAll: true
    };

    Promise.all([getServiceCars(carParams), getAllDriver(driverParams), getProjectGoods(projectId)]).then(([cars, drivers, goods]) => {

      /**
       * cars结构：
       * carId不唯一，数据按设备产家作为唯一值
       * 如：[{carId :123, providerName : '星软' },{carId :123, providerName : '网阔'}]
       */
      const newCarMap = new Map();
      cars.items.forEach(item => {
        if (!newCarMap.has(item.carId)) {
          const providerNameList = new Set();
          providerNameList.add(item.providerName);
          newCarMap.set(item.carId, providerNameList);
        } else {
          const providerNameList = newCarMap.get(item.carId);
          providerNameList.add(item.providerName);
        }
      });
      setCarMap(newCarMap);

      setCarList(unionBy(cars.items, 'carId'));
      setDriverList(drivers.items);
      setGoodsList(goods);
      setReady(true);
    });
  }, []);

  const saveCarTable = (value) => {
    if (dataList.find(data => data.carId === value.carId)) {
      message.error('请勿添加重复的车牌号');
      return Promise.reject(new Error('请勿添加重复的车牌号'));
    }
    return Promise.resolve({ ...value });
  };


  const carEditRender = (record, form) => {
    function handleSelectChange(value) {
      const { carNo, soid } = carList.find(car => car.carId === value);

      form.setFieldsValue({
        carNo,
        device: soid
      });
    }

    return (
      <div>
        {
          form.getFieldDecorator('carId', {
            rules: [{ required: true, message: '请选择车牌号' }]
          })(
            <Select showSearch optionFilterProp="children" onChange={handleSelectChange} placeholder='请选择车牌号'>
              {
                carList.map(item => <Select.Option key={item.carId} value={item.carId}>{item.carNo}</Select.Option>)
              }
            </Select>
          )
        }
        {
          form.getFieldDecorator('carNo', { rules: [{ reuqired: true, message: '请选择车牌号' }] })
        }
      </div>
    );
  };

  const driverEditRender = (record, form) => {
    function handleSelectChange(value) {
      const { nickName, phone } = driverList.find(driver => driver.userId === value);
      form.setFieldsValue({
        driverUserName: nickName,
        driverPhone: phone
      });
    }

    return (
      <div>
        {
          form.getFieldDecorator('driverUserId', {
            rules: [{ required: true, message: '请选择司机' }]
          })(
            <Select showSearch optionFilterProp="children" onChange={handleSelectChange} placeholder='请选择司机'>
              {
                driverList.map(item => <Select.Option key={item.userId} value={item.userId}>{item.nickName}</Select.Option>)
              }
            </Select>
          )
        }
        {
          form.getFieldDecorator('driverUserName', { rules: [{ reuqired: true, message: '请选择司机' }] })
        }
      </div>
    );
  };

  const goodsEditRender = (record, form) => {
    function handleSelectChange(value) {
      const { goodsName, categoryName, goodsUnitStr } = goodsList.find(goods => goods.goodsId === value);
      form.setFieldsValue({
        goodsName: `${categoryName}-${goodsName}`,
        goodsUnit: goodsUnitStr
      });
    }

    return (
      <div>
        {
          form.getFieldDecorator('goodsId', {
            rules: [{ required: true, message: '请选择货品' }]
          })(
            <Select onChange={handleSelectChange} placeholder='请选择货品'>
              {
                goodsList.map(item => <Select.Option key={item.goodsId} value={item.goodsId}>{item.categoryName}-{item.goodsName}</Select.Option>)
              }
            </Select>
          )
        }
        {
          form.getFieldDecorator('goodsName', { rules: [{ reuqired: true, message: '请选择货品' }] })
        }
      </div>
    );
  };

  const providerNameEditRender = (record, form) => {
    function getList() {
      // console.log(form.getFieldValue('carId'));
      if (carMap.get(form.getFieldValue('carId')) ){
        return [...carMap.get(form.getFieldValue('carId')) ];
      }
      return [];
    }

    return form.getFieldDecorator('providerName', {
      rules: [{ required: true, message: '请选择设备产家' }]
    })(
      <Select placeholder='请选择设备产家'>
        {
          getList().map(item => <Select.Option key={item} value={item}>{item}</Select.Option>)
        }
      </Select>
    );
  };

  const columns = [
    {
      title: '车牌号',
      dataIndex: 'carNo',
      key: 'carNo',
      width: 180,
      editingRender: carEditRender,
    },
    {
      title: '司机',
      dataIndex: 'driverUserName',
      key: 'driverUserName',
      width: 150,
      editingRender: driverEditRender,
    }, {
      title: '联系电话',
      dataIndex: 'driverPhone',
      key: 'driverPhone',
      width: 150,
      editingRender: (record, form) => {
        const val = form.getFieldValue('driverPhone');
        return form.getFieldDecorator('driverPhone', { rules: [{ reuqired: true, message: '联系电话未填写' }] })(<span>{val || '--'}</span>);
      },
    },
    {
      title: '设备产家',
      dataIndex: 'providerName',
      key: 'providerName',
      width: 150,
      editingRender: providerNameEditRender,
    },
    {
      title: '设备编号',
      dataIndex: 'device',
      width: 150,
      key: 'device',
      editingRender: (record, form) => {
        const val = form.getFieldValue('device');
        return form.getFieldDecorator('device')(<span>{val || '--'}</span>);
      },
    },
    {
      title: '每车配载货品名称',
      dataIndex: 'goodsName',
      key: 'goodsName',
      width: 250,
      editingRender: goodsEditRender,
    },
    {
      title: "货品单位",
      dataIndex: "goodsUnit",
      key: "goodsUnit",
      editingRender: (record, form) => {
        const val = form.getFieldValue('goodsUnit');
        return form.getFieldDecorator('goodsUnit', { rules: [{ reuqired: true, message: '货品单位未填写' }] })(<span>{val || '--'}</span>);
      },
      width: "100px",
    },
    {
      title: '单车配载货品数量',
      dataIndex: 'goodsNum',
      width: 100,
      key: 'goodsNum',
      editingRender: (record, form) => form.getFieldDecorator('goodsNum', {
        rules: [{ required: true, message: '请输入单车配载货品数量' }, {
          pattern: /^\d+(\.\d+)?$/, message: '单车配载货品数量应为纯数字'
        }]
      })(<Input placeholder='请输入单车配载货品数量' readOnly={readOnly} />),
    }
  ];

  const onFileChange = ({ fileList }) => {
    const _fileList = fileList.map(item => item.originFileObj || item);
    setFileList(_fileList);
  };


  const importData = () => {
    if (!fileList.length) {
      return message.error('请先导入文件');
    }
    const automaticDentryid = fileList[0]._name;

    getProjectAutomaticReadExcel({ automaticDentryid, projectId }).then(({ readResult, projectAutomaticCreateReqList, errorMessageList }) => {
      if (readResult === 'FAIL') {
        Modal.error({
          title: '导入失败',
          content: errorMessageList.map(item => <div>{item}</div>)
        });
      } else {

        message.success('导入成功');
        const newDataList = projectAutomaticCreateReqList.map(car => {
          const { projectAutomaticCorrelationCreateReqList } = car;
          return {
            ...car,
            goodsName: projectAutomaticCorrelationCreateReqList?.[0]?.goodsName,
            goodsUnit: projectAutomaticCorrelationCreateReqList?.[0]?.goodsUnit,
            goodsNum: projectAutomaticCorrelationCreateReqList?.[0]?.goodsNum,
          };
        });
        setDataList(newDataList);
        onChange(newDataList);
      }
    });

  };

  const downloadTemplate = () => {
    getOSSToken()
      .then(accessInfo => {
        getOssFile(accessInfo, 'business/project/车辆导入模板.xlsx');
      });
  };

  return (
    <>
      {!readOnly && (
        <Row type='flex' align='middle'>
          <span className='mr-2'>选择文件</span>
          <UploadBox commonType accept='.xls,.xlsx' onChange={onFileChange} className={styles.UploadBox}>
            <Button disabled={fileList.length}><Icon type="upload" />请选择文件导入</Button>
          </UploadBox>
          <Button className='ml-1' type="primary" onClick={importData}>导入</Button>
          <Button className='ml-1' type="link" onClick={downloadTemplate}>下载模板</Button>
        </Row>) || null}
      {ready && <EditableTable readOnly={readOnly} onChange={onChange} onAdd={saveCarTable} rowKey="carId" pagination={false} columns={columns} dataSource={dataList || []} /> || null}
    </>
  );
};

export default CarTable;
