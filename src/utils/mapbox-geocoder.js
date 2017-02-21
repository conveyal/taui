import lonlat from '@conveyal/lonlat'
import {mapbox} from 'mapbox.js'

mapbox.accessToken = process.env.MAPBOX_ACCESS_TOKEN

const MAPBOX_TYPES = ['address', 'neighborhood', 'place', 'poi']
const geocoder = mapbox.geocoder('mapbox.places')

export function search (apiKey, text, {
  boundary,
  focusLatlng,
  format
} = {}) {
  return geocode({boundary, focusLatlng, text})
    .then((results) => ({...results, features: results.features.slice(0, 3)}))
}

export function geocode ({
  boundary,
  focusLatlng,
  text
}) {
  if (!text) return Promise.resolve([])
  return new Promise((resolve, reject) => {
    geocoder.query({
      country: boundary.country,
      proximity: lonlat.toCoordinates(focusLatlng),
      query: text,
      types: MAPBOX_TYPES
    }, (err, response) => {
      if (err) return reject(err)
      if (!response) return resolve([])
      resolve(response.results)
    })
  })
}

export function reverse (apiKey, latlng) {
  return new Promise((resolve, reject) => {
    geocoder.reverseQuery(latlng, (err, results) => {
      if (err) return reject(err)
      if (!results) return resolve()
      resolve(results)
    })
  })
}
