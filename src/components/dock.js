import React from 'react'

export default function Dock(props) {
  return (
    <div className='Taui-Dock'>
      <div className='Taui-Dock-content'>
        {props.componentError && (
          <div>
            <h1>Error</h1>
            <p>{props.componentError.info}</p>
          </div>
        )}
        {props.children}
      </div>
    </div>
  )
}
