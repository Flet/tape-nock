//
var tape = require('tape')

var test = require('../')(tape)

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

test('duplicate test name throws', function (t) {
  t.throws(function () {
    test('get clockmoji - live', function () {})
  }, 'should throw')
  t.end()
})

test('get clockmoji - fixture with modified name', function (t) {
  request.get('http://registry.npmjs.org/clockmoji', process)

  function process (err, resp) {
    t.error(err, 'no error')
    t.equals(JSON.parse(resp.body).name, 'IMPOSTER!', 'name is correct')
    t.end()
  }
})

var after = function (scope) {
  scope.filteringPath(/secrets=[^&]*/g, 'secrets=shh')
}

test('pass through opts to nockback', { after: after }, function (t) {
  request.get('http://registry.npmjs.com?secrets=omg-secrets', function (err, resp) {
    t.error(err)
    t.equals(JSON.parse(resp.body).haha, 'no secrets for you', 'secrets are protected')
    t.end()
  })
})

test('able to get a copy of nock from test.nock and use it', function (t) {
  var nock = test.nock

  nock('http://registry.npmjs.org').get('/clockmoji').reply(200, { 'yep': 'it works' })

  request.get('http://registry.npmjs.org/clockmoji', process)

  function process (err, resp) {
    t.error(err, 'no error')
    t.equals(JSON.parse(resp.body).yep, 'it works', 'able to mock directly with nock instance')
    t.end()
  }
})
