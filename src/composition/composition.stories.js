import { computed, defineComponent, effectScope, nextTick, proxyRefs, shallowRef, unref, watchEffect } from 'vue-demi'
import { usePapaParseLoader } from './useCsv'
import DataLoader from '@/components/inputs/DataLoader.vue'
import { tryOnScopeDispose } from '@vueuse/core'
export default {
  title: 'composables',
  parameters: {
    layout: 'centered'
  }
}


function asyncDelay(ms = 1000) {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve()
    }, ms)
  })
}


export const MainView = () => defineComponent(({
  components: {
DataLoader
  },
  template: `
  <div>


  <pre class="text-xs">{{loaderInfo}}</pre>

  <data-loader
              disable-format
              @input="loadData($event.data)">
              <button
                tabindex="-1"
                class="btn btn-primary m-auto">
                <span class="fa fa-fw fa-upload" /> Create your own
              </button>
            </data-loader>

            <button @click="loader.pause">
            Pause
            </button>

            <button @click="loader.resume">
            Resume
            </button>

  </div>
  `,
  setup() {
    const loader = usePapaParseLoader()
    const fileData = shallowRef()

    const loaderInfo = computed(() => {
      const {
        byteLength,
        loaded,
        loadedBytes,
        paused,
        percent,
        size
      } = loader

      return proxyRefs({
        bytes: {
          loaded: loadedBytes,
          total: byteLength
        },
        status: {
          loaded,
          paused
        },
          // byteLength,
          // loaded,
          // loadedBytes,
          // paused,
          percent,
          size
      })
    })



    tryOnScopeDispose(() => {
      const {abort: _abort}= unref(loader.parser) || {}

      if(_abort instanceof Function) {
        _abort('effect scope')

      }

    })

    return {
      loader: proxyRefs(loader),
      loaderInfo,
      fileData
    }
  },
  methods: {
    async loadData(csvStr) {



      try {
        const values = await this.loader.load(csvStr, async () => {
            if(!this.loader.parser.paused()) {
              this.loader.pause()
              await asyncDelay(10)
            requestAnimationFrame(() => {
              this.loader.resume()
                return Promise.resolve()
            })
            }
        }, 1000)
        return values
      } catch (error) {
        return Promise.reject(error)
      }
    }
  }
}))
