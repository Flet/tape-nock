'use strict'
module.exports = tapeNockFactory
const nock = require('nock')
const sanitizeFilename = require('sanitize-filename')
const path = require('path')

function tapeNockFactory (tapeTest, nockOpts) {
  const nockBack = nock.back
  nockOpts = nockOpts || {}
  nockBack.fixtures = nockOpts.fixtures || path.join(path.dirname(module.parent.filename), 'fixtures')
  if (nockOpts.mode) nockBack.setMode(nockOpts.mode)

  const defaultTestOptions = nockOpts.defaultTestOptions || {}

  const testnames = []

  function testTestWithNock (fn) {
    fn = fn || tapeTest
    return function testWithNock (_name, _opts, _cb) {
      const args = getTestArgs(_name, _opts, _cb)

      let sanitized = sanitizeFilename(args.name)
      if (sanitized.length < 1) sanitized = 'fixtures'

      const filename = sanitized + '_.json'
      if (testnames.indexOf(filename) > -1) {
        const mustBeUnique = 'tape-nock: Duplicate test filename: "' + filename + '". All test descriptions must be unique.'
        throw new Error(mustBeUnique)
      }
      testnames.push(filename)

      const emitter = fn(args.name, args.opts, args.cb)
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

  const testWithNock = testTestWithNock()

  Object.keys(tapeTest).forEach(function (key) {
    if (typeof tapeTest[key] !== 'function') return
    testWithNock[key] = tapeTest[key]
  })

  testWithNock.nock = nock

  testWithNock.only = testTestWithNock(tapeTest.only)

  return testWithNock
}

tapeNockFactory.nock = nock

const getTestArgs = function (name_, opts_, cb_) {
  let name = '(anonymous)'
  let opts = {}
  let cb

  for (let i = 0; i < arguments.length; i++) {
    const arg = arguments[i]
    const t = typeof arg
    if (t === 'string') {
      name = arg
    } else if (t === 'object') {
      opts = arg || opts
    } else if (t === 'function') {
      cb = arg
    }
  }
  return { name, opts, cb }
}
