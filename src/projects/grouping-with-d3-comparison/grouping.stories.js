import WithNest from './WithNest.vue'
import WithGroup from './WithGroup.vue'

export default {
  title: 'grouping example'
}


export const defaultView = () => ({
  components: {
    WithNest
  },
  template: `
  <with-nest />
  `
})

/** @type {import('@storybook/vue').Story} */
export const updatedView = () => ({
  components: {
    WithGroup
  },
  template: `
  <with-group />
  `
})

updatedView.storyName = 'Using new Group'
