<template>
  <r-select
    v-model="input"
    :items="colors" />
</template>

<script>
import RSelect from '@/components/inputs/RSelect.vue'
import chroma from 'chroma-js'
import { computed, defineComponent, readonly, ref, watchEffect } from 'vue-demi'
export default defineComponent( {
  components: { RSelect },
  setup(props, { emit }) {
    const colors = readonly(Object.keys(chroma.brewer))

    const input = ref()

    const output = computed(() => {
      return chroma.brewer[input.value]
    })

    watchEffect(() => {
      emit('update:colorset', output.value)
    })

    return {
      colors,
      input,
      output
    }
  }
})
</script>

<style>

</style>
