import lonlat from '@conveyal/lonlat'
import React from 'react'

import message from '../message'

import Geocoder from './geocoder'

function featureToLocation (f) {
  if (!f) return null
  return {
    label: feature.place_name,
    position: lonlat(feature.geometry.coordinates)
  }
}

export default function GeocodeSearch (p) {
  return <>
    <Geocoder
      clearable={false}
      geocode={p.geocode}
      onChange={f => p.updateStart(featureToLocation(f))}
      placeholder={message('Geocoding.StartPlaceholder')}
      reverseGeocode={p.reverseGeocode}
      value={p.start}
    />
    {p.start &&
      <Geocoder
        geocode={p.geocode}
        onChange={f => p.updateEnd(featureToLocation(f))}
        placeholder={message('Geocoding.StartPlaceholder')}
        reverseGeocode={p.reverseGeocode}
        value={p.end}
      />}
  </>
}
