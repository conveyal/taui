// @flow
import Icon from '@conveyal/woonerf/components/icon'
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

  state = {
    animating: false
  }

  _animateTimeCutoff = () => {
    this.setState({animating: true})
    this._animateTo(0)
  }

  _animateTo (cutoff: number) {
    this.props.onTimeCutoffChange({currentTarget: {value: cutoff}})
    if (cutoff < 120) setTimeout(() => this._animateTo(cutoff + 1), 50)
    else this.setState({animating: false})
  }

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
        <Geocoder
          geocode={geocode}
          onChange={onChangeStart}
          placeholder={message('Geocoding.StartPlaceholder')}
          pointsOfInterest={pointsOfInterest}
          reverseGeocode={reverseGeocode}
          value={start}
        />
        {start &&
          <div>
            <Geocoder
              geocode={geocode}
              onChange={onChangeEnd}
              placeholder={message('Geocoding.EndPlaceholder')}
              pointsOfInterest={pointsOfInterest}
              reverseGeocode={reverseGeocode}
              value={end}
            />
            <div className='heading'>
              {message('Strings.HighlightAreaAccessibleWithin')}
              <a className='pull-right' onClick={this._animateTimeCutoff}>
                <Icon type='play' />
              </a>
            </div>
            <div className='TimeCutoff'>
              <div className='Time'>
                {selectedTimeCutoff} {message('Units.Minutes')}
              </div>
              <input
                disabled={this.state.animating}
                onChange={onTimeCutoffChange}
                type='range'
                min={10}
                max={120}
                step={1}
                value={selectedTimeCutoff}
              />
            </div>
          </div>}
      </div>
    )
  }
}
