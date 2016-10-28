import Leaflet from 'leaflet'
import lonlng from 'lonlng'
import {createAction} from 'redux-actions'

import fetch from 'mastarm/react/fetch'

import featureToLabel from '../utils/feature-to-label'
import {reverse} from '../utils/mapbox-geocoder'

const reverseGeocode = ({latlng}) => reverse(process.env.MAPBOX_ACCESS_TOKEN, latlng)

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
export const setAccessibilityFor = createAction('set accessibility for')
export const clearEnd = createAction('clear end')
export const clearStart = createAction('clear start')

export const setBrowsochronesBase = createAction('set browsochrones base')
export const setBrowsochronesComparison = createAction('set browsochrones comparison')
export const setDestination = createAction('set destination')
export const setOrigin = createAction('set origin')
export const setSelectedTimeCutoff = createAction('set selected time cutoff')
export const setTransitiveNetwork = createAction('set transitive network')
export const setDestinationDataFor = createAction('set destination data for')
export const showMapMarker = createAction('show map marker')
export const hideMapMarker = createAction('hide map marker')

export const clearIsochrone = createAction('clear isochrone')
export const setIsochrone = createAction('set isochrone')
export const setIsochrones = createAction('set isochrones')
export const setIsochroneFor = createAction('set isochrone for')

export const setBaseActive = createAction('set base active')
export const setComparisonActive = createAction('set comparison active')

export const updateMap = createAction('update map')
export const updateSelectedDestination = createAction('update selected destination')

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
export function updateOrigin ({browsochrones, destinationLatlng, latlng, label, timeCutoff, zoom}) {
  const actions = [clearIsochrone()]

  if (label) {
    actions.push(setOrigin({label, latlng}))
  } else {
    actions.push(
      reverseGeocode({latlng})
        .then(({features}) => {
          if (!features || features.length < 1) return
          return setOrigin({label: featureToLabel(features[0]), latlng: lonlng(features[0].geometry.coordinates)})
        })
    )
  }

  if (!browsochrones.base) return actions

  const point = browsochrones.base.pixelToOriginPoint(Leaflet.CRS.EPSG3857.latLngToPoint(latlng, zoom), zoom)
  if (browsochrones.base.pointInQueryBounds(point)) {
    actions.push(fetchBrowsochronesFor({
      browsochrones: browsochrones.base,
      destinationLatlng,
      latlng,
      name: 'base',
      timeCutoff,
      zoom
    }))
    actions.push(fetchBrowsochronesFor({
      browsochrones: browsochrones.comparison,
      destinationLatlng,
      latlng,
      name: 'comparison',
      timeCutoff,
      zoom
    }))
  } else {
    console.log('point out of bounds') // TODO: Handle
  }

  return actions
}

function fetchBrowsochronesFor ({
  browsochrones,
  destinationLatlng,
  latlng,
  name,
  timeCutoff,
  zoom
}) {
  const point = browsochrones.pixelToOriginPoint(Leaflet.CRS.EPSG3857.latLngToPoint(latlng, zoom), zoom)
  return fetch({
    url: `${browsochrones.originsUrl}/${point.x | 0}/${point.y | 0}.dat`,
    next: async (response) => {
      const actions = []
      await browsochrones.setOrigin(response.value, point)
      await browsochrones.generateSurface()

      actions.push(generateAccessiblityFor({browsochrones, name, timeCutoff}))
      actions.push(generateIsochroneFor({browsochrones, latlng, name, timeCutoff}))

      if (destinationLatlng) {
        actions.push(generateDestinationDataFor({browsochrones, latlng: destinationLatlng, name, zoom}))
      }

      return actions
    }
  })
}

async function generateAccessiblityFor ({browsochrones, name, timeCutoff}) {
  const accessibility = {}
  for (const grid of browsochrones.grids) {
    accessibility[grid] = await browsochrones.getAccessibilityForGrid(grid, timeCutoff)
  }
  return setAccessibilityFor({accessibility, name})
}

async function generateIsochroneFor ({browsochrones, latlng, name, timeCutoff}) {
  const isochrone = await browsochrones.getIsochrone(timeCutoff)
  isochrone.key = `${name}-${lonlng.toString(latlng)}-${timeCutoff}`

  return setIsochroneFor({isochrone, name})
}

async function generateDestinationDataFor ({browsochrones, latlng, name, zoom}) {
  const destinationPoint = browsochrones.pixelToOriginPoint(Leaflet.CRS.EPSG3857.latLngToPoint(latlng, zoom), zoom)
  const data = await browsochrones.generateDestinationData(destinationPoint, zoom)
  data.transitive.key = `${name}-${lonlng.toString(latlng)}`
  return setDestinationDataFor({data, name})
}

export function updateSelectedTimeCutoff ({browsochrones, latlng, timeCutoff}) {
  const actions = [
    setSelectedTimeCutoff(timeCutoff)
  ]

  if (browsochrones.base && browsochrones.base.isLoaded()) {
    actions.push(generateIsochroneFor({browsochrones: browsochrones.base, latlng, name: 'base', timeCutoff}))
    actions.push(generateIsochroneFor({browsochrones: browsochrones.comparison, latlng, name: 'comparison', timeCutoff}))
    actions.push(generateAccessiblityFor({browsochrones: browsochrones.base, name: 'base', timeCutoff}))
    actions.push(generateAccessiblityFor({browsochrones: browsochrones.comparison, name: 'comparison', timeCutoff}))
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
export function updateDestination ({browsochrones, latlng, label, zoom}) {
  const actions = []

  if (label) {
    actions.push(setDestination({label, latlng}))
  } else {
    actions.push(
      reverseGeocode({latlng})
        .then(({features}) => setDestination({label: featureToLabel(features[0]), latlng: lonlng(features[0].geometry.coordinates)}))
    )
  }

  if (browsochrones.base && browsochrones.base.isLoaded()) {
    actions.push(generateDestinationDataFor({browsochrones: browsochrones.base, latlng, name: 'base', zoom}))
    actions.push(generateDestinationDataFor({browsochrones: browsochrones.comparison, latlng, name: 'comparison', zoom}))
  }

  return actions
}
