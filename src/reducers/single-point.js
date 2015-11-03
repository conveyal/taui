import {handleActions} from 'redux-actions'

const initialSinglePointState = {
  data: {},
  isfetching: false,
  key: '7e408e63f7ca4fc2bfde9983527200c7',
  properties: {}
}

const singlePointReducers = handleActions({
  REQUEST_SINGLE_POINT: (state, action) => {
    return {
      data: {},
      isFetching: true,
      key: '',
      properties: {}
    }
  },
  RECEIVE_SINGLE_POINT: (state, action) => {
    return Object.assign({
      isFetching: false
    }, action.payload)
  }
}, initialSinglePointState)

export default singlePointReducers
