// ref: https://umijs.org/config/
import { primaryColor } from '../src/defaultSettings';
// import px2rem from 'postcss-px2rem'
import path from 'path'
import routes from './routes.js'

export default {
  plugins: [
    // ["babel-plugin-add-module-exports"],
    [
      'umi-plugin-react',
      {
        antd: true,
        dva: {
          hmr: true
        },
        locale: {
          enable: false, // default false
          default: 'zh-CN', // default zh-CN
          baseNavigator: true // default true, when it is true, will use `navigator.language` overwrite default
        },
        dynamicImport: {
          webpackChunkName:true,
          loadingComponent: './components/PageLoading/index'
        },
        // title:{}
      }
    ],
    [
      'umi-plugin-pro-block',
      {
        moveMock: false,
        moveService: false,
        modifyRequest: true,
        autoAddMenu: true
      }
    ]
  ],
  targets: {
    ie: 11
  },
  // extraPostCSSPlugins: [px2rem({remUnit: 75})],
  // cssLoaderOptions: {
  //   exclude: /node_modules/
  // },
  chainWebpack(config, { webpack }) {
    // config.module.rule('css').use('postcss-loader', {
    //   exclude: /node_modules/
    // })

    // config.module.rule('less').exclude.add(/node_modules/).end()
    // config.module.rule('css').exclude.add(/node_modules/).end()
    // config.module.rule('less').exclude.add([path.resolve('node_modules')])
  },

  /**
   * 路由相关配置
   */
  routes,
  disableRedirectHoist: true,
  /**
   * webpack 相关配置
   */
  define: {
    APP_TYPE: process.env.APP_TYPE || ''
  },
  alias: {
    '~': path.resolve(__dirname, '../src'),
    components: path.resolve(__dirname, '../src/components'),
    'fish': 'antd',
    '@sdp.nd/fish-mobile':'antd-mobile',
    // '@ant-design/icons/lib/dist$': path.resolve(__dirname, '../src/icons.js'),
  },
  extraBabelIncludes:[ path.resolve(__dirname, '../node_modules/@gem-mine')],
  // Theme for antd
  // https://ant.design/docs/react/customize-theme-cn
  theme: {
    'primary-color': primaryColor
  },
  // externals: {
  //   '@antv/data-set': 'DataSet'
  // },
  // disableCSSModules:true,
  hash:true,
  ignoreMomentLocale: true,
  lessLoaderOptions: {
    javascriptEnabled: true
  }
};
