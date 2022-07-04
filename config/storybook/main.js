import('@/config')

const path = require('path')

module.exports = {
  core: {
    builder: 'webpack5'
  },
  stories: ['../../src/**/*.stories.@(js|jsx|ts|tsx|mdx)'],
  addons:  [
    {
      name:    '@storybook/addon-essentials',
      options: {
        configureJSX: true
      }
    },
    // {
    //   name:    '@storybook/addon-docs',
    //   options: {
    //     vueDocgenOptions: {
    //       alias: {
    //         '@': path.resolve(__dirname, '../../src')
    //       },
    //       resolve: {
    //         '@': path.resolve(__dirname, '../../src')
    //       }
    //     }
    //   }
    // },
    '@storybook/addon-links'
  ],
  webpackFinal: async (config, { configType }) => {
    // `configType` has a value of 'DEVELOPMENT' or 'PRODUCTION'
    // You can change the configuration based on that.
    // 'PRODUCTION' is used when building the static version of storybook.

    // Make whatever fine-grained changes you need

    config.module.rules.push({
      test:    /\.vue$/,
      loader:  'vue-docgen-loader',
      options: {
        docgenOptions: {
        // options for vue-docgen-api...
        },
        // Injected property name
        injectAt: '__docgenInfo' // default
      },
      enforce: 'post'
    })

    // Return the altered config
    return config
  }
}
