const fs = require('fs')
const request = require('request')
const path = require('path')

function upload (url, data, filepath, subpath, callback) {
  var formData = Object.assign(data, {
    file: {
      value: fs.createReadStream(filepath),
      options: {
        filename: subpath
      }
    }
  })
  request.post({ url, formData }, function (err, res, body) {
    if (err) {
      callback(err)
      return
    }
    callback()
  })
}

function FisPushPlugin (plugin) {
  this.receiver = plugin.receiver
  this.root = plugin.root
}

FisPushPlugin.prototype.apply = function (compiler) {
  const { receiver, root } = this
  compiler.plugin('after-emit', function (compilation, callback) {
    const assetsList = Object.keys(compilation.assets)
    assetsList.forEach(filename => {
      const subpath = path.basename(filename)
      const to = root + '/' + filename
      upload(receiver, { to }, compilation.assets[filename].existsAt, subpath, function (err, res) {
        if (err) {
          console.error(filename)
          console.error(err)
        } else {
          console.info(`${filename} -> ${to} [DONE]`)
        }
      })
    })
    callback()
  })
}

module.exports = FisPushPlugin
