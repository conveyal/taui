// @flow
import lonlat from '@conveyal/lonlat'
import message from '@conveyal/woonerf/message'
import memoize from 'lodash/memoize'
import React from 'react'
import Select from 'react-virtualized-select'
import createFilterOptions from 'react-select-fast-filter-options'

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

const cfo = memoize(o => createFilterOptions({options: o}))

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

  _selectPoiStart = (option?: ReactSelectOption) =>
    this.props.updateStart(option ? {
      label: option.label,
      position: lonlat(option.feature.geometry.coordinates)
    } : null)

  _selectPoiEnd = (option?: ReactSelectOption) =>
    this.props.updateEnd(option ? {
      label: option.label,
      position: lonlat(option.feature.geometry.coordinates)
    } : null)

  render () {
    const p = this.props
    const poi = p.pointsOfInterest || []
    const filterPoi = cfo(poi) // memoized filtering function
    const showPoiSelect = poi.length > 0
    return (
      <div>
        {showPoiSelect
          ? <Select
            filterOptions={filterPoi}
            options={poi}
            onChange={this._selectPoiStart}
            placeholder={message('Geocoding.StartPlaceholder')}
            value={p.start}
          />
          : <Geocoder
            geocode={p.geocode}
            onChange={p.onChangeStart}
            placeholder={message('Geocoding.StartPlaceholder')}
            reverseGeocode={p.reverseGeocode}
            value={p.start}
          />}
        {p.start &&
          <div>
            {showPoiSelect
              ? <Select
                filterOptions={cfo(poi)}
                options={poi}
                onChange={this._selectPoiEnd}
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
            <div className='heading'>
              {message('Strings.HighlightAreaAccessibleWithin')}
              {/* DISABLED: VectorGrid is incompatible with animation. !this.state.animating &&
                <a className='pull-right' onClick={this._animateTimeCutoff}>
                  <Icon type='play' />
                </a> */}
            </div>
            <div className='TimeCutoff'>
              <div className='Time'>
                {p.selectedTimeCutoff} {message('Units.Minutes')}
              </div>
              <input
                disabled={this.state.animating}
                onChange={p.onTimeCutoffChange}
                type='range'
                min={10}
                max={120}
                step={1}
                value={p.selectedTimeCutoff}
              />
            </div>
          </div>}
      </div>
    )
  }
}
