import React from 'react'

import MapboxGeocoder from './geocoder'
import styles from './style.css'

const Geocoder = ({ accessToken, onSelect, inputPlaceholder }) => {
  return <MapboxGeocoder
    accessToken={accessToken}
    focusOnMount={false}
    onSelect={onSelect}
    inputClass='form-control'
    resultsClass={styles.geocoderMenu}
    resultClass={styles.geocoderItem}
    inputPlaceholder={inputPlaceholder}
    />
}

export default Geocoder
