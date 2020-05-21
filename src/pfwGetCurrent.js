const httpRequest = require('./httpRequest.js')

module.exports = function pfwGetCurrent (callback) {
  httpRequest('current.php', {}, (err, result) => {
    if (err) { return callback(err) }

    let data = parseInt(result.body)

    callback(null, data)
  })
}
