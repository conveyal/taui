import {connect} from 'react-redux'

import {
  clearEnd,
  clearIsochrone,
  clearStart,
  setBaseActive,
  setComparisonActive,
  updateDestination,
  updateOrigin,
  updateSelectedTimeCutoff
} from '../actions'
import Application from '../components/application'

function mapStateToProps (state, ownProps) {
  return state
}

function mapDispatchToProps (dispatch, ownProps) {
  return {
    clearEnd: () => dispatch(clearEnd()),
    clearIsochrone: () => dispatch(clearIsochrone()),
    clearStart: () => dispatch(clearStart()),
    initializeBrowsochrones: (actions) => dispatch(actions),
    moveOrigin: (options) => dispatch(updateOrigin(options)),
    moveDestination: (options) => dispatch(updateDestination(options)),
    onTimeCutoffChange: (options) => dispatch(updateSelectedTimeCutoff(options)),
    setBaseActive: () => dispatch(setBaseActive()),
    setComparisonActive: () => dispatch(setComparisonActive())
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(Application)
