import {tileLayer} from 'leaflet'
import {PropTypes} from 'react'
import {BaseTileLayer} from 'react-leaflet'

export default class CanvasTileLayer extends BaseTileLayer {
  static propTypes = {
    drawTile: PropTypes.func.isRequired
  }

  componentWillMount () {
    super.componentWillMount()
    const {drawTile} = this.props
    this.leafletElement = tileLayer.canvas({
      detectRetina: true
    })
    this.leafletElement.drawTile = drawTile
  }

  componentDidMount () {
    super.componentDidMount()
    this.leafletElement.redraw()
  }

  componentDidUpdate (prevProps) {
    super.componentDidUpdate(prevProps)
    this.leafletElement.drawTile = this.props.drawTile
    this.leafletElement.redraw()
  }
}
