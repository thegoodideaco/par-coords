export function asyncDelay(ms = 1000) {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve()
    }, ms)
  })
}

/**
 *
 * @param {() => Promise<T>} getFn function to return a promise of inf
 * @param {(data: typeof T) => boolean} conditionFn conditional check based on result data
 * @param {number} waitMS Number in milliseconds to wait until calling again if condition is false
 * @returns
 */
export async function asyncUntil(getFn, conditionFn, waitMS = 1000) {
  const result = await Promise.resolve(getFn())

  if (!conditionFn(result)) {
    await asyncDelay(waitMS)
    return await asyncUntil(getFn, conditionFn, waitMS)
  } else {
    return result
  }
}
