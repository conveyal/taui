// @flow
import lonlat from '@conveyal/lonlat'
import Icon from '@conveyal/woonerf/components/icon'
import message from '@conveyal/woonerf/message'
import memoize from 'lodash/memoize'
import React, {Component} from 'react'
import {GeoJSON} from 'react-leaflet'

import type {
  Coordinate,
  GeocoderStore,
  LogItems,
  LonLat,
  InputEvent,
  MapboxFeature,
  MapEvent,
  PointsOfInterest,
  UIStore
} from '../types'
import {NETWORK_COLORS} from '../constants'
import {getAsObject} from '../utils/hash'
import downloadJson from '../utils/download-json'

import DrawRoute from './draw-route'
import Form from './form'
import Gridualizer from './gridualizer'
import Log from './log'
import Map from './map'
import RouteAccess from './route-access'
import RouteCard from './route-card'
import RouteSegments from './route-segments'

type Network = {
  name: string,
  active: boolean
}

type MapState = {
  centerCoordinates: Coordinate,
  zoom: number
}

type Props = {
  accessibility: number[][],
  actionLog: LogItems,
  activeTransitive: any,
  data: {
    grids: string[],
    networks: Network[]
  },
  drawActiveOpportunityDataset: Function,
  drawIsochrones: Function[],
  geocoder: GeocoderStore,
  isLoading: boolean,
  isochrones: any[],
  map: MapState,
  pointsOfInterest: PointsOfInterest,
  showComparison: boolean,
  timeCutoff: any,
  travelTimes: number[],
  ui: UIStore,
  uniqueRoutes: any[],

  geocode: (string, Function) => void,
  reverseGeocode: (string, Function) => void,
  initialize: Function => void,
  setEnd: any => void,
  setSelectedTimeCutoff: any => void,
  setStart: any => void,
  updateEnd: any => void,
  updateEndPosition: LonLat => void,
  updateMap: any => void,
  updateStart: any => void,
  updateStartPosition: LonLat => void
}

type State = {
  componentError: any
}

const getIsochroneStyleFor = index => () => ({
  fillColor: NETWORK_COLORS[index],
  fillOpacity: 0.4,
  pointerEvents: 'none',
  color: NETWORK_COLORS[index],
  weight: 1
})

/**
 *
 */
export default class Application extends Component<Props, State> {
  state = {
    componentError: null
  }

  /**
   * Top level component error catch
   */
  componentDidCatch (error, info) {
    this.setState({
      componentError: {
        error, info
      }
    })
  }

  /**
   * Initialize the application.
   */
  componentDidMount () {
    if (window) {
      window.Application = this
    }

    const qs = getAsObject()
    const startCoordinate = qs.startCoordinate
      ? lonlat.fromString(qs.startCoordinate)
      : undefined

    if (startCoordinate) {
      this.props.setStart({
        label: qs.start,
        position: startCoordinate
      })
    } else if (qs.centerCoordinates) {
      this.props.updateMap({
        centerCoordinates: lonlat.toLeaflet(qs.centerCoordinates)
      })
    }

    if (qs.endCoordinate) {
      this.props.setEnd({
        label: qs.end,
        position: lonlat.fromString(qs.endCoordinate)
      })
    }

    if (qs.zoom) {
      this.props.updateMap({zoom: parseInt(qs.zoom, 10)})
    }

    this.props.initialize(startCoordinate)
  }

  _saveRefToConfig = (ref) => {
    this._refToConfig = ref
  }

  _updateConfig = () => {
    try {
      const json = JSON.parse(this._refToConfig.value)
      this.props.loadDatasetFromJSON(json)
    } catch (e) {
      console.error(e)
      window.alert('Invalid JSON!')
    }
  }

  _clearStartAndEnd = () => {
    const {setEnd, setStart} = this.props
    setStart(null)
    setEnd(null)
  }

  _setStartWithEvent = (event: MapEvent) => {
    this.props.updateStartPosition(lonlat(event.latlng || event.target._latlng))
  }

  _setStartWithFeature = (feature?: MapboxFeature) => {
    if (!feature) {
      this._clearStartAndEnd()
    } else {
      this.props.updateStart({
        label: feature.place_name,
        position: lonlat(feature.geometry.coordinates)
      })
    }
  }

  _setEndWithEvent = (event: MapEvent) => {
    this.props.updateEndPosition(lonlat(event.latlng || event.target._latlng))
  }

  _setEndWithFeature = (feature?: MapboxFeature) => {
    if (!feature) {
      this.props.setEnd(null)
    } else {
      this.props.updateEnd({
        label: feature.place_name,
        position: lonlat(feature.geometry.coordinates)
      })
    }
  }

  _onTimeCutoffChange = (event: InputEvent) => {
    this.props.setSelectedTimeCutoff(parseInt(event.currentTarget.value, 10))
  }

  _setShowOnMap = memoize(index => () => {
    const p = this.props
    const network = p.data.networks[index]
    p.setNetwork({
      ...network,
      showOnMap: !network.showOnMap
    })
  })

  _downloadIsochrone = memoize(index => () => {
    const p = this.props
    const isochrone = p.isochrones[index]
    if (isochrone) {
      const name = p.data.networks[index].name
      const ll = lonlat.toString(p.geocoder.start.position)
      downloadJson({
        data: isochrone,
        filename: `${name}-${ll}-${p.timeCutoff.selected}min-isochrone.json`
      })
    } else {
      window.alert('No isochrone has been generated for this network.')
    }
  })

  _showRoutes () {
    const at = this.props.activeTransitive
    return !this.props.isLoading && at && at.journeys && at.journeys[0]
  }

  /**
   *
   */
  render () {
    const p = this.props
    return (
      <div>
        <div className='Fullscreen'>
          <svg>
            <defs>
              <filter id='shadow'>
                <feDropShadow dx='1' dy='1' stdDeviation='1' />
              </filter>
            </defs>
          </svg>
          <Map
            {...p.map}
            centerCoordinates={p.map.centerCoordinates}
            clearStartAndEnd={this._clearStartAndEnd}
            end={p.geocoder.end}
            pointsOfInterest={p.pointsOfInterest}
            setEndPosition={p.updateEndPosition}
            setStartPosition={p.updateStartPosition}
            start={p.geocoder.start}
            updateMap={p.updateMap}
            zoom={p.map.zoom}
          >
            {p.drawActiveOpportunityDataset &&
              <Gridualizer drawTile={p.drawActiveOpportunityDataset} zoom={p.map.zoom} />}

            {!p.isLoading && p.isochrones.map((iso, i) => !iso ? null :
              <GeoJSON
                data={iso}
                key={iso.key}
                style={getIsochroneStyleFor(i)}
              />)}

            {this._showRoutes() && <DrawRoute transitive={p.activeTransitive} />}
          </Map>
        </div>
        <Dock showSpinner={p.ui.fetches > 0} componentError={this.state.componentError}>
          <Form
            boundary={p.geocoder.boundary}
            end={p.geocoder.end}
            geocode={p.geocode}
            onTimeCutoffChange={this._onTimeCutoffChange}
            onChangeEnd={this._setEndWithFeature}
            onChangeStart={this._setStartWithFeature}
            pointsOfInterest={p.pointsOfInterest}
            reverseGeocode={p.reverseGeocode}
            selectedTimeCutoff={p.timeCutoff.selected}
            start={p.geocoder.start}
          />
          {p.data.networks.map((network, index) => (
            <RouteCard
              cardColor={NETWORK_COLORS[index]}
              downloadIsochrone={p.isochrones[index] && this._downloadIsochrone(index)}
              index={index}
              key={`${index}-route-card`}
              setShowOnMap={this._setShowOnMap(index)}
              showOnMap={network.showOnMap}
              title={network.name}
            >
              {!p.isLoading &&
                <RouteAccess
                  accessibility={p.accessibility[index]}
                  grids={p.data.grids}
                  hasStart={!!p.geocoder.start}
                  oldAccessibility={p.accessibility[0]}
                  showComparison={p.showComparison}
                />}
              {!p.isLoading && !!p.geocoder.end && !!p.geocoder.start &&
                <RouteSegments
                  oldTravelTime={p.travelTimes[0]}
                  routeSegments={p.uniqueRoutes[index]}
                  travelTime={p.travelTimes[index]}
                />}
            </RouteCard>
          ))}
          {p.ui.showLog &&
            <div className='Card'>
              <div className='CardTitle'>
                <span className='fa fa-terminal' /> {message('Log.Title')}
              </div>
              <Log items={p.actionLog} />
            </div>}
          {p.ui.allowChangeConfig &&
            <div className='Card'>
              <div
                className='CardTitle'
              >
                <span className='fa fa-cog' /> Configure
                <a
                  className='pull-right'
                  onClick={this._updateConfig}
                >save changes</a>
              </div>
              <div className='CardContent'>
                <br /><a href='https://github.com/conveyal/taui/blob/aa9e6285002d59b4b6ae38890229569311cc4b6d/config.json.tmp' target='_blank'>See example config</a>
              </div>
              <textarea ref={this._saveRefToConfig} defaultValue={window.localStorage.getItem('taui-config')} />
            </div>}
          {p.ui.showLink &&
            <div className='Attribution'>
              site made by
              {' '}
              <a href='https://www.conveyal.com' target='_blank'>
                conveyal
              </a>
            </div>}
        </Dock>
      </div>
    )
  }
}

function Dock (props) {
  return <div className='Taui-Dock'>
    <div className='Taui-Dock-content'>
      <div className='title'>
        {props.showSpinner
          ? <Icon type='spinner' className='fa-spin' />
          : <Icon type='map' />}
        {' '}
        {message('Title')}
      </div>
      {props.componentError &&
        <div>
          <h1>Error</h1>
          <p>{props.componentError.info}</p>
        </div>}
      {props.children}
    </div>
  </div>
}
