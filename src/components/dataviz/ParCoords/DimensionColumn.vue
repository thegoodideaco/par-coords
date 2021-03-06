<template>
  <div
    class="dimension-column"
    :style="{width: `${width}px`, height: `${height}px`}">
    <svg
      class="absolute"
      width="100%"
      height="100%">
      <y-brush
        :scale="scale"
        :domain="paddedDomain"
        :width="width"
        :height="height"
        :value="value"
        v-on="$listeners" />
    </svg>

    <tick-marks
      :scale="scale"
      :format="format"
      :ticks="ticks"
      :height="height"
      :max="max"
      :min="min"
      :size="[2, height]"
      :width="width"
      class="ticks absolute top-0 left-0"
      direction="vertical"
      reverse
      round>
      <template #tick="slotProps">
        <slot
          name="tick"
          v-bind="slotProps" />
      </template>
    </tick-marks>
  </div>
</template>

<script>
// import { nice } from 'd3-array'
import { defineComponent } from 'vue'
import TickMarks from './TickMarks.vue'
import YBrush from './YBrush.vue'
/**
 * An individual column for displaying ticks and brushing a dimension
 */
export default defineComponent({
  components: {
    TickMarks,
    YBrush
  },
  props: {

    /** @type {Vue.PropOptions<[number, number]>} */
    value: {
      type: Array
    },
    min: {
      type:    Number,
      default: 0
    },

    max: {
      type:    Number,
      default: 100
    },
    width: {
      type:    Number,
      default: 100
    },
    height: {
      type:    Number,
      default: 500
    },
    format: {
      type: [
        String,
        Function
      ],
      default: ',.3~s'
    },
    maxTicks: {
      type:    Number,
      default: 10
    },

    scale: {
      type: Function
    }
  },
  computed: {

    /** @type {() => number} */
    ticks() {
      return Math.min(~~this.height / 50, this.maxTicks)
    },

    /** @type {() => [number, number]} */
    paddedDomain() {
      return [
        this.max,
        this.min
      ]
      // return nice(this.min, this.max, this.ticks).reverse()
    }
  }
})
</script>

<style lang="scss" scoped>
.dimension-column {
  background-color: rgba(#000, .1);
  position: relative;

  text-shadow: -1px -1px rgba(#000, .5);
  text-rendering: optimizeLegibility;
  line-height: 0;
  font-size: 12px;
  font-family: 'Courier New', Courier, monospace;

  // ! This is needed for center pivot
  transform: translateX(-50%);

  .ticks {
    left: 50%;
    pointer-events: none;
  }

  svg {
    overflow: visible;

  }
}
</style>
