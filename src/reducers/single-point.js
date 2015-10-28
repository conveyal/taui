import {handleActions} from 'redux-actions'

const initialSinglePointState = {
  data: {},
  isfetching: false,
  key: '7b57c4eb4f21485c9cda0de9ea4031c0',
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
