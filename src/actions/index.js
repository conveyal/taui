import lonlat from '@conveyal/lonlat'
import {createAction} from 'redux-actions'

import fetch, {
  incrementFetches as incrementWork,
  decrementFetches as decrementWork
} from '@conveyal/woonerf/fetch'

import featureToLabel from '../utils/feature-to-label'
import {setKeyTo} from '../utils/hash'
import {reverse} from '../utils/mapbox-geocoder'

const reverseGeocode = ({latlng}) => reverse(process.env.MAPBOX_ACCESS_TOKEN, latlng)

export const addActionLogItem = createAction('add action log item', (item) => {
  const payload = typeof item === 'string'
    ? { text: item }
    : item

  return {
    createdAt: new Date(),
    level: 'info',
    ...payload
  }
})

export const setDestination = createAction('set destination', (destination) => {
  setKeyTo('end', destination ? destination.label : null)
  return destination
})

export const setOrigin = createAction('set origin', (origin) => {
  setKeyTo('start', origin ? origin.label : null)
  return origin
})

export const setDestinationLabel = createAction('set destination label', (label) => {
  setKeyTo('end', label)
  return label
})

export const setOriginLabel = createAction('set origin label', (label) => {
  setKeyTo('start', label)
  return label
})

export const clearEnd = createAction('clear end', () => {
  setKeyTo('end', null)
})
export const clearStart = createAction('clear start', () => {
  setKeyTo('start', null)
})

export const setAccessibility = createAction('set accessibility')
export const setAccessibilityFor = createAction('set accessibility for')

export const setBrowsochronesBase = createAction('set browsochrones base')
export const setBrowsochronesComparison = createAction('set browsochrones comparison')
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
  const actions = [
    addActionLogItem('Generating origins...'),
    clearIsochrone()
  ]

  // TODO: Remove this!
  if (label && label.toLowerCase().indexOf('airport') !== -1) {
    latlng = {
      lat: 39.7146,
      lng: -86.2983
    }
  }

  if (label) {
    actions.push(
      addActionLogItem(`Set start address to: ${label}`),
      setOrigin({label, latlng})
    )
  } else {
    actions.push(
      setOrigin({latlng}),
      addActionLogItem(`Finding start address for ${lonlat(latlng).toString()}`),
      reverseGeocode({latlng})
        .then(({features}) => {
          if (!features || features.length < 1) return
          const label = featureToLabel(features[0])
          return [
            addActionLogItem(`Set start address to: ${label}`),
            setOriginLabel(label)
          ]
        })
    )
  }

  if (!browsochrones.base) return actions

  try {
    const point = browsochrones.base.latLonToOriginPoint(latlng)
    actions.push(fetchBrowsochronesFor({
      browsochrones: browsochrones.base,
      destinationLatlng,
      latlng,
      name: 'base',
      point,
      timeCutoff,
      zoom
    }))
    if (browsochrones.comparison) {
      actions.push(fetchBrowsochronesFor({
        browsochrones: browsochrones.comparison,
        destinationLatlng,
        latlng,
        point,
        name: 'comparison',
        timeCutoff,
        zoom
      }))
    }
  } catch (e) {
    console.error(e)
  }

  return actions
}

function fetchBrowsochronesFor ({
  browsochrones,
  destinationLatlng,
  latlng,
  name,
  point,
  timeCutoff,
  zoom
}) {
  return [
    incrementWork(), // to include the time taking to set the origin and generate the surface
    addActionLogItem(`Fetching origin data for ${name} scenario`),
    fetch({
      url: `${browsochrones.originsUrl}/${point.x | 0}/${point.y | 0}.dat`,
      next: async (error, response) => {
        if (error) {
          console.error(error)
        } else {
          await browsochrones.setOrigin(response.value, point)

          for (const name of browsochrones.gridNames) {
            await browsochrones.generateSurface(name)
          }

          return [
            decrementWork(),
            generateAccessiblityFor({browsochrones, latlng, name, timeCutoff}),
            generateIsochroneFor({browsochrones, latlng, name, timeCutoff}),
            destinationLatlng && generateDestinationDataFor({
              browsochrones,
              fromLatlng: latlng,
              toLatlng: destinationLatlng,
              name,
              zoom
            })
          ]
        }
      }
    })
  ]
}

const storedAccessibility = {}
const storedIsochrones = {}

function generateAccessiblityFor ({browsochrones, latlng, name, timeCutoff}) {
  return [
    incrementWork(),
    addActionLogItem(`Generating accessibility surface for ${name}`),
    (async () => {
      const accessibility = {}
      for (const grid of browsochrones.grids) {
        const key = `${name}-${lonlat.toString(latlng)}-${timeCutoff}-${grid}`
        accessibility[grid] = storedAccessibility[key] || await browsochrones.getAccessibilityForGrid(grid, timeCutoff)
        storedAccessibility[key] = accessibility[grid]
      }
      return [
        setAccessibilityFor({accessibility, name}),
        decrementWork()
      ]
    })()
  ]
}

function generateIsochroneFor ({browsochrones, latlng, name, timeCutoff}) {
  return [
    incrementWork(),
    addActionLogItem(`Generating travel time isochrone for ${name}`),
    (async () => {
      const key = `${name}-${lonlat.toString(latlng)}-${timeCutoff}`
      const isochrone = storedIsochrones[key] || await browsochrones.getIsochrone(timeCutoff)
      isochrone.key = key
      storedIsochrones[key] = isochrone

      return [
        setIsochroneFor({isochrone, name}),
        decrementWork()
      ]
    })()
  ]
}

function generateDestinationDataFor ({browsochrones, fromLatlng, toLatlng, name, zoom}) {
  return [
    incrementWork(),
    addActionLogItem(`Generating transit data for ${name}`),
    (async () => {
      const destinationPoint = browsochrones.latLonToOriginPoint(toLatlng)
      const data = await browsochrones.generateDestinationData({
        from: fromLatlng || null,
        to: {
          ...toLatlng,
          ...destinationPoint
        }
      })
      data.transitive.key = `${name}-${lonlat.toString(toLatlng)}`
      return [
        setDestinationDataFor({data, name}),
        decrementWork()
      ]
    })()
  ]
}

export function updateSelectedTimeCutoff ({browsochrones, latlng, timeCutoff}) {
  const actions = [
    setSelectedTimeCutoff(timeCutoff)
  ]

  if (browsochrones.base && browsochrones.base.isLoaded()) {
    actions.push(generateIsochroneFor({browsochrones: browsochrones.base, latlng, name: 'base', timeCutoff}))
    actions.push(generateAccessiblityFor({browsochrones: browsochrones.base, latlng, name: 'base', timeCutoff}))
  }

  if (browsochrones.comparison && browsochrones.comparison.isLoaded()) {
    actions.push(generateIsochroneFor({browsochrones: browsochrones.comparison, latlng, name: 'comparison', timeCutoff}))
    actions.push(generateAccessiblityFor({browsochrones: browsochrones.comparison, latlng, name: 'comparison', timeCutoff}))
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
export function updateDestination ({
  browsochrones,
  fromLatlng,
  latlng,
  label,
  zoom
}) {
  const actions = []

  // TODO: Remove this!
  if (label && label.toLowerCase().indexOf('airport') !== -1) {
    latlng = {
      lat: 39.7146,
      lng: -86.2983
    }
  }

  if (label) {
    actions.push(setDestination({label, latlng}))
  } else {
    actions.push(
      setDestination({latlng}),
      reverseGeocode({latlng})
        .then(({features}) => setDestinationLabel(featureToLabel(features[0])))
    )
  }

  if (browsochrones.base && browsochrones.base.isLoaded()) {
    actions.push(generateDestinationDataFor({browsochrones: browsochrones.base, fromLatlng, toLatlng: latlng, name: 'base', zoom}))
  }

  if (browsochrones.comparison && browsochrones.comparison.isLoaded()) {
    actions.push(generateDestinationDataFor({browsochrones: browsochrones.comparison, fromLatlng, toLatlng: latlng, name: 'comparison', zoom}))
  }

  return actions
}
