import React, {Component, PropTypes} from 'react'
import {connect} from 'react-redux'

import {updateSelectedTransitScenario} from '../actions'
import log from '../log'

class TransitScenarioSelect extends Component {
  static propTypes = {
    className: PropTypes.string,
    dispatch: PropTypes.function,
    scenarios: PropTypes.arrayOf(PropTypes.object).isRequired,
    selected: PropTypes.object
  }

  render () {
    const {dispatch, className, scenarios, selected} = this.props

    return (
      <select
        className={className}
        onChange={e => {
          dispatch(updateSelectedTransitScenario(e.target.value))
          log(`Selected new transit mode: ${e.target.value}`)
        }}
        value={selected}>
        {scenarios.map(scenario => <option value={scenario.id} key={scenario.id}>{scenario.name}</option>)}
      </select>
    )
  }
}

export default connect(s => s.transitScenario)(TransitScenarioSelect)
