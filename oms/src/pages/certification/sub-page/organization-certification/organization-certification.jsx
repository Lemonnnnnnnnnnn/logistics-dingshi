import React from 'react';
import { connect } from 'dva';
import { Item, FORM_MODE } from '@gem-mine/antd-schema-form';
import router from 'umi/router';
import DebounceFormButton from '../../../../components/debounce-form-button';
import Table from '../../../../components/table/table';
import organizationsModel from '../../../../models/organizations';
import { ORGANIZATION_STATUS, AUDIT_STATUS } from '../../../../constants/organization/organization-type';
import SearchForm from '../../../../components/table/search-form2';
import TableContainer from '../../../../components/table/table-container';
import { pick, translatePageType } from '../../../../utils/utils';
import '@gem-mine/antd-schema-form/lib/fields';

const { actions: { getOrganizations, patchOrganizations } } = organizationsModel;
function mapStateToProps (state) {
  return {
    organizations: pick(state.organizations, ['items', 'count'])
  };
}
@connect(mapStateToProps, { getOrganizations, patchOrganizations })
// @BindStore('organizations')
@TableContainer()
export default class OrganizationCertification extends React.Component {

  tableSchema = {
    minWidth:1800,
    columns: [
      {
        title: '状态',
        dataIndex: 'auditStatus',
        filters: ORGANIZATION_STATUS,
        filterMultiple: false, // 是否多选 默认多选
        onFilter: (value, record) => record.auditStatus === value,
        render: (status) => {
          if (status === undefined || status === null) return <span>auditStatus为{`${status}`}， 异常</span>;

          const { color, text } = ORGANIZATION_STATUS.find(item => item.value === status);
          return <span style={{ color }}>● {text}</span>;
        }
      },
      {
        title: '企业名称',
        dataIndex: 'organizationName',
      }, {
        title: '联系人',
        dataIndex: 'contactName',
      }, {
        title: '联系电话',
        dataIndex: 'contactPhone',
      }, {
        title: '详细地址',
        dataIndex: 'organizationAddress',
      }
    ],
    operations: (record) => {
      const { organization } = this.props;
      const enable = {
        title: '启用',
        onClick: this.toggleOrganizationAvailable
      };
      const ban = {
        title: '禁用',
        onClick: this.toggleOrganizationAvailable
      };
      const certificate = {
        title: '审核',
        onClick: ({ organizationId }) => {
          router.push(`${organization.title}/certificate?organizationId=${organizationId}`);
        }
      };
      const detail = {
        title: '详情',
        onClick: ({ organizationId }) => {
          router.push(`${organization.title}/detail?organizationId=${organizationId}`);
        }
      };
      /* const deleteDriver = {
        title: '删除',
        onClick: (record, index) => {
          // TODO 删除
          confirm({
            title: '删除提示',
            content: `你确定要删除承运方【${record.organizationName}】吗？`,
            okText: '确定',
            cancelText: '取消',
            onOk: () => {
              this.handleDetele(record)
                .then(() => this.getOrganization())
            },
            onCancel: () => { }
          })
        },
      } */

      return {
        [AUDIT_STATUS.FAILED]: [detail],
        [AUDIT_STATUS.SUCCESS]: [detail, record.isAvailable ? ban : enable],
        [AUDIT_STATUS.PENDING]: [certificate],
      }[record.auditStatus] || [];
    }
  }

  constructor (props) {
    super(props);
    this.state = {
      current: 1
    };
  }

  componentDidMount () {
    this.getOrganization();
  }

  getOrganization = (params = { limit: 10, offset: 0 }) => {
    this.props.getOrganizations({ ...params, selectType: 1, organizationType: this.props.organization.type });
  }

  toggleOrganizationAvailable = ({ organizationId, isAvailable }) => this.props.patchOrganizations({
    organizationId,
    organizationType:this.props.organization.type,
    isAvailable: !isAvailable
  })

  handleDetele = ({ organizationId }) => this.props.patchOrganizations({ organizationId, isEffect: 0 })

  onChange = (pagination, filters) => {
    const { offset, limit, current } = translatePageType(pagination);
    const auditStatus = filters.auditStatus ? filters.auditStatus[0] : undefined;
    const newFilter = this.props.setFilter({ offset, limit, auditStatus });

    this.getOrganization(newFilter);
    this.setState({ current });
  }

  searchSchema = {
    vagueSelect: {
      label: '搜索',
      placeholder: '请输入企业名称',
      component: 'input'
    }
  }

  searchTable = ({ pageSize }) => {
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
      <SearchForm layout="inline" {...layout} schema={this.searchSchema} mode={FORM_MODE.SEARCH}>
        <Item field='vagueSelect' />
        <DebounceFormButton label="查询" type="primary" onClick={(value) => { this.handleSearchBtnClick(value, pageSize); }} />
      </SearchForm>
    );
  }

  handleSearchBtnClick = (value, pageSize) => {
    const params = { ...value, limit: pageSize, offset: 0 };
    const newFilter = this.props.setFilter({ ...params });
    this.getOrganization(newFilter);
    this.setState({ current: 1 });
  }

  render () {
    const { organizations } = this.props;
    const { current } = this.state;

    return (
      <Table
        rowKey="organizationId"
        pagination={{ current }}
        dataSource={organizations}
        schema={this.tableSchema}
        onChange={this.onChange}
        renderCommonOperate={this.searchTable}
      />
    );
  }
}
