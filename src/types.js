// @flow
export type Coordinate = [number, number]
export type Coordinates = Coordinate[]

export type LatLng = {
  lat: number,
  lng: number
}

export type LonLat = {lon: number, lat: number}
export type Point = {x: number, y: number}

export type Location = {
  label: string,
  position: LonLat
}

export type PartialLocation = {
  label: string | void,
  position: LonLat | void
}

export type Grid = {
  contains: (number, number) => boolean,
  valueAtPoint: (number, number) => number,
  data: Int32Array,
  north: number,
  west: number,
  height: number,
  width: number,
  zoom: number
}

export type Query = {
  height: number,
  width: number,
  north: number,
  west: number,
  zoom: number
}

/**
 * Path data
 */

export type Leg = [string, string, string] // boardStopId, patternId, alightStopId
export type Path = Leg[]
export type Targets = any

export type PathsData = {
 paths: Path[],
 targets: Targets
}

export type TransitiveStop = {
 stop_id: string,
 geometry: string,
 stop_lat: number,
 stop_lon: number,
 stopIndex: number
}

export type TransitivePattern = {
 pattern_id: string,
 patterns?: TransitivePattern[],
 route_id: string,
 stops: TransitiveStop[]
}

export type TransitiveRoute = {
  route_id: string,
  route_short_name: string
}

export type TransitiveData = {
 patterns: TransitivePattern[],
 stops: TransitiveStop[],
 routes: TransitiveRoute[]
}

export type QualifiedLeg = [TransitiveStop, TransitivePattern, TransitiveStop] // [boardStopId, Pattern, alightStopId]
export type QualifiedPath = QualifiedLeg[]

/**
 * GeoJSON
 */
export type GeometryType =
  | 'Point'
  | 'LineString'
  | 'Polygon'
  | 'MultiPoint'
  | 'MultiLineString'
  | 'MultiPolygon'

export type Feature = {
  type: 'Feature',
  key: string,
  properties: any,
  geometry: {
    type: GeometryType,
    coordinates: Coordinate | Coordinates
  }
}

export type PointFeature = {
  type: 'Feature',
  properties: any,
  geometry: {
    type: 'Point',
    coordinates: Coordinate
  }
}

/**
 * Store
 */
export type LogItem = {
  createdAt: Date,
  level?: string,
  text: string
}

export type LogItems = LogItem[]

export type Accessibility = 'accessibility-is-empty'
  | 'accessibility-is-loading'
  | {
      [key: string]: number
    }

export type Option = {
  label: string,
  value: string
}

export type GeocoderBoundary = {
  country: string,
  rect: {
    maxLat: number,
    maxLon: number,
    minLat: number,
    minLon: number
  }
}

export type PointsOfInterest = Array<{
  label: string,
  feature: PointFeature,
  value: Coordinate
}>

export type GeocoderStore = {
  start: null | Location,
  end: null | Location,
  focusLatlng: LatLng,
  boundary: GeocoderBoundary,
  pointsOfInterest: PointsOfInterest
}

export type MapStore = {
  centerCoordinates: string,
  zoom: number
}

export type NetworkStore = any

export type UIStore = {
  fetches: number,
  showLog: boolean
}

export type Store = {
  actionLog: LogItems,
  geocoder: GeocoderStore,
  map: MapStore,
  network: NetworkStore,
  timeCutoff: {
    selected: number
  },
  ui: UIStore
}

export type InputEvent = Event & {
  currentTarget: HTMLInputElement
}

export type MapEvent = {
  latlng?: Coordinate,
  target: {
    _latlng: Coordinate,
    _zoom: number
  }
}
