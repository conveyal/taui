import React, {PropTypes} from 'react'
import {GeoJson, Map as LeafletMap, Marker, Popup, TileLayer} from 'react-leaflet'
import PureComponent from 'react-pure-render/component'

import TransitiveLayer from '../../components/transitive-map-layer'
import transitiveStyle from './transitive-style'

import './style.css'

export default class Map extends PureComponent {
  static propTypes = {
    attribution: PropTypes.string,
    centerCoordinates: PropTypes.arrayOf(PropTypes.number),
    geojson: PropTypes.arrayOf(PropTypes.object).isRequired,
    markers: PropTypes.arrayOf(PropTypes.object).isRequired,
    onZoom: PropTypes.func,
    transitive: PropTypes.object,
    url: PropTypes.string.isRequired,
    zoom: PropTypes.number
  };

  render () {
    const {attribution, centerCoordinates, geojson, markers, onZoom, transitive, url, zoom} = this.props

    return (
      <LeafletMap
        center={centerCoordinates}
        className='Taui-Map'
        ref='map'
        zoom={zoom}
        onLeafletZoom={onZoom}
        >
        <TileLayer
          attribution={attribution}
          url={url}
        />
        {markers.map((m, index) => {
          return (
            <Marker
              draggable
              key={`marker-${index}`}
              {...m}
              >
              {m.label && <Popup><span>{m.label}</span></Popup>}
            </Marker>
          )
        })}
        {geojson.map(g => {
          return <GeoJson
            key={`${g.key}`}
            data={g}
            />
        })}
        {transitive &&
          <TransitiveLayer
            data={transitive}
            styles={transitiveStyle}
            />
        }
      </LeafletMap>
    )
  }
}
