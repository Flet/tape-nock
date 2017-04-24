'use strict'
module.exports = tapeNockFactory
var nock = require('nock')
var sanitizeFilename = require('sanitize-filename')
var path = require('path')

function tapeNockFactory (tapeTest, nockOpts) {
  var nockBack = nock.back
  nockOpts = nockOpts || {}
  nockBack.fixtures = nockOpts.fixtures || path.join(path.dirname(module.parent.filename), 'fixtures')
  if (nockOpts.mode) nockBack.setMode(nockOpts.mode)

  var defaultTestOptions = nockOpts.defaultTestOptions || {}

  var testnames = []

  function testTestWithNock (fn) {
    fn = fn || tapeTest
    return function testWithNock (_name, _opts, _cb) {
      var args = getTestArgs(_name, _opts, _cb)

      var sanitized = sanitizeFilename(args.name)
      if (sanitized.length < 1) sanitized = 'fixtures'

      var filename = sanitized + '_.json'
      if (testnames.indexOf(filename) > -1) {
        var mustBeUnique = 'tape-nock: Duplicate test filename: "' + filename + '". All test descriptions must be unique.'
        throw new Error(mustBeUnique)
      }
      testnames.push(filename)

      var emitter = fn(args.name, args.opts, args.cb)
      emitter.once('prerun', function () {
        nockBack(filename, Object.assign({}, defaultTestOptions, args.opts), function (nockDone) {
          emitter.once('end', function () {
            nockDone()
          })
        })
      })
      return emitter
    }
  }

  var testWithNock = testTestWithNock()

  Object.keys(tapeTest).forEach(function (key) {
    if (typeof tapeTest[key] !== 'function') return
    testWithNock[key] = tapeTest[key]
  })

  testWithNock.nock = nock

  testWithNock.only = testTestWithNock(tapeTest.only)

  return testWithNock
}

tapeNockFactory.nock = nock

var getTestArgs = function (name_, opts_, cb_) {
  var name = '(anonymous)'
  var opts = {}
  var cb

  for (var i = 0; i < arguments.length; i++) {
    var arg = arguments[i]
    var t = typeof arg
    if (t === 'string') {
      name = arg
    } else if (t === 'object') {
      opts = arg || opts
    } else if (t === 'function') {
      cb = arg
    }
  }
  return { name: name, opts: opts, cb: cb }
}
