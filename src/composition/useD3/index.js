import { noop, tryOnScopeDispose, useRafFn } from '@vueuse/core'
import { scaleLinear } from 'd3'
import { initial } from 'lodash'
import { computed, ref, shallowRef, triggerRef, unref, watch, watchEffect } from 'vue-demi'

export function useScale(baseScale = scaleLinear()) {
  const domainMin = ref(0)
  const domainMax = ref(1)

  const rangeMin = ref(0)
  const rangeMax = ref(1)

  const domain = computed({
    get() {
      return [
        domainMin.value,
        domainMax.value
      ]
    },
    set(value) {
      domainMin.value = value[0]
      domainMax.value = value[1]
    }
  })

  const range = computed({
    get() {
      return [
        rangeMin.value,
        rangeMax.value
      ]
    },
    set(value) {
      rangeMin.value = value[0]
      rangeMax.value = value[1]
    }
  })

  const scale = computed(() => {
    return unref(baseScale).copy()
      .domain(domain.value)
      .range(range.value)
  })

  return {
    scale,
    domain,
    range,
    domainMin,
    domainMax,
    rangeMin,
    rangeMax
  }
}

/**
 * transfer records in place from one array to another
 * Both arrays are modified in place, to avoid creating more
 * @param {?[]} from
 * @param {*[]} to
 * @param {number} start
 * @param {number} amount
 */
export function transferRecords(from, to = [], start = 0, amount = 100) {
  const _removed = from.splice(start, amount)
  to.push(..._removed)

  return [
    from,
    to
  ]
}

/**
 * Reactive batch running on a set of records
 * @param {[unknown]} dataset
 * @param {(batch: unknown[]) => void}
 * @param {{chunkSize: number}} options
 */
export function useBatchProcessing(dataset, onBatch, options = {}) {
  /**
   * Default options
   */
  const {
    chunkSize = 100,
    onBefore = noop,
    onComplete = noop
  } = options

  const chunk = ref(chunkSize)
  const localRecords = shallowRef()
  const batchedRecords = shallowRef([])

  // Shallow ref of the source dataset
  const datasetRef = shallowRef(dataset)

  const size = computed(() => datasetRef.value?.length)
  const remaining = computed(() => localRecords.value?.length)

  const renderBatch = async () => {
    if (localRecords.value?.length) {
      const _removed = localRecords.value.splice(0, chunk.value)
      // const _remaining = localRecords.value

      batchedRecords.value = batchedRecords.value.concat(_removed)

      triggerRef(localRecords)
      // triggerRef(batchedRecords)

      console.log('rendering')

      await onBatch(_removed)
    } else {
      pause()
    }
  }

  const {
    isActive,
    pause,
    resume
  } = useAsyncRafFn(renderBatch, {
    immediate: false
  })

  const status = computed(() => ({
    processing:     isActive.value,
    total:          size.value,
    totalProcessed: batchedRecords.value.length,
    remaining:      remaining.value,
    completed:      !isActive.value && batchedRecords.value.length === size.value
  }))

  /**
   * Creates local clone of the dataset whenever it changes
   */
  watchEffect(() => {
    localRecords.value = Array.from(datasetRef.value || [])
    // onBefore()
  })

  /**
   * Handle lifecycles
   */
  watch(isActive, (_is, _was) => {
    if (_is) {
      onBefore()
    } else {
      onComplete()
    }
  })

  watch([datasetRef], ([val]) => {
    pause()
    if (val?.length) start(val)
  },
  {
    immediate: true
  })

  function start(ds) {
    localRecords.value = Array.from(ds || datasetRef.value)
    batchedRecords.value = []

    if (!isActive.value) resume()
  }

  return {
    // localRecords,
    // batchedRecords,
    size,
    pause,
    resume,
    start,
    status
  }
}

export function useAsyncRafFn(promiseFn, options = {}) {
  const {
    immediate = true,
    window = globalThis.window
  } = options
  const isActive = ref(false)
  let rafId = null
  async function loop() {
    if (!isActive.value || !window) { return }
    await Promise.resolve(promiseFn())
    rafId = window.requestAnimationFrame(loop)
  }
  function resume() {
    if (!isActive.value && window) {
      isActive.value = true
      loop()
    }
  }
  function pause() {
    isActive.value = false
    if (rafId != null && window) {
      window.cancelAnimationFrame(rafId)
      rafId = null
    }
  }
  if (immediate) { resume() }
  tryOnScopeDispose(pause)
  return {
    isActive,
    pause,
    resume
  }
}
