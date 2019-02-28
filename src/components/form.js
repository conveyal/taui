import dynamic from 'next/dynamic'
import React from 'react'

import message from '../message'

import Geocoder from './geocoder'
import TimeCutoff from './time-cutoff'

// Not always used
const PoiSelect = dynamic(() => import('./poi-select'))

export default function Form (p) {
  const poi = p.pointsOfInterest || []
  return <>
    {p.searchPoiOnly
      ? <PoiSelect
        clearable={false}
        options={poi}
        onChange={p.updateStart}
        placeholder={message('Geocoding.StartPlaceholder')}
        value={p.start}
      />
      : <Geocoder
        clearable={false}
        geocode={p.geocode}
        onChange={p.onChangeStart}
        placeholder={message('Geocoding.StartPlaceholder')}
        reverseGeocode={p.reverseGeocode}
        value={p.start}
      />}
    {p.start &&
      <>
        {p.searchPoiOnly
          ? <PoiSelect
            options={poi}
            onChange={p.updateEnd}
            placeholder={message('Geocoding.EndPlaceholder')}
            value={p.end}
          />
          : <Geocoder
            geocode={p.geocode}
            onChange={p.onChangeEnd}
            placeholder={message('Geocoding.StartPlaceholder')}
            reverseGeocode={p.reverseGeocode}
            value={p.end}
          />}
        <TimeCutoff
          cutoff={p.selectedTimeCutoff}
          setCutoff={p.onTimeCutoffChange}
        />
      </>}
  </>
}
