// @flow
import {createAction} from 'redux-actions'

import {setKeyTo} from '../utils/hash'

const END = 'end'
const START = 'start'

export const setOrigin = (payload: any) => ({type: 'set origin', payload})
export const addActionLogItem = (item: string) => {
  const payload = typeof item === 'string' ? {text: item} : item

  return {
    type: 'add action log item',
    payload: {
      createdAt: new Date(),
      level: 'info',
      ...payload
    }
  }
}

export const setActiveOrigin = (name: string) =>
  ({type: 'set active origin', payload: name})

export const setEnd = (end: any) => {
  setKeyTo(END, end ? end.label : null)
  return {
    type: 'set end',
    payload: end
  }
}

export const setStart = (start: any) => {
  setKeyTo(START, start ? start.label : null)
  return {
    type: 'set start',
    payload: start
  }
}

export const clearEnd = createAction('clear end', () => setKeyTo(END, null))
export const clearStart = createAction('clear start', () =>
  setKeyTo(START, null)
)

export const setAccessibilityFor = createAction('set accessibility for')
export const setAccessibilityToEmptyFor = createAction(
  'set accessibility to empty for'
)
export const setAccessibilityToLoadingFor = createAction(
  'set accessibility to loading for'
)

export const setSelectedTimeCutoff = createAction('set selected time cutoff')
export const setDestinationDataFor = createAction('set destination data for')

export const showMapMarker = createAction('show map marker')
export const hideMapMarker = createAction('hide map marker')

export const clearIsochrone = createAction('clear isochrone')
export const setIsochrone = createAction('set isochrone')
export const setIsochroneFor = createAction('set isochrone for')

export const updateMap = createAction('update map')
