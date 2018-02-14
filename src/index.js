// @flow
import lonlat from '@conveyal/lonlat'
import message from '@conveyal/woonerf/message'
import mount from '@conveyal/woonerf/mount'
import React from 'react'

import {updateMap} from './actions'
import {initialize} from './actions/network'
import {updateStart, updateEnd} from './actions/location'
import Application from './containers/application'
import reducers from './reducers'
import * as select from './selectors'
import {getAsObject} from './utils/hash'

// Set the title
document.title = message('Title')

// Create an Application wrapper
function InitializationWrapper ({history, store}) {
  if (window) {
    window.store = store
    window.select = {}
    Object.keys(select).forEach(key => {
      window.select[key] = () => select[key](store.getState())
    })
  }

  store.dispatch(initialize(() => {
    const qs = getAsObject()

    if (qs.start && qs.startCoordinate) {
      store.dispatch(updateStart({
        label: qs.start,
        position: lonlat.fromString(qs.startCoordinate)
      }))
    }

    if (qs.end && qs.endCoordinate) {
      store.dispatch(updateEnd({
        label: qs.end,
        position: lonlat.fromString(qs.endCoordinate)
      }))
    }

    if (qs.zoom) {
      store.dispatch(updateMap({zoom: parseInt(qs.zoom, 10)}))
    }
  }))

  return <Application history={history} store={store} />
}

// Mount the app
mount({
  app: InitializationWrapper,
  reducers
})
