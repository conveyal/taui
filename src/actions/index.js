// @flow
import * as geocode from './geocode'
import * as location from './location'
import * as log from './log'
import * as map from './map'
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

const setSelectedTimeCutoff = (payload) => ({
  type: 'set selected time cutoff',
  payload
})

export default {
  ...geocode,
  ...location,
  ...log,
  ...map,
  ...network,
  setGeocoder,
  setGrid,
  setPointsOfInterest,
  setSelectedTimeCutoff
}
