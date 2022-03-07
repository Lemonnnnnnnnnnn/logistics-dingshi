import React from "react";
import { connect } from "dva";
import { Checkbox } from "antd";
import CSSModule from "react-css-modules";
import styles from "./AuthList.css";
import { isArray, pullAllBy, unionBy } from "@/utils/utils";
import useLessAuth from '@/constants/hidedAuthCodes';


const isRootAuth = auth => auth.permissionCode.length === 2;

// 将拍平的权限列表装换成森林
const transformAuthArrayToForest = (authList, selectedValue) => {
  const _authList = authList.map(item => ({
    ...item,
    checked: !!selectedValue.find(selected => selected.permissionCode === item.permissionCode)
  }));

  return _authList.reduce((forset, auth) => {
    if (isRootAuth(auth)) {
      forset.push(auth);
      auth.children || (auth.children = []);
    } else {
      const parentKey = auth.permissionCode.substr(0, auth.permissionCode.length - 2);
      const parent = _authList.find(item => item.permissionCode === parentKey);
      if (parent) {
        parent.children || (parent.children = []);
        parent.children.push(auth);
      }
    }

    return forset;
  }, []);
};

// 按钮权限
const ButtonPermission = CSSModule(styles)(({ buttonPermission, onChange }) => {
  const changePermission = event => {
    const { checked } = event.target;
    onChange(buttonPermission, checked);
  };
  return <label styleName="button-auth"><Checkbox
    checked={buttonPermission.checked}
    onChange={changePermission}
  /> {buttonPermission.permissionName}
  </label>;
});

// 页面权限
const PagePermission = CSSModule(styles)(({ pagePermission, onChange }) => isArray(pagePermission.children) ? (
  <div styleName="page-auth">
    <div styleName="page-auth-name">{pagePermission.permissionName}</div>
    {pagePermission.children.map(button => <ButtonPermission
      onChange={onChange}
      key={button.permissionId}
      buttonPermission={button}
    />)}
  </div>
) : null);

// 模块
const ModulePermission = CSSModule(styles)(({ modulePermission, onChange, onToggleSelectAll }) => {
  const children = modulePermission.children || [];
  const allPermissionsInModule = children.flatMap(item => item.children || []);
  const isSelectedAll = allPermissionsInModule.every(item => item.checked);
  const isIndeterminate = !isSelectedAll && allPermissionsInModule.some(item => item.checked);
  const toggleSelectAll = () => onToggleSelectAll(allPermissionsInModule, !isSelectedAll);

  return (
    <div className="module-auth">
      <div styleName="module-auth-name">{modulePermission.permissionName}:</div>
      <div styleName="page-auth-block">
        <div styleName="page-auth">
          <label styleName="page-auth-name"><Checkbox
            checked={isSelectedAll}
            indeterminate={isIndeterminate}
            onChange={toggleSelectAll}
          /> 全选
          </label>
        </div>
        {modulePermission.children.map(page => <PagePermission
          onChange={onChange}
          key={page.permissionId}
          pagePermission={page}
        />)}
      </div>
    </div>
  );
});


const removeAuth = authList => authList.filter(item => useLessAuth.indexOf(item.permissionCode) < 0);

const AuthList = ({ authList = [], onChange, value = [] }) => {
  const finalAuth = removeAuth(authList);
  const forest = transformAuthArrayToForest(finalAuth, value);
  const changePermission = (permission, checked) => {
    const nextValue = checked ? [...value, permission] : value.filter(item => item.permissionCode !== permission.permissionCode);

    onChange(nextValue);
  };
  const toggleSelectAll = (permissions, checked) => {
    const processMethod = checked ? unionBy : pullAllBy;
    const nextValue = processMethod(value, permissions, "permissionCode");
    onChange(nextValue);
  };

  return (
    <div className="auth-list">
      {forest.map(tree => <ModulePermission
        onChange={changePermission}
        key={tree.permissionId}
        onToggleSelectAll={toggleSelectAll}
        modulePermission={tree}
      />)}
    </div>
  );
};

export default connect(state => ({
  authList: state.auth.organizationAuth.items
}))(CSSModule(styles)(AuthList));
