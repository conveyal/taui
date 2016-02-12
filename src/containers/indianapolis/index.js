import lonlng from 'lonlng'
import React, {Component, PropTypes} from 'react'
import Dock from 'react-dock'
import {connect} from 'react-redux'

import {clearDestination, updateDestination, updateOrigin, updateSelectedTimeCutoff} from '../../actions'
import Form from './form'
import Fullscreen from '../../components/fullscreen'
import Log from '../../components/log'
import Map from './map'
import RouteCard from '../../components/route-card'
import styles from './style.css'

class Indianapolis extends Component {
  static propTypes = {
    actionLog: PropTypes.arrayOf(PropTypes.object),
    browsochrones: PropTypes.object.isRequired,
    clearDestination: PropTypes.func.isRequired,
    geocoder: PropTypes.object,
    mapMarkers: PropTypes.object,
    map: PropTypes.object,
    moveDestination: PropTypes.func.isRequired,
    moveOrigin: PropTypes.func.isRequired,
    onTimeCutoffChange: PropTypes.func.isRequired,
    timeCutoff: PropTypes.shape({
      selected: PropTypes.number
    }),
    zoom: PropTypes.number
  };

  moveOrigin ({latlng, label}) {
    this.props.moveOrigin({
      apiKey: this.props.geocoder.apiKey,
      browsochrones: this.props.browsochrones,
      label,
      latlng: lonlng(latlng),
      timeCutoff: this.props.timeCutoff.selected,
      zoom: this.props.map.zoom
    })
  }

  changeStartAddress (input) {
    if (!input) return
    const {geometry, properties} = input

    this.moveOrigin({
      label: properties.label,
      latlng: geometry.coordinates
    })
  }

  moveDestination ({latlng, label}) {
    this.props.moveDestination({
      apiKey: this.props.geocoder.apiKey,
      browsochrones: this.props.browsochrones,
      label,
      latlng: lonlng(latlng),
      zoom: this.props.map.zoom
    })
  }

  changeEndAddress (input) {
    if (!input) {
      this.props.clearDestination()
    } else {
      const {geometry, properties} = input

      this.moveDestination({
        label: properties.label,
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
        onLeafletDragEnd: event => this.moveOrigin({latlng: event.target._latlng})
      })
    }

    if (mapMarkers.destination && mapMarkers.destination.latlng) {
      markers.push({
        position: mapMarkers.destination.latlng,
        label: mapMarkers.destination.label || '',
        onAdd: event => this.moveDestination({latlng: event.target._latlng}),
        onLeafletDragEnd: event => this.moveDestination({latlng: event.target._latlng})
      })
    }

    return <Map
      {...map}
      markers={markers}
      />
  }

  count = 0;
  lastRender = new Date();

  render () {
    const {geocoder, map} = this.props

    const now = new Date()
    console.log(`render ${this.count++} last was ${now - this.lastRender}ms ago`)
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
          <div className={styles.dockContent}>
            <Form
              accessibility={0}
              geocoder={geocoder}
              onTimeCutoffChange={event => this.onTimeCutoffChange(parseInt(event.target.value, 10))}
              onChangeEnd={input => this.changeEndAddress(input)}
              onChangeStart={input => this.changeStartAddress(input)}
              />
            {map.transitive &&
              <RouteCard
                styles={styles}
                transitiveData={map.transitive}
                travelTime={0}
                />
            }
          </div>
          <div className={styles.dockedActionLog}>
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
    }
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(Indianapolis)
