import get from 'lodash/get'
import isEqual from 'lodash/isEqual'
import React, {Component} from 'react'
import Select from 'react-select/lib/Async'

import message from '../message'

const GEOLOCATE_VALUE = 'geolocate'

function featureToOption (feature) {
  return {
    data: feature,
    label: feature.place_name,
    value: feature.id
  }
}

export default class Geocoder extends Component {
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

  loadOptions = (input, callback) => {
    if (input && input.length < 4) return Promise.resolve([])
    return this.props.geocode(input)
      .then(features => features.map(featureToOption))
  }

  _onChange = (value) => {
    const p = this.props
    if (get(value, 'value') === GEOLOCATE_VALUE) {
      this.setState({
        value: {
          label: message('Geocoding.FindingLocation', 'Locating you...')
        }
      })
      window.navigator.geolocation.getCurrentPosition(position => {
        p.reverseGeocode(position.coords).then(feature => {
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
        p.onChange(null)
      } else {
        this.setState({value})
        p.onChange(value.data)
      }
    }
  }

  render () {
    const s = this.state
    return (
      <Select
        {...this.props} // isClearable, placeholder
        {...this.state} // options, value
        autoload={false}
        blurInputOnSelect
        cacheOptions={false}
        defaultOptions={s.options}
        filterOptions={false}
        ignoreAccents={false}
        ignoreCase={false}
        loadOptions={this.loadOptions}
        minimumInput={3}
        onBlurResetsInput={false}
        onChange={this._onChange}
        searchPromptText={message('Geocoding.PromptText')}
      />
    )
  }
}
