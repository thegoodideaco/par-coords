/* eslint-disable import/no-extraneous-dependencies */
import useIntlPhoneNumber from '@/composition/useIntlPhoneNumber'
import { action } from '@storybook/addon-actions'
import { linkTo } from '@storybook/addon-links'
import { AsYouType } from 'libphonenumber-js'
import { omit } from 'lodash'
import { defineComponent, ref } from 'vue-demi'

import MyButton from '../components/MyButton.vue'

export default {
  title: 'Button',
}

export const withText = () => ({
  components: { MyButton },
  template: '<my-button @click="action">Hello Button</my-button>',
  methods: { action: action('clicked') }
})

export const withJSX = () => ({
  render() {
    return <MyButton onClick={linkTo('Button', 'With Some Emoji')}>With JSX</MyButton>;
  }
})

export const withSomeEmoji = () => ({
  components: { MyButton },
  template: '<my-button>😀 😎 👍 💯</my-button>'
})


export const withSomePhoneNumber = () => ({
  template: `
  <div>
  <input type="tel" v-model="$value">

  <pre>{{info}}</pre>
  </div>
  `,
  data: () => ({
    value: null
  }),
  computed: {
    info() {
      if(!this.value) return
      const parsed = new AsYouType('US')
      const val = parsed.input(this.value)
      return {
        val,
        test: omit(parsed.getNumber(), ['metadata']),
        test2: parsed.isValid()
      }
    },
    $value: {
      get() {
        return this.value
      },
      set(value) {
        const parsed = new AsYouType('US')
        this.value = parsed.input(value)
      }
    }
  }
})
export const withSomePhoneNumberComposed = () => defineComponent({
  template: `
  <div>
  <input type="tel" v-model="t.value">

  <pre>{{$data}}</pre>
  </div>
  `,
  setup(props) {


    const t = useIntlPhoneNumber()

    return {
      t
    }
  },
  data() {
    return {
      input: this.t.value
    }
  }
})
