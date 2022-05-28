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
import { scaleLinear, scalePoint } from 'd3-scale'
import { capitalize } from 'lodash'
export default {
  props: {
    records: {
      type:    Array,
      default: () => []
    },
    fields: {
      type:    Array,
      default: () => []
    },
    xScale: {
      type:    Function,
      default: scalePoint()
    },
    yScales: {
      type:    Array,
      default: () => [scaleLinear()]
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
    lowQuality: {
      type:    Boolean,
      default: false
    },
    curve: {
      type: [
        String,
        Function,
        Object
      ],
      default: curveMethods.curveBumpX
    }
  },
  computed: {
    transformedList() {},
    /** @type {() => d3.Line} */
    lineGen() {
      const curveMethod = typeof this.curve === 'function'
        ? this.curve
        : curveMethods[`curve${capitalize(this.curve)}`]

      return line().curve(curveMethod || curveMethods.curveMonotoneX)
      // .x(this.xAccessor)
      // .y(this.yAccessor)
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
    getRecordXY(record, fields) {
      const values = Array.from(fields, (f) => record[f])

      return Array.from(values, (v, i) => {
        const x = this.xScale(this.fields[i])
        const y = this.yScales[i]?.(v) ?? 0

        return [
          x,
          y
        ]
      })
    },
    generateLine(record) {
      return this.lineGen(this.getRecordXY(record, this.fields))
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
