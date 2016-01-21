import debounce from 'debounce'
import React, {Component, PropTypes} from 'react'
import Select from 'react-select'
import 'react-select/dist/react-select.min.css'

import {autocomplete} from './search'

function latlngToString (latlng) {
  return `${latlng.lng},${latlng.lat}`
}

export default class Geocoder extends Component {
  static propTypes = {
    apiKey: PropTypes.string,
    name: PropTypes.string,
    onChange: PropTypes.func,
    placeholder: PropTypes.string,
    value: PropTypes.string
  }

  constructor () {
    super()
    this.loadOptions = debounce(this.loadOptions, 500, true)
  }

  loadOptions (input) {
    return autocomplete({
      key: this.props.apiKey,
      focusLatlng: {lat: 39.7691, lng: -86.1570},
      text: input
    }).then(features => {
      return { options: features.map(feature => { return { label: feature.address, value: latlngToString(feature.latlng) } }) }
    })
  }

  render () {
    return (
      <Select.Async
        autoload={false}
        cacheAsyncResults={false}
        filterOptions={false}
        minimumInput={2}
        loadOptions={input => this.loadOptions(input)}
        {...this.props}
        />
    )
  }
}
