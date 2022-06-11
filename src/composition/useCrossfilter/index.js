import { toRefs, tryOnScopeDispose } from '@vueuse/core'
import crossfilter from 'crossfilter2'
import {
  computed,
  effectScope,
  getCurrentScope,
  markRaw,
  onScopeDispose,
  proxyRefs,
  reactive,
  ref,
  shallowRef,
  watch
} from 'vue-demi'

/**
 * Create a crossfilter instance,
 * and provide reactive values
 * @param {Array<?>} dataset
 */
export default function (dataset) {
  const cf = crossfilter(dataset)
  const indexDimension = cf.dimension((_, i) => i)

  const { totalFiltered } = useGroupAll(cf)

  const topRecords = shallowRef(indexDimension.bottom(10))

  const watcher = cf.onChange((type) => {
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
 * Creates a reactive dimension on a crossfilter instance
 * @param {import('crossfilter2').Crossfilter} cfInstance
 * @param {(record: unknown) => string | number} accessor
 * @param {Boolean} isArray
 */
export function useDimension(cfInstance, accessor, isArray) {
  const dimension = cfInstance.dimension(accessor, isArray)
  const { onChange } = useChangeEvents(cfInstance)

  markRaw(dimension)

  function getExtent(_dimensionInstance = dimension) {
    const top = _dimensionInstance.accessor(_dimensionInstance.top(1)[0])
    const bottom = _dimensionInstance.accessor(_dimensionInstance.bottom(1)[0])

    return [
      top,
      bottom
    ].sort((a, b) => a - b)
  }

  const extent = ref(getExtent())

  const filteredExtent = shallowRef(getExtent())
  onChange((type) => {
    filteredExtent.value = getExtent()

    if (type !== 'filtered') {
      // extent.value =
    }
  })

  const filter = ref(null)
  watch(
    () => String(filter.value),
    () => {
      dimension.filter(filter.value)
    }
  )

  /**
   * Stop the crossfilter event watcher when this scope is disposed
   */
  tryOnScopeDispose(() => {
    dimension.dispose()
  })

  return reactive({
    dimension,
    filter,
    extent,
    filteredExtent: computed(() => filteredExtent.value)
  })
}

/**
 * Creates a reactive dimension on a crossfilter instance
 * @param {import('crossfilter2').Crossfilter} cfInstance
 * @param {import('crossfilter2').Dimension} dimensionInstance
 * @param {(record: unknown) => string | number} accessor
 * @param {Boolean} isArray
 */
export function useGroup(cfInstance, dimensionInstance, valueOf) {
  const _group = valueOf
    ? dimensionInstance.group(valueOf)
    : dimensionInstance.group()

  markRaw(_group)

  const { onChange } = useChangeEvents(cfInstance)

  const _all = shallowRef(_group.all())
  const _top = shallowRef(_group.top(10))

  onChange(() => {
    _all.value = _group.all()
    _top.value = _group.top(10)
  })

  markRaw(_all.value)
  markRaw(_top.value)

  /**
   * Stop the crossfilter event watcher when this scope is disposed
   */
  tryOnScopeDispose(() => {
    _group.dispose()
  })

  return reactive({
    all: _all,
    top: computed(() => {
      if (_top.value[_top.value.length - 1]?.value === 0) {
        return _top.value.slice(0, _top.value.findIndex(v => v.value === 0))
      }
      return _top.value
    }),
    group: _group
  })
}

/**
 * Creates a reactive groupAll
 * @param {import('crossfilter2').Crossfilter<T>} cfInstance
 * @param {((record: T) => number)} summarizer
 */
export function useGroupAll(cfInstance, summarizer) {
  const groupRef = shallowRef(cfInstance.groupAll())

  if (summarizer) {
    groupRef.value.reduceSum(summarizer)
  }

  /** @type {import('vue-demi').Ref<number>} */
  const totalFiltered = ref(groupRef.value.value())

  const { onChange } = useChangeEvents(cfInstance)

  onChange(() => {
    totalFiltered.value = groupRef.value.value()
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
export function useTopList(
  cfInstance,
  dimensionInstance,
  options = {
    amount: 10,
    offset: 0
  }
) {
  const optionRef = proxyRefs(options)

  const { amount, offset } = toRefs(optionRef)

  const topList = shallowRef(dimensionInstance.top(amount.value, offset.value))

  watch([
    amount,
    offset
  ], () => {
    topList.value = dimensionInstance.top(amount.value, offset.value)
  })

  const { onChange } = useChangeEvents(cfInstance)

  onChange(() => {
    // if(type !== 'filtered') {
    topList.value = dimensionInstance.top(amount.value, offset.value)
    // }
  })

  return {
    amount,
    offset,
    topList
  }
}

/**
 * Provides auto disposable event callbacks
 * Each callback created is run inside of an effect scope
 * When the scope is stopped, all events are disposed
 * @param {import('crossfilter2').Crossfilter} cfInstance
 */
export function useChangeEvents(cfInstance) {
  const mainScope = getCurrentScope()
  let effects = effectScope()

  if (mainScope) {
    onScopeDispose(() => {
      effects.stop()
    })
  }

  /**
   * @typedef {({cf: import('crossfilter2').Crossfilter, type: ('filtered' | 'dataAdded' | 'dataRemoved')})} cbParams
   * @typedef {(params: cbParams) => void} cbFn
   */

  /**
   * @type {cbFn}
   */
  const onChange = (_cb) => {
    effects.run(() => {
      const cb = cfInstance.onChange((type) => {
        // if(type === 'dataAdded') {
        _cb({
          cf: cfInstance,
          type
        })
        // }
      })

      onScopeDispose(() => {
        cb()
      })
    })
  }

  return {
    onChange,
    _effect: effects,
    stopAll() {
      effects.stop()
      effects = effectScope()
    }
  }
}
