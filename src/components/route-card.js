import React from 'react'

import Icon from './icon'

export default function RouteCard(p) {
  return (
    <div className={'Card'}>
      <div className="CardTitle" style={{backgroundColor: p.cardColor}}>
        {p.title}
        <div className="CardLinks">
          {p.downloadIsochrone && (
            <a
              onClick={p.downloadIsochrone}
              title="Download GeoJSON isochrone for network"
            >
              <Icon icon="download" />
            </a>
          )}
        </div>
      </div>
      <table className="CardContent">{p.children}</table>
    </div>
  )
}
