import React, {Component, PropTypes} from 'react'
import {connect} from 'react-redux'

import {updateSelectedTransitMode} from '../actions'
import log from '../log'

class TransitModeSelect extends Component {
  static propTypes = {
    className: PropTypes.string,
    dispatch: PropTypes.function,
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
          log(`Selected new transit mode: ${e.target.value}`)
        }}
        value={selected}>
        {modes.map(mode => <option value={mode} key={mode}>{mode}</option>)}
      </select>
    )
  }
}

export default connect(s => s.transitMode)(TransitModeSelect)
