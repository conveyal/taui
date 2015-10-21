export const ADD_ACTION_LOG_ITEM = 'ADD_ACTION_LOG_ITEM'

export function addActionLogItem (payload) {
  return {
    type: ADD_ACTION_LOG_ITEM,
    payload
  }
}

export const UPDATE_MAP_MARKER = 'UPDATE_MAP_MARKER'

export function updateMapMarker (payload) {
  return {
    type: UPDATE_MAP_MARKER,
    payload
  }
}

export const UPDATE_MAP_STATE = 'UPDATE_MAP_STATE'

export function updateMapState (payload) {
  return {
    type: UPDATE_MAP_STATE,
    payload
  }
}

export const UPDATE_SELECTED_DESTINATION = 'UPDATE_SELECTED_DESTINATION'

export function updateSelectedDestination (payload) {
  return {
    type: UPDATE_SELECTED_DESTINATION,
    payload
  }
}
