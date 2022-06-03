<template>
  <div class="w-full h-full">
    <div class="w-full h-full main-layout">
      <!-- Top -->
      <div class="top">
        <div class="text-center grid justify-center">
          <!-- Top header -->
          <div class="top-header">
            <h1>Coord-o-matic</h1>
            <h1 class="text-xs">
              Interactive parallel coordinates using virtually any dataset.
            </h1>
            <!-- Top Nav (remove this) -->
            <template v-if="false">
              <div class="data-loader input inline-flex gap-2 p-3">
                <!-- Select -->
                <csv-select
                  v-model="test"
                  :placeholder="'select me'"
                  @before:load="loading = true"
                  @input="loading = false" />
                <!-- Upload button -->
                <data-loader
                  v-model="test"
                  class="px-3 py-2 rounded bg-blue-400 cursor-pointer text-white"
                  @before:load="loading = true"
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
            </template>
          </div>
          <!-- Data Loader -->
          <div class="data-loading">
            <data-loader
              v-model="test"
              @before:load="loading = true"
              @input="loading = false">
              <button
                tabindex="-1"
                class="btn btn-primary m-auto">
                <span class="fa fa-fw fa-upload" /> Create your own
              </button>
            </data-loader>
            <button class="btn btn-link">
              How does this work?
            </button>
          </div>
        </div>
      </div>

      <!-- Par Coords -->
      <div class="select-none chart-container">
        <div class="data-info flex justify-between">
          <div v-if="nav.loaded">
            <p class="text-xs">
              {{ nav.activeUrl }}
            </p>
            <p class="text-xs">
              {{ nav.dataset.length | asNumber }} total records
            </p>

            <p class="text-xs text-green-400">
              {{
                dataLength === dataset.length ? 0 : dataLength | asNumber
              }} filtered
            </p>
          </div>

          <div v-if="nav.loaded">
            Filter action area
          </div>
        </div>
        <div
          ref="chartEl"
          class="chart-container__wrap">
          <transition
            name="fade"
            mode="out-in">
            <par-coords
              v-if="nav.loaded"
              :key="nav.activeUrl"
              ref="parCoordComponent"
              class="chart absolute"
              v-bind="{ width, height, ...lineStyleSettings }"
              :curve="curveType"
              :max-lines="maxLines"
              :line-offset="offset"
              :dataset="dataset"
              :fields="numericalKeys">
              <template #footer="{ field }">
                <small class="label transform -rotate-45 select-none">
                  {{ field }}
                </small>
              </template>
            </par-coords>
          </transition>
        </div>
        <div class="nav-prev">
          <button
            class="nav p-5 rounded-full border-2"
            @click="nav.prev()">
            <span class="fa fa-fw fa-chevron-left" />
            <span class="hidden">Previous</span>
          </button>
        </div>
        <div class="nav-next">
          <button
            class="nav p-5 rounded-full border-2"
            @click="nav.next()">
            <span class="fa fa-fw fa-chevron-right" />
            <span class="hidden">Next</span>
          </button>
        </div>
      </div>
    </div>

    <!-- Adjustments -->
    <tweak-pane class="fixed top-5 right-5" />
  </div>
</template>

<script>
import ColorDropdown from '@/components/dataviz/inputs/ColorDropdown.vue'
import ParCoords from '@/components/dataviz/ParCoords/ParCoords.vue'
import TweakPane from '@/components/demo/TweakPane.vue'
import CsvSelect from '@/components/inputs/CsvSelect.vue'
import DataLoader from '@/components/inputs/DataLoader.vue'
import { useCSV } from '@/composition/useCsv'
import { curveMethods } from '@/utils/curveMethods'
import { useElementSize } from '@vueuse/core'
import chroma from 'chroma-js'
import { extent } from 'd3-array'
import { scaleQuantize, scaleSequentialPow } from 'd3-scale'
import { interpolateRainbow } from 'd3-scale-chromatic'
import { computed, defineComponent, ref, shallowRef, watchPostEffect } from 'vue-demi'
export default defineComponent({
  name:       'ParCoordsView',
  components: {
    CsvSelect,
    ParCoords,
    DataLoader,
    ColorDropdown,
    TweakPane
  },
  setup() {
    const curveType = ref(curveMethods.curveBumpX)
    const nav = useCSV()
    const parCoordComponent = ref()
    const offset = ref(0)
    const test = shallowRef(null)
    const dataLength = computed(() => parCoordComponent.value?.totalFiltered)
    const loading = nav.loading

    const opacityGen = ref(0.5)

    const maxLines = ref(500)

    const keys = computed(() => {
      if (nav.dataset?.length) {
        return Object.keys(nav.dataset[0])
      }
    })

    const chartEl = ref()
    const { width, height } = useElementSize(chartEl)

    const randomColor = chroma.random().css()

    const domains = computed(() => {
      if (keys.value) {
        return Array.from(keys.value, (k) => {
          const isNumerical = !isNaN(+nav.dataset[0][k])

          const [
            min,
            max
          ] = extent(nav.dataset, (r) => isNumerical ? +r[k] ?? 0 : r[k])

          const validDimension = isNumerical && isFinite(+min) && isFinite(+max) && min !== max

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
        return Object.fromEntries(
          Array.from(keys.value, (key, i) => {
            const isNumerical = !isNaN(+nav.dataset[0][key])

            const value = [
              key,
              {
                domain:    domains.value[i],
                numerical: isNumerical
              }
            ]

            value[1].numerical = isNumerical

            return value
          })
        )
      }
    })

    const dataset = computed(() => {
      return nav.dataset
    })

    watchPostEffect(() => {
      console.log('ok')
      window.dataset = dataset.value
      window.opacityGen = opacityGen
    })

    const numericalKeys = computed(() => {
      if (dataset.value.length) {
        const entries = Object.entries(dataset.value[0])

        return entries
          .reduce((prev, cur) => {
            const [
              key,
              value
            ] = cur
            const isNumerical = !isNaN(+value)

            if (isNumerical && prev.length <= 15) {
              prev.push(key)
            }

            return prev
          }, [])
          .filter((val) => new Set(Float64Array.from(dataset.value, (r) => r[val])).size > 2)
      }
    })

    return {
      curveType,
      chartEl,
      nav,
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
      height,
      opacityGen
    }
  },
  computed: {
    colorScale() {
      return scaleQuantize()
        .domain(extent(this.dataset, (v) => +v[this.numericalKeys[0]]))
        .range(chroma.scale(chroma.brewer.GnBu).colors(10, 'hex'))
    },
    lineStyleSettings() {
      const s = scaleSequentialPow().interpolator(interpolateRainbow).domain([
        0,
        1
      ])
      return {
        color:     (r, i, arr) => s(i / arr.length),
        opacity:   this.opacityGen,
        thickness: 1
      }
    }
  }
})
</script>

<style lang="scss" scoped>
.main-layout {
  position: relative;
  display: grid;
  grid-template-rows: auto 1fr;
}

.chart-container {
  display: grid;
  position: relative;
  overflow: hidden;
  grid:
    [row1-start] "prev info next" auto [row1-end]
    [row2-start] "prev chart next" 1fr [row2-end]
    / auto 1fr auto;
  column-gap: 1rem;

  &__wrap {

    grid-area: chart;
    // background-color: red;
    padding: 4rem;
    overflow: hidden;
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
  }

  .nav-prev,
  .nav-next {
    padding: 2rem;
    align-self: center;
  }
}

.data-info {
  grid-area: info;
  padding: 0 4rem;
}

.nav-prev {
  grid-area: prev;
}

.nav-next {
  grid-area: next;
}
</style>
