import nock = require('nock')
import tape = require('tape')

export = tapeNockFactory

declare function tapeNock (name: string, cb: tape.TestCase): void
declare function tapeNock (name: string, opts: tape.TestOptions, cb: tape.TestCase): void
declare function tapeNock (cb: tape.TestCase): void
declare function tapeNock (opts: tape.TestOptions, cb: tape.TestCase): void
declare namespace tapeNock {
  export let nock: typeof nock & {
    cleanAll: typeof nock.cleanAll
    disableNetConnect: typeof nock.disableNetConnect
    enableNetConnect: typeof nock.enableNetConnect
    recorder: nock.Recorder
  }
}

declare function tapeNockFactory (tapeTest: typeof tape, nockOpts: { fixtures: string, mode?: string }): typeof tapeNock
declare namespace tapeNockFactory {}
