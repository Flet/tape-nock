# tape-nock

[![npm][npm-image]][npm-url]
[![travis][travis-image]][travis-url]
[![standard][standard-image]][standard-url]
[![Package Quality][pack-quality-image]][pack-quality-url]
[![Coverage Status - Master][coveralls-image]][coveralls-url]


[npm-image]: https://img.shields.io/npm/v/tape-nock.svg?style=flat-square
[npm-url]: https://www.npmjs.com/package/tape-nock
[travis-image]: https://img.shields.io/travis/Flet/tape-nock.svg?style=flat-square
[travis-url]: https://travis-ci.org/Flet/tape-nock
[standard-image]: https://img.shields.io/badge/code%20style-standard-brightgreen.svg?style=flat-square
[standard-url]: http://npm.im/standard
[pack-quality-image]: http://npm.packagequality.com/shield/tape-nock.svg
[pack-quality-url]: http://packagequality.com/#?package=tape-nock
[coveralls-image]: https://coveralls.io/repos/github/Flet/tape-nock/badge.svg
[coveralls-url]: https://coveralls.io/github/Flet/tape-nock

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
  defaultTestOptions: { // optionally provide default options to nockBack for each test
    before: function () {
      console.log('a preprocessing function, gets called before nock.define')
    },
    after: function () {
      console.log('a postprocessing function, gets called after nock.define')
    }
  }
})
```

(see [nockBack test options](https://github.com/node-nock/nock#options-1) for more information on *before*, *after*, and *afterRecord* functions used in `defaultTestOptions`)


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

### Using supertest with tape-nock

Since nockBack will mock all HTTP requests, using [supertest](https://github.com/visionmedia/supertest) can be tricky. Here is an example of how to avoid mocking/recording local connections when using `supertest`.

Here is our application. It simply hits http://httpbin.org/get which echos info back. We want to have nockBack record/mock the httpbin request but still allow `supertest` http requests to 127.0.0.1 to pass through for all tests. This is done by leveraging the `defaultTestOptions`.

**app.js**
```js
const express = require('express')
const request = require('superagent')

var app = express()

app.get('/myapp/version', function (req, res) {
  superagent
    .get('http://httpbin.org/get')
    .end(function (err, response) {
      res.status(200).json({
        version: '0.1.0',
        url: response.body.url
      })
    })
})

module.exports = app
```

**test.js**
```js
const supertest = require('supertest');
const app = require('../app.js');

const tape = require('tape');
const tapeNock = require('tape-nock');
const nock = tapeNock.nock;

const opts = {
  // after recording the fixtures, remove any scopes that hit 127.0.0.1
  // this is not necessary with our before function below, but it makes it a bit cleaner.
  afterRecord: function (scopes) {
    var localhost = /http:\/\/127\.0\.0\.1.*/;
    scopes = scopes.filter(function (s) {
      return !localhost.test(s.scope);
    });

    return scopes;
  },
  before: function () {
    // allow connections to 127.0.0.1 even when NOCK_BACK_MODE=lockdown
    nock.enableNetConnect('127.0.0.1');
  }
};

// call tapeNock with tape and an options object
const test = tapeNock(tape, { defaultTestOptions: opts });

// note that we're passing in test.options here
// which has our special "afterRecord" and "before" functions
test('hit version url', function (t) {
  supertest(app)
    .get('/myapp/version')
    .expect(200, {
      url: 'http://httpbin.org/get',
      version: '0.1.0'
    })
    .end(function (err, res) {
      t.error(err, 'no error');
      t.equals(res.body.url, 'http://httpbin.org/get', 'url is correct');
      t.end();
    });
});

```

## Contributing

Contributions welcome! Please read the [contributing guidelines](CONTRIBUTING.md) first.

## License

[ISC](LICENSE)
