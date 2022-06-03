import { action } from '@storybook/addon-actions'
import { format } from 'd3-format'
import TickMarks from './TickMarks.vue'

/** @type {import('@storybook/vue').Meta} */
const mainSetup = {
  title:     'Dataviz/Base Components/Tickmarks',
  component: TickMarks,
  args: {
    min: 10,
    max: 1000,
    ticks: 10,
    format: '$,.1s',
    direction: 'horizontal'
  },
  argTypes:  {
    min: {
      control:      {
        type: 'range',
        min:  -500,
        max:  500,
        step: 0.1
      }
    },
    max: {
      control:      {
        type: 'range',
        min:  600,
        max:  1500,
        step: 0.1
      }
    },
    ticks: {
      control:      {
        type: 'range',
        min:  2,
        max:  25,
        step: 1
      }
    },
    format: {
      control: {
        type: 'select',
      },
      options: [
        '$,.1s',
        '-$,.1f',
        '-.2h',

        // Dates
        '%x',
        '%b'
      ]


    },
    round: {
      type: 'boolean'
    },
    size: {
      control: false
    },
    nice: {
      type:        'boolean',
      description: 'Always have ticks at both ends'
    },
    lineLength: {
      control: {
        type: 'range',
        min:  8,
        max:  20,
        step: 1
      }
    },
    direction: {
      control:      {
        type:    'inline-radio',
      },
      options: [
        'vertical',
        'horizontal'
      ]
    }
  },
  parameters: {
    layout: 'fullscreen'
  },
}

/** @type {import('@storybook/vue').Story} */
const baseView = (args, {
  argTypes
}) => {
  return {
    components: {
      TickMarks
    },
    template: `
    <div class="relative" style="padding: 50px">
      <div class="relative">
        <tick-marks v-bind="$props" />
      </div>
    </div>
    `,
    props:    Object.keys(args)
  }
}

/** @type {import('@storybook/vue').Story} */
const slotView = (args, {
  argTypes
}) => {
  return {
    components: {
      TickMarks,
      CustomTick: {
        filters: {
          customFormat: format('.1~s')
        },
        props: [
          'round',
          'nice',
          'tick'
        ],
        template: `<div @click="log(options)" class="cursor-pointer opacity-40 hover:opacity-100 px-1 py-2 ">
        <span class="font-black text-green-500">$</span>
        <span >
        {{tick | customFormat}}
        </span>
        </div>`,
        methods: {
          log: action('log')
        },
        computed: {
          options() {
            return {...this.$props, ...this.$attrs}
          }
        }
      }
    },

    template: `


    <div class="relative" style="padding: 50px">
      <div class="relative">
        <tick-marks
          v-bind="{min,max, ticks, direction, lineLength}"
        >
        <template v-slot="{tick}">
        <custom-tick :tick="tick">
        </custom-tick>
        </template>
        </tick-marks>
      </div>
    </div>
    `,
    props:    Object.keys(argTypes),

  }
}

/** @type {import('@storybook/vue').Story} */
export const defaultView = baseView.bind({})

/** @type {import('@storybook/vue').Story} */
export const withSlot = slotView.bind({})

export default mainSetup
