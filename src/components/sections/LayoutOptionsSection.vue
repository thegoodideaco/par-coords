<template>
  <div class="section layout">
    <div>
      <section-heading title="Hierarchy Settings">
        <template #subtitle>
          <span>Configure visual settings for the hierarchy
            <em>visualizer</em>.</span>
        </template>
      </section-heading>
      <div class="summarize-on section flex gap-2">
        <!-- Summarize on -->
        <fieldset>
          <label class="inline-grid">
            Summarize on
            <r-select
              v-model="summarizeOn"
              :items="recordFields">
              <template #default="{ value, index }">
                <span v-if="index > 0"> {{ value[0] }} ({{ value[1] }}) </span>
                <span v-else>
                  {{ value[0] }}
                </span>
              </template>
            </r-select>
          </label>
        </fieldset>
        <!-- Order -->
        <fieldset>
          <label class="inline-grid">
            Order
            <r-select
              v-model="sortOrder"
              :items="['Ascending', 'Descending']">
              <template #default="{ value }">
                <span>
                  {{ value }}
                </span>
              </template>
            </r-select>
          </label>
        </fieldset>
        <!-- Layout -->
        <fieldset>
          <label class="inline-grid">
            Layout Type
            <r-select
              v-model="layoutType"
              :items="['Treemap', 'Circle Pack']">
              <template #default="{ value }">
                <span>
                  {{ value }}
                </span>
              </template>
            </r-select>
          </label>
        </fieldset>
      </div>
    </div>

    <div class="mt-5">
      <section-heading title="Layout">
        <template #subtitle>
          <span>
            Customize how the
            <em class="text-yellow-200">{{
              layoutType.toLocaleLowerCase()
            }}</em>
            layout will display.
          </span>
        </template>
      </section-heading>

      <template v-if="layoutType === 'Treemap'">
        <div>
          <ul>
            <li
              v-for="i in 5"
              :key="i">
              item
            </li>
          </ul>
        </div>
      </template>

      <template v-else>
        <div />
      </template>
    </div>
  </div>
</template>

<script>
import {
  computed,
  defineComponent,
  inject,
  ref,
  shallowRef
} from 'vue'
import {
  pack, treemap
} from 'd3-hierarchy'
import RSelect from '../inputs/RSelect.vue'
import SectionHeading from './SectionHeading.vue'

const getGeneratorDefaults = (genFn) =>
  Object.fromEntries(
    Array.from(
      Object.entries(genFn()).filter(([, v]) => typeof v === 'function'),
      ([
        key,
        val
      ]) => {
        return [
          key,
          typeof val() === 'function' && val().length === 0 ? val()() : val()
        ]
      }
    )
  )

export default defineComponent({
  components: {
    SectionHeading,
    RSelect
  },
  setup() {
    const records = inject(
      'records',
      shallowRef([
        {
          name: 'bob'
        },
        {
          name: 'jon'
        },
        {
          name: 'dan'
        }
      ])
    )

    const recordFields = computed(() => {
      if (records.value?.length) {
        const _r = records.value[0]
        const _vals = Array.from(Object.keys(_r), (k) => {
          const vals = Array.from(records.value, (r) =>
            Number.isFinite(+r[k]) ? +r[k] : r[k]
          )
          const count = new Set(vals).size
          return [
            k,
            count
          ]
        }).sort((a, b) => a[1] - b[1])

        _vals.unshift([
          '<RECORD_COUNT>',
          ''
        ])

        return _vals
      }
    })

    const summarizeOn = ref()

    const treemapOptions = getGeneratorDefaults(treemap)
    const circlePackOptions = getGeneratorDefaults(pack)

    return {
      recordFields,
      summarizeOn,
      sortOrder:  'Ascending',
      layoutType: 'Treemap',
      treemapOptions,
      circlePackOptions
    }
  }
})
</script>

<style></style>
