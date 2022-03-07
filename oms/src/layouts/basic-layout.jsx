import React from 'react';
import { Layout, Card } from 'antd';
import DocumentTitle from 'react-document-title';
import memoizeOne from 'memoize-one';
import { connect } from 'dva';
import { ContainerQuery } from 'react-container-query';
import classNames from 'classnames';
import pathToRegexp from 'path-to-regexp';
import Media from 'react-media';
import { v4 as uuidv4 } from 'uuid';
import router from 'umi/router';
import Authorized from '../utils/Authorized';
import { round, pathQueryStr, isEqual, cloneDeep, isEmpty } from '../utils/utils';
// import getDictionaryByType from '../services/dictionaryService'
import SiderMenu from '../components/layout/sider-menu';
import Exception403 from '../components/exception/403';
import DictionaryModel from '../models/dictionaries';

import { getUserInfo } from '../services/user';
import role from '../constants/user/role';
import styles from './basic-layout.less';
import Context from './menu-context';
import Header from './header';
import Footer from './footer';
import logo from '../assets/logo.png';


const { actions: { getDictionaries } } = DictionaryModel;
const { Content } = Layout;

// eslint-disable-next-line no-extend-native
const _toFixed = Number.prototype.toFixed;

Number.prototype._toFixed = _toFixed;

Number.prototype.toFixed = function (len) {
  return round(this, len);
};

const query = {
  'screen-xs': {
    maxWidth: 575,
  },
  'screen-sm': {
    minWidth: 576,
    maxWidth: 767,
  },
  'screen-md': {
    minWidth: 768,
    maxWidth: 991,
  },
  'screen-lg': {
    minWidth: 992,
    maxWidth: 1199,
  },
  'screen-xl': {
    minWidth: 1200,
    maxWidth: 1599,
  },
  'screen-xxl': {
    minWidth: 1600,
  },
};

class BasicLayout extends React.PureComponent {
  constructor (props) {
    super(props);
    this.getPageTitle = memoizeOne(this.getPageTitle);
    this.matchParamsPath = memoizeOne(this.matchParamsPath, isEqual);
    this.state = { init: false };
  }

  componentWillMount () {
    const userInfo = getUserInfo();
    if (userInfo.organizationId===null){
      localStorage.removeItem('token');
      localStorage.removeItem('antd-pro-authority');
      localStorage.removeItem('authority');
      router.replace('/user/login');
    }
    const { route, location, tabs, setTabs } = this.props;
    const routes = this.fn(route.routes);
    const tab = routes.find(item => item.path === location.pathname);
    const str = location.query && location.query.pageKey ? `${tab.name}-${location.query.pageKey}`: tab  && tab.name;
    if (tab && !(tabs.find(item => item.name === str))){ // 进入页面如果tabs列表里面没有当前这个菜单就新加一个
      setTabs({ items: [...tabs, { name: tab.name, itemPath: tab.path, query: location.query }], activeKey: tab.id });
    }
    // 监听刷新事件
    window.addEventListener('beforeunload', this.beforeunload);
    window.pagId = tabs.find(item => item.name === str) && tabs.find(item => item.name === str).id; // 在window上绑定一个变量以便刷新的方法可以； 获取到

  }

  beforeunload = () =>  {
    const { activeKey, tabs } = this.props;
    const currentTab = tabs.find(item => item.id === activeKey);
    // 只刷新当前路由 如果路由相同参数不同的情况
    if (window.location.pathname  === currentTab.itemPath || window.location.search.slice(1).split("&")[0] === `pageKey=${currentTab.query.pageKey}` ){
      if (currentTab && currentTab.id) {
        localStorage.removeItem(currentTab.id);
      }
    }
  };

  componentDidMount () {
    const { route: { routes, authority }, fetchCurrentUser, getSetting, getMenuData, getDictionaries, fetchNotices } = this.props;
    Promise.all([getDictionaries(), fetchCurrentUser(), fetchNotices()])
      .then(([dic, user]) => {
        this.setState({ init: true });
        if (!user) {
          router.replace('/user/login');
        }
      });
    getSetting(); // 设置主题相关， 关联配置文件src/defaultSettings.js
    getMenuData(routes, authority);
    window.addEventListener('storage', this.autoLoginOut, true);
    // window.addEventListener('error', this.setDefaultImage, true)
  }

  autoLoginOut = (e) => {
    if (e.key === 'token' && e.newValue === null) {
      router.replace('/user/login');
    }
    // TODO 当两个页面未登录，同时登录时
    if (e.key === 'token' && e.newValue !== e.oldValue && e.newValue !== null && e.oldValue !== null){
      window.location.reload();
    }
  }

  componentWillUnmount (){
    // window.removeEventListener('error', this.setDefaultImage, true)
    window.removeEventListener('storage', this.autoLoginOut, true);
  }

  fn(array) {
    return array.reduce(
      (prev, curr) =>
        curr.routes && curr.routes.length
          ? [...prev, curr, ...this.fn(curr.routes)]
          : [...prev, curr],
      []
    );
  }

  componentDidUpdate (preProps) {
    // After changing to phone mode,
    // if collapsed is true, you need to click twice to display
    const { collapsed, isMobile, handleMenuCollapse, route, location, setTabs, tabs, activeKey, history } = this.props;
    const routes = this.fn(route.routes);
    const tab = routes.filter(item => item.path === location.pathname);
    const currentTab = tabs && tab.length ? tabs.filter(item => item.itemPath === tab[0].path) : [];
    if (tab && tab.length && (!currentTab.length && preProps.location.pathname !== location.pathname) ){
      const newTab = {
        name: location.query && location.query.pageKey ? `${tab[0].name}-${location.query.pageKey}` : tab[0].name,
        itemPath: tab[0].path,
        query: location.query,
        state: location.state,
        id: uuidv4(),
      };
      window.pagId = newTab.id;
      setTabs({
        items: [...tabs, newTab],
        activeKey: newTab.id,
      });
    } else if (tab && tabs.length && preProps.tabs.length > tabs.length){  // 如果tab删除
      const currentItem = tabs.find(item => item.id === activeKey);
      if (currentItem) {
        history.push(currentItem && currentItem.query ?  `${currentItem.itemPath}${pathQueryStr(currentItem.query)}` : currentItem.itemPath, currentItem.state && { ...currentItem.state });
        window.pagId = activeKey;
        setTabs({ items: [...tabs], activeKey });
      } else {
        const str = location.query && location.query.pageKey ? `${tab[0].name}-${location.query.pageKey}`: tab[0].name;
        const newRoute = tabs.find(item => item.name === str );
        setTabs({ items: [...tabs], activeKey: newRoute ? newRoute.id : '1' });
        window.pagId =  newRoute ? newRoute.id : '1';
      }
    } else if (tab.length && activeKey !== currentTab.activeKey && preProps.location.pathname !== location.pathname){ // 在已有tab的页面刷新
      // 如果有参数并且有pageKey的query tab.name拼接一下 否则就不拼接
      const str = location.query && location.query.pageKey ? `${tab[0].name}-${location.query.pageKey}`: tab[0].name;
      if (!(tabs.some(item => item.name === str))) { // 如果是详情、修改等页面 参数变了就要新打开一个tab页
        const newTab = {
          name: location.query && location.query.pageKey ? `${tab[0].name}-${location.query.pageKey}` : tab[0].name,
          itemPath: tab[0].path,
          query: location.query,
          state: location.state,
          id: uuidv4(),
        };
        window.pagId = newTab.id;
        setTabs({
          items: [...tabs, newTab],
          activeKey: newTab.id
        });
      } else { // 否则就不新打开
        let currentId = activeKey;
        let newTab = cloneDeep(tabs);
        const newObj = {
          name: currentTab[0].name,
          itemPath: currentTab[0].itemPath,
          query: location.query,
          state: location.state,
          id: currentTab[0].id,
        };
        newTab = newTab.map(item => {
          if (currentTab && (currentTab.length > 1 && item.name === str) ||  (currentTab.length === 1 && item.id === currentTab[0].id)) {
            currentId = item.id;
          }
          if (!tab[0].otherOpen && item.itemPath === location.pathname) { // 如果不需要另外打开一个页面
            if ((!isEmpty(item.query) && !isEqual(item.query, location.query)) || (!isEmpty(item.state) && !isEqual(item.state, location.state)) ) { // 如果是同一个页面但是打开的数据不同
              localStorage.removeItem(currentTab[0].id);
            }
            return  item = cloneDeep(newObj);
          }
          return item;
        });
        window.pagId = currentId;
        setTabs({ items: [...newTab], activeKey: currentId });
      }

    }
    if (isMobile && !preProps.isMobile && !collapsed) {
      handleMenuCollapse(false);
    }
  }

  getContext () {
    const { location, breadcrumbNameMap } = this.props;
    return {
      location,
      breadcrumbNameMap,
    };
  }

  matchParamsPath = (pathname, breadcrumbNameMap) => {
    const pathKey = Object.keys(breadcrumbNameMap).find(key => pathToRegexp(key).test(pathname));
    return breadcrumbNameMap[pathKey];
  };

  getRouterAuthority = (pathname, routeData) => {
    let routeAuthority = ['noAuthority'];
    const getAuthority = (key, routes) => {
      routes.map(route => {
        if (route.path === key) {
          routeAuthority = route.authority;
        } else if (route.routes) {
          routeAuthority = getAuthority(key, route.routes);
        }
        return route;
      });
      return routeAuthority;
    };
    return getAuthority(pathname, routeData);
  };

  getPageTitle = (pathname, breadcrumbNameMap) => {
    const currRouterData = this.matchParamsPath(pathname, breadcrumbNameMap);

    if (!currRouterData) {
      return '易键达';
    }
    const pageName = currRouterData.name;

    return `${pageName}`;
  };

  getLayoutStyle = () => {
    const { fixSiderbar, isMobile, collapsed, layout } = this.props;
    if (fixSiderbar && layout !== 'topmenu' && !isMobile) {
      return {
        paddingLeft: collapsed ? '80px' : '256px',
      };
    }
    return null;
  };

  render () {
    const {
      navTheme,
      layout: PropsLayout,
      children,
      location: { pathname },
      isMobile,
      menuData,
      breadcrumbNameMap,
      route: { routes },
      fixedHeader,
      handleMenuCollapse
    } = this.props;

    const isTop = PropsLayout === 'topmenu';
    const routerConfig = this.getRouterAuthority(pathname, routes);
    const contentStyle = !fixedHeader ? { paddingTop: 0 } : {};
    const layout = (
      <Layout>
        {isTop && !isMobile ? null : (
          <SiderMenu
            logo={logo}
            theme={navTheme}
            onCollapse={handleMenuCollapse}
            menuData={menuData}
            isMobile={isMobile}
            {...this.props}
          />
        )}
        <Layout
          style={{
            ...this.getLayoutStyle(),
            minHeight: '100vh',
          }}
        >
          <Header
            menuData={menuData}
            handleMenuCollapse={handleMenuCollapse}
            logo={logo}
            isMobile={isMobile}
            {...this.props}
          />
          <Content className={styles.content} style={contentStyle}>
            <Authorized authority={routerConfig} noMatch={<Exception403 />}>
              <Card bordered={false}>
                {this.state.init ? children : 'loading...'}
              </Card>
            </Authorized>
          </Content>
          <Footer />
        </Layout>
      </Layout>
    );
    return (
      <React.Fragment>
        <DocumentTitle title={this.getPageTitle(pathname, breadcrumbNameMap)}>
          <ContainerQuery query={query}>
            {params => (
              <Context.Provider value={this.getContext()}>
                <div className={classNames(params)}>{layout}</div>
              </Context.Provider>
            )}
          </ContainerQuery>
        </DocumentTitle>
      </React.Fragment>
    );
  }
}

function mapDispatchToProps (dispatch) {
  return {
    fetchNotices: () => dispatch({ type: 'global/fetchNotices' }),
    fetchCurrentUser: () => dispatch({ type: 'user/fetchCurrent' }),
    getSetting: () => dispatch({ type: 'setting/getSetting' }),
    setTabs: (payload) => dispatch({ type: 'commonStore/setTabs',  payload }),
    getMenuData: (routes, authority) => dispatch({ type: 'menu/getMenuData', payload: { routes, authority } }),
    handleMenuCollapse: collapsed => dispatch({ type: 'global/changeLayoutCollapsed', payload: collapsed }),
    getDictionaries: type => dispatch(getDictionaries(type))
  };
}

export default connect(({ global, setting, menu, commonStore }) => ({
  collapsed: global.collapsed,
  layout: setting.layout,
  menuData: menu.menuData,
  ...commonStore,
  breadcrumbNameMap: menu.breadcrumbNameMap,
  ...setting,
}), mapDispatchToProps)(props => (
  <Media query="(max-width: 599px)">
    {isMobile => <BasicLayout {...props} isMobile={isMobile} />}
  </Media>
));
