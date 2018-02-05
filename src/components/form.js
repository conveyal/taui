// @flow
import React from 'react'
import Geocoder from 'react-select-geocoder'
import messages from '../utils/messages'

import type {
  GeocoderBoundary,
  InputEvent,
  LatLng,
  Option,
  PointFeature,
  PointsOfInterest
} from '../types'

type Props = {
  boundary: GeocoderBoundary,
  end: null | Option,
  focusLatlng: LatLng,
  onChangeEnd: (PointFeature) => void,
  onChangeStart: (PointFeature) => void,
  onTimeCutoffChange: (InputEvent) => void,
  pointsOfInterest: PointsOfInterest,
  selectedTimeCutoff: number,
  start: null | Option
}

const setGeocoderOptionsToPois = (
  pointsOfInterest,
  currentValue
) => geocoder => {
  if (
    geocoder &&
    (!currentValue || !currentValue.value || currentValue.value.length === 0)
  ) {
    pointsOfInterest.forEach(poi => {
      geocoder.options[poi.value] = poi.feature
    })
  }
}

export default ({
  boundary,
  end,
  focusLatlng,
  onChangeEnd,
  onChangeStart,
  onTimeCutoffChange,
  pointsOfInterest,
  selectedTimeCutoff,
  start
}: Props) => (
  <div>
    <div className='heading'>
      {messages.Geocoding.StartTitle}
    </div>
    <div className='Geocoder'>
      <Geocoder
        apiKey={process.env.MAPZEN_SEARCH_KEY}
        boundary={boundary}
        focusLatlng={focusLatlng}
        name='start-address'
        onChange={onChangeStart}
        options={
          start && start.value && start.value.length > 0 ? [] : pointsOfInterest
        }
        ref={setGeocoderOptionsToPois(pointsOfInterest, start)}
        placeholder={messages.Geocoding.StartPlaceholder}
        searchPromptText={messages.Geocoding.PromptText}
        value={start}
      />
    </div>
    {start &&
      <div>
        <div className='heading'>
          {messages.Geocoding.EndTitle}
        </div>
        <div className='Geocoder'>
          <Geocoder
            apiKey={process.env.MAPZEN_SEARCH_KEY}
            boundary={boundary}
            focusLatlng={focusLatlng}
            name='end-address'
            onChange={onChangeEnd}
            options={
              end && end.value && end.value.length > 0 ? [] : pointsOfInterest
            }
            placeholder={messages.Geocoding.EndPlaceholder}
            ref={setGeocoderOptionsToPois(pointsOfInterest, end)}
            searchPromptText={messages.Geocoding.PromptText}
            value={end}
          />
        </div>
        <div className='heading'>
          {messages.Strings.HighlightAreaAccessibleWithin}
        </div>
        <div className='TimeCutoff'>
          <div className='Time'>
            {selectedTimeCutoff} {messages.Units.Minutes}
          </div>
          <input
            defaultValue={selectedTimeCutoff}
            onChange={onTimeCutoffChange}
            type='range'
            min={10}
            max={120}
            step={5}
          />
        </div>
      </div>}
  </div>
)
