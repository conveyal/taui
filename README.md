# Taui

[![NPM version][npm-image]][npm-url]
[![Build status][travis-image]][travis-url]

![Taui screenshot](screenshot.png?raw=true "Taui screenshot")

## Running

Clone the repository and with [yarn](https://yarnpkg.com/en/) and [node v10](https://nodejs.org/en/) installed run `yarn run dev`. Taui is built and run with [next.js](https://nextjs.org) and [now](https://now.js).

## Configuration

Copy the `empty-store.json` file to `store.json`. This file populates the data used for running a Taui.

**Key fields:**

* `allowChangeConfig` -- Set to `false` when deploying a site for a user.
* `map.accessToken` -- A [Mapbox](https://mapbox.com) access token is required for Mapbox GL maps and Mapbox Geocoding to work.
* `grids` -- Point sets or opportunities can be set here.
* `networks` -- A url to an S3 bucket containing the results of regional analysis generated from R5.
* `poiUrl` -- URL to a GeoJSON file that contains a `FeatureCollection` of `Points` to be shown on the map. Add a `label` to the `properties` field of each point.

## Deployment

[![Deploy to now](https://deploy.now.sh/static/button.svg)](https://deploy.now.sh/?repo=https://github.com/conveyal/taui)

[npm-image]: https://img.shields.io/npm/v/@conveyal/taui.svg?maxAge=2592000&style=flat-square
[npm-url]: https://www.npmjs.com/package/@conveyal/taui
[travis-image]: https://img.shields.io/travis/conveyal/taui.svg?style=flat-square
[travis-url]: https://travis-ci.org/conveyal/taui
