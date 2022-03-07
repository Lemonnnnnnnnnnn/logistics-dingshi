import React, { Component } from 'react';
import { Button, Row, Modal, Popover, Select, notification, message } from 'antd';
import CSSModules from 'react-css-modules';
import { SchemaForm, Item, FormButton } from '@gem-mine/antd-schema-form';
import { connect } from 'dva';
import moment from 'moment';
import DebounceFormButton from '@/components/DebounceFormButton';
import model from '@/models/contracts';
import TableContainer from '@/components/Table/TableContainer';
import Table from '@/components/Table/Table';
import { getNetworkContractStatus, getContractType, getContractOSSFileKey } from '@/services/project';
import auth from '@/constants/authCodes';
import Authorized from '@/utils/Authorized';
import { NETWORK_CONTRACT_LIST_STATUS, IS_AVAILABLE } from '@/constants/project/project';
import { getUserInfo } from '@/services/user';
import styles from './FreightContract.less';
import UploadFile from '@/components/Upload/UploadFile';
import '@gem-mine/antd-schema-form/lib/fields';
import { signContract, patchContract, contractCorrelation, getOSSToken } from '@/services/apiService';
import { pick, translatePageType, getOssFile } from '@/utils/utils';

const {
  TRANSPORT_CONTRACT_CREATE,
  TRANSPORT_CONTRACT_BIND,
  TRANSPORT_CONTRACT_REHANDLE,
  TRANSPORT_CONTRACT_UPLOAD,
  TRANSPORT_CONTRACT_JUDGE
} = auth;

function getAccessInfo () {
  return getOSSToken();
}

const { actions: { getContracts, getAllProject } } = model;

function mapStateToProps (state) {
  return {
    contracts: pick(state.contracts, ['items', 'count']),
    project: state.contracts.project || []
  };
}
@connect(mapStateToProps, { getContracts, getAllProject })
@TableContainer()
@CSSModules(styles, { allowMultiple: true })
class Contract extends Component {
  organizationType= getUserInfo().organizationType // 3为货权 4为托运  5为承运

  organizationName= getUserInfo().organizationName

  constructor (props) {
    super(props);
    const tableSchema = {
      variable:true,
      minWidth:1700,
      columns: [
        {
          title: '合同状态',
          dataIndex: 'contractState',
          fixed:'left',
          width:'150px',
          render: (text, record) => {
            const status = record.isAvailable? getNetworkContractStatus(record.contractState, this.organizationType): { word: '● 禁用', color: 'gray' };
            return (
              <span style={{ color: status.color }}>
                {status.word}
              </span>
            );
          }
        }, {
          title: '合同类型',
          dataIndex: 'contractType',
          width: '180px',
          fixed:'left',
          render: (text, record) => (
            <span>{getContractType(record.contractType)}</span>
          )
        }, {
          title: '合同名称',
          dataIndex: 'contractName',
          width: '300px'
        }, {
          title: '上传时间',
          dataIndex: 'contractUploadTime',
          render: text => text?moment(text).format('YYYY-MM-DD HH:mm'):'--',
          width: '250px'
        }, {
          title: '关联项目',
          dataIndex: 'items',
          render: (text, record) => {
            const { projectList } = record;
            if (!projectList || projectList.length === 0) return '--';
            const projectListName = projectList.map(item => item.projectName).join('、');
            const content = (
              <div>
                {projectList.map(item => <p key={item.projectId}>{item.projectName}</p>)}
              </div>
            );
            return (
              <Popover content={content} placement="topLeft">
                <span style={{ width: '600px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', display: 'inline-block' }} placement="topLeft" content={projectListName}>
                  {projectListName}
                </span>
              </Popover>
            );
          }
        }
      ],
      operations: (record) => {
        const downLoad = {
          title: '下载',
          onClick: (record) => {
            const { contractDentryid } = record;
            getAccessInfo()
              .then(accessInfo => {
                getOssFile(accessInfo, contractDentryid);
              });
          },
          confirmMessage: () => `确定下载该合同吗？`,
          display: [1, 5],
          auth: [TRANSPORT_CONTRACT_UPLOAD]
        };
        if (!record.isAvailable) {
          const operations = {
            title: '启用',
            onClick: (record) => {
              patchContract(record.contractId, { isAvailable: IS_AVAILABLE.ENABLE }).then(() => {
                this.refresh();
                notification.success({
                  message: '成功',
                  description:
                    '已启用该合同！',
                });
              });
            },
            confirmMessage: () => `确定启用该合同吗？`,
            display: [1],
            auth: [TRANSPORT_CONTRACT_JUDGE]
          };
          // const relative = {
          //   title: '关联项目',
          //   onClick: (record) => {
          //     this.state.contractId = record.contractId;
          //     this.showRelatedForm();
          //   },
          //   display: [5],
          //   auth:[TRANSPORT_CONTRACT_BIND]
          // };
          return [downLoad, operations].filter(item => item.display.indexOf(Number(this.organizationType)) !== -1 );
        }
        const operations = {
          [NETWORK_CONTRACT_LIST_STATUS.UNAUDITED]: [
            {
              title: '通过',
              onClick: (record) => {
                patchContract(record.contractId, { contractState: NETWORK_CONTRACT_LIST_STATUS.AUDITED }).then(() => {
                  this.refresh();
                  notification.success({
                    message: '成功',
                    description:
                      '已通过该合同！',
                  });
                });
              },
              confirmMessage: () => `确定通过该合同吗？`,
              display: [1],
              auth: [TRANSPORT_CONTRACT_JUDGE]
            },
            {
              title: '拒绝',
              onClick: (record) => {
                this.setState({
                  visible: true,
                  title: '请填写拒绝理由',
                  formMode: 'reject',
                  contractId: record.contractId
                });
              },
              display: [1],
              auth: [TRANSPORT_CONTRACT_JUDGE]
            },
          ],
          [NETWORK_CONTRACT_LIST_STATUS.AUDITED]: [
            // {
            //   title: '关联项目',
            //   onClick: (record) => {
            //     this.state.contractId = record.contractId;
            //     this.showRelatedForm();
            //   },
            //   display: [5],
            //   auth: [TRANSPORT_CONTRACT_BIND]
            // },
            {
              title: '禁用',
              onClick: (record) => {
                patchContract(record.contractId, { isAvailable: IS_AVAILABLE.DISABLE }).then(() => {
                  this.refresh();
                  notification.success({
                    message: '成功',
                    description: '已禁用该合同！',
                  });
                });
              },
              confirmMessage: () => `确定禁用该合同吗？`,
              display: [1],
              auth: [TRANSPORT_CONTRACT_JUDGE]
            },
          ],
          [NETWORK_CONTRACT_LIST_STATUS.REFUSE]: [
            {
              title: '重新提交',
              onClick: (record) => {
                this.setState({
                  contractId: record.contractId
                });
                this.showReSubmitForm();
              },
              display: [5],
              auth:[TRANSPORT_CONTRACT_REHANDLE]
            },
          ]
        }[record.contractState];
        return [
          downLoad,
          ...operations
        ].filter(item => item.display.indexOf(Number(this.organizationType)) !== -1 );
      }
    };
    const formSchema = {
      contractType: {
        label: '合同类型',
        component: 'select',
        rules: {
          required: [true, '请选择合同类型'],
          validator: ({ value })=>{
            this.nowType = value;
          },
        },
        options: [{
          label: '承运合同',
          key: 0,
          value: 0
        }, {
          label: '调度合同',
          key: 1,
          value: 1
        }, {
          label: '网络货运合同',
          key: 2,
          value: 2
        }],
        placeholder: '请选择合同类型'
      },
      uploadFile: {
        label: "上传合同",
        accept:"application/pdf, application/msword, application/vnd.openxmlformats-officedocument.wordprocessingml.document",
        renderMode:'doc',
        component: UploadFile,
        fileSuffix: ['doc', 'docx', 'pdf'],
        rules: {
          required: [true, '请上传合同']
        }
      },
      invoiceTitle: {
        label: '发票抬头',
        component: 'input',
        rules: {
          required: [true, '请输入发票抬头'],
        },
        placeholder: '请输入发票抬头'
      },
      invoiceNo: {
        label: '发票税号',
        component: 'input',
        rules: {
          required: [true, '请输入发票税号'],
          pattern: /^[^_IOZSVa-z\W]{2}\d{6}[^_IOZSVa-z\W]{10}$/
        },
        placeholder: '请输入发票税号'
      },
      openingBank: {
        label: '开户行',
        component: 'input',
        rules: {
          required: [true, '请输入开户行'],
        },
        placeholder: '请输入开户行'
      },
      bankAccount: {
        label: '银行账号',
        component: 'input',
        rules: {
          required: [true, '请输入银行账号'],
          validator: ({ value }) => {
            const reg = /^[0-9]*$/;
            if (!reg.test(value)) {
              return '银行账号由数字构成';
            }
          }
        },
        placeholder: '请输入银行账号'
      }
    };
    this.state = {
      visible: false,
      pageSize:10,
      tableSchema,
      nowPage: 1,
      formSchema,
      title: '签署运输合同',
      relatedProjectValue: []
    };
  }

  refresh = () => {
    const { getContracts, filter, setFilter } = this.props;
    const { offset = 0, limit = 10 } = filter;
    const newFilter = setFilter({ offset, limit });
    getContracts(newFilter);
  }

  componentDidMount () {
    const { getAllProject } = this.props;
    getAllProject();
    this.refresh();
  }

  showCreateForm = () => {
    this.setState({
      visible: true,
      formMode: 'create',
      title: '签署运输合同'
    });
  }

  showReSubmitForm = () => {
    this.setState({
      visible: true,
      formMode: 'resubmit',
      title: '签署运输合同'
    });
  }

  showRelatedForm = () => {
    this.setState({
      visible: true,
      formMode: 'related',
      title: '关联项目'
    });
  }

  handleCancel = () => {
    this.nowType = false;
    this.setState({
      visible: false
    });
  }

  onChange = (pagination) => {
    const { offset, limit, current } = translatePageType(pagination);
    this.setState({
      nowPage:current,
      pageSize:limit
    });
    const newFilter=this.props.setFilter({ offset, limit });
    this.props.getContracts({ ...newFilter });
  }

  signContract = (data) => {
    const { getContracts, filter, setFilter } = this.props;
    const contractDentryid = data.uploadFile[0];
    const contractName = `鼎石物流-${ this.organizationName }运输合同`;
    delete data.uploadFile;
    const formData = { ...data, ...{ contractDentryid, contractName } };
    signContract(formData).then(() => {
      const newFilter = setFilter({ ...filter, offset:0 });
      getContracts({ ...newFilter });
      notification.success({
        message: '成功',
        description:
          '已成功提交运输合同!',
      });
      this.handleCancel();
    });
  }

  reSignContract = (data) => {
    const { contractId } = this.state;
    const contractDentryid = data.uploadFile[0];
    const contractName = `鼎石物流-${ this.organizationName }运输合同`;
    delete data.uploadFile;
    const formData = { ...data, ...{ contractDentryid, contractName, contractState: NETWORK_CONTRACT_LIST_STATUS.UNAUDITED } };
    patchContract(contractId, formData).then(() => {
      notification.success({
        message: '重新提交成功',
        description: `重新提交运输合同成功`,
      });
      this.handleCancel();
      this.refresh();
    });
  }

  getVerifyReason = () => {
    const { contractId } = this.state;
    const contracts = this.props.contracts.items;
    const item = contracts.find(item => item.contractId === contractId);
    const index = item.logisticsVerifyRespList.length - 1;
    return item.logisticsVerifyRespList[index].verifyReason;
  }

  formItem = () => {
    const { formMode } = this.state;
    const formItemLayout = {
      labelCol: {
        xs: { span: 24 },
        sm: { span: 6 },
      },
      wrapperCol: {
        xs: { span: 24 },
        sm: { span: 18 },
      },
    };
    if (formMode === 'create' || formMode ==='resubmit') {
      return (
        <div styleName="modalBox">
          {
            formMode ==='resubmit'?
              <Row styleName="ant_row">
                <span styleName="refuse">拒绝理由：{this.getVerifyReason()}</span>
              </Row>
              :
              null
          }
          <Row styleName="ant_row">
            <span>合同模板：鼎石物流-{this.organizationName}</span><a styleName="download" onClick={this.downLoad}>下载</a>
          </Row>
          <SchemaForm ref={c => this.contractForm = c} className='freightContract_form' layout='vertical' {...formItemLayout} schema={this.state.formSchema}>
            <Item field="contractType" /><a styleName="download" onClick={this.downLoad} style={{ marginLeft: 100 }}>下载合同模板</a>
            <Item field="uploadFile" />
            <Item field="invoiceTitle" />
            <Item field="invoiceNo" />
            <Item field="openingBank" />
            <Item field="bankAccount" />
            <div styleName="button_box">
              <Button style={{ marginRight: '20px' }} onClick={this.handleCancel}>取消</Button>
              {
                formMode === 'create'?<DebounceFormButton label="确定" type="primary" onClick={this.signContract} />:<DebounceFormButton label="确定" type="primary" onClick={this.reSignContract} />
              }
            </div>
          </SchemaForm>
        </div>
      );
    }
    if (formMode === 'reject') return this.rejectForm();
    return this.relatedItem();
  }

  downLoad = () => {
    if (!this.nowType && this.nowType !== 0 ) return message.error('请先选择合同类型！');
    getAccessInfo()
      .then(accessInfo => {
        getOssFile(accessInfo, getContractOSSFileKey(this.nowType));
      });
  }

  rejectForm = () => {
    const formSchema = {
      verifyReason: {
        label: '拒绝理由',
        component: 'input.textArea',
        rules: {
          required: [true, '请输入拒绝理由'],
          max: 100
        },
        placeholder: '请输入拒绝理由'
      }
    };
    const formItemLayout = {
      labelCol: {
        xs: { span: 24 },
        sm: { span: 6 },
      },
      wrapperCol: {
        xs: { span: 24 },
        sm: { span: 18 },
      },
    };
    return (
      <>
        <SchemaForm className='freightContract_reject_form' layout='vertical' schema={formSchema}>
          <Item field="verifyReason" {...formItemLayout} />
          <div styleName="button_box">
            <Button style={{ marginRight: '20px' }} onClick={this.handleCancel}>取消</Button>
            <DebounceFormButton label="确定" type="primary" onClick={this.okReject} />
          </div>
        </SchemaForm>
      </>
    );
  }

  okReject = (val) => {
    const { contractId } = this.state;
    patchContract(contractId, { ...val, ...{ contractState: NETWORK_CONTRACT_LIST_STATUS.REFUSE } }).then(() => {
      this.handleCancel();
      this.refresh();
      notification.success({
        message: '成功',
        description:
          '已拒绝该合同！',
      });
    });
  }

  relatedItem = () => {
    const { Option } = Select;
    const { contractId } = this.state;
    const { contracts = [], project } = this.props;
    const nowContract = contracts.items.find(item => item.contractId === contractId);
    const children = project.map(item => (
      <Option key={Number(item.projectId)} name={item.projectName}>{item.projectName}</Option>
    ));
    const projectList = nowContract? nowContract.projectList: [];
    const initValue = projectList? projectList.map(item => ({
      key: item.projectId.toString(),
      label: item.projectName,
      name: item.projectName
    })) : [];
    this.state.relatedProjectValue = initValue;
    return (
      <>
        <Row styleName="ant_row">
          <span styleName="refuse">注意：与运输合同关联的项目才能使用网络货运功能</span>
        </Row>
        <span>项目名称：</span>
        <Select
          optionFilterProp='name'
          labelInValue
          mode="multiple"
          style={{ width: '70%' }}
          placeholder="请选择项目"
          defaultValue={initValue}
          onChange={this.handleChange}
        >
          {children}
        </Select>
        <div styleName="button_box">
          <Button style={{ marginRight: '20px' }} onClick={this.handleCancel}>取消</Button>
          <Button type="primary" onClick={this.okRelated}>确定</Button>
        </div>
      </>
    );
  }

  handleChange = (value) => {
    this.state.relatedProjectValue = value;
  }

  okRelated = () => {
    const { relatedProjectValue, contractId } = this.state;
    const params = relatedProjectValue.map(item => ({
      projectId: item.key,
      projectName: item.label
    }));
    contractCorrelation(contractId, params).then(() => {
      this.refresh();
      this.setState({
        visible: false
      });
      this.nowType = false;
      notification.success({
        message: '成功',
        description:
          '修改关联项目成功！',
      });
    });
  }

  render () {
    const { tableSchema, nowPage, pageSize, visible, title } = this.state;
    const { contracts } = this.props;
    return (
      <>
        {this.organizationType === 5?
          <Authorized authority={[TRANSPORT_CONTRACT_CREATE]}>
            <Row>
              <Button onClick={this.showCreateForm} type='primary'>签 订 合 同</Button>
            </Row>
          </Authorized>
          :
          null
        }
        <Modal
          destroyOnClose
          maskClosable={false}
          visible={visible}
          title={title}
          onCancel={this.handleCancel}
          footer={null}
          width={600}
        >
          {this.formItem()}
        </Modal>
        <Table schema={tableSchema} rowKey="contractId" pagination={{ current:nowPage, pageSize }} onChange={this.onChange} dataSource={contracts} />
      </>
    );
  }
}

export default Contract;
