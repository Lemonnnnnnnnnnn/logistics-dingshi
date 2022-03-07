import React, { Component } from 'react';
import { Popover } from 'antd';
import { connect } from 'dva';
import moment from 'moment';
import model from '@/models/contracts';
import TableContainer from '@/components/Table/TableContainer';
import Table from '@/components/Table/Table';
import { getContractType } from '@/services/project';
import auth from '@/constants/authCodes';
import Authorized from '@/utils/Authorized';
import { getUserInfo } from '@/services/user';
import { getOSSToken } from '@/services/apiService';
import { pick, translatePageType, getOssFile } from '@/utils/utils';

// const {
//   TRANSPORT_CONTRACT_CREATE,
//   TRANSPORT_CONTRACT_BIND,
//   TRANSPORT_CONTRACT_REHANDLE,
//   TRANSPORT_CONTRACT_UPLOAD,
//   TRANSPORT_CONTRACT_JUDGE
// } = auth

function getAccessInfo () {
  return getOSSToken();
}

const { actions: { getContracts } } = model;

function mapStateToProps (state) {
  return {
    contracts: pick(state.contracts, ['items', 'count']),
    project: state.contracts.project || []
  };
}
@connect(mapStateToProps, { getContracts })
@TableContainer()
class Contract extends Component {
  organizationType= getUserInfo().organizationType // 3为货权 4为托运  5为承运

  organizationName= getUserInfo().organizationName

  constructor (props) {
    super(props);
    const tableSchema = {
      variable:true,
      minWidth:1550,
      columns: [
        {
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
          // auth: [TRANSPORT_CONTRACT_UPLOAD]
        };
        return [downLoad];
      }
    };
    this.state = {
      pageSize:10,
      tableSchema,
      nowPage: 1
    };
  }

  refresh = () => {
    const { getContracts, filter, setFilter } = this.props;
    const { offset = 0, limit = 10 } = filter;
    const newFilter = setFilter({ offset, limit });
    getContracts(newFilter);
  }

  componentDidMount () {
    this.refresh();
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

  render () {
    const { tableSchema, nowPage, pageSize } = this.state;
    const { contracts } = this.props;
    return (
      <>
        <Table schema={tableSchema} rowKey="contractId" pagination={{ current:nowPage, pageSize }} onChange={this.onChange} dataSource={contracts} />
      </>
    );
  }
}

export default Contract;
