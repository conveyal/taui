// @flow
import lonlat from '@conveyal/lonlat'
import Icon from '@conveyal/woonerf/components/icon'
import message from '@conveyal/woonerf/message'
import Leaflet from 'leaflet'
import find from 'lodash/find'
import memoize from 'lodash/memoize'
import React, {PureComponent} from 'react'
import {
  Map as LeafletMap,
  Marker,
  Popup,
  TileLayer,
  ZoomControl
} from 'react-leaflet'
import VectorGrid from 'react-leaflet-vectorgrid/dist/react-leaflet-vectorgrid'

import {NETWORK_COLORS, STOP_STYLE} from '../constants'
import type {
  Coordinate,
  Location,
  LonLat,
  MapEvent
} from '../types'

import DrawRoute from './draw-route'
import Gridualizer from './gridualizer'

const TILE_URL = Leaflet.Browser.retina && process.env.LEAFLET_RETINA_URL
  ? process.env.LEAFLET_RETINA_URL
  : process.env.LEAFLET_TILE_URL

const LABEL_URL = Leaflet.Browser.retina && process.env.LABEL_RETINA_URL
  ? process.env.LABEL_RETINA_URL
  : process.env.LABEL_URL

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
  isLoading: boolean,
  pointsOfInterest: void | any, // FeatureCollection
  setEndPosition: LonLat => void,
  setStartPosition: LonLat => void,
  start: null | Location,
  updateEnd: () => void,
  updateMap: any => void,
  updateStart: () => void,
  zoom: number
}

type State = {
  lastClickedLabel: null | string,
  lastClickedPosition: null | Coordinate,
  showSelectStartOrEnd: boolean
}

const getIsochroneStyleFor = memoize(index => ({
  fillColor: NETWORK_COLORS[index],
  fillOpacity: 0.4,
  pointerEvents: 'none',
  color: NETWORK_COLORS[index],
  weight: 0
}))

/**
 * Temporary class that fixes VectorGrid's `getFeature`
 */
class VGrid extends VectorGrid {
  _propagateEvent (eventHandler, e) {
    if (!eventHandler) return
    const featureId = this._getFeatureId(e.layer)
    const feature = this.getFeature(featureId)
    if (feature) {
      Leaflet.DomEvent.stopPropagation(e)
      eventHandler(feature)
    }
  }

  getFeature (featureId) {
    const p = this.props
    return find(p.data.features, f => f.properties[p.idField] === featureId)
  }
}

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
    const p = this.props
    const s = this.state
    if (s.lastClickedPosition) {
      const position = lonlat(s.lastClickedPosition)
      if (s.lastClickedLabel) p.updateEnd({label: s.lastClickedLabel, position})
      else p.setEndPosition(position)
    }
    this._clearState()
  }

  _setStart = (): void => {
    const p = this.props
    const s = this.state
    if (s.lastClickedPosition) {
      const position = lonlat(s.lastClickedPosition)
      if (s.lastClickedLabel) p.updateStart({label: s.lastClickedLabel, position})
      else p.setStartPosition(position)
    }
    this._clearState()
  }

  _setZoom = (e: MapEvent) => {
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

  /**
   * Render
   */
  render () {
    const p = this.props
    const s = this.state

    // Index elements with keys to reset them when elements are added / removed
    let keyCount = 0

    return (
      <LeafletMap
        center={p.centerCoordinates}
        className='Taui-Map'
        onZoomend={this._setZoom}
        zoom={p.zoom}
        onClick={this._onMapClick}
        zoomControl={false}
      >
        <ZoomControl position='topright' />
        <TileLayer
          url={TILE_URL}
          attribution={process.env.LEAFLET_ATTRIBUTION}
          {...TILE_LAYER_PROPS}
        />

        {p.drawOpportunityDatasets.map((drawTile, i) => drawTile &&
          <Gridualizer
            drawTile={drawTile}
            key={`draw-od-${i}-${keyCount++}`}
            zoom={p.zoom}
          />)}

        {!p.isLoading && p.isochrones.map((iso, i) => !iso
          ? null
          : <VGrid
            data={iso}
            key={`${iso.key}-${keyCount++}`}
            style={getIsochroneStyleFor(i)}
          />)}

        {LABEL_URL &&
          <TileLayer
            attribution={process.env.LEAFLET_ATTRIBUTION}
            key={`tile-layer-${keyCount++}`}
            url={LABEL_URL}
            zIndex={40}
            {...TILE_LAYER_PROPS}
          />}

        {p.showRoutes &&
          <DrawRoute
            key={`draw-routes-${keyCount++}`}
            transitive={p.activeTransitive}
          />}

        {(!p.start || !p.end) && p.pointsOfInterest &&
          <VGrid
            data={p.pointsOfInterest}
            idField='label'
            minZoom={12}
            onClick={this._clickPoi}
            style={STOP_STYLE}
            tooltip='label'
            zIndex={50}
          />}

        {p.start &&
          <Marker
            draggable
            icon={startIcon}
            key={`start-${keyCount++}`}
            onDragEnd={this._setStartWithEvent}
            position={p.start.position}
          >
            <Popup>
              <span>{p.start.label}</span>
            </Popup>
          </Marker>}

        {p.end &&
          <Marker
            draggable
            icon={endIcon}
            key={`end-${keyCount++}`}
            onDragEnd={this._setEndWithEvent}
            position={p.end.position}
          >
            <Popup>
              <span>{p.end.label}</span>
            </Popup>
          </Marker>}

        {s.showSelectStartOrEnd &&
          <Popup
            closeButton={false}
            key={`select-${keyCount++}`}
            position={s.lastClickedPosition}
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
