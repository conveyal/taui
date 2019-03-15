import React from 'react'
import {Feature, Layer} from 'react-mapbox-gl'

export function createMarker(c) {
  const {iconImage, iconAnchor, iconSize, ...rest} = c
  const layout = {
    'icon-image': iconImage,
    'icon-anchor': iconAnchor || 'bottom',
    'icon-size': iconSize || 1
  }

  return p => <Marker {...rest} {...p} layout={layout} />
}

export default function Marker(p) {
  return (
    <Layer id={p.id} images={p.images} layout={p.layout} type='symbol'>
      <Feature coordinates={[p.position.lon, p.position.lat]} draggable />
    </Layer>
  )
}
