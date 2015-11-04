import React, {Component, PropTypes} from 'react'
import {connect} from 'react-redux'

import {updateSelectedDestination} from '../actions'
import log from '../log'

class DestinationsSelect extends Component {
  static propTypes = {
    className: PropTypes.string,
    dispatch: PropTypes.function,
    selected: PropTypes.object,
    sets: PropTypes.arrayOf(PropTypes.object).isRequired
  }

  render () {
    const {dispatch, className, selected, sets} = this.props

    return (
      <select
        className={className}
        onChange={e => {
          dispatch(updateSelectedDestination(e.target.value))
          log(`Selected new destination set: ${e.target.value}`)
        }}
        value={selected.id}>
        {sets.map(destination => <option value={destination.id} key={destination.id}>{destination.name}</option>)}
      </select>
    )
  }
}

export default connect(s => s.destinations)(DestinationsSelect)
