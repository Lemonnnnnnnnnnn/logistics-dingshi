// 新建对账单

import React, { Component } from 'react';
import { connect } from 'dva';
import { FORM_MODE, Item, SchemaForm, Observer } from '@gem-mine/antd-schema-form';
import { Button } from 'antd';
import router from 'umi/router';
import SelectField from '@gem-mine/antd-schema-form/lib/fieldItem/Select';
import CSSModules from 'react-css-modules';
import DebounceFormButton from '@/components/DebounceFormButton';
import UploadFile from '@/components/Upload/UploadFile';
import { getOssFile, getLocal } from '@/utils/utils';
import { getSupplierOrganizationNameList, getOSSToken } from '@/services/apiService';
import { getDeliveryStatementOSSFileKey } from '@/services/deliverStatement';
import styles from './ConsignmentCreateAccountStatementOne.less';

const wrapperCol = {
  xs: { span: 16 },
  push: 4,
};


function getAccessInfo() {
  return getOSSToken();
}
function mapStateToProps (state) {
  return {
    commonStore: state.commonStore
  };
}

@connect(mapStateToProps)
@CSSModules(styles, { allowMultiple: true })
export default class ConsignmentCreateAccountStatementOne extends Component {
  currentTab = this.props.commonStore.tabs.find(item => item.id === this.props.commonStore.activeKey);

  localData = this.currentTab && getLocal(this.currentTab.id) || { formData: {} };

  form = null

  state={
    ready:false,
    consignmentData:[],
    chooseVal:{
      organizationName:"",
      organizationId:0
    }
  }

  componentWillMount () {
    Promise.all([
      getSupplierOrganizationNameList({ limit: 1000, offset: 0, searchKey: '' }),
    ])
      .then(([_consignmentData])=>{
        const consignmentData = _consignmentData;
        this.setState({
          consignmentData
        });
        if (this.localData.formData.supplierOrganization) {
          this.setState({
            chooseVal: consignmentData.find(item => this.localData.formData.supplierOrganization === item.organizationId)
          });
        }
      }).then(()=>{
        const formSchema = {
          supplierOrganization: {
            label: '厂商名称',
            placeholder: '请输入厂商名称',
            component: SelectField,
            // onChange: (value) => {
            //   console.log(`onChange ${value}`);
            // },
            onBlur: (value) => {
              this.state.consignmentData.forEach( item => {
                if (item.organizationId ===value){
                  this.setState({
                    chooseVal:item
                  });
                }
              });
            },
            // onFocus: (value) => {
            //   console.log(`onFocus ${value}`);
            // },
            // onSearch: (value) => {
            //   console.log(`onSearch ${value}`);
            // },
            showSearch: true,
            optionFilterProp: 'children',
            filterOption: (input, option) => option.props.children.toLowerCase().indexOf(input.toLowerCase()) >= 0,
            options:()=>{
              const arr =[];
            this.state.consignmentData?.forEach(item=>{
              arr.push({
                label:item.organizationName,
                value:item.organizationId,
              });
            });
            return arr;
            },
            rules: {
              required: [true, '请选择厂商名称'],
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
          excelDentryid: {
            component: UploadFile,
            label: '导入出库清单',
            labelUpload: '点击上传附件,文件大小<=10M',
            accept: 'application/vnd.ms-excel,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
            renderMode: 'xls',
            fileSuffix: ['xls', 'xlsx'],
            size: 1 * 1024 * 10, // 10M
            rules: {
              required: [true, '请上传一个EXCEL文档'],
            },
          },
        };

        this.setState({
          formSchema,
          ready:true
        });
      });
  }

  componentWillUnmount() {
    // 页面销毁的时候自己 先移除原有的 再存储最新的
    const formData = this.form ? this.form.getFieldsValue() : null;
    localStorage.removeItem(this.currentTab.id);
    if (getLocal('local_commonStore_tabsObj').tabs.length > 1 && this.props.tab  === 1) {
      localStorage.setItem(this.currentTab.id, JSON.stringify({
        formData: { ...formData },
        tab: 1,
      }));
    }
  }


  nextPage = (val) => {
    this.props.getData({
      tab: 2,
      supplierOrganizationName: this.state.chooseVal.organizationName,
      supplierOrganizationId:this.state.chooseVal.organizationId,
      excelDentryid: val.excelDentryid && val.excelDentryid.length > 0 ? (val.excelDentryid[0]) : '',
    });
  }

  getMoBanFile = () => {
    getAccessInfo()
      .then(accessInfo => {
        getOssFile(accessInfo, getDeliveryStatementOSSFileKey('accountOutbound'));
      });
  }


  pageOne = () => {
    const data = this.localData.formData;
    return (
      <div style={{ width: 500 }} className={styles.pageOne}>
        <SchemaForm
          schema={this.state.formSchema}
          layout="horizontal"
          data={data}
          mode={FORM_MODE.ADD}
          wrapperCol={wrapperCol}
        >
          <Item field='supplierOrganization' />
          <Item field="excelDentryid" />
          <div style={{ height: '30px', textAlign: 'right' }}>
            备注：获取出库清单模板<a onClick={this.getMoBanFile} style={{ marginLeft: '10px' }}>（点击下载文件）</a>
          </div>
          <div style={{ textAlign: 'center', marginTop: '40px' }}>
            <DebounceFormButton label="下一步" style={{ width: '47%' }} type='primary' onClick={this.nextPage} />
            <Button
              style={{ width: '47%', marginLeft: '10px' }}
              type='default'
              onClick={() => {
                router.replace('/bill-account/deliveryStatement/consignmentDeliveryStatementList');
                this.props.dispatch({
                  type: 'commonStore/deleteTab',
                  payload: { id: this.currentTab.id }
                });
              }}
            >取消
            </Button>
          </div>
        </SchemaForm>
      </div>
    );
  }

  render() {
    const { ready }=this.state;
    return (
      <>
        { ready&&
        this.pageOne()
        }
      </>
    );
  }
}

