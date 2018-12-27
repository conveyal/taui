// @flow
const KEY = 'taui-config'

const ls = typeof window === 'undefined'
  ? {getItem () { return '{}' }, setItem () {}}
  : window.localStorage

export const retrieveConfig = () => JSON.parse(ls.getItem(KEY))
export const storeConfig = json => ls.setItem(KEY, JSON.stringify(json))
