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
  analyst
    .singlePointRequest({ lat: req.query.lat, lng: req.query.lng }, req.query.destinationPointsetId, req.query.graphId)
    .then(data => {
      res.status(200).send(data)
    })
    .catch(err => {
      res.status(400).send(err)
    })
})

app.get('*', function (req, res) {
  res.sendFile(path.join(__dirname, 'index.html'))
})

app.listen(3000, 'localhost', function (err) {
  if (err) {
    console.log(err)
    return
  }

  console.log('Listening at http://localhost:3000')
})
