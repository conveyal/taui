// @flow
import {Map} from 'leaflet'
import isEqual from 'lodash/isEqual'
import {MapLayer} from 'react-leaflet'
import Transitive from 'transitive-js'
import LeafletTransitiveLayer from 'leaflet-transitivelayer'

type Props = {
  data: any,
  map: Map,
  styles: any
}

export default class TransitiveMapLayer extends MapLayer<void, Props, void> {
  shouldComponentUpdate (newProps: Props) {
    return !isEqual(newProps, this.props)
  }

  componentWillMount () {
    super.componentWillMount()
    this.transitive = new Transitive({
      data: this.props.data,
      gridCellSize: 200,
      useDynamicRendering: true,
      styles: this.props.styles,
      // see https://github.com/conveyal/transitive.js/wiki/Zoom-Factors
      zoomFactors: [
        {
          minScale: 0,
          gridCellSize: 25,
          internalVertexFactor: 1000000,
          angleConstraint: 45,
          mergeVertexThreshold: 200
        },
        {
          minScale: 0.5,
          gridCellSize: 0,
          internalVertexFactor: 0,
          angleConstraint: 5,
          mergeVertexThreshold: 0
        }
      ]
    })
    this.leafletElement = new LeafletTransitiveLayer(this.transitive)
  }

  componentDidMount () {
    super.componentDidMount()
    this.leafletElement._refresh()
  }

  componentWillReceiveProps (props: Props) {
    super.componentWillReceiveProps(props)
    this.transitive.updateData(props.data)
  }

  componentDidUpdate () {
    this.leafletElement._refresh()
  }

  render () {
    return null
  }
}
