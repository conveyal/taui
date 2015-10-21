import React, {Component, PropTypes} from 'react'
import {Map, Marker, Popup, TileLayer} from 'react-leaflet'
import {connect} from 'react-redux'

import {addActionLogItem, updateMapMarker, updateMapState, updateSelectedDestination} from '../../actions'
import {mapbox} from '../../config'
import Fullscreen from '../../components/fullscreen'
import Log from '../../components/log'
import LogItem from '../../components/log-item'
import Geocoder from '../../components/geocoder'
import styles from './style.css'

const ATTRIBUTION = `&copy <a href="https://www.mapbox.com/map-feedback/">Mapbox</a> &copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>`
const URL = `http://api.tiles.mapbox.com/v4/${mapbox.map}/{z}/{x}/{y}.png?access_token=${mapbox.accessToken}`

class Place extends Component {
  static propTypes = {
    actionLog: PropTypes.arrayOf(PropTypes.object),
    destinationState: PropTypes.object,
    dispatch: PropTypes.any,
    mapMarker: PropTypes.object,
    mapState: PropTypes.object
  }

  render () {
    const {actionLog, destinationState, dispatch, mapState, mapMarker} = this.props

    let mapContents = ''
    if (mapMarker && mapMarker.position) {
      mapContents = (
        <Marker
          draggable={true}
          position={mapMarker.position}>
          {mapMarker.text && <Popup><span>{mapMarker.text}</span></Popup>}
        </Marker>
      )
    }

    let map = (
      <Map
        center={mapState.center}
        className={styles.map}
        zoom={mapState.zoom}
        onLeafletClick={e => {
          const {lat, lng} = e.latlng
          dispatch(addActionLogItem({
            label: 'Map',
            text: `Clicked map at [${lat}, ${lng}]`,
            type: 'info'
          }))
          dispatch(updateMapMarker({
            position: [lat, lng],
            text: ''
          }))
        }}>
        <TileLayer
          url={URL}
          attribution={ATTRIBUTION}
        />
        {mapContents}
      </Map>
    )

    return (
      <Fullscreen>
        <div className={styles.main}>
          {map}
          <div className={styles.sideBar}>
            <h4>Location Analysis</h4>
            <form>
              <fieldset className='form-group' style={{position: 'relative'}}>
                <Geocoder
                  accessToken={mapbox.accessToken}
                  focusOnMount={false}
                  onSelect={place => {
                    const [lng, lat] = place.center

                    dispatch(addActionLogItem({
                      text: `Selected ${place.place_name}`,
                      type: 'info',
                      label: 'Search'
                    }))

                    dispatch(updateMapMarker({
                      position: [lat, lng],
                      text: place.place_name
                    }))

                    dispatch(updateMapState({
                      center: [lat, lng]
                    }))
                  }}
                  inputClass='form-control'
                  resultsClass={styles.geocoderMenu}
                  resultClass={styles.geocoderItem}
                  placeholder='Search for an address'
                  />
              </fieldset>
              <fieldset className='form-group'>
                <label>Destinations</label>
                <select
                  className='form-control'
                  onChange={e => {
                    dispatch(updateSelectedDestination(e.target.value))
                    dispatch(addActionLogItem({
                      text: `Selected new destination set ${e.target.value}`,
                      type: 'info',
                      label: 'Destination'
                    }))
                  }}
                  value={destinationState.selected}>
                  {destinationState.destinations.map(destination => <option value={destination.id} key={destination.id}>{destination.name}</option>)}
                </select>
              </fieldset>
            </form>
            <label>Actions</label>
            <Log>{actionLog.map((logItem, index) => <LogItem {...logItem} key={index} />)}</Log>
          </div>
        </div>
      </Fullscreen>
    )
  }
}

export default connect(s => s)(Place)
