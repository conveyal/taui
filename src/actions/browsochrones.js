import lonlat from '@conveyal/lonlat'
import Browsochrones from 'browsochrones'
import fetch from 'isomorphic-fetch'

import {getAsObject as getHash} from '../utils/hash'
import {geocode} from '../utils/mapbox-geocoder'
import messages from '../utils/messages'

import {addActionLogItem, setBrowsochronesInstances, setDestination, updateOrigin} from '../actions'

export default async function initialize ({
  browsochrones,
  geocoder,
  map
}) {
  const actions = []
  const {grids, gridsUrl, origins} = browsochrones
  const fetchGrids = grids.map(async (name) => {
    const res = await fetch(`${gridsUrl}/${name}.grid`)
    const grid = await res.arrayBuffer()
    grid.name = name
    return grid
  })
  const fetchedGrids = await Promise.all(fetchGrids)

  const instances = await Promise.all(origins.map((origin) => load(origin, fetchedGrids)))
  actions.push(setBrowsochronesInstances(instances))

  const qs = getHash()
  if (qs.start) {
    actions.push(...(await loadFromQueryString({
      instances,
      geocoder,
      map,
      qs
    })))
  }

  return [...actions, addActionLogItem(messages.Strings.ApplicationReady)]
}

async function load (url, grids) {
  const bs = new Browsochrones()
  bs.originsUrl = url
  bs.grids = grids.map((g) => g.name)
  const fetches = [
    fetch(`${url}/query.json`).then((res) => res.json()),
    fetch(`${url}/stop_trees.dat`).then((res) => res.arrayBuffer())
  ]
  const [query, stopTrees] = await Promise.all(fetches)
  await bs.setQuery(query)
  await bs.setStopTrees(stopTrees)
  await bs.setTransitiveNetwork(query.transitiveData)

  const putGrids = grids.map((grid) => bs.putGrid(grid.name, grid))
  await Promise.all(putGrids)

  return bs
}

async function loadFromQueryString ({
  instances,
  geocoder,
  map,
  qs
}) {
  try {
    const [startResults, endResults] = await Promise.all(['start', 'end']
      .filter((d) => !!qs[d])
      .map((d) => geocode({
        boundary: geocoder.boundary,
        focusLatlng: geocoder.focusLatlng,
        text: qs[d]
      })))
    if (startResults.features.length > 0) {
      const destination = endResults && endResults.features.length > 0
        ? { latlng: lonlat(endResults.features[0].geometry.coordinates), label: endResults.features[0].place_name }
        : {}
      return [
        updateOrigin({
          browsochronesInstances: instances,
          label: startResults.features[0].place_name,
          destinationLatlng: destination.latlng,
          latlng: lonlat(startResults.features[0].geometry.coordinates),
          zoom: map.zoom
        }),
        setDestination(destination)
      ]
    }
  } catch (e) {
    console.error(e)
    return []
  }
}
