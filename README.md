# Transport Analyst User Interface (TAUI)

## Build
After cloning the repository, run:
 - `npm install`
 - `npm start`

## Development
Create a file on the root called ```config.dev.js```:

```js
window.taui = window.taui || {}

var accessToken = 'pk.eyJ1IjoiY29udmV5YWwiLCJhIjoiMDliQURXOCJ9.9JWPsqJY7dGIdX777An7Pw'
var mapId = 'conveyal.ie3o67m0'

var r5Url = 'http://localhost:4567'

window.taui.config = {
  browsochrones: {
    gridsUrl: 'http://s3.amazonaws.com/analyst-static/indy-baseline/grids',
    originsUrl: r5Url,
    queryUrl: r5Url + '/query.json',
    stopTreesUrl: r5Url + '/stop_trees.dat',
    transitiveNetworkUrl: r5Url + '/transitive.json'
  },
  map: {
    attribution: '&copy <a href="https://www.mapbox.com/map-feedback/">Mapbox</a> &copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>',
    center: [39.7691, -86.1570],
    mapbox: {
      accessToken,
      mapId
    },
    url: 'http://api.tiles.mapbox.com/v4/' + mapId + '/{z}/{x}/{y}.png?access_token=' + accessToken,
    zoom: 13
  },
  mapMarkers: {
    originMarker: {
      position: [39.7691, -86.1570]
    },
    destinationMarker: null
  }
}
```
