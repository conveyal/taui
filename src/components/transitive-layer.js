import {Map} from 'leaflet'
import {PropTypes} from 'react'
import {MapLayer} from 'react-leaflet'
import Transitive from 'transitive-js'
import LeafletTransitiveLayer from 'leaflet-transitivelayer'

export default class TransitiveMapLayer extends MapLayer {
  static propTypes = {
    data: PropTypes.object.isRequired,
    map: PropTypes.instanceOf(Map),
    styles: PropTypes.object
  };

  componentWillMount () {
    super.componentWillMount()
    this.transitive = new Transitive({
      data: this.props.data,
      gridCellSize: 200,
      useDynamicRendering: true,
      styles: this.props.styles
    })
    this.leafletElement = new LeafletTransitiveLayer(this.transitive)
  }

  componentDidMount () {
    super.componentDidMount()
    this.leafletElement._refresh()
  }

  componentWillReceiveProps (props) {
    super.componentWillReceiveProps(props)
    this.transitive.updateData(props.data)
  }

  componentDidUpdate (prevProps, prevState) {
    this.leafletElement._refresh()
  }

  render () {
    return null
  }
}
