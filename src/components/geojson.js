// @flow
import Leaflet from 'leaflet'
import 'leaflet.vectorgrid'
import {MapLayer} from 'react-leaflet'

export default class GeoJSON extends MapLayer {
  createLeafletElement (props) {
    return Leaflet.vectorGrid.slicer(props.data, {
      vectorTileLayerStyles: {
        sliced: (properties, zoom) => props.style
      }
    })
  }
}

