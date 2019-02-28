import lonlat from '@conveyal/lonlat'
import Icon from '@conveyal/woonerf/components/icon'
import get from 'lodash/get'
import memoize from 'lodash/memoize'
import dynamic from 'next/dynamic'
import React, {Component} from 'react'

import {colors} from '../constants'
import message from '../message'
import downloadJson from '../utils/download-json'

import Dock from './dock'
import Log from './log'
import RouteAccess from './route-access'
import RouteCard from './route-card'
import RouteSegments from './route-segments'
import TimeCutoff from './time-cutoff'

const Loader = () =>
  <div className='Loader'>
    <Icon type='circle-o-notch' className='fa-spin' />
  </div>

// Certain components depend on config options, so dynamically load them
const ConfigCard = dynamic(() => import('./config-card'))
const GeocodeSearch = dynamic(() => import('./geocode-search'))
const PoiSearch = dynamic(() => import('./poi-search'))

// Cannot import map on the server
const Map = dynamic(() => import('./map'), {
  loading: Loader,
  ssr: false
})

export default class Application extends Component {
  _downloadIsochrone = memoize(index => () => {
    const p = this.props
    const isochrone = p.isochrones[index]
    if (isochrone) {
      const name = p.networks[index].name
      const ll = lonlat.toString(p.start.position)
      downloadJson({
        data: isochrone,
        filename: `${name}-${ll}-${p.timeCutoff}min-isochrone.json`
      })
    } else {
      window.alert('No isochrone has been generated for this network.')
    }
  })

  render () {
    const p = this.props
    return (
      <div className={p.isLoading ? 'isLoading' : ''}>
        <div className='Fullscreen'>
          <div className='Taui-Map'>
            <Map
              {...p.map}
              end={p.end}
              grids={p.grids}
              isochrones={p.isochrones}
              networkGeoJSONRoutes={p.networkGeoJSONRoutes}
              pointsOfInterest={p.pointsOfInterest}
              start={p.start}
              updateEnd={p.updateEnd}
              updateMap={p.updateMap}
              updateStart={p.updateStart}
            />
          </div>
        </div>
        <Dock title={p.title}>
          {p.searchPoiOnly
            ? <PoiSearch
                end={p.end}
                poi={p.pointsOfInterestOptions}
                start={p.start}
                updateEnd={p.updateEnd}
                updateStart={p.updateStart}
              />
            : <GeocodeSearch
                end={p.end}
                geocoer={p.geocode}
                reverseGeocode={p.reverseGeocode}
                start={p.start}
                updateEnd={p.updateEnd}
                updateStart={p.updateStart}
              />}
          <TimeCutoff
            cutoff={p.timeCutoff}
            setCutoff={p.setTimeCutoff}
          />
          {p.networks.map((network, index) =>
            <div
              onMouseEnter={() => p.setActiveNetwork(network.name)}
              onMouseLeave={() => p.setActiveNetwork(null)}
              key={`${index}-route-card`}
            >
              <RouteCard
                cardColor={network.hexColor || colors[index].hex}
                downloadIsochrone={p.isochrones[index] && this._downloadIsochrone(index)}
                index={index}
                title={network.name}
              >
                {p.isLoading
                  ? <tbody><tr><td><Loader /></td></tr></tbody>
                  : <React.Fragment>
                    <RouteAccess
                      accessibility={p.accessibility[index]}
                      grids={p.grids}
                      hasStart={!!p.start}
                      oldAccessibility={p.accessibility[p.accessibility.length - 1]}
                      showComparison={p.showComparison}
                    />
                    {!!p.end && !!p.start &&
                      <RouteSegments
                        active={network.name === p.activeNetwork}
                        oldTravelTime={p.travelTimes[p.accessibility.length - 1]}
                        routeSegments={p.networkRoutes[index]}
                        travelTime={p.travelTimes[index]}
                      />}
                  </React.Fragment>}
              </RouteCard>
            </div>
          )}

          {p.showLog && p.actionLog && <Log items={p.actionLog} />}
          {p.allowChangeConfig && <ConfigCard cookieConfig={p.cookieConfig} />}
          {p.showLink && <Attribution />}
        </Dock>
      </div>
    )
  }
}

function Attribution () {
  return <div className='Attribution'>
    site made by
    {' '}
    <a href='https://www.conveyal.com' target='_blank'>
      conveyal
    </a>
  </div>
}

