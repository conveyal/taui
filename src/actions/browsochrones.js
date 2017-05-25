import lonlat from '@conveyal/lonlat'
import {decrementFetches, incrementFetches} from '@conveyal/woonerf/fetch'
import Browsochrones from 'browsochrones'
import fetch from 'isomorphic-fetch'
import {search as geocode} from 'isomorphic-mapzen-search'

import {getAsObject as getHash} from '../utils/hash'
import messages from '../utils/messages'

import {
  addActionLogItem,
  fetchAllBrowsochrones,
  setAccessibilityToEmptyFor,
  setAccessibilityToLoadingFor,
  setBrowsochronesInstances,
  setEnd,
  setEndLabel,
  setStart,
  setStartLabel
} from '../actions'

export default function initialize ({browsochrones, geocoder, map}) {
  const {origins} = browsochrones
  const qs = getHash()
  return [
    incrementFetches(),
    setStartLabel(qs.start), // may not exist
    setEndLabel(qs.end), // may not exist
    ...origins.map(
      (origin, index) =>
        (qs.start
          ? setAccessibilityToLoadingFor({index, name: origin.name})
          : setAccessibilityToEmptyFor({index, name: origin.name}))
    ),
    geocodeQs({geocoder, qs}).then(([start, end]) => {
      const actions = []
      if (start) actions.push(setStart(start))
      if (end) actions.push(setEnd(end))
      actions.push(
        fetchGrids(browsochrones)
          .then(grids => loadAllOrigins({grids, origins}))
          .then(instances => [
            setBrowsochronesInstances(instances),
            start &&
              fetchAllBrowsochrones({
                browsochronesInstances: instances,
                endLatlng: end && end.latlng,
                latlng: start.latlng,
                zoom: map.zoom
              }),
            addActionLogItem(messages.Strings.ApplicationReady),
            decrementFetches()
          ])
      )
      return actions
    })
  ]
}

function geocodeQs ({geocoder, qs}) {
  return Promise.all(
    ['start', 'end'].map(async p => {
      if (qs[p]) {
        const results = await geocode({
          apiKey: process.env.MAPZEN_SEARCH_KEY,
          boundary: geocoder.boundary,
          focusPoint: geocoder.focusLatlng,
          text: qs[p]
        })
        if (results.features.length > 0) {
          return {
            label: results.features[0].properties.label,
            latlng: lonlat(results.features[0].geometry.coordinates)
          }
        }
      }
    })
  )
}

function fetchGrids ({grids, gridsUrl}) {
  return Promise.all(
    grids.map(async name => {
      const res = await fetch(`${gridsUrl}/${name}.grid`)
      const grid = await res.arrayBuffer()
      grid.name = name
      return grid
    })
  )
}

function loadAllOrigins ({grids, origins}) {
  return Promise.all(origins.map(origin => load(origin, grids)))
}

async function load (origin, grids) {
  const bs = new Browsochrones()
  bs.name = origin.name
  bs.originsUrl = origin.url
  bs.grids = grids.map(g => g.name)
  const fetches = [
    fetch(`${origin.url}/query.json`).then(res => res.json()),
    fetch(`${origin.url}/stop_trees.dat`).then(res => res.arrayBuffer())
  ]
  const [query, stopTrees] = await Promise.all(fetches)
  await bs.setQuery(query)
  await bs.setStopTrees(stopTrees)
  await bs.setTransitiveNetwork(query.transitiveData)

  const putGrids = grids.map(grid => bs.putGrid(grid.name, grid))
  await Promise.all(putGrids)

  return bs
}
