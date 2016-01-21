import {handleActions} from 'redux-actions'

export default handleActions({
  'update selected destination' (state, action) {
    return Object.assign({}, state, { selected: action.payload })
  }
}, {
  selected: 'none',
  sets: [{
    label: 'None',
    value: 'none'
  }, {
    label: 'Jobs',
    value: 'Jobs_total'
  }, {
    label: 'Workers',
    value: 'Workers_total'
  }]
})
