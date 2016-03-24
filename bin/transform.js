const babelify = require('babelify')
const envify = require('envify/custom')
const fs = require('fs')
const argv = require('minimist')(process.argv.slice(2))
const path = require('path')
const YAML = require('yamljs')

const babelifyConfig = {
  presets: ['es2015', 'react', 'stage-0'],
  plugins: ['transform-runtime'],
  env: {
    development: {
      plugins: [['react-transform', {
        transforms: [{
          transform: 'react-transform-catch-errors',
          imports: ['react', 'redbox-react']
        }, {
          transform: 'react-transform-render-visualizer'
        }]
      }]]
    }
  }
}
const defaultDirectory = path.resolve(process.cwd(), 'configurations/default')
const directory = path.resolve(process.cwd(), argv.config ? argv.config : 'configurations/default')
const defaultEnvify = {
  _: 'purge',
  MESSAGES: loadYml('messages'),
  NODE_ENV: process.env.NODE_ENV || 'development',
  SETTINGS: loadYml('settings'),
  STORE: loadYml('store')
}

module.exports = [
  ['browserify-css', {
    global: true,
    minify: process.env.NODE_ENV === 'production'
  }],
  babelify.configure(babelifyConfig),
  envify(Object.assign(defaultEnvify, loadYml('env')))
]

function loadYml (filename) {
  const file = `${directory}/${filename}.yml`
  if (fs.existsSync(file)) return YAML.load(file)
  else return YAML.load(`${defaultDirectory}/${filename}.yml`)
}
