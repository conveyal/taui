import React from 'react'
import {
  Route,
  Router
} from 'react-router'

import Indianapolis from './containers/indianapolis'

export default function ApplicationRouter ({history}) {
  return (
    <Router history={history}>
      <Route path='/' component={Indianapolis} />
    </Router>
  )
}
