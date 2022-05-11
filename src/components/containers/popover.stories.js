/* eslint-disable no-unused-vars */
/* eslint-disable import/no-extraneous-dependencies */
import { PopoverConfig } from './config'
import RPopover from './RPopover.vue'

export default {
  component: RPopover,
  title: 'Components/Containers/Popover',
  parameters: {
    layout: 'centered'
  },
  args: {
    /** @type {Partial<import('tippy.js').Props>} */
    tippyOptions: {
      ...PopoverConfig,
      theme: 'light',
      animateFill: false,
      placement: 'top',
      interactive: true,
      trigger: 'click',
      animation: 'scale'
    },
  },
  argTypes: {
    tippyOptions: {

      // control: false,
      table: {
        default: false
      }
    }
  }
}

export const Examples = (args, { argTypes }) => ({
  components: {
    RPopover
  },
  props: ['tippyOptions'],
  template: `
  <r-popover v-bind="$props" tabindex="-1">

  <template #reference>
  <button>Click Me</button>
  </template>


  <div class="font-semibold px-5 py-1 text-sm">Hello How are you</div>

  </r-popover>
   `
})
