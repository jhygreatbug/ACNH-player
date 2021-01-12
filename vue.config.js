/* eslint-disable @typescript-eslint/no-var-requires */
const MiniCssExtractPlugin = require('mini-css-extract-plugin')

module.exports = {
  pluginOptions: {
    electronBuilder: {
      enableRemoteModule: true,
      preload: 'src/preload.ts',
      customFileProtocol: 'acnh://./',
      builderOptions: {
        publish: ['github'],
      },
    },
  },
  configureWebpack: {
    module: {
      rules: [
        {
          test: /\.css$/,
          use: [
            process.env.NODE_ENV !== 'production'
              ? 'vue-style-loader'
              : MiniCssExtractPlugin.loader,
            'css-loader',
          ],
        },
      ],
    },
    plugins: [
      new MiniCssExtractPlugin({
        filename: 'style.css',
      }),
    ],
  },
}
