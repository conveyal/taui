# Taui

[![NPM version][npm-image]][npm-url]
[![Build status][travis-image]][travis-url]

![Taui screenshot](screenshot.png?raw=true "Taui screenshot")

## Setup

Clone the repository. 

If you want to change the UI language, copy `configurations/messages/messages-XY.yml` to `configurations/default/messages.yml`.

Edit `configurations/default/settings.yml`, changing `s3bucket` to the bucket where TAUI will be deployed (not necessarily the same as the bucket containing analysis results or destination grids). In this same file, set/delete the Cloudfront distribution ID (?).

Edit `configurations/default/store.yml`, changing gridsUrl to the Cloudfront URL for the destination count grids. For sub-buckets within Conveyal's analyst-static bucket, this is `https://dz69bcpxxuhn6.cloudfront.net/sub-bucket/sub-sub-bucket`. In this same file, specify the file names of the destination grid(s) within the S3 bucket by editing the `grids:` section. Specify two URLs for the analysis results by editing the `origins:` section (one for each scenario). Again, use the Cloudfront URL to speed up access. Set the geocoder focus point, country filter, and bounding box. Set the map center coordinates and default origin map marker.

Edit `src/reducers/destinations.js` to change the mapping between labels and S3 object names for the destination grids.

## Build

After cloning the repository, run:
 - `npm install`
 - `npm start`

## Deploy

Once you see that TAUI is working properly with your static site data, deploy it to the S3 bucket specified in settings.yml with the following command (replacing the --config switch to point to default or wherever):

`mastarm deploy --config configurations/marseilles --minify --env production`

The AWS SDK for JS will detect and use the same AWS credentials you should have set up for AWSCLI. The deployment copies JS and CSS files into a sub-bucket called assets, but does not upload `index.html`. You need to edit `index.html` in the root of the TAUI repository to customize the page name, then upload it with `aws s3 cp index.html s3://mamp-static/index.html`.

`mastarm deploy` will not create the bucket or set its contents public. You need to ensure the bucket exists before running `mastarm deploy` and set all its contents public afterward using the S3 web console or CLI. You don’t need to set any permissions on the bucket itself.

If S3 reports “access denied” when you try to fetch a page over HTTP in your browser, this is often because an object you are requesting does not exist.

[npm-image]: https://img.shields.io/npm/v/@conveyal/taui.svg?maxAge=2592000&style=flat-square
[npm-url]: https://www.npmjs.com/package/@conveyal/taui
[travis-image]: https://img.shields.io/travis/conveyal/taui.svg?style=flat-square
[travis-url]: https://travis-ci.org/conveyal/taui
