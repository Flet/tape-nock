
var request = require('axios')

var tape = require('blue-tape')

var test = require('../')(tape)

test('it works with a plain promise', function (t) {
  return timeout(100).then(function () {
    t.assert(true, 'assertion is made')
  })
})

test('it works with an axios based request', function (t) {
  return request('http://registry.npmjs.org')
    .then(function (resp) {
      t.equal(resp.status, 200)
    })
})

function timeout (ms) {
  return new Promise(function (resolve) { setTimeout(resolve, ms) })
}
