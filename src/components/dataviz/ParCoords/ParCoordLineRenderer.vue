<template>
  <div
    class="line-renderer"
    :class="{'hi-def': !lowQuality}">
    <svg
      class="pointer-events-none"
      width="100%"
      height="100%">

      <path
        v-for="(record, index) in records"
        :key="index"
        fill="none"
        :stroke="colorFn(record, index, records)"
        :stroke-width="strokeFn(record, index, records)"
        :stroke-opacity="opacityFn(record, index, records)"
        :d="generateLine(record)" />

    </svg>
  </div>
</template>

<script>
import { line } from 'd3-shape'
import { curveMethods } from '@/utils/curveMethods'
export default {
  props: {
    records: {
      type:    Array,
      default: () => []
    },
    color: {
      type: [
        String,
        Function
      ],
      default: '#03A9F4'
    },
    thickness: {
      type: [
        Number,
        Function
      ],
      default: 1
    },
    opacity: {
      type: [
        Number,
        Function
      ],
      default: 1
    },
    xAccessor: {
      type:    Function,
      default: r => r[0]
    },
    yAccessor: {
      type:    Function,
      default: r => r[1]
    },
    lowQuality: {
      type:    Boolean,
      default: false
    }

  },
  computed: {
    /** @type {() => d3.Line} */
    lineGen() {
      return line()
        .curve(curveMethods.curveMonotoneX)
        .x(this.xAccessor)
        .y(this.yAccessor)
    },
    /** @type {() => ((r, i: number, records: r[]) => string))} */
    colorFn() {
      return typeof this.color === 'function' ? this.color : () => this.color
    },
    /** @type {() => ((r, i: number, records: r[]) => string))} */
    strokeFn() {
      return typeof this.thickness === 'function' ? this.thickness : () => this.thickness
    },
    /** @type {() => ((r, i: number, records: r[]) => string))} */
    opacityFn() {
      return typeof this.opacity === 'function' ? this.opacity : () => this.opacity
    }
  },
  methods: {
    generateLine(record) {
      return this.lineGen(record)
    }
  }
}
</script>

<style lang="scss" scoped>
  path {
    vector-effect: non-scaling-stroke;
    shape-rendering: optimizeSpeed;

    .hi-def & {
      shape-rendering: geometricPrecision;
    }
  }
</style>
