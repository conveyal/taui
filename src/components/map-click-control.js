import React from 'react'

import {darkBlue, colors} from '../constants'

import Icon from './icon'

const buttonStyle = {
  padding: '5px 13px',
  marginTop: '6px',
  borderRadius: '100px',
  cursor: 'pointer',
  borderWidth: '1px',
  borderStyle: 'solid',
  borderColor: 'white'
}

const iconStyle = {
  display: 'inline-block',
  marginBottom: '-1.5px',
  marginRight: '5px'
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
        margin-bottom: 25px;
      }

      .mapboxgl-ctrl {
        padding: 8px;
        text-align: center;
      }
    `}</style>
  </div>
)

const Button = React.memo(p => {
  const style = {
    ...buttonStyle,
    color: p.color
  }
  if (p.active) {
    style.borderColor = p.color
  }

  return (
    <div onClick={p.onClick} style={style}>
      {p.children}
    </div>
  )
})

export default function MapClickControl(p) {
  const startActive = p.clickAction === 'start'

  return (
    <MapControl>
      <div>click map to:</div>
      <Button
        active={startActive}
        color={darkBlue}
        onClick={() => p.setClickAction('start')}
      >
        <Icon icon='map-marker-alt' style={iconStyle} />
        <span>set start</span>
      </Button>
      <Button
        active={!startActive}
        color={colors[1].hex}
        onClick={() => p.setClickAction('end')}
      >
        <Icon icon='map-marker-alt' style={iconStyle} />
        <span>set end</span>
      </Button>
    </MapControl>
  )
}
