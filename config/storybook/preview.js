import Vue from 'vue'
import '../../src/config'
import {  INITIAL_VIEWPORTS } from '@storybook/addon-viewport'
import './variables.css'
import './styles.scss'
// import  './trello'

Vue.prototype.toJSON = function () {
  return this
}

/** @type {import('@storybook/addons').Parameters} */
export const parameters = {
  controls: {
    matchers: {
      color: /(background|color)$/i,
      date:  /Date$/
    }
  },
  docsOnly: false,
  viewport: {
    viewports: INITIAL_VIEWPORTS
  },
  layout: 'fullscreen'
}

// export const viewMode = 'story'

export const globalTypes = {
  // theme: {
  //   name:         'Theme',
  //   description:  'Global theme for components',
  //   defaultValue: 'light',
  //   toolbar:      {
  //     icon:  'circlehollow',
  //     // array of plain string values or MenuItem shape (see below)
  //     items: [
  //       'light',
  //       'dark'
  //     ]
  //   }
  // }
}
