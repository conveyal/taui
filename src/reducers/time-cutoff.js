// @flow
import message from '@conveyal/woonerf/message'
import {handleActions} from 'redux-actions'

const timeStep = 10
const timeMin = 10
const timeMax = 120
const times = []

for (let i = timeMin; i < timeMax; i += timeStep) {
  times.push({name: `${i} ${message('Strings.Minutes')}`, value: i})
}

export default handleActions(
  {
    'set selected time cutoff' (state, action) {
      return {
        ...state,
        selected: action.payload
      }
    }
  },
  {
    selected: 60,
    times
  }
)
