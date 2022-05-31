<template>
  <div
    ref="el"
    class="tweakpane inline-block">
    yo
  </div>
</template>

<script>
import { defineComponent, onMounted, ref } from '@vue/composition-api'
import { Pane } from 'tweakpane'
import * as EssentialsPlugin from '@tweakpane/plugin-essentials'
// import chroma from 'chroma-js'

export default defineComponent({
  setup() {
    const el = ref()
    const pane = ref()

    onMounted(() => {
      const _pane = new Pane({
        container: el.value
      })

      _pane.registerPlugin(EssentialsPlugin)

      const PARAMS = {
        factor: 123,
        title:  'hello',
        color:  '#ff0055',
        signal: 0,

        /** @type {keyof typeof chroma.brewer} */
        colorTheme: 'RdPu'
      }

      _pane.addInput(PARAMS, 'factor')
      _pane.addInput(PARAMS, 'title')
      _pane.addInput(PARAMS, 'color', {
        options: {

        }
      })

      _pane.addBlade({
        view:  'slider',
        label: 'brightness',
        min:   0,
        max:   1,
        value: 0.5
      })

      _pane.on('update', ({ presetKey, value, target }) => {
        console.log({
          presetKey,
          value,
          target
        })
      })

      pane.value = _pane
    })

    return {
      pane,
      el
    }
  }
})
</script>

<style>

</style>
