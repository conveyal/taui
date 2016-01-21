import fetch from 'isomorphic-fetch'
import qs from 'qs'

const mapzenUrl = 'https://search.mapzen.com/v1'
const autocompleteUrl = `${mapzenUrl}/autocomplete`
const geocodeUrl = `${mapzenUrl}/search`
const reverseUrl = `${mapzenUrl}/reverse`

export function autocomplete ({key, text, focusLatlng}) {
  if (!text) return Promise.resolve([])

  const query = qs.stringify({
    api_key: key,
    'focus.point.lat': focusLatlng.lat,
    'focus.point.lon': focusLatlng.lng,
    text: text
  })

  return fetch(`${autocompleteUrl}?${query}`)
    .then(res => res.json())
    .then(json => {
      if (!json || !json.features) {
        throw new Error('No features found.')
      }

      return json.features.map(splitFeature)
    })
    .catch(err => {
      console.log(err)
      return err
    })
}

export function geocode ({key, text, focusLatlng}) {
  const query = qs.stringify({
    api_key: key,
    'focus.point.lat': focusLatlng.lat,
    'focus.point.lon': focusLatlng.lng,
    text: text
  })

  return fetch(`${geocodeUrl}?${query}`, { credentials: 'include' })
    .then(res => res.json())
    .then(json => json.features.map(splitFeature))
}

export function reverse ({key, latlng}) {
  const query = qs.stringify({
    api_key: key,
    'point.lat': latlng.lat,
    'point.lng': latlng.lng
  })

  return fetch(`${reverseUrl}?${query}`, { credentials: 'include' })
    .then(res => res.json())
    .then(json => {
      console.log(json)
      return json
    })
}

function splitFeature ({geometry, properties}) {
  return {
    address: properties.label,
    city: properties.locality,
    state: properties.region,
    zip: properties.postalcode ? parseInt(properties.postalcode, 10) : undefined,
    country: properties.country,
    latlng: {
      lat: geometry.coordinates[1],
      lng: geometry.coordinates[0]
    }
  }
}
