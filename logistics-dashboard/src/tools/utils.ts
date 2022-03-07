import { forEach } from 'lodash';
import { createAction } from 'redux-actions';

/**
 * 对model进行转换
 *  - 转换effects，以支持async/await语法
 *  - 自动绑定 action方法
 * @param model
 * @returns {*}
 */
export function formatModel(model?: any) {
  const { namespace } = model;
  if (model.effects) {
    const effects = {};
    const actions = {};
    forEach(model.effects, (effect, name) => {
      function* fetch({ payload }, { call, put }) {
        const response = yield call(effect, payload);

        yield put({
          type: `_${name}Reduce`,
          payload: response,
        });

        return response;
      }
      effects[name] = fetch;
      actions[name] = createAction(`${namespace}/${name}`);
    });
    return { ...model, effects, actions };
  }
  return model;
}
