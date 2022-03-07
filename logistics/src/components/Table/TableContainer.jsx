import React from 'react';
import { connect } from 'dva';
import { isEqual, isFunction } from '@/utils/utils';
import { defaultPageSize } from '@/defaultSettings';
import FilterContext from './FilterContext';


// 默认列表查询条件
const DEFAULT_FILTER = {
  limit: defaultPageSize,
  offset: 0,
};


// 一个Table的高阶组件，将table和form组合起来，实现查询条件保存与连动
export default function TableContainer(filterSettings = {}) {
  const defaultFilter = { ...DEFAULT_FILTER, ...filterSettings };
  let model;
  let setFilter;
  let mapStateToProps = null;
  const mapDispatchToProps = null;
  const { scope } = defaultFilter;
  if (scope) {
    delete defaultFilter.scope;
    // eslint-disable-next-line global-require
    model = require(`@/models/${scope}`);
    setFilter = model.default.actions.setFilter;
    mapStateToProps = state => ({
      filter: state[scope].filter,
    });
  }

  return (Compoent) => connect(mapStateToProps, { setFilter })(class extends React.Component {
    constructor(props) {
      super(props);
      this.state = {
        filter: { ...defaultFilter, ...props.filter },
        oldFilter: props.filter,
        componentDefaultFilter: {},
      };
    }

    // 解决运单中componentDidMount内的setFilter不生效问题
    static getDerivedStateFromProps({ filter: newFilter }, state) {
      if (!isEqual(state.filter, newFilter)) {
        state.filter = { ...state.filter, ...newFilter };
        return state.filter = { ...state.filter, ...newFilter };
      }
      return null;
    }

    setFilter = (newFilter) => {
      const { filter, componentDefaultFilter } = this.state;
      const _filter = { ...filter, ...componentDefaultFilter, ...newFilter };
      const { setFilter: syncFilter } = this.props;
      this.setState({ filter: _filter });
      isFunction(syncFilter) && syncFilter(_filter);
      return _filter;
    }

    setDefaultFilter = filter => {
      this.setState({
        componentDefaultFilter: { ...filter },
      });
    }

    resetFilter = (newFilter = {}) => {
      const { componentDefaultFilter } = this.state;
      const filter = { ...defaultFilter, ...componentDefaultFilter, ...newFilter };
      const { setFilter: syncFilter } = this.props;

      isFunction(syncFilter) && syncFilter(filter);
      this.setState({ filter });
      return filter;
    }

    render() {
      const { filter, componentDefaultFilter } = this.state;
      const { resetFilter, setFilter, setDefaultFilter } = this;
      const _props = {
        ...this.props,
        filter: { ...componentDefaultFilter, ...filter },
        resetFilter,
        setFilter,
        setDefaultFilter,
      };

      return (
        <FilterContext.Provider value={{ filter: { ...componentDefaultFilter, ...filter }, resetFilter, setFilter }}>
          <Compoent {..._props} />
        </FilterContext.Provider>
      );
    }

  });
}
