#!/usr/bin/env node
'use strict'
var url = require('url')
var path = require('path')
var grab = require('./index.js')

var argv = require('yargs')
  .usage('$0 [options] <url>')
  .alias('output', 'o')
  .string('output')
  .describe('output', 'The filename to save to')
  .demand(1, 1, 'Must provide one url to download (and only one)')
  .argv

var toGet = argv._[0]
var output = argv.output
if (!output) {
  output = path.basename(url.parse(toGet).path)
  if (!output) output = url.parse(toGet).host
}

grab(toGet, output)
