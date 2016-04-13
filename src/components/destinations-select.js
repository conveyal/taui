import React, {PropTypes} from 'react'
import PureComponent from 'react-pure-render/component'
import {connect} from 'react-redux'

import {updateSelectedDestination} from '../actions'

class DestinationsSelect extends PureComponent {
  static propTypes = {
    options: PropTypes.arrayOf(PropTypes.object).isRequired
  };

  render () {
    return (
      <select {...this.props}>
        {this.props.options.map((destination) => <option value={destination.value} key={destination.value}>{destination.label}</option>)}
      </select>
    )
  }
}

function mapStateToProps (state) {
  return {
    defaultValue: state.destinations.selected,
    options: state.destinations.sets
  }
}

function mapDispatchToProps (dispatch) {
  return {
    onChange: (event) => dispatch(updateSelectedDestination(event.target.value))
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(DestinationsSelect)
