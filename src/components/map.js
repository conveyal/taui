// @flow
import lonlat from '@conveyal/lonlat'
import Icon from '@conveyal/woonerf/components/icon'
import message from '@conveyal/woonerf/message'
import Leaflet from 'leaflet'
import memoize from 'lodash/memoize'
import React, {PureComponent} from 'react'
import {
  GeoJson,
  Map as LeafletMap,
  Marker,
  Popup,
  TileLayer,
  ZoomControl
} from 'react-leaflet'

import TransitiveLayer from './transitive-map-layer'

import type {
  Coordinate,
  Feature,
  Location,
  LonLat,
  MapEvent,
  PointsOfInterest
} from '../types'

const TILE_URL = Leaflet.Browser.retina && process.env.LEAFLET_RETINA_URL
  ? process.env.LEAFLET_RETINA_URL
  : process.env.LEAFLET_TILE_URL

const TILE_LAYER_PROPS = {}
if (Leaflet.Browser.retina) {
  TILE_LAYER_PROPS.tileSize = 512
  TILE_LAYER_PROPS.zoomOffset = -1
}

const startIcon = Leaflet.divIcon({
  iconSize: [20, 26],
  className: 'LeafletIcon Start',
  html: '<div className="innerMarker"></div>'
})

const endIcon = Leaflet.divIcon({
  iconSize: [20, 26],
  className: 'LeafletIcon End',
  html: '<div className="innerMarker"></div>'
})

type Props = {
  activeNetworkIndex: number,
  centerCoordinates: Coordinate,
  clearStartAndEnd: () => void,
  end: null | Location,
  isLoading: boolean,
  isochrones: any[],
  pointsOfInterest: PointsOfInterest,
  setEndPosition: LonLat => void,
  setStartPosition: LonLat => void,
  start: null | Location,
  transitive: any,
  updateMap: any => void,
  zoom: number
}

type State = {
  showSelectStartOrEnd: boolean,
  lastClickedLabel: null | string,
  lastClickedPosition: null | Coordinate
}

const poiToFeatures = memoize(poi => poi.map(p => p.feature))

export default class Map extends PureComponent {
  props: Props
  state: State

  state = {
    showSelectStartOrEnd: false,
    lastClickedLabel: null,
    lastClickedPosition: null
  }

  _clearState (): void {
    this.setState({
      showSelectStartOrEnd: false,
      lastClickedLabel: null,
      lastClickedPosition: null
    })
  }

  _clearStartAndEnd = (): void => {
    this.props.clearStartAndEnd()
    this._clearState()
  }

  _setEndWithEvent = (event: MapEvent) => {
    this.props.setEndPosition(lonlat(event.latlng || event.target._latlng))
  }

  _setStartWithEvent = (event: MapEvent) => {
    this.props.setStartPosition(lonlat(event.latlng || event.target._latlng))
  }

  _onMapClick = (e: any): void => {
    this.setState({
      showSelectStartOrEnd: !this.state.showSelectStartOrEnd,
      lastClickedPosition: e.latlng || e.target._latlng
    })
  }

  _setEnd = (): void => {
    const {lastClickedPosition} = this.state
    this._clearState()
    if (lastClickedPosition) {
      this.props.setEndPosition(lonlat(lastClickedPosition))
    }
  }

  _setStart = (): void => {
    const {lastClickedPosition} = this.state
    this._clearState()
    if (lastClickedPosition) {
      this.props.setStartPosition(lonlat(lastClickedPosition))
    }
  }

  _clickPoi = (event: Event & {layer: {feature: Feature}}): void => {
    if (!event.layer || !event.layer.feature) {
      return this._clearState()
    }

    const {feature} = event.layer
    const {coordinates} = feature.geometry
    this.setState({
      lastClickedLabel: feature.properties.label,
      lastClickedPosition: lonlat.toLeaflet(coordinates),
      showSelectStartOrEnd: true
    })
  }

  _setZoom = (e: MapEvent) => {
    const zoom = e.target._zoom
    this.props.updateMap({zoom})
  }

  render (): React$Element<LeafletMap> {
    const {
      activeNetworkIndex,
      centerCoordinates,
      end,
      isLoading,
      isochrones,
      pointsOfInterest,
      start,
      transitive,
      zoom
    } = this.props
    const {
      lastClickedLabel,
      lastClickedPosition,
      showSelectStartOrEnd
    } = this.state
    const baseIsochrone = isochrones[0]
    const comparisonIsochrone = activeNetworkIndex > 0
      ? isochrones[activeNetworkIndex]
      : null

    return (
      <LeafletMap
        center={centerCoordinates}
        className='Taui-Map'
        onZoomend={this._setZoom}
        zoom={zoom}
        onClick={this._onMapClick}
        preferCanvas
        zoomControl={false}
      >
        <ZoomControl position='topright' />
        <TileLayer
          url={TILE_URL}
          attribution={process.env.LEAFLET_ATTRIBUTION}
          {...TILE_LAYER_PROPS}
        />

        {!isLoading && baseIsochrone &&
          <Isochrone isochrone={baseIsochrone} color='#4269a4' />}

        {!isLoading && comparisonIsochrone &&
          <Isochrone isochrone={comparisonIsochrone} color='darkorange' />}

        {!isLoading && transitive && <TransitiveLayer data={transitive} />}

        {(!start || !end) &&
          pointsOfInterest.length > 0 &&
          <MapboxGeoJson
            data={poiToFeatures(pointsOfInterest)}
            onClick={this._clickPoi}
          />}

        {start &&
          <Marker
            draggable
            icon={startIcon}
            onDragEnd={this._setStartWithEvent}
            position={start.position}
          >
            <Popup>
              <span>{start.label}</span>
            </Popup>
          </Marker>}

        {end &&
          <Marker
            draggable
            icon={endIcon}
            onDragEnd={this._setEndWithEvent}
            position={end.position}
          >
            <Popup>
              <span>{end.label}</span>
            </Popup>
          </Marker>}

        {showSelectStartOrEnd &&
          <Popup closeButton={false} position={lastClickedPosition}>
            <div className='Popup'>
              {lastClickedLabel &&
                <h3>
                  {lastClickedLabel}
                </h3>}
              <button onClick={this._setStart}>
                <Icon type='map-marker' />{' '}
                {message('Map.SetLocationPopup.SetStart')}
              </button>
              {start &&
                <button onClick={this._setEnd}>
                  <Icon type='map-marker' />{' '}
                  {message('Map.SetLocationPopup.SetEnd')}
                </button>}
              {(start || end) &&
                <button onClick={this._clearStartAndEnd}>
                  <Icon type='times' />{' '}
                  {message('Map.SetLocationPopup.ClearMarkers')}
                </button>}
            </div>
          </Popup>}
      </LeafletMap>
    )
  }
}

const getStyle = memoize(color => ({
  fillColor: color,
  pointerEvents: 'none',
  stroke: color,
  weight: 1
}))

function Isochrone ({isochrone, color}) {
  return (
    <GeoJson
      key={`${isochrone.key}`}
      data={isochrone}
      style={getStyle(color)}
    />
  )
}

class MapboxGeoJson extends GeoJson {
  componentDidMount () {
    const {mapbox} = require('mapbox.js')
    super.componentDidMount()
    const {data} = this.props
    mapbox.accessToken = process.env.MAPBOX_ACCESS_TOKEN
    this.leafletElement = mapbox.featureLayer(data)
  }
}
