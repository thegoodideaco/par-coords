import MultiBrush from "./MultiBrush.vue";

/** @type {import('@storybook/vue').Meta} */
const meta = {
  title: "components/Brushes",
  component: MultiBrush,
  parameters: {
    layout: "centered",
  },
  args: {
    width: 480,
    height: 480,
    x: 10,
    y: 10,
    round: true,
    domain: [ [ 0, 0 ], [ 1, 1 ] ]
  },
  argTypes: {
    round: {
      control: {
        type: "boolean",
      },
    },
    x: {
      control: {
        type: 'range',
        min: 0,
        max: 10,
        step: 1
      }
    }
  },
};

export const XY = (args, { argTypes }) => ({
  components: {
    MultiBrush,
  },
  props: Object.keys(args),
  data: () => ({
    value: null
  }),
  computed: {
    svgStyles() {
      return {
        width: `${this.width + (this.x * 2)}px`,
        height: `${this.height + (this.y * 2)}px`
      }
    }
  },
  template: `
<div>
  <svg :style="svgStyles" class="bg-purple-700">
  <multi-brush
  v-bind="$props"
  v-model="value" />
  </svg>
  <template v-if="value">
  <p>
  TL: {{value[0]}}
  </p>
  <p>
  BR: {{value[1]}}
  </p>
  </template>
  <p v-else>
  Drag an area
  </p>
</div>
`,
});

export const XYReversed = XY.bind({})
XYReversed.parameters = {
  ...XYReversed.parameters,
  domain: [ [ 1, 1 ], [ 0, 0 ] ],
}

export default meta;
