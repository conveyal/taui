import get from 'lodash/get'
import isEqual from 'lodash/isEqual'
import throttle from 'lodash/throttle'
import React, {Component} from 'react'
import Select from 'react-select'

import message from '../message'

const USE_GEOLOCATE = true
const GEOLOCATE_VALUE = 'geolocate'
const RATE_LIMIT = 500

/**
 *
 */
export default class Geocoder extends Component {
  autocompleteCache = {}
  options = {}

  state = {
    options: this.defaultOptions(),
    value: this.props.value || null
  }

  constructor (props, context) {
    super(props, context)
    if (props.options) {
      this.cacheOptions(props.options)
    }
  }

  cacheOptions (options) {
    options.forEach(o => {
      this.options[o.value] = o.feature
    })
  }

  componentWillReceiveProps (nextProps) {
    if (!isEqual(nextProps.value, this.props.value)) {
      this.setState({value: nextProps.value})
    }
  }

  defaultOptions () {
    const p = this.props
    const geolocateOptions = p.geolocate && 'geolocation' in navigator
      ? [{
        label: message(
          'Geocoding.UseCurrentLocation',
          'Use Current Location'
        ),
        value: GEOLOCATE_VALUE
      }]
      : []
    return [...geolocateOptions, ...(p.options || [])]
  }

  featureToOption = (feature) => {
    return {
      feature,
      label: feature.place_name,
      value: feature.id
    }
  }

  loadOptions = throttle((input, callback) => {
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

      this.props.geocode(input, features => {
        const options = features.map(this.featureToOption)
        this.cacheOptions(options)
        this.autocompleteCache[input] = options
        callback(null, {options})
      })
    }
  }, RATE_LIMIT)

  _onChange = (value) => {
    const p = this.props
    if (get(value, 'value') === GEOLOCATE_VALUE) {
      this.setState({
        value: {
          label: message('Geocoding.FindingLocation', 'Locating you...')
        }
      })
      window.navigator.geolocation.getCurrentPosition(position => {
        p.reverseGeocode(position.coords, feature => {
          const value = this.featureToOption(feature)
          this.setState({value})
          p.onChange && p.onChange(value)
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
      p.onChange && p.onChange(value && this.options[value.value])
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
