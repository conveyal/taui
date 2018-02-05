// @flow
import {connect} from 'react-redux'

import * as actions from '../actions'
import {initialize} from '../actions/data'
import * as locationActions from '../actions/location'
import Application from '../components/application'
import * as select from '../selectors'
import selectPointsOfInterest from '../selectors/points-of-interest'
import selectShowComparison from '../selectors/show-comparison'

function mapStateToProps (state, ownProps) {
  return {
    ...state,
    accessibility: select.accessibility(state, ownProps),
    isochrones: select.isochrones(state, ownProps),
    journeys: [], // selectJourneysFromTransitive(state, ownProps),
    pointsOfInterest: selectPointsOfInterest(state, ownProps),
    showComparison: selectShowComparison(state, ownProps)
  }
}

export default connect(mapStateToProps, {
  ...actions,
  ...locationActions,
  initialize
})(
  Application
)
