import lonlat from '@conveyal/lonlat'
import Leaflet from 'leaflet'
import {createAction} from 'redux-actions'

import fetch, {
  incrementFetches as incrementWork,
  decrementFetches as decrementWork
} from '@conveyal/woonerf/fetch'

import featureToLabel from '../utils/feature-to-label'
import {setKeyTo} from '../utils/hash'
import {reverse} from '../utils/mapbox-geocoder'

const END = 'end'
const START = 'start'

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

export const setEnd = createAction('set end', (end) => {
  setKeyTo(END, end ? end.label : null)
  return end
})

export const setStart = createAction('set start', (start) => {
  setKeyTo(START, start ? start.label : null)
  return start
})

export const setEndLabel = createAction('set end label', (label) => {
  setKeyTo(END, label)
  return label
})

export const setStartLabel = createAction('set start label', (label) => {
  setKeyTo(START, label)
  return label
})

export const clearEnd = createAction('clear end', () => setKeyTo(END, null))
export const clearStart = createAction('clear start', () => setKeyTo(START, null))

export const setAccessibilityFor = createAction('set accessibility for')
export const setAccessibilityToEmptyFor = createAction('set accessibility to empty for')
export const setAccessibilityToLoadingFor = createAction('set accessibility to loading for')

export const setActiveBrowsochronesInstance = createAction('set active browsochrones instance')
export const setBrowsochronesInstances = createAction('set browsochrones instances')

export const setSelectedTimeCutoff = createAction('set selected time cutoff')
export const setDestinationDataFor = createAction('set destination data for')

export const showMapMarker = createAction('show map marker')
export const hideMapMarker = createAction('hide map marker')

export const clearIsochrone = createAction('clear isochrone')
export const setIsochrone = createAction('set isochrone')
export const setIsochroneFor = createAction('set isochrone for')

export const updateMap = createAction('update map')

/**
 * What happens on start update:
 *  - Map marker should get set to the new start immmediately (if it wasn't a drag/drop)
 *  - If there's no label, the latlng point should be reverse geocoded and saved
 *  - If Browsochones is loaded, new start data is retreived
 *    - A new surface is generated
 *      - A new jsonline generated
 *      - Accessibility is calculated for grids
 */
export function updateStart ({
  browsochronesInstances,
  endLatlng,
  latlng, label,
  timeCutoff,
  zoom
}) {
  const actions = [
    addActionLogItem('Generating origins...'),
    clearIsochrone(),
    ...browsochronesInstances
      .map((instance, index) =>
        setAccessibilityToLoadingFor({index, name: instance.name}))
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
      setStart({label, latlng})
    )
  } else {
    actions.push(
      setStart({latlng}),
      addActionLogItem(`Finding start address for ${lonlat(latlng).toString()}`),
      reverseGeocode({latlng})
        .then(({features}) => {
          if (!features || features.length < 1) return
          const label = featureToLabel(features[0])
          return [
            addActionLogItem(`Set start address to: ${label}`),
            setStartLabel(label)
          ]
        })
    )
  }

  if (!browsochronesInstances || browsochronesInstances.length === 0) return actions

  actions.push(fetchAllBrowsochrones({
    browsochronesInstances,
    endLatlng,
    latlng,
    timeCutoff,
    zoom
  }))

  return actions
}

export function fetchAllBrowsochrones ({
  browsochronesInstances,
  endLatlng,
  latlng,
  timeCutoff,
  zoom
}) {
  const point = Leaflet.CRS.EPSG3857.latLngToPoint(lonlat.toLeaflet(latlng), zoom)
  const originPoint = browsochronesInstances[0].pixelToOriginPoint(point, zoom)
  if (browsochronesInstances[0].pointInQueryBounds(originPoint)) {
    return browsochronesInstances.map((instance, index) => fetchBrowsochronesFor({
      browsochrones: instance,
      endLatlng,
      index,
      latlng,
      timeCutoff,
      zoom
    }))
  } else {
    console.log('point out of bounds') // TODO: Handle
  }
}

function fetchBrowsochronesFor ({
  browsochrones,
  endLatlng,
  index,
  latlng,
  timeCutoff,
  zoom
}) {
  const point = browsochrones.pixelToOriginPoint(Leaflet.CRS.EPSG3857.latLngToPoint(lonlat.toLeaflet(latlng), zoom), zoom)
  return [
    incrementWork(), // to include the time taking to set the origin and generate the surface
    addActionLogItem(`Fetching origin data for scenario ${index}`),
    fetch({
      url: `${browsochrones.originsUrl}/${point.x | 0}/${point.y | 0}.dat`,
      next: async (error, response) => {
        if (error) {
          console.error(error)
        } else {
          await browsochrones.setOrigin(response.value, point)
          await browsochrones.generateSurface()

          return [
            decrementWork(),
            generateAccessiblityFor({browsochrones, index, latlng, timeCutoff}),
            generateIsochroneFor({browsochrones, index, latlng, timeCutoff}),
            endLatlng && generateDestinationDataFor({
              browsochrones,
              startLatlng: latlng,
              index,
              endLatlng: endLatlng,
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

function generateAccessiblityFor ({browsochrones, index, latlng, timeCutoff}) {
  return [
    incrementWork(),
    addActionLogItem(`Generating accessibility surface for scenario ${index}`),
    (async () => {
      const accessibility = {}
      for (const grid of browsochrones.grids) {
        const key = `${index}-${lonlat.toString(latlng)}-${timeCutoff}-${grid}`
        accessibility[grid] = storedAccessibility[key] || await browsochrones.getAccessibilityForGrid(grid, timeCutoff)
        storedAccessibility[key] = accessibility[grid]
      }
      return [
        setAccessibilityFor({accessibility, index, name: browsochrones.name}),
        decrementWork()
      ]
    })()
  ]
}

function generateIsochroneFor ({browsochrones, index, latlng, timeCutoff}) {
  return [
    incrementWork(),
    addActionLogItem(`Generating travel time isochrone for scenario ${index}`),
    (async () => {
      const key = `${index}-${lonlat.toString(latlng)}-${timeCutoff}`
      const isochrone = storedIsochrones[key] || await browsochrones.getIsochrone(timeCutoff)
      isochrone.key = key
      storedIsochrones[key] = isochrone

      return [
        setIsochroneFor({isochrone, index}),
        decrementWork()
      ]
    })()
  ]
}

function generateDestinationDataFor ({
  browsochrones,
  startLatlng,
  index,
  endLatlng,
  zoom
}) {
  return [
    incrementWork(),
    addActionLogItem(`Generating transit data for scenario ${index}`),
    (async () => {
      const endPoint = browsochrones.pixelToOriginPoint(Leaflet.CRS.EPSG3857.latLngToPoint(lonlat.toLeaflet(endLatlng), zoom), zoom)
      const data = await browsochrones.generateDestinationData({
        from: startLatlng || null,
        to: {
          ...endLatlng,
          ...endPoint
        }
      })
      data.transitive.key = `${index}-${lonlat.toString(endLatlng)}`
      return [
        setDestinationDataFor({data, index}),
        decrementWork()
      ]
    })()
  ]
}

export function updateSelectedTimeCutoff ({browsochrones, latlng, timeCutoff}) {
  const actions = [
    setSelectedTimeCutoff(timeCutoff)
  ]

  browsochrones.instances
    .map((instance, index) => {
      if (instance.isLoaded()) {
        actions.push(generateIsochroneFor({browsochrones: instance, index, latlng, timeCutoff}))
        actions.push(generateAccessiblityFor({browsochrones: instance, index, latlng, timeCutoff}))
      }
    })

  return actions
}

/**
 * What happens on end update:
 *  - Map marker is set to the new end point immmediately (if it wasn't a drag/drop)
 *  - If there's no label, the latlng point should be reverse geocoded and saved
 *  - If Browsochones is loaded, transitive data is generated
 *  - If Browsochones has a surface generated, travel time is calculated
 */
export function updateEnd ({
  browsochronesInstances,
  startLatlng,
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
    actions.push(setEnd({label, latlng}))
  } else {
    actions.push(
      setEnd({latlng}),
      reverseGeocode({latlng})
        .then(({features}) => setEndLabel(featureToLabel(features[0])))
    )
  }

  browsochronesInstances
    .map((instance, index) => {
      if (instance.isLoaded()) {
        actions.push(generateDestinationDataFor({
          browsochrones: instance,
          startLatlng,
          index,
          endLatlng: latlng,
          zoom
        }))
      }
    })

  return actions
}
