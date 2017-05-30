// @flow
import {connect} from 'react-redux'

import * as actions from '../actions'
import initializeBrowsochrones from '../actions/browsochrones'
import Application from '../components/application'
import selectAccessibilityKeys from '../selectors/accessibility-keys'
import selectPointsOfInterest from '../selectors/points-of-interest'
import selectShowComparison from '../selectors/show-comparison'

function mapStateToProps (state, ownProps) {
  return {
    ...state,
    accessibilityKeys: selectAccessibilityKeys(state, ownProps),
    pointsOfInterest: selectPointsOfInterest(state, ownProps),
    showComparison: selectShowComparison(state, ownProps)
  }
}

export default connect(mapStateToProps, {...actions, initializeBrowsochrones})(
  Application
)
