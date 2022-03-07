import React from 'react';
import withBreadcrumbs from 'react-router-breadcrumbs-hoc';

export default ({ routes }) => {
  const copyRoutes = routes.filter(item => item.path).map(item => ({ ...item }));

  copyRoutes.forEach(filterRouteWithPath);
  const Breadcrumbs = withBreadcrumbs(copyRoutes)(({ breadcrumbs }) => (
    <div className="breadcrumbs">
      {breadcrumbs.map((breadcrumb, index) => {
        const isLast = index === breadcrumbs.length - 1;
        const { pathname, search } = window.location;
        const to = isLast ? `${pathname}${search}` : breadcrumb.match.url;
        return breadcrumb.skipLevel
          ? null
          : (
            <span to={to} key={breadcrumb.key}>
              <span className="breadcrumb-item">
                {breadcrumb.name}
              </span>
              {(index < breadcrumbs.length - 1) && (index || '') && <i style={{ color: '#5f5f5f' }}> / </i>}
            </span>
          );
      })}
    </div>
  ));

  return <Breadcrumbs />;
};

function filterRouteWithPath (route) {
  if (route.routes) {
    route.routes = route.routes.filter(item => item.path);
    route.routes.forEach(filterRouteWithPath);
  }
}
