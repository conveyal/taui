import React, {Component, PropTypes} from 'react'
import {connect} from 'react-redux'

import {addActionLogItem, updateSelectedDestination} from '../actions'

class DestinationsSelect extends Component {
  static propTypes = {
    className: PropTypes.string,
    dispatch: PropTypes.func,
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
          dispatch(addActionLogItem(`Selected new destination set: ${e.target.value}`))
        }}
        value={selected.id}>
        {sets.map(destination => <option value={destination.id} key={destination.id}>{destination.name}</option>)}
      </select>
    )
  }
}

export default connect(s => s.destinations)(DestinationsSelect)
