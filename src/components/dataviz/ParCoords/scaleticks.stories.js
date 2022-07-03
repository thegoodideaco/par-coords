import { useScale } from '@/composition/useD3'
import { scaleLinear } from 'd3'
import { computed, defineComponent,  reactive } from 'vue'
import ScaleTicks from './ScaleTicks.vue'


/** @type {import('@storybook/vue').Meta} */
const meta = {
  title: 'Components/Scale Ticks',
  component: ScaleTicks,
  parameters: {
    layout: 'centered'
  },
  args: reactive({
    minDomain: 0,
    maxDomain: 2,
    minRange: 4,
    maxRange: 9
  })
}


/** @type {import('@storybook/vue').Story} */
export const DefaultView = (args, {argTypes}) => defineComponent({
components: {
  ScaleTicks
},
props: Object.keys(args),
setup(props, ctx) {


  const newScale = computed(() => scaleLinear()
  .domain([
    ctx.attrs.minDomain,
    ctx.attrs.maxDomain
  ])
  .range([
    ctx.attrs.minRange,
    ctx.attrs.maxRange
  ]))


  const scaleHelper = (useScale(newScale))

  window.scaleHelper = reactive(scaleHelper)

  const {
    scale,
    domainMin
  } = scaleHelper

  return {
    scaleHelper,
    domainMin,
    args,
    attrs: ctx.attrs
  }
},
template: `
<div>

<div>{{scaleHelper}}</div>
<pre class="mb-64">{{$props}}</pre>


<ScaleTicks v-bind="{...$props, ...$data}" class="text-white" />
</div>
`
})

export default meta
