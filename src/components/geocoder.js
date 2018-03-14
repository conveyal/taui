// @flow
import message from '@conveyal/woonerf/message'
import isEqual from 'lodash/isEqual'
import throttle from 'lodash/throttle'
import React, {Component} from 'react'
import Select from 'react-select'

import type {Location, MapboxFeature, PointsOfInterest} from '../types'

const USE_GEOLOCATE = true
const GEOLOCATE_VALUE = 'geolocate'
const RATE_LIMIT = 500

type ReactSelectOption = {
  feature: MapboxFeature,
  label: string,
  value: string
}

type Props = {
  placeholder: string,
  pointsOfInterest: PointsOfInterest,
  value: null | Location,

  geocode: (string, Function) => void,
  onChange: any => void,
  reverseGeocode: (string, Function) => void
}

function featureToLabel (feature: MapboxFeature) {
  return feature.place_name
}

function featureToValue (feature: MapboxFeature) {
  return feature.id
}

export default class Geocoder extends Component {
  props: Props

  autocompleteCache = {}
  options = {}

  state = {
    options: this.defaultOptions(),
    value: this.props.value || null
  }

  constructor (props, context) {
    super(props, context)
    if (props.pointsOfInterest) {
      this.cacheOptions(props.pointsOfInterest)
    }
  }

  cacheOptions (options: ReactSelectOption[]) {
    options.forEach(o => {
      this.options[o.value] = o.feature
    })
  }

  componentWillReceiveProps (nextProps: Props) {
    if (!isEqual(nextProps.value, this.props.value)) {
      this.setState({value: nextProps.value})
    }
  }

  defaultOptions () {
    const geolocateOptions = this.props.geolocate && 'geolocation' in navigator
      ? [
        {
          label: message(
              'Geocoding.UseCurrentLocation',
              'Use Current Location'
            ),
          value: GEOLOCATE_VALUE
        }
      ]
      : []
    return [...geolocateOptions, ...this.props.pointsOfInterest]
  }

  featureToOption = (feature: MapboxFeature) => {
    return {
      feature,
      label: featureToLabel(feature),
      value: featureToValue(feature)
    }
  }

  loadOptions = throttle((input: string, callback: Function) => {
    const {geocode} = this.props
    if (!input) {
      if (USE_GEOLOCATE && 'geolocation' in navigator) {
        callback(null, {
          options: this.defaultOptions()
        })
      } else {
        callback(null)
      }
    } else {
      // check if autocomplete query has been made before
      const cachedOptions = this.autocompleteCache[input]
      if (cachedOptions) {
        return callback(null, {options: cachedOptions})
      }

      geocode(input, features => {
        const options = features.map(this.featureToOption)
        this.cacheOptions(options)
        this.autocompleteCache[input] = options
        callback(null, {options})
      })
    }
  }, RATE_LIMIT)

  _onChange = (value?: ReactSelectOption) => {
    const {onChange, reverseGeocode} = this.props
    if (value && value.value === GEOLOCATE_VALUE) {
      this.setState({
        ...this.state,
        value: {
          label: message('Geocoding.FindingLocation', 'Locating you...')
        }
      })
      window.navigator.geolocation.getCurrentPosition(position => {
        reverseGeocode(position.coords, feature => {
          const value = this.featureToOption(feature)
          this.setState({
            ...this.state,
            value
          })
          onChange && onChange(value)
        })
      })
    } else {
      if (!value) {
        this.setState({
          options: this.defaultOptions(),
          value
        })
      } else {
        this.setState({value})
      }
      this.props.onChange &&
        this.props.onChange(value && this.options[value.value])
    }
  }

  render () {
    return (
      <Select.Async
        autoBlur
        autoload={false}
        cache={false}
        filterOptions={false}
        ignoreAccents={false}
        ignoreCase={false}
        loadOptions={this.loadOptions}
        minimumInput={3}
        onBlurResetsInput={false}
        onChange={this._onChange}
        options={this.state.options}
        placeholder={this.props.placeholder}
        searchPromptText={message('Geocoding.PromptText')}
        value={this.state.value}
      />
    )
  }
}
