// @flow
import lonlat from '@conveyal/lonlat'
import Icon from '@conveyal/woonerf/components/icon'
import get from 'lodash/get'
import memoize from 'lodash/memoize'
import dynamic from 'next/dynamic'
import Cookies from 'js-cookie'
import React, {Component} from 'react'

import {colors} from '../constants'
import message from '../message'
import downloadJson from '../utils/download-json'

import Form from './form'
import Log from './log'
import RouteAccess from './route-access'
import RouteCard from './route-card'
import RouteSegments from './route-segments'

// Example config
const exampleConfigLink = 'https://github.com/conveyal/taui/blob/aa9e6285002d59b4b6ae38890229569311cc4b6d/config.json.tmp'

// Cannot import map on the server
const Map = dynamic(() => import('./map'), {ssr: false})

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

  _saveRefToConfig = (ref) => {
    this._refToConfig = ref
  }

  _updateConfig = () => {
    try {
      const json = JSON.parse(this._refToConfig.value)
      Cookies.set('tauiConfig', json)
      window.location.reload(true)
    } catch (e) {
      console.error(e)
      window.alert('Invalid JSON!')
    }
  }

  _clearStartAndEnd = () => {
    const {setEnd, setStart} = this.props
    setStart(null)
    setEnd(null)
  }

  _setStartWithEvent = (event) => {
    this.props.updateStartPosition(lonlat(event.latlng || event.target._latlng))
  }

  _setStartWithFeature = (feature) => {
    if (!feature) {
      this._clearStartAndEnd()
    } else {
      this.props.updateStart({
        label: feature.place_name,
        position: lonlat(feature.geometry.coordinates)
      })
    }
  }

  _setEndWithEvent = (event) => {
    this.props.updateEndPosition(lonlat(event.latlng || event.target._latlng))
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

  _setShowOnMap = memoize(index => () => {
    const p = this.props
    const network = p.networks[index]
    const showOnMap = !network.showOnMap
    p.setNetwork({
      ...network,
      showOnMap
    })
    if (showOnMap) p.setActiveNetwork(network.name)
  })

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
          <svg width='0' height='0' style={{position: 'absolute'}}>
            <defs>
              <filter id='shadow'>
                <feDropShadow dx='1' dy='1' stdDeviation='1' />
              </filter>
            </defs>
          </svg>
          <div className='Taui-Map'>
            <Map
              {...p.map}
              end={p.end}
              grids={p.grids}
              isochroneOutline={p.isochroneOutline}
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
          showSpinner={p.fetches > 0}
          componentError={this.state.componentError}
        >
          <Form
            end={p.end}
            geocode={p.geocode}
            onTimeCutoffChange={this._onTimeCutoffChange}
            onChangeEnd={this._setEndWithFeature}
            onChangeStart={this._setStartWithFeature}
            pointsOfInterest={p.pointsOfInterestOptions}
            reverseGeocode={p.reverseGeocode}
            selectedTimeCutoff={p.timeCutoff}
            start={p.start}
            updateEnd={p.updateEnd}
            updateStart={p.updateStart}
          />
          {p.networks.map((network, index) => (
            <RouteCard
              active={p.activeNetworkIndex === index}
              cardColor={colors[index]}
              downloadIsochrone={p.isochrones[index] && this._downloadIsochrone(index)}
              index={index}
              key={`${index}-route-card`}
              onMouseOver={() => p.setActiveNetwork(network.name)}
              setShowOnMap={this._setShowOnMap(index)}
              showOnMap={network.showOnMap}
              title={network.name}
            >
              {!p.isLoading &&
                <RouteAccess
                  accessibility={p.accessibility[index]}
                  grids={p.grids}
                  hasStart={!!p.start}
                  oldAccessibility={p.accessibility[p.accessibility.length - 1]}
                  showComparison={p.showComparison}
                />}
              {!p.isLoading && !!p.end && !!p.start &&
                <RouteSegments
                  oldTravelTime={p.travelTimes[p.accessibility.length - 1]}
                  routeSegments={p.networkRoutes[index]}
                  travelTime={p.travelTimes[index]}
                />}
            </RouteCard>
          ))}
          {p.showLog && p.actionLog &&
            <div className='Card'>
              <div className='CardTitle'>
                <span className='fa fa-terminal' /> {message('Log.Title')}
              </div>
              <Log items={p.actionLog} />
            </div>}
          {p.allowChangeConfig &&
            <div className='Card'>
              <div
                className='CardTitle'
              >
                <span className='fa fa-cog' /> Configure
                <div className='CardLinks'>
                  <a
                    onClick={this._updateConfig}
                    title='Update config and reload the page'
                  >save config</a>
                </div>
              </div>
              <div className='CardContent'>
                <br />
                <a href={exampleConfigLink} target='_blank'>See example config</a>
              </div>
              <textarea
                ref={this._saveRefToConfig}
                defaultValue={JSON.stringify(p.cookieConfig || {}, null, '  ')}
              />
            </div>}
          {p.showLink &&
            <div className='Attribution'>
              site made by
              {' '}
              <a href='https://www.conveyal.com' target='_blank'>
                conveyal
              </a>
            </div>}
        </Dock>
      </div>
    )
  }
}

function Dock (props) {
  return <div className='Taui-Dock'>
    <div className='Taui-Dock-content'>
      <div className='title'>
        {props.showSpinner
          ? <Icon type='spinner' className='fa-spin' />
          : <Icon type='map' />}
        {' '}
        {props.title || message('Title')}
      </div>
      {props.componentError &&
        <div>
          <h1>Error</h1>
          <p>{props.componentError.info}</p>
        </div>}
      {props.children}
    </div>
  </div>
}
