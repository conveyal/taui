import {createAction} from 'redux-actions'

export const ADD_ACTION_LOG_ITEM = 'ADD_ACTION_LOG_ITEM'
export const addActionLogItem = createAction(ADD_ACTION_LOG_ITEM)

export const UPDATE_MAP_MARKER = 'UPDATE_MAP_MARKER'
export const updateMapMarker = createAction(UPDATE_MAP_MARKER)

export const UPDATE_MAP_STATE = 'UPDATE_MAP_STATE'
export const updateMapState = createAction(UPDATE_MAP_STATE)

/** export function singlePointRequest (analyst, point, graph, shapefile) {
  return function (dispatch) {
    return analyst.singlePointRequest(point, '9c0afffd53b5541289b2d1598e47daeb', '0579b6bd8e14ec69e4f21e96527a684b_376500e5f8ac23d1664902fbe2ffc364')
      .then(response => {
        dispatch(updateSinglePointLayer(analyst.updateSinglePointLayer(response.key)))
      })
  }
} */

export const UPDATE_SELECTED_DESTINATION = 'UPDATE_SELECTED_DESTINATION'
export const updateSelectedDestination = createAction(UPDATE_SELECTED_DESTINATION)
