<template>
  <div
    ref="containerEl"
    class="group-viewer">
    <small class="fixed top-10 right-10">
      {{ nodeValueExtent }} / {{ leafExtent }}
    </small>
    <svg
      width="100%"
      height="100%">
      <template v-for="(node, index) in allNodes">
        <circle
          :key="getNodeKey(node, index)"
          class="node"
          :style="getLeafStyle(node)"
          :class="{
            leaf: node.children == null,
            linked: isNodeConnectedToSelected(node, index)
          }"
          :cx="node.x"
          :cy="node.y"
          :r="node.r"
          v-on="getEvents(node, index)">
          hey
        </circle>
      </template>
    </svg>
  </div>
</template>

<script>
import {
  computed,
  defineComponent,
  onBeforeUnmount,
  onMounted,
  proxyRefs,
  shallowRef,
  watch
} from 'vue-demi'
import {
  extent
} from 'd3-array'
import {
  hierarchy, pack, treemap
} from 'd3-hierarchy'
import {
  scaleSequentialPow
} from 'd3-scale'
import {
  interpolateTurbo
} from 'd3-scale-chromatic'
import debounce from 'lodash/debounce'
export default defineComponent({
  props: {
    /**
     * lfgkjgjgjslsdksdj sdsd
     * @type {Vue.PropType<<T>() => (dataset: T[]) => Map<any, any>>}
     */
    group: {
      type:     Function,
      required: true
    },

    /**
     * @options {"treemap" | "pack"}
     */
    layout: {
      type:    String,
      default: 'treemap'
    },
    options: {
      type:    Object,
      default: () => ({
        padding: 2
      })
    }
  },
  setup(props, {
    emit
  }) {
    const {
      group, layout, options
    } = proxyRefs(props)

    const padding = computed(() => options?.padding)

    /** @type {import('vue-demi').Ref<(d3.HierarchyCircularNode & d3.HierarchyRectangularNode)>} */
    const h = shallowRef()

    /**
     * @type {import('vue-demi').ComputedRef<typeof h.value[]>}
     */
    const allNodes = computed({
      get() {
        if (h.value) {
          const nodes = Array.from(h.value())
          // remove main node
          nodes.shift()

          return nodes
        }
      }
    })

    const nodeValueExtent = computed(() => {
      if (allNodes.value) { return extent(Float64Array.from(allNodes.value, l => l.value)) }
    })

    const leafNodes = computed(() => {
      return allNodes.value && allNodes.value.filter(n => n.height === 0)
    })

    const leafExtent = computed(() => leafNodes.value && extent(Float64Array.from(leafNodes.value, n => n.value)))

    /** @type {import('vue-demi').Ref<HTMLElement>} */
    const containerEl = shallowRef()

    const dimensions = shallowRef([
      1,
      1
    ])

    const selectedNode = shallowRef(-1)

    function getEvents(node, _index) {
      if (node.children) return
      return {
        mouseover: () => {
          selectedNode.value = _index
          // console.log('hey', node)
        },
        mouseleave: () => {
          selectedNode.value = null
        },
        click: () => {
          console.log( {
            node,
            _index
          })
        }
      }
    }
    function isNodeConnectedToSelected(node, _index) {
      if (selectedNode.value === -1) return false

      const sNode = allNodes.value[selectedNode.value]
      if (!sNode) return

      const key1 = sNode.data[0]
      const key2 = node.data[0]

      return key1 === key2 && sNode.depth === node.depth
    }

    /**
     * Layout Generator with settings applied
     */
    const layoutGen = computed(() => {
      if (layout === 'treemap') { return treemap().size(dimensions.value) } else {
        return pack()
          .size(dimensions.value)
          .padding(padding.value ?? 0)
      }
    })

    const colorScale = computed(() => {
      return scaleSequentialPow()
        .exponent(0.5)
        .domain(leafExtent.value || [
          0,
          1
        ])
        .interpolator(interpolateTurbo)
    })

    function updatedDimensions() {
      const {
        width, height
      } = containerEl.value.getBoundingClientRect()
      dimensions.value = [
        width,
        height
      ]
    }

    const updatedimensionsDebounced = debounce(updatedDimensions, 10)

    onMounted(() => {
      updatedDimensions()
      window.addEventListener('resize', updatedimensionsDebounced)

      function updateLayout(group, layoutGen) {
        const _h = hierarchy(group)

        // _h.count()
        _h.sum((d) => d[1].count)
        _h.sort((b, a) => a.value - b.value || a.height - b.height)
        _h.eachBefore((n) => {
          const ndata =  n.data[1]
          n.data[1] = () => ndata
        })

        layoutGen.value(_h)

        h.value = () => _h
      }

      const watchers = [
        watch(selectedNode, (val) => emit('select:node', val), {
          flush: 'sync'
        }),

        watch(
          group,
          (_group) => {
            if (_group && layoutGen.value) { updateLayout(_group, layoutGen) }
          },
          {
            flush: 'post'
          }
        )
      ]

      onBeforeUnmount(() => {
        watchers.forEach((w) => w())
      })
    })

    onBeforeUnmount(() => {
      console.log('unmounting')
      window.removeEventListener('resize', updatedimensionsDebounced)
    })

    return {
      dimensions,
      containerEl,
      hierarchy: h,
      allNodes,
      nodeValueExtent,
      leafNodes,
      leafExtent,
      colorScale,
      getEvents,
      selectedNode,
      isNodeConnectedToSelected
    }
  },
  methods: {
    // getEvents(node) {
    //   if (node.children) return
    //   return { mouseover: () => console.log('hey', node) }
    // }

    /**
     * @type {(leafNode: d3.HierarchyCircularNode<any>)}
     */
    getLeafStyle(leafNode) {
      return {
        strokeWidth:    '.5px',
        stroke:         '#fff',
        '--node-color': this.colorScale(leafNode.value)
      }
    },

    /**
     * @type {(node: d3.HierarchyCircularNode, _index: number) => string}
     */
    getNodeKey(node, _index) {
      return _index + '-' + node.children ? _index : node.parent.data[0] + '/' + node.data[0]

      // return `${node.data[0]}_${node.depth}`
    }
  }
})
</script>

<style lang="scss" scoped>
.node {
  fill-opacity: 0.15;

  transition: all 300ms cubic-bezier(0.165, 0.84, 0.44, 1);

  &.leaf {
    fill: var(--node-color, green);
    fill-opacity: 1;
    cursor: pointer;
  }

  &.linked {
    fill: yellow;
  }
}
</style>
