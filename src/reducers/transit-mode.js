import {handleActions} from 'redux-actions'
import toCamelCase from 'lodash.camelcase'

export default handleActions({
  'update selected transit mode' (state, action) {
    return Object.assign({}, state, { selected: action.payload })
  }
}, {
  selected: { name: 'Transit', id: 'transit' },
  modes: ['Car', 'Transit', 'Walk', 'Bike', 'Bike to Transit'].map((m) => { return { name: m, id: toCamelCase(m) } })
})
