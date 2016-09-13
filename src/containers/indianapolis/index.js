import dbg from 'debug'
import lonlng from 'lonlng'
import React, {Component, PropTypes} from 'react'
import Dock from 'react-dock'
import {connect} from 'react-redux'

import {clearDestination, setBaseActive, setComparisonActive, updateDestination, updateOrigin, updateSelectedTimeCutoff} from '../../actions'
import featureToLabel from '../../utils/feature-to-label'
import Form from './form'
import Fullscreen from '../../components/fullscreen'
import Log from '../../components/log'
import Map from './map'
import messages from '../../utils/messages'
import RouteCard from '../../components/route-card'

import './style.css'

const debug = dbg('taui:indianapolis')

class Indianapolis extends Component {
  static propTypes = {
    actionLog: PropTypes.arrayOf(PropTypes.object),
    browsochrones: PropTypes.object.isRequired,
    clearDestination: PropTypes.func.isRequired,
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
  };

  moveOrigin ({latlng, label}) {
    const {mapMarkers} = this.props
    const destinationLatlng = mapMarkers.destination && mapMarkers.destination.latlng
      ? mapMarkers.destination.latlng
      : null

    this.props.moveOrigin({
      browsochrones: this.props.browsochrones,
      destinationLatlng,
      label,
      latlng: lonlng(latlng),
      timeCutoff: this.props.timeCutoff.selected,
      zoom: this.props.map.zoom
    })
  }

  changeStartAddress (feature) {
    if (!feature) return
    const {geometry} = feature

    this.moveOrigin({
      label: featureToLabel(feature),
      latlng: geometry.coordinates
    })
  }

  moveDestination ({latlng, label}) {
    this.props.moveDestination({
      browsochrones: this.props.browsochrones,
      label,
      latlng: lonlng(latlng),
      zoom: this.props.map.zoom
    })
  }

  changeEndAddress (feature) {
    if (!feature) {
      this.props.clearDestination()
    } else {
      const {geometry} = feature

      this.moveDestination({
        label: featureToLabel(feature),
        latlng: geometry.coordinates
      })
    }
  }

  onTimeCutoffChange (timeCutoff) {
    this.props.onTimeCutoffChange({
      browsochrones: this.props.browsochrones,
      latlng: this.props.mapMarkers.origin.latlng,
      timeCutoff
    })
  }

  renderMap () {
    const {map, mapMarkers} = this.props

    const markers = []
    if (mapMarkers.origin && mapMarkers.origin.latlng) {
      markers.push({
        position: mapMarkers.origin.latlng,
        label: mapMarkers.origin.label || '',
        onDragEnd: (event) => this.moveOrigin({latlng: event.target._latlng})
      })
    }

    if (mapMarkers.destination && mapMarkers.destination.latlng) {
      markers.push({
        position: mapMarkers.destination.latlng,
        label: mapMarkers.destination.label || '',
        onDragEnd: (event) => this.moveDestination({latlng: event.target._latlng})
      })
    }

    return <Map
      {...map}
      markers={markers}
      />
  }

  count = 0
  lastRender = new Date()

  render () {
    const {browsochrones, destinations, geocoder, map, setBaseActive, setComparisonActive} = this.props

    const now = new Date()
    debug(`render ${this.count++} last was ${now - this.lastRender}ms ago`)
    this.lastRender = now

    return (
      <Fullscreen>
        {this.renderMap({})}
        <Dock
          dimMode='none'
          fluid
          isVisible
          position='right'
          dockStyle={{
            backgroundColor: '#6492d9'
          }}
          >
          <div className='Taui-Dock-content'>
            <Form
              accessibility={destinations.accessibility}
              geocoder={geocoder}
              onTimeCutoffChange={(event) => this.onTimeCutoffChange(parseInt(event.target.value, 10))}
              onChangeEnd={(input) => this.changeEndAddress(input)}
              onChangeStart={(input) => this.changeStartAddress(input)}
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
                {messages.Systems.Base.Title}
              </RouteCard>
            }
            {destinations.accessibility.comparison &&
              <RouteCard
                active={browsochrones.active === 'comparison'}
                accessibility={destinations.accessibility.comparison}
                onClick={setComparisonActive}
                transitiveData={map.comparisonTransitive}
                travelTime={map.comparisonTravelTime}
                >
                {messages.Systems.Comparison.Title}
              </RouteCard>
            }
          </div>
          <div className='Taui-ActionLog'>
            <Log
              items={this.props.actionLog}
              />
          </div>
        </Dock>
      </Fullscreen>
    )
  }
}

function mapStateToProps (state, ownProps) {
  return state
}

function mapDispatchToProps (dispatch, ownProps) {
  return {
    clearDestination: () => dispatch(clearDestination()),
    moveOrigin (options) {
      dispatch(updateOrigin(options))
    },
    moveDestination (options) {
      dispatch(updateDestination(options))
    },
    onTimeCutoffChange (options) {
      dispatch(updateSelectedTimeCutoff(options))
    },
    setBaseActive () {
      dispatch(setBaseActive())
    },
    setComparisonActive () {
      dispatch(setComparisonActive())
    }
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(Indianapolis)
