import React, {Component, PropTypes} from 'react'
import {Marker, Popup, TileLayer} from 'react-leaflet'
import {connect} from 'react-redux'

import {fetchSinglePoint, updateMapMarker, updateMap, updateSelectedDestination, updateSelectedTransitMode} from '../../actions'
import {mapbox} from '../../config'
import Fullscreen from '../../components/fullscreen'
import Geocoder from '../../components/geocoder'
import log from '../../log'
import Log from '../../components/log'
import LogItem from '../../components/log-item'
import Map from '../../components/map'
import styles from './style.css'

function printLL (ll) {
  return `[ ${ll[0].toFixed(4)}, ${ll[1].toFixed(4)} ]`
}

function updateMarkerAndSinglePoint (dispatch, query) {
  dispatch(updateMapMarker(query))
  fetchSinglePoint(query)(dispatch)
}

class SiteAnalysis extends Component {
  static propTypes = {
    actionLog: PropTypes.arrayOf(PropTypes.object),
    destinations: PropTypes.object,
    dispatch: PropTypes.any,
    mapMarker: PropTypes.object,
    map: PropTypes.object,
    singlePoint: PropTypes.object,
    transitMode: PropTypes.object
  }

  render () {
    const {actionLog, destinations, dispatch, map, mapMarker, singlePoint, transitMode} = this.props

    return (
      <Fullscreen>
        <div className={styles.main}>
          <Map
            className={styles.map}
            map={map}
            onChange={state => dispatch(updateMap(state))}
            onClick={e => {
              const {lat, lng} = e.latlng
              log(`Clicked map at ${printLL([lat, lng])}`)

              updateMarkerAndSinglePoint(dispatch, {
                position: [lat, lng],
                text: ''
              })
            }}>
            {(() => {
              if (mapMarker && mapMarker.position) {
                return (
                  <Marker
                    draggable={true}
                    position={mapMarker.position}
                    onLeafletDragEnd={e => {
                      const {lat, lng} = e.target._latlng
                      const position = [lat, lng]
                      log(`Dragged marker to ${printLL(position)}`)

                      updateMarkerAndSinglePoint(dispatch, {
                        position,
                        text: ''
                      })
                    }}>
                    {mapMarker.text && <Popup><span>{mapMarker.text}</span></Popup>}
                  </Marker>
                )
              }
            })()}
            {(() => {
              if (singlePoint.key && !singlePoint.isFetching) {
                const url = `https://analyst.conveyal.com/tile/single/${singlePoint.key}/{z}/{x}/{y}.png?showIso=true&showPoints=false&timeLimit=3600&which=AVERAGE`
                return <TileLayer url={url} />
              }
            })()}
          </Map>
          <div className={styles.sideBar}>
            <div className={styles.scrollable}>
              <form>
                <fieldset className='form-group' style={{position: 'relative'}}>
                  <Geocoder
                    accessToken={mapbox.accessToken}
                    onSelect={place => {
                      const [lng, lat] = place.center
                      const position = [lat, lng]

                      updateMarkerAndSinglePoint(dispatch, {
                        position,
                        text: place.place_name
                      })

                      log(`Selected: ${place.place_name}`)
                    }}
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
                  <select
                    className='form-control'
                    onChange={e => {
                      dispatch(updateSelectedTransitMode(e.target.value))
                      log(`Selected new transit mode: ${e.target.value}`)
                    }}
                    value={transitMode.selected}>
                    {transitMode.modes.map(mode => <option value={mode} key={mode}>{mode}</option>)}
                  </select>
                </fieldset>
              </form>
              <label>Accessibility Results</label>
              <ul>
                <li><strong>78,564</strong> — indicators accessible within 60 min</li>
                <li><strong>85</strong> — transit score</li>
                <li><strong>55</strong> — bike / walk score</li>
              </ul>
            </div>

            <div className={styles.navbar}><img src='https://analyst.conveyal.com/images/logo.png' /> Site Accessibility</div>
            <div className={styles.dockedActionLog}>
              <Log>{actionLog.map((logItem, index) => <LogItem {...logItem} key={index} />)}</Log>
            </div>
          </div>
        </div>
      </Fullscreen>
    )
  }
}

export default connect(s => s)(SiteAnalysis)
