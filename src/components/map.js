// @flow
import lonlat from '@conveyal/lonlat'
import Icon from '@conveyal/woonerf/components/icon'
import message from '@conveyal/woonerf/message'
import Leaflet from 'leaflet'
import memoize from 'lodash/memoize'
import React, {PureComponent} from 'react'
import {
  GeoJSON,
  Map as LeafletMap,
  Marker,
  Popup,
  TileLayer,
  ZoomControl
} from 'react-leaflet'

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

const LABEL_URL = process.env.LABEL_URL

const TILE_LAYER_PROPS = {}
if (Leaflet.Browser.retina) {
  TILE_LAYER_PROPS.tileSize = 512
  TILE_LAYER_PROPS.zoomOffset = -1
}

const iconWidth = 20
const iconHeight = 20
const iconSize = [iconWidth, iconHeight]
const iconAnchor = [iconWidth / 2, iconHeight + 13] // height plus the pointer size
const iconHTML = '' // <div className="innerMarker"></div>'

const startIcon = Leaflet.divIcon({
  className: 'LeafletIcon Start',
  html: iconHTML,
  iconAnchor,
  iconSize
})

const endIcon = Leaflet.divIcon({
  className: 'LeafletIcon End',
  html: iconHTML,
  iconAnchor,
  iconSize
})

type Props = {
  centerCoordinates: Coordinate,
  clearStartAndEnd: () => void,
  end: null | Location,
  pointsOfInterest: PointsOfInterest,
  setEndPosition: LonLat => void,
  setStartPosition: LonLat => void,
  start: null | Location,
  updateMap: any => void,
  zoom: number
}

type State = {
  lastClickedLabel: null | string,
  lastClickedPosition: null | Coordinate,
  showSelectStartOrEnd: boolean
}

const poiToFeatures = memoize(poi => poi.map(p => p.feature))

/**
 *
 */
export default class Map extends PureComponent<Props, State> {
  state = {
    lastClickedLabel: null,
    lastClickedPosition: null,
    showSelectStartOrEnd: false
  }

  componentDidCatch (error) {
    console.error(error)
  }

  /**
   * Reset state
   */
  _clearState () {
    this.setState({
      lastClickedLabel: null,
      lastClickedPosition: null,
      showSelectStartOrEnd: false
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

  _onMapClick = (e: Leaflet.MouseEvent): void => {
    this.setState((previousState) => ({
      lastClickedPosition: e.latlng || e.target._latlng,
      showSelectStartOrEnd: !previousState.showSelectStartOrEnd
    }))
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

  /**
   * Render
   */
  render () {
    const {
      centerCoordinates,
      children,
      end,
      pointsOfInterest,
      start,
      zoom
    } = this.props

    // Index elements with keys to reset them when elements are added / removed
    const poiKey = pointsOfInterest.length > 0 ? 1 : 0
    const startKey = `${poiKey + 1}-start-key`
    const endKey = `${startKey + 1}-end-key`
    const selectKey = `${endKey + 1}-select-key`

    const {
      lastClickedLabel,
      lastClickedPosition,
      showSelectStartOrEnd
    } = this.state
    return (
      <LeafletMap
        center={centerCoordinates}
        className='Taui-Map'
        onZoomend={this._setZoom}
        zoom={zoom}
        onClick={this._onMapClick}
        zoomControl={false}
      >
        <ZoomControl position='topright' />
        <TileLayer
          url={TILE_URL}
          attribution={process.env.LEAFLET_ATTRIBUTION}
          {...TILE_LAYER_PROPS}
        />

        {children}

        {LABEL_URL &&
          <TileLayer
            attribution={process.env.LEAFLET_ATTRIBUTION}
            url={LABEL_URL}
            zIndex={40}
          />}

        {(!start || !end) &&
          pointsOfInterest.length > 0 &&
          <GeoJSON
            data={poiToFeatures(pointsOfInterest)}
            key={poiKey}
            onClick={this._clickPoi}
          />}

        {start &&
          <Marker
            draggable
            icon={startIcon}
            key={startKey}
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
            key={endKey}
            onDragEnd={this._setEndWithEvent}
            position={end.position}
          >
            <Popup>
              <span>{end.label}</span>
            </Popup>
          </Marker>}

        {showSelectStartOrEnd &&
          <Popup
            closeButton={false}
            key={selectKey}
            position={lastClickedPosition}
          >
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
