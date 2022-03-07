import React, { ReactNode } from 'react';
import { Pagination, Popover, Radio, Space, Tabs, Select } from 'antd';
import { ExclamationCircleFilled } from '@ant-design/icons';
import style from './Prebooking.less';
import {
  GlobalParams,
  PrebookItem,
  PrebookParams,
  ProjectItem,
} from '@/modules/dashboard/withDashboard';
import { PrebookingStatus } from '@/constants/prebooking';
import logo from '@/assets/logo.png';
import deliveryIcon from '@/assets/delivery_icon.png';
import receivingIcon from '@/assets/receiving_icon.png';
import yuyuedan from '@/assets/yuyuedan.png';
import { Consumer } from '@/modules/dashboard/context';
export interface IPrebookProps {
  prebookList: ListItem<PrebookItem>;
  prebookParams: PrebookParams;
  onPrebookParamsChange: (params: PrebookParams, pageReset?: boolean) => void;
  projectLoding: boolean;
  projectList: ListItem<ProjectItem>;
  onGlobalParamsChange: (params: GlobalParams) => void;
  onSelectPrebook: (prebook: PrebookItem) => void;
}

interface IContext {
  globalParams: GlobalParams;
}

const { Option } = Select;

class Prebooking extends React.Component<IPrebookProps & IContext> {
  onTabsChange = (key) => {
    const { onPrebookParamsChange } = this.props;
    onPrebookParamsChange({ prebookingStatus: key }, true);
  };

  onSortChange = (e) => {
    const { onPrebookParamsChange } = this.props;
    onPrebookParamsChange({ order: e.target.value as 'asc' | 'desc' });
  };

  onPageChange = (page, pageSize) => {
    const { onPrebookParamsChange } = this.props;
    onPrebookParamsChange({ limit: pageSize, offset: (page - 1) * pageSize });
  };

  onProjectChange = (value) => {
    const { onGlobalParamsChange } = this.props;
    onGlobalParamsChange({ projectId: value });
  };

  // sortRadio = (): ReactNode => {
  //   const {
  //     prebookParams: { order },
  //   } = this.props;
  //   return (
  //     <Radio.Group onChange={this.onSortChange} value={order}>
  //       <Space direction="vertical">
  //         <Radio value="asc">升序</Radio>
  //         <Radio value="desc">降序</Radio>
  //       </Space>
  //     </Radio.Group>
  //   );
  // };

  uiTitle = (items: Array<obj>, key) => {
    if (!items?.length) return '';
    return `${items.map((item) => item[key]).join('\n')}`;
  };

  render() {
    const {
      prebookList: { count, items },
      prebookParams: { limit, offset, prebookingStatus },
      projectLoding,
      projectList,
      globalParams: { projectId },
      onSelectPrebook,
    } = this.props;

    const page = offset ? Math.floor(offset / limit) + 1 : 1;
    return (
      <div className={style.container}>
        <div className={style.header}>
          <img className={style.logo} src={logo} />
          <span className={style.projectLabel}>选择项目</span>
          <Select
            showSearch
            optionFilterProp="title"
            optionLabelProp="title"
            dropdownClassName={style.selectorDropdown}
            value={projectId}
            onChange={this.onProjectChange}
            className={style.projectSelector}
            defaultValue="全部项目"
            placeholder="全部项目"
            loading={projectLoding}
          >
            {projectList &&
              projectList.items?.map((project) => (
                <Option
                  title={project.projectName}
                  key={project.projectId}
                  value={project.projectId}
                >
                  <span className="option_left">{project.projectName}</span>
                  <span className="option_right">
                    {/* ({`调度中${project.preDispatching || 0}单，待确定${project.preWaitDispatch || 0}单`}) */}
                    (
                    <span style={{ color: 'rgb(255, 136, 78)' }}>{`调度中${
                      project.preDispatching || 0
                    }单`}</span>
                    ,
                    <span style={{ color: 'rgb(204, 51, 51)' }}>{`待确定${
                      project.preWaitDispatch || 0
                    }单`}</span>
                    )
                  </span>
                </Option>
              ))}
          </Select>
        </div>
        <div className={style.content}>
          <div className={style.prebookTitle}>
            {/* <Popover
              content={this.sortRadio()}
              title="发布时间排序"
              trigger="hover"
            >
              <img
                src={yuyuedan}
                style={{ width: '12px', height: '14px', marginLeft: '10px' }}
              />
            </Popover> */}
            <img
              src={yuyuedan}
              style={{ width: '12px', height: '14px', marginLeft: '10px' }}
            />
            <span style={{ marginLeft: '5px', color: '#B6D7FF' }}>
              预约单信息
            </span>
          </div>
          <Tabs
            centered
            className="prebook_tabs"
            size="large"
            activeKey={`${prebookingStatus}`}
            type="card"
            onChange={this.onTabsChange}
          >
            <Tabs.TabPane
              tab={
                prebookingStatus === PrebookingStatus.UNCERTAINTY
                  ? `待确定(${items?.length || 0})`
                  : '待确定'
              }
              key={PrebookingStatus.UNCERTAINTY}
            />
            <Tabs.TabPane
              tab={
                prebookingStatus === PrebookingStatus.UNCOMPLETED
                  ? `调度中(${items?.length || 0})`
                  : '调度中'
              }
              key={PrebookingStatus.UNCOMPLETED}
            />
          </Tabs>
          <ul className={style.prebookList}>
            {projectId ? (
              items?.map((prebook) => (
                <li
                  onClick={() => onSelectPrebook(prebook)}
                  key={prebook.prebookingId}
                  className={style.prebookItem}
                >
                  <span
                    title={prebook.prebookingNo}
                    className={style.prebookNo}
                  >
                    {prebook.prebookingNo}
                  </span>
                  <ul title={this.uiTitle(prebook.deliveryItems, 'name')}>
                    {prebook.deliveryItems?.map((delivery) => (
                      <li key={delivery.prebookingCorrelationId}>
                        <img src={deliveryIcon} />
                        <div>{delivery.name}</div>
                      </li>
                    ))}
                  </ul>
                  <ul title={this.uiTitle(prebook.receivingItems, 'name')}>
                    {prebook.receivingItems?.map((receiving) => (
                      <li key={receiving.prebookingCorrelationId}>
                        <img src={receivingIcon} />
                        <div>{receiving.name}</div>
                      </li>
                    ))}
                  </ul>
                </li>
              ))
            ) : (
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'center',
                  alignItems: 'center',
                  height: '100%',
                }}
              >
                <ExclamationCircleFilled
                  style={{
                    fontSize: '30px',
                    marginRight: '10px',
                    color: 'white',
                  }}
                />
                <div style={{ fontSize: '16px', color: 'white' }}>
                  亲，请先选择项目
                </div>
              </div>
            )}
          </ul>
          <Pagination
            className={style.pagination}
            current={page}
            hideOnSinglePage
            showSizeChanger={false}
            size="small"
            pageSize={limit}
            total={count}
            onChange={this.onPageChange}
          />
        </div>
      </div>
    );
  }
}

export default class Index extends React.Component<IPrebookProps> {
  render() {
    return (
      <Consumer>
        {({ globalParams }) => (
          <Prebooking globalParams={globalParams} {...this.props} />
        )}
      </Consumer>
    );
  }
}
