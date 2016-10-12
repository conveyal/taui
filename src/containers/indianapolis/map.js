import {Browser} from 'leaflet'
import React, {PropTypes} from 'react'
import {GeoJson, Map as LeafletMap, Marker, Popup, TileLayer} from 'react-leaflet'
import PureComponent from 'react-pure-render/component'

import Icon from '../../components/icon'
import messages from '../../utils/messages'
import TransitiveLayer from '../../components/transitive-map-layer'
import transitiveStyle from './transitive-style'

export default class Map extends PureComponent {
  static propTypes = {
    centerCoordinates: PropTypes.arrayOf(PropTypes.number),
    clearStartAndEnd: PropTypes.func.isRequired,
    geojson: PropTypes.arrayOf(PropTypes.object).isRequired,
    geojsonColor: PropTypes.string,
    markers: PropTypes.arrayOf(PropTypes.object).isRequired,
    onZoom: PropTypes.func,
    setEnd: PropTypes.func.isRequired,
    setStart: PropTypes.func.isRequired,
    transitive: PropTypes.object,
    zoom: PropTypes.number
  }

  state = {
    showSelectOriginOrDestination: false,
    lastClickedLatlng: null
  }

  _clearStartAndEnd = () => {
    const {clearStartAndEnd} = this.props
    clearStartAndEnd()
    this.setState({
      ...this.state,
      showSelectOriginOrDestination: false
    })
  }

  _onMapClick = (e) => {
    const {markers, setStart} = this.props
    if (markers.length === 0) {
      setStart({latlng: e.latlng})
    } else {
      this.setState({
        ...this.state,
        showSelectOriginOrDestination: !this.state.showSelectOriginOrDestination,
        lastClickedLatlng: e.latlng
      })
    }
  }

  _setEnd = () => {
    const {setEnd} = this.props
    const {lastClickedLatlng} = this.state
    setEnd({latlng: lastClickedLatlng})
    this.setState({
      showSelectOriginOrDestination: false,
      lastClickedLatlng: null
    })
  }

  _setStart = () => {
    const {setStart} = this.props
    const {lastClickedLatlng} = this.state
    setStart({latlng: lastClickedLatlng})
    this.setState({
      showSelectOriginOrDestination: false,
      lastClickedLatlng: null
    })
  }

  render () {
    const {centerCoordinates, geojson, geojsonColor, markers, onZoom, transitive, zoom} = this.props
    const {showSelectOriginOrDestination, lastClickedLatlng} = this.state
    const tileLayerProps = {}

    if (Browser.retina) {
      tileLayerProps.tileSize = 512
      tileLayerProps.zoomOffset = -1
    }

    return (
      <LeafletMap
        center={centerCoordinates}
        className='Taui-Map'
        ref='map'
        zoom={zoom}
        onClick={this._onMapClick}
        onZoom={onZoom}
        >
        <TileLayer
          url={Browser.retina && process.env.LEAFLET_RETINA_URL ? process.env.LEAFLET_RETINA_URL : process.env.LEAFLET_TILE_URL}
          attribution={process.env.LEAFLET_ATTRIBUTION}
          {...tileLayerProps}
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
            style={{
              fillColor: geojsonColor,
              pointerEvents: 'none',
              stroke: false
            }}
            />
        })}

        {transitive &&
          <TransitiveLayer
            data={transitive}
            styles={transitiveStyle}
            />
        }

        {showSelectOriginOrDestination &&
          <Popup
            closeButton={false}
            position={lastClickedLatlng}
            >
            <div className='Popup'>
              <button onClick={this._setStart}><Icon type='map-marker' /> {messages.Map.SetLocationPopup.SetStart}</button>
              <button onClick={this._setEnd}><Icon type='map-marker' /> {messages.Map.SetLocationPopup.SetEnd}</button>
              <button onClick={this._clearStartAndEnd}><Icon type='times' /> {messages.Map.SetLocationPopup.ClearMarkers}</button>
            </div>
          </Popup>
        }
      </LeafletMap>
    )
  }
}
