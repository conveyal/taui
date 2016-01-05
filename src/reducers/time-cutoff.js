import {handleActions} from 'redux-actions'

const timeStep = 5
const timeMin = 5
const timeMax = 120
const times = []

for (let i = timeMin; i < timeMax; i += timeStep) times.push({ name: `${i} min`, value: i })

export default handleActions({
  'update selected time cutoff' (state, action) {
    return Object.assign({}, state, { selected: action.payload })
  }
}, {
  selected: 60,
  times
})
