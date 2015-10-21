import React, {Component, PropTypes} from 'react'

import style from './style.css'

export default class Fullscreen extends Component {
  static propTypes = {
    children: PropTypes.any
  }

  render () {
    return <div className={style.fullscreen}>{this.props.children}</div>
  }
}
