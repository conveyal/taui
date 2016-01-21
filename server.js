var path = require('path')
var express = require('express')
var webpack = require('webpack')
var config = require('./webpack.config.dev')

var app = express()
var compiler = webpack(config)

app.use(require('webpack-dev-middleware')(compiler, {
  noInfo: true,
  publicPath: config.output.publicPath
}))

app.use(require('webpack-hot-middleware')(compiler))

app.get('/test/data/:filename', function (req, res) {
  res.sendFile(path.join(__dirname, 'test/data/', req.params.filename))
})

app.get('/dist/style.css', function (req, res) {
  res.sendFile(path.join(__dirname, 'dist/style.css'))
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
