<template>
  <div
    class="popover inline-flex"
    tabindex="0">
    <slot name="reference">
      Reference
    </slot>

    <div
      ref="content"
      class="content">
      <slot v-bind="{$tippy: $data.$tippy}">
        Content
      </slot>
    </div>
  </div>
</template>

<script>
import tippy, {  } from 'tippy.js'
import 'tippy.js/animations/scale.css'
import 'tippy.js/animations/shift-away.css'
import 'tippy.js/animations/shift-toward.css'
import 'tippy.js/animations/perspective.css'
import 'tippy.js/dist/svg-arrow.css'
import 'tippy.js/dist/tippy.css'
import 'tippy.js/themes/material.css'
import 'tippy.js/themes/light.css'
import 'tippy.js/themes/light-border.css'
import { PopoverConfig } from './config'

export default {
  // inheritAttrs: false,
  props: {
    /** @type {Vue.PropOptions<() => import('tippy.js').Props>} */
    tippyOptions: {
      type:    Object,
      default: () => ({
        ...PopoverConfig
        // inlinePositioning: true,
        // animateFill:       true
      })
    }
  },

  data() {
    return {
      $tippy: null
    }
  },

  computed: {
    mergedTippyOptions() {
      return {
        ...PopoverConfig,
        ...this.tippyOptions || {},
        content: this.$refs.content
      }
    }
  },

  mounted() {
    const tippyInstance = tippy(this.$el, this.mergedTippyOptions)

    this.$data.$tippy = tippyInstance

    const w = this.$watch('mergedTippyOptions', (value) => {
      this.$data.$tippy.setProps(value)
    },
    {
      deep: true
    })

    this.$once('hook:destroyed', () => {
      w()
      tippyInstance.destroy()
    })
  }
}
</script>

<style lang="scss">
.tippy-content {
  padding: 0;
}
</style>
