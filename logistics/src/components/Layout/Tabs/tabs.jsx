import React from 'react';
import { message, Tabs, Tooltip } from 'antd';
import { connect } from 'dva';
import classNames from 'classnames';
import ScorpioMenu from 'scorpio-menu';
import { cloneDeep, isEmpty, pathQueryStr, getLocal } from '@/utils/utils';

const mapStateToProps = (state) => ({
  tabs: state.commonStore.tabs || [],
  activeKey: state.commonStore.activeKey ||'1'
});
const { TabPane } = Tabs;
const TabsNav = ({ tabs, dispatch, activeKey, width, history, collapsed }) => {
  const localTabs = getLocal('local_commonStore_tabsObj') || { tabs, activeKey };
  const [state, setState] = React.useState({
    show: false,
    position: {},
    currentItem: {}
  });
  const onEdit = (targetKey, type) => {
    if (type === 'remove' ) {
      let lastIndex;
      let currentKey = activeKey;
      cloneDeep(tabs).forEach((pane, i) => {
        if ((pane.id && pane.id === targetKey)) {
          lastIndex = i - 1;
        }
      });
      const data = cloneDeep(tabs).filter(item => item.id !== targetKey); // 删除后的tabs
      const currentTab = cloneDeep(tabs).find(item => item.id === targetKey); // 被删除的tab

      if (currentTab.id) {
        // 报账删除操作的清楚本地数据是在组件设置之后避免二次赋值
        const timer = setTimeout(()=> {
          localStorage.removeItem(currentTab.id);
          clearTimeout(timer);
        }, 1000);
      }

      if (data.length && currentKey === currentTab.id) {
        if (lastIndex >= 0) {
          currentKey = data[lastIndex].id;
        } else {
          currentKey = data[0].id;
        }
      }
      dispatch({
        type: 'commonStore/setTabs',
        payload: { items: data, activeKey: currentKey },
      });
    }
  };
  const onChange = (val) => {
    const tab = tabs.find(item => item.id === val);
    let url = tab ? tab.itemPath : '/index';
    if (tab && tab.query && !isEmpty(tab.query)) {
      url = `${tab.itemPath}${pathQueryStr(tab.query)}`;
    }
    dispatch({
      type: 'commonStore/setTabs',
      payload: { items: tabs, activeKey: tab ? tab.id : '1' },
    });
    history.push(url, tab && { ...tab.state });
  };
  const onContextMenu = (item) =>  (event) => {
    event.preventDefault();
    setState({ currentItem: item, show: true, position: { x: collapsed ? event.pageX - 80 : event.pageX - 256,  y: 38, } });
  };
  const menuData = [
    {
      label: "关闭其他",
      value: 1,
    },
    {
      label: "全部关闭",
      value: 2
    },
  ];
  const onChangeMenu = (val) => {
    let url = state.currentItem.id;
    switch (val.value) {
      case 1:
        if (tabs.length === 2 && state.currentItem.id !== '1') {
          setState({ ...state, show: false });
          message.destroy();
          return message.info('没有其他页面可以关闭!');
        }
        if (!isEmpty(state.currentItem.query)) {
          url = `${state.currentItem.itemPath}${pathQueryStr(state.currentItem.query)}`;
        }
        history.push(url, tabs.filter(item => item.id === state.currentItem.id || item.id === '1'));
        dispatch({
          type: 'commonStore/setTabs',
          payload: { items: tabs.filter(item => item.id === state.currentItem.id || item.id === '1'), activeKey: state.currentItem.id },
        });
        break;
      case 2:
        dispatch({ type: 'commonStore/clearSetTabs' });
        break;
      default:
    }
    setState({ ...state, show: false });
  };
  const onClose = (e) => {
    setState({ ...state, show: false });
  };
  return (
    <div className="breadcrumbs" style={{ width, backgroundColor: '#fff', padding: '10px 24px 0', position: 'relative' }}>
      <Tabs
        hideAdd
        type="editable-card"
        onChange={onChange}
        activeKey={localTabs.activeKey}
        onEdit={onEdit}
      >
        {
          localTabs.tabs.map(item => item.name ? (
            <TabPane
              closable={item.name !== '首页'}
              tab={
                item.name && item.name.length > 7 ? (
                  <Tooltip placement="top" title={item.name} mouseEnterDelay={0.5}>
                    <span
                      onContextMenu={onContextMenu(item)}
                      style={{ paddingRight: item.name === '首页' ? '12px' : '28px' }}
                      className={classNames(localTabs.activeKey === item.id ? 'navActive' : '', item.name === '首页' && 'hideIcon')}
                    >
                      {item.name}
                    </span>
                  </Tooltip>
                ): (
                  <span
                    onContextMenu={onContextMenu(item)}
                    style={{ paddingRight: item.name === '首页' ? '12px' : '28px' }}
                    className={classNames(localTabs.activeKey === item.id ? 'navActive' : '', item.name === '首页' && 'hideIcon')}
                  >
                    {item.name}
                  </span>
                )

              }
              key={item.id}
            />
          ) : null)
        }
      </Tabs>
      <ScorpioMenu
        data={menuData}
        position={state.position}
        show={state.show}
        onMenuClick={onChangeMenu}
        onClose={onClose}
      />
    </div>);
};

export default connect(mapStateToProps)(TabsNav);
