// @flow
import message from '@conveyal/woonerf/message'
import mount from '@conveyal/woonerf/mount'
import React from 'react'

import Application from './containers/application'
import reducers from './reducers'
import * as select from './selectors'

// Set the title
document.title = message('Title')

// Create an Application wrapper
function Wrapper ({history, store}) {
  if (window) {
    window.store = store
    window.select = {}
    Object.keys(select).forEach(key => {
      window.select[key] = () => select[key](store.getState())
    })
  }

  return <Application history={history} store={store} />
}

// Mount the app
mount({
  app: Wrapper,
  reducers
})
