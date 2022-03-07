import './envConfig';
import 'core-js/stable'
import 'regenerator-runtime/runtime'
import 'intl';
import 'intl/locale-data/jsonp/en';

Object.setPrototypeOf = require('setprototypeof')
/* eslint-disable */

export const dva = {
  config: {
    onError(e) {
      e.preventDefault()
      Promise.reject(e)
    }
  },
  // plugins: process.env.NODE_ENV === 'development'
  //   ? [require('dva-logger')()]
  //   : []
}
