import lonlat from '@conveyal/lonlat'
import React, {Component, PropTypes} from 'react'

import featureToLabel from '../utils/feature-to-label'
import Form from './form'
import Fullscreen from './fullscreen'
import Icon from './icon'
import Log from './log'
import Map from './map'
import messages from '../utils/messages'
import RouteCard from './route-card'

export default class Application extends Component {
  static propTypes = {
    actionLog: PropTypes.arrayOf(PropTypes.object),
    browsochrones: PropTypes.object.isRequired,
    destinations: PropTypes.object,
    geocoder: PropTypes.object,
    history: PropTypes.any,
    mapMarkers: PropTypes.object,
    map: PropTypes.object,
    timeCutoff: PropTypes.shape({
      selected: PropTypes.number
    }),
    ui: PropTypes.object.isRequired,
    zoom: PropTypes.number,

    clearEnd: PropTypes.func.isRequired,
    clearIsochrone: PropTypes.func.isRequired,
    clearStart: PropTypes.func.isRequired,
    initializeBrowsochrones: PropTypes.func.isRequired,
    moveDestination: PropTypes.func.isRequired,
    moveOrigin: PropTypes.func.isRequired,
    onTimeCutoffChange: PropTypes.func.isRequired,
    setBaseActive: PropTypes.func,
    setComparisonActive: PropTypes.func
  }

  componentWillMount () {
    const {browsochrones, initializeBrowsochrones, geocoder, map} = this.props
    initializeBrowsochrones({
      browsochrones,
      geocoder,
      map
    })
  }

  _clearStartAndEnd = () => {
    const {clearEnd, clearIsochrone, clearStart} = this.props
    clearStart()
    clearIsochrone()
    clearEnd()
  }

  _setStart = ({
    label,
    latlng
  }) => {
    const {browsochrones, map, mapMarkers, moveOrigin, timeCutoff} = this.props
    const destinationLatlng = mapMarkers.destination && mapMarkers.destination.latlng
      ? mapMarkers.destination.latlng
      : null

    moveOrigin({
      browsochrones,
      destinationLatlng,
      label,
      latlng: lonlat(latlng),
      timeCutoff: timeCutoff.selected,
      zoom: map.zoom
    })
  }

  _setStartWithEvent = (event) => {
    this._setStart({latlng: event.latlng || event.target._latlng})
  }

  _setStartWithFeature = (feature) => {
    if (!feature) {
      this._clearStartAndEnd()
    } else {
      const {geometry} = feature

      this._setStart({
        label: featureToLabel(feature),
        latlng: geometry.coordinates
      })
    }
  }

  _setEnd = ({
    label,
    latlng
  }) => {
    const {browsochrones, map, mapMarkers, moveDestination} = this.props
    moveDestination({
      browsochrones,
      fromLatlng: mapMarkers.origin.latlng,
      label,
      latlng: lonlat(latlng),
      zoom: map.zoom
    })
  }

  _setEndWithEvent = (event) => {
    this._setEnd({latlng: event.latlng || event.target._latlng})
  }

  _setEndWithFeature = (feature) => {
    if (!feature) {
      this.props.clearEnd()
    } else {
      const {geometry} = feature

      this._setEnd({
        label: featureToLabel(feature),
        latlng: geometry.coordinates
      })
    }
  }

  _onTimeCutoffChange = (event) => {
    const timeCutoff = parseInt(event.target.value, 10)
    this.props.onTimeCutoffChange({
      browsochrones: this.props.browsochrones,
      latlng: this.props.mapMarkers.origin.latlng,
      timeCutoff
    })
  }

  renderMap () {
    const {browsochrones, map, mapMarkers} = this.props

    const markers = []
    if (mapMarkers.origin && mapMarkers.origin.latlng) {
      markers.push({
        position: mapMarkers.origin.latlng,
        label: mapMarkers.origin.label || '',
        onDragEnd: this._setStartWithEvent
      })
    }

    if (mapMarkers.destination && mapMarkers.destination.latlng) {
      markers.push({
        position: mapMarkers.destination.latlng,
        label: mapMarkers.destination.label || '',
        onDragEnd: this._setEndWithEvent
      })
    }

    return <Map
      {...map}
      clearStartAndEnd={this._clearStartAndEnd}
      geojsonColor={browsochrones.active === 'base' ? '#4269a4' : 'darkorange'}
      markers={markers}
      setEnd={this._setEnd}
      setStart={this._setStart}
      />
  }

  render () {
    const {
      actionLog,
      browsochrones,
      destinations,
      geocoder,
      map,
      setBaseActive,
      setComparisonActive,
      timeCutoff,
      ui
    } = this.props

    return (
      <div>
        <Fullscreen>
          {this.renderMap({})}
        </Fullscreen>
        <div className='Taui-Dock'>
          <div className='Taui-Dock-content'>
            <div className='title'>
              {ui.fetches > 0
                ? <Icon type='spinner' className='fa-spin' />
                : <Icon type='map' />} {messages.Title}
            </div>
            <Form
              accessibility={destinations.accessibility}
              geocoder={geocoder}
              onTimeCutoffChange={this._onTimeCutoffChange}
              onChangeEnd={this._setEndWithFeature}
              onChangeStart={this._setStartWithFeature}
              selectedTimeCutoff={timeCutoff.selected}
              />
            {destinations.accessibility.base &&
              <RouteCard
                accessibility={destinations.accessibility.base}
                active={browsochrones.active === 'base'}
                oldAccessibility={destinations.accessibility.comparison}
                oldTravelTime={map.comparisonTravelTime}
                onClick={setBaseActive}
                transitiveData={map.baseTransitive}
                travelTime={map.baseTravelTime}
                waitTime={map.baseWaitTime}
                >
                {messages.Systems.BaseTitle}
              </RouteCard>
            }
            {destinations.accessibility.comparison &&
              <RouteCard
                alternate
                active={browsochrones.active === 'comparison'}
                accessibility={destinations.accessibility.comparison}
                onClick={setComparisonActive}
                transitiveData={map.comparisonTransitive}
                travelTime={map.comparisonTravelTime}
                waitTime={map.comparisonWaitTime}
                >
                {messages.Systems.ComparisonTitle}
              </RouteCard>
            }
            {ui.showLog && actionLog && actionLog.length > 0 &&
              <div className='Card'>
                <div className='CardTitle'>{messages.Log.Title}</div>
                <Log
                  items={this.props.actionLog}
                  />
              </div>
            }
          </div>
        </div>
      </div>
    )
  }
}
