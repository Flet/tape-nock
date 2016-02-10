var path = require('path')
var tape = require('tape')

var test = require('../')(tape, {
  fixtures: path.join(__dirname, 'fixtures')
})

var request = require('request')

test('hello world', function (t) {
  request.get('http://registry.npmjs.org', process)

  function process (err, resp) {
    t.error(err, 'no error')
    t.ok(resp)
    t.end()
  }
})

test('get clockmoji - live', function (t) {
  request.get('http://registry.npmjs.org/clockmoji', process)

  function process (err, resp) {
    t.error(err, 'no error')
    t.equals(JSON.parse(resp.body).name, 'clockmoji', 'name is correct')
    t.end()
  }
})

test('get clockmoji - fixture with modified name', function (t) {
  request.get('http://registry.npmjs.org/clockmoji', process)

  function process (err, resp) {
    t.error(err, 'no error')
    t.equals(JSON.parse(resp.body).name, 'IMPOSTER!', 'name is correct')
    t.end()
  }
})
