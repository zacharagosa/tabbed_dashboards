// Copyright 2021 Google LLC

// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at

//     https://www.apache.org/licenses/LICENSE-2.0

// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.

const commonConfig = require('./webpack.config')
const webpack = require('webpack');
const dotenv = require('dotenv');


dotenv.config({ path: './.env' }); // Load .env.development file


module.exports = {
  ...commonConfig,
  output: {
    ...commonConfig.output,
    publicPath: 'http://localhost:8080/',
  },
  mode: 'development',
  module: {
    rules: [
      ...commonConfig.module.rules,
      {
        test: /\.(js|jsx|ts|tsx)?$/,
        use: 'react-hot-loader/webpack',
        include: /node_modules/,
      },
      {
        test: /\.css$/,
        use: ["style-loader", "css-loader"],
      },
    ],
  },
  devServer: {
    index: 'index.html',
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, PATCH, OPTIONS',
      'Access-Control-Allow-Headers':
        'X-Requested-With, content-type, Authorization',
    },
  },
  plugins: [...commonConfig.plugins, new webpack.DefinePlugin({
    'process.env': JSON.stringify(process.env),
  }),]
}
