<template>
  <div class="bg-gray-800 text-gray-100 w-full h-full">
    <div class="top-header text-center grid justify-center">
      <h1>
        Coord-o-matic
      </h1>

      <h1 class="text-xs">
        Interactive parallel coordinates using virtually any dataset.
      </h1>

      <button>
        Create your own
      </button>

      <button class="link">
        How does this work?
      </button>

      <!-- Top Nav -->
      <div class="data-loader input inline-flex gap-2 p-3">
        <!-- Select -->
        <csv-select
          v-model="test"
          :placeholder="'select me'"
          @before:load="loading=true"
          @input="loading = false" />
        <!-- Upload button -->
        <data-loader
          v-model="test"
          class="px-3 py-2 rounded bg-blue-400 cursor-pointer text-white"
          @before:load="loading=true"
          @input="loading = false">
          Select
        </data-loader>
      </div>
      <!-- Scrubbers -->
      <div>
        <input
          v-model.number="maxLines"
          type="range"
          step="1"
          min="10"
          max="2000">
        <input
          v-model.number="offset"
          type="range"
          step="1"
          min="0"
          :max="dataLength">
        <input
          v-model.number="height"
          type="range"
          step="1"
          :min="300"
          :max="900">
      </div>
      <!-- Info / Clear -->
      <div class="info">
        Total Size: {{ dataLength | asNumber }}
        <button @click="parCoordComponent.clearFilters()">
          Clear
        </button>
      </div>
    </div>

    <!-- Par Coords -->
    <template v-if="summary">
      <div class="p-16 select-none">
        <par-coords
          v-if="!loading"
          ref="parCoordComponent"
          class="m-auto"
          v-bind="{width, height, ...lineStyleSettings}"
          :max-lines="maxLines"
          :line-offset="offset"
          :dataset="dataset"
          :fields="numericalKeys">
          <template #footer="{field}">
            <small class="label transform -rotate-45">
              {{ field }}
            </small>
          </template>
        </par-coords>
      </div>
    </template>
  </div>
</template>

<script>
import ColorDropdown from '@/components/dataviz/inputs/ColorDropdown.vue'
import ParCoords from '@/components/dataviz/ParCoords/ParCoords.vue'
import CsvSelect from '@/components/inputs/CsvSelect.vue'
import DataLoader from '@/components/inputs/DataLoader.vue'
import chroma from 'chroma-js'
import { extent } from 'd3-array'
import { scaleQuantize, scaleSequentialPow } from 'd3-scale'
import { interpolateRainbow } from 'd3-scale-chromatic'
import { shuffle } from 'lodash'
import { computed, defineComponent, ref, shallowRef, watchPostEffect } from 'vue-demi'
export default defineComponent({
  name:       'ParCoordsView',
  components: {
    CsvSelect,
    ParCoords,
    DataLoader,
    ColorDropdown
  },
  setup() {
    const parCoordComponent = ref()
    const offset = ref(0)
    const test = shallowRef(null)
    const dataLength = computed(() => parCoordComponent.value?.totalFiltered)
    const loading = ref(false)

    const maxLines = ref(500)

    const keys = computed(() => {
      if (test.value?.data.length) {
        return Object.keys(test.value.data[0])
      }
    })

    const width = ref(1024)
    const height = ref(500)

    const randomColor = chroma.random().css()

    const domains = computed(() => {
      if (keys.value) {
        return Array.from(keys.value, k => {
          const isNumerical = !isNaN(+test.value.data[0][k])

          const [
            min,
            max
          ] = extent(test.value.data, r => isNumerical ? +r[k] ?? 0 : r[k])

          const validDimension = isNumerical && (isFinite(+min) && isFinite(+max)) && min !== max

          return validDimension
            ? [
              min,
              max
            ]
            : [
              min || max,
              min || max
            ]
        })
      }
    })

    const summary = computed(() => {
      if (domains.value) {
        return Object.fromEntries(Array.from(keys.value, (key, i) => {
          const isNumerical = !isNaN(+test.value.data[0][key])

          const value = [
            key,
            {
              domain:    domains.value[i],
              numerical: isNumerical
            }
          ]

          value[1].numerical = isNumerical

          return value
        }))
      }
    })

    const dataset = computed(() => {
      return shuffle(test.value?.data || [])
    })

    watchPostEffect(() => {
      console.log('ok')
      window.dataset = dataset.value
    })

    const numericalKeys = computed(() => {
      if (dataset.value.length) {
        const entries = Object.entries(dataset.value[0])

        return entries.reduce((prev, cur) => {
          const [
            key,
            value
          ] = cur
          const isNumerical = !isNaN(+value)

          if (isNumerical && prev.length <= 15) {
            prev.push(key)
          }

          return prev
        }, []).filter(val => new Set(Float64Array.from(dataset.value, r => r[val])).size > 2)
      }
    })

    return {
      parCoordComponent,
      offset,
      test,
      dataLength,
      loading,
      keys,
      domains,
      summary,
      dataset,
      numericalKeys,
      maxLines,
      randomColor,
      width,
      height
    }
  },
  computed: {
    colorScale() {
      return scaleQuantize()
        .domain(extent(this.dataset, v => +v[this.numericalKeys[0]]))
        .range(chroma.scale(chroma.brewer.GnBu).colors(10, 'hex'))
    },
    lineStyleSettings() {
      const s = scaleSequentialPow()
        .interpolator(interpolateRainbow)
        .domain([
          0,
          1
        ])
      return {
        color:     (r, i, arr) => s(i / arr.length),
        opacity:   0.5,
        thickness: 1
      }
    }
  }
})
</script>

<style>

</style>
