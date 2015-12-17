import React, {Component, PropTypes} from 'react'
import {Provider} from 'react-redux'

import DevTools from '../../components/dev-tools'

export default class Root extends Component {
  static propTypes = {
    children: PropTypes.element.isRequired,
    store: PropTypes.object.isRequired
  }

  render () {
    const { store } = this.props
    return (
      <Provider store={store}>
        <div>
          {this.props.children}
          <DevTools />
        </div>
      </Provider>
    )
  }
}
