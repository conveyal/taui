// @flow
import {GeoJSON} from 'react-leaflet'

export default class TauiGeoJSON extends GeoJSON {
  componentDidMount () {
    super.componentDidMount()
    window.MAP = this.context.map
  }

  componentWillUnmount () {
    super.componentWillUnmount()
    console.log('UNMOTSFSD')
  }

  componentDidUpdate (prevProps) {
    if (prevProps.data !== this.props.data) {
      this.leafletElement.clearLayers()
      this.leafletElement.addData(this.props.data)
    }
  }
}
