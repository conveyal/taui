import React from 'react'
import {Marker, Popup} from 'react-leaflet'

/**
 * A set of string constants for Marker types.
 *
 * @public
 * @constant
 * @type {{string:string}}
 */
const TYPES = {
  ORIGIN: 'originMarker',
  DESTINATION: 'destinationMarker'
}

/**
 * Create array of markers to be rendered
 *
 * @public
 * @param  {Object} mapMarkers
 * @param  {String} type
 * @param  {Function} dispatch
 * @param  {Function} onMove
 * @param  {Function} onAdd
 * @return {ReactComponent}
 */
function renderMarker (mapMarkers, type, dispatch, onMove, onAdd) {
  const marker = mapMarkers[type]
  if (marker && marker.latlng) {
    return (
      <Marker
        draggable
        key={type}
        position={marker.latlng}
        onLeafletDragEnd={onMove}
        onAdd={onAdd}>
        {marker.text && <Popup><span>{marker.text}</span></Popup>}
      </Marker>
    )
  }
  return null
}
const mapMarkerConstants = TYPES
export {renderMarker as default, mapMarkerConstants}
