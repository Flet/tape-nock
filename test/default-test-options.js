const tape = require('tape')
let beforeWorks = false

const test = require('../')(tape, {
  defaultTestOptions: {
    before: function () {
      beforeWorks = true
    }
  }
})

const request = require('request')

test('hello world', function (t) {
  request.get('http://registry.npmjs.org', process)

  function process (err, resp) {
    t.error(err, 'no error')
    t.ok(resp)
    t.ok(beforeWorks, 'default test option works')
    t.end()
  }
})
