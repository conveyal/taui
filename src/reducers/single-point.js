import {handleActions} from 'redux-actions'

export default handleActions({
  'request single point' (state, action) {
    return {
      data: {},
      isFetching: true,
      key: '',
      properties: {}
    }
  },
  'receive single point' (state, action) {
    return Object.assign({
      isFetching: false
    }, action.payload)
  }
}, {
  data: {},
  isfetching: false,
  key: '7e408e63f7ca4fc2bfde9983527200c7',
  properties: {}
})
