import React from 'react';
import TableContainer from '@/components/Table/TableContainer';
import { getAuthority } from '@/utils/authority';
import auth from '@/constants/authCodes';

@TableContainer({ order : 'desc' })
export default class CacheWrap extends React.Component {

  constructor (props){
    super(props);
    const { match : { path } } = this.props;
    if (path === '/buiness-center/project' || path === '/buiness-center/goodsPlansList' || path === '/buiness-center/preBookingList' || path === '/buiness-center/transportList' || path === '/buiness-center/billDelivery'){
      const { ACCOUNT } = auth;
      const ownedPermissions = getAuthority();
      const spacialAuthes = [ACCOUNT];  // 能够查看全部项目预约单运单的权限
      const check = spacialAuthes.some(auth => ownedPermissions.indexOf(auth) > -1);
      props.setDefaultFilter({ isPermissonSelectAll:check||undefined });
    }
  }

  render () {
    return this.props.children;
  }
}
