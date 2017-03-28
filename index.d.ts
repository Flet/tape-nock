import tape = require('tape')
import tapeNock = require('./modified_tape')

export = tapeNockFactory

declare function tapeNockFactory (tapeTest: typeof tape, nockOpts?: { fixtures?: string, mode?: string }): typeof tapeNock
declare namespace tapeNockFactory {}
