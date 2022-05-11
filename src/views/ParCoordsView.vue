<template>
  <div class="inline-block">
    <div class="data-loader input inline-flex">
      <csv-select
        v-model="test"
        :placeholder="'select me'"
        @before:load="loading=true"
        @input="loading = false" />

      <data-loader
        v-model="test"
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
        min="10"
        :max="dataLength - maxLines">
    </div>

    <div class="info">
      Total Size: {{ dataLength | asNumber }}
    </div>

    <template v-if="summary">
      <div class="p-16">
        <par-coords
          v-if="!loading"
          ref="parCoordComponent"
          :width="1400"
          :max-lines="maxLines"
          :line-offset="offset"
          :dataset="dataset"
          :fields="numericalKeys"
          v-bind="lineStyleSettings" />
      </div>
      <div
        v-for="(item, key) in summary"
        :key="key"
        :class="{'text-blue-600': item.numerical}">
        {{ key }}: {{ item.domain }}
      </div>
    </template>
  </div>
</template>

<script>
import ParCoords from '@/components/dataviz/ParCoords/ParCoords.vue'
import CsvSelect from '@/components/inputs/CsvSelect.vue'
import DataLoader from '@/components/inputs/DataLoader.vue'
import chroma from 'chroma-js'
import { extent, rank } from 'd3-array'
import { interpolateRgb } from 'd3-interpolate'
import { scaleLinear, scaleQuantile, scaleQuantize, scaleSequential } from 'd3-scale'
import { interpolateCividis } from 'd3-scale-chromatic'
import { shuffle } from 'lodash'
import { computed, defineComponent, provide, ref, shallowRef, watchEffect, watchPostEffect } from 'vue-demi'
export default defineComponent({
  name:       'ParCoordsView',
  components: {
    CsvSelect,
    ParCoords,
    DataLoader
  },
  setup() {
    const parCoordComponent = ref()
    const offset = ref(0)
    const test = shallowRef(null)
    const dataLength = computed(() => parCoordComponent.value?.totalFiltered)
    const loading = ref(false)

    const maxLines = ref(1000)

    const keys = computed(() => {
      if (test.value?.data.length) {
        return Object.keys(test.value.data[0])
      }
    })

    const randomColor = chroma.random().css()

    const domains = computed(() => {
      if (keys.value) {
        return Array.from(keys.value, k => {
          const isNumerical = !isNaN(+test.value.data[0][k])

          const [
            min,
            max
          ] = extent(test.value.data, r => isNumerical ? +r[k] ?? 0 : r[k])

          const validDimension = isNumerical && (isFinite(+min) && isFinite(+max))

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

          if (isNumerical) {
            prev.push(key)
          }

          return prev
        }, []).filter(val => val)
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
      randomColor
    }
  },
  computed: {
    colorScale() {
      return scaleQuantize()
        .domain(extent(this.dataset, v => +v[this.numericalKeys[0]]))
        .range(chroma.scale(chroma.brewer.GnBu).colors(10, 'hex'))
    },
    lineStyleSettings() {
      return {
        color:     (r, i) => i < this.dataLength / 2 ? 'red' : 'green',
        opacity:   0.25,
        thickness: 0.5
      }
    }
  }
})
</script>

<style>

</style>
