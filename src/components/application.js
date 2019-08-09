import lonlat from '@conveyal/lonlat'
import memoize from 'lodash/memoize'
import Cookies from 'js-cookie'
import dynamic from 'next/dynamic'
import React, {Component} from 'react'

import {colors} from '../constants'
import message from '../message'
import {geocode, reverseGeocode} from '../services/geocode'
import downloadJson from '../utils/download-json'

import Dock from './dock'
import Icon from './icon'
import RouteAccess from './route-access'
import RouteCard from './route-card'
import RouteSegments from './route-segments'
import TimeCutoff from './time-cutoff'

const Loader = () => (
  <div className='Loader'>
    <Icon icon='compass' spin />
  </div>
)

// Certain components depend on config options, so dynamically load them
const ConfigCard = dynamic(() => import('./config-card'))
const Log = dynamic(() => import('./log'))
const GeocodeSearch = dynamic(() => import('./geocode-search'), {ssr: false})
const Info = dynamic(() => import('./info'))
const PoiSearch = dynamic(() => import('./poi-search'))

// Cannot import map on the server
const Map = dynamic(() => import('./map'), {
  loading: Loader,
  ssr: false
})

// Default access token
const MBAT = process.env.MAPBOX_ACCESS_TOKEN

export default class Application extends Component {
  state = {
    showInfo: this.props.info && !this.props.user // first visit to the site
  }

  _geocode = text => {
    const p = this.props
    return geocode(text, p.map.accessToken || MBAT, p.geocoder)
  }

  _reverseGeocode = position => {
    const p = this.props
    return reverseGeocode(position, p.map.accessToken || MBAT, p.geocoder)
  }

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

  _showInfo = () => this.setState({showInfo: true})
  _hideInfo = () => {
    // Create a user object if one does not exist
    Cookies.set('user', {...this.props.user})
    this.setState({showInfo: false})
  }

  _setPercentileIndex(newIndex) {
    const p = this.props
    p.setPercentileIndex(newIndex)
    p.fetchAllTimesAndPathsForCoordinate(p.start.position)
  }

  render() {
    const p = this.props
    const s = this.state
    return (
      <div className={p.isLoading ? 'isLoading' : ''}>
        {s.showInfo && <Info {...p.info} onRequestClose={this._hideInfo} />}
        <div className='Fullscreen'>
          <div className='Taui-Map'>
            <Map
              {...p.map}
              activeNetwork={p.activeNetwork}
              end={p.end}
              grids={p.grids}
              isochrones={p.isochrones}
              networkGeoJSONRoutes={p.networkGeoJSONRoutes}
              onMapClick={p.onMapClick}
              pointsOfInterest={p.pointsOfInterest}
              setMapClickAction={p.setMapClickAction}
              start={p.start}
              updateEnd={p.updateEnd}
              updateMap={p.updateMap}
              updateStart={p.updateStart}
            />
          </div>
        </div>
        <Dock>
          <div className='TauiTitle'>
            <Icon icon='map' />
            <span>{p.title || message('Title')}</span>
            {p.info && (
              <span
                style={{
                  cursor: 'pointer',
                  float: 'right'
                }}
              >
                <Icon icon='info-circle' onClick={this._showInfo} />
              </span>
            )}
          </div>
          {p.searchPoiOnly ? (
            <PoiSearch
              end={p.end}
              poi={p.pointsOfInterestOptions}
              start={p.start}
              updateEnd={p.updateEnd}
              updateStart={p.updateStart}
            />
          ) : (
            <GeocodeSearch
              end={p.end}
              geocode={this._geocode}
              reverseGeocode={this._reverseGeocode}
              start={p.start}
              updateEnd={p.updateEnd}
              updateStart={p.updateStart}
            />
          )}
          <div className='heading'>Travel time</div>
          <div style={{display: 'flex', boxShadow: '0 0 1px #333'}}>
            <button
              onClick={() => this._setPercentileIndex(0)}
              className={p.percentileIndex === 0 && 'active'}
            >
              {p.percentileLabels[0]}
            </button>
            <button
              onClick={() => this._setPercentileIndex(1)}
              className={p.percentileIndex === 1 && 'active'}
            >
              {p.percentileLabels[1]}
            </button>
            <button
              onClick={() => this._setPercentileIndex(2)}
              className={p.percentileIndex === 2 && 'active'}
            >
              {p.percentileLabels[2]}
            </button>
            <style jsx>{`
              button {
                background-color: transparent;
                border-color: #fff;
                cursor: pointer;
                color: #fff;
                flex-grow: 1;
                padding-top: 0.5rem;
                padding-bottom: 0.5rem;
              }

              button:focus {
                outline: none;
              }

              button.active,
              button:hover {
                background-color: #fff;
                color: #103f5c;
              }

              button:first-of-type {
                border-top-left-radius: 4px;
                border-bottom-left-radius: 4px;
                border-right: none;
              }

              button:last-of-type {
                border-top-right-radius: 4px;
                border-bottom-right-radius: 4px;
                border-left: none;
              }
            `}</style>
          </div>
          <TimeCutoff cutoff={p.timeCutoff} setCutoff={p.setTimeCutoff} />
          {p.networks.map((network, index) => (
            <div
              onMouseLeave={() => p.setActiveNetwork()}
              key={`${index}-route-card`}
            >
              <RouteCard
                cardColor={network.hexColor || colors[index].hex}
                downloadIsochrone={
                  p.isochrones[index] && this._downloadIsochrone(index)
                }
                index={index}
                title={network.name}
              >
                {p.isLoading ? (
                  <tbody>
                    <tr>
                      <td>
                        <Loader />
                      </td>
                    </tr>
                  </tbody>
                ) : (
                  <>
                    <RouteAccess
                      accessibility={p.accessibility[index]}
                      grids={p.grids}
                      hasStart={!!p.start}
                      oldAccessibility={
                        p.accessibility[p.accessibility.length - 1]
                      }
                      showComparison={p.showComparison}
                    />
                    {!!p.end && !!p.start && (
                      <RouteSegments
                        activeNetwork={p.activeNetwork}
                        networkIndex={index}
                        routeSegments={p.networkRoutes[index]}
                        setActive={p.setActiveNetwork}
                        travelTime={p.travelTimes[index]}
                      />
                    )}
                  </>
                )}
              </RouteCard>
            </div>
          ))}

          {p.showLog && p.actionLog && <Log items={p.actionLog} />}
          {p.allowChangeConfig && <ConfigCard cookieConfig={p.cookieConfig} />}
          {p.showLink && <Attribution />}
        </Dock>
      </div>
    )
  }
}

function Attribution() {
  return (
    <div className='Attribution'>
      site made by{' '}
      <a
        href='https://www.conveyal.com'
        target='_blank'
        rel='noopener noreferrer'
      >
        conveyal
      </a>
    </div>
  )
}
