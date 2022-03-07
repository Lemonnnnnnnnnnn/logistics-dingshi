import React, { lazy, Suspense, useState, useEffect } from 'react';
import { Tabs } from 'antd';
import router from 'umi/router';
import { getAuthority } from '../../utils/authority';
import auth from '../../constants/authCodes';

const ownedPermissions = getAuthority();
const { TabPane } = Tabs;
const {
  CARGO_LIST_AUTH,
  CONSIGNMENT_LIST_AUTH,
  SHIPMENT_LIST_AUTH,
  DRIVER_LIST_AUTH,
  CAR_LIST_AUTH
} = auth;

const CargoCertification = lazy(() => import('./sub-page/cargo-certification/cargo-certification.jsx'));
const CarCertification = lazy(() => import('./sub-page/car-certification/car-certification.jsx'));
const ConsignmentCertification = lazy(() => import('./sub-page/consignment-certification/consignment-certification.jsx'));
const DriverCertification = lazy(() => import('./sub-page/driver-certification/driver-certification.jsx'));
const ShipmentCertification = lazy(() => import('./sub-page/shipment-certification/shipment-certification.jsx'));

const tabs = [
  // {
  //   title: '货权认证',
  //   key: 'cargo',
  //   component: CargoCertification
  // },
  {
    title: '托运认证',
    key: 'consignment',
    auth:[CONSIGNMENT_LIST_AUTH],
    component: ConsignmentCertification
  },
  {
    title: '承运认证',
    key: 'shipment',
    auth:[SHIPMENT_LIST_AUTH],
    component: ShipmentCertification
  },
  {
    title: '货权认证',
    key: 'cargo',
    auth:[CARGO_LIST_AUTH],
    component: CargoCertification
  },
  {
    title: '司机认证',
    key: 'driver',
    auth:[DRIVER_LIST_AUTH],
    component: DriverCertification
  },
  {
    title: '车辆认证',
    key: 'car',
    auth:[CAR_LIST_AUTH],
    component: CarCertification
  }
];

export default ({ location }) => {
  const [currentTab, changeTab] = useState(tabs[0].title);
  const changeRoute = key => router.replace(key);
  useEffect(() => {
    const currentTabMatch = location.pathname.match(/[^/]+$/);
    currentTabMatch && changeTab(currentTabMatch[0]);
  }, [location.pathname]);
  const tabsHasPermissions = tabs.filter(({ auth: authes }) => authes.some(auth => ownedPermissions.indexOf(auth) > -1));

  return (
    <Tabs activeKey={currentTab} onChange={changeRoute}>
      {
        tabsHasPermissions.map(tab => (
          <TabPane tab={tab.title} key={tab.key}>
            <Suspense fallback={<div>Loading...</div>}>
              <tab.component />
            </Suspense>
          </TabPane>
        ))
      }
    </Tabs>
  );
};
