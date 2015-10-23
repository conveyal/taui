import Leaflet from 'leaflet'
import React, {Component, PropTypes} from 'react'
import {Marker, Popup} from 'react-leaflet'
import {connect} from 'react-redux'

import {updateMapMarker, updateMapState, updateSelectedDestination} from '../../actions'
import Analyst from '../../analyst.js'
import {mapbox} from '../../config'
import Fullscreen from '../../components/fullscreen'
import Geocoder from '../../components/geocoder'
import log from '../../log'
import Log from '../../components/log'
import LogItem from '../../components/log-item'
import Map from '../../components/map'
import styles from './style.css'

const analyst = new Analyst(Leaflet, {
  baseUrl: 'https://analyst.conveyal.com:443',
  showIso: true
})

console.log(analyst)

function printLL (ll) {
  return `[ ${ll[0].toFixed(4)}, ${ll[1].toFixed(4)} ]`
}

// analyst.obtainClientCredentials('VUYJ6D31V9J1XX838H0LQNMXX', '3amuWUc1Q2Cwv50oRYXVCzjLDFbJSwWlVL7SOe961wM')

const MODES = ['Car', 'Transit', 'Walk', 'Bike', 'Bike to Transit']

class Place extends Component {
  static propTypes = {
    actionLog: PropTypes.arrayOf(PropTypes.object),
    destinations: PropTypes.object,
    dispatch: PropTypes.any,
    mapMarker: PropTypes.object,
    map: PropTypes.object
  }

  render () {
    const {actionLog, destinations, dispatch, map, mapMarker} = this.props

    // let isoLayer = null
    let mapContents = ''
    if (mapMarker && mapMarker.position) {
      mapContents = (
        <Marker
          draggable={true}
          position={mapMarker.position}
          onLeafletDragEnd={e => {
            const {lat, lng} = e.target._latlng
            log(`Dragged marker to ${printLL([lat, lng])}`)

            dispatch(updateMapMarker({
              position: [lat, lng],
              text: ''
            }))
          }}>
          {mapMarker.text && <Popup><span>{mapMarker.text}</span></Popup>}
        </Marker>
      )
    }

    return (
      <Fullscreen>
        <div className={styles.main}>
          <Map
            className={styles.map}
            map={map}
            onClick={e => {
              const {lat, lng} = e.latlng
              log(`Clicked map at ${printLL([lat, lng])}`)

              dispatch(updateMapMarker({
                position: [lat, lng],
                text: ''
              }))
            }}>
            {mapContents}
          </Map>
          <div className={styles.sideBar}>
            <div className={styles.navbar}><img src='https://analyst.conveyal.com/images/logo.png' /> Site Accessibility</div>
            <form>
              <fieldset className='form-group' style={{position: 'relative'}}>
                <Geocoder
                  accessToken={mapbox.accessToken}
                  focusOnMount={false}
                  onSelect={place => {
                    const [lng, lat] = place.center

                    dispatch(updateMapMarker({
                      position: [lat, lng],
                      text: place.place_name
                    }))

                    dispatch(updateMapState({
                      center: [lat, lng]
                    }))

                    log(`Selected: ${place.place_name}`)
                  }}
                  inputClass='form-control'
                  resultsClass={styles.geocoderMenu}
                  resultClass={styles.geocoderItem}
                  inputPlaceholder='Search for an address'
                  />
              </fieldset>
              <fieldset className='form-group'>
                <label>Select a key indicator</label>
                <select
                  className='form-control'
                  onChange={e => {
                    dispatch(updateSelectedDestination(e.target.value))
                    log(`Selected new destination set: ${e.target.value}`)
                  }}
                  value={destinations.selected.id}>
                  {destinations.sets.map(destination => <option value={destination.id} key={destination.id}>{destination.name}</option>)}
                </select>
              </fieldset>
              <fieldset className='form-group'>
                <label>Travel mode</label>
                <select className='form-control'>
                  {MODES.map(mode => <option value={mode} key={mode}>{mode}</option>)}
                </select>
              </fieldset>
            </form>
            <label>Accessibility Results</label>
            <ul>
              <li><strong>78,564</strong> — indicators accessible within 60 min</li>
              <li><strong>85</strong> — transit score</li>
              <li><strong>55</strong> — bike / walk score</li>
            </ul>

            <label>Action Log</label>
            <Log>{actionLog.map((logItem, index) => <LogItem {...logItem} key={index} />)}</Log>
          </div>
        </div>
      </Fullscreen>
    )
  }
}

export default connect(s => s)(Place)
