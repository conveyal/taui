import {DECREMENT_FETCH, INCREMENT_FETCH} from '@conveyal/woonerf/fetch'
import {handleActions} from 'redux-actions'

export default handleActions({
  [`${INCREMENT_FETCH}`]: (state, {payload}) => {
    return {
      ...state,
      fetchCount: state.fetchCount + 1,
      fetches: [...state.fetches, payload]
    }
  },
  [`${DECREMENT_FETCH}`]: (state, {payload}) => {
    return {
      ...state,
      fetchCount: state.fetchCount - 1,
      fetches: state.fetches.filter((f) => f !== payload)
    }
  }
}, {
  fetchCount: 0,
  fetches: [],
  showLog: true
})
