import Icon from '@conveyal/woonerf/components/icon'
import React from 'react'

export default function RouteCard (p) {
  return (
    <div className={'Card'}>
      <div className='CardTitle' style={{backgroundColor: p.cardColor}}>
        {p.title}
        <div className='CardLinks'>
          {p.downloadIsochrone &&
            <a
              onClick={p.downloadIsochrone}
              title='Download GeoJSON isochrone for network'
            >
              <Icon type='download' />
            </a>}
        </div>
      </div>
      <table className='CardContent'>{p.children}</table>
    </div>
  )
}
