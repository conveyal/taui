import React, {Component, PropTypes} from 'react'

import style from './style.css'

export default class Log extends Component {
  static propTypes = {
    children: PropTypes.node
  }

  render () {
    return <div className={style.log}>{this.props.children}</div>
  }
}
