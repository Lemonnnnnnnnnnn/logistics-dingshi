import React, { useContext } from 'react';

const FilterContext = React.createContext({
  filter: {},             // 当前filter内容
  setFilter:null,         // 设置filter
  resetFilter:null           // 重置filter
});

export default FilterContext;

export function FilterContextCustom (Component) {
  return (props) => {
    const filterContextProps = useContext(FilterContext);
    return <Component {...props} {...filterContextProps} />;
  };
}
