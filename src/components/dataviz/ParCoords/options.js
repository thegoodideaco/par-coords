import { curveMethods } from '@/utils/curveMethods'
import chroma from 'chroma-js'

export const colorsets = {
  ...chroma.brewer,
  custom: []
}

export const lineOptions  = {
  thickness: {
    min: .2,
    max: 3
  }
}


/**
 * Provide a reactive config object for custom settings
 * @param {import('crossfilter2').Crossfilter} cfInstance
 */
export function useParCoordConfig(cfInstance) {
  return {
    lineThickness: 1,
    lineOpacity:   1,
    lineColor:     'green',
    lineCurve:
  }
}
