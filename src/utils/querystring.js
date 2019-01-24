function set (opts) {
  if (typeof window === 'undefined') return
  const queryString = encodeURIComponent(JSON.stringify(opts))
  window.history.pushState(null, document.title, `?search=${queryString}`)
}

function getAsObject () {
  if (typeof window === 'undefined') return {}
  try {
    const v = JSON.parse(
      decodeURIComponent(window.location.search.split('?search=')[1])
    )
    return v
  } catch (e) {
    console.error(e)
    return {}
  }
}

export function setKeyTo (key, value) {
  set({
    ...getAsObject(),
    [`${key}`]: value
  })
}
