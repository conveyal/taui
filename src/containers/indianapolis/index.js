import dbg from 'debug'
import lonlng from 'lonlng'
import React, {Component, PropTypes} from 'react'
import {connect} from 'react-redux'

import {clearEnd, clearStart, setBaseActive, setComparisonActive, updateDestination, updateOrigin, updateSelectedTimeCutoff} from '../../actions'
import featureToLabel from '../../utils/feature-to-label'
import Form from './form'
import Fullscreen from '../../components/fullscreen'
import Icon from '../../components/icon'
import Log from '../../components/log'
import Map from './map'
import messages from '../../utils/messages'
import RouteCard from '../../components/route-card'

const debug = dbg('taui:indianapolis')

class Indianapolis extends Component {
  static propTypes = {
    actionLog: PropTypes.arrayOf(PropTypes.object),
    browsochrones: PropTypes.object.isRequired,
    clearEnd: PropTypes.func.isRequired,
    clearStart: PropTypes.func.isRequired,
    destinations: PropTypes.object,
    geocoder: PropTypes.object,
    mapMarkers: PropTypes.object,
    map: PropTypes.object,
    moveDestination: PropTypes.func.isRequired,
    moveOrigin: PropTypes.func.isRequired,
    onTimeCutoffChange: PropTypes.func.isRequired,
    setBaseActive: PropTypes.func,
    setComparisonActive: PropTypes.func,
    timeCutoff: PropTypes.shape({
      selected: PropTypes.number
    }),
    zoom: PropTypes.number
  }

  _clearStartAndEnd = () => {
    const {clearEnd, clearStart} = this.props
    clearStart()
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
      latlng: lonlng(latlng),
      timeCutoff: timeCutoff.selected,
      zoom: map.zoom
    })
  }

  _setStartWithEvent = (event) => {
    this._setStart({latlng: event.latlng || event.target._latlng})
  }

  _setStartWithFeature = (feature) => {
    if (!feature) {
      this.props.clearStart()
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
    const {browsochrones, map, moveDestination} = this.props
    moveDestination({
      browsochrones,
      label,
      latlng: lonlng(latlng),
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

  count = 0
  lastRender = new Date()

  render () {
    const {browsochrones, destinations, geocoder, map, setBaseActive, setComparisonActive, timeCutoff} = this.props

    const now = new Date()
    debug(`render ${this.count++} last was ${now - this.lastRender}ms ago`)
    this.lastRender = now

    return (
      <div>
        <Fullscreen>
          {this.renderMap({})}
        </Fullscreen>
        <div className='Taui-Dock'>
          <div className='Taui-Dock-content'>
            <div className='title'><Icon type='map' /> {messages.Title}</div>
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
                >
                {messages.Systems.ComparisonTitle}
              </RouteCard>
            }
            <div className='Card'>
              <Log
                items={this.props.actionLog}
                />
            </div>
          </div>
        </div>
      </div>
    )
  }
}

function mapStateToProps (state, ownProps) {
  return state
}

function mapDispatchToProps (dispatch, ownProps) {
  return {
    clearEnd: () => dispatch(clearEnd()),
    clearStart: () => dispatch(clearStart()),
    moveOrigin: (options) => dispatch(updateOrigin(options)),
    moveDestination: (options) => dispatch(updateDestination(options)),
    onTimeCutoffChange: (options) => dispatch(updateSelectedTimeCutoff(options)),
    setBaseActive: () => dispatch(setBaseActive()),
    setComparisonActive: () => dispatch(setComparisonActive())
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(Indianapolis)
