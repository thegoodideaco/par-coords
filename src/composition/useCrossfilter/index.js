import { toRefs, tryOnScopeDispose } from '@vueuse/core'
import crossfilter from 'crossfilter2'
import {
  computed,
  markRaw,
  reactive,
  ref,
  shallowRef,
  unref,
  watch
} from 'vue'

/**
 * Create a crossfilter instance,
 * and provide reactive values
 * @param {import('@vueuse/core').MaybeRef<?[]>} dataset
 */
export default function (dataset) {
  const ds = unref(dataset)
  const cf = crossfilter()

  markRaw(ds)
  markRaw(cf)

  const indexDimension = cf.dimension((_, i) => i)

  const total = ref(0)

  const { totalFiltered } = useGroupAll(cf)

  const topRecords = shallowRef(indexDimension.bottom(10))

  const { onChange } = useChangeEvents(cf)

  onChange((type) => {
    topRecords.value = indexDimension.bottom(10)
    if (type !== 'filtered') {
      total.value = cf.size()
    }
  })

  const actions = {
    ...cf
  }

  return {
    cf,
    total,
    totalFiltered,
    topRecords,
    actions
  }
}

/**
 * Creates a reactive dimension on a crossfilter instance
 * @param {import('crossfilter2').Crossfilter} cfInstance
 * @param {(record: unknown) => string | number} accessor
 * @param {Boolean} isArray
 */
export function useDimension(cfInstance, accessor, isArray) {
  const dimension =  markRaw(cfInstance.dimension(accessor, isArray))
  const { onChange } = useChangeEvents(cfInstance)

  function getExtent(_dimensionInstance = dimension) {
    const [
      topRecord,
      bottomRecord
    ] = [
      _dimensionInstance.top(1)[0],
      _dimensionInstance.bottom(1)[0]
    ]
    if (cfInstance.size() === 0 || !topRecord) {
      // debugger
      return [
        null,
        null
      ]
    }
    const top = _dimensionInstance.accessor(topRecord)
    const bottom = _dimensionInstance.accessor(bottomRecord)

    return [
      top,
      bottom
    ].sort((a, b) => a - b)
  }

  const extent = ref(getExtent())

  const filteredExtent = shallowRef(getExtent())
  onChange((type) => {
    console.log('type', type)
    filteredExtent.value = getExtent(dimension)

    if (type !== 'filtered') {
      // dimension.filterAll()
      extent.value = getExtent()
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
    filteredExtent
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
 * Creates a reactive groupAll on either crossfilter itself or a dimension
 * @param {import('crossfilter2').Crossfilter<T>} cfInstance
 * @param {((record: T) => number)} summarizer
 */
export function useGroupAll(cfInstance, summarizer, createOn = cfInstance) {
  const groupRef = shallowRef(createOn.groupAll())

  if (summarizer) {
    groupRef.value.reduceSum(summarizer)
  }

  /** @type {import('vue').Ref<number>} */
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
  const optionRef = reactive(options)

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
  // const mainScope = getCurrentScope()
  // let effects = markRaw(effectScope())

  // if (mainScope) {
  //   onScopeDispose(() => {
  //     effects.stop()
  //   })
  // }

  /**
   *
   * @param {typeof cfInstance.onChange} cb
   */
  function onChange(cb) {
    const watcher = cfInstance.onChange(cb)

    console.log('onChange created')
    tryOnScopeDispose(() => {
      console.log('onChange dispose')
      watcher()
    })

    return watcher
  }

  /**
   *
   * @param {() => ReturnType<typeof cfInstance.onChange>} cb
   */
  function onFiltered(cb) {
    const watcher = cfInstance.onChange((type) => {
      if (type === 'filtered') {
        cb.call(this, ...arguments)
      }
    })

    console.log('onFiltered created')
    tryOnScopeDispose(() => {
      console.log('onFiltered dispose')
      watcher()
    })

    return watcher
  }

  return {
    onChange,
    onFiltered
  }
}
