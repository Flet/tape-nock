var path = require('path')
var tape = require('tape')

var test = require('../..')(tape, {
  fixtures: path.join(__dirname, '..', 'fixtures')
})

var request = require('request')

test.only('hello world', function (t) {
  request.get('http://registry.npmjs.org', process)

  function process (err, resp) {
    t.error(err, 'no error')
    t.ok(resp)

    test('get clockmoji - live', function (b) {
      t.fail(b)
      b.end()
    })

    t.end()
  }
})
