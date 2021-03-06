const os = require('os');
const crypto = require('crypto');
const webpack = require('webpack');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const CopyPlugin = require('copy-webpack-plugin');
const HappyPack = require('happypack');
const happyThreadPool = HappyPack.ThreadPool({ size: os.cpus().length });
const createHappyPlugin = (id, loaders) =>
  new HappyPack({
    id: id,
    loaders: loaders,
    threadPool: happyThreadPool,
    verbose: true,
  });
const getHash = (str, length) => {
  const hashVersion = 'v1';
  const md5 = crypto.createHash('md5');
  const hex = md5.update(`${str}${hashVersion}`).digest('hex');
  return Buffer.from(hex)
    .toString('base64')
    .substr(0, length);
};

module.exports = env => ({
  mode: 'development',
  bail: true,
  entry: {
    app: ['babel-polyfill', './src/index.tsx'],
  },
  output: {
    path: `${__dirname}/dist`,
    filename: '[name].[contenthash].bundle.js',
    chunkFilename: '[name].[contenthash].bundle.js',
    publicPath: '/tender/',
  },
  resolve: {
    modules: ['node_modules'],
    extensions: ['.ts', '.tsx', '.js', '.jsx'],
    alias: {
      '@': require('path').resolve(__dirname, 'src'), // eslint-disable-line
      'fish':'antd',
    },
  },
  module: {
    rules: [
      {
        test: /\.ts[x]?$/,
        exclude: /node_modules/,
        use: [
          {
            loader: 'ts-loader',
            options: {
              transpileOnly: true,
            },
          },
        ],
      },
      {
        test: /\.js[x]?$/,
        exclude: /node_modules/,
        use: 'happypack/loader?id=happy-babel',
      },{
        test: /\.css$/,
        use: [
          MiniCssExtractPlugin.loader,
          {
            loader: "css-loader",
          }
        ],
      },
      {
        test:/\.scss$/,
        use:[
          MiniCssExtractPlugin.loader,
          {
            loader:"css-loader",
            options: {
              importLoaders: 1,
              modules: true,
              localIdentName: '[local]___[hash:base64:5]'
            }
          },
          'sass-loader'
        ],
      },
      {
        test: /\.(png|jpe?g|gif|svg|ico|eot|woff|ttf)$/,
        use: [
          {
            loader: 'url-loader',
            options: {
              limit: 8192, //  8192 B
              name: '[name].[hash:5].[ext]',
            },
          },
          {
            loader: 'image-webpack-loader',
            options: {
              mozjpeg: {
                progressive: true,
                quality: 65,
              },
              optipng: {
                enabled: false,
              },
              pngquant: {
                quality: '65-90',
                speed: 4,
              },
              gifsicle: {
                interlaced: false,
              },
            },
          },
        ],
      },
    ],
  },
  optimization: {
    minimize: true,  // ????????????
    splitChunks: {
      chunks: 'initial', // initial(????????????)???async(??????????????????)???all(????????????)
      minSize: 500000, // ???????????? 500KB ??????????????????????????????
      maxAsyncRequests: 5, // ???????????? chunk ???????????????????????????
      maxInitialRequests: 8, // ??????????????????????????? chunk ????????????
      cacheGroups: {
        vendor: {
          test: /[\\/]node_modules[\\/]/,
          filename: '[name].[contenthash].bundle.js',
          name(module) {
            const packageName = module.context.match(
              /[\\/]node_modules[\\/](.*?)([\\/]|$)/,
            )[1];

            return getHash(packageName, 8).replace('@', '');
          },
        },
      },
    },
  },
  plugins: [
    new webpack.EnvironmentPlugin(Object.keys(process.env)),
    new webpack.WatchIgnorePlugin([/css\.d\.ts$/, /scss\.d\.ts$/]),
    new MiniCssExtractPlugin({
      filename: 'css/[name].[hash].css'
     }),

    createHappyPlugin('happy-babel', [
      {
        loader: 'babel-loader',
        options: {
          babelrc: true,
          cacheDirectory: true,
        },
      },
    ]),

    createHappyPlugin('happy-css', ['css-loader', 'postcss-loader']),


     // ?????????public???????????????????????????webpack
     new CopyPlugin([
      { from: "./public", to: "./" }
    ]),


    // ??????html??????
    new HtmlWebpackPlugin({
      favicon: './src/assets/imgs/favicon.png',
      template: './src/index.html',
      filename: 'index.html',
    }),
  ],
});
