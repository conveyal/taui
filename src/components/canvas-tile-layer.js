import {tileLayer} from 'leaflet'
import {PropTypes} from 'react'
import {BaseTileLayer} from 'react-leaflet'

export default class CanvasTileLayer extends BaseTileLayer {
  static propTypes = {
    drawTile: PropTypes.func.isRequired
  }

  componentWillMount () {
    super.componentWillMount()
    this.leafletElement = tileLayer.canvas({ detectRetina: true })
    this.leafletElement.drawTile = this.props.drawTile
  }

  componentDidMount () {
    super.componentDidMount()
    this.leafletElement.redraw()
  }

  componentWillReceiveProps (nextProps) {
    this.leafletElement.drawTile = nextProps.drawTile
  }

  componentDidUpdate (prevProps, prevState) {
    super.componentDidUpdate(prevProps, prevState)
    this.leafletElement.redraw()
  }
}
