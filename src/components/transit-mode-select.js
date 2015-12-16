import React, {Component, PropTypes} from 'react'
import {connect} from 'react-redux'

import {addActionLogItem, updateSelectedTransitMode} from '../actions'

class TransitModeSelect extends Component {
  static propTypes = {
    className: PropTypes.string,
    dispatch: PropTypes.func,
    modes: PropTypes.arrayOf(PropTypes.object).isRequired,
    selected: PropTypes.object
  }

  render () {
    const {dispatch, className, modes, selected} = this.props

    return (
      <select
        className={className}
        onChange={e => {
          dispatch(updateSelectedTransitMode(e.target.value))
          dispatch(addActionLogItem(`Selected new transit mode: ${e.target.value}`))
        }}
        value={selected.id}>
        {modes.map(mode => <option value={mode.id} key={mode.id}>{mode.name}</option>)}
      </select>
    )
  }
}

export default connect(s => s.transitMode)(TransitModeSelect)
