import React from 'react'

export default function Item(props) {
  return (
    <div className={`LogItem ${props.level}`}>
      <span className="LogItem-createdAt">{props.createdAt}</span>
      <span className="LogItem-text">{props.text}</span>
    </div>
  )
}
