if (typeof window === 'undefined') {
  module.exports = require('node-fetch')
} else {
  if (typeof window.fetch === 'undefined') require('whatwg-fetch') // polyfills
  module.exports = window.fetch
}
