import { nest as d3Nest } from 'd3-collection'
import {
  group,
  groupSort,
  groups,
  flatGroup,

  rollup,
  rollups,
  flatRollup

} from 'd3-array'

function nest() {
  return d3Nest()
}

export default {
  group,
  groupSort,
  groups,
  rollup,
  rollups,
  flatGroup,
  flatRollup,
  nest
}
