<template>
  <div
    ref="el"
    class="tweakpane inline-block">
    <!-- content generated here -->
  </div>
</template>

<script>
import {
  defineComponent,
  getCurrentInstance,
  onMounted,
  reactive,
  ref,
  shallowRef
} from 'vue'
import { Pane, ListApi } from 'tweakpane'
import * as EssentialsPlugin from '@tweakpane/plugin-essentials'
import chroma from 'chroma-js'
import { curveMethods } from '@/utils/curveMethods'
// import chroma from 'chroma-js'

export default defineComponent({
  setup(_props, _ctx) {
    const el = ref()
    const pane = ref()
    const params = shallowRef()

    const inputs = shallowRef({
      colorField: null,
      listApiOps: null
    })

    const ci = getCurrentInstance()

    const PARAMS = reactive({
      factor: 123,
      title:  'hello',
      color:  '#ff0055',
      signal: 0,
      curve:  'curveLinear',

      /** @type {keyof typeof chroma.brewer} */
      colorTheme: 'RdPu',
      colorField: ''
    })

    onMounted(() => {
      const _pane = new Pane({
        container: el.value,
        title:     'Main Settings',
        expanded:  true
      })

      _pane.registerPlugin(EssentialsPlugin)

      _pane.addInput(PARAMS, 'colorTheme', {
        label:   'Theme',
        picker:  'popup',
        options: {
          ...chroma.brewer
        }
      })

      _pane.addInput(PARAMS, 'curve', {
        label:   'Curve',
        picker:  'popup',
        options: {
          ...curveMethods
        }
      })

      // const fieldOptions = computed(() => attrs)

      const colorOn = _pane.addInput(PARAMS, 'colorField', {
        label:   'Colorize on',
        options: {
          none: '',
          test: '1'
        }
      })

      const fpsGraph = _pane.addBlade({
        view:  'fpsgraph',
        label: 'fpsgraph',
        // lineCount: 3,
        min:   -10
        // max:       400
      })

      async function render() {
        // Rendering
        const comp = ci
        if (comp) {
          fpsGraph.begin()
          comp.proxy.$nextTick(() => {
            fpsGraph.end()
          })
        }

        requestAnimationFrame(render)
      }

      render()
      inputs.value.colorField = colorOn
      inputs.value.listApiOps = new ListApi(colorOn.controller_)
      _pane.addInput(PARAMS, 'factor')
      _pane.addInput(PARAMS, 'title')
      _pane.addInput(PARAMS, 'color', {
        options: {
          red: '#ff0000'
        }
      })

      /** @type {import('tweakpane').SliderApi} */
      const brightnessBlade = _pane.addBlade({
        view:  'slider',
        label: 'brightness',
        min:   0,
        max:   1,
        value: 0.5
      })

      brightnessBlade.on('change', ({ _value }) => {})

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
      el,
      inputs,
      params,
      PARAMS
    }
  }
})
</script>

<style></style>
