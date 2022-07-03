import {
  computed,
  defineComponent,
  onMounted,
  onUnmounted,
  provide,
  reactive,
  ref,
  shallowRef,
  watchEffect,
} from "vue";
import DataLoader from "@/components/inputs/DataLoader.vue";
import ParCoords from "@/components/dataviz/ParCoords/ParCoords.vue";
import { usePapaParse } from "./usePapaParse";
import crossfilter from "crossfilter2";
import { format, quickselect } from "d3";
import { get } from "lodash";
import { curveMethods } from "@/utils/curveMethods";
import { downloadAsCsv } from "@/utils/saveFile";
export default {
  title: "composables",
  parameters: {
    layout: "centered",
  },
  args: {
    useCanvas: false,
  },
};




/** @type {import('@storybook/vue').Story} */
export const MainView = (args, { argTypes }) =>
  defineComponent({
    components: {
      DataLoader,
      ParCoords,
    },
    props: Object.keys(argTypes),
    template: `
                  <div>
                  <div class="progress w-40 h-4 relative border border-blue-300">
<div class="absolute top-0 left-0 bottom-0 bg-blue-500" :style="percentStyle">                    </div>
                  </div>
                  <span class="material-symbols-outlined">
grid_3x3
</span>
<span class="material-symbols-outlined text-blue-300">
text_format
</span>
                  <span class="material-symbols-outlined">
event
</span>
                  <data-loader disable-format @input="loadData">
                    <button tabindex="-1" class="btn btn-primary m-auto">Upload csv</button>
                  </data-loader>

                  <div class="flex flex-wrap gap-2 max-w-5xl" style="font-size: 9px">
                    <div v-for="field in availableFields" :key="field.field"
                        class="px-2 py-1 rounded bg-gray-800 border border-gray-700">
                        {{ field.field }} ({{field.counts.unique | asNumber}})
                    </div>


                  </div>

                  <div>
                    {{count | asNumber}}
                    </div>

                  <div class="p-10 mt-6 relative">
                    <par-coords v-if="loaded"
                          ref="par"
                          :fields="fieldNames"
                          :use-canvas="useCanvas"
                          :color="colorFn"
                          :thickness="thicknessFn"
                          :curve="curve"
                          :opacity="opacityFn"
                          :width="1200"
                          :height="600"
                          :dataset="cf.all"
                        >


    <template #header="{field}">
  <small style="font-size: 10px; line-height: normal">
  {{field}}
  </small>
    </template>

    </par-coords>


    <button @click="download">Download</button>
    <button @click="removeSelected()">Remove selected</button>
    <button @click="removeSelected(true)">Remove others</button>
    </div>

    <div v-if="error">
    {{error.message}}
    </div>



                  </div>`,
    setup() {
      const cf = crossfilter();
      const fileData = shallowRef();
      const papaLoader = usePapaParse();

      provide("cf", cf);

      const fields = computed(() => papaLoader.summary?.fields);

      const MAX_COLUMNS = ref(16);
      const availableFields = computed(() => {
        if (fields.value) {
          return fields.value
            .filter((f) => {
              const { chronologic, empty, numeric, unique } = f.counts;

              const {
                summary: { rowsTotal },
              } = papaLoader;

              const timePerc = chronologic / rowsTotal;
              const numberPerc = numeric / rowsTotal;

              const typeCheck = numeric > 0;
              const uniqueCheck = f.counts.unique > 1;

              return (
                (timePerc > 0.7 || numberPerc > 0.7) && typeCheck && uniqueCheck
              );
            })
            .sort(orderOn.value)
            .slice(0, MAX_COLUMNS.value);
        }
      });

      const fieldNames = computed(() => {
        if (availableFields.value) {
          return availableFields.value.map((f) => f.field);
        }
      });

      const par = ref();
      const parCoords = computed(() => par.value);

      /**
       * Function that combines all dimensional fields as a nullish function
       */
      const isRecordValid = computed(() => {
        if (availableFields.value) {
          const keys = Array.from(availableFields.value, (r) => r.field);

          return (record) =>
            keys.every((key) => {
              const _val = record[key];
              const _valStr = String(_val).trim();
              return _val != null && _valStr !== "" && isFinite(+_valStr);
            });
        }
      });

      onMounted(() => {
        window.usePapa = papaLoader;
        window.fields = reactive(fields);

        watchEffect(() => {
          if (papaLoader.status.loaded) {
            window.dataset = cf.all();
            window.isv = isRecordValid.value;
          } else {
            window.dataset = undefined;
          }
        });
      });

      onUnmounted(() => {
        delete window.dataset;
      });

      const sortFn = (r) => r?.counts.unique;

      const amount = ref(5);
      const orderOn = ref(sortFn);
      const asc = ref(false);

      const topFields = computed(() => {
        if (fields.value?.length >= amount.value) {
          const orderFn =
            typeof orderOn.value === "string"
              ? (r) => {
                  if (!r) {
                    return r;
                  }

                  return get(r, String(orderOn.value));
                }
              : orderOn.value;

          const compareFn = (a, b) =>
            !a || !b
              ? undefined
              : asc.value
              ? orderFn(a) - orderFn(b)
              : orderFn(b) - orderFn(a);

          return quickselect(
            Array.from(fields.value),
            amount.value,
            0,
            fields.value.length,
            compareFn
          )
            .splice(0, amount.value)
            .filter((f) => !!f && !!orderFn(f))
            .sort(compareFn);
        }
      });

      const percentComplete = computed(() => {
        return papaLoader.status.loaded
          ? 0
          : papaLoader.summary.bytesLoaded / papaLoader.summary.bytesTotal;
      });

      const percentStyle = computed(() => ({
        width: format("%")(percentComplete.value),
      }));

      const error = computed(() => papaLoader.status.error);

      const count = computed(() => parCoords.value?.totalFiltered);

      const removeSelected = (invert) => {
        if (par.value) {
          /** @type {import('crossfilter2').Crossfilter} */
          const _cf = par.value.cf;
          _cf.remove((r, i) => _cf.isElementFiltered(i) === !invert);
        }
      };

      const colorFn = ref("green");
      const opacityFn = ref(1);
      const thicknessFn = ref(2);

      return {
        removeSelected,
        count,
        error,
        loaded: computed(() => papaLoader.status.loaded),
        curve: curveMethods.curveBumpX,
        colorFn,
        opacityFn,
        thicknessFn,
        fieldNames,
        papaLoader,
        fileData,
        cf,
        fields,
        topFields,
        percentComplete,
        percentStyle,
        isRecordValid,
        availableFields,
        MAX_COLUMNS,
        par,
        parCoords,
        download: () => {
          downloadAsCsv(par.value.cf.allFiltered(), "all-filtered.csv");
        },
        options: reactive({
          amount,
          orderOn,
          asc,
        }),
      };
    },
    methods: {
      /**
       *
       * @param {{data: string, file: File}} param0
       */
      async loadData({ data: csvStr, file }) {
        this.fileData = file;

        this.cf.remove(() => true);

        try {
          await this.papaLoader.load(file, {
            header: true,
            transformHeader: (val) => String(val).trim(),
            chunk: async ({ data, errors, meta }, parser) => {

              if (errors.length) {
                parser.abort();
                return Promise.reject(errors[0]);
              }

              if (data?.length > 0) {
                this.cf.add(data);
              }
            },
            complete: () => this.cf.remove((r) => !this.isRecordValid(r)),
            error: (err) => {
              return Promise.reject(err);
            },
            chunkSize: 1048576 * 0.25,
            skipEmptyLines: true,
          });
        } catch (error) {}
      },
    },
  });

  MainView.storyName = 'usePapaParse'
