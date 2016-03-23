#!/usr/bin/env node

const browserify = require('browserify')
const argv = require('minimist')(process.argv.slice(2))
const transform = require('./transform')

browserify(argv._, { transform })
  .transform({ global: true }, 'uglifyify')
  .bundle()
  .pipe(process.stdout)
