import {Map} from 'leaflet'
import isEqual from 'lodash.isequal'
import {PropTypes} from 'react'
import {MapLayer} from 'react-leaflet'
import Transitive from 'transitive-js'
import LeafletTransitiveLayer from 'leaflet-transitivelayer'

export default class TransitiveMapLayer extends MapLayer {
  static propTypes = {
    data: PropTypes.object.isRequired,
    map: PropTypes.instanceOf(Map),
    styles: PropTypes.object
  }

  shouldComponentUpdate (newProps, newState) {
    return !isEqual(newProps, this.props) || !isEqual(newState, this.state)
  }

  componentWillMount () {
    super.componentWillMount()
    this.transitive = new Transitive({
      data: this.props.data,
      gridCellSize: 200,
      useDynamicRendering: true,
      styles: this.props.styles,
      // see https://github.com/conveyal/transitive.js/wiki/Zoom-Factors
      zoomFactors: [{
        minScale: 0,
        gridCellSize: 25,
        internalVertexFactor: 1000000,
        angleConstraint: 45,
        mergeVertexThreshold: 200
      }, {
        minScale: 0.5,
        gridCellSize: 0,
        internalVertexFactor: 0,
        angleConstraint: 5,
        mergeVertexThreshold: 0
      }]
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
