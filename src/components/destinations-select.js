import React, {Component, PropTypes} from 'react'
import {connect} from 'react-redux'

class DestinationsSelect extends Component {
  static propTypes = {
    className: PropTypes.string,
    dispatch: PropTypes.func,
    onChange: PropTypes.func.isRequired,
    selected: PropTypes.string,
    sets: PropTypes.arrayOf(PropTypes.object).isRequired
  };

  render () {
    const {className, onChange, selected, sets} = this.props

    return (
      <select
        className={className}
        onChange={onChange}
        defaultValue={selected}
        >
        {sets.map(destination => <option value={destination.value} key={destination.value}>{destination.label}</option>)}
      </select>
    )
  }
}

export default connect(s => s.destinations)(DestinationsSelect)
