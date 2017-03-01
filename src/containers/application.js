import {connect} from 'react-redux'

import {
  clearEnd,
  clearIsochrone,
  clearStart,
  setActiveBrowsochronesInstance,
  updateDestination,
  updateOrigin,
  updateSelectedTimeCutoff
} from '../actions'
import initializeBrowsochrones from '../actions/browsochrones'
import Application from '../components/application'

function mapStateToProps (state, ownProps) {
  return state
}

function mapDispatchToProps (dispatch, ownProps) {
  return {
    clearEnd: () => dispatch(clearEnd()),
    clearIsochrone: () => dispatch(clearIsochrone()),
    clearStart: () => dispatch(clearStart()),
    initializeBrowsochrones: (options) => dispatch(initializeBrowsochrones(options)),
    moveOrigin: (options) => dispatch(updateOrigin(options)),
    moveDestination: (options) => dispatch(updateDestination(options)),
    onTimeCutoffChange: (options) => dispatch(updateSelectedTimeCutoff(options)),
    setActiveBrowsochronesInstance: (index) => dispatch(setActiveBrowsochronesInstance(index))
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(Application)
