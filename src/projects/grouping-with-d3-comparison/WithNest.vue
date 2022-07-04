<template>
  <div>
    Nest demo <br>

    <h2>{{ keys }}</h2>

    <pre>{{ groupHierarchy.data }}</pre>

    <svg
      class="crisp"
      :width="`${width}px`"
      :height="`${height}px`">
      <rect
        v-for="(node, index) in layoutHierarchy.descendants()"
        :key="index"
        :x="node.x0"
        :y="node.y0"
        :width="node.x1 - node.x0"
        :height="node.y1 - node.y0"
        fill="none"
        stroke="green"
        stroke-width="1" />
    </svg>
  </div>
</template>

<script>
import { nest } from 'd3-collection-nest'
import { group } from 'd3-array'
// eslint-disable-next-line import/no-absolute-path
import csvdata from '/public/datasets/pokemon/pokemon.csv'
import { csvParse } from 'd3-dsv'
import { hierarchy, treemap, treemapBinary } from 'd3-hierarchy'

const dataset = csvParse(csvdata)
Object.assign(window, {
  dataset,
  dev: {
    nest,
    group
  }
})

export default {
  data: () => ({
    nester:  () => nest,
    dataset: () => dataset,
    keys:    [
      'Type 1',
      'Type 2',
      'Generation',
      'Legendary'
    ],
    width:         1000,
    height:        1000,
    padding:       0,
    paddingInner:  4,
    paddingOuter:  2,
    paddingTop:    0,
    paddingRight:  0,
    paddingBottom: 0,
    paddingLeft:   0,
    round:         true
  }),
  computed: {
    groupMap() {
      const keyFns = Array.from(this.keys, k => (record) => record[k])

      return group(this.dataset(), ...keyFns)
    },
    layoutGen() {
      return treemap()
        .size([
          this.width,
          this.height
        ])
        .tile(treemapBinary)
        .round(this.round)
        // .padding(this.padding)
        .paddingInner(this.paddingInner)
        .paddingOuter(this.paddingOuter)
        // .paddingTop(this.paddingTop)
        // .paddingRight(this.paddingRight)
        // .paddingBottom(this.paddingBottom)
        // .paddingLeft(this.paddingLeft)
    },
    groupHierarchy() {
      return hierarchy(this.groupMap)
        .count()
        .sort((a, b) => b.value - a.value || b.depth - a.depth)
    },
    layoutHierarchy() {
      /** @type {d3.HierarchyNode} */
      const hierarchyClone = this.groupHierarchy
      this.layoutGen(hierarchyClone)

      return hierarchyClone
    }
  }
}
</script>

<style>
.crisp {
  shape-rendering: crispEdges;
}
</style>
