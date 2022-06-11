import { defineComponent } from 'vue-demi'

/** @type {import('@storybook/vue').Meta} */
const meta = {
  title: 'Composables',
  args: {
    fields: [1,2,3,5]
  }
}

/** @type {import('@storybook/vue').Story} */
const MainView = (args, {argTypes}) => defineComponent({
  template: `<div>{{$props}}</div>`,
  props: Object.keys(argTypes)
})

/** @type {typeof MainView} */
export const CrossFilterView = MainView.bind({})
CrossFilterView.storyName = 'useCrossFilter'


export default meta
