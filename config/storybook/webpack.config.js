// .storybook/webpack.config.js

// This example uses "Full control mode + default".
// If you are using other mode, add payload of `config.module.rules.push` to rules list.
module.exports = ({ config }) => {
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

  return config
}
