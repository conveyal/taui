const withCSS = require('@zeit/next-css')
const fs = require('fs')

let store = 'no store'
if (fs.existsSync('store.json')) {
  store = fs.readFileSync('store.json', 'utf8')
}

module.exports = withCSS({
  target: 'serverless',
  env: {
    MAPBOX_ACCESS_TOKEN: process.env.MAPBOX_ACCESS_TOKEN,
    STORE: store
  },
  webpack: config => {
    // ESLint on build
    config.module.rules.push({
      test: /\.js$/,
      loader: 'eslint-loader',
      exclude: /node_modules/
    })

    return config
  }
})
