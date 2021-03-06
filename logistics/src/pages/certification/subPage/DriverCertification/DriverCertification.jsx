import React from 'react';
import { Item, FORM_MODE, Observer } from '@gem-mine/antd-schema-form';
import { Icon, Modal, Input, message, Button, Row } from 'antd';
import { connect } from 'dva';
import router from 'umi/router';
import moment from 'moment';
import DebounceFormButton from '@/components/DebounceFormButton';
import Table from '@/components/Table/Table';
import { AUDIT_STATUS, getDriverStatus, PERFECT_STATUS } from '@/constants/driver/driver';
import SearchForm from '@/components/Table/SearchForm2';
import TableContainer from '@/components/Table/TableContainer';
import { getUserInfo } from '@/services/user';
import { translatePageType, encodePassword, routerToExportPage, getLocal, isEmpty } from '@/utils/utils';
import '@gem-mine/antd-schema-form/lib/fields';
import { exportDriversExcel } from '@/services/apiService';

function mapStateToProps(state) {
  const { dictionaries: { items } } = state;
  const licenseType = items.filter(item => item.dictionaryType === 'license_type');
  return {
    items: state.drivers.items,
    count: state.drivers.count,
    commonStore: state.commonStore,
    licenseType
  };
}

function mapDispatchToProps(dispatch) {
  return ({
    getDrivers: (params) => dispatch({
      type: 'drivers/getDrivers',
      payload: params
    }),
    patchDrivers: (params) => dispatch({
      type: 'drivers/patchDrivers',
      payload: params
    }),
    dispatch
  });
}

@connect(mapStateToProps, mapDispatchToProps)
@TableContainer({ shield: true })
export default class DriverCertification extends React.Component {
  organizationType = getUserInfo().organizationType

  currentTab = this.props.commonStore.tabs.find(item => item.id === this.props.commonStore.activeKey);

  localData = getLocal(this.currentTab.id) || { formData: {} };

  form = null;

  stash = []

  state = {
    passwordModal: false,
  }

  showModal = (userId) => () => {
    this.userId = userId;
    this.setState({
      passwordModal: true
    });
  }

  closePasswordModal = () => {
    this.setState({
      passwordModal: false,
      password: undefined
    });
  }

  setPassword = e => {
    const password = e.target.value;
    this.setState({
      password
    });
  }

  detailInfo = async () => {
    const { password } = this.state;
    if (!password.trim()) {
      return message.error('???????????????');
    }
    const { userId } = this;
    const { items, dispatch } = this.props;
    const stashUser = items.find(item => item.userId === userId);
    dispatch({
      type: 'drivers/displace',
      payload: {
        userId,
        password: encodePassword(password.trim())
      }
    })
      .then((res) => {
        if (!res) return message.error('????????????');
        this.closePasswordModal();
        stashUser.endTime = Date.parse(new Date()) + 3000;
        this.stash.push(stashUser);
      });
  }

  constructor(props) {
    super(props);

    this.tableSchema = {
      variable: true,
      minWidth:2200,
      columns: [
        {
          title: '??????',
          dataIndex: 'auditStatus',
          render: (text, record) => {
            const styleObj = getDriverStatus(record.auditStatus, record.perfectStatus, this.organizationType);
            return <span style={{ color: styleObj.color }}>??? {styleObj.text}</span>;
          }
        },
        {
          title: '????????????',
          dataIndex: 'nickName',
          render: (text, record) => {
            if (!text) return '--';
            let isVisible = true;
            if (text.indexOf('*') !== -1) isVisible = false;
            if (isVisible) return text;
            return (
              <>
                {text}
                <Icon
                  onClick={this.showModal(record.userId)}
                  title='???????????????????????????'
                  style={{ cursor: 'pointer', fontSize: '16px', marginLeft: '6px', color: 'rgb(179,179,179)' }}
                  type="lock"
                />
              </>
            );
          }
        },
        {
          title: '????????????',
          dataIndex: 'phone'
        },
        {
          title: '????????????',
          dataIndex: 'idcardNo'
        },
        {
          title: '???????????????',
          dataIndex: 'licenseType',
          render(type) {
            const { licenseType } = props;
            const record = licenseType.find(item => item.dictionaryCode === String(type));

            return record ? record.dictionaryName : '??????';
          }
        },
        {
          title: '???????????????',
          dataIndex: 'bankAccountItems',
          render: (text, record) => {
            if (!text || !text[0]) return '--';
            const activeCard = text.find(item => item.isAvailable && item.isEffect === 1);
            if (!activeCard) return '--';
            return `${activeCard.bankName}${activeCard.bankAccount}`;
          }
        },
        {
          title: '??????????????????',
          dataIndex: 'licenseValidityDate',
          render: (text, record) => {
            const { licenseValidityType } = record;
            if (Number(licenseValidityType) === 2) return '??????';
            return (text ? moment(text).format('YYYY-MM-DD') : '--');
          }
        },
        {
          title: '????????????',
          dataIndex: Math.random(),
          render: (text, record) => {
            const { licenseValidityDate, licenseValidityType } = record;
            if (Number(licenseValidityType) === 2) return <span style={{ color: '#25C8C8' }}>?????????</span>;
            if (!licenseValidityDate) return '--';
            return moment(licenseValidityDate).diff(moment()) < 0
              ? <span style={{ color: "red" }}>?????????</span>
              : <span style={{ color: '#25C8C8' }}>?????????</span>;
          }
        },
        {
          title: '??????????????????',
          dataIndex: 'qualificationValidityDate',
          render: (text, record) => (text ? moment(text).format('YYYY-MM-DD') : '--')
        },
        {
          title: '????????????',
          dataIndex: Math.random(),
          render: (text, record) => {
            const { qualificationValidityDate } = record;
            if (!qualificationValidityDate) return '--';
            return moment(qualificationValidityDate).diff(moment()) < 0
              ? <span style={{ color: "red" }}>?????????</span>
              : <span style={{ color: '#25C8C8' }}>?????????</span>;
          }
        },

        {
          title: '????????????',
          dataIndex: 'auditStatus',
          key: 'userId',
          render: (text, record) => {
            switch (text) {
              case AUDIT_STATUS.SUCCESS:
                return (
                  <div style={{ paddingLeft: '15px' }}>
                    <Icon style={{ fontSize: '20px', color: 'rgb(31, 220, 74)' }} type="check-circle" theme="filled" />
                  </div>
                );
              case AUDIT_STATUS.FAILED:
                return (
                  <div style={{ paddingLeft: '15px' }}>
                    <Icon style={{ fontSize: '20px', color: 'rgb(216, 30, 6)' }} type="close-circle" theme="filled" />
                  </div>
                );
              default: return (
                <div style={{ paddingLeft: '15px' }}>
                  <Icon style={{ fontSize: '20px' }} type="check-circle" theme="filled" />
                </div>
              );
            }
          }
        },
        {
          title: '????????????',
          dataIndex: 'perfectStatus',
          render: (text, record) => {
            switch (text) {
              case PERFECT_STATUS.SUCCESS:
                return (
                  <div style={{ paddingLeft: '15px' }}>
                    <Icon style={{ fontSize: '20px', color: 'rgb(31, 220, 74)' }} type="check-circle" theme="filled" />
                  </div>
                );
              case PERFECT_STATUS.FAILED:
                return (
                  <div style={{ paddingLeft: '15px' }}>
                    <Icon style={{ fontSize: '20px', color: 'rgb(216, 30, 6)' }} type="close-circle" theme="filled" />
                  </div>
                );
              default: return (
                <div style={{ paddingLeft: '15px' }}>
                  <Icon style={{ fontSize: '20px' }} type="check-circle" theme="filled" />
                </div>
              );
            }
          }
        }
      ],
      operations: (record) => {
        const enable = {
          title: '??????',
          onClick: this.toggleDriverAvailable
        };
        const ban = {
          title: '??????',
          onClick: this.toggleDriverAvailable
        };
        const certificate = {
          title: '??????',
          onClick: ({ userId }) => {
            router.push(`driver/certificate?userId=${userId}`);
          }
        };
        const detail = {
          title: '??????',
          onClick: ({ userId }) => {
            router.push(`driver/detail?userId=${userId}`);
          }
        };
        const modify = {
          title: '??????',
          onClick: ({ userId }) => {
            const { auditStatus, perfectStatus } = record;
            /*
          * auditStatus === 1 && perfectStatus === 1  ?????????
          * auditStatus === 1 && perfectStatus === 3  ?????????
          * ??????????????????????????????????????????
          * */

            const certified = auditStatus === 1 && perfectStatus === 1;
            const auditing = auditStatus === 1 && perfectStatus === 3;
            const editDetailPermission = certified || auditing;
            if (editDetailPermission) {
              router.push(`driver/edit?userId=${userId}`);
            } else {
              router.push(`driver/modifyBankCard?userId=${userId}`);
            }
          }
        };
        const { auditStatus, perfectStatus, isAvailable } = record;
        if (!auditStatus) return [detail];  // ?????????????????? ??? ?????? ???????????????
        if (auditStatus === 0) return [detail];  // ?????????????????? ??? ?????? ???????????????
        if (!auditStatus && !perfectStatus) return [detail]; // ??????????????????????????????????????? ??? ?????? ???????????????
        if (auditStatus === 1 && perfectStatus === 1) return [detail, isAvailable ? ban : enable, modify]; // ???????????????????????????????????? ??????????????????/?????? ???????????????
        if (auditStatus === 1 && perfectStatus === 2) return [detail, modify]; // ?????????????????????????????????????????? ??????                    ???????????????
        if (auditStatus === 1 && perfectStatus === 3) return [detail, certificate, modify]; // ?????????????????? ????????????????????? : ??????????????? ???????????????
        if (auditStatus === 1 && perfectStatus === 0) return [detail, isAvailable ? ban : enable, modify];  // ?????????????????? ?????????????????? ??? ????????????????????????  ??????????????????
        return [{
          title: '????????????',
        }];
      }
    };

    this.state = {
      current: 1,
      pageSize: 10,
      selectedRow: []
    };
  }

  componentDidMount() {
    const { localData = { formData: {} }, props: { setFilter } } = this;
    let filter = {};

    if(!isEmpty(localData.formData)) {
      if (localData.formData.status === 0) filter = { queryNotReal: true };  // ?????????
      if (localData.formData.status === 1) filter = { auditStatus: 1, perfectStatus: 2 }; // ?????????
      if (localData.formData.status === 2) filter = { auditStatus: 1, perfectStatus: 3 };  // ?????????
      if (localData.formData.status === 3) filter = { perfectStatus: 1 }; // ?????????
      if (localData.formData.status === 4) filter = { perfectStatus: 0 }; // ????????????
    }
    const params = {
      ...localData.formData,
      offset: localData.nowPage ? localData.pageSize * (localData.nowPage - 1) : 0,
      limit: localData.pageSize ? localData.pageSize : 10,
      ...filter,
    };
    setFilter({ ...localData.formData });
    this.setState({
      current: this.localData.nowPage || 1,
      pageSize: this.localData.pageSize || 10
    });
    console.log(this.localData, "this.localData")
    this.getDriver(params);
    this.timer = setInterval(() => {
      const { stash } = this;
      if (stash.length === 0) return;
      const { dispatch } = this.props;
      stash.forEach((stashDriver, index) => {
        if (stashDriver.endTime <= Date.parse(new Date())) {
          dispatch({
            type: 'drivers/recover',
            payload: stashDriver
          });
          this.stash.splice(index, 1);
        }
      });
    }, 1000);
  }
  getDriver = (params = { limit: 10, offset: 0 }) => {
    this.props.getDrivers({ ...params, selectType: 1, shield: true });
  }

  toggleDriverAvailable = driver => this.props.patchDrivers({
    userId: driver.userId,
    isAvailable: !driver.isAvailable,
    accountType: 2 // ??????
  })

  handleDetele = ({ userId }) => this.props.patchDrivers({ userId, isEffect: 0 })

  onChange = (pagination, filters) => {
    const { limit, offset, current } = translatePageType(pagination);
    const auditStatus = filters.auditStatus ? filters.auditStatus[0] : undefined;
    let newFilter = this.props.setFilter({ offset, limit, auditStatus });

    if (newFilter.status === 0) newFilter = { ...newFilter, queryNotReal: true };
    if (newFilter.status === 1) newFilter = { ...newFilter, auditStatus: 1, perfectStatus: 2 };
    if (newFilter.status === 2) newFilter = { ...newFilter, auditStatus: 1, perfectStatus: 3 };
    if (newFilter.status === 3) newFilter = { ...newFilter, perfectStatus: 1 };
    if (newFilter.status === 4) newFilter = { ...newFilter, perfectStatus: 0 };

    this.getDriver(newFilter);
    this.setState({ current, pageSize: limit });
  }

  searchSchema = {
    status: {
      label: '??????',
      component: 'select',
      allowClear: true,
      placeholder: '???????????????',
      options: [{
        label: '?????????',
        value: 0,
        key: 0
      }, {
        label: '?????????',
        value: 1,
        key: 1
      }, {
        label: '?????????',
        value: 2,
        key: 2
      }, {
        label: '?????????',
        value: 3,
        key: 3
      }, {
        label: '????????????',
        value: 4,
        key: 4
      }]
    },
    vagueSelect: {
      label: '??????',
      placeholder: '???????????????????????????????????????',
      component: 'input'
    },
    projectName: {
      label: '?????????????????????',
      placeholder: '??????????????????????????????',
      component: 'input',
      observer: Observer({
        watch: '*localData',
        action: (itemValue, { form }) => {
          if (this.form !== form) {
            this.form = form;
          }
          return {};
        }
      }),
    },
    licenseValidityIsAvailable: {
      label: '?????????????????????',
      placeholder: '??????????????????????????????',
      component: 'select',
      options: [
        {
          label: '?????????',
          key: 0,
          value: 0
        },
        {
          label: '?????????',
          key: 1,
          value: 1
        },
      ]
    },
    qualificationValidityIsAvailable: {
      label: '?????????????????????',
      placeholder: '??????????????????????????????',
      component: 'select',
      options: [
        {
          label: '?????????',
          key: 0,
          value: 0
        },
        {
          label: '?????????',
          key: 1,
          value: 1
        },
      ]
    },
  }

  handleOutputExcelBtnClick = () => {
    const { filter } = this.props;
    const { selectedRow } = this.state;
    const driverUserIdList = selectedRow.map(driver => driver.userId);
    const params = { ...filter, fileName: '????????????', limit: 10000, offset: 0, driverUserIdList };

    routerToExportPage(exportDriversExcel, params);
  }

  searchTable = ({ pageSize }) => {
    const layout = {
      labelCol: {
        xs: { span: 24 },
        sm: { span: 10 },
        xl: { span: 8 }
      },
      wrapperCol: {
        xs: { span: 24 },
        sm: { span: 14 },
        xl: { span: 16 }
      }
    };
    return (
      <SearchForm layout="inline" {...layout} schema={this.searchSchema} mode={FORM_MODE.SEARCH}>
        <Item field='status' />
        <Item field='vagueSelect' />
        <Item field='projectName' />
        <Item field='licenseValidityIsAvailable' />
        <Item field='qualificationValidityIsAvailable' />
        <Row type='flex' justify='end'>
          <DebounceFormButton label="??????" type="primary" className="mr-10" onClick={(value) => this.handleSearchBtnClick(value, pageSize)} />
          <Button style={{ marginLeft: '10px' }} onClick={this.handleResetBtnClick}>??????</Button>
          <Button type="primary" style={{ marginLeft: '10px' }} onClick={this.handleOutputExcelBtnClick}>??????excel</Button>
        </Row>

      </SearchForm>
    );
  }

  handleSearchBtnClick = (value, pageSize) => {
    let filter = {};
    if (value.status === 0) filter = { queryNotReal: true };  // ?????????
    if (value.status === 1) filter = { auditStatus: 1, perfectStatus: 2 }; // ?????????
    if (value.status === 2) filter = { auditStatus: 1, perfectStatus: 3 };  // ?????????
    if (value.status === 3) filter = { perfectStatus: 1 }; // ?????????
    if (value.status === 4) filter = { perfectStatus: 0 }; // ????????????
    const params = { ...value, limit: pageSize, offset: 0, ...filter };
    this.props.setFilter({ ...value, limit: pageSize, offset: 0 });

    this.getDriver(params);
    this.setState({
      current: 1
    });
  }

  handleResetBtnClick = () => {
    const newFilter = this.props.resetFilter({});
    this.setState({
      current: 1,
      pageSize: 10
    });
    this.getDriver(newFilter);
  }

  componentWillUnmount() {
    clearInterval(this.timer);
    const formData = this.form ? this.form.getFieldsValue() : null;
    localStorage.removeItem(this.currentTab.id);
    if (getLocal('local_commonStore_tabsObj').tabs.length > 1) {
      localStorage.setItem(this.currentTab.id, JSON.stringify({
        formData: { ...formData },
        pageSize: this.state.pageSize,
        nowPage: this.state.current,
      }));
    }
  }

  onSelectRow = (selectedRow) => {
    this.setState({
      selectedRow,
    });
  }

  render() {
    const { items = [], count = 0 } = this.props;
    const { current, passwordModal, password, pageSize } = this.state;

    return (
      <>
        <Modal
          title='????????????'
          width={800}
          maskClosable={false}
          destroyOnClose
          visible={passwordModal}
          onCancel={this.closePasswordModal}
          onOk={this.detailInfo}
        >
          <p style={{ display: 'block', width: '100%', textAlign: 'center', 'fontSize': '14px', color: '#999', margin: '30px auto' }}>???????????????????????????????????????<a href='/userAgreement'>????????????????????????</a>??????????????????????????????????????????????????????????????????????????????</p>
          <div
            style={{ display: 'block', width: '50%', textAlign: 'center', margin: '40px auto 40px' }}
          >
            <Input type='password' placeholder='???????????????????????????' autoComplete='new-password' onChange={this.setPassword} value={password} />
          </div>
        </Modal>
        <Table
          rowKey="userId"
          pagination={{ current, pageSize }}
          multipleSelect
          onSelectRow={this.onSelectRow}
          dataSource={{ items, count }}
          schema={this.tableSchema}
          onChange={this.onChange}
          renderCommonOperate={this.searchTable}
        />
      </>
    );
  }
}
