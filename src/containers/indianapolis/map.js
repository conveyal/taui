import React, {PropTypes} from 'react'
import {GeoJson, Map as LeafletMap, Marker, Popup, TileLayer} from 'react-leaflet'
import PureComponent from 'react-pure-render/component'

import TransitiveLayer from '../../components/transitive-map-layer'
import transitiveStyle from './transitive-style'

import './style.css'

export default class Map extends PureComponent {
  static propTypes = {
    centerCoordinates: PropTypes.arrayOf(PropTypes.number),
    geojson: PropTypes.arrayOf(PropTypes.object).isRequired,
    markers: PropTypes.arrayOf(PropTypes.object).isRequired,
    onZoom: PropTypes.func,
    transitive: PropTypes.object,
    zoom: PropTypes.number
  };

  render () {
    const {centerCoordinates, geojson, markers, onZoom, transitive, zoom} = this.props

    return (
      <LeafletMap
        center={centerCoordinates}
        className='Taui-Map'
        ref='map'
        zoom={zoom}
        onZoom={onZoom}
        >
        <TileLayer
          attribution={'&copy <a href="https://www.mapbox.com/map-feedback/">Mapbox</a> &copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>'}
          url={`https://api.tiles.mapbox.com/v4/${process.env.MAPBOX_MAP_ID}/{z}/{x}/{y}.png?access_token=${process.env.MAPBOX_ACCESS_TOKEN}`}
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
        {geojson.map((g) => {
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
