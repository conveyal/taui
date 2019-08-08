import lonlat from '@conveyal/lonlat'
import React from 'react'

import message from '../message'

import Geocoder from './geocoder'

function featureToLocation(f) {
  if (!f) return null
  return {
    label: f.place_name,
    position: lonlat(f.geometry.coordinates)
  }
}

export default function GeocodeSearch(p) {
  const onChangeStart = f => p.updateStart(featureToLocation(f))
  const onChangeEnd = f => p.updateEnd(featureToLocation(f))

  return (
    <>
      <Geocoder
        isClearable={false}
        geocode={p.geocode}
        onChange={onChangeStart}
        placeholder={message('Geocoding.StartPlaceholder')}
        reverseGeocode={p.reverseGeocode}
        value={p.start}
      />
      {p.start && (
        <Geocoder
          isClearable
          geocode={p.geocode}
          onChange={onChangeEnd}
          placeholder={message('Geocoding.StartPlaceholder')}
          reverseGeocode={p.reverseGeocode}
          value={p.end}
        />
      )}
    </>
  )
}
