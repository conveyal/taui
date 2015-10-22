import React, {Component, PropTypes} from 'react'

import style from './style.css'

export default class LogItem extends Component {
  static propTypes = {
    createdAt: PropTypes.string,
    key: PropTypes.number,
    level: PropTypes.string,
    text: PropTypes.string.isRequired
  }

  render () {
    const {createdAt, text} = this.props
    return (
      <div className={style.logItem}>
        <small className={style.createdAt}>{createdAt}</small>
        <span className={style.text}>{text}</span>
      </div>
    )
  }
}
