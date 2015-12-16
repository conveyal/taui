import React, {Component, PropTypes} from 'react'
import {connect} from 'react-redux'

import {addActionLogItem, updateSelectedProject} from '../actions'

class ProjectSelect extends Component {
  static propTypes = {
    className: PropTypes.string,
    dispatch: PropTypes.function,
    projects: PropTypes.arrayOf(PropTypes.object).isRequired,
    selected: PropTypes.object
  }

  render () {
    const {className, dispatch, projects, selected} = this.props

    return (
      <select
        className={className}
        onChange={e => {
          dispatch(updateSelectedProject(e.target.value))
          dispatch(addActionLogItem(`Selected new project: ${e.target.value}`))
        }}
        value={selected.id}>
        {projects.map(project => <option value={project.id} key={project.id}>{project.name}</option>)}
      </select>
    )
  }
}

export default connect(s => s.project)(ProjectSelect)
