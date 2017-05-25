// @flow
import lonlat from '@conveyal/lonlat'
import isEqual from 'lodash/isEqual'
import React, {Component} from 'react'

import Form from './form'
import Icon from './icon'
import Log from './log'
import Map from './map'
import messages from '../utils/messages'
import RouteCard from './route-card'

import type {Coordinate, LogItems, InputEvent, MapEvent, PointFeature} from '../types'

type Props = {
  actionLog: LogItems,
  browsochrones: any,
  destinations: any,
  geocoder: any,
  mapMarkers: any,
  map: any,
  timeCutoff: any,
  ui: any,
  zoom: number,

  clearEnd(): void,
  clearIsochrone(): void,
  clearStart(): void,
  initializeBrowsochrones(any): void,
  setActiveBrowsochronesInstance(number): void,
  updateEnd(any): void,
  updateStart(any): void,
  updateSelectedTimeCutoff(any): void
}

type Marker = {
  position: Coordinate,
  label: string,
  onDragEnd(MapEvent): void
}

type State = {
  markers: Marker[]
}

export default class Application extends Component<void, Props, State> {
  state = {
    markers: this._createMarkersFromProps(this.props)
  }

  constructor (props: Props) {
    super(props)
    const {browsochrones, initializeBrowsochrones, geocoder, map} = props
    initializeBrowsochrones({
      browsochrones,
      geocoder,
      map
    })
  }

  componentWillReceiveProps (nextProps: Props) {
    if (!isEqual(this.props.mapMarkers, nextProps.mapMarkers)) {
      this.setState({markers: this._createMarkersFromProps(nextProps)})
    }
  }

  _clearStartAndEnd = () => {
    const {clearEnd, clearIsochrone, clearStart} = this.props
    clearStart()
    clearIsochrone()
    clearEnd()
  }

  _createMarkersFromProps (props: Props) {
    const {mapMarkers} = props
    const markers = []
    if (mapMarkers.start && mapMarkers.start.latlng) {
      markers.push({
        position: mapMarkers.start.latlng,
        label: mapMarkers.start.label || '',
        onDragEnd: this._setStartWithEvent
      })
    }

    if (mapMarkers.end && mapMarkers.end.latlng) {
      markers.push({
        position: mapMarkers.end.latlng,
        label: mapMarkers.end.label || '',
        onDragEnd: this._setEndWithEvent
      })
    }
    return markers
  }

  _setStart = ({label, latlng}: {
    label?: string,
    latlng: Coordinate
  }) => {
    const {browsochrones, map, mapMarkers, timeCutoff, updateStart} = this.props
    const endLatlng = mapMarkers.end && mapMarkers.end.latlng
      ? mapMarkers.end.latlng
      : null

    updateStart({
      browsochronesInstances: browsochrones.instances,
      endLatlng,
      label,
      latlng: lonlat(latlng),
      timeCutoff: timeCutoff.selected,
      zoom: map.zoom
    })
  }

  _setStartWithEvent = (event: MapEvent) => {
    this._setStart({latlng: event.latlng || event.currentTarget._latlng})
  }

  _setStartWithFeature = (feature: PointFeature) => {
    if (!feature) {
      this._clearStartAndEnd()
    } else {
      const {geometry} = feature

      this._setStart({
        label: feature.properties.label,
        latlng: geometry.coordinates
      })
    }
  }

  _setEnd = ({label, latlng}: {
    label?: string,
    latlng: Coordinate
  }) => {
    const {browsochrones, map, mapMarkers, updateEnd} = this.props
    updateEnd({
      browsochronesInstances: browsochrones.instances,
      startLatlng: mapMarkers.start.latlng,
      label,
      latlng: lonlat(latlng),
      zoom: map.zoom
    })
  }

  _setEndWithEvent = (event: MapEvent) => {
    this._setEnd({latlng: event.latlng || event.currentTarget._latlng})
  }

  _setEndWithFeature = (feature: PointFeature) => {
    if (!feature) {
      this.props.clearEnd()
    } else {
      const {geometry} = feature

      this._setEnd({
        label: feature.properties.label,
        latlng: geometry.coordinates
      })
    }
  }

  _onTimeCutoffChange = (event: InputEvent) => {
    const {browsochrones, mapMarkers, updateSelectedTimeCutoff} = this.props
    const timeCutoff = parseInt(event.currentTarget.value, 10)
    updateSelectedTimeCutoff({
      browsochrones,
      latlng: mapMarkers.start.latlng,
      timeCutoff
    })
  }

  count = 0
  render () {
    const {
      actionLog,
      browsochrones,
      destinations,
      geocoder,
      map,
      setActiveBrowsochronesInstance,
      timeCutoff,
      ui
    } = this.props
    const {markers} = this.state

    return (
      <div>
        <div className='Fullscreen'>
          <Map
            {...map}
            clearStartAndEnd={this._clearStartAndEnd}
            geojsonColor={browsochrones.active === 0 ? '#4269a4' : 'darkorange'}
            markers={markers}
            setEnd={this._setEnd}
            setStart={this._setStart}
          />
        </div>
        <div className='Taui-Dock'>
          <div className='Taui-Dock-content'>
            <div className='title'>
              {ui.fetches > 0
                ? <Icon type='spinner' className='fa-spin' />
                : <Icon type='map' />}
              {' '}
              {messages.Title}
            </div>
            <Form
              geocoder={geocoder}
              onTimeCutoffChange={this._onTimeCutoffChange}
              onChangeEnd={this._setEndWithFeature}
              onChangeStart={this._setStartWithFeature}
              selectedTimeCutoff={timeCutoff.selected}
            />
            {destinations.accessibility.map((accessibility, index) => (
              <RouteCard
                accessibility={accessibility.accessibility}
                active={browsochrones.active === index}
                alternate={index !== 0}
                key={`${index}-route-card`}
                oldAccessibility={destinations.accessibility[0].accessibility}
                oldTravelTime={map.travelTimes[0]}
                onClick={() => setActiveBrowsochronesInstance(index)}
                transitiveData={map.transitives[index]}
                travelTime={map.travelTimes[index]}
                waitTime={map.waitTimes[index]}
              >
                {accessibility.name}
              </RouteCard>
            ))}
            {ui.showLog &&
              actionLog &&
              actionLog.length > 0 &&
              <div className='Card'>
                <div className='CardTitle'>{messages.Log.Title}</div>
                <Log items={this.props.actionLog} />
              </div>}
          </div>
        </div>
      </div>
    )
  }
}