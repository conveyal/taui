// For usage with MapboxGL
export default (svg) => {
  const blob = new Blob([svg], {
    type: 'image/svg+xml;charset=utf-8'
  })
  const url = URL.createObjectURL(blob)
  const el = document.createElement('img')

  const promise = new Promise((resolve, reject) => {
    el.onload = () => {
      console.log('DONE', el)
      URL.revokeObjectURL(url)
      resolve(el)
    }
    el.onerror = (err) => {
      console.log('ERROR', el, err)
      reject(el)
    }
  })

  el.src = url

  return promise
}
