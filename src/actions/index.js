import * as location from './location'
import * as log from './log'
import * as network from './network'

const setGeocoder = payload => ({
  type: 'set geocoder',
  payload
})

const setGrid = payload => ({
  type: 'set grid',
  payload
})

const setPercentileIndex = payload => ({
  type: 'set percentile index',
  payload
})

const setPointsOfInterest = payload => ({
  type: 'set points of interest',
  payload
})

const setTimeCutoff = payload => ({
  type: 'set time cutoff',
  payload
})

const updateMap = payload => ({
  type: 'update map',
  payload
})

export default {
  ...location,
  ...log,
  ...network,
  setGeocoder,
  setGrid,
  setPercentileIndex,
  setPointsOfInterest,
  setTimeCutoff,
  updateMap
}
