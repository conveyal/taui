import Browsochrones from 'browsochrones'
import fetch from 'isomorphic-fetch'
import messages from './messages'

import {addActionLogItem, setBrowsochronesBase, setBrowsochronesComparison} from '../actions'

export default async function initialize (store) {
  const state = store.getState()
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

    if (origins[1]) {
      const bs2 = await load(origins[1], fetchedGrids)
      store.dispatch(setBrowsochronesComparison(bs2))
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
