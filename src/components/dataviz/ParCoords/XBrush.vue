<template>
  <g
    class="d3-brush"
    fill="blue"
    :class="{ brushing: brushing }"
    @dblclick="clearBrush" />
</template>

<script>
import { brushX } from 'd3-brush'
import * as dSelection from 'd3-selection'
import { scaleLinear } from 'd3-scale'
import debounce from 'lodash/debounce'
// import { ascending } from 'd3'
export default {
  model: {
    prop:  'value',
    event: 'input'
  },

  props: {
    // raw value extent
    domain: {
      type: Array,
      default() {
        return [
          0,
          1000
        ]
      }
    },

    /** @type {() => [number, number] | undefined} */
    value: {
      type: Array
    },

    x: {
      type:    Number,
      default: 0
    },

    y: {
      type:    Number,
      default: 0
    },

    width: {
      type:    Number,
      default: 20
    },

    height: {
      type:    Number,
      default: 500
    },

    snap: {
      type:    Number,
      default: 0
    }
  },

  data: () => ({
    brush:     null,
    selection: null,

    /** @type {boolean} */
    brushing: false,

    // Debounce updating the model
    debounceFunction: undefined
  }),

  computed: {
    /** @type {() => d3.ScaleLinear} */
    scale() {
      return scaleLinear().domain(this.domain).range([
        this.x,
        this.width
      ])
        .clamp(true)
    },

    snapScale() {
      if (this.snap > 0) {
        return scaleLinear().domain(this.domain).rangeRound([
          0,
          this.snap
        ])
      }
    },

    /** @type {() => d3.BrushBehavior} */
    aBrush() {
      return brushX()
        .extent([
          [
            this.x,
            this.y
          ],
          [
            this.x + this.width,
            this.y + this.height
          ]
        ])

        .handleSize(10)
        .on('start brush end', this.brushHandler)
    },

    /** @type {() => [number,number]} */
    dimensions() {
      return [
        this.width,
        this.height
      ]
    },

    /** @type {() => string} */
    dimensionStr() {
      return this.dimensions.toString()
    }
  },

  watch: {
    value: {
      handler(val) {
        if (!this.brushing) {
          // move brush to match inital value
          // values are in range of domain values
          this.aBrush.on('start brush end', null)

          this.aBrush.move(
            this.selection,
            val ? val.map((v) => this.scale(v)) : null
          )
          // debugger
          this.aBrush.on('start brush end', this.brushHandler)
        }
      }
    },

    dimensionStr: {
      handler() {
        const [
          w,
          h
        ] = this.dimensions
        const overlay = this.$el.querySelector('.overlay')

        if (overlay) {
          overlay.setAttribute('width', w)
          overlay.setAttribute('height', h)
        }

        if (this.value) {
          this.aBrush.move(this.selection, this.value.map(this.scale))
        }

        this.selection && this.selection.call(this.aBrush)
      }
    }
  },

  created() {
    this.debounceFunction = (min, max) => {
      debounce(() => {
        this.$emit(
          'input',
          min === max
            ? null
            : [
              min,
              max
            ].map((v) => this.scale(v))
        )
      }, 150)()
    }
  },

  mounted() {
    // Wait until element is rendered
    this.$nextTick(() => {
      // Set selection for brush
      this.selection = dSelection.select(this.$el).call(this.aBrush)
      // move brush to match inital value
      this.aBrush.move(
        this.selection,
        this.value ? this.value.map((v) => this.scale(v)) : null
      )
    })
  },

  beforeDestroy() {
    this.aBrush.on('start brush end', null)
    this.selection.remove()
    dSelection.select(this.$el).remove()
  },

  methods: {
    /**
     * @type {(s: d3.D3BrushEvent) => void}
     */
    brushHandler(s) {
      // console.log(s)

      // eslint-disable-next-line no-unused-vars
      const { selection, type, sourceEvent, target: brush, mode } = s

      if (this.snapScale) {
        this.brushSnapHandler(s)
        return
      }

      // console.log(sourceEvent, type)

      const userInvoked = sourceEvent != null

      // If user is actively brushing
      this.brushing = type !== 'end' && userInvoked

      // If user selects nothing
      if (selection == null) {
        this.$emit('input', null)
        return
      }

      switch (type) {
      case 'start':
        this.$emit('filter:start')
        break
      case 'brush':
        if (this.brushing) {
          this.$emit(
            'input',
            selection.map((v) => this.scale.invert(v))
          )
        } else {
          console.log('redraw')
          this.$emit('filter:end')
        }
        break

      case 'end':
        this.$emit('filter:end')
        break
      }
    },

    /**
     * @type {(event: d3.D3BrushEvent) => void}
     */
    brushSnapHandler(event) {
      if (event.sourceEvent && event.sourceEvent.type === 'brush') return
      const {
        type,
        selection
      } = event
      const userInvoked = event.sourceEvent != null

      // If user is actively brushing
      this.brushing = type !== 'end' && userInvoked

      // If user selects nothing
      if (selection == null) {
        this.$emit('input', null)
        return
      }

      switch (type) {
      case 'start':
        this.$emit('filter:start')
        break
      case 'brush':
        if (this.brushing) {
          this.$emit(
            'input',
            selection.map((v) => this.scale.invert(v - 100))
          )
        } else {
          console.log('redraw')
          this.$emit('filter:end')
        }
        break

      case 'end':
        this.$emit('filter:end')
        break
      }
    },

    /**
     * @type {() => void}
     */
    clearBrush() {
      this.$emit('input', null)
    }
  }
}
</script>

<style scoped lang="scss">
.d3-brush .selection {
  stroke: #000;
}
</style>
