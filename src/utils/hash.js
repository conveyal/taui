import {parse as parseQueryString} from 'querystring'

function set (opts) {
  window.location.hash = Object.keys(opts)
    .filter(key => opts[key] !== undefined && opts[key] !== null)
    .map(key => `${key}=${encodeURIComponent(opts[key])}`)
    .join('&')
}

export function getAsObject () {
  return parseQueryString(window.location.hash.split('#')[1])
}

export function setKeyTo (key, value) {
  set({
    ...getAsObject(),
    [`${key}`]: value
  })
}
