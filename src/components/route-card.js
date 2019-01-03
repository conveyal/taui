// @flow
import Icon from '@conveyal/woonerf/components/icon'
import React from 'react'

export default class RouteCard extends React.PureComponent {
  render () {
    const p = this.props
    return (
      <div
        className={'Card'}
      >
        <div
          className='CardTitle'
          onClick={p.setShowOnMap}
          onMouseOver={p.onMouseOver}
          style={{
            backgroundColor: p.cardColor,
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
        <table className='CardContent'>{p.children}</table>
      </div>
    )
  }
}
