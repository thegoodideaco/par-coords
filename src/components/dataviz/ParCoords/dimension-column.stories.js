import { defineComponent, ref, watchEffect } from "vue-demi";
import { syncRefs } from "@vueuse/core";
import DimensionColumn from "@/components/dataviz/ParCoords/DimensionColumn";
import TickMarks from "./TickMarks.vue";
import YBrush from "./YBrush.vue";

import records from "@/components/demo/records.json";
const r = records[0];

/**
 * @type {import('@storybook/vue').Meta}
 */
export default {
  title: "components/DimensionColumn",
  component: DimensionColumn
};

/** @type {import('@storybook/vue').Story} */
const Template = (args, {argTypes}) => ({
  props: Object.keys(argTypes),
  components: {
    DimensionColumn,
  },
  template: ` <dimension-column v-bind="$props" />
  `,
});

export const MainView = Template.bind({})

console.log(Template.argTypes)


