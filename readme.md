# hafas-gtfs-rt-server-example

**Expose a [HAFAS endpoint](https://github.com/public-transport/hafas-client/blob/43bd9cf65bc181f97ba4eefb75e26080a654a041/readme.md#background) as a [GTFS Realtime (GTFS-RT)](https://gtfs.org/reference/realtime/v2/) server.**

![ISC-licensed](https://img.shields.io/github/license/derhuerst/hafas-gtfs-rt-server-example.svg)
[![chat with me on Gitter](https://img.shields.io/badge/chat%20with%20me-on%20gitter-512e92.svg)](https://gitter.im/derhuerst)
[![support me via GitHub Sponsors](https://img.shields.io/badge/support%20me-donate-fa7664.svg)](https://github.com/sponsors/derhuerst)

This is an example project that demonstrates how to

1. use [`hafas-client`](https://github.com/public-transport/hafas-client) & [`hafas-monitor-trips`](https://github.com/derhuerst/hafas-monitor-trips) to fetch live data about all vehicles in a bounding box,
2. use [`hafas-gtfs-rt-feed`](https://github.com/derhuerst/hafas-gtfs-rt-feed) & [`gtfs-rt-differential-to-full-dataset`](https://github.com/derhuerst/gtfs-rt-differential-to-full-dataset) to build a live [GTFS Realtime (GTFS-RT)](https://developers.google.com/transit/gtfs-realtime/) feed from the data,
3. use [`serve-buffer`](https://github.com/derhuerst/serve-buffer) to serve the feed efficiently.


## Installing & running

`hafas-gtfs-rt-server-example` expects a [Redis](https://redis.io/) server running on `127.0.0.1:6379` (default port), but you can set the `REDIS_URL` environment variable to change this.

Specify the bounding box to be observed as JSON:

```shell
BBOX='{"north": 52.52, "west": 13.36, "south": 52.5, "east": 13.39}'
```

### via Docker

A Docker image [is available as `derhuerst/hafas-gtfs-rt-server-example`](https://hub.docker.com/r/derhuerst/hafas-gtfs-rt-server-example).

```shell
docker run -d -p 3000:3000 -e BBOX='…' derhuerst/hafas-gtfs-rt-server-example
```

*Note:* The Docker image does not contain the Redis server.

### manually

```shell
git clone https://github.com/derhuerst/hafas-gtfs-rt-server-example.git
cd hafas-gtfs-rt-server-example
npm install --production

env BBOX='…' node index.js
```
