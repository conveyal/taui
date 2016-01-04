import {handleActions} from 'redux-actions'

export default handleActions({
  'update map' (state, action) {
    return Object.assign({}, state, action.payload)
  },
  'update map marker' (state, {payload}) {
    return Object.assign({}, state, {
      center: payload.position
    })
  }
}, {
  map: null,
  zoom: 13
})
