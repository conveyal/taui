import lonlng from 'lonlng'
import {mapbox} from 'mapbox.js'

mapbox.accessToken = process.env.MAPBOX_ACCESS_TOKEN

const geocoder = mapbox.geocoder('mapbox.places')

export async function search (apiKey, text, {
  boundary,
  focusLatlng,
  format
} = {}) {
  if (!text) return Promise.resolve([])

  return new Promise((resolve, reject) => {
    geocoder.query({
      country: boundary.country,
      proximity: lonlng.toCoordinates(focusLatlng),
      query: text,
      types: ['address', 'neighborhood', 'place', 'poi']
    }, (err, results) => {
      if (err) return reject(err)
      if (!results) return resolve()
      results.results.features = results.results.features.slice(0, 3) // only return top 3
      resolve(results.results)
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
