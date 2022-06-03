// @ts-check

import Vue from 'vue'
import '../../src/config'
import {  INITIAL_VIEWPORTS } from '@storybook/addon-viewport'
import { DocsContainer, DocsPage } from '@storybook/addon-docs'
import './variables.css'
import './styles.scss'
// import  './trello'
import { themes } from '@storybook/theming'
import toReact from '@egoist/vue-to-react'

Vue.prototype.toJSON = function () {
  return this
}

/** @type {import('@storybook/addons').Parameters} */
export const parameters = {

  docs: {
    prepareForInline: (storyFn, { args }) => {
      const Story = toReact(storyFn())
      return <Story {...args} />
    },
    inlineStories: false,
    container:     DocsContainer,
    page:          DocsPage,
    theme:         themes.dark,
    iframeHeight:  500
  },
  toolbar: {
    icon:  'circlehollow',
    // array of plain string values or MenuItem shape (see below)
    items: [
      'light',
      'dark'
    ]
  },
  // controls: { expanded: true },
  viewport: {
    viewports: INITIAL_VIEWPORTS
  },
  // backgrounds: {
  //   // default: 'Dark',
  //   values: [
  //     {
  //       name:  'Light',
  //       value: '#e9e9e9'
  //     },
  //     {
  //       name:  'Dark',
  //       value: '#353535'
  //     }
  //   ]
  // },
  options: {
    showPanel: true
  },
  layout: 'fullscreen'
}

// export const viewMode = 'story'

export const globalTypes = {
  theme: {
    name:         'Theme',
    description:  'Global theme for components',
    defaultValue: 'light',
    toolbar:      {
      icon:  'circlehollow',
      // array of plain string values or MenuItem shape (see below)
      items: [
        'light',
        'dark'
      ]
    }
  }
}
