<template>
  <g
    class="d3-brush"
    fill="blue"
    :class="{ brushing: $data.brushing }"
    @dblclick="clearBrush" />
</template>

<script>
import { brush } from 'd3-brush'
import * as dSelection from 'd3-selection'
import { scaleLinear } from 'd3-scale'
import _ from 'lodash'
// import { ascending } from 'd3'
export default {
  model: {
    prop:  'value',
    event: 'input'
  },

  props: {

    /**
     * Domain of the data extents. For both x and y, we need an array of 2 numbers
     * @type {() => Vue.PropOptions<d3.BrushSelection>}
     */
    domain: {
      type: Array,
      default() {
        return [
          [
            0,
            0
          ],
          [
            1000,
            1000
          ]
        ]
      }
    },

    /**
     * Rounds the range, not domain
     * @type {Vue.PropOptions<boolean>}
     */
    round: {
      type:    Boolean,
      default: false
    },

    /** @type {() => Vue.PropOptions<[[number, number],[number,number]]>} */
    value: {
      type: Array
    },

    /**
     * Left of draggable area in pixels
     * @type {Vue.PropOptions<number>}
     */
    x: {
      type:    Number,
      default: 0
    },

    /**
     * Top of draggable area in pixels
     * @type {Vue.PropOptions<number>}
     */
    y: {
      type:    Number,
      default: 0
    },

    /**
     * Width of draggable area in pixels
     * @type {Vue.PropOptions<number>}
     */
    width: {
      type:    Number,
      default: 20
    },

    /**
     * Height of draggable area in pixels
     * @type {Vue.PropOptions<number>}
     */
    height: {
      type:    Number,
      default: 500
    }
  },

  data() {
    return {
      brush:     null,
      selection: null,

      /** @type {boolean} */
      brushing: false,

      // Debounce updating the model
      debounceFunction: (min, max) => {
        _.debounce(() => {
          this.$emit(
            'input',
            min === max
              ? null
              : [
                min,
                max
              ].map(([
                x,
                y
              ]) => {
                return [
                  this.round ? ~~this.scaleX.invert(x) : this.scaleX.invert(x),
                  this.round ? ~~this.scaleY.invert(y) : this.scaleY.invert(y)
                ]
              })
          )
        }, 150)()
      }
    }
  },

  computed: {
    /**
     * @type {() => d3.ScaleLinear}
     */
    scaleX() {
      const [
        tl,
        br
      ] = this.domain

      const s = scaleLinear()
        .domain([
          tl[0],
          br[0]
        ])
        .clamp(true)

      if (this.round) {
        s.rangeRound([
          this.x,
          this.width
        ])
          .nice()
      } else {
        s.range([
          this.x,
          this.width
        ])
      }

      return s
    },

    /**
     * @type {() => d3.ScaleLinear}
     */
    scaleY() {
      const [
        tl,
        br
      ] = this.domain

      const s = scaleLinear()
        .domain([
          tl[1],
          br[1]
        ])
        .clamp(true)

      if (this.round) {
        s.rangeRound([
          this.x,
          this.width
        ])
          .nice()
      } else {
        s.range([
          this.x,
          this.width
        ])
      }

      return s
    },

    /**
     * @type {() => d3.BrushBehavior}
     */
    aBrush() {
      return brush()
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

    /**
     * @type {() => object}
     */
    dimensions() {
      return [
        this.width,
        this.height
      ]
    },

    /**
     * @type {() => object}
     */
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
            val
              ? val.map(([
                x,
                y
              ]) => {
                return [
                  this.scaleX(x),
                  this.scaleY(y)
                ]
              })
              : null
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

        if (this.value && this.selection) {
          this.aBrush.move(
            this.selection,
            this.value.map(([
              x,
              y
            ]) => {
              return [
                this.round ? ~~this.scaleX.invert(x) : this.scaleX.invert(x),
                this.round ? ~~this.scaleY.invert(y) : this.scaleY.invert(y)
              ]
            })
          )
        }

        this.selection && this.selection.call(this.aBrush)
      }
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
        this.value
          ? this.value.map(([
            x,
            y
          ]) => {
            return [
              this.scaleX(x),
              this.scaleY(y)
            ]
          })
          : null
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
      const { selection, type, sourceEvent, target: brush } = s
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
            selection.map(([
              x,
              y
            ]) => {
              return [
                this.scaleX.invert(x),
                this.scaleY.invert(y)
              ]
            })
          )
        } else {
          console.log('redraw')
          this.$emit('filter:end')
          // this.selection = d3.select(this.$el).call(this.aBrush)
          // move brush to match inital value
          // this.aBrush.move(
          //   this.selection,
          //   this.value ? this.value.map(v => v) : null
          // )
        }
        break

      case 'end':
        this.$emit('filter:end')
        break
      }
    },

    // /**
    //  * @type {() => void}
    //  */
    // resetBrush() {
    //   this.aBrush.on('start brush end', null)
    //   this.$el.innerHTML = null

    //   this.$nextTick(() => {
    //     this.selection = dSelection.select(this.$el).call(this.aBrush)
    //     // move brush to match inital value
    //     this.aBrush.move(
    //       this.selection,
    //       this.value
    //         ? this.value.map(([
    //           x,
    //           y
    //         ]) => {
    //           return [
    //             this.scaleX(x),
    //             this.scaleY(y)
    //           ]
    //         })
    //         : null
    //     )

    //     this.aBrush.on('start brush end', this.brushHandler)
    //   })
    //   // this.selection = dSelection.select(this.$el).call(this.aBrush)
    // },

    /**
     * @type {() => void}
     */
    clearBrush() {
      this.$emit('input', null)
    }
  }
}
</script>

<style lang="scss" scoped>
.d3-brush .selection {
  stroke: #000;
}
</style>
