import React from "react";
import { Route, Switch, Redirect, routerRedux } from "dva/router";
import * as H from "history";
import routes from "../router";
import { Default, Other } from "../layouts";
import { CacheRoute, CacheSwitch } from "react-router-cache-route";
import flatten from "../utils/flatten";
const { ConnectedRouter } = routerRedux;

interface IProps {
  history: H.History;
}
const Container: React.FunctionComponent<IProps> = ({
  history
}): JSX.Element => {
  return (
    <ConnectedRouter history={history}>
      <CacheSwitch>
        <Redirect from="/" to="home" exact />
        {flatten(routes, "routes")
          .filter(route => route.path)
          .map(({ component: Component, ...others }, index) => {
            const renderHandler = (props: any) => {
              return others.isMenu ? (
                <Default {...props} routes={routes}>
                  <Component {...props} />
                </Default>
              ) : (
                <Other {...props} routes={routes}>
                  <Component {...props} />
                </Other>
              );
            };
            return others.cache ? (
              <CacheRoute
                key={index}
                component={renderHandler}
                {...others}
                exact
              />
            ) : (
              <Route key={index} component={renderHandler} {...others} exact />
            );
          })}
      </CacheSwitch>
    </ConnectedRouter>
  );
};

export default Container;
