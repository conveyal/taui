import React, {Component, PropTypes} from 'react'

import style from './style.css'

export default class LogItem extends Component {
  static propTypes = {
    key: PropTypes.number,
    label: PropTypes.string.isRequired,
    text: PropTypes.string.isRequired,
    type: PropTypes.string
  }

  render () {
    const {text} = this.props
    return (
      <div className={style.logItem}>
        <span className={style.text}>* {text}</span>
      </div>
    )
  }
}
