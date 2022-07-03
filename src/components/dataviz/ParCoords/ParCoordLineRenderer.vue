<template>
  <div
    class="line-renderer"
    :class="{'hi-def': !lowQuality}">
    <svg
      v-if="!useCanvas"
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

    <canvas
      v-else
      ref="canvas"
      class="w-full h-full absolute">
      <!-- line rendering -->
    </canvas>
  </div>
</template>

<script>
import { line } from 'd3-shape'
import { curveMethods } from '@/utils/curveMethods'
import { scaleLinear, scalePoint } from 'd3-scale'
import { capitalize } from 'lodash'
import { computed, defineComponent, ref, watchEffect } from 'vue'
import chroma from 'chroma-js'
export default defineComponent({
  props: {
    useCanvas: {
      type:    Boolean,
      default: false
    },
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
  setup(props) {
    const canvas = ref()

    const width = computed(() => props.xScale.range()[1])
    const height = computed(() => props.yScales[0].range()[0])

    watchEffect(() => {
      if (canvas.value) {
        canvas.value.width = width.value
        canvas.value.height = height.value
      }
    })

    const clearCanvas = () => {
      if (canvas.value) {
        /** @type {CanvasRenderingContext2D} */
        const ctx = canvas.value.getContext('2d')

        if (ctx) {
          ctx.clearRect(0, 0, width.value, height.value)
        }
      }
    }

    return {
      props,
      canvas,
      width,
      height,
      clearCanvas
    }
  },
  computed: {
    /** @type {() => d3.Line} */
    lineGen() {
      const curveMethod = typeof this.curve === 'function'
        ? this.curve
        : curveMethods[`curve${capitalize(this.curve)}`]

      const gen = line().curve(curveMethod || curveMethods.curveMonotoneX)

      /** @type {HTMLCanvasElement} */
      const el = this.canvas
      if (el) {
        const ctx = el.getContext('2d')
        gen.context(ctx)
      }

      return gen
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
        const y = this.yScales[i]?.(+v ?? 0)

        return [
          x,
          y
        ]
      })
    },
    generateLine(record) {
      return this.lineGen(this.getRecordXY(record, this.fields))
    },
    drawLineToCanvas(record) {
      const ctx = this.lineGen.context()

      if (ctx) {
        ctx.strokeStyle = 'rgba(255,255,255,.015)'
        ctx.beginPath()
        this.generateLine(record)
        ctx.stroke()
      }
    },
    drawAll(records, chunkSize = 100) {
      const ctx = this.lineGen.context()

      if (ctx) {
        this.clearCanvas()
        const localRecords = Array.from(records)

        return new Promise((resolve) => {
          const onDraw = () => {
            const chunk = localRecords.splice(0, chunkSize)

            if (chunk.length) {
              requestAnimationFrame(() => {
                ctx.strokeStyle = 'rgba(255,255,255,.015)'
                ctx.beginPath()
                chunk.forEach(record => {
                  ctx.strokeStyle = chroma.random().alpha(0.05).css()
                  ctx.beginPath()
                  this.generateLine(record)
                  // ctx.closePath()
                })
                ctx.stroke()
                onDraw()
              })
            } else {
              resolve()
            }
          }

          onDraw()
        })
      }
    }
  }
})
</script>

<style lang="scss" scoped>
path {
  // vector-effect: non-scaling-stroke;
  shape-rendering: optimizeSpeed;

  .hi-def & {
    shape-rendering: geometricPrecision;
  }
}
</style>
