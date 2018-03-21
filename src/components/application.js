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
import {getAsObject} from '../utils/hash'

import Form from './form'
import Log from './log'
import Map from './map'
import RouteAccess from './route-access'
import RouteCard from './route-card'
import RouteSegments from './route-segments'
import TransitiveLayer from './transitive-map-layer'

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
  activeNetworkIndex: number,
  activeTransitive: any,
  allTransitiveData: any[],
  data: {
    grids: string[],
    networks: Network[]
  },
  geocoder: GeocoderStore,
  isLoading: boolean,
  isochrones: any[],
  map: MapState,
  pointsOfInterest: PointsOfInterest,
  showComparison: boolean,
  timeCutoff: any,
  travelTimes: number[],
  ui: UIStore,

  geocode: (string, Function) => void,
  reverseGeocode: (string, Function) => void,
  initialize: Function => void,
  setActiveNetwork: (name: string) => void,
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

const getStyle = memoize(color => ({
  fillColor: color,
  pointerEvents: 'none',
  stroke: color,
  weight: 1
}))

const BASE_ISOCHRONE_STYLE = getStyle('#4269a4')
const COMP_ISOCHRONE_STYLE = getStyle('darkorange')

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
    const qs = getAsObject()
    const startCoordinate = qs.startCoordinate
      ? lonlat.fromString(qs.startCoordinate)
      : undefined

    if (startCoordinate) {
      this.props.setStart({
        label: qs.start,
        position: startCoordinate
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

    if (qs.centerCoordinates) {
      this.props.updateMap({
        centerCoordinates: lonlat.toLeaflet(qs.centerCoordinates)
      })
    }

    this.props.initialize(startCoordinate)
  }

  _changeConfig = e => {
    const str = window.prompt('Paste in a valid JSON configuration.', '{}')
    this.props.loadDatasetFromJSON(JSON.parse(str))
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

  _setActiveNetwork = memoize(name => () => this.props.setActiveNetwork(name))

  /**
   *
   */
  render () {
    const {
      accessibility,
      actionLog,
      activeNetworkIndex,
      activeTransitive,
      allTransitiveData,
      data,
      geocoder,
      geocode,
      isochrones,
      isLoading,
      map,
      pointsOfInterest,
      reverseGeocode,
      showComparison,
      timeCutoff,
      travelTimes,
      ui,
      updateEndPosition,
      updateMap,
      updateStartPosition
    } = this.props
    const {componentError} = this.state
    const comparisonIsochrone = activeNetworkIndex > 0
      ? isochrones[activeNetworkIndex]
      : null
    return (
      <div>
        <div className='Fullscreen'>
          <Map
            {...map}
            centerCoordinates={map.centerCoordinates}
            clearStartAndEnd={this._clearStartAndEnd}
            end={geocoder.end}
            pointsOfInterest={pointsOfInterest}
            setEndPosition={updateEndPosition}
            setStartPosition={updateStartPosition}
            start={geocoder.start}
            updateMap={updateMap}
            zoom={map.zoom}
          >
            {!isLoading &&
              <div>
                {isochrones[0] &&
                  <GeoJSON data={isochrones[0]} key={isochrones[0].key} style={BASE_ISOCHRONE_STYLE} />}

                {comparisonIsochrone &&
                  <GeoJSON data={comparisonIsochrone} key={comparisonIsochrone.key} style={COMP_ISOCHRONE_STYLE} />}

                {activeTransitive && activeTransitive.journeys && activeTransitive.journeys.length > 0 &&
                  <TransitiveLayer data={activeTransitive} />}
              </div>}
          </Map>
        </div>
        <Dock showSpinner={ui.fetches > 0} componentError={componentError}>
          <Form
            boundary={geocoder.boundary}
            end={geocoder.end}
            focusLatlng={geocoder.focusLatlng}
            geocode={geocode}
            onTimeCutoffChange={this._onTimeCutoffChange}
            onChangeEnd={this._setEndWithFeature}
            onChangeStart={this._setStartWithFeature}
            pointsOfInterest={pointsOfInterest}
            reverseGeocode={reverseGeocode}
            selectedTimeCutoff={timeCutoff.selected}
            start={geocoder.start}
          />
          {data.networks.map((network, index) => (
            <RouteCard
              active={network.active}
              alternate={index !== 0}
              isLoading={isLoading}
              key={`${index}-route-card`}
              onClick={this._setActiveNetwork(network.name)}
              title={network.name}
            >
              {!isLoading &&
                <RouteAccess
                  accessibility={accessibility[index]}
                  grids={data.grids}
                  hasStart={!!geocoder.start}
                  oldAccessibility={accessibility[0]}
                  showComparison={showComparison}
                />}
              {!isLoading && !!geocoder.end && !!geocoder.start &&
                <RouteSegments
                  oldTravelTime={travelTimes[0]}
                  routeSegments={(allTransitiveData[index] || {}).routeSegments}
                  travelTime={travelTimes[index]}
                />}
            </RouteCard>
          ))}
          {ui.showLog &&
            <div className='Card'>
              <div className='CardTitle'>
                {message('Log.Title')}
              </div>
              <Log items={actionLog} />
            </div>}
          {ui.showLink &&
            <div className='Card'>
              <div className='CardContent Attribution'>
                site made by
                {' '}
                <a href='https://www.conveyal.com' target='_blank'>
                  conveyal
                </a>
              </div>
            </div>}
          {ui.allowChangeConfig &&
            <div className='Card'>
              <a
                className='CardTitle'
                tabIndex={0}
                onClick={this._changeConfig}
              >
                config <span className='pull-right'>change</span>
              </a>
              <div className='CardContent'>
                <pre>{window.localStorage.getItem('taui-config')}</pre>
              </div>
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
