import { connect } from 'dva';
import { isFunction } from 'lodash';

export default function BindStore (scope, config = {}) {
  const Model = require(`@/models/${scope}`)
  const actions = { ...Model.default.actions }
  return (CustomizedForm) => connect(state => isFunction(config.mapStateToProps) ? config.mapStateToProps(state[scope]) : state[scope], actions)(CustomizedForm)
}
