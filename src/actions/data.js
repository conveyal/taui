// @flow
import lonlat from '@conveyal/lonlat'
import fetch, {fetchMultiple} from '@conveyal/woonerf/fetch'
import Leaflet from 'leaflet'

import {ACCESSIBILITY_IS_EMPTY, ACCESSIBILITY_IS_LOADING} from '../constants'
import geocode from './geocode'
import {getAsObject as getHash} from '../utils/hash'

import {
  setEnd,
  setOrigin,
  setStart,
  updateMap
} from '../actions'
import {loadGrid} from './grid'

import type {LonLat} from '../types'

const setQuery = (query) => ({type: 'set query', payload: query})

export function initialize () {
  return (dispatch: Dispatch, getState: any) => {
    const state = getState()
    const qs = getHash()
    const origins = state.data.origins

    const currentZoom = qs.zoom ? parseInt(qs.zoom, 10) : 11
    dispatch(updateMap({zoom: currentZoom}))

    origins.map((origin) => {
      dispatch(
        qs.start
          ? setOrigin({name: origin.name, accessibility: ACCESSIBILITY_IS_LOADING})
          : setOrigin({name: origin.name, accessibility: ACCESSIBILITY_IS_EMPTY})
      )
    })

    state.data.grids.map((grid) => {
      dispatch(loadGrid(grid.name, state.data.gridsUrl))
    })

    if (qs.start) {
      dispatch(setStart({label: qs.start}))
      dispatch(geocode(qs.start, (feature) => {
        const originLonlat = lonlat(feature.center)
        dispatch(setStart({
          label: qs.start,
          position: originLonlat
        }))

        dispatch(loadOrigins(origins, originLonlat, currentZoom))
      }))
    } else {
      dispatch(loadOrigins(origins))
      if (qs.end) {
        dispatch(setEnd({label: qs.end}))
        dispatch(geocode(qs.end, (feature) => {
          dispatch([
            setEnd({
              label: qs.end,
              position: lonlat(feature.center)
            }),
            updateMap({centerCoordinates: lonlat.toLeaflet(feature.center)})
          ])
        }))
      }
    }
  }
}

const loadOrigins = (origins, originLonlat?: LonLat, currentZoom?: number) =>
  origins.map(origin => loadOrigin(origin, originLonlat, currentZoom))

const loadOrigin = (origin, originLonlat?: LonLat, currentZoom?: number) =>
  fetch({
    url: `${origin.url}/query.json`,
    next (response) {
      const query = response.value

      if (originLonlat && currentZoom) {
        return [
          setQuery(query),
          fetchDataForOrigin({...origin, query}, originLonlat, currentZoom)
        ]
      } else {
        return [
          setQuery(query),
          setOrigin({
            ...origin,
            query
          })
        ]
      }
    }
  })

export const fetchDataForLonLat = (originLonLat: LonLat) =>
  (dispatch: Dispatch, getState: any) => {
    const state = getState()
    const currentZoom = state.map.zoom
    dispatch(state.data.origins.map(origin =>
      fetchDataForOrigin(origin, originLonLat, currentZoom)))
  }

const fetchDataForOrigin = (origin, originLonlat, currentZoom) => {
  const originPoint = getOriginPoint(originLonlat, currentZoom, origin.query)
  const originIndex = originPoint.x + originPoint.y * origin.query.width
  return fetchMultiple({
    fetches: [{
      url: `${origin.url}/${originIndex}_times.dat`
    }, {
      url: `${origin.url}/${originIndex}_paths.dat`
    }],
    next: ([timesResponse, pathsResponse]) =>
      setOrigin({
        ...origin,
        originPoint,
        travelTimeSurface: parseTimes(timesResponse.value),
        paths: parsePaths(pathsResponse.value)
      })
  })
}

function getOriginPoint (originLonlat, currentZoom: number, query) {
  const pixel = Leaflet.CRS.EPSG3857.latLngToPoint(
    lonlat.toLeaflet(originLonlat),
    currentZoom
  )
  const scale = Math.pow(2, query.zoom - currentZoom)

  let {x, y} = pixel
  x = x * scale - query.west | 0
  y = y * scale - query.north | 0

  return {x, y}
}

const TIMES_GRID_TYPE = 'ACCESSGR'
const TIMES_HEADER_LENGTH = 9

function parseTimes (ab: ArrayBuffer) {
  const data = new Int32Array(ab)
  const headerData = new Int8Array(ab)
  const header = {}
  header.type = String.fromCharCode(...headerData.slice(0, TIMES_GRID_TYPE.length))

  if (header.type !== TIMES_GRID_TYPE) {
    throw new Error(`Retrieved grid header ${header.type} !== ${TIMES_GRID_TYPE}. Please check your data.`)
  }

  let offset = 2
  const version = data[offset++]
  const zoom = data[offset++]
  const west = data[offset++]
  const north = data[offset++]
  const width = data[offset++]
  const height = data[offset++]
  const nSamples = data[offset++]

  return {
    version,
    zoom,
    west,
    north,
    width,
    height,
    nSamples,
    data: data.slice(TIMES_HEADER_LENGTH)
  }
}

const PATHS_GRID_TYPE = 'PATHGRID'
const PATHS_HEADER_LENGTH = 2

function parsePaths (ab: ArrayBuffer) {
  const data = new Int32Array(ab)
  const headerData = new Int8Array(ab)

  return {
    data:
  }
}
