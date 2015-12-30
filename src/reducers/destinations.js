import {handleActions} from 'redux-actions'

export default handleActions({
  'update selected destinations' (state, action) {
    return Object.assign({}, state, { selected: action.payload })
  }
}, {
  selected: { name: 'None', id: 'none' },
  sets: [
    {
      name: 'None',
      id: 'none'
    },
    {
      name: 'geoid10',
      id: 'geoid10'
    },
    {
      name: 'cbsa_pop',
      id: 'cbsa_pop'
    },
    {
      name: 'Jobs - High Wage',
      id: 'Jobs - High Wage'
    },
    {
      name: 'd1c8_ed10',
      id: 'd1c8_ed10'
    },
    {
      name: 'd4a',
      id: 'd4a'
    },
    {
      name: 'd2b_e8mixa',
      id: 'd2b_e8mixa'
    },
    {
      name: 'Workers - Medium Wage',
      id: 'Workers - Medium Wage'
    },
    {
      name: 'Workers - Low Wage',
      id: 'Workers - Low Wage'
    },
    {
      name: 'Jobs - Total',
      id: 'Jobs - Total'
    }
  ]
})
