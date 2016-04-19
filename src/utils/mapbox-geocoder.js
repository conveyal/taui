import {mapbox} from 'mapbox.js'

mapbox.accessToken = process.env.MAPBOX_ACCESS_TOKEN

const geocoder = mapbox.geocoder('mapbox.places')

export default function search (api_key, text, {boundary, focusLatlng, format} = {}) {
  if (!text) return Promise.resolve([])

  console.log(focusLatlng)

  return new Promise((resolve, reject) => {
    geocoder.query({
      country: boundary.country,
      proximity: focusLatlng,
      query: text,
      types: ['address', 'locality', 'neighborhood', 'place', 'poi']
    }, (err, results) => {
      if (err) return reject(err)
      if (!results) return resolve()
      console.log(results)
      resolve(results.results)
    })
  })
}
