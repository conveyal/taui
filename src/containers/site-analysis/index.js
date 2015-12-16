import React, {Component, PropTypes} from 'react'
import {Marker, Popup, TileLayer} from 'react-leaflet'
import {connect} from 'react-redux'

import {addActionLogItem, fetchSinglePoint, updateMapMarker, updateMap} from '../../actions'
import {mapbox} from '../../config'
import DestinationsSelect from '../../components/destinations-select'
import Fullscreen from '../../components/fullscreen'
import Geocoder from '../../components/geocoder'
import Log from '../../components/log'
import Map from '../../components/map'
import styles from './style.css'
import TransitModeSelect from '../../components/transit-mode-select'

function printLL (ll) {
  return `[ ${ll[0].toFixed(4)}, ${ll[1].toFixed(4)} ]`
}

function updateMarkerAndSinglePoint (dispatch, query) {
  dispatch(updateMapMarker(query))
  fetchSinglePoint(query)(dispatch)
}

class SiteAnalysis extends Component {
  static propTypes = {
    dispatch: PropTypes.any,
    mapMarker: PropTypes.object,
    map: PropTypes.object,
    singlePoint: PropTypes.object
  }

  log (l) {
    this.props.dispatch(addActionLogItem(l))
  }

  render () {
    const {dispatch, map, mapMarker, singlePoint} = this.props

    return (
      <Fullscreen>
        <div className={styles.main}>
          <Map
            className={styles.map}
            map={map}
            onChange={state => dispatch(updateMap(state))}
            onClick={e => {
              const {lat, lng} = e.latlng
              this.log(`Clicked map at ${printLL([lat, lng])}`)

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
                      this.log(`Dragged marker to ${printLL(position)}`)

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

                      this.log(`Selected: ${place.place_name}`)
                    }}
                    />
                </fieldset>
                <fieldset className='form-group'>
                  <label>Select a key indicator</label>
                  <DestinationsSelect className='form-control' />
                </fieldset>
                <fieldset className='form-group'>
                  <label>Travel mode</label>
                  <TransitModeSelect className='form-control' />
                </fieldset>
              </form>
            </div>

            <div className={styles.navbar}><img src='https://analyst.conveyal.com/images/logo.png' /> Site Accessibility</div>
            <div className={styles.dockedActionLog}><Log /></div>
          </div>
        </div>
      </Fullscreen>
    )
  }
}

export default connect(s => s)(SiteAnalysis)
