'use strict'

const createGtfsRtWriter = require('hafas-gtfs-rt-feed/writer')
const createHafas = require('vbb-hafas')
const createMonitorWorker = require('hafas-monitor-trips/worker')
const createMonitor = require('hafas-monitor-trips/orchestrator')
const differentialToFullDataset = require('gtfs-rt-differential-to-full-dataset')
const {createServer} = require('http')
const serveBuffer = require('serve-buffer')

const bbox = JSON.parse(process.argv.slice[3] || process.env.BBOX || 'null')

const onError = (err) => {
	console.error(err)
	process.exit(1)
}

const {
	out: writer,
	writeTrip, writePosition,
} = createGtfsRtWriter({
	encodePbf: false, // todo
})

const hafas = createHafas('hafas-gtfs-rt-server-example')
const worker = createMonitorWorker(hafas, bbox, (type, data, moreData) => {
	// todo: make this customisable
	if (type === 'trip') writeTrip(data)
	else if (type === 'position') {
		writePosition(data, moreData)
	}
})
worker.on('error', onError)

const monitor = createMonitor(bbox, {
	interval: 10_000, // 10s
})
monitor.on('error', onError)
monitor.start()

const toFull = differentialToFullDataset({
	ttl: 5 * 60 * 1000, // 5m
})
writer.pipe(toFull)

const server = createServer((req, res) => {
	serveBuffer(req, res, toFull.asFeedMessage(), {
		// todo: timeModified, etaf
	})
})
server.listen(3000, (err) => {
	if (!err) return;
	console.error(err)
	process.exit(1)
})
