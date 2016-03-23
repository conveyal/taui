import Browsochrones from 'browsochrones'
import fetch from 'isomorphic-fetch'

import {addActionLogItem, setBrowsochronesBase, setBrowsochronesComparison, updateOrigin} from '../actions'

export default function initialize (store) {
  const state = store.getState()
  const {grids, gridsUrl, origins} = state.browsochrones
  const {latlng} = state.mapMarkers.origin
  const {zoom} = state.map
  fetchGrids(gridsUrl, grids)
    .then(grids => Promise.all(origins.map(origin => load(origin, grids))))
    .then(([bs1, bs2]) => {
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
    }).catch(err => {
      store.dispatch(addActionLogItem(err.message))
    })
}

function load (url, grids) {
  const bs = new Browsochrones()
  bs.originsUrl = url
  bs.grids = grids

  return Promise.all([
    fetch(`${url}/query.json`)
      .then(res => res.json())
      .then(query => bs.setQuery(query)),
    fetch(`${url}/stop_trees.dat`)
      .then(res => res.arrayBuffer())
      .then(st => bs.setStopTrees(st)),
    fetch(`${url}/transitive.json`)
      .then(res => res.json())
      .then(tn => bs.setTransitiveNetwork(tn))
  ]).then(() => {
    return bs
  })
}

function fetchGrids (url, grids) {
  const gridMap = {}
  return Promise.all(grids.map(name => {
    return fetch(`${url}/${name}.grid`)
      .then(res => res.arrayBuffer())
      .then(grid => {
        gridMap[name] = grid
      })
  })).then(() => gridMap)
}
