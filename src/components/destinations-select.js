import React, {Component, PropTypes} from 'react'
import {connect} from 'react-redux'

import {updateSelectedDestination} from '../actions'

class DestinationsSelect extends Component {
  static propTypes = {
    className: PropTypes.string,
    dispatch: PropTypes.func,
    selected: PropTypes.string,
    sets: PropTypes.arrayOf(PropTypes.object).isRequired
  }

  render () {
    const {dispatch, className, selected, sets} = this.props

    return (
      <select
        className={className}
        onChange={e => dispatch(updateSelectedDestination(e.target.value))}
        defaultValue={selected}
        >
        {sets.map(destination => <option value={destination.value} key={destination.value}>{destination.label}</option>)}
      </select>
    )
  }
}

export default connect(s => s.destinations)(DestinationsSelect)
