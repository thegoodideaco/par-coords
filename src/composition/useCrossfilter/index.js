import { toRefs, tryOnScopeDispose } from '@vueuse/core'
import crossfilter from 'crossfilter2'
import { proxyRefs, ref, shallowRef, watch } from 'vue-demi'

/**
 * Create a crossfilter instance,
 * and provide reactive values
 * @param {Array<?>} dataset
 */
export function useCrossfilter(dataset) {
  const cf = crossfilter(dataset)
  const indexDimension = cf.dimension((_, i) => i)

  const { totalFiltered } = useGroupAll(cf)

  const topRecords = shallowRef(indexDimension.bottom(10))

  const watcher = cf.onChange(type => {
    if (type === 'filtered') {
      topRecords.value = indexDimension.bottom(10)
    }
  })

  tryOnScopeDispose(() => {
    watcher()
  })

  return {
    cf,
    totalFiltered,
    topRecords
  }
}

/**
 * Creates a reactive groupAll
 * @param {import('crossfilter2').Crossfilter} cfInstance
 */
export function useGroupAll(cfInstance, summarizer) {
  const ga = shallowRef(cfInstance.groupAll())

  if (summarizer) { ga.value.reduceSum(summarizer) }

  /** @type {import('vue-demi').Ref<number>} */
  const totalFiltered = ref(ga.value.value())

  const watcher = cfInstance.onChange(() => {
    totalFiltered.value = ga.value.value()
  })

  tryOnScopeDispose(() => {
    watcher()
  })

  return {
    totalFiltered
  }
}

/**
 * Create a reactive dimension instance
 * @param {import('crossfilter2').Crossfilter} cfInstance
 * @param {import('crossfilter2').Dimension} dimensionInstance
 */
export function useTopList(cfInstance, dimensionInstance, options = {
  amount: 10,
  offset: 0
}) {
  const optionRef = proxyRefs(options)

  const {
    amount,
    offset
  } = toRefs(optionRef)

  const topList = shallowRef(dimensionInstance.top(amount.value, offset.value))

  const _w = watch([
    amount,
    offset
  ], () => {
    topList.value = dimensionInstance.top(amount.value, offset.value)
  })

  const watcher = cfInstance.onChange(() => {
    topList.value = dimensionInstance.top(amount.value, offset.value)
  })

  tryOnScopeDispose(() => {
    watcher()
    _w()
  })

  return {
    amount,
    offset,
    topList
  }
}
