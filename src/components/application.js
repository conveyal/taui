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

type Network = {
  name: string,
  active: boolean
}

type MapState = {
  centerCoordinates: Coordinate,
  tileUrl: string,
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
  isochrones: any[],
  mapMarkers: any,
  map: MapState,
  pointsOfInterest: PointsOfInterest,
  showComparison: boolean,
  timeCutoff: any,
  travelTimes: number[],
  ui: UIStore,

  clearIsochrone: () => void,
  setActiveNetwork: (name: string) => void,
  setEnd: (any) => void,
  setSelectedTimeCutoff: (any) => void,
  setStart: (any) => void,
  updateEnd: (any) => void,
  updateEndPosition: (LonLat) => void,
  updateMap: (any) => void,
  updateStart: (any) => void,
  updateStartPosition: (LonLat) => void
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

  _setStartWithEvent = (event: MapEvent) => {
    this.props.updateStartPosition(lonlat(event.latlng || event.target._latlng))
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

  _setEndWithEvent = (event: MapEvent) => {
    this.props.updateEndPosition(lonlat(event.latlng || event.target._latlng))
  }

  _setEndWithFeature = (feature: PointFeature) => {
    if (!feature) {
      this.props.setEnd(null)
    } else {
      const {geometry} = feature

      this.props.updateEnd({
        label: feature.properties.label,
        position: lonlat(geometry.coordinates)
      })
    }
  }

  _onTimeCutoffChange = (event: InputEvent) => {
    this.props.setSelectedTimeCutoff(parseInt(event.currentTarget.value, 10))
  }

  _setActiveNetwork = memoize(name => () =>
    this.props.setActiveNetwork(name))

  count = 0
  render () {
    const {
      accessibility,
      actionLog,
      activeNetworkIndex,
      activeTransitive,
      allTransitiveData,
      data,
      geocoder,
      isochrones,
      map,
      pointsOfInterest,
      showComparison,
      timeCutoff,
      travelTimes,
      ui,
      updateEndPosition,
      updateMap,
      updateStartPosition
    } = this.props
    const {markers} = this.state

    return (
      <div>
        <div className='Fullscreen'>
          <Map
            {...map}
            activeNetworkIndex={activeNetworkIndex}
            centerCoordinates={map.centerCoordinates}
            clearStartAndEnd={this._clearStartAndEnd}
            isochrones={isochrones}
            markers={markers}
            pointsOfInterest={pointsOfInterest}
            setEndPosition={updateEndPosition}
            setStartPosition={updateStartPosition}
            transitive={activeTransitive}
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
            {data.networks.map((network, index) => (
              <RouteCard
                accessibility={accessibility[index]}
                active={network.active}
                alternate={index !== 0}
                grids={data.grids}
                hasEnd={!!geocoder.end}
                hasStart={!!geocoder.start}
                key={`${index}-route-card`}
                oldAccessibility={accessibility[0]}
                oldTravelTime={travelTimes[0]}
                onClick={this._setActiveNetwork(network.name)}
                routeSegments={(allTransitiveData[index] || {}).routeSegments}
                showComparison={showComparison}
                travelTime={travelTimes[index]}
              >
                {network.name}
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
