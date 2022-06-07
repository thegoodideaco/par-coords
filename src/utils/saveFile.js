import papaparse from 'papaparse'

/**
 *
 * @param {string} content
 * @param {string} filename
 * @param {string} contentType
 */
export const downloadToFile = (content, filename, contentType = 'text/plain') => {
  const a = document.createElement('a')
  const file = new Blob([content], { type: contentType })

  a.href = URL.createObjectURL(file)
  a.download = filename
  a.click()

  URL.revokeObjectURL(a.href)
}

export function downloadAsCsv(records, filename) {
  const str = papaparse.unparse(records, {
    header: true
  })

  downloadToFile(str, filename, 'text/csv')
}
