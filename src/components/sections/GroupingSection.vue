<template>
  <div class="section grouping bg-gray-700">
    <section-heading
      title="Configure grouping rules"
      sub-title="Choose which properties you'd like to group, and their order." />

    <grouping-generator
      :keys="keys"
      v-on="$listeners">
      <!-- <template #default="{item, index}">
        {{ index+1 }}. {{ item }}
      </template> -->
    </grouping-generator>
  </div>
</template>

<script>
import {
  computed, defineComponent, inject, ref
} from 'vue-demi'
import GroupingGenerator from '../GroupingGenerator.vue'
import SectionHeading from './SectionHeading.vue'
export default defineComponent({
  components: {
    GroupingGenerator,
    SectionHeading
  },
  setup() {
    const records = inject(
      'records',
      ref([
        {
          foo: 'bar'
        }
      ])
    )

    const keys = computed(() => {
      if (records.value?.length) {
        const _r = records.value[0]
        return Array.from(Object.keys(_r), (k) => {
          const vals = Array.from(records.value, (r) =>
            Number.isFinite(+r[k]) ? +r[k] : r[k]
          )
          const count = new Set(vals).size
          return [
            k,
            count
          ]
        }).sort((a, b) => a[1] - b[1])
      }
    })

    const safeKeys = computed(() => {
      if (keys.value.length) {
        return keys.value.filter(([, cnt]) => cnt > 1 && cnt < 500)
      }
    })
    return {
      // records,
      keys,
      safeKeys
    }
  }
})
</script>

<style></style>
