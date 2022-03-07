import React, { Component } from 'react';
import { Modal, Button } from 'antd';
import { connect } from 'dva';
import { Item, SchemaForm, FORM_MODE, Observer } from '@gem-mine/antd-schema-form';
import router from 'umi/router';
import moment from 'moment';
import DebounceFormButton from '@/components/DebounceFormButton';
import { getGoodsPlansList, patchGoodsPlan } from '@/services/apiService';
import { FilterContextCustom } from '@/components/Table/FilterContext';
import Table from '@/components/Table/Table';
import { translatePageType,  getLocal } from '@/utils/utils';
import auth from '@/constants/authCodes';
import { PLANSTATUSARRAY, PLANSTATUS } from '@/constants/goodsPlans/planStatus';
import SearchForm from '@/components/Table/SearchForm2';
import '@gem-mine/antd-schema-form/lib/fields';

const { GOODSPLAN_VISIT, GOODSPLAN_AUDIT, TRANSPORT_VISIT, PREBOOKING_VISIT } = auth;
function mapStateToProps (state) {
  return {
    ...state.commonStore,
  };
}
@connect(mapStateToProps)
@FilterContextCustom
export default class GoodPlanList extends Component{
  currentTab = this.props.tabs.find(item => item.id === this.props.activeKey);

  // 获取本地是否有初始化数据
  localData = getLocal(this.currentTab.id) || { formData: {} };

  form = null;

  state={
    nowPage: 1,
    pageSize: 10,
    goodsPlanList:[],
    visible:false,
    refuseRecord:{}
  }

  schema = {
    verifyReason: {
      label: '拒绝理由',
      rules:{
        required: [true, '拒绝理由不能为空'],
        max: 100
      },
      component: 'input.textArea',
      placeholder: '请输入拒绝理由',
    }
  }

  tableSchema = {
    variable:true,
    minWidth:2000,
    columns:[{
      title: '状态',
      dataIndex: 'planStatus',
      render: (text) => (<span style={{ color:PLANSTATUSARRAY[text].color }}>{PLANSTATUSARRAY[text].title}</span>)
    },
    {
      title: '要货计划单名称',
      dataIndex: 'goodsPlanName'
    },
    {
      title: '客户',
      dataIndex: 'customerName'
    },
    {
      title: '合同名称',
      dataIndex: 'projectName'
    },
    {
      title: '计划单编号',
      dataIndex: 'goodsPlanNo'
    },
    {
      title: '下单日期',
      dataIndex: 'createTime',
      render:(text)=>moment(text).format('YYYY-MM-DD')
    }],
    operations: (record) => {
      // TODO 状态未定义
      const detail = {
        title: '详情',
        auth:[GOODSPLAN_VISIT],
        onClick: (record) => {
          router.push(`./goodsPlans/goodsplansdetail?goodsPlanId=${record.goodsPlanId}`);
        }
      };
      const prebookFilter = {
        title: '预约单',
        auth:[PREBOOKING_VISIT],
        onClick: (record) => {
          router.push(`/buiness-center/preBookingList/preBooking?goodsPlanId=${record.goodsPlanId}&goodsPlanName=${record.goodsPlanName}`);
        },
      };
      const createPrebooking = {
        title: '新建预约单',
        onClick: (record) => {
          router.push(`/buiness-center/preBookingList/preBooking/createPreBooking?goodsPlanId=${record.goodsPlanId}&&projectId=${record.projectId}`);
        },
      };
      const transportFilter = {
        title: '运单',
        auth:[TRANSPORT_VISIT],
        onClick: (record) => {
          router.push(`/buiness-center/transportList/transport?goodsPlanId=${record.goodsPlanId}&goodsPlanName=${record.goodsPlanName}`);
        },
      };
      const accept = {
        title: '接受',
        auth:[GOODSPLAN_AUDIT],
        onClick: (record) => {
          const { goodsPlanId } = record;
          patchGoodsPlan({ goodsPlanId, planStatus:PLANSTATUS.GOINGON })
            .then(()=>{
              const { filter } = this.props;
              return getGoodsPlansList(filter);
            })
            .then(data=>{
              this.setState({
                goodsPlanList:data
              });
            });
        }
      };
      const refuse = {
        title: '拒绝',
        auth:[GOODSPLAN_AUDIT],
        onClick: (record) => {
          this.setState({
            visible:true,
            refuseRecord:record
          });
        }
      };
      return {
        [PLANSTATUS.CONSIGNMENT_UNTREATED]: [detail, accept, refuse],
        [PLANSTATUS.CONSIGNMENT_REFUSED]: [detail],
        [PLANSTATUS.GOINGON]: [detail, createPrebooking, prebookFilter, transportFilter],
        [PLANSTATUS.COMPLETE]: [detail, prebookFilter, transportFilter],
        [PLANSTATUS.CANCEL]: [detail],
        [PLANSTATUS.FINISH]: [detail, prebookFilter, transportFilter],
      }[record.planStatus];
    }

  }

  searchFormSchema = {
    // TODO 计划单名称字段未定义
    goodsPlanName: {
      label: '搜索',
      component: 'input',
      placeholder: '请输入计划单名称',
      observer: Observer({
        watch: '*localData',
        action: (itemValue, { form }) => {
          if (this.form !== form) {
            this.form = form;
          }
          return { };
        }
      }),
    },
    planStatus:{
      label:'状态',
      component: 'select',
      placeholder: '请选择计划单状态',
      // TODO 状态未定义 options暂时乱写
      options:[
        {
          label:'托运待确认',
          value:0
        },
        {
          label:'托运已拒绝',
          value:1
        },
        {
          label:'进行中',
          value:2
        },
        {
          label:'已完成',
          value:3
        },
        {
          label:'已撤销',
          value:4
        },
        {
          label:'已结束',
          value:5
        }
      ]
    }
  }

  componentWillMount (){
    const params = {
      ...this.localData.formData,
      offset: this.localData.nowPage ? this.localData.pageSize * ( this.localData.nowPage - 1 ) : 1,
      limit: this.localData.pageSize ? this.localData.pageSize : 10,
    };
    this.props.setFilter({ ...params });
    this.setState({
      nowPage: this.localData.nowPage || 1,
      pageSize: this.localData.pageSize || 10,
    });
    getGoodsPlansList({ ...params })
      .then(goodsPlanList=>{
        this.setState({
          goodsPlanList
        });
      });
  }

  componentWillUnmount() {
    // 页面销毁的时候自己 先移除原有的 再存储最新的
    const formData = this.form ? this.form.getFieldsValue() : null;
    localStorage.removeItem(this.currentTab.id);
    if (getLocal('local_commonStore_tabsObj').tabs.length > 1) {
      localStorage.setItem(this.currentTab.id, JSON.stringify({
        formData: { ...formData },
        pageSize: this.state.pageSize,
        nowPage: this.state.nowPage,
      }));
    }
  }

  onChange = (pagination) => {
    const { offset, limit, current } = translatePageType(pagination);
    const newFilter = this.props.setFilter({ ...this.props.filter, offset, limit });
    getGoodsPlansList({ ...newFilter })
      .then(data => {
        this.setState({
          nowPage: current,
          pageSize: limit,
          goodsPlanList:data
        });
      });
  }

  handleSearchBtnClick = () => {
    const { filter, setFilter } = this.props;
    const newFilter = setFilter({ ...filter, offset: 0 });
    getGoodsPlansList(newFilter)
      .then(data => {
        this.setState({
          goodsPlanList:data
        });
      });

  }

  handleResetBtnClick = () => {
    const newFilter = this.props.resetFilter({});
    getGoodsPlansList(newFilter)
      .then(data => {
        this.setState({
          nowPage: 1,
          pageSize: 10,
          goodsPlanList:data
        });
      });
  }

  searchTableList = () => {
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
    const data = Object.assign({}, this.localData.formData || {});
    return (
      <SearchForm layout="inline" {...layout} data={data} mode={FORM_MODE.SEARCH} schema={this.searchFormSchema}>
        {/* TODO 计划单名称字段未定义 */}
        <Item field="goodsPlanName" />
        <Item field="planStatus" />
        <DebounceFormButton label="查询" className="mr-10" type="primary" onClick={this.handleSearchBtnClick} />
        <DebounceFormButton label="重置" type="reset" onClick={this.handleResetBtnClick} />
      </SearchForm>
    );
  }

  closeModal = () =>{
    this.setState({ visible: false });
  }

  handleCancel = value => {
    const { verifyReason } = value;
    const { refuseRecord:{ goodsPlanId } } = this.state;
    patchGoodsPlan({ goodsPlanId, planStatus:PLANSTATUS.CONSIGNMENT_REFUSED, remarks:verifyReason })
      .then(()=>{
        const { filter } = this.props;
        return getGoodsPlansList(filter);
      })
      .then(data=>{
        this.setState({
          goodsPlanList:data
        });
        this.closeModal();
      });
  }

  render (){
    const { nowPage, pageSize, goodsPlanList, visible } = this.state;
    return (
      <>
        <Modal
          title='拒绝计划单'
          footer={null}
          destroyOnClose
          maskClosable={false}
          visible={visible}
          onCancel={this.closeModal}
        >
          <SchemaForm schema={this.schema} mode={FORM_MODE.ADD}>
            <Item field="verifyReason" />
            <div style={{ paddingRight: '20px', marginTop:'10px', textAlign: 'right' }}>
              <Button className="mr-10" onClick={this.closeModal}>取消</Button>
              <DebounceFormButton label="确定" type="primary" onClick={this.handleCancel} />
            </div>
          </SchemaForm>
        </Modal>
        <Table schema={this.tableSchema} renderCommonOperate={this.searchTableList} rowKey="goodsPlanId" pagination={{ current: nowPage, pageSize }} onChange={this.onChange} dataSource={goodsPlanList} />
      </>
    );
  }
}
