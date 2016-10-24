'use strict'
module.exports = tapeNockFactory
var nock = require('nock')
var sanitizeFilename = require('sanitize-filename')

function tapeNockFactory (tapeTest, nockOpts) {
  var nockBack = nock.back

  nockBack.fixtures = nockOpts.fixtures
  if (nockOpts.mode) nockBack.setMode(nockOpts.mode)

  var testnames = []

  function testTestWithNock (fn) {
    fn = fn || tapeTest
    return function testWithNock (desc, opts_, fn_) {
      var sanitized = sanitizeFilename(desc)
      if (sanitized.length < 1) sanitized = 'fixture'

      var filename = sanitized + '_.json'
      if (testnames.indexOf(filename) > -1) {
        var mustBeUnique = 'tape-nock: Duplicate test filename: "' + filename + '". All test descriptions must be unique.'
        throw new Error(mustBeUnique)
      }
      testnames.push(filename)

      var emitter = fn(desc, opts_, fn_)
      emitter.once('prerun', function () {
        nockBack(filename, opts_, function (nockDone) {
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
