import {faTerminal} from '@fortawesome/free-solid-svg-icons'
import React from 'react'

import message from '../../message'
import Icon from '../icon'

import LogItem from './item'

export default function Log(p) {
  const hasError = p.items[0] && p.items[0].level === 'error' ? 'hasError' : ''
  return (
    <div className='Card'>
      <div className='CardTitle'>
        <Icon icon={faTerminal} /> {message('Log.Title')}
      </div>
      <div className={`Log ${hasError}`}>
        {p.items.map((item, index) => (
          <LogItem {...item} key={index} />
        ))}
      </div>
    </div>
  )
}
