<template>
  <div>
    <pre>{{ testData }}</pre>
  </div>
</template>

<script>
import {
  useLocalStorage,
  useMouse,
  usePreferredDark
} from '@vueuse/core'
import { defineComponent, reactive } from 'vue'

export default defineComponent({
  setup() {
    // tracks mouse position
    const { x, y } = useMouse()

    // is user prefers dark theme
    const isDark = usePreferredDark()

    // persist state in localStorage
    const store = useLocalStorage('my-storage', {
      name:  'Apple',
      color: 'red'
    })

    return {
      testData: reactive({
        x,
        y,
        isDark,
        store
      })
    }
  },
  computed: {
    d() {
      return this.$data
    }
  }
})
</script>

<style></style>
