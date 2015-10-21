import React, {Component} from 'react'
import {Map, Marker, Popup, TileLayer} from 'react-leaflet'

import config, {mapbox} from '../config'
import Fullscreen from '../components/fullscreen'
import Log from '../components/log'
import LogItem from '../components/log-item'
import Geocoder from '../components/geocoder'
import styles from './style.css'

const URL = `http://api.tiles.mapbox.com/v4/${mapbox.map}/{z}/{x}/{y}.png?access_token=${mapbox.accessToken}`

export default class Place extends Component {
  constructor () {
    super()
    this.state = {
      center: config.center,
      log: [{
        text: 'Welcome to your location analysis tool! Drag the pin around to see new isochrones!'
      }],
      marker: {
        position: config.center
      },
      zoom: config.zoom
    }
  }

  handleGeocoderSelect (place) {
    const [lng, lat] = place.center
    this.setState({
      center: [lat, lng],
      marker: {
        position: [lat, lng],
        description: place.place_name
      }
    })
  }

  handleMapClick (e) {
    const {lng, lat} = e.latlng
    this.setState({
      marker: {
        position: [lat, lng],
        description: ''
      }
    })
  }

  render () {
    const {center, zoom} = this.state

    let mapContents = ''
    if (this.state.marker) {
      mapContents = (
        <Marker
          draggable={true}
          position={this.state.marker.position}>
          {this.state.marker.description && <Popup><span>{this.state.marker.description}</span></Popup>}
        </Marker>
      )
    }

    return (
      <Fullscreen>
        <div className={styles.main}>
          <Map
            center={center}
            className={styles.map}
            zoom={zoom}
            onLeafletClick={e => this.handleMapClick(e)}>
            <TileLayer
              url={URL}
              attribution='&copy <a href="https://www.mapbox.com/map-feedback/">Mapbox</a> &copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>'
            />
            {mapContents}
          </Map>
          <div className={styles.sideBar}>
            <h4>Location Analysis</h4>
            <form>
              <fieldset className='form-group' style={{position: 'relative'}}>
                <Geocoder
                  accessToken={mapbox.accessToken}
                  focusOnMount={false}
                  onSelect={place => this.handleGeocoderSelect(place)}
                  inputClass='form-control'
                  resultsClass={styles.geocoderMenu}
                  resultClass={styles.geocoderItem}
                  placeholder='Search for an address'
                  />
              </fieldset>
              <fieldset className='form-group'>
                <label>Destinations</label>
                <select className='form-control'>
                  <option>None</option>
                  <optgroup label='Current network'>
                      <option>Baseline</option>
                      <option>Add route E4</option>
                      <option>Lower route 8 frequency</option>
                  </optgroup>
                  <optgroup label='Projected 2020 network'>
                      <option>Baseline</option>
                      <option>Remove routes 5 and 7</option>
                      <option>Double route 3 frequency</option>
                  </optgroup>
                  <option>Add transport data...</option>
                </select>
              </fieldset>
            </form>
            <label>Actions</label>
            <Log>
              {this.state.log.map((logItem, index) => {
                console.log(index)
                return <LogItem {...logItem} key={index} />
              })}
            </Log>
          </div>
        </div>
      </Fullscreen>
    )
  }
}
