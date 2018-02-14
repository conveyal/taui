// @flow
import {connect} from 'react-redux'

import * as actions from '../actions'
import * as locationActions from '../actions/location'
import Application from '../components/application'
import * as select from '../selectors'

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

export default connect(mapStateToProps, {
  ...actions,
  ...locationActions
})(
  Application
)
