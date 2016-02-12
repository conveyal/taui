import {reverse} from 'isomorphic-mapzen-search'
import Leaflet from 'leaflet'
import lonlng from 'lonlng'
import {stringify} from 'qs'
import {createAction} from 'redux-actions'
import {bind} from 'redux-effects'
import {fetch} from 'redux-effects-fetch'

export const addActionLogItem = createAction('add action log item', (item) => {
  const payload = typeof item === 'string'
    ? { text: item }
    : item

  return Object.assign({
    createdAt: new Date(),
    level: 'info'
  }, payload)
})

export const clearDestination = createAction('clear destination')

export const setBrowsochrones = createAction('set browsochrones')
export const setDestination = createAction('set destination')
export const setOrigin = createAction('set origin')
export const setSelectedTimeCutoff = createAction('set selected time cutoff')
export const setTransitiveNetwork = createAction('set transitive network')
export const showMapMarker = createAction('show map marker')
export const hideMapMarker = createAction('hide map marker')

export const setIsochrone = createAction('set isochrone')

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
  const point = browsochrones.pixelToOriginCoordinates(Leaflet.CRS.EPSG3857.latLngToPoint(latlng, zoom), zoom)

  if (label) {
    actions.push(setOrigin({label, latlng, point}))
  } else {
    actions.push(bind(
      reverseGeocode({apiKey, latlng, options: {format: true}}),
      ({payload}) => setOrigin({label: payload[0].address, latlng, point})
    ))
  }

  if (browsochrones.coordinatesInQueryBounds(point)) {
    actions.push(bind(
      fetch(`${browsochrones.originsUrl}/${point.x | 0}/${point.y | 0}.dat`),
      ({value}) => {
        browsochrones.setOrigin(value, point)
        browsochrones.generateSurface()

        return generateIsochrone({browsochrones, latlng, timeCutoff})
      },
      ({err}) => console.error(err)
    ))
  } else {
    console.log('coordinates out of bounds') // TODO: Handle
  }

  return actions
}

export function generateIsochrone ({browsochrones, latlng, timeCutoff}) {
  const isochrone = browsochrones.getIsochrone(timeCutoff)
  isochrone.key = `${lonlng.toString(latlng)}-${timeCutoff}`

  return setIsochrone(isochrone)
}

export function updateSelectedTimeCutoff ({browsochrones, latlng, timeCutoff}) {
  const actions = [
    setSelectedTimeCutoff(timeCutoff)
  ]

  if (browsochrones.surface) {
    actions.push(generateIsochrone({browsochrones, latlng, timeCutoff}))
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
  const point = browsochrones.pixelToOriginCoordinates(Leaflet.CRS.EPSG3857.latLngToPoint(latlng, zoom), zoom)

  if (label) {
    actions.push(setDestination({label, latlng, point}))
  } else {
    actions.push(
      bind(
        reverseGeocode({apiKey, latlng, options: {format: true}}),
        ({payload}) => setDestination({label: payload[0].address, latlng, point})
      )
    )
  }

  if (browsochrones.surface) {
    const transitiveData = browsochrones.generateTransitiveData(point)
    transitiveData.key = `${lonlng.toString(latlng)}`
    actions.push(setTransitiveNetwork(transitiveData))
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
