import React, { Component } from 'react';
import { Modal, Button, message } from 'antd';
import { SchemaForm, Item, FormCard, FORM_MODE, Observer } from '@gem-mine/antd-schema-form';
import router from 'umi/router';
import { connect } from 'dva';
import { getLocal } from '@/utils/utils';
import DebounceFormButton from '@/components/DebounceFormButton';
import models from '@/models/group';
import MemberList from './component/MemberList';
import '@gem-mine/antd-schema-form/lib/fields';

const { confirm } = Modal;

const { actions } = models;

function mapStateToProps (state) {
  return {
    entity: state.groups.entity,
    commonStore: state.commonStore,
  };
}

const formLayout = {
  labelCol: {
    span: 24
  },
  wrapperCol: {
    span: 24
  }
};

const layout = {
  labelCol: {
    lg:6,
    xl:4,
    xxl:3,
  },
  wrapperCol: {
    lg:18,
    xl:20,
    xxl:21,
  }
};

@connect(mapStateToProps, actions)
class GroupSetting extends Component {
  currentTab = this.props.commonStore.tabs.find(item => item.id === this.props.commonStore.activeKey);

  localData = getLocal(this.currentTab.id) || { formData: {} };

  form = null;

  schema = {
    groupName:{
      label: '群组名称',
      component: 'input',
      placeholder: '请输入群组名称',
      rules: {
        required: [true, '请输入群组名称']
      },
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
    isAvailable: {
      label: '是否启用',
      component: 'radio',
      defaultValue: 1,
      options: [{
        key: 1,
        label: '是',
        value: 1
      }, {
        key: 0,
        label: '否',
        value: 0
      }],
      rules:{
        required: [true, '请选择是否启用']
      }
    },
    remarks:{
      label: '备注（可选）',
      component: 'input.textArea',
      maxLength: 200,
      placeholder: '请输入备注'
    },
    receiveFailedMessage: {
      label: '接收支付失败消息',
      component: 'radio',
      defaultValue: 1,
      options: [{
        key: 1,
        label: '是',
        value: 1
      }, {
        key: 2,
        label: '否',
        value: 2
      }],
    },
    receiveServiceException: {
      label: '接收服务异常消息',
      component: 'radio',
      defaultValue: 1,
      options: [{
        key: 1,
        label: '是',
        value: 1
      }, {
        key: 2,
        label: '否',
        value: 2
      }],
    },
    receiveAbnormalFlow: {
      label: '是否接收银行流水异常消息',
      component: 'radio',
      defaultValue: 1,
      options: [{
        key: 1,
        label: '是',
        value: 1
      }, {
        key: 2,
        label: '否',
        value: 2
      }],
    },
    receivePlatWithdrawal: {
      label: '接收平台提现消息',
      component: 'radio',
      defaultValue: 1,
      options: [{
        key: 1,
        label: '是',
        value: 1
      }, {
        key: 2,
        label: '否',
        value: 2
      }],
    },
    receivePlatRefund: {
      label: '接收平台退款消息',
      component: 'radio',
      defaultValue: 1,
      options: [{
        key: 1,
        label: '是',
        value: 1
      }, {
        key: 2,
        label: '否',
        value: 2
      }],
    },
    manualAccountPosting: {
      label: '接收平台手工上账消息',
      component: 'radio',
      defaultValue: 1,
      options: [{
        key: 1,
        label: '是',
        value: 1
      }, {
        key: 2,
        label: '否',
        value: 2
      }],
    },
    platformReconciliation:{
      label: '接收对账查询异常消息',
      component: 'radio',
      defaultValue: 1,
      options: [{
        key: 1,
        label: '是',
        value: 1
      }, {
        key: 2,
        label: '否',
        value: 2
      }],
    },
    platformBalanceInsufficient : {
      label: '平台账户余额不足',
      component: 'radio',
      defaultValue: 1,
      options: [{
        key: 1,
        label: '是',
        value: 1
      }, {
        key: 2,
        label: '否',
        value: 2
      }],
    },
    logisticsGroupDetailEntities: {
      component: MemberList
    }
  }

  state = {
    ready:false
  }

  componentDidMount (){
    const { detailGroups, location:{ query:{ groupId, mode } } } = this.props;
    if (mode === FORM_MODE.MODIFY) {
      detailGroups({ groupId })
        .then((data) => {
          this.setState({
            ready:true,
            data
          });
        });
    } else {
      this.setState({
        ready:true
      });
    }
  }

  componentWillUnmount() {
    // 页面销毁的时候自己 先移除原有的 再存储最新的
    const formData = this.form ? this.form.getFieldsValue() : null;
    localStorage.removeItem(this.currentTab.id);
    if (getLocal('local_commonStore_tabsObj').tabs.length > 1) {
      localStorage.setItem(this.currentTab.id, JSON.stringify({
        formData: { ...formData },
      }));
    }
  }

  handleCancelBtnClick = () => {
    confirm({
      title: '提示',
      content: this.mode===FORM_MODE.ADD?'确认放弃添加群组吗？':'确认放弃修改群组吗？',
      okText: '确定',
      cancelText: '取消',
      onCancel: () => { },
      onOk: () => {
        router.replace('/user-manage/group');
        window.g_app._store.dispatch({
          type: 'commonStore/deleteTab',
          payload: { id: this.currentTab.id }
        });
      }
    });
  }

  handleSaveBtnClick = value => {
    const { postGroups, patchGroups, location:{ query:{ mode, groupId } } } = this.props;
    const { logisticsGroupDetailEntities } = value;
    if (!logisticsGroupDetailEntities || !logisticsGroupDetailEntities.length) {
      return message.error('请输入成员信息', 2);
    }
    const func = mode === FORM_MODE.ADD? postGroups: patchGroups;
    func({ ...value, groupId })
      .then(()=> {
        router.replace('/user-manage/group');
        window.g_app._store.dispatch({
          type: 'commonStore/deleteTab',
          payload: { id: this.currentTab.id }
        });
      });
  }

  render () {
    const { location:{ query:{ mode } } } = this.props;
    const { ready, data } = this.state;
    const newData = Object.assign(data || {},  this.localData && this.localData.formData || {});
    return (
      ready &&
      <SchemaForm
        data={newData}
        schema={this.schema}
        layout="vertical"
        mode={mode}
        {...formLayout}
      >
        <FormCard title="添加群组" colCount="3">
          <Item field="groupName" />
          <Item field='isAvailable' />
          <Item field='remarks' />
        </FormCard>
        <FormCard title="触发设置" colCount="1">
          <Item {...layout} field="receiveFailedMessage" />
          <Item {...layout} field="receiveServiceException" />
          <Item {...layout} field="receiveAbnormalFlow" />
          <Item {...layout} field="receivePlatWithdrawal" />
          <Item {...layout} field="receivePlatRefund" />
          <Item {...layout} field="manualAccountPosting" />
          <Item {...layout} field='platformReconciliation' />
          <Item {...layout} field='platformBalanceInsufficient' />
        </FormCard>
        <FormCard title="添加成员" colCount="1">
          <Item field="logisticsGroupDetailEntities" />
        </FormCard>
        <div style={{ textAlign:'right', paddingRight:'20px' }}>
          <Button className="mr-10" onClick={this.handleCancelBtnClick}>取消</Button>
          <DebounceFormButton label="保存" type="primary" onClick={this.handleSaveBtnClick} />
        </div>
      </SchemaForm>
    );
  }
}

export default GroupSetting;
