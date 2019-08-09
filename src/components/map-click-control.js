import React from 'react'

import {darkBlue, colors} from '../constants'

import Icon from './icon'

const buttonStyle = {
  padding: '5px 13px',
  cursor: 'pointer',
  borderWidth: '2px',
  borderStyle: 'solid'
}

const MapControl = p => (
  <div className='mapboxgl-ctrl-bottom-right'>
    <div
      className='mapboxgl-ctrl mapboxgl-ctrl-group'
      style={{pointerEvents: 'auto'}}
    >
      {p.children}
    </div>
    <style jsx>{`
      .mapboxgl-ctrl-bottom-right {
        margin-bottom: 20px;
      }

      .mapboxgl-ctrl {
        box-shadow: none;
      }
    `}</style>
  </div>
)

export default function MapClickControl(p) {
  const startActive = p.clickAction === 'start'

  return (
    <MapControl>
      <style jsx>{`
        div {
          padding: 5px 13px;
          cursor: pointer;
          border-width: 2px;
          border-style: solid;
        }

        .start {
          border-radius: 4px 4px 0 0;
          border-color: ${startActive ? darkBlue : 'rgba(0, 0, 0, 0.1)'};
          color: ${darkBlue};
          opacity: ${startActive ? 1 : 0.5};
        }

        .end {
          border-radius: 0 0 4px 4px;
          border-color: ${startActive ? 'rgba(0, 0, 0, 0.1)' : colors[1].hex};
          color: ${colors[1].hex};
          opacity: ${startActive ? 0.5 : 1};
        }

        .start:hover,
        .end:hover {
          background-color: rgba(0, 0, 0, 0.05);
          opacity: 1;
        }
      `}</style>
      <div className='start' onClick={() => p.setClickAction('start')}>
        <Icon icon='hand-pointer' />
        <span> set start</span>
      </div>
      <div className='end' onClick={() => p.setClickAction('end')}>
        <Icon icon='hand-pointer' />
        <span> set end</span>
      </div>
    </MapControl>
  )
}
