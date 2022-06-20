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
  component: DimensionColumn,
  parameters: {
    layout: 'centered'
  },
  subcomponents: {
    TickMarks
  },
  argTypes: {
    width: {
      control: 'range',
      min: 10,
      max: 100
    },
    height: {
      control: {
        type: 'range',
        min: 100,
        max: 800
      }
    }
  },
  args: {
    width: 50,
    height: 100,
    min: -100,
    max: 100
  }
};

/** @type {import('@storybook/vue').Story} */
const Template = (args, {argTypes}) => defineComponent({
  props: Object.keys(argTypes),
  setup() {
    return {
      data: null
    }
  },
  model: {
    event: 'input',
    prop: 'value'
  },

  components: {
    DimensionColumn,
  },
  template: `
  <div>
  <dimension-column v-bind="$props" v-on="$listeners" v-model="data" />
  <p class="fixed top-10 left-10">{{data}}</p>
  </div>
  `,
});

export const MainView = Template.bind({})

console.log(Template.argTypes)


