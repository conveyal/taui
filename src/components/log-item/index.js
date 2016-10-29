import React, {PropTypes} from 'react'
import moment from 'moment'

import DeepEqual from '../deep-equal'

const format = 'HH:mm:ss'

export default class LogItem extends DeepEqual {
  static propTypes = {
    createdAt: PropTypes.object,
    level: PropTypes.string,
    text: PropTypes.string.isRequired
  };

  render () {
    const {createdAt, text} = this.props
    return (
      <div className='LogItem'>
        <small className='LogItem-createdAt'>{moment(createdAt).format(format)}</small>
        <span className='LogItem-text'>{text}</span>
      </div>
    )
  }
}
