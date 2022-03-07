import request from '@/utils/request'
import { toCamelCase, isArray } from '@/utils/utils'
import { defaultPageSize } from '@/defaultSettings'

const specialTypes = ['setFilter', 'mergeFilter', 'clearFilter', 'setDetail', 'clearEntity'] // 这个列表里的type不做改动直接返回

/**
 *
 * @param {string|object} params
 * 根据params返回一个model，并与原始model合并
 * params为object时， 必须包含name
 */
function bindSource (...params) {
  const sources = params.reduce((finalSource, param) => {
    const partialSource = createSource(param)
    const _finalSource = {
      requests: mergeTargetProps(finalSource, partialSource, 'requests'),
      state: mergeTargetProps(finalSource, partialSource, 'state'),
      effects: mergeTargetProps(finalSource, partialSource, 'effects'),
      reducers: mergeTargetProps(finalSource, partialSource, 'reducers')
    }

    return _finalSource
  }, {})

  return ({ effects: modelEffects, reducers: modelReducers, state: modelState, ...lastModel }) => {
    const finalEffects = getEffectsInjectRequests({ ...sources.effects, ...modelEffects }, sources.requests)
    const finalReducers = { ...sources.reducers, ...modelReducers }
    const finalState = { ...sources.state, ...modelState }

    return {
      requests: sources.requests,
      state: finalState,
      effects: finalEffects,
      reducers: finalReducers,
      ...lastModel
    }
  }
}

function mergeTargetProps (dist, src, propName) {
  return {
    ...dist[propName],
    ...src[propName]
  }
}

function createSource (partialSource) {
  const simpleMode = typeof partialSource === 'string'
  const nameSpace = simpleMode ? partialSource : partialSource.name
  const requests = createRequest(partialSource)
  const effects = createEffects(nameSpace, requests)
  const reducers = createReduces(nameSpace, getRowKey(partialSource))
  const state = createState()

  return {
    requests,
    state,
    effects,
    reducers
  }
}

function createState () {
  return {
    items: [],
    count: 0,
    entity: {},
    filter: {
      limit: defaultPageSize,
      offset: 0
    }
  }
}

/**
 * 创建默认的reducers
 * @param {string} namespace
 */
function createReduces (namespace, rowKey) {
  const reducers = [
    { type: 'get', reduce: _createReduce(payload => payload) },
    { type: 'put', reduce: _createReduce((payload, state) => replaceTargetItemInList(payload, state.items, rowKey)) },
    { type: 'patch', reduce: _createReduce((payload, state) => replaceTargetItemInList(payload, state.items, rowKey)) },
    { type: 'post', reduce: _createReduce(() => ({})) }, // post更新什么?
    { type: 'detail', reduce: _createReduce(payload => ({ entity: payload })) },
    { type: 'setFilter', reduce: _createReduce(payload => ({ filter: payload })) },
    { type: 'mergeFilter', reduce: _createReduce((payload, state) => ({ filter: { ...state.filter, ...payload } })) },
    { type: 'clearFilter', reduce: _createReduce(() => ({ filter: {} })) },
    { type: 'clearEntity', reduce: _createReduce(() => ({ entity: {} })) },
    {
      type: 'setDetail', reduce: _createReduce((payload, state) => {
        const { items } = state

        return {
          entity: typeof payload === 'number' ? items[payload] : payload
        }
      })
    }
  ]

  return reducers.reduce((reducers, item) => {
    const reduceName = createReduceName(item.type, namespace)
    return {
      ...reducers,
      [reduceName]: item.reduce
    }
  }, {})
}

function replaceTargetItemInList (newItem, list, rowKey) {
  const index = list.findIndex(item => item[rowKey] === newItem[rowKey])
  const oldItem = list[index]

  if (!oldItem) {
    console.warn('未找到对应的记录，请检查model的rowKey是否正确')
    return {
      items: [...list]
    }
  }

  return {
    items: [
      ...list.slice(0, index),
      { ...oldItem, ...newItem },
      ...list.slice(index + 1)
    ]
  }
}

function getRowKey (namespace) {
  if (namespace.rowKey) {
    return namespace.rowKey
  }

  const name = (namespace.name || namespace).replace(/(s|es|ies)$/, match => ({ es: '', s: '', ies: 'y' }[match]))
  return toCamelCase(`${name}_id`)
}

function createReduceName (type, namespace) {
  return specialTypes.findIndex(t => t === type) > -1
    ? type
    : toCamelCase(`_${type}_${namespace}Reduce`)
}

/**
 * 获取更新的state
 * @param {function} getPartialState
 */
function _createReduce (getPartialState) {
  return function create (state, { payload }) {
    return {
      ...state,
      ...getPartialState(payload, state)
    }
  }
}

function createEffects (namespace) {
  const requestEffectNames = ['get', 'post', 'detail', 'put', 'patch', 'delete', ...specialTypes]

  return requestEffectNames.reduce((effects, name) => {
    const effectName = createEffectName(name, namespace)

    return {
      ...effects,
      [effectName]: _createEffect(effectName)
    }
  }, {})
}


function createEffectName (type, nameSpace = '') {
  return specialTypes.findIndex(t => t === type) > -1
    ? type
    : toCamelCase(`${type}_${nameSpace}`)
}

function _createEffect (type) {
  return async (payload, requests) => {
    const request = requests[type]
    return typeof request === 'function'
      ? await request(payload)
      : await payload
  }
}

/**
 *
 * @param {object} effects 原始effects
 * @param {object} requests
 * 返回注入了requests的effect, 返回的effect的第三个参数为requests
 */
function getEffectsInjectRequests (effects, requests) {
  return Object.keys(effects).reduce((newEffects, name) => {
    const oldEffect = effects[name]

    return {
      ...newEffects,
      [name]: async (...params) => await oldEffect(...params, requests)
    }
  }, {})
}

function schemaItems ({ count, ...lastPayload } = {}) {
  const itemsKey = Object.keys(lastPayload).find(key => isArray(lastPayload[key]))
  const items = itemsKey ? lastPayload[itemsKey] : []
  return {
    count,
    items
  }
}

/**
 *
 * @param {string|object} namespace 传入的source
 * 当namespace为string时，返回defaultRequest
 * 当namespace为object时，返回defaultRequest与namespace中request的合并值
 */
function createRequest (namespace) {
  const dataSchema = { get: schemaItems, ...namespace.dataSchema }
  const isSimpleMode = typeof namespace === 'string'
  const name = isSimpleMode ? namespace : namespace.name
  const urls = createRequestUrl(namespace)
  const nodes = [
    { type: 'get', method: (params, options) => sendRequest('get', replaceId(urls.get, params), params, options) }, //  request.get(replaceId(urls.get, params), { params })
    { type: 'post', method: (data, options) => sendRequest('post', replaceId(urls.post, data), data, options) }, //  request.post(replaceId(urls.post, data), { data })
    { type: 'detail', method: (params, options) => sendRequest('get', replaceId(urls.detail, params), params, options) }, // request.get(replaceId(urls.detail, params), { params })
    { type: 'put', method: (data, options) => sendRequest('put', replaceId(urls.put, data), data, options) }, // request.put(replaceId(urls.put, data), { data })
    { type: 'patch', method: (data, options) => sendRequest('patch', replaceId(urls.patch, data), data, options) }, // request.patch(replaceId(urls.patch, data), { data })
    { type: 'delete', method: (params, options) => sendRequest('delete', replaceId(urls.delete, params), params, options) } // request.delete(replaceId(urls.delete, params))
  ]
  const requestsFromParams = getRequestFromParam(namespace)

  const defaultRequests = nodes.reduce((requests, node) => {
    const requestName = toCamelCase(`${node.type}_${name}`)
    const request = requestsFromParams[requestName] || node.method

    return {
      ...requests,
      [requestName]: (params, options) => request(params, options).then(data => {
        const schemaMethod = dataSchema[node.type]
        return typeof schemaMethod === 'function'
          ? schemaMethod(data)
          : data
      })
    }
  }, requestsFromParams)

  return defaultRequests
}

function sendRequest (method = 'get', url, params, options = {}) {
  // const finalRequest = params && params.customError ? requestNotHandleError : request
  const argName = {
    post: 'data',
    put: 'data',
    patch: 'data'
  }[method] || 'params'

  if (params && params.errorHandler) {
    options.errorHandler = params.errorHandler
    delete params.errorHandler
  }

  return request(url, { ...options, method, [argName]: params })
}

/**
 *
 * @param {object} param object类型的source
 * 返回source中的request，这里将source中的function都认为是request处理
 */
function getRequestFromParam (param) {
  return Object.keys(param).reduce((requests, key) => {
    const value = param[key]

    return typeof value === 'function'
      ? {
        ...requests,
        [key]: value
      }
      : requests
  }, {})
}

/**
 *
 * @param {string} namespace
 * 根据restful返回默认的request
 */
function createRequestUrl (namespace) {
  const baseUrl = namespace.url || namespace.name || namespace
  const paramsId = toCamelCase(`${namespace.name || namespace}_id`)
  return {
    get: `/v1/${baseUrl}`,
    post: `/v1/${baseUrl}`,
    detail: `/v1/${baseUrl}/{:${getRowKey(namespace)}}`,
    put: `/v1/${baseUrl}/{:${paramsId}}`,
    patch: `/v1/${baseUrl}/{:${getRowKey(namespace)}}`,
    delete: `/v1/${baseUrl}/{:${paramsId}}`
  }
}

function replaceId (url, params) {
  return url.replace(/\{:([^}]+)\}/, (match, group) => params[group])
}

export default bindSource
// 用法一. bindSource('users')(model)
