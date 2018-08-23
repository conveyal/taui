// @flow
import Icon from '@conveyal/woonerf/components/icon'
import React from 'react'

type Props = {
  cardColor: string,
  children?: any,
  downloadIsochrone?: Function,
  setShowOnMap: Function,
  showOnMap: boolean,
  title: string
}

export default class RouteCard extends React.PureComponent<Props> {
  render () {
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
          style={{backgroundColor: cardColor}}
        >
          {title}
          <a
            className='pull-right'
            onClick={setShowOnMap}
            title='Show/hide isochrone for network'
          >
            {showOnMap ? <Icon type='eye-slash' /> : <Icon type='eye' />}
          </a>
          {downloadIsochrone &&
            <a
              className='pull-right'
              onClick={downloadIsochrone}
              title='Download GeoJSON isochrone for network'
            >
              <Icon type='download' />
            </a>}
        </div>
        <table className='CardContent'>{children}</table>
      </div>
    )
  }
}
