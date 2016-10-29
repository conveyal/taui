import React, {PropTypes} from 'react'
import {connect} from 'react-redux'

import DeepEqual from './deep-equal'

class TimeCutoffSelect extends DeepEqual {
  static propTypes = {
    className: PropTypes.string,
    onChange: PropTypes.func.isRequired,
    times: PropTypes.arrayOf(PropTypes.object).isRequired,
    selected: PropTypes.number
  };

  render () {
    const {className, onChange, times, selected} = this.props

    return (
      <select
        className={className}
        onChange={onChange}
        value={selected}>
        {times.map((mode) => <option value={mode.value} key={mode.value}>{mode.name}</option>)}
      </select>
    )
  }
}

function mapStateToProps (state, currentProps) {
  return state.timeCutoff
}

export default connect(mapStateToProps)(TimeCutoffSelect)
