# Taui

[![NPM version][npm-image]][npm-url]
[![Build status][travis-image]][travis-url]

![Taui screenshot](screenshot.png?raw=true "Taui screenshot")

## Setup

Clone the repository. 
If you want to change the UI language, copy `configurations/messages/messages-XY.yml` to `configurations/default/messages.yml`.
Edit `configurations/default/settings.yml`, changing `s3bucket` to the bucket where TAUI will be deployed (not the bucket containing analysis results or destination grids).
In this same file, set/delete the Cloudfront distribution ID (?).
Edit `configurations/default/store.yml`, changing gridsUrl to the Cloudfront URL for the destination count grids. For sub-buckets within Conveyal's analyst-static bucket, this is `https://dz69bcpxxuhn6.cloudfront.net/sub-bucket/sub-sub-bucket`. In this same file, change the label(s) for the destination grid by editing the `grids:` section. Specify the URLs for the analysis results by editing the `origins:` section (two lines, one for each scenario). Again, use the Cloudfront URL to speed up access. Set the geocoder focus point, country filter, and bounding box. Set the map center coordinates and default origin map marker.

Edit `src/reducers/destinations.js` to change the labels and base filename for the destination grids.

## Build

After cloning the repository, run:
 - `npm install`
 - `npm start`


[npm-image]: https://img.shields.io/npm/v/@conveyal/taui.svg?maxAge=2592000&style=flat-square
[npm-url]: https://www.npmjs.com/package/@conveyal/taui
[travis-image]: https://img.shields.io/travis/conveyal/taui.svg?style=flat-square
[travis-url]: https://travis-ci.org/conveyal/taui
