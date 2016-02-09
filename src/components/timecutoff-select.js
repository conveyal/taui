import React, {PropTypes} from 'react'
import PureComponent from 'react-pure-render/component'
import {connect} from 'react-redux'

class TimeCutoffSelect extends PureComponent {
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
        {times.map(mode => <option value={mode.value} key={mode.value}>{mode.name}</option>)}
      </select>
    )
  }
}

function mapStateToProps (state, currentProps) {
  return state.timeCutoff
}

export default connect(mapStateToProps)(TimeCutoffSelect)
