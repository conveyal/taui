import React, {Component, PropTypes} from 'react'
import {Marker, Popup} from 'react-leaflet'
import {connect} from 'react-redux'

import {updateMapMarker, updateMap} from '../../actions'
import {getOrigin} from '../../browsochrones'
import {mapbox} from '../../config'
import DestinationsSelect from '../../components/destinations-select'
import Fullscreen from '../../components/fullscreen'
import Geocoder from '../../components/geocoder'
import log from '../../log'
import Log from '../../components/log'
import Map from '../../components/map'
import styles from './style.css'

function printLL (ll) {
  return `[ ${ll[0].toFixed(4)}, ${ll[1].toFixed(4)} ]`
}

class Indianapolis extends Component {
  static propTypes = {
    dispatch: PropTypes.any,
    mapMarker: PropTypes.object,
    map: PropTypes.object
  }

  updateBrowsochrones (event) {
    log(`Retrieving isochrones for origin.`)
    getOrigin(event)
      .then(bc => {
        const afc = bc.getAccessibilityForCutoff()
        log(`Origin has access to ${afc.toLocaleString()} jobs within 60 minutes.`)
      })
  }

  render () {
    const {dispatch, map, mapMarker} = this.props

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

              dispatch(updateMapMarker({
                position: [lat, lng],
                text: ''
              }))
            }}>
            {(() => {
              if (mapMarker && mapMarker.position) {
                return (
                  <Marker
                    draggable={true}
                    position={mapMarker.position}
                    onLeafletDragStart={e => {
                      const {lat, lng} = e.target._latlng
                      const position = [lat, lng]

                      dispatch(updateMapMarker({
                        isDragging: true,
                        position,
                        text: ''
                      }))
                    }}
                    onLeafletDragEnd={e => {
                      const {lat, lng} = e.target._latlng
                      const position = [lat, lng]
                      log(`Dragged marker to ${printLL(position)}`)

                      dispatch(updateMapMarker({
                        isDragging: false,
                        position,
                        text: ''
                      }))
                    }}
                    onMove={e => {
                      if (!mapMarker.isDragging) {
                        this.updateBrowsochrones(e)
                      }
                    }}>
                    {mapMarker.text && <Popup><span>{mapMarker.text}</span></Popup>}
                  </Marker>
                )
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

                      dispatch(updateMapMarker({
                        position,
                        text: place.place_name
                      }))

                      log(`Selected: ${place.place_name}`)
                    }}
                    />
                </fieldset>
                <fieldset className='form-group'>
                  <label>Select a key indicator</label>
                  <DestinationsSelect className='form-control' />
                </fieldset>
              </form>
            </div>

            <div className={styles.navbar}>Indianapolis</div>
            <div className={styles.dockedActionLog}><Log /></div>
          </div>
        </div>
      </Fullscreen>
    )
  }
}

export default connect(s => s)(Indianapolis)
