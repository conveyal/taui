// @flow
import {MapLayer} from 'react-leaflet'
import Transitive from 'transitive-js'
import LeafletTransitiveLayer from 'leaflet-transitivelayer'

import styles from './style'

type Props = {
  data: any
}

const TRANSITIVE_SETTINGS = {
  gridCellSize: 200,
  useDynamicRendering: true,
  styles,
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
}

export default class TransitiveMapLayer extends MapLayer<LeafletTransitiveLayer, Props> {
  shouldComponentUpdate (newProps: Props) {
    return this.props.data !== newProps.data
  }

  createLeafletElement (props: Props) {
    return new LeafletTransitiveLayer(new Transitive({
      ...TRANSITIVE_SETTINGS,
      data: props.data
    }))
  }

  updateLeafletElement (prevProps: Props, currentProps: Props) {
    this.leafletElement._transitive.updateData(currentProps.data)
    this.leafletElement._refresh()
  }

  componentDidMount () {
    super.componentDidMount()
    this.leafletElement._refresh()
  }

  render () {
    return null
  }
}
