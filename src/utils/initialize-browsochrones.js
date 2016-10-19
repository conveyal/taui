import Browsochrones from 'browsochrones'
import fetch from 'isomorphic-fetch'
import lonlng from 'lonlng'
import {parse as parseQueryString} from 'qs'

import {geocode} from './mapbox-geocoder'
import messages from './messages'

import {addActionLogItem, setBrowsochronesBase, setBrowsochronesComparison, setDestination, updateOrigin} from '../actions'

export default async function initialize (store) {
  let state = store.getState()
  const {grids, gridsUrl, origins} = state.browsochrones
  try {
    const fetchGrids = grids.map(async (name) => {
      const res = await fetch(`${gridsUrl}/${name}.grid`)
      const grid = await res.arrayBuffer()
      grid.name = name
      return grid
    })
    const fetchedGrids = await Promise.all(fetchGrids)

    const bs1 = await load(origins[0], fetchedGrids)
    store.dispatch(setBrowsochronesBase(bs1))

    const bs2 = origins[1]
      ? await load(origins[1], fetchedGrids)
      : false
    if (bs2) {
      store.dispatch(setBrowsochronesComparison(bs2))
    }

    const qs = parseQueryString(window.location.search.split('?')[1])
    if (qs.start) {
      try {
        const {geocoder} = state
        const [startResults, endResults] = await Promise.all(['start', 'end']
          .filter((d) => !!qs[d])
          .map((d) => geocode({
            boundary: geocoder.boundary,
            focusLatlng: geocoder.focusLatlng,
            text: qs[d]
          })))
        if (startResults.features.length > 0) {
          const destination = endResults && endResults.features.length > 0
            ? { latlng: lonlng(endResults.features[0].geometry.coordinates), label: endResults.features[0].place_name }
            : {}
          store.dispatch(updateOrigin({
            browsochrones: { active: 'base', base: bs1, comparison: bs2 },
            label: startResults.features[0].place_name,
            destinationLatlng: destination.latlng,
            latlng: lonlng(startResults.features[0].geometry.coordinates),
            zoom: state.map.zoom
          }))
          store.dispatch(setDestination(destination))
        }
      } catch (e) {
        console.error(e)
      }
    }

    store.dispatch(addActionLogItem(messages.Strings.ApplicationReady))
  } catch (err) {
    store.dispatch(addActionLogItem(err.message))
  }
}

async function load (url, grids) {
  const bs = new Browsochrones()
  bs.originsUrl = url
  bs.grids = grids.map((g) => g.name)

  const fetches = [
    fetch(`${url}/query.json`).then((res) => res.json()),
    fetch(`${url}/stop_trees.dat`).then((res) => res.arrayBuffer()),
    fetch(`${url}/transitive.json`).then((res) => res.json())
  ]
  const [query, stopTrees, transitive] = await Promise.all(fetches)
  await bs.setQuery(query)
  await bs.setStopTrees(stopTrees)
  await bs.setTransitiveNetwork(transitive)

  const putGrids = grids.map((grid) => bs.putGrid(grid.name, grid))
  await Promise.all(putGrids)

  return bs
}
