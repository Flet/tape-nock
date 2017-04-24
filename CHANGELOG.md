# tape-nock change log

All notable changes to this project will be documented in this file.
This project adheres to [Semantic Versioning](http://semver.org/).

## 1.6.0 2017-04-24
* New feature: `defaultTestOptons` - set *before*, *after*, and *afterRecord* functions for all tests when `tapeNock` is defined.
* Added example of using `tape-nock` with `supertest` to the README.
* expose `nock` via `tapeNock.nock`

## 1.5.2 2017-04-01 (latest)
* reduces dev scripts boilerplate

## 1.5.1 2017-04-01
* adds coveralls

# 1.5.0 2017-03-31 Uses default nockOptions with fixtures set to sibiling folder to test script
* we can use it now with ```var test = require('tape-nock')(tape)```

## 1.4.1 2017-03-23
* bump nock version to v9

## 1.4.0 2016-10-24
* `test.only` now works!
* typescript definitions now included
* Thanks @goodmind for the contributions!

## 1.2.2 2016-08-26
* Add typings (thanks @goodmind!)

## 1.2.1 2016-04-22
* Touch ups to README

## 1.2.0 2016-03-22
* expose nock via .nock -- useful for mocking things directly.

## 1.1.0
* add ability to pass nockBack options through tape's options

## 1.0.1
* update README
