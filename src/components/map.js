// @flow
import lonlat from '@conveyal/lonlat'
import Icon from '@conveyal/woonerf/components/icon'
import find from 'lodash/find'
import React, {PureComponent} from 'react'
import {
  Map as LeafletMap,
  Marker,
  Popup,
  TileLayer,
  ZoomControl
} from 'react-leaflet'

import {STOP_STYLE} from '../constants'
import env from '../env'
import {endIcon, startIcon} from '../map/icons'
import message from '../message'

import DrawRoute from './draw-route'
import Gridualizer from './gridualizer'
import VGrid from './vector-grid'

const MAPBOX_TOKEN = env.MAPBOX_ACCESS_TOKEN
const TILE_OPTIONS = {
  tileSize: 512,
  zoomOffset: -1
}

/**
 *
 */
export default class Map extends PureComponent {
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

  _clearStartAndEnd = () => {
    this.props.clearStartAndEnd()
    this._clearState()
  }

  _setEndWithEvent = (event) => {
    this.props.setEndPosition(lonlat(event.latlng || event.target._latlng))
  }

  _setStartWithEvent = (event) => {
    this.props.setStartPosition(lonlat(event.latlng || event.target._latlng))
  }

  _onMapClick = (e) => {
    this.setState((previousState) => ({
      lastClickedPosition: e.latlng || e.target._latlng,
      showSelectStartOrEnd: !previousState.showSelectStartOrEnd
    }))
  }

  _setEnd = () => {
    const p = this.props
    const s = this.state
    if (s.lastClickedPosition) {
      const position = lonlat(s.lastClickedPosition)
      if (s.lastClickedLabel) p.updateEnd({label: s.lastClickedLabel, position})
      else p.setEndPosition(position)
    }
    this._clearState()
  }

  _setStart = () => {
    const p = this.props
    const s = this.state
    if (s.lastClickedPosition) {
      const position = lonlat(s.lastClickedPosition)
      if (s.lastClickedLabel) p.updateStart({label: s.lastClickedLabel, position})
      else p.setStartPosition(position)
    }
    this._clearState()
  }

  _setZoom = (e) => {
    const zoom = e.target._zoom
    this.props.updateMap({zoom})
  }

  _clickPoi = (feature) => {
    this.setState({
      lastClickedLabel: feature.properties.label,
      lastClickedPosition: lonlat.toLeaflet(feature.geometry.coordinates),
      showSelectStartOrEnd: true
    })
  }

  _key = 0
  _getKey () { return this._key++ }
  _getZIndex () { return this._key * 10 }

  render () {
    const p = this.props
    const s = this.state

    // Index elements with keys to reset them when elements are added / removed
    this._key = 0

    return (
      <LeafletMap
        center={lonlat.toLeaflet(p.centerCoordinates)}
        className='Taui-Map'
        maxBounds={p.maxBounds}
        maxZoom={p.maxZoom}
        minZoom={p.minZoom}
        onClick={this._onMapClick}
        onZoomend={this._setZoom}
        zoom={p.zoom}
        zoomControl={false}
      >
        <ZoomControl position='topright' />
        <TileLayer
          {...TILE_OPTIONS}
          attribution={p.attribution}
          url={`${p.tileUrl}?access_token=${MAPBOX_TOKEN}`}
          zIndex={this._getZIndex()}
        />

        {/* p.drawIsochrones.map((drawTile, i) => drawTile &&
          <Gridualizer
            drawTile={drawTile}
            key={`draw-iso-${i}-${keyCount++}`}
            zoom={p.zoom}
          />) */}

        {/* !p.isLoading && p.isochrones.map((iso, i) => !iso
          ? null
          : <GeoJSON
            data={iso}
            key={`${iso.key}-${i}-${keyCount++}`}
            style={iso.style}
            zIndex={this._getZIndex()}
          />) */}

        {!p.isLoading && p.isochrones.map((iso, i) => !iso
          ? null
          : <VGrid
            data={iso}
            key={`${iso.key}-${i}-${this._getKey()}`}
            style={iso.style}
            zIndex={this._getZIndex()}
          />)}

        {p.drawOpportunityDatasets.map((drawTile, i) => drawTile &&
          <Gridualizer
            drawTile={drawTile}
            key={`draw-od-${i}-${this._getKey()}`}
            zIndex={this._getZIndex()}
            zoom={p.zoom}
          />)}

        {p.labelUrl &&
          <TileLayer
            {...TILE_OPTIONS}
            key={`tile-layer-${this._getKey()}`}
            url={`${p.labelUrl}?access_token=${MAPBOX_TOKEN}`}
            zIndex={this._getZIndex()}
          />}

        {p.showRoutes && p.drawRoutes.map(drawRoute =>
          <DrawRoute
            {...drawRoute}
            key={`draw-routes-${drawRoute.index}-${this._getKey()}`}
            zIndex={this._getZIndex()}
          />)}

        {(!p.start || !p.end) && p.pointsOfInterest &&
          <VGrid
            data={p.pointsOfInterest}
            idField='label'
            key={`poi-${this._getKey()}`}
            minZoom={10}
            onClick={this._clickPoi}
            style={STOP_STYLE}
            tooltip='label'
            zIndex={this._getZIndex()}
          />}

        {p.start &&
          <Marker
            draggable
            icon={startIcon}
            key={`start-${this._getKey()}`}
            onDragEnd={this._setStartWithEvent}
            position={lonlat.toLeaflet(p.start.position)}
            zIndex={this._getZIndex()}
          >
            <Popup>
              <span>{p.start.label}</span>
            </Popup>
          </Marker>}

        {p.end &&
          <Marker
            draggable
            icon={endIcon}
            key={`end-${this._getKey()}`}
            onDragEnd={this._setEndWithEvent}
            position={lonlat.toLeaflet(p.end.position)}
            zIndex={this._getZIndex()}
          >
            <Popup>
              <span>{p.end.label}</span>
            </Popup>
          </Marker>}

        {s.showSelectStartOrEnd &&
          <Popup
            closeButton={false}
            key={`select-${this._getKey()}`}
            position={s.lastClickedPosition}
            zIndex={this._getZIndex()}
          >
            <div className='Popup'>
              {s.lastClickedLabel &&
                <h3>
                  {s.lastClickedLabel}
                </h3>}
              <button onClick={this._setStart}>
                <Icon type='map-marker' />{' '}
                {message('Map.SetLocationPopup.SetStart')}
              </button>
              {p.start &&
                <button onClick={this._setEnd}>
                  <Icon type='map-marker' />{' '}
                  {message('Map.SetLocationPopup.SetEnd')}
                </button>}
              {(p.start || p.end) &&
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
