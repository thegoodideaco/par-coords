import { defineComponent, ref, watchEffect } from "vue-demi";
import { syncRefs } from "@vueuse/core";
import DimensionColumn from "./DimensionColumn.vue";
import TickMarks from "./TickMarks.vue";
import YBrush from "./YBrush.vue";

import records from "@/components/demo/records.json";
const r = records[0];

/**
 * @type {import('@storybook/vue').Meta}
 */
const meta = {
  title: "components/DimensionColumn",
  component: DimensionColumn,

  args: {
    accessor: (r) => +r.liveness || 0,
    width: 40,
    height: 600,
    min: 0,
    max: ~~(Math.random() * 1e6),
    format: ",.3~s",
  },
  argTypes: {
    height: {
      control: {
        type: "range",
        min: 100,
        max: 1000,
        step: 1,
      },
    },
    scale: {
      control: false,
    },
  },
  parameters: {
    layout: "centered",
    value: [0, 50],
  },
};

/** @type {import('@storybook/vue').Story} */
export const mainView = (args, {argTypes}) => ({
  data: () => ({
    v: null,
  }),
  props: Object.keys(argTypes),
  components: {
    DimensionColumn,
  },
  template: `
  <div class="p-5 flex items-center gap-10">

    <DimensionColumn v-bind="$props" v-model="v" />

    <pre class="absolute text-red-600 top-0 left-0">
{{v || '?'}}
</pre>
  </div>
  `,
});

export default meta;
