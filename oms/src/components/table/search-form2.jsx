import React from 'react';
import { SchemaForm, FORM_MODE } from '@gem-mine/antd-schema-form';
import { isFunction } from '@/utils/utils';
import { FilterContextCustom } from './filter-context';
import '@gem-mine/antd-schema-form/lib/fields';

const SearchForm = FilterContextCustom((props)=>{
  const { setFilter, filter } = props;

  // const [_filter] = useState({ ...filter })

  function onValuesChange (props, changeValue){
    if (isFunction(setFilter)&&changeValue){
      setFilter( changeValue );
    }
  }
  // 删除props中的setFilter和resetFilter去除控制台警告
  const _props = {};
  Object.keys(props).forEach(keyName => {
    if (keyName !== 'setFilter' && keyName !== 'resetFilter' && keyName !== 'fieldsSchema'){
      _props[keyName] = props[keyName];
    }
  });
  return <SchemaForm {..._props} onChange={onValuesChange} mode={FORM_MODE.SEARCH} data={filter} />;
});

export default SearchForm;
