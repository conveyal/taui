// @flow

const KEY = 'taui-config'

export const retrieveConfig = () => JSON.parse(window.localStorage.getItem(KEY))
export const storeConfig = json =>
  window.localStorage.setItem(KEY, JSON.stringify(json, null, '  '))
