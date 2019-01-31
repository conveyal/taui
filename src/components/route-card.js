import Icon from '@conveyal/woonerf/components/icon'
import React from 'react'

import {cutoffs, opacities} from '../constants'

const rgbaToString = c => `rgba(${c.r}, ${c.g}, ${c.b}, ${c.a})`

export default function RouteCard (p) {
  return (
    <div
      className={'Card'}
    >
      <div
        className='CardTitle'
        onClick={p.setShowOnMap}
        onMouseOver={p.onMouseOver}
        style={{
          backgroundColor: p.cardColor.hex,
          cursor: 'pointer'
        }}
      >
        {p.title}
        <div className='CardLinks'>
          {p.downloadIsochrone &&
            <a
              onClick={p.downloadIsochrone}
              title='Download GeoJSON isochrone for network'
            >
              <Icon type='download' />
            </a>}
          <a
            onClick={p.setShowOnMap}
            title='Show/hide isochrone for network'
          >
            {p.showOnMap ? <Icon type='eye-slash' /> : <Icon type='eye' />}
          </a>
        </div>
      </div>
      <table className='CardBands'>
        <tbody>
          <tr>
            {cutoffs.map((min, i) =>
              <td
                key={`min-${min}`}
                style={{
                  backgroundColor: rgbaToString({
                    ...p.cardColor.rgb,
                    a: opacities[i] * (opacities.length - i - 1) + 0.1
                  }),
                  color: '#fff',
                  textShadow: '0 0 1px #333'
                }}
              >{i === 0 ? `${min} min` : ''}</td>)}
          </tr>
        </tbody>
      </table>
      <table className='CardContent'>{p.children}</table>
    </div>
  )
}
