// @flow
import Pure from '@conveyal/woonerf/components/pure'
import React, {PropTypes} from 'react'

import LogItem from '../log-item'

export default class Log extends Pure {
  static propTypes = {
    items: PropTypes.arrayOf(PropTypes.object).isRequired
  }

  render () {
    return (
      <div className='Log'>
        {this.props.items.map((item, index) => (
          <LogItem {...item} key={index} />
        ))}
      </div>
    )
  }
}
