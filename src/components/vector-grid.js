import Leaflet from 'leaflet'
import React from 'react'
import VectorGrid from 'react-leaflet-vectorgrid/dist/react-leaflet-vectorgrid'

/**
 * Temporary class that fixes VectorGrid's `getFeature`
 */
export default class VGrid extends VectorGrid {
  _propagateEvent (eventHandler, e) {
    if (!eventHandler) return
    const featureId = this._getFeatureId(e.layer)
    const feature = this.getFeature(featureId)
    if (feature) {
      Leaflet.DomEvent.stopPropagation(e)
      eventHandler(feature)
    }
  }

  createLeafletElement (props) {
    const le = super.createLeafletElement(props)
    le.options.rendererFactory = Leaflet.canvas.tile
    return le
  }

  getFeature (featureId) {
    const p = this.props
    return find(p.data.features, f => f.properties[p.idField] === featureId)
  }
}
