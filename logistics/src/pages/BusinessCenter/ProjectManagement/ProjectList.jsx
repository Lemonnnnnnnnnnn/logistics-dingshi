import React, { Component } from 'react';
import { Button, Modal, Tabs, Select } from "antd";
import { connect } from 'dva';
import Link from 'umi/link';
import router from 'umi/router';
import moment from 'moment';
import { Item, SchemaForm, FORM_MODE, Observer } from '@gem-mine/antd-schema-form';
import DebounceFormButton from '../../../components/DebounceFormButton';
import Table from '../../../components/Table/Table';
import model from '../../../models/project';
import shipmentModel from '../../../models/organizations';
import dispatchModel from '../../../models/dispatch';
import { getGoodsName, pick, translatePageType } from "../../../utils/utils";
import { getUserInfo } from '../../../services/user';
import { getStatusConfig, getConsignmentType, getStatus, getConfigurationStatus } from '../../../services/project';
import Authorized from '../../../utils/Authorized';
import { PROJECT_STATUS, IS_FORBID } from '../../../constants/project/project';
import role from '../../../constants/organization/organizationType';
import auth from '../../../constants/authCodes';
import { shipmentAuditeProject, findAllShipment, shipmentDeleteProject, getUser, platRefuseProject, getBusinessType, getTradingSchemesList } from '../../../services/apiService';
import { FilterContextCustom } from '../../../components/Table/FilterContext';
import SearchForm from '../../../components/Table/SearchForm2';
import ShipmentInfo from './subPage/components/ShipmentInfo';
import '@gem-mine/antd-schema-form/lib/fields';

const { TabPane } = Tabs;
const {
  PROJECT_CREATE,
  PROJECT_MODIFY,
  PROJECT_FORBID,
  PROJECT_ENABLE,
  PROJECT_DELETE,
  PROJECT_ASSIGN,
  PROJECT_PLATFORM_REJECT,
  PROJECT_ACCEPT,
  CARRY_LOOK,
  PROJECT_SHIPMENT_REJECT,
  PROJECT_SHIPMENT_REASSIGN,
  CARRY_UPDATE,
  PREBOOKING_VISIT,
  DISPATCH_VISTI,
  LOGISTICS_TYPE_SETTING
} = auth;
const { actions: { getProjects, detailProjects, patchProjects } } = model;
const { actions: { getOrganizations } } = shipmentModel;
const { actions: { postDispatch } } = dispatchModel;

function mapStateToProps (state) {
  return {
    projectDetail: state.project.entity,
    project: pick(state.project, ['items', 'count'])
  };
}

@connect(mapStateToProps, { getProjects, detailProjects, patchProjects, getOrganizations, postDispatch })
@FilterContextCustom
export default class Welcome extends Component {

  organizationType = getUserInfo().organizationType

  tableSchema = {
    variable: true,
    minWidth: 2200,
    columns: [{
      title: '状态',
      dataIndex: 'projectStatus',
      fixed: 'left',
      render: (_, record) => {
        const statusArr = getStatusConfig(record.projectStatus, record.isAvailable);
        return (
          <>
            {statusArr.map((item) =>
              <Authorized authority={item.authority} key={item.key}>
                <span style={{ color: item.color }}>
                  {item.word}
                </span>
              </Authorized>
            )}
          </>
        );
      },
    }, {
      title: '签约配置状态',
      dataIndex: 'configurationStatus',
      fixed: 'left',
      render: (_, record) => {
        if (record.projectStatus === 4) return '--';
        let status;
        if (!record.configurationStatus) {
          status = getConfigurationStatus(2);
        } else {
          status = getConfigurationStatus(record.configurationStatus);
        }
        return (
          <>
            <span style={{ color: status.color }}>
              {status.word}
            </span>
          </>
        );
      },
    }, {
      title: '合同名称',
      dataIndex: 'projectName',
    }, {
      title: '合同编号',
      dataIndex: 'projectNo',
      render: (text) => {
        if (text===null) return '';
        return text;
      },
      width:'200px'
    }, {
      title: '交易模式',
      dataIndex: 'consignmentType',
      render: (consignmentType) => getConsignmentType(consignmentType).word,
    }, {
      title: '承运方式',
      dataIndex: 'shipmentType',
      render: text =>{
        if (text===null) return '';
        return <span>{`${text}` === '1' ? '指定承运' : '委托平台'}</span>;
      },
    }, {
      title: '业务模板',
      dataIndex: 'businessType',
      render: (_, record) =>{
        if (!record.logisticsBusinessTypeEntity) return '--';
        return <span>{record.logisticsBusinessTypeEntity.businessTypeName}</span>;
      },
      visible: this.organizationType === 1
    }, {
      title: '交易方案',
      dataIndex: 'tradingType',
      render: (_, record) =>{
        if (record.configurationStatus === 1) return '--';
        if (!record.logisticsTradingSchemeEntity) return '--';
        return <span>{record.logisticsTradingSchemeEntity.tradingSchemeName}</span>;
      },
      visible: this.organizationType === 1
    }, {
      title: '所属机构',
      dataIndex: 'consignmentName',
    }, {
      title: '客户',
      dataIndex: 'customerName',
      width:'150px'
    }, {
      title: '创建日期',
      dataIndex: 'createTime',
      render: (time) => moment(time).format('YYYY-MM-DD HH:mm:ss')
    }, {
      title: '签订日期',
      dataIndex: 'projectTime',
      render: (time) => {
        if (!time) return '';
        return moment(time).format('YYYY-MM-DD HH:mm:ss');
      },
    }, {
      title: '联系人',
      dataIndex: 'responsibleItems',
      render: text =>{
        if (text===null) return '';
        const responsibleList = text.map(item =>
          <li title={`${item.responsibleName}(${item.responsiblePhone})`} className="test-ellipsis" key={item.responsibleCorrelationId}>
            {`${item.responsibleName}(${item.responsiblePhone})`}
          </li>);
        return <ul style={{ padding: 0, margin: 0 }}>{responsibleList}</ul>;
      },
    }, {
      title: '货品',
      dataIndex: 'goodsItems',
      render: goodsItems => {
        const words = (goodsItems||[]).map(item => getGoodsName(item));
        return <>{words.map(item=><div>{item}</div>)}</>;
      },
      width:'400px'
    }, {
      title: '操作人',
      dataIndex: 'configurationUser',
      render: (_, record) => {
        if (!record.configurationUser) return '--';
        return record.configurationUser;
      }
    }],
    operations: (record) => {
      const rowProjectStatus = getStatus(record.projectStatus, record.isAvailable);
      const detail = {
        title: '详情',
        onClick: (record) => { router.push(`projectManagement/projectDetail?projectId=${record.projectId}`); }
      };

      const consignmentModify = {
        title: '修改',
        onClick: (record) => {
          // 是托运自己的合同
          if (this.organizationType===record.createOrgType){
            router.push(`projectManagement/edit?pageKey=${record.projectName}&projectId=${record.projectId}`);
          // 不是托运自己的合同
          } else {
            if (record.isCustomerAudit === 1) return router.push(`projectManagement/edit?pageKey=${record.projectName}&projectId=${record.projectId}&addContractInfo=1&&a=1`);
            router.push(`projectManagement/edit?pageKey=${record.projectName}&projectId=${record.projectId}&addContractInfo=1`);
          }
        },
        auth: this.organizationType===role.OWNER?[PROJECT_MODIFY]:['hide']
      };

      const cargoModify = {
        title: '修改',
        onClick: (record) => {
          router.push(`projectManagement/edit?projectId=${record.projectId}`);
        },
        auth: this.organizationType===role.CARGOES?[PROJECT_MODIFY]:['hide']
      };

      const addContractInfo = {
        title: '补充合同信息',
        onClick: (record) => { router.push(`projectManagement/edit?projectId=${record.projectId}&addContractInfo=1`); },
        auth: this.organizationType===role.OWNER?[PROJECT_MODIFY]:['hide']
      };

      const platModifyShipment = {
        title: '修改',
        onClick: this.assignedShipment,
        auth: record.shipmentType ? ['hide'] : [PROJECT_ASSIGN]
      };

      const platReject = {
        title: '拒绝', // 平台方拒绝
        confirmMessage: record => `确定拒绝${record.projectName}吗？`,
        // verifyStatus 0为审核不通过 1为审核通过
        onClick: record => {
          platRefuseProject({ verifyObjectType:1, verifyObjectId: record.projectId, verifyReason:'', verifyStatus: 0 })
            .then(()=>this.props.getProjects(this.props.filter));
        },
        auth: record.shipmentType ? ['hide'] : [PROJECT_PLATFORM_REJECT]
      };

      const shipmentReject = {
        title: '拒绝',
        onClick: record => { this.showAuthModal(0, record.projectId); },
        auth: [PROJECT_SHIPMENT_REJECT]
      };

      const assign = {
        title: '指派',
        onClick: this.assignedShipment,
        auth: record.shipmentType ? ['hide'] : [PROJECT_ASSIGN]
      };

      const ban = {
        title: '禁用',
        confirmMessage: record => `确定禁用${record.projectName}吗？`,
        onClick: (record) => this.props.patchProjects({ projectId: record.projectId, isAvailable: IS_FORBID.DISABLE }),
        auth: [PROJECT_FORBID]
      };

      const toPreBooking = {
        title: '预约单',
        onClick: (record) => { router.push(`/buiness-center/preBookingList/preBooking?projectId=${record.projectId}&projectName=${record.projectName}`); },
        auth: [PREBOOKING_VISIT, DISPATCH_VISTI]
      };

      const shipmentReAssign = {
        title: '修改配置',
        onClick: (record) => { router.push(`/buiness-center/project/acceptance?pageKey=${record.projectId}`, { shipmentType: record.shipmentType, pageType: 'update', projectCorrelationId: record.projectCorrelationId }); },
        auth: this.organizationType === 5 ? [CARRY_UPDATE] : [PROJECT_SHIPMENT_REASSIGN]
      };
      const lookReAssign = {
        title: '查看配置',
        onClick: (record) => { router.push(`/buiness-center/project/acceptance?pageKey=${record.projectId}`, { shipmentType: record.shipmentType, pageType: 'look', projectCorrelationId: record.projectCorrelationId }); },
        auth: this.organizationType === 5 ? [CARRY_LOOK]: []
      };

      const platReAssign = {
        title: '修改配置',
        onClick: this.assignedShipment,
        auth: record.shipmentType ? ['hide'] : [PROJECT_ASSIGN]
      };

      const enable = {
        title: '启用',
        confirmMessage: record => `确定启用${record.projectName}吗？`,
        onClick: (record) => this.props.patchProjects({ projectId: record.projectId, isAvailable: IS_FORBID.ENABLE }),
        auth: [PROJECT_ENABLE]
      };

      const shipmentAccept = {
        title: '接受',
        onClick: (record) => { router.push(`/buiness-center/project/acceptance?pageKey=${record.projectId}`, { shipmentType: record.shipmentType, projectCorrelationId: record.projectCorrelationId }); },
        auth: [PROJECT_ACCEPT]
      };

      const deleteWhenPlatformReject = {
        title: '删除',
        confirmMessage: record => `确定删除${record.projectName}吗？`,
        onClick: (record) => {
          // 若是托运方 删除则是逻辑删除,平台拒绝状态，承运流程上是不可见的
          this.props.patchProjects({ projectId: record.projectId, isEffect: 0 })
            .then(() => {
              if (this.props.project.items.length === 1 && this.props.filter.offset !== 0) {
                const newFilter = this.props.setFilter({ ...this.props.filter, offset: this.props.filter.offset - this.props.filter.limit });
                this.setState({
                  [this.state.tabs]: this.state.nowPage - 1
                });
                this.props.getProjects({ ...newFilter });
              } else {
                this.props.getProjects({ ...this.props.filter });
              }
            });
        },
        auth: [PROJECT_DELETE]
      };

      const deleteWhenShipmentReject = {
        title: '删除',
        confirmMessage: record => `确定删除${record.projectName}吗？`,
        // TODO 托运在承运全拒绝的情况下，可以删除项目
        onClick: (record) => {
          // 若是托运方 删除则是逻辑删除
          if (this.organizationType === role.OWNER) {
            this.props.patchProjects({ projectId: record.projectId, isEffect: 0 })
              .then(() => {
                if (this.props.project.items.length === 1 && this.props.filter.offset !== 0) {
                  const newFilter = this.props.setFilter({ ...this.props.filter, offset: this.props.filter.offset - this.props.filter.limit });
                  this.setState({
                    [this.state.tabs]: this.state.nowPage - 1
                  });
                  this.props.getProjects({ ...newFilter });
                } else {
                  this.props.getProjects({ ...this.props.filter });
                }
              });
          } else if (this.organizationType === role.SHIPMENT) {
            shipmentDeleteProject({ projectCorrelationId: record.projectCorrelationId, isEffect: 0 })
              .then(() => {
                if (this.props.project.items.length === 1 && this.props.filter.offset !== 0) {
                  const newFilter = this.props.setFilter({ ...this.props.filter, offset: this.props.filter.offset - this.props.filter.limit });
                  this.setState({
                    [this.state.tabs]: this.state.nowPage - 1
                  });
                  this.props.getProjects({ ...newFilter });
                } else {
                  this.props.getProjects({ ...this.props.filter });
                }
              });
          }
        },
        auth: [PROJECT_DELETE]
      };

      // 如果登录角色是平台，且shipmentType为指定承运方，那么return [detail]
      const operationArr = {
        [PROJECT_STATUS.UNAUDITED]: [detail, consignmentModify, platReject, assign],
        [PROJECT_STATUS.AUDITED]: [detail, consignmentModify, ban, toPreBooking, shipmentReAssign, platModifyShipment, lookReAssign],
        [PROJECT_STATUS.FORBID]: [detail, consignmentModify, toPreBooking, enable],
        [PROJECT_STATUS.REFUSE]: [detail, consignmentModify, deleteWhenPlatformReject],
        [PROJECT_STATUS.SHIPMENT_UNAUDITED]: [detail, consignmentModify, shipmentAccept, shipmentReject, platReAssign],
        [PROJECT_STATUS.SHIPMENT_REFUSE]: [detail, platReject, platReAssign, consignmentModify, deleteWhenShipmentReject],
        [PROJECT_STATUS.CUSTOMER_UNAUDITED]: [detail, cargoModify],
        [PROJECT_STATUS.CUSTOMER_REFUSE]: [detail, cargoModify],
        [PROJECT_STATUS.CUSTOMER_AUDITED]: [detail, addContractInfo]
      }[rowProjectStatus];
      if (rowProjectStatus !== PROJECT_STATUS.REFUSE && rowProjectStatus !== PROJECT_STATUS.SHIPMENT_REFUSE && rowProjectStatus !== PROJECT_STATUS.CUSTOMER_REFUSE && rowProjectStatus !== PROJECT_STATUS.FORBID) {
        if (record.configurationStatus === 2) {
          operationArr.push({
            title: '交易配置',
            onClick: (record) => {
              router.push(`projectManagement/setting?pageKey=${record.projectId}&projectId=${record.projectId}`);
            },
            auth: [LOGISTICS_TYPE_SETTING]
          });
        }
      }
      return operationArr;
    }
  }

  shipmentFormSchema = {
    projectName: {
      label: '合同名称',
      component: Observer({
        watch:'*mode',
        action:mode=>mode===FORM_MODE.MODIFY?'input.text':'input'
      }),
      rules:{
        required: true
      }
    },
    shipmentItems: {
      label: '承运方信息',
      component: ShipmentInfo,
      shipmentType: 1,
      rules:{
        required:[true, '请添加承运方信息'],
      },
      getMode: () => FORM_MODE.ADD,
      options: async () => {
        const { items: shipmentItems } = await findAllShipment( { limit:1000, offset:0 } );
        return shipmentItems;
      },
    },
    readMe: {
      component: 'radio',
      options: [{
        key: 0,
        label: <span>已读<a onClick={()=>{ window.open('/agreement'); }}>《合同协议书》</a></span>,
        value: 0
      }],
      rules:{
        required: [true, '请先确认阅读合同协议书']
      }
    }
  }

  constructor (props) {
    super(props);
    const formSchema = {
      dispatchUserId: {
        label: '调度人员',
        component: DIYSelect,
        rules:{
          required: true
        },
        options: async () => {
          const { items = [] } = await getUser({ accountType: 3, isAvailable:true, limit:1000, offset:0 });
          const result = items.map(item => ({
            key: item.userId,
            title: item.nickName,
            value: item.userId,
            label: item.nickName
          }));
          return result;
        },
        _mode : 'multiple',
        placeholder: '请选择调度人员',
      },
      shipmentBillMode: {
        label: '开票方式',
        placeholder: '请选择开票方式',
        component: DIYSelect,
        rules:{
          required: true
        },
        _mode : null,
        dropdownStyle: {
          width:'350px'
        },
        dropdownMatchSelectWidth: false,
        options: [
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
      },
      verifyReason: {
        label: '原因',
        rules:{
          required: true
        },
        component: 'input.textArea',
        placeholder: '请输入拒绝原因',
      }
    };
    this.state = {
      showShipmentModal: false,
      visible: false,
      mode: FORM_MODE.ADD,
      formSchema,
      tabs: 'all',
      ready: false,
      all: 1,
      own: 1,
      ownPageSize: 10,
      allPageSize: 10
    };
  }

  componentDidMount () {
    const { getProjects, filter } = this.props;
    const { shipmentType = 1, offset, limit } = filter;
    if (this.organizationType === 1) {
      Promise.all([getProjects(filter), getBusinessType({ limit: 10000, offset: 0 }), getTradingSchemesList({ limit: 10000, offset: 0 })]).then(res => {
        this.searchFormSchema = {
          status:{
            label: '状态',
            component: 'select',
            placeholder: '请选择合同状态',
            options: [{
              label: '平台已拒绝',
              value: PROJECT_STATUS.REFUSE,
              key: PROJECT_STATUS.REFUSE,
            }, {
              label: '已审核',
              value: PROJECT_STATUS.AUDITED,
              key: PROJECT_STATUS.AUDITED,
            }, {
              label: '平台待审核',
              value: PROJECT_STATUS.UNAUDITED,
              key: PROJECT_STATUS.UNAUDITED,
            }, {
              label: '承运待审核',
              value: PROJECT_STATUS.SHIPMENT_UNAUDITED,
              key: PROJECT_STATUS.SHIPMENT_UNAUDITED
            }, {
              label: '承运已拒绝',
              value: PROJECT_STATUS.SHIPMENT_REFUSE,
              key: PROJECT_STATUS.SHIPMENT_REFUSE
            }, {
              label: '禁用',
              value: PROJECT_STATUS.FORBID,
              key: PROJECT_STATUS.FORBID,
            }]
          },
          projectName:{
            label: '搜索',
            placeholder: '请输入合同名称',
            component: 'input'
          },
          businessTypeId: {
            label: '业务类型',
            component: 'select',
            props:{
              showSearch: true,
              optionFilterProp: 'label'
            },
            placeholder: '请选择业务类型',
            options: res[1].items.map(item => ({
              value: item.businessTypeId,
              label: item.businessTypeName,
              key: item.businessTypeId
            }))
          },
          tradingSchemeId: {
            label: '交易方案',
            props:{
              showSearch: true,
              optionFilterProp: 'label'
            },
            component: 'select',
            placeholder: '请选择交易方案',
            options: res[2].items.map(item => ({
              value: item.tradingSchemeId,
              label: item.tradingSchemeName,
              key: item.tradingSchemeName
            }))
          },
          shipmentType: {
            label: '承运方式',
            component: 'select',
            placeholder: '请选择承运方式',
            options : [
              {
                label : '委托平台',
                value : 0,
                key : 0,
              },
              {
                label : '指定承运',
                value : 1,
                key : 1,
              },
            ]
          },
          consignmentName: {
            label: '托运单位',
            component: 'input',
            placeholder: '请输入托运单位',
          },
          shipmentName: {
            label: '承运单位',
            component: 'input',
            placeholder: '请输入承运单位',
          },

        };
        this.setState({
          tabs:shipmentType===1?'all':'own',
          [shipmentType===1?'all':'own']:offset/limit+1,
          [`${shipmentType===1?'all':'own'}PageSize`]:limit,
          ready: true
        });
      });
    } else {
      getProjects(filter)
        .then(()=>{
          this.searchFormSchema = {
            status:{
              label: '状态',
              component: 'select',
              placeholder: '请选择合同状态',
              options: [{
                label: '平台已拒绝',
                value: PROJECT_STATUS.REFUSE,
                key: PROJECT_STATUS.REFUSE,
              }, {
                label: '已审核',
                value: PROJECT_STATUS.AUDITED,
                key: PROJECT_STATUS.AUDITED,
              }, {
                label: '平台待审核',
                value: PROJECT_STATUS.UNAUDITED,
                key: PROJECT_STATUS.UNAUDITED,
              }, {
                label: '承运待审核',
                value: PROJECT_STATUS.SHIPMENT_UNAUDITED,
                key: PROJECT_STATUS.SHIPMENT_UNAUDITED
              }, {
                label: '承运已拒绝',
                value: PROJECT_STATUS.SHIPMENT_REFUSE,
                key: PROJECT_STATUS.SHIPMENT_REFUSE
              }, {
                label: '禁用',
                value: PROJECT_STATUS.FORBID,
                key: PROJECT_STATUS.FORBID,
              }]
            },
            projectName:{
              label: '搜索',
              placeholder: '请输入合同名称',
              component: 'input'
            },
          };
          this.setState({
            ready: true,
            tabs: shipmentType===1 ? 'all':'own',
            [shipmentType===1?'all':'own']:offset/limit+1,
            [`${shipmentType===1?'all':'own'}PageSize`]:limit
          });
        });
    }
  }

  // 指派承运方
  assignedShipment = ({ projectId }) => {
    const { detailProjects } = this.props;

    detailProjects({ projectId })
      .then(this.showAssignShipmentModal);
  }

  onChange = (pagination) => {
    const { offset, limit, current } = translatePageType(pagination);
    this.setState({
      [this.state.tabs]: current,
      [`${this.state.tabs}PageSize`]: limit
    }, () => {
      const newFilter = this.props.setFilter({ ...this.props.filter, offset, limit });
      this.props.getProjects({ ...newFilter });
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
    return (
      <SearchForm layout="inline" mode={FORM_MODE.SEARCH} schema={this.searchFormSchema}>
        <Item field="projectName" {...layout} />
        <Item field="status" {...layout} />
        {
          this.organizationType === 1?
            <>
              <Item field="businessTypeId" {...layout} />
              <Item field="tradingSchemeId" {...layout} />
              <Item field='shipmentType' {...layout} />
              <Item field='consignmentName' {...layout} />
              <Item field='shipmentName' {...layout} />
            </>
            :
            null
        }
        <DebounceFormButton label="查询" className="mr-10" type="primary" onClick={this.handleSearchBtnClick} />
        <DebounceFormButton label="重置" type="reset" onClick={this.handleResetBtnClick} />
      </SearchForm>
    );
  }

  handleSearchBtnClick = value => {
    this.setState({
      [this.state.tabs]: 1
    }, () => this.onSearch({ ...this.props.filter, offset: 0, ...value }));
  }

  onSearch = value => {
    let params = value;
    if (value.status === PROJECT_STATUS.FORBID) {
      params = { ...value, isAvailable: false, projectStatus:undefined };
    } else if (value.status || value.status === PROJECT_STATUS.REFUSE) {
      params = { ...value, isAvailable: true, projectStatus:value.status };
    }
    const newFilter = this.props.setFilter({ ...params });
    this.props.getProjects({ ...newFilter });
  }

  handleResetBtnClick = () => {
    const newFilter = this.props.resetFilter({ shipmentType: this.state.tabs === 'all' ? undefined : 0 });
    this.setState({
      [this.state.tabs]: 1,
      [`${this.state.tabs}PageSize`]: 10
    });
    this.props.getProjects({ ...newFilter });
  }

  handleCancel = () => {
    this.setState({
      visible: false,
      showShipmentModal: false
    });
  }

  showAuthModal = (operation, projectId, reassign = false) => {
    this.setState({
      visible: true,
      operation,
      projectId,
      reassign
    });
  }

  showAssignShipmentModal = () => this.setState({ showShipmentModal: true })

  changeTabs = activeKey => {
    const newFilter = this.props.setFilter({
      shipmentType: activeKey === 'all' ? undefined : 0,
      limit: this.state[`${activeKey}PageSize`],
      projectName:undefined,
      isAvailable: undefined,
      projectStatus:undefined,
      status:undefined
    });
    this.setState({
      tabs: activeKey
    }, () => {
      const { getProjects } = this.props;
      getProjects({ ...newFilter, offset: (this.state[activeKey] - 1) * newFilter.limit });
    });
  }

  handleCancelBtnClick = () => {
    this.setState({
      showShipmentModal: false
    });
  }

  handleConfirmBtnClick = value => {
    // 平台指派的保存按钮
    const { projectDetail: { projectId }, postDispatch, getProjects } = this.props;
    value.projectId = projectId;
    value.shipmentItems = value.shipmentItems.map(item => ({ shipmentOrganizationId:item.shipmentOrganizationId, isAvailable:item.isAvailable, auditStatus:item.auditStatus }));
    delete value.projectName;
    delete value.readMe;
    postDispatch({ ...value, })
      .then(() => {
        this.setState({
          showShipmentModal: false
        });
        getProjects({ ...this.props.filter });
      });
  }

  renderAssignShipmentModal () {
    const { projectDetail } = this.props;
    const { showShipmentModal } = this.state;
    const formLayout = {
      labelCol: {
        xs: { span: 24 },
      },
      wrapperCol: {
        xs: { span: 24 },
      }
    };

    return (
      <Modal
        title="指派承运方"
        width={800}
        visible={showShipmentModal}
        onCancel={this.handleCancel}
        centered
        footer={null}
        destroyOnClose
      >
        <SchemaForm layout="vertical" data={projectDetail} {...formLayout} mode={FORM_MODE.MODIFY} schema={this.shipmentFormSchema}>
          <Item field="projectName" />
          <Item field="shipmentItems" />
          <Item field="readMe" />
          <div style={{ paddingRight:'20px', textAlign:'right' }}>
            <Button className="mr-10" onClick={this.handleCancel}>取消</Button>
            <DebounceFormButton validate label="确定" type="primary" onClick={this.handleConfirmBtnClick} />
          </div>
        </SchemaForm>
      </Modal>
    );
  }

  renderAssignForm = () =>{
    const { operation, formSchema, reassign, mode } = this.state;
    let ressign;
    const handleConfirmBtnClick = value => {
      shipmentAuditeProject({ ...value, dispatchUserId : value.dispatchUserId?.join(','), auditStatus: this.state.operation, projectId: this.state.projectId })
        .then(() => {
          this.setState({
            visible: false,
          });
          return this.props.getProjects({ ...this.props.filter });
        });
    };

    if (operation){
      if (reassign){
        ressign = (
          <SchemaForm mode={mode} schema={formSchema}>
            <Item field="dispatchUserId" />
            <div style={{ paddingRight: '20px', textAlign: 'right' }}>
              <Button className="mr-10" onClick={this.handleCancel}> 取消</Button>
              <DebounceFormButton label="确定" type="primary" onClick={handleConfirmBtnClick} />
            </div>
          </SchemaForm>
        );
      } else {
        ressign = (
          <SchemaForm mode={mode} schema={formSchema}>
            <Item field="dispatchUserId" />
            <Item field="shipmentBillMode" />
            <div style={{ paddingRight: '20px', textAlign: 'right' }}>
              <Button className="mr-10" onClick={this.handleCancel}> 取消</Button>
              <DebounceFormButton label="确定" type="primary" onClick={handleConfirmBtnClick} />
            </div>
          </SchemaForm>
        );
      }
    } else {
      ressign = (
        <SchemaForm mode={mode} schema={formSchema}>
          <Item field="verifyReason" />
          <div style={{ paddingRight: '20px', textAlign: 'right' }}>
            <Button className="mr-10" onClick={this.handleCancel}> 取消</Button>
            <DebounceFormButton label="确定" type="primary" onClick={handleConfirmBtnClick} />
          </div>
        </SchemaForm>
      );
    }
    return ressign;
  }

  render () {
    const { project } = this.props;
    const { operation, visible, all = 1, own = 1, ownPageSize = 10, allPageSize = 10, tabs, ready } = this.state;
    return (
      ready
      &&
      <>
        {this.renderAssignShipmentModal()}
        <Modal
          centered
          title={operation ? "接受合同" : "拒绝合同"}
          visible={visible}
          onCancel={this.handleCancel}
          footer={null}
          destroyOnClose
        >
          {this.renderAssignForm()}
        </Modal>
        <Tabs type='card' defaultActiveKey="all" activeKey={tabs} onChange={this.changeTabs}>
          <TabPane tab='全部合同' key='all'>
            <div>
              <Authorized authority={[PROJECT_CREATE]}>
                <Link to="projectManagement/createProject">
                  <Button type="primary">+ 新建合同</Button>
                </Link>
              </Authorized>
            </div>
            <Table
              schema={this.tableSchema}
              rowKey="projectId"
              renderCommonOperate={this.searchTableList}
              pagination={{ current: all, pageSize: allPageSize }}
              onChange={this.onChange}
              dataSource={project}
            />
          </TabPane>
          <TabPane tab='委托合同' key='own'>
            <div>
              <Authorized authority={[PROJECT_CREATE]}>
                <Button type="primary"><Link to="projectManagement/createProject">+ 新建合同</Link></Button>
              </Authorized>
            </div>
            <Table
              schema={this.tableSchema}
              rowKey="projectId"
              renderCommonOperate={this.searchTableList}
              pagination={{ current: own, pageSize: ownPageSize }}
              onChange={this.onChange}
              dataSource={project}
            />
          </TabPane>
        </Tabs>
      </>
    );
  }
}

class DIYSelect extends Component {

  renderOptions = () => {
    const { options } = this.props;
    return options.map(item => <Select.Option {...item}>{item.label}</Select.Option>);
  }

  render (){
    const { placeholder, onChange, dropdownStyle, dropdownMatchSelectWidth, _mode } = this.props;
    return (
      <Select mode={_mode} placeholder={placeholder} dropdownMatchSelectWidth={dropdownMatchSelectWidth} dropdownStyle={dropdownStyle} onChange={onChange}>
        {this.renderOptions()}
      </Select>
    );
  }
}
