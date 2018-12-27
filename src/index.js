// @flow
import get from 'lodash/get'
import React from 'react'
import {connect} from 'react-redux'

import actions from './actions'
import Application from './components/application'
import message from './message'
import * as select from './selectors'

// Set the title
if (typeof document !== 'undefined') document.title = message('Title')

function mapStateToProps (state, ownProps) {
  return {
    ...state,
    accessibility: select.accessibility(state, ownProps),
    activeNetworkIndex: select.activeNetworkIndex(state, ownProps),
    // activeTransitive: select.activeTransitive(state, ownProps),
    allTransitiveData: select.allTransitiveData(state, ownProps),
    drawOpportunityDatasets: select.drawOpportunityDatasets(state, ownProps),
    drawRoutes: select.drawRoutes(state, ownProps),
    // drawIsochrones: select.drawIsochrones(state, ownProps),
    isochrones: select.isochrones(state, ownProps),
    isLoading: select.loading(state, ownProps),
    pointsOfInterest: get(state, 'data.pointsOfInterest'),
    pointsOfInterestOptions: select.pointsOfInterestOptions(state, ownProps),
    showComparison: select.showComparison(state, ownProps),
    travelTimes: select.travelTimes(state, ownProps),
    uniqueRoutes: select.uniqueRoutes(state, ownProps)
  }
}

const ConnectedApplication = connect(mapStateToProps, actions)(Application)

// Create an Application wrapper
export default class InitializationWrapper extends React.Component {
  constructor (props) {
    super(props)

    if (typeof window !== 'undefined') {
      window.app = {
        action: {},
        select: {},
        store: props.store
      }

      Object.keys(actions).forEach(key => {
        window.app.action[key] = (...args) =>
          props.store.dispatch(actions[key](...args))
      })

      Object.keys(select).forEach(key => {
        window.app.select[key] = () => select[key](props.store.getState())
      })
    }
  }

  render () {
    return <ConnectedApplication store={this.props.store} />
  }
}
