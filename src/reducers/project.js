import {handleActions} from 'redux-actions'

const initialProjects = {
  projects: [],
  selected: {}
}

const projectsReducers = handleActions({
  UPDATE_SELECTED_PROJECT: (state, action) => {
    return Object.assign({}, state, { selected: action.payload })
  }
}, initialProjects)

export default projectsReducers
