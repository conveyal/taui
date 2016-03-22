const through = require('through2')
const YAML = require('yamljs')

module.exports = function (file) {
  if (!/\.ya?ml$/.test(file)) return through()

  var data = ''
  function write (buf) {
    data += buf
  }

  function end () {
    this.queue('module.exports = ' + JSON.stringify(YAML.parse(data)))
    this.queue(null)
  }

  return through(write, end)
}
