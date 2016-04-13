import Browsochrones from 'browsochrones'
import fetch from 'isomorphic-fetch'

import {addActionLogItem, setBrowsochronesBase, setBrowsochronesComparison, updateOrigin} from '../actions'

export default async function initialize (store) {
  const state = store.getState()
  const {grids, gridsUrl, origins} = state.browsochrones
  const {latlng} = state.mapMarkers.origin
  const {zoom} = state.map
  try {
    const fetchedGrids = await fetchGrids(gridsUrl, grids)
    const bs1 = await load(origins[0], fetchedGrids)
    const bs2 = await load(origins[1], fetchedGrids)

    store.dispatch(setBrowsochronesBase(bs1))
    store.dispatch(updateOrigin({
      browsochrones: {
        active: 'base',
        base: bs1,
        comparison: bs2
      },
      latlng,
      timeCutoff: 60,
      zoom
    }))

    if (bs2) {
      store.dispatch(setBrowsochronesComparison(bs2))
    }

    store.dispatch(addActionLogItem('Application is ready!'))
  } catch (err) {
    store.dispatch(addActionLogItem(err.message))
  }
}

async function load (url, grids) {
  const bs = new Browsochrones()
  bs.originsUrl = url
  bs.grids = grids.map((g) => g.name)

  await Promise.all([
    setQuery(bs, url),
    setStopTrees(bs, url),
    setTransitiveNetwork(bs, url)
  ])

  await Promise.all(grids.map((grid) => bs.putGrid(grid.name, grid)))
  return bs
}

async function setQuery (bs, url) {
  const response = await fetch(`${url}/query.json`)
  const query = await response.json()
  await bs.setQuery(query)
}

async function setStopTrees (bs, url) {
  const response = await fetch(`${url}/stop_trees.dat`)
  const stopTrees = await response.arrayBuffer()
  await bs.setStopTrees(stopTrees)
}

async function setTransitiveNetwork (bs, url) {
  const response = await fetch(`${url}/transitive.json`)
  const transitive = await response.json()
  await bs.setTransitiveNetwork(transitive)
}

async function fetchGrids (url, grids) {
  return await Promise.all(grids.map((name) => fetchGrid(url, name)))
}

async function fetchGrid (url, name) {
  const response = await fetch(`${url}/${name}.grid`)
  const grid = await response.arrayBuffer()
  grid.name = name
  return grid
}
