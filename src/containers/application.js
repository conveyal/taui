// @flow
import {connect} from 'react-redux'

import * as actions from '../actions'
import initializeBrowsochrones from '../actions/browsochrones'
import Application from '../components/application'
import selectPointsOfInterest from '../selectors/points-of-interest'

function mapStateToProps (state, ownProps) {
  return {
    ...state,
    pointsOfInterest: selectPointsOfInterest(state, ownProps)
  }
}

export default connect(mapStateToProps, {...actions, initializeBrowsochrones})(
  Application
)
