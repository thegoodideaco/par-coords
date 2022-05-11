// @ts-check
import 'tippy.js/dist/backdrop.css'
import { animateFill, followCursor, inlinePositioning, sticky } from 'tippy.js'

/**
 * @type {Partial<import('tippy.js').DefaultProps>}
 */
export const PopoverConfig = {
  aria: {
    expanded: true,
    content:  null
  },
  delay:    0,
  duration: [
    300,
    250
  ],
  getReferenceClientRect: null,
  hideOnClick:            true,
  interactive:            true,
  interactiveBorder:      2,
  interactiveDebounce:    0,
  moveTransition:         '',
  offset:                 [
    0,
    10
  ],
  placement:        'auto',
  popperOptions:    {},
  showOnCreate:     false,
  touch:            true,
  triggerTarget:    null,
  // animateFill:       true,
  // followCursor:      false,
  // inlinePositioning: true,
  // sticky:            false,
  allowHTML:        false,
  animation:        'shift-away',
  arrow:            true,
  inertia:          false,
  maxWidth:         'none',
  role:             'tooltip',
  theme:            'light',
  zIndex:           9999,
  appendTo:         () => document.body,
  ignoreAttributes: true,
  trigger:          'focus',
  plugins:          [
    inlinePositioning,
    animateFill,
    followCursor,
    sticky
  ]

}

// tippy.setDefaultProps({
//   ...PopoverConfig,
//   plugins: [
//     inlinePositioning,
//     animateFill,
//     followCursor,
//     sticky
//   ]
// })
