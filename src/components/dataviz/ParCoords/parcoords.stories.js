import { curveMethods } from "@/utils/curveMethods";
import {
  breakpointsTailwind,
  useBreakpoints,
} from "@vueuse/core";
import chroma from "chroma-js";
import { format, scaleQuantile } from "d3";
import {
  computed,
  defineComponent,
  ref,
  shallowRef,
} from "vue-demi";
import ParCoords from "./ParCoords.vue";
import records from "@/components/demo/records.json";

const colorOptions = Object.keys(chroma.brewer);

import LineRenderer from './ParCoordLineRenderer.vue'

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
  subcomponents: {
    LineRenderer
  },
  parameters: {
    layout: "fullscreen",
  },
  args: {
    /** @type {[keyof typeof records[0]]} */
    fields: columnFields,
    dataset: () => records,
    colorizeOn: 'OrRd',

     /** @type {keyof typeof chroma.brewer} */
    brewerKey: 'BuPu',
    curve: "curveBumpX",
    width: 900,
    height: 500,
    maxTicks: 4
  },
  argTypes: {
    brewerKey: {
      name: 'Color Theme',
      control: {
        type: "select",
        // defaultValue: 'OrRd'
      },
      options: colorOptions,
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
        defaultValue: columnFields[0]
      },
      options: columnFields,
    },
    curve: {
      control: {
        type: "select",
      },
      options: Object.keys(curveMethods).filter(
        (k) => !k.endsWith("Closed") && !k.endsWith("Open")
      ),
    },
    dataset: {
      control: false
    }
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

      const len = computed(() => par.value?.totalFiltered)

      const _records = shallowRef(records);

      const clear = () => par.value?.clearFilters()

      const { greater } = useBreakpoints(breakpointsTailwind);

      const curve = computed(() => curveMethods[props.curve]);

      /**
       * Selected array of colors
       */
      const brewerColors = computed(() => chroma.brewer[props.brewerKey]);

      /**
       * Quantile scale for choosing color
       */
      const colorGen = computed(() => {
        const domain = Float64Array.from(
          _records.value,
          (r) => r[props.colorizeOn]
        );
        const range = brewerColors.value || ['#000000'];

        const baseScale = scaleQuantile().domain(domain).range(range);

        return (record) => baseScale(record[props.colorizeOn]);
      });


      const filterApplied = computed(() => len.value > 0)

      return {
        el,
        par,
        len,
        records: _records,
        l: greater("md"),
        colorGen,
        brewerColors,
        fixedCurve: curve,
        args,
        argTypes,
        clear,
        filterApplied
      };
    },
    props: Object.keys(argTypes).filter((k) => !["tick"].includes(k)),
    template: `
    <div class="m-auto pt-40 px-32 max-w-7xl select-none" style="min-width: 700px" ref="el">

<div class="title p-5 text-center text-white bold">
{{len}} filtered <br/>
<button class="btn btn-primary" @click="clear" :disabled="!filterApplied">
clear all
</button>
</div>

    <par-coords
      ref="par"
      v-bind="$props"
      :color="$data.colorGen"
      :width="width"
      :height="height"
      :curve="fixedCurve"
      :dataset="() => records"
    >
      <span slot="tick:acousticness" slot-scope="{tick}"> {{tick}} !</span>

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




  /** @type {import('@storybook/vue').Story} */
  export const usingCanvas = defaultView.bind({})
  usingCanvas.args = {
    ...usingCanvas.args,
    useCanvas: true
  }


export default meta;
