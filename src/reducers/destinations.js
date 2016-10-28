import {handleActions} from 'redux-actions'

export default handleActions({
  'set accessibility' (state, action) {
    return Object.assign({}, state, {accessibility: action.payload})
  },
  'set accessibility for' (state, {payload}) {
    const {accessibility, name} = payload
    return {
      ...state,
      accessibility: {
        ...state.accessibility,
        [`${name}`]: accessibility
      }
    }
  },
  'clear start' (state, action) {
    return {
      ...state,
      accessibility: {
        base: null,
        comparison: null
      }
    }
  },
  'update selected destination' (state, action) {
    return {...state, selected: action.payload}
  }
}, {
  accessibility: {
    base: null,
    comparison: null
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
