import {faTerminal} from '@fortawesome/free-solid-svg-icons'
import React from 'react'

import message from '../../message'
import Icon from '../icon'

import LogItem from './item'

export default function Log(props) {
  const {items} = props
  const hasError = items[0] && items[0].level === 'error' ? 'hasError' : ''
  return (
    <div className="Card">
      <div className="CardTitle">
        <Icon icon={faTerminal} /> {message('Log.Title')}
      </div>
      <div className={`Log ${hasError}`}>
        {items.map((item, index) => (
          <LogItem {...item} key={index} />
        ))}
      </div>
    </div>
  )
}
