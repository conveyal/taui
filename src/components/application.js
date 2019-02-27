// @flow
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
import Form from './form'
import Log from './log'
import RouteAccess from './route-access'
import RouteCard from './route-card'
import RouteSegments from './route-segments'

const Loader = () =>
  <div className='Loader'>
    <Icon type='circle-o-notch' className='fa-spin' />
  </div>

// Config Card not always needed
const ConfigCard = dynamic(() => import('./config-card'))

// Cannot import map on the server
const Map = dynamic(() => import('./map'), {
  loading: Loader,
  ssr: false
})

export default class Application extends Component {
  state = {
    componentError: null
  }

  /**
   * Top level component error catch
   */
  componentDidCatch (error, info) {
    this.setState({
      componentError: {
        error, info
      }
    })
  }

  _setStartWithFeature = (feature) => {
    this.props.updateStart({
      label: feature.place_name,
      position: lonlat(feature.geometry.coordinates)
    })
  }

  _setEndWithFeature = (feature) => {
    if (!feature) {
      this.props.setEnd(null)
    } else {
      this.props.updateEnd({
        label: feature.place_name,
        position: lonlat(feature.geometry.coordinates)
      })
    }
  }

  _onTimeCutoffChange = (event) => {
    this.props.setTimeCutoff(parseInt(event.currentTarget.value, 10))
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

  /**
   *
   */
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
        <Dock
          componentError={this.state.componentError}
          title={p.title}
        >
          <Form
            end={p.end}
            geocode={p.geocode}
            onTimeCutoffChange={this._onTimeCutoffChange}
            onChangeEnd={this._setEndWithFeature}
            onChangeStart={this._setStartWithFeature}
            pointsOfInterest={p.pointsOfInterestOptions}
            reverseGeocode={p.reverseGeocode}
            searchPoiOnly={p.searchPoiOnly}
            selectedTimeCutoff={p.timeCutoff}
            start={p.start}
            updateEnd={p.updateEnd}
            updateStart={p.updateStart}
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

