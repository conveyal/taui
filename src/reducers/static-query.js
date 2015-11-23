import {handleActions} from 'redux-actions'

const initialStaticQuery = {
  query: null
}

const staticQueryReducers = handleActions({
  UPDATE_STATIC_QUERY: (state, action) => {
    return action.payload
  }
}, initialStaticQuery)

export default staticQueryReducers
