import {PropTypes} from 'react'
import {MapLayer} from 'react-leaflet'
import Transitive from 'transitive-js'
import LeafletTransitiveLayer from 'leaflet-transitivelayer'

export default class TransitiveMapLayer extends MapLayer {
  static propTypes = {
    data: PropTypes.object.isRequired,
    styles: PropTypes.object
  }

  componentWillMount () {
    super.componentWillMount()
    this.transitive = new Transitive({
      data: this.props.data,
      gridCellSize: 200,
      useDynamicRendering: true,
      styles: this.props.styles
    })
    this.transitiveLayer = new LeafletTransitiveLayer(this.transitive)
  }

  componentDidMount () {
    super.componentDidMount()

    this.props.map.addLayer(this.transitiveLayer)
    this.transitiveLayer._refresh()
  }

  componentWillReceiveProps (props) {
    this.transitive.updateData(props.data)
  }

  componentDidUpdate () {
    this.transitiveLayer._refresh()
  }
}
