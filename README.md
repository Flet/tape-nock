# tape-nock

[![npm][npm-image]][npm-url]
[![travis][travis-image]][travis-url]
[![standard][standard-image]][standard-url]
[![Package Quality][pack-quality-svg]][pack-quality-url]

[npm-image]: https://img.shields.io/npm/v/tape-nock.svg?style=flat-square
[npm-url]: https://www.npmjs.com/package/tape-nock
[travis-image]: https://img.shields.io/travis/Flet/tape-nock.svg?style=flat-square
[travis-url]: https://travis-ci.org/Flet/tape-nock
[standard-image]: https://img.shields.io/badge/code%20style-standard-brightgreen.svg?style=flat-square
[standard-url]: http://npm.im/standard
[pack-quality-url]: http://packagequality.com/#?package=tape-nock
[pack-quality-svg]: http://npm.packagequality.com/shield/tape-nock.svg

Automatically record and playback HTTP calls for each tape test. This package is really just a decorator that wraps each test individual test with nock's [Nock Back](https://github.com/pgte/nock#nock-back) feature. This helps avoid the all `nockBack` wrapping code which can make tests less clear.

## Install

```
npm install tape-nock --save-dev
```

## Usage

```js
var path = require('path')
var tape = require('tape') // still need to require tape
var tapeNock = require('tape-nock')

// call tapeNock with tape and an options object
var test = tapeNock(tape, { //options object to be passed to nock, not required
  fixtures: path.join(__dirname, 'fixtures'), // this is the default path
  mode: 'dryrun' // this is the default mode
})
```

Now just write your tape tests as usual:
```js
var request = require('request')

test('do it live on the internet', function(t) {
  request.get('https://registry.npmjs.org', function (err, res) {
    t.error(err)
    t.ok(res)
    t.end()
})
```
in `dryrun` mode, the above test will go to the internet and nothing will be recorded.

Once your tests are perfected, Create fixture files by using the `record` mode. This captures all HTTP calls per test and saves it to the `fixtures` directory.

To record, set the `NOCK_BACK_MODE` environment variable:
```bash
NOCK_BACK_MODE=record npm test
```
...or do it programatically via the `tape-nock` options object:
```js
var test = tapeNock(tape, {
  fixtures: path.join(__dirname, 'fixtures'),
  mode: 'record' // record mode!
})
```
A new file called `do it live on the internet.json` will be created in the `fixtures` directory. It will contain an array of HTTP calls that were made during the test. Each test will have its own JSON.

Once a fixture exists for a test, it will be used every time in `dryrun` mode. To re-record, you'll need to delete the JSON file.

To make this easier, add scripts to your `package.json` for easy recording/running:
```js
{
  "scripts" {
    "test": "tape test/*js"
    "test:record": "NOCK_BACK_MODE=record npm test",
    "test:wild": "NOCK_BACK_MODE=wild npm test",
    "test:lockdown": "NOCK_BACK_MODE=lockdown npm test",
    "test:overwrite": "rm test/fixtures/*.json & npm run test:record"
  }
}
```

### Can still mock things
It is also possible to manually mock at the same time so a request NEVER hits a URL.

Just get a copy of nock from `tape-nock` via `.nock` and use it:
```js
var tape = require('tape')
var tapeNock = require('tape-nock')
var test = tapeNock(tape, {
  fixtures: path.join(__dirname, 'fixtures') //defaults to this path
})

var request = require('request')
test('able to get a copy of nock from test.nock and use it', function (t) {
  // get a copy of nock
  var nock = test.nock

  // use it to mock a URL. This mock will live even if NOCK_BACK_MODE=wild
  nock('http://registry.npmjs.org').get('/clockmoji').reply(200, {'yep': 'it works'})

  request.get('http://registry.npmjs.org/clockmoji', process)

  function process (err, resp) {
    t.error(err, 'no error')
    t.equals(JSON.parse(resp.body).yep, 'it works', 'able to mock directly with nock instance')
    t.end()
  }
})

```


### NOCK_BACK_MODE
Use the `NOCK_BACK_MODE` environment variable ([details](https://github.com/pgte/nock#modes)) to control the mode of nockBack.

Here is a recap
- **wild:** all requests go out to the internet, don't replay anything, doesn't record anything
- **dryrun:** The default, use recorded nocks, allow http calls, doesn't record anything, useful for writing new tests
- **record:** use recorded nocks, record new nocks
- **lockdown:** use recorded nocks, disables all http calls even when not nocked, doesn't record

### Nock Back options
Its also possible to pass [nockBack options](https://github.com/pgte/nock#options-1) through tape's options object.

This is helpful for doing `filteringPath` or `filteringRequestBody` (check out the [PROTIP](https://github.com/pgte/nock#protip)... that can be done in an "after" function).

For Example, this test will use the `after` function passed in, which will make all "time-based-param" params in the path and replace them with 123. This will ensure time-based parameters will still be mock-able (the path in the fixture JSON will need to be manually updated to match).
```js
var after = function (scope) {
  scope.filteringPath(/time-based-param=[^&]*/g, 'time-based-param=123')
}

test('pass through opts to nockback', {after: after}, function (t) {
  request.get('http://registry.npmjs.com?time-based-param=1455231758348', function (err, resp) {
    t.error(err)
    t.equals(JSON.parse(resp.body).haha, 'no secrets for you', 'secrets are protected')
    t.end()
  })
})

```

## Contributing

Contributions welcome! Please read the [contributing guidelines](CONTRIBUTING.md) first.

## License

[ISC](LICENSE)
