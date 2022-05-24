<template>
  <div>
    <slot v-bind="{...$attrs, cf}" />
  </div>
</template>

<script>
import crossfilter from 'crossfilter2'
import { defineComponent, provide, readonly } from 'vue-demi'
import dataset from '@/components/demo/records.json'

export default defineComponent({
  inheritAttrs: false,
  setup() {
    const cf = readonly(crossfilter(dataset))

    provide('cf', cf)

    return {
      cf
    }
  }
})
</script>

<style>

</style>
