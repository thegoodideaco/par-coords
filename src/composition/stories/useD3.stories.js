import { Adder, sum } from 'd3'
import { defineComponent, reactive, ref, shallowReactive, shallowRef, toRefs } from 'vue'
import { asyncDelay } from '../useAsyncUntil'
import { useBatchProcessing } from '../useD3'

/** @type {import('@storybook/vue').Meta} */
const meta = {
  title: 'Composables'
}




/**
 *
 * @param {@type {import('@storybook/vue').Story}} args
 * @param {*} param1
 * @returns
 */
export const MainView = (args, {argTypes}) => defineComponent({
  setup(){

    const randomData = shallowRef()
    const chunkSize = ref(10)
    const delay = ref(50)

    let adder
    const _sum = ref()


    async function onBatch(chunk) {
      if(!adder) adder = new Adder()
      adder.add(sum(chunk))
      _sum.value = adder.valueOf()
      await asyncDelay(delay.value)
      console.log([chunk, adder.valueOf()])
    }

    function randomize(min=1, max=10000) {
      randomData.value = Array.from({length: ~~(min + (Math.random() * (max - min)))}, () => Math.random())
    }


    const {
      pause,
      resume,
      size,
      start,
      status
    } = useBatchProcessing(randomData, onBatch, {
      chunkSize,
      onBefore() {
        console.log('not done')
      },
      onComplete() {
        console.log('DONE!')
      }
    })

    return {
      pause,
      resume,
      size,
      start,
      status,
      randomize,
      chunkSize,
      delay,
      sum: _sum
    }
  },
template: `
<div>
hey {{status}} - {{sum}}

<div class="flex gap-10">
  <button class="btn btn-link" @click="randomize()">Randomize</button>
  <button @click="start()">Randomize</button>


  <button v-if="status.processing" @click="pause()">Pause</button>
  <button v-else @click="resume()">Resume</button>

  <div class="input">
    <label>
    Chunk size: {{chunkSize}}
    </label>
    <input type="range" min="5" max="100" v-model.number="chunkSize">
  </div>

  <div class="input">
    <label>
    delay: {{delay}}
    </label>
    <input type="range" min="5" max="100" v-model.number="delay">
  </div>



</div>
</div>
`
})


export default meta
