import {handleActions} from 'redux-actions'

export default handleActions({
  'calculate accessibility' (state, action) {
    const {browsochrones} = action.payload
    const accessibility = {}
    Object.keys(browsochrones.grids).forEach(g => {
      accessibility[g] = browsochrones.getAccessibilityForGrid(browsochrones.grids[g])
    })
    console.log(accessibility)
    return Object.assign({}, state, {accessibility})
  },
  'update selected destination' (state, action) {
    return Object.assign({}, state, {selected: action.payload})
  }
}, {
  accessibility: {},
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
