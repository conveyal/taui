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
    }

    if (qs.end) {
      dispatch(setEnd({label: qs.end}))
      dispatch(geocode(qs.end, (feature) => {
        const position = lonlat(feature.center)
        dispatch([
          setEnd({
            label: qs.end,
            position: lonlat(feature.center)
          }),
          fetchDestinationDataForLonLat(position)
        ])

        if (!qs.start) {
          dispatch(updateMap({centerCoordinates: lonlat.toLeaflet(feature.center)}))
        }
      }))
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
        return fetchDataForOrigin({...origin, query}, originLonlat, currentZoom)
      } else {
        return setOrigin({...origin, query})
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
  const originPoint = getPointForLonLat(originLonlat, currentZoom, origin.query)
  const originIndex = originPoint.x + originPoint.y * origin.query.width
  return fetchMultiple({
    fetches: [{
      url: `${origin.url}/${originIndex}_times.dat`
    }, {
      url: `${origin.url}/${originIndex}_paths.dat`
    }],
    next: ([timesResponse, pathsResponse]) => {
      const travelTimeSurface = parseTimesData(timesResponse.value)
      const nTargets = travelTimeSurface.width * travelTimeSurface.height
      const {pathLists, targets} = parsePathsData(pathsResponse.value, nTargets, 120)

      debugger
      validatePathLists(pathLists, origin.query.transitiveData)

      return setOrigin({
        ...origin,
        originPoint,
        pathLists,
        targets,
        travelTimeSurface
      })
    }
  })
}

export const fetchDestinationDataForLonLat = (position: LonLat) =>
  (dispatch: Dispatch, getState: any) => {
    const state = getState()
    const currentZoom = state.map.zoom

    dispatch(state.data.origins.map(origin =>
      dispatch(fetchDestinationDataForOrigin(origin, position, currentZoom))))
  }

const fetchDestinationDataForOrigin = (origin, position, currentZoom) => {
  const point = getPointForLonLat(position, currentZoom, origin.query)
  const index = point.x + point.y * origin.query.width
  return fetch({
    url: `${origin.url}/${index}_paths.dat`
  })
}

function getPointForLonLat (position, currentZoom: number, query) {
  const pixel = Leaflet.CRS.EPSG3857.latLngToPoint(
    lonlat.toLeaflet(position),
    currentZoom
  )
  const scale = Math.pow(2, query.zoom - currentZoom)

  let {x, y} = pixel
  x = x * scale - query.west | 0
  y = y * scale - query.north | 0

  return {x, y}
}

const TIMES_GRID_TYPE = 'ACCESSGR'

function parseTimesData (ab: ArrayBuffer) {
  const data = new Int32Array(ab)
  const headerData = new Int8Array(ab)
  const headerType = String.fromCharCode(...headerData.slice(0, TIMES_GRID_TYPE.length))

  if (headerType !== TIMES_GRID_TYPE) {
    throw new Error(`Retrieved grid header ${headerType} !== ${TIMES_GRID_TYPE}. Please check your data.`)
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
    data: data.slice(TIMES_GRID_TYPE.length)
  }
}

/**
 *
 */
const PATHS_GRID_TYPE = 'PATHGRID'
function parsePathsData (ab: ArrayBuffer) {
  const data = new Int32Array(ab.slice(PATHS_GRID_TYPE.length))
  const headerData = new Int8Array(ab)

  const headerType = String.fromCharCode(...headerData.slice(0, PATHS_GRID_TYPE.length))
  if (headerType !== PATHS_GRID_TYPE) {
    throw new Error(`Retrieved grid header ${headerType} !== ${PATHS_GRID_TYPE}. Please check your data.`)
  }

  let offset = 0
  const next = () => data[offset++]
  const nDestinations = next()
  const nIterations = next()
  const nPathLists = next()
  const pathLists = []
  for (let i = 0; i < nPathLists; i++) {
    const nPaths = next()
    const pathList = []
    for (let j = 0; j < nPaths; j++) {
      pathList.push([next(), next(), next()]) // boardStopId, patternId, alightStopId
    }
    pathLists.push(pathList)
  }

  const targets = []
  for (let i = 0; i < nDestinations; i++) {
    const pathIndexes = []
    let previousValue = 0
    for (let j = 0; j < nIterations; j++) {
      const delta = next()
      const pathIndex = delta + previousValue
      pathIndexes.push(pathIndex)
      previousValue = pathIndex
    }
    targets.push(pathIndexes)
  }

  return {pathLists, targets}
}

function validatePathLists (pathLists, td) {
  const stopInAllData = (id) => hasStop(id, td.stops)
  pathLists.forEach(pathList => {
    pathList.forEach(([boardStopId, patternId, alightStopId]) => {
      const pattern = td.patterns.find(p => p.pattern_id === `${patternId}`)
      if (!pattern) {
        console.error(`Pattern ${patternId} not in transitive data.`)
      }

      const stopInPattern = (id) => hasStop(id, pattern.stops)

      if (!stopInPattern(boardStopId)) {
        console.error(`Board stop ${boardStopId} not found in pattern`)
        if (!stopInAllData(boardStopId)) {
          console.error(`Board stop ${boardStopId} not found in all data`)
        }
      }

      if (!stopInPattern(alightStopId)) {
        console.error(`Alight stop ${alightStopId} not found in pattern`)
        if (!stopInAllData(alightStopId)) {
          console.error(`Alight stop ${alightStopId} not found in all data`)
        }
      }
    })
  })
}

const hasStop = (stopId, stops) => !!stops.find(s => s.stop_id === `${stopId}`)
