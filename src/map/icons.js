import Leaflet from 'leaflet'

const iconWidth = 20
const iconHeight = 20
const iconSize = [iconWidth, iconHeight]
const iconAnchor = [iconWidth / 2, iconHeight + 13] // height plus the pointer size
const iconHTML = '' // <div className="innerMarker"></div>'

export const startIcon = Leaflet.divIcon({
  className: 'LeafletIcon Start',
  html: iconHTML,
  iconAnchor,
  iconSize
})

export const endIcon = Leaflet.divIcon({
  className: 'LeafletIcon End',
  html: iconHTML,
  iconAnchor,
  iconSize
})
