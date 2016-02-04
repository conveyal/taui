import React, {Component, PropTypes} from 'react'

import LogItem from '../log-item'
import style from './style.css'

export default class Log extends Component {
  static propTypes = {
    items: PropTypes.arrayOf(PropTypes.object).isRequired
  };

  render () {
    return <div className={style.log}>{this.props.items.map((item, index) => <LogItem {...item} key={index} />)}</div>
  }
}
