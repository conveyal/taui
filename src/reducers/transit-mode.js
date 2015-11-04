import {handleActions} from 'redux-actions'
import toCamelCase from 'to-camel-case'

const initialTransitMode = {
  selected: { name: 'Transit', id: 'transit' },
  modes: ['Car', 'Transit', 'Walk', 'Bike', 'Bike to Transit'].map(m => { return { name: m, id: toCamelCase(m) } })
}

const transitModeReducers = handleActions({
  UPDATE_SELECTED_TRANSIT_MODE: (state, action) => {
    return Object.assign({}, state, { selected: action.payload })
  }
}, initialTransitMode)

export default transitModeReducers
