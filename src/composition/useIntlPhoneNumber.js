import { AsYouType } from 'libphonenumber-js'
import { computed, reactive, ref, watchEffect } from 'vue'

/**
 * Provides an autoformatted ref with a validator ref
 * @param {import('@vueuse/core').MaybeRef<string>} input
 */
export default function (input) {
  const formattedInput = ref(input)
  const parsed = new AsYouType('US')

  const valid = ref(false)

  watchEffect(() => {
    valid.value = parsed.isValid(formattedInput.value)
  })

  const output = computed({
    get() {
      return formattedInput.value
    },
    set(value) {
      parsed.reset()
      formattedInput.value = parsed.input(value)
    }
  })

  return reactive({
    value: output,
    valid
  })
}
