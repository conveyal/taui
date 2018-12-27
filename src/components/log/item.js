// @flow
import formatDate from 'date-fns/format'
import React from 'react'

const FORMAT = 'HH:mm:ss'

export default function Item (props) {
  return (
    <div className={`LogItem ${props.level}`}>
      <span className='LogItem-createdAt'>
        {formatDate(props.createdAt, FORMAT)}
      </span>
      <span className='LogItem-text'>
        {props.text}
      </span>
    </div>
  )
}
