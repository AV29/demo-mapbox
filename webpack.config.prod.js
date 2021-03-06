/* eslint-disable prefer-template*/
const process = require('process');
const webpack = require('webpack');
const ExtractTextPlugin = require('extract-text-webpack-plugin');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const GLOBALS = {
  'process.env.NODE_ENV': JSON.stringify('production')
};

const isLibBuild = process.env.WEBPACK_ENV === 'build';

module.exports = {
  devtool: 'source-map',
  entry: './src/index',
  output: {
    path: isLibBuild ? __dirname + '/lib' : __dirname + '/dist',
    publicPath: '/',
    filename: 'lib-bundle.min.js',
    library: 'ReactReduxSeed',
    libraryTarget: 'umd',
    umdNamedDefine: true
  },
  target: 'web',
  devServer: {
    contentBase: isLibBuild ? '/lib' : './dist'
  },
  plugins: [
    new webpack.optimize.OccurrenceOrderPlugin(),
    new webpack.DefinePlugin(GLOBALS),
    new webpack.IgnorePlugin(/^\.\/locale$/, /moment$/),
    new ExtractTextPlugin({filename: 'styles.css', disable: false, allChunks: true}),
    new webpack.LoaderOptionsPlugin({
      minimize: true,
      debug: false
    }),
    new webpack.optimize.UglifyJsPlugin({
      beautify: false,
      mangle: {
        safari10: true,
        screw_ie8: true,
        keep_fnames: true
      },
      compress: {
        warnings: false,
        screw_ie8: true,
        conditionals: true,
        unused: true,
        comparisons: false,
        sequences: true,
        dead_code: true,
        evaluate: true,
        if_return: true,
        join_vars: true,
        drop_console: true
      },
      output: {
        comments: false,
        ascii_only: true
      },
      sourceMap: true
    }),
    new HtmlWebpackPlugin({
      inject: true,
      filename: 'index.html',
      favicon: './src/assets/favicon.ico',
      template: './tools/prod.html'
    })
  ],
  resolve: {
    extensions: ['.js', '.jsx', '.css', '.less']
  },
  module: {
    rules: [
      {
        test: /(\.js$|\.jsx?$)/,
        loader: 'babel-loader',
        exclude: [/node_modules/, /docs/],
        options: {
          sourceMap: true
        }
      },
      {
        test: /(\.css|\.less)$/,
        exclude: [/docs/],
        loader: ExtractTextPlugin.extract(
          Object.assign({
            fallback: {
              loader: 'style-loader',
              options: {
                hmr: false
              }
            },
            use: [
              {
                loader: 'css-loader',
                options: {
                  allowMultiple: true,
                  modules: true,
                  minimize:true,
                  localIdentName: '[name]__[local]--[hash:base64:5]',
                  importLoaders: 1,
                  sourceMap: true
                }
              },
              {
                loader: 'postcss-loader',
                options: {
                  sourceMap: true,
                  ident: 'postcss',
                  config: {
                    path: 'postcss.config.js'
                  }
                }
              },
              {
                loader: 'less-loader',
                options: {
                  sourceMap: true
                }
              }
            ]
          })
        )
      },
      {
        test: /\.(jpe?g|png|gif)$/i,
        loader: 'file-loader'
      },
      {
        test: /\.woff(2)?(\?v=[0-9]\.[0-9]\.[0-9])?$/,
        loader: 'url-loader?limit=10000&mimetype=application/font-woff'
      },
      {
        test: /\.svg$/,
        use: [
          {
            loader: 'babel-loader'
          },
          {
            loader: 'react-svg-loader',
            query: {
              svgo: {
                plugins: [{removeTitle: false}],
                floatPrecision: 2
              }
            }
          }
        ]
      }
    ]
  }
};

