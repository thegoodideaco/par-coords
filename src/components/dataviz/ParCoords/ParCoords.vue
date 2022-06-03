<template>
  <div
    class="par-coords shadow-2xl"
    :style="styleVars">
    <div class="brushes absolute z-10">
      <div
        v-for="(d, i) in fields"
        :key="d"
        class="brushes__brush-container absolute top-0 left-0"
        :style="{ left: `${xScale(d)}px` }">
        <!-- Header -->
        <div
          class="text-center"
          style="
            transform: translateX(-50%) translateY(-100%);
            margin-top: -10px;
          ">
          <slot
            name="header"
            v-bind="{ field: d, index: i }">
            <!-- {{ d }} -->
          </slot>
        </div>

        <dimension-column
          ref="columns"
          v-model="filters[i]"
          class="par-column"
          :min="yScales[i].domain()[0]"
          :max="yScales[i].domain()[1]"
          :accessor="d"
          :height="height"
          :width="50"
          @input="filterDimensions(i, $event)">
          <template
            v-if="$scopedSlots.tick"
            #tick="tickProps">
            <slot
              name="tick"
              v-bind="tickProps" />
          </template>
        </dimension-column>

        <!-- Footer -->
        <div class="par-footer">
          <slot
            name="footer"
            v-bind="{ field: d, index: i, value: filters[i] }">
            <!-- {{ d }} -->
          </slot>
        </div>
      </div>
    </div>

    <!-- Line renderer here -->
    <par-coord-line-renderer
      class="absolute top-0 left-0 w-full h-full pointer-events-none"
      :records="topList"
      :fields="fields"
      :x-scale="xScale"
      :y-scales="yScales"
      :curve="$attrs.curve"
      :low-quality="true"
      v-bind="{ color, thickness, opacity }" />

    <!-- <pre
      v-if="topList"
      class="fixed p-2 top-0 left-0 text-xs pointer-events-none">
      info area {{ totalFiltered }} - {{ topList.slice(0, 2) }} - avg price {{ (sumPrice / totalFiltered) | asNumber }}
    </pre> -->
  </div>
</template>

<script>
import { useCrossfilterOld } from '@/composition/dataviz'
import { useGroupAll, useTopList } from '@/composition/useCrossfilter'
import { scalePoint } from 'd3-scale'
import { computed, defineComponent, inject, ref, watch } from 'vue-demi'
import DimensionColumn from './DimensionColumn.vue'
import ParCoordLineRenderer from './ParCoordLineRenderer.vue'

export default defineComponent({
  components: {
    DimensionColumn,
    ParCoordLineRenderer
  },
  props: {
    dataset: {
      type: [
        Array,
        Function
      ],
      default: () => null
    },

    /** @type {Vue.PropOptions<string[]>} */
    fields: {
      type:    Array,
      default: null
    },
    width: {
      type:    Number,
      default: 800
    },
    height: {
      type:    Number,
      default: 480
    },
    maxLines: {
      type:    Number,
      default: 150
    },
    lineOffset: {
      type:    Number,
      default: 0
    },
    color: [
      Function,
      String
    ],
    thickness: [
      Function,
      String,
      Number
    ],
    opacity: [
      Function,
      String,
      Number
    ]
  },

  setup(props) {
    const heightRef = computed(() => props.height)

    /** @type {typeof import('./records.json')} */
    const ds =
      typeof props.dataset === 'function' ? props.dataset() : props.dataset

    const size = computed(() => [
      props.width,
      props.height
    ])

    const {
      cf,
      dimensions,
      scales: yScales,
      extents
    } = inject(
      'useCrossfilter',
      useCrossfilterOld(ds, props.fields, heightRef)
    )

    const { totalFiltered } = useGroupAll(cf)

    const { totalFiltered: sumPrice } = useGroupAll(cf, r => +r.price || 0)

    const amountRef = computed(() => props.maxLines)
    const offsetRef = computed(() => props.lineOffset)

    const {
      topList,
      amount: offsetAmount,
      offset
    } = useTopList(cf, dimensions.value[0], {
      amount: amountRef,
      offset: offsetRef
    })

    // syncRef(offsetAmount, amountRef)

    const columns = ref(null)

    const updateYScales = (height) => {
      yScales.value.forEach((s) => {
        s.range([
          height,
          0
        ]).nice()
      })
    }

    const xScale = computed(() =>
      scalePoint()
        .domain(props.fields)
        .range([
          0,
          props.width
        ])
        .round(true)
        .padding(0)
    )

    /** @type {import('vue-demi').Ref<number>} */

    watch(heightRef, updateYScales, { immediate: true })

    const filters = ref(new Array(props.fields.length))

    function filterDimensions(index, range) {
      const _r = range ? range.sort((a, b) => a - b) : null
      if (_r) {
        _r[1] += 1e-8
      }
      dimensions.value[index].filter(_r)
    }

    function clearFilters() {
      filters.value = new Array(props.fields.length)
      dimensions.value.forEach((d) => d.filterAll())
    }

    const getItemLinePoints = computed(() => {
      const fields = props.fields

      /** @param {typeof ds[0]} item */
      return (item) =>
        Array.from(fields, (f, i) => [
          xScale.value(f),
          yScales.value[i](dimensions.value[i].accessor(item))
        ])
    })

    const topLines = computed(() =>
      Array.from(topList.value, getItemLinePoints.value)
    )
    const refObj = {
      cf,
      dimensions,
      xScale,
      clearFilters,
      yScales,
      filters,
      extents,
      columns,
      totalFiltered,
      filterDimensions,
      topList,
      topLines,
      offsetAmount,
      offset,
      getItemLinePoints,
      size,
      sumPrice
    }

    Object.assign(window, {
      refObj
    })

    return refObj
  },

  computed: {
    styleVars() {
      return {
        '--par-width':  `${this.width}px`,
        '--par-height': `${this.height}px`
      }
    }
  }
})
</script>

<style lang="scss" scoped>
.par-coords {
  width: var(--par-width);
  height: var(--par-height);
  background-color: #1b2942;
  background-image: linear-gradient(0deg, #0c1625, #21103b52);
  contain: layout;

  .brushes__brush-container {
    height: 100%;
  }

  .brushes {
    width: 100%;
    height: 100%;
  }

  .par-column {
    position: absolute;
    top: 0;
  }

  .par-footer {
    padding-top: 0.5rem;
    position: absolute;
    top: 100%;
    transform: translateX(-50%);
  }
}
</style>
