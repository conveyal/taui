import {handleActions} from 'redux-actions'

const initialTransitScenarios = {
  scenarios: [],
  selected: {}
}

const transitScenarioReducers = handleActions({
  UPDATE_SELECTED_TRANSIT_SCENARIO: (state, action) => {
    return Object.assign({}, state, { selected: action.payload })
  }
}, initialTransitScenarios)

export default transitScenarioReducers
