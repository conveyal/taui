// @flow
import once from 'lodash/once'

const warn = once(() =>
  console.error('WARNING: Data is being cached locally using mastarm/flyle. This may cause unexpected behavior and will NOT work on a deployed version of TAUI.'))

export default function cacheifyUrl (url: string) {
  if (process.env.CACHE_DATA === true) {
    warn()
    return `http://localhost:9966/tile?url=${url}`
  }
  return url
}
