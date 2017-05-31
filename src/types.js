// @flow

import Browsochrones from 'browsochrones'

/**
 * Simple types
 */
export type LatLng = {
  lat: number,
  lng: number
}

export type Coordinate = [number, number]
export type Coordinates = Coordinate[]

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

export type BrowsochronesStore = {
  active: number,
  instances: Browsochrones[],
  origins: Array<{
    name: string,
    url: string
  }>,
  grids: string[],
  gridsUrl: string
}

export type Accessibility = {
  name: string,
  accessibility: | 'accessibility-is-empty'
    | 'accessibility-is-loading'
    | {
        [key: string]: number
      }
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
  start: Option,
  end: Option,
  focusLatlng: LatLng,
  boundary: GeocoderBoundary,
  pointsOfInterest: PointsOfInterest
}

export type UIStore = {
  fetches: number,
  showLog: boolean
}

export type Store = {
  actionLog: LogItems,
  browsochrones: BrowsochronesStore,
  destinations: Accessibility[],
  geocoder: GeocoderStore,
  map: any,
  mapMarkers: any,
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
    _latlng: Coordinate
  }
}
