import { addons  } from '@storybook/addons'
import { darcula } from './theme'

addons.setConfig({
  /**
   * show story component as full screen
   * @type {Boolean}
   */
  isFullscreen: false,

  /**
   * display panel that shows a list of stories
   * @type {Boolean}
   */
  showNav: true,

  /**
   * display panel that shows addon configurations
   * @type {Boolean}
   */
  showPanel: true,

  /**
   * where to show the addon panel
   * @type {('bottom'|'right')}
   */
  panelPosition: 'right',

  /**
   * sidebar tree animations
   * @type {Boolean}
   */
  sidebarAnimations: true,

  /**
   * enable/disable shortcuts
   * @type {Boolean}
   */
  enableShortcuts: true,

  /**
   * show/hide tool bar
   * @type {Boolean}
   */
  isToolshown: true,

  /**
   * theme storybook, see link below
   */
  // theme: create({
  //   base: 'light'

  // }),

  theme: darcula
})
