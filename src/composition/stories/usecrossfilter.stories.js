import { defineComponent, getCurrentInstance, proxyRefs, reactive, shallowRef, toRefs, watchEffect } from "vue-demi";
import useCrossfilter, { useDimension } from "../useCrossfilter";
import CsvSelect from "@/components/inputs/CsvSelect.vue";
import { tryOnBeforeMount } from '@vueuse/core';

/** @type {import('@storybook/vue').Meta} */
const meta = {
  title: "Composables",
  args: {
    fields: [1, 2, 3, 5],
  },
};

/** @type {import('@storybook/vue').Story} */
const MainView = (args, { argTypes }) =>
  defineComponent({
    template: `
  <div>
  <h2>{{totalFiltered | asNumber}} / {{total | asNumber}}</h2>

  <p>{{extent}}</p>


  <csv-select @input="actions.add($event.data)" />
  <pre>{{topRecords}}</pre>
  </div>
  `,
    components: {
      CsvSelect,
    },
    props: Object.keys(argTypes),
    setup(props, ctx) {
      const csvData = shallowRef();
      const cfOptions = reactive(useCrossfilter());



      // Create a default dimension of liveness?
      const { extent, filter } = useDimension(
        cfOptions.cf,
        (r,i,arr) => {
          if(!r) {
            console.log({
              r,
              i,
              arr
            })
          }
          return +r?.liveness || 0
        }
      );


      /**
       * If the records change, we add them to crossfilter
       */
      watchEffect(() => {
        const records = csvData.value?.data;

        if (Array.isArray(records) && records.length) {
          debugger
          cfOptions.cf.add(records);
        }
      });

      Object.assign(window, {
        vm: ctx,
        $vm: getCurrentInstance(),
        cfOptions
      })

      return {
        ...toRefs(cfOptions),
        extent,
        filter,
        // csvData
      };
    },
  });

/** @type {typeof MainView} */
export const CrossFilterView = MainView.bind({});
CrossFilterView.storyName = "useCrossFilter";

export default meta;
