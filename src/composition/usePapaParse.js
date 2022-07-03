
import { Adder } from 'd3'
import Papa from 'papaparse'
import { computed, reactive, readonly, ref, shallowRef } from 'vue'

/**
 *
 * @param {Omit<Papa.ParseAsyncConfig, "worker" | "step">} options
 */
export function usePapaParse(options = {}) {
  /** @type {import('vue').Ref<Papa.Parser | null>} */
  const _parser = shallowRef()

  /** @type {import('vue').Ref<ReturnType<createFieldSummaryObjects>} */
  const fields = ref()

  // info
  const status = reactive({
    paused:  false,
    aborted: false,
    loaded:  false,
    active:  false,
    error:   null
  })

  const summary = reactive({
    fields,
    bytesLoaded: 0,
    bytesTotal:  0,
    rowsLoaded:  0,
    rowsTotal:   0
  })

  const controls = computed(() => {
    const noop = () => null
    const {
      abort = noop,
      pause = noop,
      resume = noop
    } = _parser.value || {}

    return {
      abort() {
        status.aborted = true
        status.active = false
        abort()
      },
      pause() {
        status.paused = true
        status.active = false
        pause()
      },
      resume() {
        status.paused = false
        status.active = true
        resume()
      }
    }
  })

  function reset(isReload = true) {
    resetStatus()

    if (isReload) {
      status.active = true
    }

    Object.assign(summary, {
      bytesLoaded: 0,
      bytesTotal:  0,
      rowsLoaded:  0,
      rowsTotal:   0,
      fields:      null
    })
  }

  function resetStatus() {
    status.loaded = false
    status.aborted = false
    status.paused = false
    status.active = false
    status.error = null
  }

  /**
   * @type {typeof Papa.load}
   * @param {string | File} file
   * @param {Partial<Papa.ParseAsyncConfig>} config
   */
  function load(file, config = options) {
    return new Promise((resolve, reject) => {
      if (_parser.value?.abort) _parser.value.abort()
      reset()

      summary.bytesTotal = typeof file === 'string' ? file.length : file.size

      Papa.parse(file, {
        ...config,
        worker: false,
        chunk(results, parser) {
          parser.pause()
          if (_parser.value !== parser) {
            _parser.value = parser
          }
          if (fields.value == null) {
            fields.value = createFieldSummaryObjects(results)
          }

          if (results.errors.length) {
            status.aborted = true
            status.active = false
            status.loaded = false
            status.paused = false
            status.error = results.errors[0]
            reject(results.errors[0].message)
            return
          }

          if (results.meta.aborted) {
            status.aborted = results.meta.aborted
            return
          }

          summarizeChunk(results)

          Promise.resolve(config.chunk(results, parser)).then(
            () => {
              requestAnimationFrame(() => {
                if (!status.paused) {
                  parser.resume()
                }

                if (status.error) {
                  debugger
                  parser.abort()
                }
              })
            }
          )
        },
        complete(results, file) {
          if (results.errors.length) {
            reject(new Error(results.errors[0].message))
            if (config.error) {
              config.error(results.errors, file)
            }
            return
          }
          console.log('complete', results)

          if (results.meta.aborted || !status.active) return

          if (results.data?.length) {
            debugger
            summarizeChunk(results)
          }

          if (fields.value == null) {
            fields.value = createFieldSummaryObjects(results)
          }

          status.loaded = !results.meta.aborted
          status.aborted = !!results.meta.aborted
          status.active = false
          if (status.aborted) {
            reject('aborted')
          } else {
            // Make sure they are the same on complete
            summary.bytesLoaded = summary.bytesTotal

            if (config.complete) {
              config.complete(results, file)
            }

            resolve(results)
          }
        },
        error(errors, file) {
          debugger
          console.log('wtf')
          summary.errors = errors
          if (config.error) {
            config.error(errors, file)
          }
          reject(errors)
        }
      })
    })

    /**
     * Summarizes a chunk of records
     * todo: Add variance, std deviation
     */
    function summarizeChunk(results) {
      if (results.data?.length) {
        summary.bytesLoaded = results.meta.cursor
        summary.rowsLoaded += results.data.length
        summary.rowsTotal = summary.rowsLoaded

        results.data.forEach((record, _i, _records) => {
          fields.value.forEach(fieldStats => {
            const uniqueSet = fieldStats.uniques()
            const value = record[fieldStats.field]
            if (!uniqueSet.has(value)) {
              // console.log(value)
              uniqueSet.add(value)
            }
            fieldStats.counts.unique = uniqueSet.size

            const isEmpty = value == null || String(value).trim().length === 0
            const isNumeric = !isEmpty && Number.isFinite(+value)
            const isDate = !isNumeric && Date.parse(String(value))

            if (isEmpty) {
              fieldStats.counts.empty++
            } else if (isNumeric) {
              fieldStats.counts.numeric++
            } else if (isDate) {
              fieldStats.counts.chronologic++
            } else {
              fieldStats.counts.categoric++
            }

            if (isNumeric) {
              fieldStats.min = Math.min(fieldStats.min, +value ?? 0)
              fieldStats.max = Math.max(fieldStats.max, +value ?? 0)
              fieldStats._add().add(+value)
              fieldStats.sum = fieldStats._add().valueOf()

              const _avg = fieldStats.sum / fieldStats.counts.numeric

              fieldStats.avg = isFinite(_avg) ? _avg : 0
            }
          })
        })
      }
    }
  }

  return reactive({
    load,
    controls,
    summary,
    status
  })

  /**
   *
   * @param {Papa.ParseResult} results
   * @returns
   */
  function createFieldSummaryObjects(results) {
    return results.meta.fields.map(field => {
      const _set = readonly(new Set())
      const _adder = readonly(new Adder())

      return reactive({
        field,
        min:    0,
        max:    0,
        sum:    0,
        avg:    0,
        counts: {
          empty:       0,
          unique:      0,
          numeric:     0,
          chronologic: 0,
          categoric:   0
        },
        uniques: () => _set,
        _add:    () => _adder
      })
    })
  }
}
