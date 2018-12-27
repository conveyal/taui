// @flow
import Icon from '@conveyal/woonerf/components/icon'
import React from 'react'

export default class RouteCard extends React.PureComponent {
  render () {
    const p = this.props
    const {
      cardColor,
      children,
      downloadIsochrone,
      setShowOnMap,
      showOnMap,
      title
    } = this.props
    return (
      <div
        className={'Card'}
      >
        <div
          className='CardTitle'
          onClick={p.setShowOnMap}
          onMouseOver={p.onMouseOver}
          style={{
            backgroundColor: cardColor,
            cursor: 'pointer'
          }}
        >
          {title}
          <div className='CardLinks'>
            {downloadIsochrone &&
              <a
                onClick={downloadIsochrone}
                title='Download GeoJSON isochrone for network'
              >
                <Icon type='download' />
              </a>}
            <a
              onClick={setShowOnMap}
              title='Show/hide isochrone for network'
            >
              {showOnMap ? <Icon type='eye-slash' /> : <Icon type='eye' />}
            </a>
          </div>
        </div>
        <table className='CardContent'>{children}</table>
      </div>
    )
  }
}
