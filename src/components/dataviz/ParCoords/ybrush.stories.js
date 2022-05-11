import YBrush from "./YBrush.vue";

/** @type {import('@storybook/vue').Meta} */
const meta = {
  title: "components/Brushes",
  component: YBrush,
  parameters: {
    layout: "centered",
  },
  args: {
    width: 500,
    height: 500,
    x: 0,
    y: 0,
    round: true,
    domain: [0, 1],
  },
  argTypes: {
    round: {
      control: {
        type: "boolean",
      },
    },
  },
};

export const Y = (args, { argTypes }) => ({
  components: {
    YBrush,
  },
  props: Object.keys(argTypes),
  data: () => ({
    value: null,
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
  <y-brush
  v-bind="$props"
  v-model="value" />
  </svg>
  <template v-if="value">
  <p>
  Y: {{value}}
  </p>
  </template>

  <p v-else>
  Drag an area
  </p>
</div>
`,
});

export default meta;
