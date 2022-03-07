import React, { Component } from "react";
import moment from "moment";
import { connect } from "dva";
import { FORM_MODE } from "@gem-mine/antd-schema-form";
import EditableTable from "@/components/EditableTable/EditableTable";
import { getGoodsName, getLocal } from "@/utils/utils";

function mapStateToProps(state) {
  return {
    commonStore: state.commonStore,
  };
}
@connect(mapStateToProps)
class DeliveryInfo extends Component{
  currentTab = this.props.commonStore.tabs.find(item => item.id === this.props.commonStore.activeKey);

  localData = getLocal(this.currentTab.id) || { formData: {} };

  componentWillUnmount() {
    // 页面销毁的时候自己 先移除原有的 再存储最新的
    const localData = getLocal(this.currentTab.id) || { formData: {} };
    localStorage.removeItem(this.currentTab.id);
    if (getLocal('local_commonStore_tabsObj').tabs.length > 1) {
      localStorage.setItem(this.currentTab.id, JSON.stringify({
        formData: { ...localData.formData, deliveryItems: this.props.value },
      }));
    }
  }

  render (){
    const { value = [] } = this.props;
    const columns = [{
      title: '提货点',
      dataIndex: 'deliveryName',
      fixed: 'left',
      width: '120px'
    }, {
      title: '提货地址',
      dataIndex: 'deliveryAddress',
    }, {
      title: '提货联系人',
      dataIndex: 'contactName',
      width: '150px'
    }, {
      title: '提货联系电话',
      dataIndex: 'contactPhone',
    }, {
      title: '货品名称',
      dataIndex: 'goodsName',
      // render:(text, record)=>`${record.categoryName}-${record.goodsName}`
      render: (value, record) => getGoodsName(record),
    }, {
      title: '分配量',
      dataIndex: 'goodsNum',
      render:(text, record)=> `${record.goodsNum}${record.goodsUnitCN}`
    }, {
      title: '实提量',
      dataIndex: 'deliveryNum',
      render:(text, record)=>{
        if (text===null){
          return '--';
        }
        return `${text}${record.deliveryUnitCN}`;
      },
    }, {
      title: '实收量',
      dataIndex: 'receivingNum',
      render:(text, record)=>{
        if (text===null){
          return '--';
        }
        return `${text}${record.deliveryUnitCN}`;
      },
    }, {
      title: '磅差比',
      dataIndex: 'bangchabi',
      render:(text, record)=>{
        if (record.deliveryNum&&record.receivingNum){
          return `${((record.deliveryNum - record.receivingNum) * 1000 / (record.deliveryNum)).toFixed(1)._toFixed(1)}‰`;
        }
        return '--';
      },
    }, {
      title: '提货时间',
      dataIndex: 'processPointCreateTime',
      render: (time) => {
        if (time===null) return '--';
        return moment(time).format('YYYY-MM-DD HH:mm:ss');
      },
    }, {
      title: '卸货点',
      dataIndex: 'receivingName'
    }, {
      title: '卸货地址',
      dataIndex: 'receivingAddress'
    }];
    const readOnly = this.props.readOnly === undefined ? this.props.mode === FORM_MODE.DETAIL : this.props.readOnly;
    return (
      <EditableTable
        minWidth={2000}
        readOnly={readOnly}
        onChange={this.props.onChange}
        rowKey="goodsId"
        columns={columns}
        pagination={false}
        dataSource={value}
      />
    );
  }
}
export default DeliveryInfo;
