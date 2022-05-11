import XBrush from "./XBrush.vue";

/** @type {import('@storybook/vue').Meta} */
const meta = {
  title: "components/Brushes",
  component: XBrush,
  parameters: {
    layout: "centered",
  },
  args: {
    width: 480,
    height: 480,
    x: 10,
    y: 10,
    round: true,
    domain:  [ 0, 1 ]
  },
  argTypes: {
    round: {
      control: {
        type: "boolean",
      },
    },
  },
};

export const X = (args, { argTypes }) => ({
  components: {
    XBrush,
  },
  props: Object.keys(argTypes),
  computed: {
    svgStyles() {
      return {
        width: `${this.width + (this.x * 2)}px`,
        height: `${this.height + (this.y * 2)}px`
      }
    }
  },
  data: () => ({
    value: null,
  }),
  template: `
<div>
  <svg :style="svgStyles" class="bg-purple-700">
  <x-brush
  v-bind="$props"
  v-model="value" />
  </svg>
  <template v-if="value">
  <p>
  X: {{value}}
  </p>
  </template>
  <p v-else>
  Drag an area
  </p>
</div>
`,
});

export default meta;
