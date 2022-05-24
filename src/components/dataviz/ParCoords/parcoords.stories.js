import { curveMethods } from "@/utils/curveMethods";
import {
  breakpointsTailwind,
  useBreakpoints,
  useElementBounding,
  useElementSize,
  useResizeObserver,
} from "@vueuse/core";
import chroma from "chroma-js";
import { format, formatDefaultLocale, scaleLinear, scaleQuantile } from "d3";
import { omit, omitBy } from "lodash";
import {
  computed,
  defineComponent,
  ref,
  shallowReadonly,
  shallowRef,
} from "vue-demi";
import ParCoords from "./ParCoords.vue";
import records from "@/components/demo/records.json";

const colorOptions = Object.keys(chroma.brewer);

const columnFields = [
  "acousticness",
  "danceability",
  "duration_ms",
  "energy",
  "liveness",
  "loudness",
  "speechiness",
];
/**
 * @type {import('@storybook/vue').Meta}
 */
const meta = {
  title: "components/Par Coords",
  component: ParCoords,
  parameters: {
    layout: "fullscreen",
  },
  args: {
    /** @type {[keyof typeof records[0]]} */
    fields: columnFields,
    dataset: () => records,
    colorizeOn: columnFields[0],
    color: colorOptions[0],
    curve: "curveBumpX",
    width: 900,
    height: 500
  },
  argTypes: {
    color: {
      control: {
        type: "select",
        options: colorOptions,
      },
    },
    width: {
      control: {
        type: "range",
        min: 100,
        max: 1400,
        step: 10
      },
    },
    height: {
      control: {
        type: "range",
        min: 100,
        max: 900,
        step: 10
      },
    },
    colorizeOn: {
      control: {
        type: "select",
        options: columnFields,
      },
    },
    curve: {
      control: {
        type: "select",
        options: Object.keys(curveMethods).filter(
          (k) => !k.endsWith("Closed") && !k.endsWith("Open")
        ),
      },
    },
  },
};

/** @type {import('@storybook/vue').Story} */
export const defaultView = (args, { argTypes }) =>
  defineComponent({
    components: {
      ParCoords,
    },
    filters: {
      asNumber: format(",.3s"),
    },
    setup(props, { attrs }) {
      const el = ref();

      const par = ref();

      const _records = shallowRef(records);

      const { greater } = useBreakpoints(breakpointsTailwind);

      const curve = computed(() => curveMethods[props.curve]);

      /**
       * Selected array of colors
       */
      const brewerColors = computed(() => chroma.brewer[props.color]);

      /**
       * Quantile scale for choosing color
       */
      const colorGen = computed(() => {
        const domain = Float64Array.from(
          _records.value,
          (r) => r[props.colorizeOn]
        );
        const range = brewerColors.value;

        const baseScale = scaleQuantile().domain(domain).range(range);

        return (record) => baseScale(record[props.colorizeOn]);
      });

      return {
        el,
        records: _records,
        l: greater("md"),
        colorGen,
        brewerColors,
        fixedCurve: curve,
      };
    },
    methods: {
      clear(index) {
        this.$refs.par.columns[index].$emit("input", null);
      },
    },
    props: Object.keys(argTypes).filter((k) => !["tick"].includes(k)),
    template: `
    <div class="m-auto pt-40 px-32 max-w-7xl" style="min-width: 700px" ref="el">
    <par-coords
      ref="par"
      v-bind="$props"
      :color="colorGen"
      :width="width"
      :height="height"
      :curve="fixedCurve"
      :dataset="() => records"
    >
      <span slot="tick:acousticness" slot-scope="{tick}"> {{tick}} </span>

      <template #footer="{value, index}">
        <p class="small">{{fields[index]}}</p>
        <div v-if="value">
          <small class="text-xs whitespace-nowrap">
            {{value[1] | asNumber}} - {{value[0] | asNumber}}
          </small>
          <button @click="clear(index)">Clear</button>
        </div>
      </template>
    </par-coords>
  </div>
    `,
  });

export default meta;
