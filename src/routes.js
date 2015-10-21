import createBrowserHistory from 'history/lib/createBrowserHistory'
import React, {Component} from 'react'
import {Router, Route} from 'react-router'

import Place from './place'

export default class Routes extends Component {
  render () {
    return (
      <Router history={createBrowserHistory()}>
        <Route path='/' component={Place} />
      </Router>
    )
  }
}
