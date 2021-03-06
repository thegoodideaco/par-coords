import { computed, readonly, ref, shallowRef, triggerRef } from 'vue'
import crossfilter from 'crossfilter2'
import { scalePow } from 'd3'
import { tryOnScopeDispose } from '@vueuse/core'

/**
 * @typedef {import('crossfilter2').OrderedValueSelector<T, number>} cfAccessor
 */

/**
 * @typedef {string | (r: any) => any | {label: string, field: cfAccessor}} accessorObj
 */

/**
 * @param {Array<T = any>} dataset
 * @param {accessorObj[]} dimensions
 */
export function useCrossfilterOld(cfInstance, dataset, dimensions) {
  /** @type {import('crossfilter2').Crossfilter<typeof dataset[0]>} */
  const cfRaw = cfInstance || crossfilter()

  if (!cfRaw.size() && dataset) {
    cfRaw.add(dataset)
  }

  const cf = readonly(cfRaw)

  const createDimension = (strOrFn) => {
    /**
     * Force string fields to be numerical
     */
    if (typeof strOrFn === 'string') {
      return cf.dimension((r) => !!r && isFinite(+r[strOrFn]) ? +r[strOrFn] : 0)
    } else {
      if (typeof strOrFn.field === 'string') {
        return cf.dimension((r) => !!r && (isFinite(+r[strOrFn.field]) || 0))
      } else {
        return cf.dimension((r) => +strOrFn.field(r) || 0)
      }
    }
  }

  const getExtent = (dim) => {
    const top = dim.accessor(dim.top(1)[0])
    const bottom = dim.accessor(dim.bottom(1)[0])

    return [
      top,
      bottom
    ].sort((a, b) => a - b)
  }

  const dimensionObjects = shallowRef(Array.from(dimensions, createDimension))

  const extents = computed(() => Array.from(dimensionObjects.value, getExtent))

  /**
   * @type {import('vue').ComputedRef<d3.ScaleLinear<[number, number], [number, number]>[]>}
   */
  const scales = computed(() => Array.from(extents.value, (e) => {
    console.log('updating scales')
    return scalePow()
      .exponent(1)
      .domain(e).nice()
  }))

  const mainGroup = cf.groupAll()
  const totalFiltered = ref(100)
  const filterWatch = cf.onChange(t => {
    if (t === 'filtered') {
      totalFiltered.value = mainGroup.value()
    } else if (t === 'dataAdded' || t === 'dataRemoved') {
      dimensionObjects.value.forEach(d => d.filterAll())
      triggerRef(dimensionObjects)
    }
  })

  tryOnScopeDispose(() => {
    dimensionObjects.value.forEach(d => d.dispose())
    cf.remove(() => true)
    filterWatch()
    console.log('disposed')
  })

  return {
    cf,
    dimensions: dimensionObjects,
    extents,
    scales,
    totalFiltered,
    mainGroup,
    filterWatch
  }
}
