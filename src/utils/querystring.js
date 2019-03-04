function set(opts) {
  if (typeof window === 'undefined') return
  const queryString = encodeURIComponent(JSON.stringify(opts))
  window.history.pushState(null, document.title, `?search=${queryString}`)
}

function getAsObject() {
  if (typeof window === 'undefined') return {}
  const search = window.location.search.split('?search=')[1]
  if (!search) return {}
  try {
    return JSON.parse(decodeURIComponent(search))
  } catch (e) {
    console.error(e)
    return {}
  }
}

export function setKeyTo(key, value) {
  set({
    ...getAsObject(),
    [`${key}`]: value
  })
}
