const withCSS = require('@zeit/next-css')
const fs = require('fs')

let store = 'no store'
if (fs.existsSync('store.json')) {
  store = fs.readFileSync('store.json', 'utf8')
}

console.log(process.env.MAPBOX_ACCESS_TOKEN)

module.exports = withCSS({
  target: 'serverless',
  env: {
    MAPBOX_ACCESS_TOKEN: process.env.MAPBOX_ACCESS_TOKEN,
    STORE: store
  }
})
