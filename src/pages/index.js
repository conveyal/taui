import get from 'lodash/get'
import nextCookies from 'next-cookies'
import React from 'react'
import {connect} from 'react-redux'

import actions from '../actions'
import Application from '../components/application'
import message from '../message'
import * as select from '../selectors'
import configureTaui from '../services/config'

import '../style.css'

// Set the title
if (typeof document !== 'undefined') document.title = message('Title')

function mapStateToProps (state, ownProps) {
  return {
    ...state,
    accessibility: select.accessibility(state, ownProps),
    activeNetworkIndex: select.activeNetworkIndex(state, ownProps),
    // activeTransitive: select.activeTransitive(state, ownProps),
    allTransitiveData: select.allTransitiveData(state, ownProps),
    drawOpportunityDatasets: select.drawOpportunityDatasets(state, ownProps),
    drawRoutes: select.drawRoutes(state, ownProps),
    // drawIsochrones: select.drawIsochrones(state, ownProps),
    isochrones: select.isochrones(state, ownProps),
    isLoading: select.loading(state, ownProps),
    pointsOfInterest: get(state, 'data.pointsOfInterest'),
    pointsOfInterestOptions: select.pointsOfInterestOptions(state, ownProps),
    showComparison: select.showComparison(state, ownProps),
    travelTimes: select.travelTimes(state, ownProps),
    uniqueRoutes: select.uniqueRoutes(state, ownProps)
  }
}

/**
 * TODO Get this to work to preload data.
 */
Application.getInitialProps = async function getInitialProps (ctx) {
  let {tauiConfig} = nextCookies(ctx)
  if (typeof tauiConfig === 'string') tauiConfig = JSON.parse(tauiConfig)

  /*
  const initialState = ctx.reduxStore.getState()
  console.log('loading taui data...')

  const data = await configureTaui(ctx.query, tauiConfig, initialState)
  console.log('data loaded, setting data to state...')

  const dispatch = ctx.reduxStore.dispatch.bind(ctx.reduxStore)
  if (data.start) dispatch(actions.setStart(data.start))
  if (data.end) dispatch(actions.setEnd(data.end))
  if (data.networks) data.networks.forEach(n => dispatch(actions.setNetwork(n)))
  if (data.grids) data.grids.forEach(g => dispatch(actions.setGrid(g)))
  if (data.poi) dispatch(actions.setPointsOfInterest(data.poi))
  if (data.map) dispatch(actions.updateMap(data.map))
  if (data.geocoder) dispatch(actions.setGeocoder(data.geocoder))
  */
  // TODO Fetch initial start also

  console.log('done loading!')
  return {
    query: ctx.query,
    tauiConfig
  }
}

Application.prototype.componentDidMount = async function componentDidMount () {
  const p = this.props
  const data = await configureTaui(p.query, p.tauiConfig, p)

  if (data.start) p.updateStart(data.start)
  if (data.end) p.setEnd(data.end)
  if (data.networks) data.networks.forEach(n => p.setNetwork(n))
  if (data.grids) data.grids.forEach(g => p.setGrid(g))
  if (data.poi) p.setPointsOfInterest(data.poi)
  if (data.map) p.updateMap(data.map)
  if (data.geocoder) p.setGeocoder(data.geocoder)
}

export default connect(mapStateToProps, actions)(Application)
