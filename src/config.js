const accessToken = 'pk.eyJ1IjoiY29udmV5YWwiLCJhIjoiMDliQURXOCJ9.9JWPsqJY7dGIdX777An7Pw'
const mapId = 'conveyal.ie3o67m0'

const config = {
  browsochrones: {
    baseUrl: 'http://localhost:4567',
    localUrl: 'http://localhost:3000/test/data'
  },
  map: {
    attribution: '&copy <a href="https://www.mapbox.com/map-feedback/">Mapbox</a> &copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>',
    center: [39.7691, -86.1570],
    mapbox: {
      accessToken,
      mapId
    },
    url: `http://api.tiles.mapbox.com/v4/${mapId}/{z}/{x}/{y}.png?access_token=${accessToken}`,
    zoom: 13
  }
}

export default config
