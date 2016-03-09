import ifetch from 'isomorphic-fetch'
import {reverse} from 'isomorphic-mapzen-search'
import Leaflet from 'leaflet'
import lonlng from 'lonlng'
import {stringify} from 'qs'
import {createAction} from 'redux-actions'
import {bind} from 'redux-effects'
import {fetch} from 'redux-effects-fetch'

const IDENTITY = i => i
const META = metadata => data => metadata
const RAF = META({raf: true})

export const addActionLogItem = createAction('add action log item', (item) => {
  const payload = typeof item === 'string'
    ? { text: item }
    : item

  return Object.assign({
    createdAt: new Date(),
    level: 'info'
  }, payload)
})

export const setAccessibility = createAction('set accessibility')
export const clearDestination = createAction('clear destination')

export const setBrowsochronesBase = createAction('set browsochrones base')
export const setBrowsochronesComparison = createAction('set browsochrones comparison')
export const setDestination = createAction('set destination', IDENTITY, RAF)
export const setOrigin = createAction('set origin', IDENTITY, RAF)
export const setSelectedTimeCutoff = createAction('set selected time cutoff')
export const setTransitiveNetwork = createAction('set transitive network', IDENTITY, RAF)
export const showMapMarker = createAction('show map marker', IDENTITY, RAF)
export const hideMapMarker = createAction('hide map marker')

export const setIsochrone = createAction('set isochrone', IDENTITY, RAF)

export const reverseGeocode = createAction('reverse geocode', ({apiKey, latlng, options}) => reverse(apiKey, latlng, options))

export const updateMap = createAction('update map')
export const updateSelectedDestination = createAction('update selected destination')
export const updateSelectedProject = createAction('update selected project')

export const updateSelectedTransitMode = createAction('update selected transit mode')
export const updateSelectedTransitScenario = createAction('update selected transit scenario')

/**
 * What happens on origin update:
 *  - Map marker should get set to the new origin immmediately (if it wasn't a drag/drop)
 *  - If there's no label, the latlng point should be reverse geocoded and saved
 *  - If Browsochones is loaded, new origin data is retreived
 *    - A new surface is generated
 *      - A new jsonline generated
 *      - Accessibility is calculated for grids
 */
export function updateOrigin ({apiKey, browsochrones, latlng, label, timeCutoff, zoom}) {
  const actions = [clearDestination()]

  if (label) {
    actions.push(setOrigin({label, latlng}))
  } else {
    actions.push(bind(
      reverseGeocode({apiKey, latlng, options: {format: true}}),
      ({payload}) => {
        if (!payload) return
        return setOrigin({label: payload[0].address, latlng})
      }
    ))
  }

  if (!browsochrones.base) return actions

  const point = browsochrones.base.pixelToOriginPoint(Leaflet.CRS.EPSG3857.latLngToPoint(latlng, zoom), zoom)
  if (browsochrones.base.pointInQueryBounds(point)) {
    actions.push(bind(
      generateSurfaces(browsochrones, latlng, zoom),
      ({payload}) => {
        return [
          generateIsochrone({browsochrones: browsochrones.base, latlng, timeCutoff}),
          setAccessibility({
            base: payload[0],
            comparison: payload[1]
          })
        ]
      },
      ({err}) => console.error(err)
    ))
  } else {
    console.log('point out of bounds') // TODO: Handle
  }

  return actions
}

const generateSurfaces = createAction('generate surfaces', (browsochrones, latlng, zoom) => {
  return Promise.all([generateSurface(browsochrones.base, latlng, zoom), generateSurface(browsochrones.comparison, latlng, zoom)])
})

async function generateSurface (browsochrones, latlng, zoom) {
  try {
    const point = browsochrones.pixelToOriginPoint(Leaflet.CRS.EPSG3857.latLngToPoint(latlng, zoom), zoom)
    const response = await ifetch(`${browsochrones.originsUrl}/${point.x | 0}/${point.y | 0}.dat`)
    const value = await response.arrayBuffer()

    await browsochrones.setOrigin(value, point)
    await browsochrones.generateSurface()

    const accessibility = {}

    await Object.keys(browsochrones.grids).map(async (g) => {
      accessibility[g] = await browsochrones.getAccessibilityForGrid(browsochrones.grids[g].slice(0))
    })

    return accessibility
  } catch (e) {
    console.error(e)
  }
}

export async function generateIsochrone ({browsochrones, latlng, timeCutoff}) {
  const isochrone = await browsochrones.getIsochrone(timeCutoff)
  isochrone.key = `${lonlng.toString(latlng)}-${timeCutoff}`

  return setIsochrone(isochrone)
}

const generateDestinationData = createAction('generate destination data', (browsochrones, latlng, zoom) => {
  return Promise.all([
    browsochrones.base.generateDestinationData(browsochrones.base.pixelToOriginPoint(Leaflet.CRS.EPSG3857.latLngToPoint(latlng, zoom), zoom)),
    browsochrones.comparison.generateDestinationData(browsochrones.comparison.pixelToOriginPoint(Leaflet.CRS.EPSG3857.latLngToPoint(latlng, zoom), zoom))
  ])
})

export function updateSelectedTimeCutoff ({browsochrones, latlng, timeCutoff}) {
  const actions = [
    setSelectedTimeCutoff(timeCutoff)
  ]

  if (browsochrones.base && browsochrones.base.isLoaded()) {
    actions.push(generateIsochrone({browsochrones: browsochrones.base, latlng, timeCutoff}))
  }

  return actions
}

/**
 * What happens on destination update:
 *  - Map marker is set to the new destination immmediately (if it wasn't a drag/drop)
 *  - If there's no label, the latlng point should be reverse geocoded and saved
 *  - If Browsochones is loaded, transitive data is generated
 *  - If Browsochones has a surface generated, travel time is calculated
 */
export function updateDestination ({apiKey, browsochrones, latlng, label, zoom}) {
  const actions = []

  if (label) {
    actions.push(setDestination({label, latlng}))
  } else {
    actions.push(
      bind(
        reverseGeocode({apiKey, latlng, options: {format: true}}),
        ({payload}) => setDestination({label: payload[0].address, latlng})
      )
    )
  }

  if (browsochrones.base && browsochrones.base.isLoaded()) {
    actions.push(bind(
      generateDestinationData(browsochrones, latlng, zoom),
      ({payload}) => setTransitiveNetwork({data: payload, latlng})
    ))
  }

  return actions
}

export const requestSinglePoint = createAction('request single point')
export const receiveSinglePoint = createAction('receive single point')

export function fetchSinglePoint (query) {
  const qs = stringify({
    lat: query.position[0],
    lng: query.position[1],
    destinationPointsetId: query.destinationPointsetId,
    graphId: query.graphId
  })

  return [
    requestSinglePoint(query),
    bind(
      fetch(`/api/singlePointRequest?${qs}`),
      ({value}) => receiveSinglePoint(value),
      ({value}) => addActionLogItem(value)
    )
  ]
}
