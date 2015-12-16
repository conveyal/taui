import React, {Component, PropTypes} from 'react'
import {Provider} from 'react-redux'

export default class Root extends Component {
  static propTypes = {
    children: PropTypes.element.isRequired,
    store: PropTypes.object.isRequired
  }

  render () {
    const { children, store } = this.props
    return <Provider store={store}>{children}</Provider>
  }
}
