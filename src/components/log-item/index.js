import React, {Component, PropTypes} from 'react'

import style from './style.css'

export default class LogItem extends Component {
  static propTypes = {
    key: PropTypes.number.isRequired,
    label: PropTypes.string.isRequired,
    text: PropTypes.string.isRequired,
    type: PropTypes.string
  }

  render () {
    const {key, text, type} = this.props
    const opacity = key > 0 ? 0.75 : 1
    return (
      <div className={style[type]} style={{opacity}}>
        <span className={style.text}>{text}</span>
      </div>
    )
  }
}
