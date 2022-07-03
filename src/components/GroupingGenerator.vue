<template>
  <div class="grouping-generator">
    <div class="flex items-center">
      <r-select
        class="flex-1 mr-5"
        :value="selectedKey"
        :items="localKeys"
        :filter="isSelected"
        @change="onSelect" />

      <button
        class="p-2 ml-auto"
        @click="randomize()">
        <span class="fa fa-fw fa-dice" /> Randomize
      </button>
      <button
        class="p-2"
        @click="reset()">
        <span class="fa fa-fw fa-times" /> Reset
      </button>
    </div>

    <draggable
      v-model="sortedKeys"
      :options="sortOptions">
      <div
        v-for="(item, index) in sortedKeys"
        :key="index">
        <div
          class="flex items-center bg-white text-black my-2 text-xs rounded overflow-hidden cursor-move">
          <slot
            name="default"
            v-bind="{ item, index }">
            <span
              class="p-2 px-4 bg-blue-400 text-white font-bold font-mono text-sm">
              {{ index + 1 }}
            </span>
            <span class="p-2">
              {{ item }}
            </span>
          </slot>
          <button
            class="ml-auto px-4 py-2"
            @click="sortedKeys.splice(index, 1)">
            <span class="fa fa-fw fa-times" />
          </button>
        </div>
      </div>
    </draggable>
  </div>
</template>

<script>
import {
  computed,
  defineComponent,
  onBeforeMount,
  reactive,
  ref,
  watchPostEffect
} from 'vue'

import Draggable from 'vuedraggable'
import RSelect from './inputs/RSelect.vue'
import sampleSize from 'lodash/sampleSize'
import {
  randomInt
} from 'd3-random'
import {
  fsum, rollup
} from 'd3-array'

export default defineComponent({
  components: {
    Draggable,
    RSelect
  },
  props: {
    /** @type {Vue.PropOptions<string[]>} */
    keys: {
      type:     Array,
      required: true
    },

    valueAccessor: {
      type:    Function,
      default: (k) => String(Array.isArray(k) ? k[0] : k)
    }
  },
  setup(props, {
    emit
  }) {
    const {
      keys, valueAccessor
    } = reactive(props)
    const sortedKeys = ref([])
    const localKeys = ref()

    const safeKeys = computed(() => {
      if (keys.length) return keys.filter(([, cnt]) => cnt > 1 && cnt < 100)
    })

    const groupingFn = computed(() => {
      if (!sortedKeys.value?.length) return null

      const methodArr = Array.from(sortedKeys.value, (value) => (record) => {
        const _n = record[valueAccessor(value)]
        return String(_n).trim().toLocaleLowerCase()
      })

      return (dataset) =>
        rollup(
          dataset,
          (ar) => {
            const _sum = computed(() =>
              fsum(Float32Array.from(ar, valueAccessor))
            )

            return {
              ...reactive({
                records: ar,
                sum:     _sum,
                count:   ar.length
              })
            }
          },
          ...methodArr
        )
    })

    onBeforeMount(() => {
      localKeys.value = JSON.parse(JSON.stringify(keys))
      watchPostEffect(() => {
        emit('update:group-fn', groupingFn.value)
      })
    })

    return {
      sortedKeys,
      localKeys,
      safeKeys,
      randomize() {
        sortedKeys.value = sampleSize(safeKeys.value, randomInt(3, 6)())
      },
      reset() {
        sortedKeys.value = []
      }
    }
  },
  data: () => ({
    // localKeys:   null,
    selectedKey: null
  }),
  computed: {
    /** @type {() => import('sortablejs').SortableOptions} */
    sortOptions() {
      return {
        animation: 100,
        easing:    'ease-in-out'
      }
    },

    /** @type {() => any[]} */
    remainingKeys() {
      if (this.sortedKeys.length) {
        return this.localKeys.filter(
          (k) => this.sortedKeys.indexOf(String(k)) === -1
        )
      } else return this.localKeys
    }
  },
  methods: {
    onSelect(key) {
      this.sortedKeys.push(key)
      this.selectedKey = null
    },

    isSelected(item, _index, _arr) {
      return !this.sortedKeys.includes(String(item))
    }
  }
})
</script>

<style></style>
