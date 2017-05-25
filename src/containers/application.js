import {connect} from 'react-redux'

import * as actions from '../actions'
import initializeBrowsochrones from '../actions/browsochrones'
import Application from '../components/application'

export default connect(state => state, {...actions, initializeBrowsochrones})(
  Application
)
