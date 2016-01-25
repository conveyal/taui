import React, {Component, PropTypes} from 'react'
import {connect} from 'react-redux'

import {addActionLogItem, updateSelectedTimeCutoff} from '../actions'

class TimeCutoffSelect extends Component {
  static propTypes = {
    className: PropTypes.string,
    dispatch: PropTypes.func,
    times: PropTypes.arrayOf(PropTypes.object).isRequired,
    selected: PropTypes.number
  };

  render () {
    const {dispatch, className, times, selected} = this.props

    return (
      <select
        className={className}
        onChange={e => {
          dispatch(updateSelectedTimeCutoff(parseInt(e.target.value, 10)))
          dispatch(addActionLogItem(`Selected new time cutoff: ${e.target.value}`))
        }}
        value={selected}>
        {times.map(mode => <option value={mode.value} key={mode.value}>{mode.name}</option>)}
      </select>
    )
  }
}

export default connect(s => s.timeCutoff)(TimeCutoffSelect)
