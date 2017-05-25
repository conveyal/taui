// @flow

export type Store = {
  actionLog: any,
  browsochrones: {
    origins: Array<{
      name: string,
      url: string
    }>,
    grids: string[],
    gridsUrl: string
  },
  destinations: any,
  geocoder: any,
  map: any,
  mapMarkers: any,
  timeCutoff: {
    selected: number
  },
  ui: any
}

export type LatLng = {
  lat: number,
  lng: number
}

export type LogItem = {
  createdAt: Date,
  level?: string,
  text: string
}

export type LogItems = LogItem[]

export type Coordinate = [number, number]
export type Coordinates = Coordinate[]

export type GeometryType = 'Point' | 'LineString' | 'Polygon' | 'MultiPoint' | 'MultiLineString' | 'MultiPolygon'

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

export type InputEvent = Event & {
  currentTarget: HTMLInputElement
}

export type MapEvent = {
  latlng?: Coordinate,
  currentTarget: {
    _latlng: Coordinate
  }
}
