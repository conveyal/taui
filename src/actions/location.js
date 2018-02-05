// @flow
import {ACCESSIBILITY_IS_LOADING} from '../constants'

import {
  addActionLogItem,
  clearIsochrone,
  setEnd,
  setOrigin,
  setStart
} from './'
import {fetchDataForLonLat} from './data'
import {reverse as reverseGeocode} from './geocode'

import type {Location} from '../types'

/**
 * Update the start
 */
export const updateStart = (value: Location) =>
  (dispatch: Dispatch, getState: any) => {
    const state = getState()
    const origins = state.data.origins

    dispatch([
      clearIsochrone(),
      ...origins.map(o =>
        setOrigin({name: o.name, accessibility: ACCESSIBILITY_IS_LOADING}))
    ])

    if (value.label) {
      dispatch([
        addActionLogItem(`Updating start to ${value.label}`),
        setStart(value)
      ])
    } else if (value.position) {
      dispatch(reverseGeocode(value.position, (feature) => {
        dispatch(setStart({
          position: value.position,
          label: feature.place_name
        }))
      }))
    }

    dispatch(fetchDataForLonLat(value.position))
  }

/**
 * Update the end point
 */
export const updateEnd = (value: Location) =>
  (dispatch: Dispatch, getState: any) => {
    if (value.label) {
      dispatch([
        addActionLogItem(`Updating end point to ${value.label}`),
        setEnd(value)
      ])
    } else {
      dispatch(reverseGeocode(value.position, (feature) => {
        dispatch(setEnd({
          position: value.position,
          label: feature.place_name
        }))
      }))
    }
  }
