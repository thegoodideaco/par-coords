<template>
  <div
    class="ticks select-none"
    :class="{'tick-marks--vertical': direction === 'vertical'}"
    :style="customStyles">
    <!-- All the ticks -->
    <div
      v-for="(item, index) in scaleTicks"
      :key="index"
      :style="tickTransform(item)"
      class="tick">
      <div class="tick-wrap">
        <span
          class="tick-line"
          :style="lineStyle" />
        <div
          class="tick-slot"
          :style="lineTickStyle">
          <!--
              @slot default Tick area
                    @bind {{tick: number, formattedTick: string}} Objects
                    -->
          <slot v-bind="{ tick: item, formattedTick: formatted(item) }">
            <small>{{ formatted(item) }}</small>
          </slot>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { scaleLinear, scaleTime } from 'd3-scale'
import { format as _format } from 'd3-format'
import { timeFormat as _timeFormat } from 'd3-time-format'
export default {
  props: {
    isTime: {
      type:    Boolean,
      default: false
    },

    min: {
      type:    Number,
      default: 0
    },

    max: {
      type:    Number,
      default: 100
    },

    /**
     * Represents width and height as `[width, height]`
     * This is optional, and replaces width and height properties
     * @type {Vue.PropOptions<[number, number]>}
     */
    size: {
      type:     Array,
      required: false
    },

    reverse: {
      type: Boolean
    },
    ticks: {
      /**
       * @type {Vue.PropType<number | number[]>}
       */
      type: [
        Number,
        Array
      ],

      default: () => 10
    },

    lineLength: {
      type:    Number,
      default: 5
    },

    nice: {
      type:    Boolean,
      default: true
    },

    clamp: {
      type:    Boolean,
      default: true
    },

    direction: {
      type:    String,
      default: 'horizontal'
    },

    format: {
      type: [
        String,
        Function
      ]
    },

    round: {
      type: [
        Boolean,
        String
      ],

      default: false
    },
    width: {
      type:    Number,
      default: 500
    },
    height: {
      type:    Number,
      default: 500
    },
    scale: {
      type: Function
    }
  },

  computed: {
    /**
     * @type {() => number}
     */
    $width() {
      if (!this.size) return this.width
      return this.size[0] || this.width
    },

    /**
     * @type {() => number}
     */
    $height() {
      if (!this.size) return this.height
      return this.size[1] || this.height
    },

    /**
     * @type {() => [number, number]}
     */
    domain() {
      return [
        this.min,
        this.max
      ]
    },

    /**
     * @type {() => [number, number]}
     */
    range() {
      const h = this.direction === 'horizontal'
      const r = [
        0,
        (h ? this.width : this.height) - 1
      ]

      if (this.reverse) {
        r.reverse()
      }

      return r
    },

    /**
     * @type {() => d3.ScaleLinear}
     */
    localScale() {
      const s = this.scale?.copy() || (this.isTime ? scaleTime() : scaleLinear())

      s.domain(this.domain).clamp(this.clamp)

      if (this.round) {
        s.rangeRound(this.range)
      } else {
        s.range(this.range)
      }

      if (this.nice) {
        s.nice(Array.isArray(this.ticks) ? this.ticks.length : this.ticks)
        // s.nice()
      }

      return s
    },

    /**
     * @type {() => number[]}
     */
    scaleTicks() {
      return [...this.localScale.ticks(this.ticks)]
    },

    customStyles() {
      // const h = this.direction === 'horizontal'

      const width = `${this.width}px`
      const height = `${this.height}px`

      return {
        height,
        width
      }
    },

    /**
     * @type {() => {width: string, height: string, transform: string}}
     */
    lineStyle() {
      const transform = 'translateZ(0)'

      return {
        width:  this.direction === 'horizontal' ? '1px' : `${this.lineLength}px`,
        height: this.direction === 'vertical' ? '1px' : `${this.lineLength}px`,
        transform
      }
    },

    /**
     * @type {() => any}
     */
    lineTickStyle() {
      const h = this.direction === 'horizontal'

      const x = h ? '-50%' : '-2px'
      const y = h ? `${this.lineLength + 2}px` : '-50%'

      return {
        transform: `translateX(${x}) translateY(${y}) translateZ(0)`,
        textAlign: 'right'
      }
    }
  },

  methods: {

    /**
     * Formats the value based on config
     * @type {(val: any) => string}
     */
    formatted(val) {
      try {
        if (this.format) {
          return typeof this.format === 'function'
            ? this.format(val)
            : (this.isTime ? _timeFormat : _format)(this.format)(val)
        } else {
          return val
        }
      } catch (error) {
        return val
      }
    },

    /**
     * Transform style property for positioning
     * @type {(tick: number) => {transform: string}}
     */
    tickTransform(tick) {
      const prop = this.direction === 'vertical' ? 'translateY' : 'translateX'
      return {
        transform: `${prop}(${this.localScale(tick)}px)`
      }
    }
  }
}
</script>

<style lang="scss" scoped>
.ticks {
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  shape-rendering: optimizeSpeed;
  text-rendering: optimizeSpeed;

  border-top: 1px solid currentColor;

  &.tick-marks--vertical {
    border-top: 0;
    border-left: 1px solid currentColor;
  }

}
.tick {
  position: absolute;
  contain: layout;
}
.tick-marks {
  // min-width: 100px;
  border-color: currentColor;
  // border-top: 1px solid currentColor
}

.tick-wrap {
  position: relative;

  .tick-marks--vertical & {
    transform: translateX(-100%);
  }
}

.tick-line {
  width: 1px;
  height: 10px;
  margin-bottom: 3px;
  display: block;
  background-color: currentColor;

  .tick-marks--vertical & {
    // height: 1px;
    // width: 10px;
    margin-bottom: 0;
    // margin-left: 3px;
    // transform: translateX(-100%);
  }
}

.tick-slot {
  position: absolute;
  top: 0;
  left: 0;
  // transform: translateX(-50%) translateZ(0);
  white-space: nowrap;

  .tick-marks--vertical & {
    text-align: right;
    // transform: translateY(-50%);
    // top: 50%;
    left: auto;
    right: 100%;
  }
}

</style>
