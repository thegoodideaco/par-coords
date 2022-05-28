import { scaleLinear } from 'd3'
import { computed, ref, unref } from 'vue-demi'

export function useScale(baseScale = scaleLinear()) {
  const domainMin = ref(0)
  const domainMax = ref(1)

  const rangeMin = ref(0)
  const rangeMax = ref(1)

  const domain = computed({
    get() {
      return [
        domainMin.value,
        domainMax.value
      ]
    },
    set(value) {
      domainMin.value = value[0]
      domainMax.value = value[1]
    }
  })

  const range = computed({
    get() {
      return [
        rangeMin.value,
        rangeMax.value
      ]
    },
    set(value) {
      rangeMin.value = value[0]
      rangeMax.value = value[1]
    }
  })

  const scale = computed(() => {
    return unref(baseScale).copy()
      .domain(domain.value)
      .range(range.value)
  })

  return {
    scale,
    domain,
    range,
    domainMin,
    domainMax,
    rangeMin,
    rangeMax
  }
}
