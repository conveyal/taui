// @flow
import lonlat from '@conveyal/lonlat'
import message from '@conveyal/woonerf/message'
import isEqual from 'lodash/isEqual'
import memoize from 'lodash/memoize'
import React, {Component} from 'react'

import Form from './form'
import Icon from './icon'
import Log from './log'
import Map from './map'
import RouteCard from './route-card'

import type {
  Coordinate,
  GeocoderStore,
  LogItems,
  LonLat,
  InputEvent,
  MapEvent,
  PointFeature,
  PointsOfInterest,
  UIStore
} from '../types'

type Origin = {
  name: string,
  active: boolean
}

type MapState = {
  centerCoordinates: Coordinate,
  tileUrl: string,
  transitive: any,
  travelTimes: any[],
  waitTimes: any[],
  zoom: number
}

type Props = {
  accessibility: number[][],
  actionLog: LogItems,
  data: {
    grids: string[],
    origins: Origin[]
  },
  geocoder: GeocoderStore,
  isochrones: any[],
  journeys: any[],
  mapMarkers: any,
  map: MapState,
  pointsOfInterest: PointsOfInterest,
  showComparison: boolean,
  timeCutoff: any,
  ui: UIStore,

  clearIsochrone(): void,
  initialize: () => void,
  setActiveOrigin: (name: string) => void,
  setEnd: (any) => void,
  setSelectedTimeCutoff: (any) => void,
  setStart: (any) => void,
  updateEnd: (any) => void,
  updateMap: (any) => void,
  updateStart: (any) => void
}

type Marker = {
  position: Coordinate,
  label: string,
  onDragEnd: (MapEvent) => void
}

type State = {
  markers: Marker[]
}

export default class Application extends Component {
  props: Props
  state: State

  state = {
    markers: this._createMarkersFromProps(this.props)
  }

  componentDidMount () {
    this.props.initialize()
  }

  componentWillReceiveProps (nextProps: Props) {
    if (!isEqual(this.props.mapMarkers, nextProps.mapMarkers)) {
      this.setState({markers: this._createMarkersFromProps(nextProps)})
    }
  }

  _clearStartAndEnd = () => {
    const {clearIsochrone, setEnd, setStart} = this.props
    setStart(null)
    clearIsochrone()
    setEnd(null)
  }

  _createMarkersFromProps (props: Props): Marker[] {
    const {mapMarkers} = props
    const markers = []
    if (mapMarkers.start && mapMarkers.start.position) {
      markers.push({
        position: mapMarkers.start.position,
        label: mapMarkers.start.label || '',
        onDragEnd: this._setStartWithEvent
      })
    }

    if (mapMarkers.end && mapMarkers.end.position) {
      markers.push({
        position: mapMarkers.end.position,
        label: mapMarkers.end.label || '',
        onDragEnd: this._setEndWithEvent
      })
    }

    return markers
  }

  _setStart = (opts: {label?: string, position: LonLat}) => {
    this.props.updateStart(opts)
  }

  _setStartWithEvent = (event: MapEvent) => {
    this.props.updateStart({position: lonlat(event.latlng || event.target._latlng)})
  }

  _setStartWithFeature = (feature?: PointFeature) => {
    if (!feature) {
      this._clearStartAndEnd()
    } else {
      this.props.updateStart({
        label: feature.properties.label,
        position: lonlat(feature.geometry.coordinates)
      })
    }
  }

  _setEnd = (opts: {label?: string, position: LonLat}) => {
    this.props.updateEnd(opts)
  }

  _setEndWithEvent = (event: MapEvent) => {
    this.props.updateEnd({position: lonlat(event.latlng || event.target._latlng)})
  }

  _setEndWithFeature = (feature: PointFeature) => {
    if (!feature) {
      this.props.setEnd(null)
    } else {
      const {geometry} = feature

      this._setEnd({
        label: feature.properties.label,
        position: lonlat(geometry.coordinates)
      })
    }
  }

  _onTimeCutoffChange = (event: InputEvent) => {
    this.props.setSelectedTimeCutoff(parseInt(event.currentTarget.value, 10))
  }

  _setActiveOrigin = memoize(name => () =>
    this.props.setActiveOrigin(name))

  count = 0
  render () {
    const {
      accessibility,
      actionLog,
      data,
      geocoder,
      isochrones,
      journeys,
      map,
      pointsOfInterest,
      showComparison,
      timeCutoff,
      ui,
      updateMap
    } = this.props
    const {markers} = this.state

    return (
      <div>
        <div className='Fullscreen'>
          <Map
            {...map}
            centerCoordinates={map.centerCoordinates}
            clearStartAndEnd={this._clearStartAndEnd}
            isochrones={isochrones}
            markers={markers}
            pointsOfInterest={pointsOfInterest}
            setEnd={this._setEnd}
            setStart={this._setStart}
            transitive={map.transitive}
            updateMap={updateMap}
            zoom={map.zoom}
          />
        </div>
        <div className='Taui-Dock'>
          <div className='Taui-Dock-content'>
            <div className='title'>
              {ui.fetches > 0
                ? <Icon type='spinner' className='fa-spin' />
                : <Icon type='map' />}
              {' '}
              {message('Title')}
            </div>
            <Form
              boundary={geocoder.boundary}
              end={geocoder.end}
              focusLatlng={geocoder.focusLatlng}
              onTimeCutoffChange={this._onTimeCutoffChange}
              onChangeEnd={this._setEndWithFeature}
              onChangeStart={this._setStartWithFeature}
              pointsOfInterest={pointsOfInterest}
              selectedTimeCutoff={timeCutoff.selected}
              start={geocoder.start}
            />
            {data.origins.map((origin, index) => (
              <RouteCard
                accessibility={accessibility[index]}
                active={origin.active}
                alternate={index !== 0}
                grids={data.grids}
                hasEnd={!!geocoder.end}
                hasStart={!!geocoder.start}
                key={`${index}-route-card`}
                journeys={journeys[index]}
                oldAccessibility={accessibility[0]}
                oldTravelTime={map.travelTimes[0]}
                onClick={this._setActiveOrigin(origin.name)}
                showComparison={showComparison}
                travelTime={map.travelTimes[index]}
                waitTime={map.waitTimes[index]}
              >
                {origin.name}
              </RouteCard>
            ))}
            {ui.showLog &&
              actionLog &&
              actionLog.length > 0 &&
              <div className='Card'>
                <div className='CardTitle'>
                  {message('Log.Title')}
                </div>
                <Log items={actionLog} />
              </div>}
          </div>
        </div>
      </div>
    )
  }
}
