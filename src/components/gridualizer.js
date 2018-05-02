// @flow
import Leaflet from 'leaflet'
import {MapLayer} from 'react-leaflet'

export default class GridualizerLayer extends MapLayer {
  createLeafletElement (props) {
    const gridLayer = new Leaflet.GridLayer()
    gridLayer.createTile = this._createTile
    return gridLayer
  }

  componentDidUpdate () {
    this.leafletElement.redraw()
  }

  shouldComponentUpdate (nextProps) {
    return nextProps.drawTile !== this.props.drawTile
  }

  _createTile = (coords) => {
    const canvas = document.createElement('canvas')
    canvas.width = canvas.height = 256
    if (this.props.drawTile) this.props.drawTile(canvas, coords, coords.z)
    return canvas
  }
}
