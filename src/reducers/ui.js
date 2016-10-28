import {handleActions} from 'redux-actions'
import {DECREMENT_FETCH, INCREMENT_FETCH} from 'mastarm/react/fetch'

export default handleActions({
  [`${INCREMENT_FETCH}`]: (state, payload) => {
    return {
      ...state,
      fetches: state.fetches + 1
    }
  },
  [`${DECREMENT_FETCH}`]: (state, payload) => {
    return {
      ...state,
      fetches: state.fetches - 1
    }
  }
}, {
  fetches: 0
})
