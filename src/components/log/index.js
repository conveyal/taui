import React, {PropTypes} from 'react'

import DeepEqual from '../deep-equal'
import LogItem from '../log-item'

export default class Log extends DeepEqual {
  static propTypes = {
    items: PropTypes.arrayOf(PropTypes.object).isRequired
  };

  render () {
    return (
      <div className='Log'>
        {this.props.items.map((item, index) => <LogItem {...item} key={index} />)}
      </div>
    )
  }
}
