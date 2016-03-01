# Transport Analyst User Interface (TAUI)

## Build
After cloning the repository, run:
 - `npm install`
 - `npm start`

## Development
Create a file on the root called ```config.dev.js```:

```js
var r5Url = 'http://s3.amazonaws.com/analyst-static/indy-demo'

module.exports = {
  browsochrones: {
    gridsUrl: 'http://s3.amazonaws.com/analyst-static/indy-baseline-z9/intgrids',
    originsUrl: r5Url,
    queryUrl: r5Url + '/query.json',
    stopTreesUrl: r5Url + '/stop_trees.dat',
    transitiveNetworkUrl: r5Url + '/transitive.json'
  },
  geocoder: {
    apiKey: mapzenApiKey,
    focusLatlng: {
      lat: 39.7691,
      lng: -86.1570
    },
    boundary: {
      country: 'USA',
      rect: {
        maxLatlng: { lat: 40.271143686084194, lng: -85.462646484375 },
        minLatlng: { lat: 39.35978526869001, lng: -86.8524169921875 }
      }
    }
  },
  map: {
    attribution: '&copy <a href="https://www.mapbox.com/map-feedback/">Mapbox</a> &copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>',
    centerCoordinates: [39.7691, -86.1570],
    mapbox: {
      accessToken,
      mapId
    },
    mapzen: {
      apiKey: mapzenApiKey
    },
    url: 'http://api.tiles.mapbox.com/v4/' + mapId + '/{z}/{x}/{y}.png?access_token=' + accessToken,
    zoom: 11
  },
  mapMarkers: {
    origin: {
      latlng: {lat: 39.7691, lng: -86.1570}
    }
  }
}
```
