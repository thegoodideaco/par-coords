import { defineComponent, ref, watchEffect } from "vue-demi";
import { syncRefs } from "@vueuse/core";
import DimensionColumn from "./DimensionColumn.vue";
import TickMarks from './TickMarks.vue'
import YBrush from './YBrush.vue'

import records from "@/components/demo/records.json";
const r = records[0];

/**
 * @type {import('@storybook/vue').Meta}
 */
const meta = {
  title: "components/DimensionColumn",
  component: DimensionColumn,
  subcomponents: {
    TickMarks,
    YBrush
  },
  args: {
    accessor: (r) => +r.liveness || 0,
    width: 40,
    height: 600,
    min: 0,
    max: ~~(Math.random() * 1e6),
    format: ',.3~s'
  },
  parameters: {
    layout: "centered",
    value: [0, 50],
  },
};

export const mainView = (args, { argTypes }) =>
  defineComponent({
    props: Object.keys(argTypes),
    setup() {
      const v = ref();
      const vv = ref();
      // syncRefs(vv, v);

      /** @type {(keyof r)[]} */
      const keys = ["acousticness", "danceability", "energy"];

      return {
        v,
        vv,
      };
    },
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
