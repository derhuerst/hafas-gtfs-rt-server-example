'use strict'

const createGtfsRtWriter = require('hafas-gtfs-rt-feed/writer')
const createThrottledHafas = require('vbb-hafas/throttle')
const createMonitor = require('hafas-monitor-trips')
const differentialToFullDataset = require('gtfs-rt-differential-to-full-dataset')
const {createServer} = require('http')
const computeEtag = require('etag')
const serveBuffer = require('serve-buffer')

const bbox = JSON.parse(process.argv.slice[3] || process.env.BBOX || 'null')

const onError = (err) => {
	console.error(err)
	process.exit(1)
}

const hafas = createThrottledHafas('hafas-gtfs-rt-server-example', {
	throttlingLimit: 25,
	throttlingInterval: 1000,
})
const monitor = createMonitor(hafas, bbox, {
	fetchTripsInterval: 60_000, // 60s
})
monitor.on('error', onError)
monitor.on('hafas-error', console.error)

const {
	out: writer,
	writeTrip, writePosition,
} = createGtfsRtWriter({
	encodePbf: false, // todo
})
monitor.on('position', (loc, movement) => writePosition(loc, movement))
monitor.on('trip', trip => writeTrip(trip))

const toFull = differentialToFullDataset({
	ttl: 5 * 60 * 1000, // 5m
})
writer.pipe(toFull)
let dump = Buffer.alloc(0)
let timeModified = new Date()
let etag = computeEtag(dump)
toFull.on('change', () => {
	dump = toFull.asFeedMessage()
	timeModified = new Date()
	etag = computeEtag(dump)
})

let stats = null
monitor.on('stats', (newStats) => {
	stats = newStats
})

const server = createServer((req, res) => {
	const path = new URL(req.url, 'http://localhost').pathname
	if (path === '/') {
		serveBuffer(req, res, dump, {timeModified, etag})
	} else if (path === '/stats') {
		res.setHeader('content-type', 'application/json')
		res.end(JSON.stringify(stats))
	} else {
		res.statusCode = 404
		res.end('nope')
	}
})
server.listen(3000, (err) => {
	if (!err) return;
	console.error(err)
	process.exit(1)
})
