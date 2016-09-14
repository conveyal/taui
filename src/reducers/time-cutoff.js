import {handleActions} from 'redux-actions'
import messages from '../utils/messages'

const timeStep = 10
const timeMin = 10
const timeMax = 120
const times = []

for (let i = timeMin; i < timeMax; i += timeStep) times.push({ name: `${i} ${messages.Strings.Minutes}`, value: i })

export default handleActions({
  'set selected time cutoff' (state, action) {
    return Object.assign({}, state, { selected: action.payload })
  }
}, {
  selected: 60,
  times
})
