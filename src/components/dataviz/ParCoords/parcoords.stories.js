import { breakpointsTailwind, useBreakpoints, useElementBounding, useElementSize, useResizeObserver } from '@vueuse/core';
import { format, formatDefaultLocale } from 'd3';
import { omit, omitBy } from 'lodash';
import { defineComponent, ref, shallowReadonly, shallowRef } from 'vue-demi';
import ParCoords from "./ParCoords.vue";
import records from "./records.json";

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
    fields: [
      'acousticness',
      'danceability',
      'duration_ms',
      'energy',
      'liveness',
      'loudness',
      'speechiness'
    ],
    dataset: () => records
  },
};

/** @type {import('@storybook/vue').Story} */
export const defaultView = (args, { argTypes }) => defineComponent(({
  components: {
    ParCoords,
  },
  filters: {
    asNumber: format(',.3s')
  },
  setup() {
    const el = ref()
    const { width, height } = useElementSize(el)

    const par = ref()

    const _records = shallowRef(records)

    const {
      greater
    } = useBreakpoints(breakpointsTailwind)

    return {
      el,
      width,
      height,
      records: _records,
      l: greater('md')

    }
  },
  methods: {
    clear(index) {
      this.$refs.par.columns[index].$emit('input', null)
    }
  },
  props: Object.keys(argTypes).filter(k => !['width', 'height', 'tick'].includes(k)),
  template: `
  <div class="m-auto pt-40 px-32 max-w-7xl" style="min-width: 700px" ref="el">

  <par-coords ref="par" v-bind="$props" :width="width" :dataset="() => records">
    <span slot="tick:acousticness" slot-scope="{tick}">
    {{tick}}
    </span>

    <template #footer="{value, index}">
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
}));

export default meta;
