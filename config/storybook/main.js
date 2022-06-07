// const path = require('path')

module.exports = {
  stories: ['../../src/**/*.stories.@(js|jsx|ts|tsx|mdx)'],
  addons:  [
    {
      name: '@storybook/addon-essentials'
    },
    '@storybook/addon-links',
    '@storybook/addon-a11y',
    {
      name:    '@storybook/addon-docs',
      options: {
        configureJSX: false
      }
    }
    // {
    //   name:    '@storybook/addon-docs',
    //   options: {
    //     babelOptions: {
    //       presets: [
    //         [
    //           '@vue/cli-plugin-babel/preset',
    //           {
    //             jsx: false
    //           }
    //         ]
    //       ]
    //     }

    //   }
    // }
  ]
}
