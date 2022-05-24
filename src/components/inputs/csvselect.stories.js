import { defineComponent } from "vue-demi";
import CsvSelect from "./CsvSelect.vue";

/** @type {import('@storybook/vue').Meta} */
const meta = {
  title: "components/inputs",
  component: CsvSelect,
  args: {
    value: null,
  },
  argTypes: {
    value: {
      control: false
    }
  }
};

export const CsvInput = (args, { argTypes }) =>
  defineComponent({
    components: {
      CsvSelect
    },
    props: Object.keys(argTypes),
    setup() {
      return {
        model: null,
      };
    },
    template: `<csv-select v-model="model" v-bind="$props"></csv-select>`,
  });

export default meta;
