<template>
  <svg
    width="1px"
    height="100px">
    <g>
      <line
        :x1="0"
        :y1="0"
        :x2="5"
        :y2="0"
        :stroke-width="1"
        fill="currentColor" />
      <text>
        hello
      </text>
    </g>
  </svg>
</template>

<script>
import { scaleLinear } from 'd3-scale'
import { defineComponent } from 'vue'
export default defineComponent({
  props: {
    scale: {
      type:    Function,
      default: scaleLinear()
    }
  },
  setup(_props) {

  }
})
</script>

<style lang="scss" scoped>
svg {
  overflow: visible;
  fill: currentColor;
  text-rendering: optimizeLegibility;
  shape-rendering: crispEdges;
}
</style>
