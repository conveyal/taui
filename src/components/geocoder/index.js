import React from 'react'

import MapboxGeocoder from './geocoder'
import styles from './style.css'

const Geocoder = ({ accessToken, onSelect }) => {
  return <MapboxGeocoder
    accessToken={accessToken}
    focusOnMount={false}
    onSelect={onSelect}
    inputClass='form-control'
    resultsClass={styles.geocoderMenu}
    resultClass={styles.geocoderItem}
    inputPlaceholder='Search for an address'
    />
}

export default Geocoder
