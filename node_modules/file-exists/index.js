var fs = require('fs')
var path = require('path')

module.exports = function (filepath, options) {
  options = options || {}

  if (!filepath) return false

  var root = options.root
  var fullpath = (root) ? path.join(root, filepath) : filepath

  try {
    return fs.statSync(fullpath).isFile()
  } catch (e) {
    return false
  }
}
