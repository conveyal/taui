// @flow
import message from '@conveyal/woonerf/message'
import mount from '@conveyal/woonerf/mount'
import React from 'react'

import Application from './containers/application'
import reducers from './reducers'

// Set the title
document.title = message('Title')

// Create an Application wrapper
function Wrapper ({history, store}) {
  if (window) window.store = store

  return <Application history={history} store={store} />
}

// Mount the app
mount({
  app: Wrapper,
  reducers
})
