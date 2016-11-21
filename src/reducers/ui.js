import {DECREMENT_FETCH, INCREMENT_FETCH} from '@conveyal/woonerf/build/lib/fetch'
import {handleActions} from 'redux-actions'

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
  fetches: 0,
  showLog: true
})
