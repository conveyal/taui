import lonlat from '@conveyal/lonlat'
import isEqual from 'lodash.isequal'
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
    setActiveBrowsochronesInstance: PropTypes.func.isRequired,
    updateEnd: PropTypes.func.isRequired,
    updateStart: PropTypes.func.isRequired,
    updateSelectedTimeCutoff: PropTypes.func.isRequired
  }

  state = {
    markers: this._createMarkersFromProps(this.props)
  }

  constructor (props) {
    super(props)
    const {browsochrones, initializeBrowsochrones, geocoder, map} = props
    initializeBrowsochrones({
      browsochrones,
      geocoder,
      map
    })
  }

  componentWillReceiveProps (nextProps) {
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

  _createMarkersFromProps (props) {
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

  _setStart = ({
    label,
    latlng
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
    const {browsochrones, map, mapMarkers, updateEnd} = this.props
    updateEnd({
      browsochronesInstances: browsochrones.instances,
      startLatlng: mapMarkers.start.latlng,
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
    const {browsochrones, mapMarkers, updateSelectedTimeCutoff} = this.props
    const timeCutoff = parseInt(event.target.value, 10)
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
        <Fullscreen>
          <Map
            {...map}
            clearStartAndEnd={this._clearStartAndEnd}
            geojsonColor={browsochrones.active === 0 ? '#4269a4' : 'darkorange'}
            markers={markers}
            setEnd={this._setEnd}
            setStart={this._setStart}
            />
        </Fullscreen>
        <div className='Taui-Dock'>
          <div className='Taui-Dock-content'>
            <div className='title'>
              {ui.fetches > 0
                ? <Icon type='spinner' className='fa-spin' />
                : <Icon type='map' />} {messages.Title}
            </div>
            <Form
              geocoder={geocoder}
              onTimeCutoffChange={this._onTimeCutoffChange}
              onChangeEnd={this._setEndWithFeature}
              onChangeStart={this._setStartWithFeature}
              selectedTimeCutoff={timeCutoff.selected}
              />
            {destinations.accessibility
              .filter((accessibility) => !!accessibility)
              .map((accessibility, index) =>
                <RouteCard
                  accessibility={accessibility}
                  active={browsochrones.active === index}
                  alternate={index !== 0}
                  key={`${index}-route-card`}
                  oldAccessibility={destinations.accessibility[0]}
                  oldTravelTime={map.travelTimes[0]}
                  onClick={() => setActiveBrowsochronesInstance(index)}
                  transitiveData={map.transitives[index]}
                  travelTime={map.travelTimes[index]}
                  waitTime={map.waitTimes[index]}
                  >
                  {index !== 0 ? `${messages.Systems.BaseTitle} ${index}` : messages.Systems.ComparisonTitle}
                </RouteCard>
              )}
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
