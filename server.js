var Analyst = require('analyst.js')
var path = require('path')
var express = require('express')
var webpack = require('webpack')
var config = require('./webpack.config.dev')
var stormpath = require('./config.json').stormpath

var app = express()
var compiler = webpack(config)

var analyst = new Analyst(undefined, {
  baseUrl: 'https://analyst.conveyal.com:443'
})

analyst
  .obtainClientCredentials(stormpath.apiKey.id, stormpath.apiKey.secret)
  .then(d => {
    console.log(d)
  })
  .catch(e => {
    console.error(e)
  })

app.use(require('webpack-dev-middleware')(compiler, {
  noInfo: true,
  publicPath: config.output.publicPath
}))

app.use(require('webpack-hot-middleware')(compiler))

app.get('/api/singlePointRequest', function (req, res) {
  console.log(req.query)
  try {
    analyst
      .singlePointRequest({ lat: req.query.lat, lng: req.query.lng }
        , req.query.graphId || 'f40dfbef-8bc3-4842-aabb-4faa722ec082'
        , req.query.destinationPointsetId || '0579b6bd8e14ec69e4f21e96527a684b_376500e5f8ac23d1664902fbe2ffc364')
      .then(data => {
        console.log(data)
        res.status(200).send(data)
      })
      .catch(err => {
        console.error(err)
        res.status(400).send(err)
      })
  } catch (e) {
    console.error(e)
    res.status(400).send(e)
  }
})

app.get('*', function (req, res) {
  res.sendFile(path.join(__dirname, 'index.html'))
})

app.use(function (err, req, res, next) {
  console.error(err)
  res.status(500).send(err)
})

app.listen(3000, 'localhost', function (err) {
  if (err) {
    console.log(err)
    return
  }

  console.log('Listening at http://localhost:3000')
})

process.on('uncaughtException', function (e) {
  console.error(e)
  console.error(e.stack)
})
