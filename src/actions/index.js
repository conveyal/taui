import * as geocode from './geocode'
import * as location from './location'
import * as log from './log'
import * as network from './network'

const setGeocoder = (payload) => ({
  type: 'set geocoder',
  payload
})

const setGrid = (payload) => ({
  type: 'set grid',
  payload
})

const setPointsOfInterest = (payload) => ({
  type: 'set points of interest',
  payload
})

const setTimeCutoff = (payload) => ({
  type: 'set time cutoff',
  payload
})

const updateMap = (payload) => ({
  type: 'update map',
  payload
})

export default {
  ...geocode,
  ...location,
  ...log,
  ...network,
  setGeocoder,
  setGrid,
  setPointsOfInterest,
  setTimeCutoff,
  updateMap
}
