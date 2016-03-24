'use strict'
var fs = require('fs')
var request = require('request')
var TrackerStream = require('are-we-there-yet').TrackerStream
var Gauge = require('gauge')

module.exports = grab

function grab (toGet, output) {
  var tracker = new TrackerStream(output)
  var progressbar = new Gauge(process.stderr, {
    template: [
      {type: 'progressbar', length: 20},
      {type: 'activityIndicator', kerning: 1, length: 1},
      {value: output, kerning: 1},
      {type: 'percent', length: 3, kerning: 1, default: ''},
      {type: 'eta', kerning: 1, default: ''},
      {type: 'bps', kerning: 1, default: ''}
    ]
  })
  var totalBytes = 0
  var start = Date.now()
  tracker.on('change', function (name, completed) {
    var elapsed = Date.now() - start
    var bytes = Math.floor(totalBytes * completed)
    var eta = new Date(Date.now() + elapsed / completed)
    progressbar.show({
      completed,
      percent: Math.floor(completed*100) + '%',
      eta: eta.toString(),
      bps: Math.floor((bytes / (elapsed/1000)) / 1024) + 'kBps'
    })
    progressbar.pulse()
  })
  return request(toGet, {highWaterMark: 163840})
    .on('response', function (response) {
      tracker.addWork(totalBytes = response.headers['content-length'])
    })
    .pipe(tracker)
    .pipe(fs.createWriteStream(output, {highWaterMark: 16384}))
}
