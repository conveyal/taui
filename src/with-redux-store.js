// @flow
import React from 'react'

import DefaultStore from '../store.json'

import actions from './actions'
import createStore from './create-store'
import reducers from './reducers'
import * as select from './selectors'

const isServer = typeof window === 'undefined'
const __APP__ = 'Taui'
const __NEXT_REDUX_STORE__ = '__NEXT_REDUX_STORE__'

function initializeStore (initialState, isServer) {
  return createStore(reducers, initialState, isServer)
}

function getOrCreateStore (initialState) {
  // Always make a new store if server, otherwise state is shared between requests
  if (isServer) {
    return initializeStore(initialState, isServer)
  }

  // Create store if unavailable on the client and set it on the window object
  if (!window[__NEXT_REDUX_STORE__]) {
    const store = initializeStore(initialState)

    // Attach actions & selectors to window object for debugging
    const app = {
      action: {},
      select: {},
      store
    }

    Object.keys(actions).forEach(key => {
      app.action[key] = (...args) =>
        store.dispatch(actions[key](...args))
    })

    Object.keys(select).forEach(key => {
      app.select[key] = () => select[key](store.getState())
    })

    window[__APP__] = app
    window[__NEXT_REDUX_STORE__] = store
  }

  return window[__NEXT_REDUX_STORE__]
}

export default App => {
  return class AppWithRedux extends React.Component {
    static async getInitialProps (appContext) {
      // Get or Create the store with `undefined` as initialState
      // This allows you to set a custom default initialState
      const reduxStore = getOrCreateStore(DefaultStore)

      // Provide the store to getInitialProps of pages
      appContext.ctx.reduxStore = reduxStore

      let appProps = {}
      if (typeof App.getInitialProps === 'function') {
        appProps = await App.getInitialProps(appContext)
      }

      return {
        ...appProps,
        initialReduxState: reduxStore.getState()
      }
    }

    constructor (props) {
      super(props)
      this.reduxStore = getOrCreateStore(props.initialReduxState)
    }

    render () {
      return <App {...this.props} reduxStore={this.reduxStore} />
    }
  }
}
