// @flow
import {handleActions} from 'redux-actions'

export default handleActions(
  {
    'set start' (state, {payload}) {
      return {
        ...state,
        start: {
          label: payload.label,
          value: payload.latlng
            ? `${payload.latlng.lng},${payload.latlng.lat}`
            : false
        }
      }
    },
    'set start label' (state, {payload}) {
      if (payload) {
        return {
          ...state,
          start: {
            ...state.start,
            label: payload
          }
        }
      } else {
        return {
          ...state,
          start: null
        }
      }
    },
    'set end' (state, {payload}) {
      return {
        ...state,
        end: {
          label: payload.label,
          value: payload.latlng
            ? `${payload.latlng.lng},${payload.latlng.lat}`
            : false
        }
      }
    },
    'set end label' (state, {payload}) {
      if (payload) {
        return {
          ...state,
          end: {
            ...state.end,
            label: payload
          }
        }
      } else {
        return {
          ...state,
          end: null
        }
      }
    },
    'clear start' (state) {
      return {
        ...state,
        start: null
      }
    },
    'clear end' (state) {
      return {
        ...state,
        end: null
      }
    }
  },
  {
    start: null,
    end: null
  }
)
