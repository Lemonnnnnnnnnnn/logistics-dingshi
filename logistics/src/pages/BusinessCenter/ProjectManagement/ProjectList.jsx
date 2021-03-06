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
      title: '??????',
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
      title: '??????????????????',
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
      title: '????????????',
      dataIndex: 'projectName',
    }, {
      title: '????????????',
      dataIndex: 'projectNo',
      render: (text) => {
        if (text===null) return '';
        return text;
      },
      width:'200px'
    }, {
      title: '????????????',
      dataIndex: 'consignmentType',
      render: (consignmentType) => getConsignmentType(consignmentType).word,
    }, {
      title: '????????????',
      dataIndex: 'shipmentType',
      render: text =>{
        if (text===null) return '';
        return <span>{`${text}` === '1' ? '????????????' : '????????????'}</span>;
      },
    }, {
      title: '????????????',
      dataIndex: 'businessType',
      render: (_, record) =>{
        if (!record.logisticsBusinessTypeEntity) return '--';
        return <span>{record.logisticsBusinessTypeEntity.businessTypeName}</span>;
      },
      visible: this.organizationType === 1
    }, {
      title: '????????????',
      dataIndex: 'tradingType',
      render: (_, record) =>{
        if (record.configurationStatus === 1) return '--';
        if (!record.logisticsTradingSchemeEntity) return '--';
        return <span>{record.logisticsTradingSchemeEntity.tradingSchemeName}</span>;
      },
      visible: this.organizationType === 1
    }, {
      title: '????????????',
      dataIndex: 'consignmentName',
    }, {
      title: '??????',
      dataIndex: 'customerName',
      width:'150px'
    }, {
      title: '????????????',
      dataIndex: 'createTime',
      render: (time) => moment(time).format('YYYY-MM-DD HH:mm:ss')
    }, {
      title: '????????????',
      dataIndex: 'projectTime',
      render: (time) => {
        if (!time) return '';
        return moment(time).format('YYYY-MM-DD HH:mm:ss');
      },
    }, {
      title: '?????????',
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
      title: '??????',
      dataIndex: 'goodsItems',
      render: goodsItems => {
        const words = (goodsItems||[]).map(item => getGoodsName(item));
        return <>{words.map(item=><div>{item}</div>)}</>;
      },
      width:'400px'
    }, {
      title: '?????????',
      dataIndex: 'configurationUser',
      render: (_, record) => {
        if (!record.configurationUser) return '--';
        return record.configurationUser;
      }
    }],
    operations: (record) => {
      const rowProjectStatus = getStatus(record.projectStatus, record.isAvailable);
      const detail = {
        title: '??????',
        onClick: (record) => { router.push(`projectManagement/projectDetail?projectId=${record.projectId}`); }
      };

      const consignmentModify = {
        title: '??????',
        onClick: (record) => {
          // ????????????????????????
          if (this.organizationType===record.createOrgType){
            router.push(`projectManagement/edit?pageKey=${record.projectName}&projectId=${record.projectId}`);
          // ???????????????????????????
          } else {
            if (record.isCustomerAudit === 1) return router.push(`projectManagement/edit?pageKey=${record.projectName}&projectId=${record.projectId}&addContractInfo=1&&a=1`);
            router.push(`projectManagement/edit?pageKey=${record.projectName}&projectId=${record.projectId}&addContractInfo=1`);
          }
        },
        auth: this.organizationType===role.OWNER?[PROJECT_MODIFY]:['hide']
      };

      const cargoModify = {
        title: '??????',
        onClick: (record) => {
          router.push(`projectManagement/edit?projectId=${record.projectId}`);
        },
        auth: this.organizationType===role.CARGOES?[PROJECT_MODIFY]:['hide']
      };

      const addContractInfo = {
        title: '??????????????????',
        onClick: (record) => { router.push(`projectManagement/edit?projectId=${record.projectId}&addContractInfo=1`); },
        auth: this.organizationType===role.OWNER?[PROJECT_MODIFY]:['hide']
      };

      const platModifyShipment = {
        title: '??????',
        onClick: this.assignedShipment,
        auth: record.shipmentType ? ['hide'] : [PROJECT_ASSIGN]
      };

      const platReject = {
        title: '??????', // ???????????????
        confirmMessage: record => `????????????${record.projectName}??????`,
        // verifyStatus 0?????????????????? 1???????????????
        onClick: record => {
          platRefuseProject({ verifyObjectType:1, verifyObjectId: record.projectId, verifyReason:'', verifyStatus: 0 })
            .then(()=>this.props.getProjects(this.props.filter));
        },
        auth: record.shipmentType ? ['hide'] : [PROJECT_PLATFORM_REJECT]
      };

      const shipmentReject = {
        title: '??????',
        onClick: record => { this.showAuthModal(0, record.projectId); },
        auth: [PROJECT_SHIPMENT_REJECT]
      };

      const assign = {
        title: '??????',
        onClick: this.assignedShipment,
        auth: record.shipmentType ? ['hide'] : [PROJECT_ASSIGN]
      };

      const ban = {
        title: '??????',
        confirmMessage: record => `????????????${record.projectName}??????`,
        onClick: (record) => this.props.patchProjects({ projectId: record.projectId, isAvailable: IS_FORBID.DISABLE }),
        auth: [PROJECT_FORBID]
      };

      const toPreBooking = {
        title: '?????????',
        onClick: (record) => { router.push(`/buiness-center/preBookingList/preBooking?projectId=${record.projectId}&projectName=${record.projectName}`); },
        auth: [PREBOOKING_VISIT, DISPATCH_VISTI]
      };

      const shipmentReAssign = {
        title: '????????????',
        onClick: (record) => { router.push(`/buiness-center/project/acceptance?pageKey=${record.projectId}`, { shipmentType: record.shipmentType, pageType: 'update', projectCorrelationId: record.projectCorrelationId }); },
        auth: this.organizationType === 5 ? [CARRY_UPDATE] : [PROJECT_SHIPMENT_REASSIGN]
      };
      const lookReAssign = {
        title: '????????????',
        onClick: (record) => { router.push(`/buiness-center/project/acceptance?pageKey=${record.projectId}`, { shipmentType: record.shipmentType, pageType: 'look', projectCorrelationId: record.projectCorrelationId }); },
        auth: this.organizationType === 5 ? [CARRY_LOOK]: []
      };

      const platReAssign = {
        title: '????????????',
        onClick: this.assignedShipment,
        auth: record.shipmentType ? ['hide'] : [PROJECT_ASSIGN]
      };

      const enable = {
        title: '??????',
        confirmMessage: record => `????????????${record.projectName}??????`,
        onClick: (record) => this.props.patchProjects({ projectId: record.projectId, isAvailable: IS_FORBID.ENABLE }),
        auth: [PROJECT_ENABLE]
      };

      const shipmentAccept = {
        title: '??????',
        onClick: (record) => { router.push(`/buiness-center/project/acceptance?pageKey=${record.projectId}`, { shipmentType: record.shipmentType, projectCorrelationId: record.projectCorrelationId }); },
        auth: [PROJECT_ACCEPT]
      };

      const deleteWhenPlatformReject = {
        title: '??????',
        confirmMessage: record => `????????????${record.projectName}??????`,
        onClick: (record) => {
          // ??????????????? ????????????????????????,???????????????????????????????????????????????????
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
        title: '??????',
        confirmMessage: record => `????????????${record.projectName}??????`,
        // TODO ?????????????????????????????????????????????????????????
        onClick: (record) => {
          // ??????????????? ????????????????????????
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

      // ?????????????????????????????????shipmentType???????????????????????????return [detail]
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
            title: '????????????',
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
      label: '????????????',
      component: Observer({
        watch:'*mode',
        action:mode=>mode===FORM_MODE.MODIFY?'input.text':'input'
      }),
      rules:{
        required: true
      }
    },
    shipmentItems: {
      label: '???????????????',
      component: ShipmentInfo,
      shipmentType: 1,
      rules:{
        required:[true, '????????????????????????'],
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
        label: <span>??????<a onClick={()=>{ window.open('/agreement'); }}>?????????????????????</a></span>,
        value: 0
      }],
      rules:{
        required: [true, '?????????????????????????????????']
      }
    }
  }

  constructor (props) {
    super(props);
    const formSchema = {
      dispatchUserId: {
        label: '????????????',
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
        placeholder: '?????????????????????',
      },
      shipmentBillMode: {
        label: '????????????',
        placeholder: '?????????????????????',
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
      },
      verifyReason: {
        label: '??????',
        rules:{
          required: true
        },
        component: 'input.textArea',
        placeholder: '?????????????????????',
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
            label: '??????',
            component: 'select',
            placeholder: '?????????????????????',
            options: [{
              label: '???????????????',
              value: PROJECT_STATUS.REFUSE,
              key: PROJECT_STATUS.REFUSE,
            }, {
              label: '?????????',
              value: PROJECT_STATUS.AUDITED,
              key: PROJECT_STATUS.AUDITED,
            }, {
              label: '???????????????',
              value: PROJECT_STATUS.UNAUDITED,
              key: PROJECT_STATUS.UNAUDITED,
            }, {
              label: '???????????????',
              value: PROJECT_STATUS.SHIPMENT_UNAUDITED,
              key: PROJECT_STATUS.SHIPMENT_UNAUDITED
            }, {
              label: '???????????????',
              value: PROJECT_STATUS.SHIPMENT_REFUSE,
              key: PROJECT_STATUS.SHIPMENT_REFUSE
            }, {
              label: '??????',
              value: PROJECT_STATUS.FORBID,
              key: PROJECT_STATUS.FORBID,
            }]
          },
          projectName:{
            label: '??????',
            placeholder: '?????????????????????',
            component: 'input'
          },
          businessTypeId: {
            label: '????????????',
            component: 'select',
            props:{
              showSearch: true,
              optionFilterProp: 'label'
            },
            placeholder: '?????????????????????',
            options: res[1].items.map(item => ({
              value: item.businessTypeId,
              label: item.businessTypeName,
              key: item.businessTypeId
            }))
          },
          tradingSchemeId: {
            label: '????????????',
            props:{
              showSearch: true,
              optionFilterProp: 'label'
            },
            component: 'select',
            placeholder: '?????????????????????',
            options: res[2].items.map(item => ({
              value: item.tradingSchemeId,
              label: item.tradingSchemeName,
              key: item.tradingSchemeName
            }))
          },
          shipmentType: {
            label: '????????????',
            component: 'select',
            placeholder: '?????????????????????',
            options : [
              {
                label : '????????????',
                value : 0,
                key : 0,
              },
              {
                label : '????????????',
                value : 1,
                key : 1,
              },
            ]
          },
          consignmentName: {
            label: '????????????',
            component: 'input',
            placeholder: '?????????????????????',
          },
          shipmentName: {
            label: '????????????',
            component: 'input',
            placeholder: '?????????????????????',
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
              label: '??????',
              component: 'select',
              placeholder: '?????????????????????',
              options: [{
                label: '???????????????',
                value: PROJECT_STATUS.REFUSE,
                key: PROJECT_STATUS.REFUSE,
              }, {
                label: '?????????',
                value: PROJECT_STATUS.AUDITED,
                key: PROJECT_STATUS.AUDITED,
              }, {
                label: '???????????????',
                value: PROJECT_STATUS.UNAUDITED,
                key: PROJECT_STATUS.UNAUDITED,
              }, {
                label: '???????????????',
                value: PROJECT_STATUS.SHIPMENT_UNAUDITED,
                key: PROJECT_STATUS.SHIPMENT_UNAUDITED
              }, {
                label: '???????????????',
                value: PROJECT_STATUS.SHIPMENT_REFUSE,
                key: PROJECT_STATUS.SHIPMENT_REFUSE
              }, {
                label: '??????',
                value: PROJECT_STATUS.FORBID,
                key: PROJECT_STATUS.FORBID,
              }]
            },
            projectName:{
              label: '??????',
              placeholder: '?????????????????????',
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

  // ???????????????
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
        <DebounceFormButton label="??????" className="mr-10" type="primary" onClick={this.handleSearchBtnClick} />
        <DebounceFormButton label="??????" type="reset" onClick={this.handleResetBtnClick} />
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
    // ???????????????????????????
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
        title="???????????????"
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
            <Button className="mr-10" onClick={this.handleCancel}>??????</Button>
            <DebounceFormButton validate label="??????" type="primary" onClick={this.handleConfirmBtnClick} />
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
              <Button className="mr-10" onClick={this.handleCancel}> ??????</Button>
              <DebounceFormButton label="??????" type="primary" onClick={handleConfirmBtnClick} />
            </div>
          </SchemaForm>
        );
      } else {
        ressign = (
          <SchemaForm mode={mode} schema={formSchema}>
            <Item field="dispatchUserId" />
            <Item field="shipmentBillMode" />
            <div style={{ paddingRight: '20px', textAlign: 'right' }}>
              <Button className="mr-10" onClick={this.handleCancel}> ??????</Button>
              <DebounceFormButton label="??????" type="primary" onClick={handleConfirmBtnClick} />
            </div>
          </SchemaForm>
        );
      }
    } else {
      ressign = (
        <SchemaForm mode={mode} schema={formSchema}>
          <Item field="verifyReason" />
          <div style={{ paddingRight: '20px', textAlign: 'right' }}>
            <Button className="mr-10" onClick={this.handleCancel}> ??????</Button>
            <DebounceFormButton label="??????" type="primary" onClick={handleConfirmBtnClick} />
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
          title={operation ? "????????????" : "????????????"}
          visible={visible}
          onCancel={this.handleCancel}
          footer={null}
          destroyOnClose
        >
          {this.renderAssignForm()}
        </Modal>
        <Tabs type='card' defaultActiveKey="all" activeKey={tabs} onChange={this.changeTabs}>
          <TabPane tab='????????????' key='all'>
            <div>
              <Authorized authority={[PROJECT_CREATE]}>
                <Link to="projectManagement/createProject">
                  <Button type="primary">+ ????????????</Button>
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
          <TabPane tab='????????????' key='own'>
            <div>
              <Authorized authority={[PROJECT_CREATE]}>
                <Button type="primary"><Link to="projectManagement/createProject">+ ????????????</Link></Button>
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
