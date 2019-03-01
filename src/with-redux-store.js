import actions from './actions'
import createStore from './create-store'
import * as select from './selectors'

const isServer = typeof window === 'undefined'
const __APP__ = 'Taui'
const __NRS__ = '__NEXT_REDUX_STORE__'

export function getOrCreateStore (initialState) {
  // Always make a new store if server, otherwise state is shared between requests
  if (isServer) return createStore(initialState)

  // Return the store if it has already been created in the client
  if (window[__NRS__]) return window[__NRS__]

  // Create the store for the client
  const store = createStore(initialState)
  // Attach actions & selectors to window object for debugging
  const app = {
    action: {},
    select: {},
    store
  }

  Object.keys(actions).forEach(key => {
    app.action[key] = (...args) => store.dispatch(actions[key](...args))
  })

  Object.keys(select).forEach(key => {
    app.select[key] = () => select[key](store.getState())
  })

  window[__APP__] = app
  window[__NRS__] = store
  console.log(`Taui store, selectors, and actions are at 'window.${__APP__}'`)

  return store
}
