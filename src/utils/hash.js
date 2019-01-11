import {parse as parseQueryString} from 'querystring'

import get from 'lodash/get'

function set (opts) {
  if (typeof window === 'undefined') return
  window.location.hash = Object.keys(opts)
    .filter(key => opts[key] !== undefined && opts[key] !== null)
    .map(key => `${key}=${encodeURIComponent(opts[key])}`)
    .join('&')
}

export function getAsObject () {
  if (typeof window === 'undefined') return {}
  return parseQueryString(get(window, 'location.hash', '').split('#')[1])
}

export function setValues (values) {
  set({
    ...getAsObject(),
    ...values
  })
}

export function setKeyTo (key, value) {
  set({
    ...getAsObject(),
    [`${key}`]: value
  })
}
