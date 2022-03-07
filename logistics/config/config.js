// ref: https://umijs.org/config/
import { primaryColor } from '../src/defaultSettings';
import path from 'path'
import routes from './routes.js'

export default {
  // chainWebpack: function (config, { webpack }) {
  //   config.merge({
  //     optimization: {
  //       minimize: true,
  //       splitChunks: {
  //         chunks: 'all',
  //         minSize: 30000,
  //         minChunks: 2,
  //         automaticNameDelimiter: '~',
  //         cacheGroups: {
  //           bizchartsGroup: {
  //             name: "bizcharts",
  //             test: /[\\/]node_modules[\\/]bizcharts|@antv[\\/]/,
  //             chunks: "async",
  //             priority: 10
  //           },
  //           aliyunOss: {
  //             name: 'aliyunOss',
  //             chunks: 'async',
  //             test: /[\\/]node_modules[\\/]ali-oss[\\/]/,
  //             priority: 10,
  //           }
  //         },
  //       },
  //     }
  //   });
  // },
  plugins: [
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
          webpackChunkName: true,
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
  // treeShaking: true, //去除那些引用的但却没有使用的代码
  // 开启 treeShaking 则 package内需要增加下列设置
  // "sideEffects": [
  //   "./src/envConfig.js"
  // ],
  targets: {
    ie: 10
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
  extraBabelPlugins: [
    ['@babel/plugin-proposal-decorators', { legacy: true }],
    '@babel/plugin-transform-block-scoping',
    '@babel/plugin-proposal-class-properties',
    ['@babel/plugin-transform-classes', { loose: true }],
    '@babel/plugin-transform-proto-to-assign'
  ],
  alias: {
    '~': path.resolve(__dirname, '../src'),
    components: path.resolve(__dirname, '../src/components'),
    'fish': 'antd',
    '@sdp.nd/fish': 'antd',
    '@ant-design/icons/lib/dist$': path.resolve(__dirname, '../src/icons.js')
  },
  extraBabelIncludes: [path.resolve(__dirname, '../node_modules/@gem-mine')],
  // Theme for antd
  // https://ant.design/docs/react/customize-theme-cn
  theme: {
    'primary-color': primaryColor
  },
  // externals: {
  //   '@antv/data-set': 'DataSet'
  // },
  // disableCSSModules:true,
  hash: true,
  ignoreMomentLocale: true,
  lessLoaderOptions: {
    javascriptEnabled: true
  }
};
