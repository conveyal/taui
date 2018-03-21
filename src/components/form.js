// @flow
import message from '@conveyal/woonerf/message'
import React from 'react'

import type {
  InputEvent,
  Location,
  MapboxFeature,
  PointsOfInterest
} from '../types'

import Geocoder from './geocoder'

type Props = {
  end: null | Location,
  geocode: (string, Function) => void,
  onChangeEnd: MapboxFeature => void,
  onChangeStart: MapboxFeature => void,
  onTimeCutoffChange: InputEvent => void,
  pointsOfInterest: PointsOfInterest,
  reverseGeocode: (string, Function) => void,
  selectedTimeCutoff: number,
  start: null | Location
}

export default class Form extends React.PureComponent {
  props: Props

  render () {
    const {
      end,
      geocode,
      onChangeEnd,
      onChangeStart,
      onTimeCutoffChange,
      pointsOfInterest,
      reverseGeocode,
      selectedTimeCutoff,
      start
    } = this.props
    return (
      <div>
        <div className='heading'>
          {message('Geocoding.StartTitle')}
        </div>
        <div className='Geocoder'>
          <Geocoder
            geocode={geocode}
            onChange={onChangeStart}
            placeholder={message('Geocoding.StartPlaceholder')}
            pointsOfInterest={pointsOfInterest}
            reverseGeocode={reverseGeocode}
            value={start}
          />
        </div>
        {start &&
          <div>
            <div className='heading'>
              {message('Geocoding.EndTitle')}
            </div>
            <div className='Geocoder'>
              <Geocoder
                geocode={geocode}
                onChange={onChangeEnd}
                placeholder={message('Geocoding.EndPlaceholder')}
                pointsOfInterest={pointsOfInterest}
                reverseGeocode={reverseGeocode}
                value={end}
              />
            </div>
            <div className='heading'>
              {message('Strings.HighlightAreaAccessibleWithin')}
            </div>
            <div className='TimeCutoff'>
              <div className='Time'>
                {selectedTimeCutoff} {message('Units.Minutes')}
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
  }
}
