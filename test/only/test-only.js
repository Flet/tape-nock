var path = require('path')
var tape = require('tape')

var test = require('../..')(tape, {
  fixtures: path.join(__dirname, '..', 'fixtures')
})

var request = require('request')

test('this should not run', function (t) {
  t.fail('this should never run')
})

test.only('test only - only this test should run', function (t) {
  request.get('http://registry.npmjs.org', process)

  function process (err, resp) {
    t.error(err, 'no error')
    t.ok(resp)
    t.end()
  }
})
