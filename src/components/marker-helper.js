import React, {Component, PropTypes} from 'react'
import {Marker, Popup} from 'react-leaflet'
import {addActionLogItem, updateMapMarker} from '../actions'

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
 * On Marker drag start, update position of Marker
 *
 * @private
 * @param  {String} type
 * @param  {Function} dispatch
 * @param  {Event} e
 */
function onLeafletDragStart (type, dispatch, e) {
  const {lat, lng} = e.target._latlng
  const position = [lat, lng]

  dispatch(updateMapMarker({
    [type]: {
      isDragging: true,
      position,
      text: ''
    }
  }))
}

/**
 * On Marker drag end, update position of Marker and setting `isDragging` flag to false
 *
 * @private
 * @param  {String} type
 * @param  {Function} dispatch
 * @param  {Event} e
 */
function onLeafletDragEnd (type, dispatch, e) {
  const {lat, lng} = e.target._latlng
  const position = [lat, lng]

  dispatch(addActionLogItem(`Dragged marker to ${printLL(position)}`))
  dispatch(updateMapMarker({
    [type]: {
      isDragging: false,
      position,
      text: ''
    }
  }))
}

/**
 * Helper function for displaying coordinates
 *
 * @private
 * @param  {Array} ll
 * @return {String}
 */
function printLL (ll) {
  return `[ ${ll[0].toFixed(4)}, ${ll[1].toFixed(4)} ]`
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
  if (marker && marker.position) {
    return (
      <Marker
        draggable={true}
        key={type}
        position={marker.position}
        onLeafletDragStart={onLeafletDragStart.bind(undefined, type, dispatch)}
        onLeafletDragEnd={onLeafletDragEnd.bind(undefined, type, dispatch)}
        onAdd={onAdd}
        onMove={onMove}>
        {marker.text && <Popup><span>{marker.text}</span></Popup>}
      </Marker>
    )
  }
  return null;
}
const mapMarkerConstants = TYPES
export {renderMarker as default, mapMarkerConstants}