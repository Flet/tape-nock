# tape-nock

[![npm][npm-image]][npm-url]
[![travis][travis-image]][travis-url]
[![standard][standard-image]][standard-url]

[npm-image]: https://img.shields.io/npm/v/tape-nock.svg?style=flat-square
[npm-url]: https://www.npmjs.com/package/tape-nock
[travis-image]: https://img.shields.io/travis/Flet/tape-nock.svg?style=flat-square
[travis-url]: https://travis-ci.org/Flet/tape-nock
[standard-image]: https://img.shields.io/badge/code%20style-standard-brightgreen.svg?style=flat-square
[standard-url]: http://npm.im/standard

Automatically record and playback HTTP calls for each tape test.

## Install

```
npm install tape-nock
```

## Usage

```js
var path = require('path')
var tapeNock = require('tape-nock', {
  fixtures: path.join(__dirname, 'fixtures'),
  mode: 'dryrun' // this is the default mode
})
```

Use the `NOCK_BACK_MODE` environment variable ([details](https://github.com/pgte/nock#modes)) to control the mode of nockBack.

Here is a recap
- **wild:** all requests go out to the internet, don't replay anything, doesn't record anything
- **dryrun:** The default, use recorded nocks, allow http calls, doesn't record anything, useful for writing new tests
- **record:** use recorded nocks, record new nocks
- **lockdown:** use recorded nocks, disables all http calls even when not nocked, doesn't record


## Contributing

Contributions welcome! Please read the [contributing guidelines](CONTRIBUTING.md) first.

## License

[ISC](LICENSE)
