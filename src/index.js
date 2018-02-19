// @flow
import message from '@conveyal/woonerf/message'
import mount from '@conveyal/woonerf/mount'
import React from 'react'
import {connect} from 'react-redux'

import actions from './actions'
import Application from './components/application'
import reducers from './reducers'
import * as select from './selectors'

// Set the title
document.title = message('Title')

function mapStateToProps (state, ownProps) {
  return {
    ...state,
    accessibility: select.accessibility(state, ownProps),
    activeNetworkIndex: select.activeNetworkIndex(state, ownProps),
    activeTransitive: select.activeTransitive(state, ownProps),
    allTransitiveData: select.allTransitiveData(state, ownProps),
    isochrones: select.isochrones(state, ownProps),
    pointsOfInterest: select.pointsOfInterest(state, ownProps),
    showComparison: select.showComparison(state, ownProps),
    travelTimes: select.travelTimes(state, ownProps)
  }
}

const ConnectedApplication = connect(mapStateToProps, actions)(Application)

// Create an Application wrapper
function InitializationWrapper ({history, store}) {
  if (window) {
    window.app = {
      action: {},
      select: {},
      store
    }

    Object.keys(actions).forEach(key => {
      window.app.action[key] = (...args) =>
        store.dispatch(actions[key](...args))
    })

    Object.keys(select).forEach(key => {
      window.app.select[key] = () => select[key](store.getState())
    })
  }

  return <ConnectedApplication history={history} store={store} />
}

// Mount the app
mount({
  app: InitializationWrapper,
  reducers
})
