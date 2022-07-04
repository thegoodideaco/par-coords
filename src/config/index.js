import Vue, * as composition from 'vue'
// import * as demi from 'vue'
// import VueCompositionApi, * as composition from '@vue/composition-api'
import './styles'
import './global-components'

import axios from 'axios'
import { csvParse, format } from 'd3'

Vue.prototype.toJSON = function () {
  return this
}

// Vue.use(VueCompositionApi)
// Vue.use(demi)

Vue.filter('asNumber', (val, _format = ',.0f') => format(_format)(val || 0))

/**
 * Array of file paths within the `datasets` dir that are a _.csv_
 * @example
 *
 * @include[./styles.js]
 *

 *
 * > [!NOTE]
> Information the user should notice even if skimming.
 *
 * ```javascript
 * CSV_PATHS = [
    "/datasets/Stores.csv",
    "/datasets/USA_cars_datasets.csv",
    "/datasets/diamonds.csv",
    ...
]
 * ```
* @error error when used on codesandbox
 */
export const CSV_PATHS = Array.from(
  require
    .context('!!raw-loader!/public/datasets', true, /\.csv$/, 'weak')
    .keys(),
  (path) => path.replace('./', '/datasets/')
)

if (process.env.NODE_ENV === 'development') {
  const loadCsv = async function (pathOrIndex) {
    const isIndex = typeof pathOrIndex === 'number'

    const url = isIndex ? CSV_PATHS[pathOrIndex] : pathOrIndex

    const { data } = await axios.get(url, {
      transformResponse: (_d) => csvParse(_d)
    })

    return data
  }

  Object.assign(window, {
    dev: {
      d3:                 require('d3'),
      d3ar:               require('d3-array'),
      composition,
      // demi,
      CSV_PATHS,
      loadCsv,
      vueUse:             require('@vueuse/core'),
      Vue,
      cf:                 require('crossfilter2').default,
      chroma:             require('chroma-js'),
      Papa:               require('papaparse'),
      usePapaParseLoader: require('@/composition/useCsv').usePapaParseLoader,
      useCrossfilter:     require('@/composition/useCrossfilter'),
      useD3:              require('@/composition/useD3'),
      /**
       *  @type {import('ml-kmeans')}
       **/
      kmeans:             require('ml-kmeans').default,
      saveFile:           require('@/utils/saveFile').downloadToFile,
      d3_collection:      require('d3-collection'),
      _:                  require('lodash'),
      zip:                require('jszip'),
      axios:              require('axios').default
    }
  })

  require('axios').default.get('', {
    responseType: 'arraybuffer'
  })

  const { group, groups, rollup, rollups, flatGroup, flatRollup, nest } =
    require('./grouping-methods').default

  Object.assign(window, {
    d3: {
      flatGroup,
      flatRollup,
      group,
      groups,
      nest,
      rollup,
      rollups
    }
  })
}
