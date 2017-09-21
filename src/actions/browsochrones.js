// @flow
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
  setStartLabel,
  updateMap
} from '../actions'

import type {Store} from '../types'

export default function initialize ({
  browsochrones,
  geocoder,
  map,
  timeCutoff
}: Store) {
  const {origins} = browsochrones
  const qs = getHash()
  return [
    incrementFetches(),
    setStartLabel(qs.start), // may not exist
    setEndLabel(qs.end), // may not exist
    ...origins.map(
      (origin, index) =>
        qs.start
          ? setAccessibilityToLoadingFor({index, name: origin.name})
          : setAccessibilityToEmptyFor({index, name: origin.name})
    ),
    geocodeQs({geocoder, qs}).then(([start, end]) => {
      const actions = []
      if (start) {
        actions.push(setStart(start))
        actions.push(updateMap({centerCoordinates: [start.latlng.lat, start.latlng.lon]}))
      }
      if (end) actions.push(setEnd(end))
      if (qs.zoom) actions.push(updateMap({zoom: parseInt(qs.zoom, 10)}))
      actions.push(
        fetchGrids(browsochrones)
          .then(grids =>
            loadAllOrigins({grids, origins, gridNames: browsochrones.grids})
          )
          .then(instances => [
            setBrowsochronesInstances(instances),
            start &&
              fetchAllBrowsochrones({
                browsochronesInstances: instances,
                endLatlng: end && end.latlng,
                latlng: start.latlng,
                timeCutoff: timeCutoff.selected,
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

async function geocodeQs ({geocoder, qs}) {
  async function geocodeP (p) {
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
  }
  return [await geocodeP('start'), await geocodeP('end')]
}

function fetchGrids ({
  grids,
  gridsUrl
}: {
  grids: string[],
  gridsUrl: string
}): Promise<ArrayBuffer[]> {
  return Promise.all(
    grids.map(name =>
      fetch(`${gridsUrl}/${name}.grid`).then(r => r.arrayBuffer())
    )
  )
}

function loadAllOrigins ({grids, origins, gridNames}) {
  return Promise.all(origins.map(origin => load(origin, grids, gridNames)))
}

async function load (origin, grids, gridNames) {
  const bs = new Browsochrones()
  bs.name = origin.name
  bs.originsUrl = origin.url
  bs.grids = gridNames
  const fetches = [
    fetch(`${origin.url}/query.json`).then(res => res.json()),
    fetch(`${origin.url}/stop_trees.dat`).then(res => res.arrayBuffer())
  ]
  const [query, stopTrees] = await Promise.all(fetches)
  await bs.setQuery(query)
  await bs.setStopTrees(stopTrees)
  await bs.setTransitiveNetwork(query.transitiveData)

  const putGrids = grids.map((grid, index) =>
    bs.putGrid(gridNames[index], grid)
  )
  await Promise.all(putGrids)

  return bs
}
