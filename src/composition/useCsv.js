import { CSV_PATHS } from '@/config'
import { tryOnScopeDispose } from '@vueuse/core'
import { csv } from 'd3'
import Papa from 'papaparse/papaparse'
import { computed, effectScope, proxyRefs, ref, shallowRef, unref, watchEffect } from 'vue-demi'

export function useCSV(paths = CSV_PATHS) {
  const _index = ref(0)
  const index = computed({
    get() {
      return _index.value
    },
    set(value) {
      if (value < 0) {
        _index.value = paths.length - Math.abs(value) % paths.length
      } else {
        _index.value = value % paths.length
      }
    }
  })
  const activeUrl = computed(() => CSV_PATHS[index.value])

  const loading = ref(false)
  const loaded = ref(false)

  const dataset = shallowRef()

  async function load(path) {
    loading.value = true
    loaded.value = false
    dataset.value = null

    const data = await csv(path)

    dataset.value = data
    loading.value = false
    loaded.value = true
  }

  const watcher = watchEffect(() => load(activeUrl.value))

  return proxyRefs({
    index,
    activeUrl,
    loading,
    loaded,
    dataset,
    prev: () => index.value--,
    next: () => index.value++,
    watcher
  })
}

export function usePapaParseLoader() {
  const loaded = ref(false)
  const size = ref(0)
  const error = ref()

  const byteLength = ref(0)
  const loadedBytes = ref(0)
  const meta = ref()
  const aborted = ref(false)
  const paused = ref(false)

  const percent = computed(() => {
    const total = unref(byteLength)
    const cur = unref(loadedBytes)

    if (total === 0) {
      return 0
    }

    return cur / total
  })

  /** @type {typeof import('vue-demi').EffectScope | null} */
  let scope

  /** @type {import('vue-demi').Ref<import('papaparse').Parser>} */
  const parser = shallowRef()

  const abort = () => {
    aborted.value = true
    if (parser.value?.abort) {
      parser.value.abort()
    }
  }

  function load(data, onChunk, chunkSize = 100) {
    return new Promise((resolve, reject) => {
      if (scope?.active) {
        scope.stop()
      }
      scope = effectScope(true)
      scope.run(() => {
        loaded.value = false
        size.value = 0
        loadedBytes.value = 0
        byteLength.value = data.length
        meta.value = null
        parser.value = null

        try {
          Papa.parse(data, {
            header: true,

            chunk: (results, _parser) => {
            // if (meta.value == null) {

              meta.value = results.meta
              error.value = results.errors

              if (parser.value !== _parser) {
                parser.value = _parser
              }

              size.value += results.data.length
              loadedBytes.value = results.meta.cursor
              if (onChunk instanceof Function) {
                onChunk(results, _parser)
              }
            },
            complete: (results) => {
              if (results) {
                meta.value = results.meta
                error.value = results.errors[0]
              }
              loaded.value = percent.value === 1
              scope.stop()

              if (!loaded.value) {
                resolve('aborted')
              } else {
                resolve(results)
              }
            },
            error: (err, _file) => {
              error.value = err
              scope.stop()
              reject(err)
            },
            chunkSize: data.length / chunkSize
            // worker:    true
          })
        } catch (error) {

        }
      })
    })
  }

  function loadSample(data, sampleSize = 1000) {
    return new Promise((resolve, reject) => {
      Papa.parse(data, {
        header:   true,
        preview:  sampleSize,
        complete: (...args) => {
          loaded.value = true
          resolve(...args)
        },
        error: (err, _file) => {
          error.value = err
          reject(err)
        }
      })
    })
  }

  const pause = computed(() => {
    paused.value = true
    const fn = () => null
    return parser.value?.pause || fn
  })
  const resume = computed(() => {
    paused.value = false
    const fn = () => null
    return parser.value?.resume || fn
  })

  tryOnScopeDispose(() => {
    const { _abort } = unref(parser) || {}
    if (_abort instanceof Function) {
      _abort()
    }
  })

  return {
    load,
    loadSample,
    loaded,
    size,
    error,
    byteLength,
    loadedBytes,
    percent,
    meta,
    parser,
    abort,
    pause,
    resume,
    paused,
    aborted
  }
}
