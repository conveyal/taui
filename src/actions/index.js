import {createAction} from 'redux-actions'

export const ADD_ACTION_LOG_ITEM = 'ADD_ACTION_LOG_ITEM'
export const addActionLogItem = createAction(ADD_ACTION_LOG_ITEM)

export const UPDATE_MAP_MARKER = 'UPDATE_MAP_MARKER'
export const updateMapMarker = createAction(UPDATE_MAP_MARKER)

export const UPDATE_MAP = 'UPDATE_MAP'
export const updateMap = createAction(UPDATE_MAP)

export const UPDATE_SELECTED_DESTINATION = 'UPDATE_SELECTED_DESTINATION'
export const updateSelectedDestination = createAction(UPDATE_SELECTED_DESTINATION)

export const UPDATE_SELECTED_TRANSIT_MODE = 'UPDATE_SELECTED_TRANSIT_MODE'
export const updateSelectedTransitMode = createAction(UPDATE_SELECTED_TRANSIT_MODE)
