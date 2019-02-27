import Icon from '@conveyal/woonerf/components/icon'
import React from 'react'

import message from '../../message'

import LogItem from './item'

export default function Log (props) {
  const {items} = props
  const hasError = items[0] && items[0].level === 'error' ? 'hasError' : ''
  return (
    <div className='Card'>
      <div className='CardTitle'>
        <Icon type='terminal' /> {message('Log.Title')}
      </div>
      <div className={`Log ${hasError}`}>
        {items.map((item, index) => (
          <LogItem {...item} key={index} />
        ))}
      </div>
    </div>
  )
}
