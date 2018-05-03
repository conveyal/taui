// @flow
import Icon from '@conveyal/woonerf/components/icon'
import React from 'react'

type Props = {
  active: boolean,
  alternate: boolean,
  children?: any,
  onClick(): void,
  title: string
}

export default class RouteCard extends React.PureComponent<Props> {
  render () {
    const {
      active,
      alternate,
      children,
      downloadIsochrone,
      showIsochrone,
      title
    } = this.props
    return (
      <div
        className={
          'Card' +
            (alternate ? ' Card-alternate' : '') +
            (active ? ' Card-active' : '')
        }
      >
        <div
          className='CardTitle'
        >
          {title}
          <a
            className='pull-right'
            onClick={showIsochrone}
            title='Show/hide isochrone for network'
          >
            {active ? <Icon type='eye-slash' /> : <Icon type='eye' />}
          </a>
          <a
            className='pull-right'
            onClick={downloadIsochrone}
            title='Download GeoJSON isochrone for network'
          >
            <Icon type='download' />
          </a>
        </div>
        <table className='CardContent'>{children}</table>
      </div>
    )
  }
}
