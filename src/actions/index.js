// @flow
import * as config from './config'
import * as geocode from './geocode'
import * as grid from './grid'
import * as location from './location'
import * as log from './log'
import * as map from './map'
import * as network from './network'

const setSelectedTimeCutoff = (payload: number) => ({
  type: 'set selected time cutoff',
  payload
})

export default {
  ...config,
  ...geocode,
  ...grid,
  ...location,
  ...log,
  ...map,
  ...network,
  setSelectedTimeCutoff
}
