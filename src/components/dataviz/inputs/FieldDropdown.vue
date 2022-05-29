<template>
  <r-select
    v-model="input"
    :items="fields" />
</template>

<script>
import RSelect from '@/components/inputs/RSelect.vue'
import chroma from 'chroma-js'
import { computed, defineComponent, inject, readonly, ref, watchEffect } from 'vue-demi'
export default defineComponent( {
  components: { RSelect },
  setup(props, { emit }) {
    const cf =  inject('cf')

    const fields = readonly(Object.keys(chroma.brewer))

    const input = ref()

    const output = computed(() => {
      return chroma.brewer[input.value]
    })

    watchEffect(() => {
      emit('update:colorset', output.value)
    })

    return {
      fields,
      input,
      output,
      cf
    }
  }
})
</script>

<style>

</style>
