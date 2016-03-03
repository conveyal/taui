import {handleActions} from 'redux-actions'

export default handleActions({
  'set accessibility' (state, action) {
    return Object.assign({}, state, {accessibility: action.payload})
  },
  'update selected destination' (state, action) {
    return Object.assign({}, state, {selected: action.payload})
  }
}, {
  accessibility: {
    base: {},
    comparison: {}
  },
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
