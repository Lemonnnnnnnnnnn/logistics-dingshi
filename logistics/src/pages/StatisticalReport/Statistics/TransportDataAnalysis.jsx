import React, { useState, useEffect } from 'react';
import moment from 'moment';
import { connect } from 'dva';
import { SchemaForm, Item, FORM_MODE, Observer } from '@gem-mine/antd-schema-form';
import { Button } from 'antd';
import DebounceFormButton from '../../../components/DebounceFormButton';
import { translatePageType, getLocal } from '../../../utils/utils';
import '@gem-mine/antd-schema-form/lib/fields';
import { getTransportDataAnalysis, exportTransportDataAnalysisExcel } from '../../../services/apiService';
import Table from '../../../components/Table/Table';
import styles from './TransportDataAnalysis.less';

function TransportDataAnalysis ({ tabs, activeKey }){
  const currentTab = tabs.find(item => item.id === activeKey);
  let localData ;
  if (getLocal(currentTab.id)){
    const localFilter = getLocal(currentTab.id);
    localData = getLocal(currentTab.id);
    if (localFilter.formData.createTime?.length){
      localData.formData.createTime = [moment(localFilter.formData.createTime[0]), moment(localFilter.formData.createTime[1])];
    } else {
      localData.formData.createTime = [moment().startOf('month'), moment().endOf('month')];
    }
  } else {
    localData = { formData: { createTime: [moment().startOf('month'), moment().endOf('month')] } };
  }

  let form1 = null;
  const [ tableData, setTableData ] = useState([]);
  const [ nowPage, setNowPage ] = useState(1);
  const [ filter, setFilter] = useState(localData.formData);
  useEffect(()=>{
    handleSearchBtnClick(filter);
  }, []);

  useEffect(() =>  () => {
    // 页面销毁的时候自己 先移除原有的 再存储最新的
    localStorage.removeItem(currentTab.id);
    if (getLocal('local_commonStore_tabsObj').tabs.length > 1) {
      localStorage.setItem(currentTab.id, JSON.stringify({ formData: filter, nowPage }));
    }
  }, [filter]);
  const schema = {
    projectName:{
      label: '合同名称',
      component: 'input',
      bserver: Observer({
        watch: '*localData',
        action: (itemValue, { form }) => {
          if (form1 !== form) {
            form1 = form;
          }
          return { };
        }
      }),
      placeholder: '请输入合同名称'
    },
    shipmentName:{
      label: '承运方',
      component: 'input',
      placeholder: '请输入承运方'
    },
    createTime:{
      label: '选择时间',
      format: {
        input: (value) => {
          if (Array.isArray(value)) {
            return value.map(item => moment(item));
          }
          return value;
        },
        output: (value) => value
      },
      component: 'rangePicker'
    }
  };

  const tableSchema = {
    //  合同名称、承运方、整体耗时（小时）、调度环节耗时（小时）、司机接单环节耗时（小时）、司机运输环节耗时（小时）、运单合计（单）、1天、2天
    //  3天、4天、5天、6天、7天、1周~2周、2周以上
    variable: true,
    minWidth:2200,
    minHeight:600,
    columns:[
      {
        title: '合同名称',
        dataIndex: 'projectName',
        fixed: 'left',
        className: styles['background-blue'],
        render: (text, item, index) => {
          let { rowSpan } = item;
          if (index === 0){ // 第一行的数据按实际item.colSpan渲染
          } else if ( item.rowSpan === 1 && tableData[index-1]?.projectName === text ){ // 其他行如果colSpan为1 则判断上一行是否为相同合同名 是的话则不渲染
            rowSpan = 0;
          }
          return {
            children: <div className="singleRow" style={{ width:'168px' }} title={text}>{text}</div>,
            props: {
              rowSpan
            }
          };
        },
        width:200
      },
      {
        title: '承运方',
        dataIndex: 'shipmentName',
        fixed: 'left',
        render: (text) => <div className="singleRow" style={{ width:'168px' }} title={(text || '--')}>{(text || '--')}</div>,
        width:200
      },
      {
        title: '整体耗时(小时)',
        dataIndex: 'overallCompletedTime',
        render: (text) => (text || '0'),
        width:130
      },
      {
        title: '调度环节耗时(小时)',
        dataIndex: 'dispatchCompletedTime',
        render: (text) => (text || '0'),
        width:155
      },
      {
        title: '司机接单环节耗时(小时)',
        dataIndex: 'driverAcceptCompletedTime',
        render: (text) => (text || '0'),
        width:200
      },
      {
        title: '司机运输环节耗时(小时)',
        dataIndex: 'driverTransportCompletedTime',
        render: (text) => (text || '0'),
        width:200
      },
      {
        title: '运单合计(单)',
        dataIndex: 'transportTotalNum',
        width:137
      },
      {
        title: '1天',
        dataIndex: 'transportOneDayNum',
        width:100
      },
      {
        title: '2天',
        dataIndex: 'transportTwoDayNum',
        width:100
      },
      {
        title: '3天',
        dataIndex: 'transportThreeDayNum',
        width:100
      },
      {
        title: '4天',
        dataIndex: 'transportFourDayNum',
        width:100
      },
      {
        title: '5天',
        dataIndex: 'transportFiveDayNum',
        width:100
      },
      {
        title: '6天',
        dataIndex: 'transportSixDayNum',
        width:100
      },
      {
        title: '7天',
        dataIndex: 'transportSevenDayNum',
        width:100
      },
      {
        title: '1周~2周',
        dataIndex: 'transportLowTwoWeekNum',
        width:140
      },
      {
        title: '2周以上',
        dataIndex: 'transportHighTwoWeekNum',
        width:134
      }
    ]
  };

  const filterReset = () => {
    const newFilter = {
      offset: 0,
      limit: 10,
      createTime:[moment().startOf('month'), moment().endOf('month')]
    };
    setFilter(newFilter);
    handleSearchBtnClick(newFilter, false);
  };

  const SearchTableList = () => {
    const layout = {
      labelCol: {
        xs: { span: 24 },
        sm: { span: 8 },
        xl: { span: 6 }
      },
      wrapperCol: {
        xs: { span: 24 },
        sm: { span: 16 },
        xl: { span: 18 }
      }
    };
    return (
      <SchemaForm schema={schema} layout="inline" {...layout} mode={FORM_MODE.SEARCH} data={filter}>
        <Item field='projectName' />
        <Item field='shipmentName' />
        <Item field='createTime' />
        <DebounceFormButton label='查询' className="mr-10" type="primary" onClick={handleSearchBtnClick} />
        <Button className="mr-10" onClick={filterReset}>重置</Button>
        <DebounceFormButton label='导出' type="primary" onClick={exportTransportDataAnalysisExcel} />
      </SchemaForm>
    );
  };


  const handleSearchBtnClick = (formData={}, isReset=true) => {
    const createDateStart = formData.createTime && formData.createTime.length ? moment(formData.createTime[0]).startOf('day').format('YYYY/MM/DD HH:mm:ss') : undefined;
    const createDateEnd = formData.createTime && formData.createTime.length ? moment(formData.createTime[1]).endOf('day').format('YYYY/MM/DD HH:mm:ss') : undefined;
    const filter = { offset: 0, limit: 10, ...formData, createDateStart, createDateEnd }; // , isContainPreBook: true, isContainDriver:false, isContainShipment: false
    setNowPage(1);
    Object.keys(filter).forEach(keyName => {
      if (!filter[keyName] === undefined || !filter[keyName] === ''){
        delete filter[keyName];
      }
    });

    const addTotalData = (data) => {
      const _items = JSON.parse(JSON.stringify(data.items));
      const items = _items.map(({ overallCompletedTime, dispatchCompletedTime, driverAcceptCompletedTime, driverTransportCompletedTime, ...rest }) => ({
        overallCompletedTime: +(overallCompletedTime/3600).toFixed(2),
        dispatchCompletedTime: +(dispatchCompletedTime/3600).toFixed(2),
        driverAcceptCompletedTime: +(driverAcceptCompletedTime/3600).toFixed(2),
        driverTransportCompletedTime: +(driverTransportCompletedTime/3600).toFixed(2),
        ...rest
      }));
      const totalObj = {
        projectName: '合计',
        overallCompletedTime: 0,
        dispatchCompletedTime: 0,
        driverAcceptCompletedTime: 0,
        driverTransportCompletedTime: 0,
        transportTotalNum: 0,
        transportOneDayNum: 0,
        transportTwoDayNum: 0,
        transportThreeDayNum: 0,
        transportFourDayNum: 0,
        transportFiveDayNum: 0,
        transportSixDayNum: 0,
        transportSevenDayNum: 0,
        transportLowTwoWeekNum: 0,
        transportHighTwoWeekNum: 0,
        transportAllTimeNum: 0,
        shipmentName: '--',
        overallCompletedNum: 0,
        dispatchCompletedNum:0,
        driverAcceptCompletedNum:0,
        driverTransportCompletedNum:0
      };

      const caculateTotalize = (totalObj, newItem) => {
        const _totalObj = JSON.parse(JSON.stringify(totalObj));
        Object.keys(totalObj).forEach(keyName=>{
          if (typeof(_totalObj[keyName]) === 'number'){
            if (keyName === 'overallCompletedTime'){
              _totalObj.overallCompletedTime+= newItem.overallCompletedTime;
              _totalObj.overallCompletedNum++;
            } else if (keyName === 'dispatchCompletedTime'){
              _totalObj.dispatchCompletedTime+= newItem.dispatchCompletedTime;
              _totalObj.dispatchCompletedNum++;
            } else if (keyName === 'driverAcceptCompletedTime'){
              _totalObj[keyName]+= newItem[keyName];
              _totalObj.driverAcceptCompletedNum++;
            } else if (keyName === 'driverTransportCompletedTime') {
              _totalObj[keyName]+= newItem[keyName];
              _totalObj.driverTransportCompletedNum++;
            } else {
              _totalObj[keyName]+=newItem[keyName];
            }
          }
        });
        _totalObj.projectId = newItem.projectId;
        _totalObj.rowSpan = 1;
        return _totalObj;
      };

      const toPercentage = (num, total) =>num === 0
        ? num
        : ((num/total)*100).toFixed(2);

      // 求项目 整体耗时（小时），调度环节耗时（小时），司机接单环节耗时（小时），司机运输环节耗时（小时）平均值,修改原对象 无返回值
      const getEverage = (totalObj) => {
        totalObj.overallCompletedTime = totalObj.overallCompletedNum ? (totalObj.overallCompletedTime / totalObj.overallCompletedNum).toFixed(2) : 0;
        totalObj.dispatchCompletedTime = totalObj.dispatchCompletedNum ? (totalObj.dispatchCompletedTime / totalObj.dispatchCompletedNum).toFixed(2) : 0;
        totalObj.driverAcceptCompletedTime = totalObj.driverAcceptCompletedNum ? (totalObj.driverAcceptCompletedTime / totalObj.driverAcceptCompletedNum).toFixed(2) : 0;
        totalObj.driverTransportCompletedTime = totalObj.driverTransportCompletedNum ? (totalObj.driverTransportCompletedTime / totalObj.driverTransportCompletedNum).toFixed(2) : 0;
        totalObj.transportOneDayNum = `${totalObj.transportOneDayNum}(${toPercentage(totalObj.transportOneDayNum, totalObj.transportTotalNum)}%)`;
        totalObj.transportTwoDayNum = `${totalObj.transportTwoDayNum}(${toPercentage(totalObj.transportTwoDayNum, totalObj.transportTotalNum)}%)`;
        totalObj.transportThreeDayNum = `${totalObj.transportThreeDayNum}(${toPercentage(totalObj.transportThreeDayNum, totalObj.transportTotalNum)}%)`;
        totalObj.transportFourDayNum = `${totalObj.transportFourDayNum}(${toPercentage(totalObj.transportFourDayNum, totalObj.transportTotalNum)}%)`;
        totalObj.transportFiveDayNum = `${totalObj.transportFiveDayNum}(${toPercentage(totalObj.transportFiveDayNum, totalObj.transportTotalNum)}%)`;
        totalObj.transportSixDayNum = `${totalObj.transportSixDayNum}(${toPercentage(totalObj.transportSixDayNum, totalObj.transportTotalNum)}%)`;
        totalObj.transportSevenDayNum = `${totalObj.transportSevenDayNum}(${toPercentage(totalObj.transportSevenDayNum, totalObj.transportTotalNum)}%)`;
        totalObj.transportLowTwoWeekNum = `${totalObj.transportLowTwoWeekNum}(${toPercentage(totalObj.transportLowTwoWeekNum, totalObj.transportTotalNum)}%)`;
        totalObj.transportHighTwoWeekNum = `${totalObj.transportHighTwoWeekNum}(${toPercentage(totalObj.transportHighTwoWeekNum, totalObj.transportTotalNum)}%)`;
      };

      let count = 1;
      let isAddTotalItem = false;
      for (let i = 0; i < items.length; i++ ){
        let _totalObj = caculateTotalize(totalObj, items[i]);
        for (let j = i+1; j < items.length; j++){
          if (items[i].projectId === items[j].projectId){ // 同项目 累加数据
            items[j].rowSpan = 0;
            _totalObj = caculateTotalize(_totalObj, items[j]);
            count++;
            // i=j+1
          } else { // 否则在ITEMS中增加一个合计的item
            getEverage(_totalObj);
            items.splice(j, 0, _totalObj);
            isAddTotalItem = true;
            // i = j+2
            break;
          }
        }
        const nextI = isAddTotalItem ? i + count : i + count -1;
        if (nextI === items.length - 1){ // 边界情况（当第n~len-1条数据都相同时）添加合计数据
          getEverage(_totalObj);
          items.push(_totalObj);
          items[i].rowSpan = count;
          break; // 不break会照成数组长度一直增加 导致死循环
        }
        items[i].rowSpan = count;
        i = nextI;
        count = 1;
        isAddTotalItem = false;
      }



      return {
        count: data.count,
        items
      };
    };

    getTransportDataAnalysis(filter)
      .then(data=>{
        const _data = addTotalData(data);
        _data.count *= 2;
        setTableData(_data);
        isReset && setFilter(filter);
      });
  };

  const tablePageOnChange = (pagination) => {
    let { offset, current } = translatePageType(pagination);
    offset = (current - 1 ) * 10;
    handleSearchBtnClick({ ...filter, offset, limit:10 });
    setNowPage(current);
  };
  return (
    <>
      <SearchTableList />
      <Table
        rowKey="accountTransportId"
        pagination={{
          current: nowPage,
          defaultPageSize:20,
          pageSize:20,
          showSizeChanger: false,
          showTotal:total => <span className="mr-20">{`共 ${total/2} 条记录 第 ${nowPage} / ${Math.ceil(total/20)} 页`}</span>
        }}
        onChange={tablePageOnChange}
        schema={tableSchema}
        dataSource={tableData}
        rowClassName={(record) => {
          if (record.projectName === '合计'){
            return styles['background-blue'];
          }
          return null;
        }}

      />
    </>
  );
}

export default connect(({ commonStore }) => ({
  ...commonStore,
}))(TransportDataAnalysis);
