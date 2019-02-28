const fs = require('fs')

// Currently, @zeit/next-css causes issues with Now 2.0 best described here: https://github.com/zeit/next.js/issues/5750#issuecomment-442313585
const {PHASE_PRODUCTION_SERVER} =
  process.env.NODE_ENV === 'development'
    ? {}
    : !process.env.NOW_REGION
      ? require('next/constants')
      : require('next-server/constants')

let store = fs.readFileSync('empty-store.json', 'utf8')
if (fs.existsSync('store.json')) {
  store = fs.readFileSync('store.json', 'utf8')
}

const config = {
  target: 'serverless',
  env: {
    STORE: store
  }
}

module.exports = (phase, {defaultConfig}) => {
  if (phase === PHASE_PRODUCTION_SERVER) return config

  const withCSS = require('@zeit/next-css')
  return withCSS(config)
}
