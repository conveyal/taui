import isEqual from 'lodash.isequal'
import {Component} from 'react'

function shouldComponentUpdate (newProps, newState) {
  return !isEqual(newProps, this.props) || !isEqual(newState, this.state)
}

export default class DeepEqual extends Component {}
DeepEqual.prototype.shouldComponentUpdate = shouldComponentUpdate

export function pure (Component) {
  Component.prototype.shouldComponentUpdate = shouldComponentUpdate
  return Component
}
