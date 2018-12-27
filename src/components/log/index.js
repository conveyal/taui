// @flow
import React from 'react'

import LogItem from './item'

export default function Log (props) {
  const {items} = props
  const hasError = items[0] && items[0].level === 'error' ? 'hasError' : ''
  return (
    <div className={`Log ${hasError}`}>
      {items.map((item, index) => (
        <LogItem {...item} key={index} />
      ))}
    </div>
  )
}
