import get from 'lodash/get'
import isEqual from 'lodash/isEqual'
import React from 'react'
import Select from 'react-select/async'

import message from '../message'

const GEOLOCATE_VALUE = 'geolocate'

const noOptionsMessage = ({inputValue}) =>
  inputValue && inputValue.length > 3
    ? 'No options found'
    : message('Geocoding.PromptText')

const reactSelectStyles = {
  control(provided, state) {
    const style = {...provided, borderWidth: 0, boxShadow: 'none'}
    if (state.menuIsOpen) {
      return {
        ...style,
        borderRadius: '4px 4px 0 0'
      }
    } else {
      return style
    }
  },
  menuList: p => ({...p, padding: 0}),
  menu: p => ({...p, borderRadius: '0 0 4px 4px'})
}

function reactSelectTheme(t, state) {
  return {
    ...t,
    colors: {
      ...t.colors,
      primary: '#fff'
    },
    spacing: {
      ...t.spacing,
      baseUnit: 6,
      menuGutter: 0
    }
  }
}

function featureToOption(feature) {
  return {
    data: feature,
    label: feature.place_name,
    value: feature.id
  }
}

export default class Geocoder extends React.PureComponent {
  options = {}

  state = {
    options: this.defaultOptions()
  }

  static getDerivedStateFromProps(props) {
    return {
      value: props.value
    }
  }

  defaultOptions() {
    const p = this.props
    const geolocateOptions =
      p.geolocate && 'geolocation' in navigator
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
    return [...geolocateOptions, ...(p.options || [])]
  }

  loadOptions = (input, callback) => {
    if (input && input.length < 4) return Promise.resolve([])
    return this.props
      .geocode(input)
      .then(features => features.map(featureToOption))
  }

  _onChange = value => {
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

  render() {
    const s = this.state
    return (
      <Select
        {...this.props} // isClearable, placeholder
        {...this.state} // options, value
        autoload={false}
        blurInputOnSelect
        cacheOptions={false}
        classNamePrefix='-select'
        defaultOptions={s.options}
        filterOptions={false}
        ignoreAccents={false}
        ignoreCase={false}
        loadOptions={this.loadOptions}
        minimumInput={3}
        noOptionsMessage={noOptionsMessage}
        onBlurResetsInput={false}
        onChange={this._onChange}
        searchPromptText={message('Geocoding.PromptText')}
        styles={reactSelectStyles}
        theme={reactSelectTheme}
      />
    )
  }
}
