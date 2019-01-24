import get from 'lodash/get'

import {ACCESSIBILITY_IS_LOADING, ACCESSIBILITY_IS_EMPTY} from '../constants'
import * as NetworkAPI from '../services/network'

import {logError} from './log'

export const setNetwork = (payload) => ({type: 'set network', payload})
export const setActiveNetwork = (payload) => ({
  type: 'set active network',
  payload
})

export const setNetworksAccessibilityTo = (value) => (dispatch, getState) => {
  const state = getState()
  dispatch(
    state.data.networks.map(network =>
      setNetwork({
        ...network,
        accessibility: value,
        paths: null,
        targets: null,
        travelTimeSurface: null
      })
    )
  )
}
export const setNetworksToLoading = () =>
  setNetworksAccessibilityTo(ACCESSIBILITY_IS_LOADING)
export const setNetworksToEmpty = () =>
  setNetworksAccessibilityTo(ACCESSIBILITY_IS_EMPTY)

export const fetchAllTimesAndPathsForCoordinate = (coordinate) => (
  dispatch,
  getState
) => {
  const state = getState()
  const networks = get(state, 'data.networks')

  return Promise.all(networks.map(network => {
    // Reset the network
    dispatch(setNetwork({
      ...network,
      paths: null,
      pathsPerTarget: null,
      targets: null,
      travelTimeSurface: null
    }))

    return NetworkAPI.fetchDataAtCoordinate(network, coordinate)
      .then(([travelTimeSurface, pathsData]) => {
        dispatch(setNetwork({
          name: network.name,
          travelTimeSurface,
          ...pathsData
        }))
      })
      .catch(error => {
        console.error(error)
        dispatch(logError(error.status === 400
          ? 'Data not available for these coordinates.'
          : 'Error while retrieving data for these coordinates.'))
      })
  }))
}
