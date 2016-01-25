import React, {Component, PropTypes} from 'react'
import Select from 'react-select'
import 'react-select/dist/react-select.min.css'
import throttle from 'throttleit'

import ll from '../../ll'
import {autocomplete} from './search'

export default class Geocoder extends Component {
  static propTypes = {
    apiKey: PropTypes.string.isRequired,
    defaultValue: PropTypes.object,
    name: PropTypes.string,
    onChange: PropTypes.func.isRequired,
    placeholder: PropTypes.string
  };

  state = {
    value: null
  };

  constructor (props) {
    super(props)
    this.loadOptions = throttle(this.loadOptions, 500)
  }

  componentWillReceiveProps (nextProps) {
    if (this.props.defaultValue !== nextProps.defaultValue) {
      this.setState({ value: nextProps.defaultValue })
    }
  }

  loadOptions (input) {
    return autocomplete({
      key: this.props.apiKey,
      focusLatlng: {lat: 39.7691, lng: -86.1570},
      text: input
    }).then(features => {
      return {options: features.map(feature => { return {label: feature.address, value: ll.toString(feature.latlng)} })}
    })
  }

  render () {
    return (
      <Select.Async
        autoload={false}
        cacheAsyncResults={false}
        filterOptions={false}
        loadOptions={input => this.loadOptions(input)}
        minimumInput={3}
        name={this.props.name}
        onChange={input => {
          if (!input) this.setState({value: null})
          else this.setState({value: input})

          this.props.onChange(input)
        }}
        placeholder={this.props.placeholder}
        value={this.state.value}
        />
    )
  }
}
