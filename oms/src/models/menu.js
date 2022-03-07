import memoizeOne from 'memoize-one';
import isEqual from 'lodash/isEqual';
import Authorized from '@/utils/Authorized';
import { getUserInfo } from '@/services/user'
import { isString } from '@/utils/utils'

const { check } = Authorized;

// Conversion router to menu.
function formatter (data, parentAuthority, parentName = '') {
  return data
    .map(item => {
      if (!item.name || !item.path) {
        return null;
      }

      let locale = parentName;

      if (!item.skipLevel) {
        if (parentName) {
          locale = `${parentName}.${item.name}`;
        } else {
          locale = `${item.name}`;
        }
      }

      const result = {
        ...item,
        name: item.name,
        locale,
        authority: item.authority || parentAuthority,
      };
      if (item.routes) {
        const children = formatter(item.routes, item.authority, locale);
        // Reduce memory usage
        result.children = children;
      }
      delete result.routes;
      return result;
    })
    .filter(item => item);
}

const memoizeOneFormatter = memoizeOne(formatter, isEqual);

const skipLevelNode = (routes, parent) => {
  routes.forEach(route => {
    if (route.children && route.children.length) {
      if (route.skipLevel) {
        const index = parent.children.findIndex(subRoute => subRoute.name === route.name)
        parent && parent.children.splice(index, 1, ...route.children)
      }
      skipLevelNode(route.children, route)
    }
  })
}

/**
 * get SubMenu or Item
 */
const getSubMenu = item => {
  // doc: add hideChildrenInMenu
  if (item.children && !item.hideChildrenInMenu && item.children.some(child => child.name)) {
    return {
      ...item,
      children: filterMenuData(item.children), // eslint-disable-line
    };
  }
  return item;
};

/**
 * filter menuData
 */
const filterMenuData = menuData => {
  if (!menuData) {
    return [];
  }
  const { organizationType } = getUserInfo()
  return menuData
    .filter(item => item.name && !item.hideInMenu)
    .filter(item => {
      let orgAuthority = item.organizationType || []
      if (isString(item.organizationType)) {
        orgAuthority = [item.organizationType]
      }
      return orgAuthority.indexOf(organizationType) > -1 || !orgAuthority.length
    })
    .map(item => check(item.authority, getSubMenu(item)))
    .filter(item => item);
};
/**
 * 获取面包屑映射
 * @param {Object} menuData 菜单配置
 */
const getBreadcrumbNameMap = menuData => {
  const routerMap = {};

  const flattenMenuData = data => {
    data.forEach(menuItem => {
      if (menuItem.children) {
        flattenMenuData(menuItem.children);
      }
      // Reduce memory usage
      routerMap[menuItem.path] = menuItem;
    });
  };
  flattenMenuData(menuData);
  return routerMap;
};

const memoizeOneGetBreadcrumbNameMap = memoizeOne(getBreadcrumbNameMap, isEqual);

export default {
  namespace: 'menu',

  state: {
    menuData: [],
    breadcrumbNameMap: {},
  },

  effects: {
    *getMenuData ({ payload }, { put }) {
      const { routes, authority } = payload;

      const menuData = filterMenuData(memoizeOneFormatter(routes, authority))
      skipLevelNode(menuData)
      const breadcrumbNameMap = memoizeOneGetBreadcrumbNameMap(menuData);
      yield put({
        type: 'save',
        payload: { menuData, breadcrumbNameMap },
      });
    },
  },

  reducers: {
    save (state, action) {
      return {
        ...state,
        ...action.payload,
      };
    },
  },
};
