// @flow
import message from '@conveyal/woonerf/message'
import React from 'react'
import Geocoder from 'react-select-geocoder'

import type {
  GeocoderBoundary,
  InputEvent,
  LatLng,
  Location,
  PointFeature,
  PointsOfInterest
} from '../types'

type Props = {
  boundary: GeocoderBoundary,
  end: null | Location,
  focusLatlng: LatLng,
  onChangeEnd: (PointFeature) => void,
  onChangeStart: (PointFeature) => void,
  onTimeCutoffChange: (InputEvent) => void,
  pointsOfInterest: PointsOfInterest,
  selectedTimeCutoff: number,
  start: null | Location
}

const EMPTY_ARRAY = []

export default class Form extends React.PureComponent {
  props: Props

  /**
   * Pass this as the `ref` function in the Geocoder so that when it is rendered
   * it gets called. If there is no search term in the Geocoder it autopopulates
   * the results with the pointsOfInterest data.
   */
  _setGeocoderOptionsToPois = (geocoder: any) => {
    if (geocoder && !geocoder.value) {
      this.props.pointsOfInterest.forEach(poi => {
        geocoder.options[poi.value] = poi.feature
      })
    }
  }

  render () {
    const {
      boundary,
      end,
      focusLatlng,
      onChangeEnd,
      onChangeStart,
      onTimeCutoffChange,
      pointsOfInterest,
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
            apiKey={process.env.MAPZEN_SEARCH_KEY}
            boundary={boundary}
            focusLatlng={focusLatlng}
            name='start-address'
            onChange={onChangeStart}
            options={
              start && start.label && start.label.length > 0 ? EMPTY_ARRAY : pointsOfInterest
            }
            ref={this._setGeocoderOptionsToPois}
            placeholder={message('Geocoding.StartPlaceholder')}
            searchPromptText={message('Geocoding.PromptText')}
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
                apiKey={process.env.MAPZEN_SEARCH_KEY}
                boundary={boundary}
                focusLatlng={focusLatlng}
                name='end-address'
                onChange={onChangeEnd}
                options={
                  end && end.label && end.label.length > 0 ? EMPTY_ARRAY : pointsOfInterest
                }
                placeholder={message('Geocoding.EndPlaceholder')}
                ref={this._setGeocoderOptionsToPois}
                searchPromptText={message('Geocoding.PromptText')}
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
