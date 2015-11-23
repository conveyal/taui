import {handleActions} from 'redux-actions'

const initialStaticStopTrees = {
  stopTrees: null
}

const staticStopTreesReducers = handleActions({
  UPDATE_STATIC_STOP_TREES: (state, action) => {
    return action.payload
  }
}, initialStaticStopTrees)

export default staticStopTreesReducers
