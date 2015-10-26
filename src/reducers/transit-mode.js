import {handleActions} from 'redux-actions'

const initialTransitMode = {
  selected: 'Transit',
  modes: ['Car', 'Transit', 'Walk', 'Bike', 'Bike to Transit']
}

const transitModeReducers = handleActions({
  UPDATE_SELECTED_TRANSIT_MODE: (state, action) => {
    return Object.assign({}, state, { selected: action.payload })
  }
}, initialTransitMode)

export default transitModeReducers
