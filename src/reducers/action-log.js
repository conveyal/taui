import {handleActions} from 'redux-actions'

export default handleActions({
  'add action log item' (state, action) {
    return [action.payload, ...state]
  }
}, [{
  createdAt: new Date(),
  index: 0,
  text: 'Welcome to our transit analysis tool! Find how your site stacks up compared to others in the region. Search for your address or drag the pin on the map.'
}])
